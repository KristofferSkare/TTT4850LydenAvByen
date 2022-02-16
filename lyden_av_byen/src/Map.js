import { MapContainer, TileLayer, Marker, Popup, Circle, SVGOverlay } from 'react-leaflet'
import { useState, useEffect } from 'react';
import gpxParser from './gpxParser';
import test1File from "./Test1.txt";
import forslag1File from "./Forslag_1.txt";
import rute2File from  "./Rute2.txt";
import Player from './Player';
import firebase, {collection} from './firebase'
import AudioMarkersMap from './AudioMarkers';

import ColorMap from './ColorSvgOverlay';



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



/*
    useEffect(()=>{
        fetchAudioMarkers();
    }, [])

    */


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

            <AudioMarkersMap />

            {/*       
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
        */}

        </MapContainer>
        
    </div>);
}


export default Map;