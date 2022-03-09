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
  
  const [audio, setAudio] = useState(new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"));
  const [playing, setPlaying] = useState(false);
  
  
  const [marker, setMarker] = useState("");
  //const [fadeInInterval, setFadeIninterval] = useState<NodeJS.Timer| undefined>();
  //const [fadeOutInterval, setFadeOutinterval] = useState<NodeJS.Timer| undefined>();

  async function getAudioMarkers() {
    const response = await collection<AudioMarker>('AudioMarkers').get();
    return response.docs.map(doc => ({id: doc.id, audioUrl: doc.data().audioUrl, 
      latitude: doc.data().latitude, longitude: doc.data().longitude}));
}

  const [audioMarkers, setAudioMarkers] = useState<AudioMarker[]>([]);

  useEffect(()=>{
    if (playing){
      audio.play()
    }
    else {
      audio.pause()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[playing])


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


