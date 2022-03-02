import React, { useState, useEffect, useContext } from "react";
import { Marker } from "react-leaflet";
import { collection } from './firebase'


export type AudioMarker = {
    id: string,
    audioUrl: string,
    latitude : number,
    longitude : number
  }

  interface MarkersProps{
    place: string,
    setPlace: React.Dispatch<React.SetStateAction<string>>
  }

  const AudioMarkersMap = () => {
    
    const [audio, setAudio] = useState(new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"));
    const [playing, setPlaying] = useState(false);
    
    
    const [marker, setMarker] = useState("");
    const [fadeInInterval, setFadeIninterval] = useState<NodeJS.Timer| undefined>();
    const [fadeOutInterval, setFadeOutinterval] = useState<NodeJS.Timer| undefined>();

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
    },[playing])

/*

    useEffect(()=>{
      audio.loop = true;
    },[audio])

    useEffect(()=>{
      setTimeout(()=>{
        if (volume !== 1)
        setVolume(volume + 0.2);
      }, 1000)
      if(volume ===1 && fadeInInterval){
        
        clearInterval(fadeInInterval)
        setFadeIninterval(undefined);
      }
      if(volume === 0 && fadeOutInterval){
        
        clearInterval(fadeOutInterval)
        setFadeIninterval(undefined);
      }
      

    }, [volume])


    function fadeAudioIn() {
      const timer = setInterval(()=>{
        if (volume !== 1){
          setVolume(volume+0.2)
          console.log("fade in: " + volume.toFixed(2))
          audio.volume = volume
        }
      }, 1000 )
      setFadeIninterval(timer)
    }

    function fadeAudioOut(){
      const timer = setTimeout(()=>{
        if (volume !== 0){
          setVolume(volume-0.2)
          console.log("fade out: " + volume.toFixed(2))
          audio.volume = volume
        }else {
          audio.pause()
        }
      }, 1000 )
      setFadeOutinterval(timer)
    }
*/

/*
    useEffect(() => {
        playing ? audio.play() : audio.pause();

        },
        [playing]
    );
    */

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


