import React, { useState } from 'react';
import { criarAgente } from '../services/api';
import '../components/css/modal.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CriarAgenteModal({ isOpen, onClose, onCreated }) {
  const [nome, setNome] = useState('');
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !pdf) {
      toast.error('Preencha todos os campos!');
      return;
    }

    try {
      setLoading(true);
      await criarAgente(nome, pdf);
      toast.success('Agente criado com sucesso!');
      onCreated();
      onClose();
      setNome('');
      setPdf(null);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar agente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Criar Novo Agente</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome do agente"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdf(e.target.files[0])}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar'}
          </button>
        </form>
        <button className="close-button" onClick={onClose} disabled={loading}>Cancelar</button>
      </div>
    </div>
  );
}
