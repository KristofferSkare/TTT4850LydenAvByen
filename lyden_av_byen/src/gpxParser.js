
    const degToRad = (deg) => {
        return deg * Math.PI/180;
    }

const distance = (pos1, pos2) => {
        
    // Math formulas from here: https://www.geeksforgeeks.org/program-distance-two-points-earth/
    const rad1 = pos1.map((deg) => degToRad(deg))
    const rad2 = pos2.map((deg) => degToRad(deg))
    const havSinDiff = [rad1[0] - rad2[0], rad1[1] - rad2[1]].map((drad) =>Math.pow(Math.sin(drad/2),2))
    const cosLat = [rad1[0], rad2[0]].map((lat) => Math.cos(lat))
    const a = havSinDiff[0] + cosLat[0] * cosLat[1] * havSinDiff[1];
    let c = 2 * Math.asin(Math.sqrt(a));
    // Radius of earth in meters
    let r = 6371 * 1000;
    // calculate the result
    return c * r;
}


const parseCoords = (line) => {
    const startLat = line.indexOf('lat="') + 5;
    const startLong = line.indexOf('lon="') + 5;
    const latString = line.substring(startLat, startLong - 6)
    const longString = line.substring(startLong, line.length -1)
    return [Number(latString), Number(longString)]
}

const parseTime = (line) => {
    const startTime = line.indexOf('time>') + 5;
    const endTime = line.indexOf('</time');
    const timeString = line.substring(startTime, endTime);
    return new Date(timeString);
}

const parseSpeed = (line) =>{
    const startTime = line.indexOf('speed>') + 6;
    const endTime = line.indexOf('</speed');
    const speedString = line.substring(startTime, endTime);
    return Number(speedString);
}

const parseGPXFileString = (filestring) => {
    const start = filestring.indexOf("<trkseg>") + 8;
    const end = filestring.indexOf("</trkseg>");
    const coords = [];
    const sub = filestring.substring(start, end);
    const lines = sub.split("<trkpt");    
    for (const line of lines.slice(1)) {
        const elems = line.split("><");
         // Coordinate

        let pos = parseCoords(elems[0]);
        let time = parseTime(elems[2])
        coords.push({pos: pos, time: time}) 
           
    }
    return coords;
}

const parseGPXFileStringSpeedBelowThreshold = (filestring, speedThreshold) => {
    const start = filestring.indexOf("<trkseg>") + 8;
    const end = filestring.indexOf("</trkseg>");
    const coords = [];
    const sub = filestring.substring(start, end);
    const lines = sub.split("<trkpt");    
    let prevSlowSpeed = false;
    for (const line of lines.slice(1)) {
        const elems = line.split("><");
         // Coordinate

        let pos = parseCoords(elems[0]);
        let time = parseTime(elems[2])
        let speed = parseSpeed(elems[3])
        if (speed < speedThreshold && !prevSlowSpeed) {
            if (coords.length < 1) {
                prevSlowSpeed = true
                coords.push({pos: pos, time: time}) 
            } else if (distance(pos, coords[coords.length -1].pos) > 10) {
                prevSlowSpeed = true
                coords.push({pos: pos, time: time}) 
            }
        } else if (speed > speedThreshold && prevSlowSpeed) {
            prevSlowSpeed = false
        }
    }
    return coords;
}


export default function gpxParser(file, onlyStoppedPoints=false) {
    return fetch(file)
    .then(r => r.text())
    .then(text => {
        text = text.replaceAll(" ","");
        text = text.replaceAll("\n", "");
        text = text.replaceAll("\r", "");
        if (onlyStoppedPoints) {
            return parseGPXFileStringSpeedBelowThreshold(text, 0.001);
        }
        return parseGPXFileString(text);
    });
}

