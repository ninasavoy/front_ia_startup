import React from 'react';
import '../components/css/modal.css';

export default function ModalDeletarAgente({ isOpen, onClose, onConfirm, agenteNome }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Deletar Agente</h2>
        <p>Tem certeza que deseja deletar o agente <strong>{agenteNome}</strong>?</p>
        <div style={{ marginTop: '20px' }}>
          <button className="confirm-button" onClick={onConfirm}>Sim, deletar</button>
          <button className="close-button" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
