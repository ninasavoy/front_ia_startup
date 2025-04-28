import React from 'react';
import '../components/css/agenteCard.css';

export default function AgenteCard({ nome }) {
  return (
    <div className="agente-card">
      <h3>{nome}</h3>
    </div>
  );
}
