import React from "react";

import {useState} from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button} from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

function InfoText(){
    return(
    <div>
        <p> 
    Hjertelig velkommen til bartebygjengerens støykart! 
    Dette kartet viser i større eller mindre detalj
    hvordan byens støysoner utfolder seg for fotgjengere. 
    Ideen bygger på kommunens støykart fra rundt 2012, men 
    dette later til å være fokusert på veg og bane 
    (med oppdatering og mulighet for å velge dem hver for seg 
    i 2017). Vårt kart er for det første fem år yngre, og for 
    det andre mer tilpasset fotgjengere. 

    <br/>
    <br/>
    På grunn av størrelsesordenen på prosjektet vil vi dessverre 
    ikke kunne kartlegge alle veitene og veiene over lengre tid, 
    men vi har tatt flere målinger på forskjellige tidspunkter, 
    for å danne et så representativt bilde som mulig. 
    <br/>
    <br/>
    <b>Brukerinstruksjoner: </b>
    <br/>
    <b>1:</b> Kalibrer hodetelefonene dine i høyttaler-menyen. Dette er viktig for å få en så realistisk opplevelse som mulig. 
    <br/>
    <b>2:</b> Hold musepekeren over et markert område for å se nøyaktig desibelnivå, trykk på punktene for å høre et opptak av stedet. 
    <br/>
    <b>3:</b> Hvis du vil ha flere muligheter, trykk på Info-knappen i toppmenyen. 
    <br/>
    <br/>
    Denne nettsiden er en del av prosjektet “Lyden av byen” i Eksperter i team-emnet TTT4850, med Tim Cato Netland som landsbyleder og guru. 
    <br/>
    Også stor takk til Herman og Grete for god fasilitering!
    <br/>
    &copy;
</p>

    </div>
    );
}

const InfoPopUp = () => {
    
    const name = "info"
    const [isOpen, setIsOpen] = useState(false);
    const togglePopup = () => {
        setIsOpen(!isOpen);
        }

    const close = () => {
        setIsOpen(false)
    }


    return <>
    <button 
      aria-label={"show " + name + " box."} 
      className="info-button"
      onClick={togglePopup}
      value="">
        <InfoOutlinedIcon/>
    </button>
        <Dialog open={isOpen} onClose={close}>
            <DialogTitle>
           Info om nettsiden
            </DialogTitle>
            <DialogContent>
            <InfoText/>
            </DialogContent>
            <DialogActions>
                <Button onClick={close}>
                    Lukk
                </Button>
            </DialogActions>
        </Dialog>
    </>
}

export default InfoPopUp;