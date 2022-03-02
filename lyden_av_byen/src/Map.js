import { MapContainer, TileLayer, SVGOverlay } from 'react-leaflet'
import { useState, useEffect } from 'react';
import gpxParser from './gpxParser';
import rute2File from  "./Rute2.txt";
import AudioMarkersMap from './AudioMarkers';

import ColorMap from './ColorSvgOverlay';
import PopUp from './PopUp';
import InfoText from './InfoText';
import NtnuLogo from './ntnulogo.svg';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VolumeUpSharpIcon from '@mui/icons-material/VolumeUpSharp';
import AudioCalibrator from './AudioCalibrator';



const Map = () => {


    const [place, setPlace] = useState("marker");

    const [position, setPosition] = useState([63.430595, 10.392043]) 
    
    const [file, setFile] = useState(rute2File)
    const bounds = [
        [63.424350, 10.376433],
        [63.435264, 10.407295]
      ]
    const [markers, setMarkers] = useState([]);

    const [isOpen, setIsOpen] = useState(false);
    const togglePopup = () => {
        setIsOpen(!isOpen);
      }

    useEffect(() => {
        gpxParser(file).then((res) => {
            const markers = res.map((marker) => ({...marker, strength: Math.random()}))
            setMarkers(markers)
        })
    },[file])

    return (
    <div >
 
        <img class="svg-icon" src={NtnuLogo} alt="NTNU Logo" /> 

        <div class="popup-grid">
            <PopUp name={"info"}  content={<InfoText/>} icon={<InfoOutlinedIcon/>} />
            <PopUp name={"kalibrer"} content={<AudioCalibrator/>} icon={<VolumeUpSharpIcon/>} />
            <PopUp name={"info3"} content={"3"} />
        </div>

        <MapContainer center={position} zoom={15}>


        
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <SVGOverlay bounds={bounds}>
                <ColorMap markers={markers} bounds={bounds}/>
            </SVGOverlay>     


            <AudioMarkersMap />

        </MapContainer>
        
    </div>);
}


export default Map;