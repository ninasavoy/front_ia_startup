import React, { useState, useEffect, useRef, listRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAgenteDetalhes, getTarefas, criarAtividade, gerarPerguntasIA, editarAtividade, deletarAtividade } from '../services/api';
import Button from '../components/botao';
import './css/criarAtividadeAgente.css';

export default function CriarAtividadeComAgente() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agente, setAgente] = useState(null);
  const [tarefas, setTarefas] = useState([]);
  // null = criando, string = editando esse tarefa_id
  const [editingTarefaId, setEditingTarefaId] = useState(null);

  // estado do nome da tarefa
  const [nomeTarefa, setNomeTarefa] = useState('');
  const [questions, setQuestions] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const resAgente = await getAgenteDetalhes(agentId);
        setAgente(resAgente);
      } catch (err) {
        console.error('Erro ao carregar agente:', err);
        setAgente({});
      }
      try {
        const resT = await getTarefas(agentId);
        setTarefas(resT.tarefas || []);
      } catch (err) {
        console.error('Erro ao carregar tarefas:', err);
        setTarefas([]);
      }
    }
    init();
  }, [agentId]);

  // Carrega perguntas de uma tarefa existente
  const loadTarefa = (tarefa) => {
    // CORREÇÃO: seta o nome corretamente e entra em modo edição
    setNomeTarefa(tarefa.tarefa_id); // aqui estava o problema - deve ser o nome da tarefa
    setEditingTarefaId(tarefa.tarefa_id);
    // popula o formulário com as perguntas existentes
    setQuestions(
      tarefa.perguntas.map(p => ({
        pergunta: p.pergunta,
        alternativas: Object.values(p.alternativas),
        // encontramos o índice da resposta correta
        resposta: Object.keys(p.alternativas).indexOf(p.resposta).toString()
      }))
    );
  };

  // Função para voltar à lista de tarefas
  const voltarParaLista = () => {
    setQuestions(null);
    setNomeTarefa('');
    setEditingTarefaId(null);
  };

  // handlers para criação manual de perguntas, agora preservando o state anterior
  const addManualQuestion = () => {
    setQuestions(prev => {
      const newQ = { pergunta: '', alternativas: ['', '', '', ''], resposta: '' };
      return prev ? [...prev, newQ] : [newQ];
    });
    setIsModalOpen(false);
  };

  // gera perguntas via backend e popula o form
  const addIAQuestion = async () => {
    try {
      // 1) chama a API
      const { perguntas } = await gerarPerguntasIA(agentId);

      // 2) mapeia pro formato interno do state
      const mapped = perguntas.map(p => ({
        pergunta: p.pergunta,
        alternativas: Object.values(p.alternativas),
        resposta: Object
          .keys(p.alternativas)
          .indexOf(p.resposta)
          .toString()
      }));

      // 3) seta todas de uma vez (modo edição/criação)
      setQuestions(mapped);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Erro ao gerar perguntas IA:', err);
      alert('Não foi possível gerar perguntas automáticas.');
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleDeleteTarefa = async (tarefaId) => {
    if (!window.confirm(`Deseja realmente excluir a tarefa "${tarefaId}"?`)) return;
    try {
      await deletarAtividade(agentId, tarefaId);
      const resT = await getTarefas(agentId);
      setTarefas(resT.tarefas || []);
      alert(`Tarefa "${tarefaId}" excluída com sucesso!`);
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
      alert('Erro ao excluir tarefa.');
    }
  };

  // edição de questões em questions state
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
    if (Number(updated[qIdx].resposta) >= updated[qIdx].alternativas.length) updated[qIdx].resposta = '';
    setQuestions(updated);
  };

  const removeQuestionAt = (idx) => {
    setQuestions(prev => prev.filter((_,i)=>i!==idx));
  };

  // salva novas perguntas como tarefa
  const handleCreateTarefa = async () => {
    // monta o payload igual para criar ou editar
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
      // agora: se estiver editando, usa PUT
      if (editingTarefaId) {
        await editarAtividade(agentId, editingTarefaId, payload);
      } else {
        await criarAtividade(agentId, payload);
      }

      // recarrega tarefas após criar ou editar
      const resT = await getTarefas(agentId);
      setTarefas(resT.tarefas || []);

      // reseta o formulário e volta para a lista
      setQuestions(null);
      setNomeTarefa('');
      setEditingTarefaId(null);

      alert(editingTarefaId
        ? 'Tarefa atualizada com sucesso!'
        : 'Tarefa criada com sucesso!'
      );
    } catch (err) {
      console.error('Erro ao salvar tarefa:', err);
      alert('Erro ao salvar tarefa.');
    }
  };

  // loading agente
  if (agente === null) {
    return (
      <div className="page-container">
        <p>Carregando...</p>
      </div>
    );
  }

  // modo professor: lista de tarefas ou botão criar (só mostra se questions for null)
  if (questions === null) {
    return (
      <div className="page-container">
        <h1 className="page-title">Tarefas de {agentId}</h1>
        {tarefas.length > 0 && (
          <div className="tarefa-lista">
            {tarefas.map(t => (
              <div key={t.tarefa_id} className="tarefa-item">
                <span>{t.tarefa_id}</span>
                <Button text="Ver Tarefa" onClick={() => loadTarefa(t)} />
                <button
                  type="button"
                  className="acao-botao excluir"
                  style={{ marginLeft: '8px' }}
                  onClick={() => handleDeleteTarefa(t.tarefa_id)}
                >
                  🗑️ Excluir
                </button>
              </div>
            ))}
          </div>
        )}
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
      </div>
    );
  }

  // modo criação/visualização: exibe APENAS o formulário de questions (sem lista de tarefas)
  return (
    <div className="page-container">
      <h1 className="page-title">
        {editingTarefaId ? `Editando: ${nomeTarefa}` : `Criar Tarefa para ${agentId}`}
      </h1>
      
      <div className="criar-atividade-form">
        {/* campo para o usuário dar um nome único à tarefa */}
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

        {/* blocos de ação de formulário: adicionar perguntas e salvar */}
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
    </div>
  );
}