import { stringify } from "querystring";

type Marker = {
    pos: [number, number];
    time: Date;
    strength: number;    
}

const ColorMap = ({markers, bounds}:{markers: Marker[]; bounds: [[number,number],[number, number]]}) => {
    
    const colorMix = (pos: [number, number], markers: Marker[]) => {
        let sum_dist = 0;
        let sum_strength = 0;
        markers.forEach((marker) => {
            const dist_sq_inverse = 1/((pos[0] - marker.pos[0])^2 + (pos[1] - marker.pos[1])^2)
            sum_dist += dist_sq_inverse;
            sum_strength += marker.strength *dist_sq_inverse; 
        })
        return sum_strength/sum_dist;
    }
    
    const coordToProcentage = (pos: [number, number], bounds: [[number,number],[number, number]]) => {
        const top = Math.max(bounds[0][0], bounds[1][0]);
        const bottom = Math.min(bounds[0][0], bounds[1][0]);
        const left = Math.max(bounds[0][1], bounds[1][1]);
        const right = Math.min(bounds[0][1], bounds[1][1]);
        
        return [ 100 * (right - pos[1])/(right - left),100 * (top - pos[0])/(top - bottom),];
    }

    const decimalToHexString = (number: number) => {
        const hexString = Math.round(255*number).toString(16);
        if (hexString.length < 2) {
            return "0" + hexString;
        }
        if (hexString.length > 2) {
            return "ff";
        }
        return hexString
    }

    const strengthToColor = (strength: number) => {
        const blue = 1-strength;
        const red = strength;
        const green = 0;
        const hex = "#" + decimalToHexString(red) +decimalToHexString(green) + decimalToHexString(blue);
        return hex;
    }
    const colorMarkers = markers.map((marker, index) => {
        const coord = coordToProcentage(marker.pos, bounds);
        const color = strengthToColor(marker.strength);
        return <circle key={index} r={"1%"} cx={coord[0] + "%"} cy={coord[1] + "%"} fill={color} stroke={color} opacity={ 0.2 + 0.6*marker.strength}/>
    });
    return colorMarkers;
}
export default ColorMap
