import React from 'react';
import logo from './logo.svg';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';

import CompositionEditor from './CompositionEditor/CompositionEditor';
import LandingPage from './LandingPage'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
          <Routes>
             {/* This is where you'd put the landing page */}
            <Route path="/" index element={<LandingPage/>} />
            <Route path="/composition-editor" index element={<CompositionEditor />}/>
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
