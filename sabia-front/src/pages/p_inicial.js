import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';              
import Button from '../components/botao.js';
import AgenteCard from '../components/agenteCard';
import CriarAgenteModal from '../components/criarAgenteModal';
import ModalDeletarAgente from '../components/modalDeletarAgente';
import ModalEditarAgente from '../components/modalEditarAgente';
import { listarAgentes } from '../services/api';
import { deletarAgente as apiDeletarAgente } from '../services/api'; // Certifique que tá importando certinho
import { editarAgente as apiEditarAgente } from '../services/api'; // Certifique que tá importando certinho
import './css/pinicial.css';
import { ToastContainer, toast } from 'react-toastify';

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

  const deletarAgente = async () => {
    try {
      await apiDeletarAgente(agenteSelecionado); // chama API passando o nome do agente
      alert(`Agente ${agenteSelecionado} deletado com sucesso!`);
      setModalDeletarAberto(false); // fecha o modal de confirmação
      carregarAgentes(); // atualiza a lista dos agentes
    } catch (error) {
      console.error(error);
      alert('Erro ao deletar agente.');
    }
  };

  const editarAgente = async (nomeAntigo, pdfFile) => {
    // 1) fecha o modal
    setModalEditarAberto(false);

    // 2) toast de loading
    const toastId = toast.loading('Atualizando agente…');

    try {
      // 3) chama a API
      await apiEditarAgente(nomeAntigo, pdfFile);

      // 4) atualiza o toast para sucesso
      toast.update(toastId, {
        render: `Agente ${nomeAntigo} atualizado com sucesso!`,
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });

      // 5) recarrega a lista
      carregarAgentes();
    } catch (err) {
      console.error(err);
      // 6) atualiza o toast para erro
      toast.update(toastId, {
        render: 'Erro ao atualizar agente.',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Aulas</h1>

      <div className="agentes-lista">
        {Array.isArray(agentes) && agentes.length > 0 ? (
          <table className="tabela-agentes">
            <thead>
              <tr>
                <th>Agentes</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {agentes.map((agente, index) => (
                <tr key={index}>
                  <td>
                    <Link
                      to={`/tarefas/${agente.agent_id}`}
                      className="link-agente"
                    >
                      {agente.agent_id}
                    </Link>
                  </td>
                  <td>
                    <button
                      className="acao-botao editar"
                      onClick={() => abrirModalEditar(agente.agent_id)}
                    >
                      ✏️
                    </button>
                    <button
                      className="acao-botao excluir"
                      onClick={() => abrirModalDeletar(agente.agent_id)}
                    >
                      🗑️
                    </button>
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
