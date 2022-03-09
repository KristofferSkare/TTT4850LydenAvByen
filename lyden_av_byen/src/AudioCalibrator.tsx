import React, { useEffect, useState } from "react";

//function AudioCalibrator(audio:HTMLAudioElement, setAudio:React.Dispatch<React.SetStateAction<HTMLAudioElement>>){
function AudioCalibrator({audio, setAudio}: {audio: HTMLAudioElement; setAudio: (val: HTMLAudioElement)=>void}){

  const [playing, setPlaying]= useState(false);
  const [volume, setVolume] = useState(1);

  const [highActive, sethighActive] = useState(false);

  useEffect(()=>{

    audio.volume = volume;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[volume])

  useEffect(()=>{
    if (playing){

      audio.play()
    }
    else {
      audio.pause()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[playing])


  return (
      <div>
          <h1>Volumkalibrering</h1>
          <p>For å få en mest nøyaktig opplevelse av lydnivået i Trondheim burde du kalibrere ditt lydnivå til å best matche det opprinnelige opptaket.
              Følg henvisningene under for å gjøre dette.
          </p>
          <br/>
          <h2>Lavt nivå</h2>

          <p> Trykk på knappen under og sett ditt volum slik at du akkurat (svært lavt) hører denne lyden. </p>
        <button onClick={() =>{
              setPlaying(false);
              if (!playing){
              setAudio(new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"))
              setPlaying(true)
              if (highActive) {
                sethighActive(false)
              };
              setVolume(0.05)
        }

        }}>{playing ? "pause":"play"}</button>

          <br/>
          <h2> Høyt nivå</h2>
          <p>Trykk på knappen under og hør om ditt volum er behagelig. Dersom det oppleves høyt, vennligst senk volum </p>

          <button onClick={() =>{
              setPlaying(false);

            if (!playing){
              
              setAudio(new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"))
              setPlaying(true)

              if (!highActive) {
                sethighActive(true);
              }

              setVolume(0.9)
            }
        }}>{playing ? "pause":"play"}</button>
      
      <br/>
          <h2> NB! tykk på pause før du lukker dette vinduet.</h2>


      </div>
      );
}

export default AudioCalibrator;