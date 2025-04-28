import React, { useState, useEffect } from 'react';
import Button from '../components/botao.js';
import AgenteCard from '../components/agenteCard';
import CriarAgenteModal from '../components/criarAgenteModal';
import ModalDeletarAgente from '../components/modalDeletarAgente';
import ModalEditarAgente from '../components/modalEditarAgente';
import { listarAgentes } from '../services/api';
import './css/pinicial.css';
import { ToastContainer } from 'react-toastify';

export default function PInicial() {
  const [agentes, setAgentes] = useState([]);
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [modalDeletarAberto, setModalDeletarAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [agenteSelecionado, setAgenteSelecionado] = useState('');

  const carregarAgentes = async () => {
    const resposta = await listarAgentes();
    setAgentes(resposta.agentes || []);
  };

  useEffect(() => {
    carregarAgentes();
  }, []);

  const abrirModalDeletar = (nome) => {
    setAgenteSelecionado(nome);
    setModalDeletarAberto(true);
  };

  const abrirModalEditar = (nome) => {
    setAgenteSelecionado(nome);
    setModalEditarAberto(true);
  };

  const deletarAgente = () => {
    // Aqui você faria a chamada API de DELETE
    alert(`Agente ${agenteSelecionado} deletado!`);
    setModalDeletarAberto(false);
    // Depois chama carregarAgentes() de novo pra atualizar a lista
  };

  const editarAgente = (novoNome) => {
    // Aqui você faria a chamada API de UPDATE
    alert(`Agente ${agenteSelecionado} renomeado para ${novoNome}!`);
    setModalEditarAberto(false);
    // Depois chama carregarAgentes() de novo pra atualizar a lista
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Minhas Atividades</h1>

      <div className="agentes-lista">
        {Array.isArray(agentes) && agentes.length > 0 ? (
          <table className="tabela-agentes">
            <thead>
              <tr>
                <th>Nome do Agente</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {agentes.map((nome, index) => (
                <tr key={index}>
                  <td>{nome}</td>
                  <td>
                    {/* <button className="acao-botao editar" onClick={() => abrirModalEditar(nome)}>✏️</button> */}
                    <button className="acao-botao excluir" onClick={() => abrirModalDeletar(nome)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Não há agentes cadastrados ainda.</p>
        )}
      </div>

      <div className="button-container">
        <Button text="Criar Agente" to="#" onClick={() => setModalCriarAberto(true)} />
      </div>

      <CriarAgenteModal
        isOpen={modalCriarAberto}
        onClose={() => setModalCriarAberto(false)}
        onCreated={carregarAgentes}
      />

      <ModalDeletarAgente
        isOpen={modalDeletarAberto}
        onClose={() => setModalDeletarAberto(false)}
        onConfirm={deletarAgente}
        agenteNome={agenteSelecionado}
      />

      <ModalEditarAgente
        isOpen={modalEditarAberto}
        onClose={() => setModalEditarAberto(false)}
        onConfirm={editarAgente}
        agenteNome={agenteSelecionado}
      />
      <ToastContainer />
    </div>
  );
}
