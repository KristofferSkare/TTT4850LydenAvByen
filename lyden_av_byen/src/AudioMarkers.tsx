import { useState, useEffect } from "react";
import { Marker } from "react-leaflet";
import { collection } from './firebase'


export type AudioMarker = {
    id: string,
    audioUrl: string,
    latitude : number,
    longitude : number
  }


  const AudioMarkersMap = () => {
    
    const [url, setUrl] = useState("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3");
    const [audio, setAudio] = useState(new Audio(url));
    const [playing, setPlaying] = useState(true);
    const [marker, setMarker] = useState("");

    async function getAudioMarkers() {
      const response = await collection<AudioMarker>('AudioMarkers').get();
      return response.docs.map(doc => ({id: doc.id, audioUrl: doc.data().audioUrl, 
        latitude: doc.data().latitude, longitude: doc.data().longitude}));
  }

    const [audioMarkers, setAudioMarkers] = useState<AudioMarker[]>([]);
    useEffect(() => {
        playing ? audio.play() : audio.pause();
        },
        [playing]
    );

    useEffect(()=>{
      getAudioMarkers().then((audioMarkers) => {
        setAudioMarkers(audioMarkers);
      });
    },[]);

    const audioMarkersMap = audioMarkers.map((audioMarker) => {
      
      return(
        <> 
      <Marker 
            position={[audioMarker.latitude, audioMarker.longitude]}  
            eventHandlers={{
                click: () => {
                    const markerID = audioMarker.id;
                    setUrl(audioMarker.audioUrl);
                    setPlaying(false);
                    setAudio(new Audio(audioMarker.audioUrl));
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
            </> 
      )

    });
    return audioMarkersMap;

  }
  export default AudioMarkersMap;


