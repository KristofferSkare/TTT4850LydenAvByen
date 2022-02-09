import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {collection} from "./firebase";
import MapPhoto from './MapPhoto';
import Player from './Player';
import MultiPlayer from './MultiPlayer';

function App() {

  useEffect(() => {
    collection<{name: string}>("sound").get().then((sounds) => {
      sounds.docs.forEach((sound) => {
        const data = sound.data();
        console.log(data);
      })
    });

  },[])
  return ( 
    <>
    <div className="App">
      <header className="App-header">
        <MapPhoto/>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
    <div>
      <Player url="http://streaming.tdiradio.com:8000/house.mp3"></Player>

      <MultiPlayer
        urls={[
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        ]}
      />
    </div>
    </>
  );
}

export default App;
