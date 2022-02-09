import React, { useEffect, useState } from "react";
import './App.css'

const useAudio = (url) => {
    const [audio] = useState(new Audio(url));
    const [playing, setPlaying] = useState(false);
    const toggle = () => setPlaying(!playing);

    useEffect(() => {
        playing ? audio.play() : audio.pause();
        },
        [playing]
    );

    useEffect(() => {
        audio.addEventListener('ended', () => setPlaying(false));
        return () => {
            audio.removeEventListener('ended', ()=> setPlaying(false));
        };
    }, []);

    return [playing, toggle];
};

const Player = ({ url}) => {

    const [playing, toggle] = useAudio(url);


    return (
        <div>
            <button class="button" style={{top:100,left: 300}} onClick={toggle}>{playing ? "Pause" : "Play"}</button>
        </div>
    );
};

export default Player;