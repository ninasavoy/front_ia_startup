import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getAgenteDetalhes,
  getTarefas,
  criarAtividade,
  gerarPerguntasIA,
  editarAtividade,
  deletarAtividade
} from '../services/api';
import Button from '../components/botao';
import './css/criarAtividadeAgente.css';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CriarAtividadeComAgente() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agente, setAgente] = useState(null);
  const [tarefas, setTarefas] = useState([]);
  const [editingTarefaId, setEditingTarefaId] = useState(null);
  const [nomeTarefa, setNomeTarefa] = useState('');
  const [questions, setQuestions] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const listRef = useRef(null);
  const [iaPool, setIaPool]     = useState([]);   // armazena o pool de perguntas IA
  const [iaIndex, setIaIndex]   = useState(0);    // índice da próxima pergunta a exibir


  useEffect(() => {
    async function init() {
      try {
        const resAgente = await getAgenteDetalhes(agentId);
        setAgente(resAgente);
      } catch (err) {
        console.error(err);
        toast.error('Erro ao carregar detalhes do agente.');
        setAgente({});
      }
      try {
        const resT = await getTarefas(agentId);
        setTarefas(resT.tarefas || []);
      } catch (err) {
        console.error(err);
        toast.error('Erro ao carregar tarefas.');
        setTarefas([]);
      }
    }
    init();
  }, [agentId]);

  const loadTarefa = (tarefa) => {
    setNomeTarefa(tarefa.tarefa_id);
    setEditingTarefaId(tarefa.id);
    setQuestions(
      tarefa.perguntas.map(p => ({
        pergunta: p.pergunta,
        alternativas: Object.values(p.alternativas),
        resposta: Object.keys(p.alternativas).indexOf(p.resposta).toString()
      }))
    );
  };

  const voltarParaLista = () => {
    setQuestions(null);
    setNomeTarefa('');
    setEditingTarefaId(null);
  };

  const addManualQuestion = () => {
    setQuestions(prev => {
      const newQ = { pergunta: '', alternativas: ['', '', '', ''], resposta: '' };
      return prev ? [...prev, newQ] : [newQ];
    });
    setIsModalOpen(false);
  };

  const addIAQuestion = async () => {
    // 1) toast de loading e fecha modal
    const toastId = toast.loading('Buscando novas perguntas IA…');
    setIsModalOpen(false);

    try {
      // 2) se acabamos o pool (ou está vazio), buscamos 10 novas
      let pool = iaPool;
      if (iaIndex >= pool.length) {
        const { perguntas } = await gerarPerguntasIA(agentId);
        const mapped = perguntas.map(p => ({
          pergunta: p.pergunta,
          alternativas: Object.values(p.alternativas),
          resposta: Object.keys(p.alternativas).indexOf(p.resposta).toString()
        }));
        pool = [...pool, ...mapped];
        setIaPool(pool);
      }

      // 3) exibe a próxima pergunta do pool
      const next = pool[iaIndex];
      setQuestions(prev => prev ? [...prev, next] : [next]);
      setIaIndex(idx => idx + 1);

      // 4) atualiza toast para sucesso
      toast.update(toastId, {
        render: 'Pergunta adicionada com sucesso!',
        type:    'success',
        isLoading: false,
        autoClose: 3000
      });
    } catch (err) {
      console.error('Erro ao gerar perguntas IA:', err);
      // atualiza toast para erro
      toast.update(toastId, {
        render: 'Erro ao buscar perguntas IA.',
        type:    'error',
        isLoading: false,
        autoClose: 3000
      });
    }
  };

  const handleDeleteTarefa = async (tarefaId) => {
    if (!window.confirm(`Deseja realmente excluir a tarefa "${tarefaId}"?`)) return;
    try {
      await deletarAtividade(agentId, tarefaId);
      const resT = await getTarefas(agentId);
      setTarefas(resT.tarefas || []);
      toast.success(`Tarefa "${tarefaId}" excluída com sucesso!`);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao excluir tarefa.');
    }
  };

  const handleQuestionChange = (qIdx, field, value) => {
    const updated = [...questions];
    if (field.startsWith('alternativa_')) {
      const aIdx = Number(field.split('_')[1]);
      updated[qIdx].alternativas[aIdx] = value;
    } else {
      updated[qIdx][field] = value;
    }
    setQuestions(updated);
  };

  const addAlternative = (qIdx) => {
    const updated = [...questions];
    updated[qIdx].alternativas.push('');
    setQuestions(updated);
  };

  const removeAlternative = (qIdx, aIdx) => {
    const updated = [...questions];
    updated[qIdx].alternativas.splice(aIdx,1);
    if (Number(updated[qIdx].resposta) >= updated[qIdx].alternativas.length) {
      updated[qIdx].resposta = '';
    }
    setQuestions(updated);
  };

  const removeQuestionAt = (idx) => {
    setQuestions(prev => prev.filter((_,i)=>i!==idx));
  };

  const handleCreateTarefa = async () => {
    const payload = {
      nome_tarefa: nomeTarefa,
      perguntas: questions.map(q => ({
        pergunta: q.pergunta,
        alternativas: Object.fromEntries(
          q.alternativas.map((alt, i) => [String.fromCharCode(97 + i), alt])
        ),
        resposta: String.fromCharCode(97 + Number(q.resposta))
      }))
    };

    try {
      if (editingTarefaId) {
        await editarAtividade(agentId, editingTarefaId, payload);
        toast.success('Tarefa atualizada com sucesso!');
      } else {
        await criarAtividade(agentId, payload);
        toast.success('Tarefa criada com sucesso!');
      }
      const resT = await getTarefas(agentId);
      setTarefas(resT.tarefas || []);
      voltarParaLista();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar tarefa.');
    }
  };

  if (agente === null) {
    return (
      <div className="page-container">
        <p>Carregando...</p>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">
        {questions === null
          ? `Tarefas de ${agentId}`
          : editingTarefaId
            ? `Editando: ${nomeTarefa}`
            : `Criar Tarefa para ${agentId}`
        }
      </h1>

      {questions === null ? (
        <>
          <div className="tarefa-lista">
            {tarefas.map(t => (
              <div key={t.id} className="tarefa-item">
                <span>{t.tarefa_id}</span>
                <Button text="Ver Tarefa" onClick={() => loadTarefa(t)} />
                <button
                  type="button"
                  className="acao-botao excluir"
                  style={{ marginLeft: '8px' }}
                  onClick={() => handleDeleteTarefa(t.id)}
                >
                  🗑️ Excluir
                </button>
              </div>
            ))}
          </div>
          <div className="button-container">
            <Button text="+ Criar Tarefa" onClick={() => setIsModalOpen(true)} />
          </div>
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Como criar tarefa?</h3>
                <div className="modal-actions">
                  <Button text="Manual" onClick={addManualQuestion} />
                  <Button text="IA" onClick={addIAQuestion} />
                </div>
                <button className="acao-botao excluir modal-close" onClick={() => setIsModalOpen(false)}>×</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="criar-atividade-form">
          <div className="field">
            <label htmlFor="nomeTarefa">Nome da Tarefa</label>
            <input
              id="nomeTarefa"
              type="text"
              placeholder="Ex: tarefa1"
              value={nomeTarefa}
              onChange={e => setNomeTarefa(e.target.value)}
              required
            />
          </div>

          <div ref={listRef} className="questions-container">
            {questions.map((q, idx) => (
              <div key={idx} className="question-block">
                <h4>Pergunta {idx + 1}</h4>
                <input
                  type="text"
                  placeholder="Digite sua pergunta aqui..."
                  value={q.pergunta}
                  onChange={e => handleQuestionChange(idx, 'pergunta', e.target.value)}
                  required
                />
                <div className="alternativas-container">
                  {q.alternativas.map((alt, aIdx) => (
                    <div key={aIdx} className="alt-item">
                      <span>{String.fromCharCode(97 + aIdx).toUpperCase()}.</span>
                      <input
                        type="text"
                        placeholder={`Alternativa ${String.fromCharCode(97 + aIdx).toUpperCase()}`}
                        value={alt}
                        onChange={e => handleQuestionChange(idx, `alternativa_${aIdx}`, e.target.value)}
                        required
                      />
                      {q.alternativas.length > 2 && (
                        <button
                          type="button"
                          className="acao-botao excluir"
                          onClick={() => removeAlternative(idx, aIdx)}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button" 
                    className="acao-botao add-alt" 
                    onClick={() => addAlternative(idx)}
                  >
                    + Alternativa
                  </button>
                </div>

                <div className="resposta-container">
                  <label>Resposta Correta:</label>
                  <select
                    value={q.resposta}
                    onChange={e => handleQuestionChange(idx, 'resposta', e.target.value)}
                    required
                  >
                    <option value="" disabled>Selecione a resposta correta</option>
                    {q.alternativas.map((_, aIdx) => (
                      <option key={aIdx} value={`${aIdx}`}>
                        Alternativa {String.fromCharCode(97 + aIdx).toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  type="button" 
                  className="acao-botao excluir remove-question-btn" 
                  onClick={() => removeQuestionAt(idx)}
                >
                  🗑️ Remover Pergunta
                </button>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="add-question-btn" 
              onClick={addManualQuestion}
            >
              + Pergunta Manual
            </button>
            <button 
              type="button" 
              className="add-question-btn" 
              onClick={addIAQuestion}
            >
              + Pergunta IA
            </button>
          </div>

          <div className="button-container">
            <button 
              type="button" 
              className="acao-botao"
              onClick={voltarParaLista}
            >
              ← Voltar
            </button>
            <button 
              type="button" 
              className="acao-botao submit-btn"
              onClick={handleCreateTarefa}
            >
              {editingTarefaId ? 'Atualizar Tarefa' : 'Salvar Tarefa'}
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}