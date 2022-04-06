import { useState, useEffect } from 'react';
import { collection } from "./firebase";
import {graphId} from "./Map";
import MLR from "ml-regression-multivariate-linear";

//import jsonGraph from "./graph.json";
//import gpxParser from './gpxParser';

//const data = require("./data_einar.txt");

const pointInPolygon = require('point-in-polygon');

type Coordinate = [number, number];

export type Node = {
    position: Coordinate;
    time: Date;
    value: number;
}

type Edge = [string, string];

type Face = string[];

export type Graph = {
    edges: Edge[],
    nodes: {[id: string]: Node},
    faces: Face[],
}

export const valueToColor = (strength: number, colors: string[],  minStrength=40, maxStrength=75) => {
    // Weighting color by 3rd order polynomial
    const x_0 = 0.45;
    const a = 1.2;
    const b = -3*a*x_0;
    const c = 1 -a -b;
    
    const x = (strength - minStrength)/(maxStrength - minStrength);
    const val = x*(a *x*x + b*x + c);
    const index = Math.floor(colors.length  * val)
    if (index<=0){
        return colors[0];
    }
    if (index >= colors.length) {
        return colors[colors.length -1];
    }
    return colors[index]
}


const ColorMap = ({bounds, colors}:{colors: string[];bounds: [[number,number],[number, number]]}) => {
    const interpolationResolutionEdge = 10; // In meters
    const interpolationResolutionFace = 3;
    const rectWidth = 0.5;
    const overlapp = 0.005;

   

    const [colorMarkers, setColorMarkers] = useState<JSX.Element[]>([]);
    const [graph, setGraph] = useState<Graph>({edges: [], nodes: {}, faces: []})
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
    
    const valueInterpolationLine = (position: Coordinate, markers: Node[], ) => {
        let sum_dist = 0;
        let sum_cross = 0;
        let sum_value = 0;
        for (const marker of markers) {
            const dist = distance(position, marker.position)
            sum_dist += dist;
            sum_value += marker.value;
            sum_cross += marker.value * dist; 
        }
        return sum_value - sum_cross/sum_dist;
    }

    const doMLROnPoints = (markers: Node[]) => {
        const x: [number, number][] = [];
        const y: [number][] = [];
        markers.forEach((marker) => {
            x.push(marker.position)
            y.push([marker.value])
        })
        return new MLR(x,y);
    }
    
    const coordToPercentage = (pos: [number, number], boundary: [[number,number],[number, number]]=bounds) => {
        const top = Math.max(boundary[0][0], boundary[1][0]);
        const bottom = Math.min(boundary[0][0], boundary[1][0]);
        const left = Math.max(boundary[0][1], bounds[1][1]);
        const right = Math.min(boundary[0][1], boundary[1][1]);

        return [ 100 * (right - pos[1])/(right - left),100 * (top - pos[0])/(top - bottom)];
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

    const getGraphFromFirebase = async () => {
        const graphNode = (await collection<{graphString: string}>("Graphs").doc(graphId).get());
        const graph = JSON.parse(graphNode?.data()?.graphString || "") as unknown as Graph;
        return graph;
    }

    useEffect(() => {
        
        getGraphFromFirebase().then((graph) => {
            setGraph(graph);
        })
        
    },[])
    
    useEffect(() => {
        if (graph.nodes){
            /*
            const svgCircles = Object.entries(graph.nodes).map((entry, index) => {
                const marker = entry[1];
                const coord = coordToPercentage(marker.position, bounds);
                const textCoord = [coord[0] - 0.25, coord[1] + 0.25]
                return (
                <><circle key={index} r={"0.6%"} cx={coord[0] +"%"} cy={coord[1] +"%"} fill={"yellow"} stroke={"none"} strokeWidth={"0.1%"} opacity={1}/> 
                    <text x={textCoord[0] + "%"} y={textCoord[1] + "%"} fontSize={"5%"}>{index+1}</text>
                </>)
            });
            setColorMarkers(svgCircles)
           */ 
           setColorMarkers([])
        }
    },[graph])

    const markerToCircle = (marker: Node, bounds: [[number,number],[number, number]], index: number) => {
        const coord = coordToPercentage(marker.position, bounds);
        const color = valueToColor(marker.value, colors)
        return <circle key={index} r={ rectWidth/2 + "%"} cx={coord[0] +"%"} cy={coord[1] +"%"} fill={color} strokeWidth={"0.1%"} opacity={1} />
    }

    const edgeToRectangles = (edge: Edge, pointsToInterpolate: Node[], rectangles: JSX.Element[], gradients: JSX.Element[], mlr?: MLR) => {
        const node1 = graph.nodes[edge[0]];
        const node2 = graph.nodes[edge[1]];
        let key = rectangles.length;
        const linePoints = pointsOnLine(node1.position, node2.position);
        for (let i=0; i < linePoints.length -1; i++) {
            const pos = [linePoints[i], linePoints[i+1]]
            let edge = pos.map((p) => {
                const value = mlr ? mlr.predict(p)[0] : valueInterpolationLine(p, pointsToInterpolate);
                const coord  = coordToPercentage(p)
                const color = valueToColor(value, colors);
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

    const colorAverage = (colorArr: string[]) => {
        let r =0;
        let g =0;
        let b =0;
        colorArr.forEach((color, index) => {
            r+= Number("0x" + color.slice(1,3))
            g+= Number("0x" + color.slice(3,5))
            b+= Number("0x" + color.slice(5,7))
        })
        r/= colorArr.length
        g/= colorArr.length
        b/= colorArr.length
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

    const faceToTriangles = (face: Face, polys: JSX.Element[], mlr: MLR) => {
        let nodes = face.map((id) => graph.nodes[id]);
        let key = polys.length;
        const triangles = pointsOnPolygon(nodes.map((node) => node.position))
        triangles.forEach((triangle, i) => {
            let coords = "";
            let colorsInTriangle: string[] = []
            triangle.forEach((pos) => {
                const value = mlr.predict(pos)[0];
                const coord  = coordToPercentage(pos)
                colorsInTriangle.push(valueToColor(value, colors));
                coords += coord[0] + "," + coord[1] + " ";
            })

            const color = colorAverage(colorsInTriangle);
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
                
               
                const nodes = face.map((i) => graph.nodes[i])
                const mlr = doMLROnPoints(nodes)
                faceToTriangles(face, triangles, mlr)    
                for (let i = 0; i< face.length; i++) {
                    let edge: Edge = [face[i], face[(i+1)%face.length]];
                    edgeToRectangles(edge, nodes, rectangles, defs, mlr)
                }     
            })
        }
        setInterpolatedPoints([...circles,...triangles,...rectangles])
        setDefs(defs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[ graph, bounds])

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
