import { useState, useEffect } from 'react';
import jsonGraph from "./graph.json";

const pointInPolygon = require('point-in-polygon');

const colormap = require('colormap')


// Choose color map from here: https://www.npmjs.com/package/colormap
const colors = colormap({
    colormap: "hot",
    nshades: 100
})

type Coordinate = [number, number];

type MeasurementNode = {
    pos: Coordinate;
    time: Date;
    value: number;
}

type Edge = [string, string];

type Face = string[];

type Graph = {
    neighbors: {[id: string]: string[]}
    edges: Edge[],
    nodes: {[id: string]: MeasurementNode},
    faces: Face[],
}


const ColorMap = ({markers, bounds}:{markers: MeasurementNode[]; bounds: [[number,number],[number, number]]}) => {
    const interpolationResolution = 5; // In meters
    const [colorMarkers, setColorMarkers] = useState<JSX.Element[]>([]);
    const [lines, setLines] = useState<JSX.Element[]>([]);
    const [faces, setFaces] = useState<JSX.Element[]>([]);
    const [graph, setGraph] = useState<Graph>({edges: [], nodes: {}, neighbors: {}, faces: []})
    const [interpolatedPoints, setInterpolatedPoints] = useState<JSX.Element[]>([]);

    const degToRad = (deg: number) => {
        return deg * Math.PI/180;
    }
    
    const distance = (pos1: Coordinate, pos2: Coordinate) => {
        
        // Math formulas from here: https://www.geeksforgeeks.org/program-distance-two-points-earth/
        const rad1 = pos1.map((deg) => degToRad(deg))
        const rad2 = pos2.map((deg) => degToRad(deg))
        const havSinDiff = [rad1[0] - rad2[0], rad1[1] - rad2[1]].map((drad) =>Math.pow(Math.sin(drad/2),2))
        const cosLat = [rad1[0], rad2[0]].map((lat) => Math.cos(lat))
        const a = havSinDiff[0] + cosLat[0] * cosLat[1] * havSinDiff[1];
        let c = 2 * Math.asin(Math.sqrt(a));
        // Radius of earth in meters
        let r = 6371 * 1000;
        // calculate the result
        return c * r;
    }

    const valueInterpolation = (pos: Coordinate, markers: MeasurementNode[], ) => {
        let sum_dist = 0;
        let sum_value = 0;
        for (const marker of markers) {
            const dist = distance(pos, marker.pos)
            if (dist < 0.1) {
                return marker.value;
            }
            const dist_sq_inverse = Math.pow(dist, -2)
            sum_dist += dist_sq_inverse;
            sum_value += marker.value *dist_sq_inverse; 
        }
        return sum_value/sum_dist;
    }
    
    const coordToPercentage = (pos: [number, number], boundary: [[number,number],[number, number]]=bounds) => {
        // TODO: Use the distance function here to make it more correct. Is probably not necessary
        const top = Math.max(boundary[0][0], boundary[1][0]);
        const bottom = Math.min(boundary[0][0], boundary[1][0]);
        const left = Math.max(boundary[0][1], bounds[1][1]);
        const right = Math.min(boundary[0][1], boundary[1][1]);
        

        return [ 100 * (right - pos[1])/(right - left),100 * (top - pos[0])/(top - bottom)];
    }

    const valueToColor = (strength: number, minStrength=0, maxStrength = 1) => {
        const mappedStrength = (strength - minStrength)/(maxStrength - minStrength);
        const index = Math.floor(colors.length  * mappedStrength)
        if (index<=0){
            return colors[0];
        }
        if (index >= colors.length) {
            return colors[colors.length -1];
        }
        return colors[index]
    }

    const neighborMapFromEdges = (edges: Edge[], nodes: {[id: string]: MeasurementNode}) => {
        const neighbors: {[id: string]: string[]} = Object.fromEntries(Object.entries(nodes).map((entry) => [entry[0], []]))
        edges.forEach((edge: Edge) => {
            neighbors[edge[0]].push(edge[1])
            neighbors[edge[1]].push(edge[0])
        })
        return neighbors
    }

    const pointsOnLine = (pos1: Coordinate, pos2: Coordinate, resolution: number=interpolationResolution) => {
        const points: Coordinate[] = [];
        const dist = distance(pos1, pos2);
        const numPoints = Math.floor(dist/ resolution) + 2;
        const latDiff = (pos2[0] - pos1[0])/(numPoints - 1);
        const longDiff = (pos2[1] - pos1[1])/(numPoints - 1);
        for (let i=0; i<numPoints; i++) {
            points.push([pos1[0] + i*latDiff, pos1[1] + i*longDiff])
        }
        return points;      
    }
    const pointsOnPolygon = (nodes: Coordinate[], resolution: number=interpolationResolution) => {
        let maxLat = -360;
        let minLat = 360;
        let maxLong = -360;
        let minLong = 360;
        for (let i=0; i<nodes.length; i++) {
            const pos = nodes[i];
            if (maxLat<pos[0]){
                maxLat = pos[0];
            }
            if (maxLong<pos[1]){
                maxLong = pos[1];
            }
            if (minLat>pos[0]) {
                minLat = pos[0];
            }
            if (minLong > pos[1]) {
                minLong = pos[1];
            }
        }

        const distLat = distance([minLat, maxLong], [maxLat, maxLong]);
        const distLong = distance([maxLat, minLong], [maxLat, maxLong]);
        
        const numLat = Math.floor(distLat/ resolution) + 2;
        const numLong = Math.floor(distLong/ resolution) + 2;

        const stepLat = (maxLat - minLat)/(numLat - 1);
        const stepLong = (maxLong - minLong)/(numLong - 1);

        const points: Coordinate[] = [];

        for (let i=0; i <numLat; i++) {
            for (let j=0; j<numLong; j++) {
                const point: Coordinate = [minLat + i*stepLat, minLong + j*stepLong]
                if (pointInPolygon(point, nodes)) {
                    points.push(point);
                }
                
            }
        }
        return points;
    }

    useEffect(() => {
        const jsonNodes = jsonGraph.nodes as unknown as {[id: string]: MeasurementNode}
        const jsonEdges = jsonGraph.edges as unknown as [string, string][];
        const jsonFaces = jsonGraph.faces as unknown as Face[];
        setGraph({
            nodes: jsonNodes, 
            edges: jsonEdges,
            neighbors: neighborMapFromEdges(jsonEdges, jsonNodes),
            faces: jsonFaces,
        })        
    },[])

    useEffect(() => {
        if (graph.nodes){
            const svgCircles = Object.entries(graph.nodes).map((entry, index) => {
                const marker = entry[1];
                const coord = coordToPercentage(marker.pos, bounds);
                return (
                <><circle key={index} r={"0.3%"} cx={coord[0] +"%"} cy={coord[1] +"%"} fill={"none"} stroke={"black"} strokeWidth={"0.1%"} opacity={1}/> 
                    <text x={coord[0] +"%"} y={coord[1] +"%"} fontSize={"5%"}>{entry[0]}</text>
                </>)
            });
            setColorMarkers(svgCircles)
        }
    },[graph])

    useEffect(() => {
        let interPoints: JSX.Element[] = [];
        if (graph.edges) {
            let key =0;
            graph.edges.forEach((edge, i) => {
                const node1 = graph.nodes[edge[0]];
                const node2 = graph.nodes[edge[1]];
                const linePoints = pointsOnLine(node1.pos, node2.pos);
               linePoints.forEach((pos, index) => {
                    const value = valueInterpolation(pos, [node1, node2]);
                    const coord  = coordToPercentage(pos)
                    const color = valueToColor(value);
                    interPoints.push(<circle key={"interpolated_" + key} r={"0.2%"} cx={coord[0] +"%"} cy={coord[1] +"%"} fill={color} opacity={0.2 + +0.6*value}/>); 
                    key+=1;
                })
               
            })
        }
        if (graph.faces) {
            let key=0;
            graph.faces.forEach((face) => {
                let nodes = face.map((id) => graph.nodes[id]);
                const points = pointsOnPolygon(nodes.map((node) => node.pos))
                points.forEach((pos, i) => {
                    const value = valueInterpolation(pos, nodes);
                    const coord  = coordToPercentage(pos)
                    const color = valueToColor(value);
                    interPoints.push(<circle key={"interpolated_poly_" + key} r={"0.3%"} cx={coord[0] +"%"} cy={coord[1] +"%"} fill={color} opacity={0.2 + +0.6*value}/>); 
                    key+=1;
                })
            })
        }
        setInterpolatedPoints(interPoints)
    },[graph])

    return (
        <>
         <svg width={"100%"} height={"100%"} viewBox={"0 0 100 100"}>
            {interpolatedPoints}
            {
            //lines
            }
            {colorMarkers}
        </svg>
        </>
        )
        }
export default ColorMap;
