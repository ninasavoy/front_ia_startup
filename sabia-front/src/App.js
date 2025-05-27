import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Aluno from './pages/a_inicial';
import Professor from './pages/p_inicial';
import CriarAtividade from './pages/criar_atividade_agente';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/a_inicial" element={<Aluno />} />
        <Route path="/p_inicial" element={<Professor />} />
        <Route path="/tarefas/:agentId" element={<CriarAtividade />} />
      </Routes>
    </Router>
  );
}

export default App;
