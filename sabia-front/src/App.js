<<<<<<< HEAD
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
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
=======
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Aluno from './pages/a_inicial';
import Professor from './pages/p_inicial';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/a_inicial" element={<Aluno />} />
        <Route path="/p_inicial" element={<Professor />} />
      </Routes>
    </Router>
>>>>>>> 6441abb9f31e441977c1a5676cd28913cbf3db48
  );
}

export default App;
<<<<<<< HEAD
=======

>>>>>>> 6441abb9f31e441977c1a5676cd28913cbf3db48
