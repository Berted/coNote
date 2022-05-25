import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Input } from '@chakra-ui/react';
import Editor from './editor/Editor';

function App() {
  return (
    <div className="App">
      <h1>coNote</h1>
      <Editor />
    </div>
  );
}

export default App;
