import { collection } from "./firebase";
import { useState } from "react";

import {graphId} from "./Map";


type Coordinate = [number, number];

type Edge = [string, string];

type Face = string[];

type Node = {
    position: Coordinate;
    time: Date;
    value: number;
}

type Graph = {
    edges: Edge[],
    nodes: {[id: string]: Node},
    faces: Face[],
}

const UploadToFirebase = () => {   

    
    const [csvFile, setCsvFile] = useState<Blob | undefined>()

    const getCurrentGraph = async () => {
        const graphNode = (await collection<{graphString: string}>("Graphs").doc(graphId).get());
        const graph = JSON.parse(graphNode?.data()?.graphString || "") as unknown as Graph;
        return graph;
    }

    const saveNewGraph = async (graph: Graph) => {
        collection<{graphString: string}>("Graphs").doc("test").set({
            graphString: JSON.stringify(graph)
        })
    }

    const uploadValues = async (values: number[]) => {
        const graph = await getCurrentGraph()
        values.forEach((value, index) => {
            graph.nodes[String(index + 1)].value = value
        })
        saveNewGraph(graph);
    } 

    const submit = () => {
        if (csvFile) {
            const reader = new FileReader();

            reader.onload = (e) => {
                const text = e?.target?.result as string;
  
                const values = text.replaceAll('"', '').replaceAll('\r', '').split("\n").map((v) => Number(v.replaceAll(",", ".")))
                
                uploadValues(values)
            }
    
            reader.readAsText(csvFile)
        }
    }
        
    
    return <div>
        <form id='csv-form'>
            <input
                type='file'
                accept='.csv'
                id='csvFile'
                onChange={(e) => {
                    if (e && e.target && e?.target?.files?.length) {
                        setCsvFile(e?.target?.files[0])
                    }
                }}
            >
            </input>
            <br/>
            <button
                onClick={(e) => {
                    e.preventDefault()
                    if(csvFile)submit()
                }}>
                Submit
            </button>
        </form>
    </div>
    
}

export default UploadToFirebase
