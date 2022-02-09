import { MapContainer, TileLayer, Marker, Popup, Circle, SVGOverlay } from 'react-leaflet'
import { useState } from 'react';

const iconOptions = {

}

const Map = () => {
    const [position, setPosition] = useState([63.430595, 10.392043]) 
    const bounds = [
        [63.424380, 10.380492],
        [63.435283, 10.407567]
      ]
    return (
    <div style={{width: "100%", height: "100vh"}}>
        <MapContainer center={position} zoom={15}>

        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
        <SVGOverlay attributes={{ stroke: 'red' }} bounds={bounds}>
            <rect x="0" y="0" width="100%" height="100%" fill="blue" opacity={0.2}/>
            <text x="50%" y="50%" stroke="white">
            text
            </text>
        </SVGOverlay>
            <Marker 
            //icon={iconOptions}
            position={position}  
            eventHandlers={{
                click: () => {
                console.log('marker clicked')
                },
            }}>
            </Marker>
        </MapContainer>
    </div>);
}


export default Map;