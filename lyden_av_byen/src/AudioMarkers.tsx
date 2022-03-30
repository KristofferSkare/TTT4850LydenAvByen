import { useState, useEffect, useRef } from "react";
import { Marker } from "react-leaflet";
import { collection } from './firebase'
import { PlayMarkerIcon, PlayMarkerActiveIcon } from "./MarkerIcons";

export type AudioMarker = {
    id: string,
    audioUrl: string,
    preAudioUrl?: string,
    latitude: number,
    longitude: number
  }


const AudioMarkersMap = () => {
  const crossFadeTime = 2.3;
  const [preAudio, setPreAudio] = useState<null | HTMLAudioElement>(null)
  const [audio, setAudio] = useState<null | HTMLAudioElement>(null);
  const [audio2, setAudio2] = useState<null | HTMLAudioElement>(null);
  const playingRef = useRef(false);  
  
  const [marker, setMarker] = useState("");
  //const [fadeInInterval, setFadeIninterval] = useState<NodeJS.Timer| undefined>();
  //const [fadeOutInterval, setFadeOutinterval] = useState<NodeJS.Timer| undefined>();

  async function getAudioMarkers() {
    const response = await collection<AudioMarker>('AudioMarkers').get();
    return response.docs.map(doc => ({id: doc.id, audioUrl: doc.data().audioUrl, 
      latitude: doc.data().latitude, longitude: doc.data().longitude, preAudioUrl: doc.data().preAudioUrl}));
}

  const [audioMarkers, setAudioMarkers] = useState<AudioMarker[]>([]);

  const stop = () => {
    if (preAudio) {
      preAudio.ontimeupdate = () => {}
  
    }
    if (audio) {
      audio.ontimeupdate = () => {}
  
    }
    if (audio2) {
      audio2.ontimeupdate = () => {}
  
    }
    if (preAudio) {
      preAudio.pause()
    }
    if (audio) {
      audio.pause()
    }
    if (audio2) {
      audio2.pause()
    }
  }

  useEffect(() => {
    if (!playingRef.current) {
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[playingRef.current])

  useEffect(()=>{
    getAudioMarkers().then((audioMarkers) => {
      setAudioMarkers(audioMarkers);
    });
  },[]);

  const makeAudioObjects = (url: string, preUrl: string | undefined) => {
    const a = new Audio(url);
    const a2 = new Audio(url);
    let pa = null;
    if (preUrl) {
      pa = new Audio(preUrl);
      pa.ontimeupdate = (time) => {
        const targetAudio = time.target as HTMLAudioElement;
        if (targetAudio.duration - targetAudio.currentTime <= crossFadeTime) {
          if (a.paused && playingRef.current) {
            a.play()
          }
        }
      }
      pa.oncanplaythrough = (e) => {
        const targetAudio = e.target as HTMLAudioElement;
        targetAudio.play()
      }
    } else {
      a.oncanplaythrough = (e) => {
        const targetAudio = e.target as HTMLAudioElement;
        targetAudio.play()
      }
    }

    a.ontimeupdate = (time) => {
      const targetAudio = time.target as HTMLAudioElement;
      if (targetAudio.duration - targetAudio.currentTime <= crossFadeTime) {
        if (a2.paused && playingRef.current) {
          a2.play()
        }
      }
    }
    a2.ontimeupdate = (time) => {
      const targetAudio = time.target as HTMLAudioElement;
      if (targetAudio.duration - targetAudio.currentTime <= crossFadeTime) {
        if (a.paused && playingRef.current) {
          a.play()
        }
      }
    }
    return {audio: a, audio2: a2, preAudio: pa};
  }
  const markerOnClick = (audioMarker: AudioMarker) => {
    stop()
    const markerId = audioMarker.id;

    if (!playingRef.current || markerId !== marker) {
      const {audio, audio2, preAudio} = makeAudioObjects(audioMarker.audioUrl, audioMarker.preAudioUrl)
      setAudio(audio);
      setAudio2(audio2)
      setPreAudio(preAudio);
      playingRef.current = true
      setMarker(markerId)
    } else {
      setMarker("");
      playingRef.current = false
    }

    
}

  const audioMarkersMap = audioMarkers.map((audioMarker, index) => {
    
    return(
      
    <Marker
    //@ts-ignore
      icon={audioMarker.id === marker ?PlayMarkerActiveIcon :PlayMarkerIcon}
      key={index}
      position={[audioMarker.latitude, audioMarker.longitude]}  
      eventHandlers={{
          click: () => {
            markerOnClick(audioMarker)
          },
      }}>
          </Marker>

    )

  });
  return audioMarkersMap;

}
export default AudioMarkersMap;


