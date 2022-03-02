import React, { useEffect, useState } from "react";

function AudioCalibrator(){

  const [playing, setPlaying]= useState(false);
  const [audio, setAudio] = useState(new Audio(undefined))


    const [highActive, sethighActive] = useState(false);


      useEffect(()=>{
          if (highActive === true){
              audio.volume = 0.6
          }
          else {
              audio.volume = 0.2
          }
      }, [highActive])

      useEffect(()=>{
        if (playing){
  
          audio.play()
        }
        else {
          audio.pause()
        }
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
                sethighActive(false);
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
                sethighActive(true);
              }
          }}>{playing ? "pause":"play"}</button>
        

        </div>
        );
}

export default AudioCalibrator;