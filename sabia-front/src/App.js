import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Aluno from './pages/aluno';
import Professor from './pages/professor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aluno" element={<Aluno />} />
        <Route path="/professor" element={<Professor />} />
      </Routes>
    </Router>
  );
}

export default App;

