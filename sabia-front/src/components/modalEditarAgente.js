import React, { useState, useEffect } from 'react';

export default function ModalEditarAgente({ isOpen, onClose, onConfirm, agenteNome }) {
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    setPdfFile(null);
  }, [isOpen, agenteNome]);

  if (!isOpen) return null;

  const handleSubmit = e => {
    e.preventDefault();
    if (!pdfFile) return; // opcional: exige PDF
    onConfirm(agenteNome, pdfFile); // passa só o nome antigo e o arquivo
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Atualizar Conteúdo do Agente</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Envie um novo PDF:
            <input
              type="file"
              accept="application/pdf"
              onChange={e => setPdfFile(e.target.files[0] || null)}
              required
            />
          </label>
          <button className="confirm-button" type="submit">
            Atualizar
          </button>
          <button className="close-button" type="button" onClick={onClose}>
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}
