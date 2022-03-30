
import { useEffect, useState } from 'react';
import { collection } from "./firebase";
import {graphId} from "./Map";
import {Graph, Node} from "./ColorSvgOverlay";
import { Marker, Popup } from 'react-leaflet';
import { MeasurementMarkerIcon } from './MarkerIcons';

const MeasurementMarkers = () => {

    const [markers, setMarkers] = useState<Node[]>([])

    const getGraphFromFirebase = async () => {
        const graphNode = (await collection<{graphString: string}>("Graphs").doc(graphId).get());
        const graph = JSON.parse(graphNode?.data()?.graphString || "") as unknown as Graph;
        return graph;
    }


    useEffect(() => {
        getGraphFromFirebase().then((graph) => {
            if (graph.nodes) {
                const dbMarkers = Object.entries(graph.nodes).map((entry, index) => entry[1]);
                setMarkers(dbMarkers)
            }
        })
    },[])

    return <>
        {markers.map((node) => 
        <Marker position={node.position}
        // @ts-ignore
        icon={MeasurementMarkerIcon}
        >
             <Popup>
                <div>
                    {"Posisjon: " + node.position}
                </div>
                <div>
                    {"Målt lydstyrke: " + node.value + " dB"}
                </div>
        </Popup>
        </Marker>)}
    </>
}

export default MeasurementMarkers;