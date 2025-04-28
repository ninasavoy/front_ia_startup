import React from 'react';
import Button from '../components/botao.js';
import './css/home.css';

export default function Home() {
  return (
    <div className="page-container">
      <h1 className="page-title">Bem-vindo ao Sabiá</h1>
      <div className="buttons-container">
        <Button text="Aluno" to="/a_inicial" />
        <Button text="Professor" to="/p_inicial" />
      </div>
    </div>
  );
}
