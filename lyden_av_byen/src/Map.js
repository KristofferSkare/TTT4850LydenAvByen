import { MapContainer, TileLayer, Marker, Popup, Circle, SVGOverlay } from 'react-leaflet'
import { useState, useEffect } from 'react';
import Player from './Player';

const iconOptions = {

}


const Map = () => {

    const [url, setUrl] = useState("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3");
    const [audio, setAudio] = useState(new Audio(url));
    const [playing, setPlaying] = useState(true);
    const toggle = () => setPlaying(!playing);
    const [marker, setMarker] = useState(0);

    useEffect(() => {
        playing ? audio.play() : audio.pause();
        },
        [playing]
    );


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


                    // need: position, id, audio file, 

                    //setUrl(collection.getAudio.fromPos(position)) 
                    const markerID = 1;
                    setUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3");
                    setPlaying(false);
                    setAudio(new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"));
                    setPlaying(marker !== markerID);
                    if (marker !== markerID){
                        setPlaying(true);
                    } else {
                        setPlaying(!playing);
                    }
                    setMarker(markerID); 
                },
            }}>
            </Marker>
            <Marker 
            //icon={iconOptions}
            position={[63.4308, 10.395843]}  
            eventHandlers={{
                click: () => {
                    const markerID = 2;

                    // need: position, id, audio file, 

                    //setUrl(collection.getAudio.fromPos(position)) 
                    setUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
                    setPlaying(false);
                    setAudio(new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"));
                    if (marker !== markerID){
                        setPlaying(true);
                    } else {
                        setPlaying(!playing);
                    }
                    setMarker(markerID);
                    
                },
            }}>
            </Marker>

        </MapContainer>
        
    </div>);
}


export default Map;