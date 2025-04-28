import React, { useState } from 'react';
import '../components/css/modal.css';

export default function ModalEditarAgente({ isOpen, onClose, onConfirm, agenteNome }) {
  const [novoNome, setNovoNome] = useState(agenteNome);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(novoNome);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Agente</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
          />
          <button className="confirm-button" type="submit">Salvar</button>
        </form>
        <button className="close-button" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}
