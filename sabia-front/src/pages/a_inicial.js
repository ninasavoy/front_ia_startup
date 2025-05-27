import React, { useState, useEffect, useRef } from 'react';
import { listarAgentes, getTarefas, perguntarTarefa } from '../services/api';
import '../pages/css/ainicial.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AInicial() {
  const [agentes, setAgentes] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [conversa, setConversa] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  const [userAnswers, setUserAnswers]   = useState({});    // { 0: 'a', 1: 'b', ... }
  const [quizResults, setQuizResults]   = useState(null);  // [{ isCorrect, correctAnswer }, ...]

  // 1) carrega lista de aulas (agentes)
  useEffect(() => {
    (async () => {
      try {
        const res = await listarAgentes();
        setAgentes(res.agentes || []);
      } catch (e) {
        console.error(e);
        toast.error('Erro ao carregar aulas.');
      }
    })();
  }, []);

  // 2) quando escolher uma aula, busca as tarefas
  useEffect(() => {
    if (!selectedAgent) return;
    (async () => {
      try {
        const res = await getTarefas(selectedAgent);
        setTarefas(res.tarefas || []);
      } catch (e) {
        console.error(e);
        toast.error('Erro ao carregar tarefas.');
      }
    })();
  }, [selectedAgent]);

  // scroll automático do chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [conversa]);

  // envia mensagem pro chat da tarefa
  const handleEnviar = async e => {
    e.preventDefault();
    if (!mensagem.trim()) return;
    const userMsg = { autor:'usuario', texto: mensagem };
    setConversa(prev => [...prev, userMsg]);
    setMensagem('');
    try {
      setLoading(true);
      setConversa(prev => [...prev, { autor:'bot', texto:'digitando...' }]);
      const res = await perguntarTarefa(selectedTask.id, mensagem);
      setConversa(prev => [
        ...prev.slice(0,-1),
        { autor:'bot', texto: res.resposta }
      ]);
    } catch {
      setConversa(prev => prev.slice(0,-1));
      toast.error('Erro no chat.');
    } finally {
      setLoading(false);
    }
  };

  // reset para escolher outra aula
  const voltarAula = () => {
    setSelectedAgent('');
    setTarefas([]);
    setSelectedTask(null);
    setConversa([]);
  };

  // reset para escolher outra tarefa
  const voltarTarefa = () => {
    setSelectedTask(null);
    setConversa([]);
  };

  // Handler quando aluno escolhe uma alternativa
  const handleAnswerChange = (qIdx, alternativaKey) => {
    setUserAnswers(prev => ({ ...prev, [qIdx]: alternativaKey }));
  };

  // Handler de envio das respostas do quiz
  const handleSubmitQuiz = () => {
    if (!selectedTask) return;
    const results = selectedTask.perguntas.map((q, idx) => ({
      isCorrect: userAnswers[idx] === q.resposta,
      correctAnswer: q.resposta
    }));
    setQuizResults(results);
  };

  // 1) Tela de escolha de aula
  if (!selectedAgent) {
    return (
      <div className="page-container">
        <h1 className="page-title">Escolha uma Aula</h1>
        <div className="agentes-lista">
          {agentes.map((a, i) => (
            <button
              key={i}
              className="agente-button"
              onClick={() => setSelectedAgent(a.agent_id)}
            >
              {a.agent_id}
            </button>
          ))}
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    );
  }

  // 2) Tela de escolha de tarefa
  if (!selectedTask) {
    return (
      <div className="page-container">
        <h1 className="page-title">Tarefas de {selectedAgent}</h1>
        <div className="agentes-lista">
          {tarefas.map((t, i) => (
            <button
              key={i}
              className="agente-button"
              onClick={() => setSelectedTask(t)}
            >
              {t.tarefa_id}
            </button>
          ))}
        </div>
        <button className="voltar-button" onClick={voltarAula}>
          ⮌ Voltar para Aulas
        </button>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    );
  }

  // 3) Tela de responder tarefa + chat
  return (
    <div className="page-container split">
      {/* Coluna das Perguntas */}
      <div className="quiz-panel">
        <h2>Tarefa: {selectedTask.tarefa_id}</h2>

        {/* Score (opcional) */}
        {quizResults && (
          <p className="score">
            Você acertou{' '}
            {quizResults.filter(r => r.isCorrect).length} de{' '}
            {quizResults.length}
          </p>
        )}

        {selectedTask.perguntas.map((q, idx) => {
          const result = quizResults ? quizResults[idx] : null;
          return (
            <div
              key={idx}
              className={
                'question-block ' +
                (result
                  ? result.isCorrect
                    ? 'correct'
                    : 'incorrect'
                  : '')
              }
            >
              <p>
                <strong>Pergunta {idx + 1}:</strong> {q.pergunta}
              </p>
              <ul>
                {Object.entries(q.alternativas).map(([key, alt]) => (
                  <li key={key}>
                    <label>
                      <input
                        type="radio"
                        name={`q${idx}`}
                        value={key}
                        disabled={!!quizResults}
                        checked={userAnswers[idx] === key}
                        onChange={() => handleAnswerChange(idx, key)}
                      />
                      {alt}
                    </label>
                  </li>
                ))}
              </ul>
              {result && (
                <div className="feedback">
                  {result.isCorrect ? (
                    <span className="feedback-correct">✔️ Acertou!</span>
                  ) : (
                    <span className="feedback-incorrect">
                      ❌ A resposta correta é “
                      {result.correctAnswer.toUpperCase()}”
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <button
          className="submit-btn"
          onClick={handleSubmitQuiz}
          disabled={!!quizResults}
        >
          Enviar Respostas
        </button>
        <button className="voltar-button" onClick={voltarTarefa}>
          ⮌ Voltar para Tarefas
        </button>
      </div>

      {/* Coluna do Chat */}
      <div className="chat-panel">
        <h2>Chat de Dúvidas</h2>
        <div className="chat-container" ref={chatRef}>
          {conversa.map((m, i) => (
            <div
              key={i}
              className={`chat-balao ${
                m.autor === 'usuario'
                  ? 'usuario'
                  : m.texto === 'digitando...'
                  ? 'digitando'
                  : 'bot'
              }`}
            >
              {m.texto === 'digitando...' ? (
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              ) : m.autor === 'bot' ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.texto}
                </ReactMarkdown>
              ) : (
                m.texto
              )}
            </div>
          ))}
        </div>
        <form className="chat-form" onSubmit={handleEnviar}>
          <input
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            placeholder="Tire sua dúvida..."
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar'}
          </button>
        </form>
        <button className="voltar-button" onClick={voltarAula}>
          ⮌ Voltar para Aulas
        </button>
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
