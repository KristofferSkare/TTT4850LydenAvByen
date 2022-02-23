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


export default function gpxParser(file) {
    return fetch(file)
    .then(r => r.text())
    .then(text => {
        text = text.replaceAll(" ","");
        text = text.replaceAll("\n", "");
        text = text.replaceAll("\r", "");
        return parseGPXFileString(text);
    });
}