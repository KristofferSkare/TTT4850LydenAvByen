import React, {useState} from "react";

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';




const PopUpBox = props  => {
    return (
      <div className="popup-box">
        <div className="box">
          <button className="close-icon" onClick={props.handleClose}>x</button>
          {props.content}
        </div>
      </div>
    );
  };
   

  const PopUp = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const togglePopup = () => {
        setIsOpen(!isOpen);
      }

      return( 
          <>

    {
        isOpen && <PopUpBox handleClose={togglePopup} content={props.content}/>
        }
    
    
    <button 
      aria-label={"show " + props.name + " box."} 
      class="info-button" æ
      onClick={togglePopup}
      value="">
        {props.icon ? props.icon:props.name}</button>
    </>

      );
  }

  export default PopUp;

