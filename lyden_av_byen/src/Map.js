import { MapContainer, TileLayer, SVGOverlay } from 'react-leaflet'
import AudioMarkersMap from './AudioMarkers';
import UploadToFirebase from "./UploadToFirebase";

import ColorMap from './ColorSvgOverlay';
import InfoPopUp from './InfoPopUp';
import NtnuLogo from './ntnulogo.svg';


import AudioCalibratorPopUp from './AudioCalibratorPopUp';
import ColorScale from './ColorScale';

const colormap = require('colormap')

// Choose color map from here: https://www.npmjs.com/package/colormap
const colors = colormap({
    colormap: "portland",
    //colormap: "inferno",
    nshades: 100
})


export const graphId = "test";

const activateUpload = false;

const Map = () => {
    const center = [63.430595, 10.392043] 
    
    const bounds = [
        [63.424350 -0.002903, 10.376433],
        [63.435264, 10.407295]
      ]

    return (
    <div >
 
        <img className="svg-icon" src={NtnuLogo} alt="NTNU Logo" /> 

        <div className="popup-grid">
            <InfoPopUp />
            <AudioCalibratorPopUp />
        </div>
        <ColorScale colors={colors}/>
        <MapContainer center={center} zoom={15}>
       

        
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
        
            <SVGOverlay bounds={bounds}>
                <ColorMap bounds={bounds} colors={colors}/>
            </SVGOverlay>     

 
            <AudioMarkersMap />

        </MapContainer>
        
        {activateUpload &&<UploadToFirebase/>}
        
    </div>);
}


export default Map;