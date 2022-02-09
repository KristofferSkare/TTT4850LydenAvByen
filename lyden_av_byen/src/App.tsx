import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {collection} from "./firebase";
import Map from "./Map";

function App() {

  return (
    <div className="App">
      <Map/>
    </div>
  );
}

export default App;
