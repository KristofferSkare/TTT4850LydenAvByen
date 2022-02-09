import { MapContainer, TileLayer, Marker, Popup, Circle, SVGOverlay } from 'react-leaflet'
import { useState, useEffect } from 'react';
import gpxParser from './gpxParser';
import test1File from "./Test1.txt";
import forslag1File from "./Forslag_1.txt";
import rute2File from  "./Rute2.txt";

import ColorMap from './ColorSvgOverlay';

const Map = () => {
    const [position, setPosition] = useState([63.430595, 10.392043]) 
    
    const [file, setFile] = useState(rute2File)
    const bounds = [
        [63.424350, 10.376433],
        [63.435264, 10.407295]
      ]
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
        gpxParser(file).then((res) => {
            const markers = res.map((marker) => ({...marker, strength: Math.random()}))
            setMarkers(markers)
        })
    },[file])

    return (
    <div >
        <MapContainer center={position} zoom={15}>

        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <SVGOverlay bounds={bounds}>
                <ColorMap markers={markers} bounds={bounds}/>
            </SVGOverlay>
            
           
        </MapContainer>
    </div>);
}


export default Map;