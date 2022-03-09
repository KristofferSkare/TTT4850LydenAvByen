import { useState, useEffect } from 'react';
import jsonGraph from "./graph.json";
//import gpxParser from './gpxParser';

//const data = require("./data_einar.txt");

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
    const interpolationResolutionEdge = 10; // In meters
    const interpolationResolutionFace = 3;
    const rectWidth = 0.5;
    const overlapp = 0.005;

   

    const [colorMarkers, setColorMarkers] = useState<JSX.Element[]>([]);
    const [lines, setLines] = useState<JSX.Element[]>([]);
    const [faces, setFaces] = useState<JSX.Element[]>([]);
    const [graph, setGraph] = useState<Graph>({edges: [], nodes: {}, neighbors: {}, faces: []})
    const [defs, setDefs] = useState<JSX.Element[]>([]);
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

    const pointsOnLine = (pos1: Coordinate, pos2: Coordinate, resolution: number=interpolationResolutionEdge) => {
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
    const pointsOnPolygon = (nodes: Coordinate[], resolution: number=interpolationResolutionFace) => {
        let offset = 0;
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
        minLat += offset
        minLong += offset
        maxLat -= offset
        maxLong -= offset

        const distLat = distance([minLat, maxLong], [maxLat, maxLong]);
        const distLong = distance([maxLat, minLong], [maxLat, maxLong]);
        
        const numLat = Math.floor(distLat/ resolution) + 2;
        const numLong = Math.floor(distLong/ resolution) + 2;

        const stepLat = (maxLat - minLat)/(numLat - 1);
        const stepLong = (maxLong - minLong)/(numLong - 1);

        const matrix: (Coordinate | undefined)[][] = [];
        const triangles: Coordinate[][] = [];
        for (let i=0; i <numLat; i++) {
            let ar:  Array<Coordinate|undefined> = [];
            for (let j=0; j<numLong; j++) {
                const point: Coordinate = [minLat + i*stepLat, minLong + j*stepLong]
                if (pointInPolygon(point, nodes)) {
                    ar.push(point)
                } else {
                    ar.push(undefined)
                }
            }
            matrix.push(ar)
        }

        
        for (let i=0; i <numLat; i++) {
            for (let j=0; j<numLong; j++) {
                const middle = matrix[i][j];
                if (middle !== undefined){
                    // There is a node above
                    if (i+1 < matrix.length) {
                        const top = matrix[i+1][j]
                        if ( top !== undefined) { 
                            // There is a node to the left
                            if (j-1 > 0) {
                                const  left = matrix[i][j-1]
                                if ( left!== undefined) {
                                    triangles.push([left, top , middle])
                                }
                            }
                            
                        }
                    }
                    if (i-1 > 0) {
                        const bottom = matrix[i-1][j]
                        if (bottom !== undefined) {
                            // There is a node to the right
                            if (j+1 < matrix[0].length) {
                                const right = matrix[i][j+1]
                                if ( right !== undefined) {
                                    triangles.push([right, bottom, middle])
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return triangles;
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
                const textCoord = [coord[0] - 0.25, coord[1] + 0.25]
                return (
                <><circle key={index} r={"0.6%"} cx={coord[0] +"%"} cy={coord[1] +"%"} fill={"yellow"} stroke={"none"} strokeWidth={"0.1%"} opacity={1}/> 
                    <text x={textCoord[0] + "%"} y={textCoord[1] + "%"} fontSize={"5%"}>{index+1}</text>
                </>)
            });
            //setColorMarkers(svgCircles)
        }
    },[graph])

    const markerToCircle = (marker: MeasurementNode, bounds: [[number,number],[number, number]], index: number) => {
        const coord = coordToPercentage(marker.pos, bounds);
        const color = valueToColor(marker.value)
        return <circle key={index} r={ rectWidth/2 + "%"} cx={coord[0] +"%"} cy={coord[1] +"%"} fill={color} strokeWidth={"0.1%"} opacity={1} />
    }

    const edgeToRectangles = (edge: Edge, pointsToInterpolate: MeasurementNode[], rectangles: JSX.Element[], gradients: JSX.Element[]) => {
        const node1 = graph.nodes[edge[0]];
        const node2 = graph.nodes[edge[1]];
        let key = rectangles.length;
        const linePoints = pointsOnLine(node1.pos, node2.pos);
        for (let i=0; i < linePoints.length -1; i++) {
            const pos = [linePoints[i], linePoints[i+1]]
            let edge = pos.map((p) => {
                const value = valueInterpolation(p, pointsToInterpolate);
                const coord  = coordToPercentage(p)
                const color = valueToColor(value);
                return {x: coord[0], y: coord[1], color: color }
            })
            let dx = edge[1].x - edge[0].x;
            if (dx < 0){
                dx = -dx;
                edge = [edge[1], edge[0]];
            }
            const dy = edge[1].y - edge[0].y;
            const d = Math.sqrt(Math.pow(dy,2) + Math.pow(dx,2));
            let ds = [+dy/d* rectWidth/2, -dx/d * rectWidth/2];
          
            let dr = [dx/d* overlapp, dy/d * overlapp]
            let corners = "";
            corners += (edge[0].x + ds[0]) + "," + (edge[0].y + ds[1]);
            corners += " "
            corners += (edge[0].x - ds[0]) + "," + (edge[0].y - ds[1]);
            corners += " "
            corners += (edge[1].x - ds[0] + dr[0]) + "," + (edge[1].y - ds[1]  + dr[1]);
            corners += " "
            corners += (edge[1].x + ds[0]+ dr[0]) + "," + (edge[1].y + ds[1]  + dr[1]);
            corners += " "
            let textKey = "inter_poly_edge_" + key;
            let angle = Math.atan2(dy,dx);
            
            angle -= Math.PI/2
            var angleCoords = {
                'x1': Math.round(50 + Math.sin(angle) * 50) + '%',
                'y2': Math.round(50 + Math.cos(angle) * 50) + '%',
                'x2': Math.round(50 + Math.sin(angle + Math.PI) * 50) + '%',
                'y1': Math.round(50 + Math.cos(angle + Math.PI) * 50) + '%',};
            gradients.push(
                <linearGradient key={"grad_" + textKey} id={"grad_" + textKey} x1={angleCoords.x1} y1={angleCoords.y1}  x2={angleCoords.x2} y2={angleCoords.y2}>
                  <stop offset="0%" style={{"stopColor": edge[0].color, "stopOpacity":1}} />
                  <stop offset="100%" style={{"stopColor": edge[1].color, "stopOpacity":1}} />
                </linearGradient>
            )
            rectangles.push(<polygon  points={corners} key={textKey} fill={"url(#grad_" + textKey + ")" } opacity={1} />)
            key+=1

        }   
    }

    const colorAverage = (colors: string[]) => {
        let r =0;
        let g =0;
        let b =0;
        colors.forEach((color, index) => {
            r+= Number("0x" + color.slice(1,3))
            g+= Number("0x" + color.slice(3,5))
            b+= Number("0x" + color.slice(5,7))
        })
        r/= colors.length
        g/= colors.length
        b/= colors.length
        r = Math.round(r)
        g = Math.round(g)
        b = Math.round(b)
        const strings = [r.toString(16),g.toString(16),b.toString(16)]
        let colorAvg = "#"
        strings.forEach((string) => {
            if (string.length < 2) {
                colorAvg += "0"
            }
            colorAvg += string
        })
        return colorAvg
    }

    const faceToTriangles = (face: Face, polys: JSX.Element[]) => {
        let nodes = face.map((id) => graph.nodes[id]);
        let key = polys.length;
        const triangles = pointsOnPolygon(nodes.map((node) => node.pos))
        triangles.forEach((triangle, i) => {
            let coords = "";
            let colors: string[] = []
            triangle.forEach((pos) => {
                const value = valueInterpolation(pos, nodes);
                const coord  = coordToPercentage(pos)
                colors.push(valueToColor(value));
                coords += coord[0] + "," + coord[1] + " ";
            })
            const color = colorAverage(colors);
            polys.push(<polygon key={"triangle_"+ i +"_" + key} fill={color} points={coords} opacity={1}/>)
            key+=1
        })
    }

    useEffect(() => {
        let defs: JSX.Element[] = [];
        let circles: JSX.Element[] = []
        let rectangles: JSX.Element[] = []
        let triangles: JSX.Element[] = []
        defs.push(<filter id="f1" x="0.5" y="0.5" key={"f1"}>
                    <feGaussianBlur in="SourceGraphic" stdDeviation="0.1" />
                </filter>)
        if (graph.nodes) {
            circles = Object.entries(graph.nodes).map((entry, index) => markerToCircle(entry[1], bounds, index));
        }
        if (graph.edges) {
            graph.edges.forEach((edge, i) => edgeToRectangles(edge, edge.map((i) => graph.nodes[i]), rectangles, defs))
        }   
        if (graph.faces) {
            graph.faces.forEach((face) => {
                faceToTriangles(face, triangles)    
                const nodes = face.map((i) => graph.nodes[i])
                for (let i = 0; i< face.length; i++) {
                    let edge: Edge = [face[i], face[(i+1)%face.length]];
                    edgeToRectangles(edge, nodes, rectangles, defs)
                }     
            })
        }
        setInterpolatedPoints([...circles,...triangles,...rectangles])
        setDefs(defs)
    },[ graph ])

    /*
    // Get points from continuous gps data
    useEffect(() => {
        gpxParser(data, true).then((res) => {
            const markers = res as unknown as MeasurementNode[];
            const circles = markers.map((marker: MeasurementNode, index) => {
                const coord = coordToPercentage(marker.pos, bounds);
                const textCoord = [coord[0] - 0.25, coord[1] + 0.25]
                return (
                <><circle key={index} r={"0.6%"} cx={coord[0] +"%"} cy={coord[1] +"%"} fill={"yellow"} stroke={"none"} strokeWidth={"0.1%"} opacity={1}/> 
                    <text x={textCoord[0] + "%"} y={textCoord[1] + "%"} fontSize={"5%"}>{index+1}</text>
                </>)
            })
            //setColorMarkers(circles)
        })
    },[])
    */

    return (
        <>
         <svg width={"100%"} height={"100%"} viewBox={"0 0 100 100"}>
            {interpolatedPoints}
            <defs>
                {defs}
            </defs>
            {colorMarkers}
        </svg>
        </>
        )
        }
export default ColorMap;
