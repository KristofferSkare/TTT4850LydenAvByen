import {useState} from "react";
import VolumeUpSharpIcon from '@mui/icons-material/VolumeUpSharp';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton} from "@mui/material";
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';


function AudioCalibrator({lowIsPlaying, highIsPlaying, audioLow, audioHigh, onClickHigh, onClickLow}: 
  {lowIsPlaying: boolean; highIsPlaying: boolean;audioLow: HTMLAudioElement; audioHigh: HTMLAudioElement; onClickHigh: () => void; onClickLow: () => void}){

  return (
      <div>
          <p>For å få en mest nøyaktig opplevelse av lydnivået i Trondheim burde du kalibrere ditt lydnivå til å best matche det opprinnelige opptaket.
              Følg henvisningene under for å gjøre dette.
          </p>
          <br/>
          <div  className="audio-calibrator-button-container">
          <h3  className="audio-calibrator-button-text">Lavt nivå</h3>
          <IconButton 
          className="audio-calibrator-button"
        onClick={() =>{
              onClickLow()
        }}>{lowIsPlaying ? <PauseCircleIcon fontSize={"large"}/>:<PlayCircleIcon  fontSize={"large"}/>}</IconButton>
</div>
          <p> Trykk på knappen over og sett ditt volum slik at du akkurat (svært lavt) hører denne lyden. </p>
        

          <br/>
          <div className="audio-calibrator-button-container">
          <h3 className="audio-calibrator-button-text"> Høyt nivå</h3>

          <IconButton 
           className="audio-calibrator-button"
          onClick={() =>{
                onClickHigh()
          }}>{highIsPlaying ? <PauseCircleIcon fontSize={"large"}/>:<PlayCircleIcon  fontSize={"large"}/>}</IconButton>
          </div>
          <p>Trykk på knappen over og hør om ditt volum er behagelig. Dersom det oppleves høyt, vennligst senk volum </p>


      </div>
      );
}

const AudioCalibratorPopUp = () => {
  const name = "kalibrer"
  const [audioLow,] = useState(new Audio("https://firebasestorage.googleapis.com/v0/b/ttt4850lydenavbyen-a54cf.appspot.com/o/Laveste%20lyd.mp3?alt=media&token=e6722e4c-b1d0-467d-8218-80a20fbd65d7"));
  const [audioHigh,] = useState(new Audio("https://firebasestorage.googleapis.com/v0/b/ttt4850lydenavbyen-a54cf.appspot.com/o/H%C3%B8yeste%20lyd.mp3?alt=media&token=7a9b07e1-2c19-4a5e-8f24-d366a86651f4"));
  
  const [lowIsPlaying, setLowIsPlaying] = useState(false)
  const [highIsPlaying, setHighIsPlaying] = useState(false)

  const [isOpen, setIsOpen] = useState(false);
    const togglePopup = () => {
        setIsOpen(!isOpen);
      }
    const handleClose = () =>{
      setIsOpen(false)
      audioLow.pause()
      audioHigh.pause()
      setLowIsPlaying(false)
      setHighIsPlaying(false)
    }

      return( 
          <>
    <button 
      aria-label={"show " + name + " box."} 
      className="info-button"
      onClick={togglePopup}
      value="">
        <VolumeUpSharpIcon/>
        </button>
        <div>
        <Dialog open={isOpen} onClose={handleClose}>
          <DialogTitle>Volumkalibrering</DialogTitle>
          <DialogContent>
            <AudioCalibrator 
            onClickHigh={() => {
            
              if (lowIsPlaying) {
                setLowIsPlaying(false)
                audioLow.pause()
              }
              if (highIsPlaying) {
                audioHigh.pause()
                setHighIsPlaying(false)
              } else {
               
                audioHigh.play()
                setHighIsPlaying(true)
              }
            }}
            onClickLow={() => {
              
              if (highIsPlaying) {
                setHighIsPlaying(false)
                audioHigh.pause()
              }
              if (lowIsPlaying) {
                audioLow.pause()
                setLowIsPlaying(false)
              } else {
                audioLow.play()
                setLowIsPlaying(true)
              }
            }} audioLow={audioLow} audioHigh={audioHigh} highIsPlaying={highIsPlaying} lowIsPlaying={lowIsPlaying}/>
          </DialogContent>
          <DialogActions>
          <Button onClick={handleClose}>
                    Lukk
                </Button>
          </DialogActions>
        </Dialog>
        </div>
    </>

      );
} 

export default AudioCalibratorPopUp;