import React from "react";
import "./App.css";
import Editor from "./components/editor/Editor";
import Home from "./components/Home";
import Login from "./components/user/Login";
import Signup from "./components/user/Signup";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="login" element={<Login />}></Route>
          <Route path="signup" element={<Signup />}></Route>
          <Route path="editor" element={<Editor />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
