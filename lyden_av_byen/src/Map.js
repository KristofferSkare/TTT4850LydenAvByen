import { MapContainer, TileLayer, SVGOverlay } from 'react-leaflet'
import { useState } from 'react';
import AudioMarkersMap from './AudioMarkers';
import UploadToFirebase from "./UploadToFirebase";

import ColorMap from './ColorSvgOverlay';
import PopUp from './PopUp';
import InfoText from './InfoText';
import NtnuLogo from './ntnulogo.svg';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VolumeUpSharpIcon from '@mui/icons-material/VolumeUpSharp';
import AudioCalibrator from './AudioCalibrator';

export const graphId = "test";

const activateUpload = false;

const Map = () => {


    const [audio, setAudio] = useState(new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"))

    const center = [63.430595, 10.392043] 
    
    const bounds = [
        [63.424350 -0.002903, 10.376433],
        [63.435264, 10.407295]
      ]

    return (
    <div >
 
        <img class="svg-icon" src={NtnuLogo} alt="NTNU Logo" /> 

        <div class="popup-grid">
            <PopUp name={"info"}  content={<InfoText/>} icon={<InfoOutlinedIcon/>} />
            <PopUp name={"kalibrer"} content={<AudioCalibrator audio={audio} setAudio={(val) => {setAudio(val)}}/>} icon={<VolumeUpSharpIcon/>} />
           {/* <PopUp name={"info3"} content={"3"} />*/ }
        </div>

        <MapContainer center={center} zoom={15}>


        
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
        
            <SVGOverlay bounds={bounds}>
                <ColorMap bounds={bounds}/>
            </SVGOverlay>     

 
            <AudioMarkersMap />

        </MapContainer>
        
        {activateUpload &&<UploadToFirebase/>}
        
    </div>);
}


export default Map;