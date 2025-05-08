import React, { useState, useEffect, useRef } from 'react';
import { listarAgentes, perguntarAgente } from '../services/api';
import '../pages/css/ainicial.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AInicial() {
  const [agentes, setAgentes] = useState([]);
  const [agenteSelecionado, setAgenteSelecionado] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [conversa, setConversa] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const carregarAgentes = async () => {
    try {
      const resposta = await listarAgentes();
      setAgentes(resposta.agentes || []);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar agentes.');
    }
  };

  useEffect(() => {
    carregarAgentes();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversa]);

  const handleEnviarMensagem = async (e) => {
    e.preventDefault();
    if (!mensagem.trim()) return;

    const novaConversa = [...conversa, { autor: 'usuario', texto: mensagem }];
    setConversa(novaConversa);
    setMensagem('');

    try {
      setLoading(true);
      setConversa(prev => [...prev, { autor: 'bot', texto: 'digitando...' }]); // Mensagem especial "digitando..."

      const resposta = await perguntarAgente(agenteSelecionado, mensagem);

      setConversa(prev => [
        ...prev.slice(0, -1), // Remove o "digitando..."
        { autor: 'bot', texto: resposta.resposta }
      ]);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar pergunta.');
      setConversa(prev => [...prev.slice(0, -1)]);
    } finally {
      setLoading(false);
    }
  };

  const voltarEscolherAgente = () => {
    setAgenteSelecionado('');
    setConversa([]);
    setMensagem('');
  };

  if (!agenteSelecionado) {
    return (
      <div className="page-container">
        <h1 className="page-title">Escolha um Agente</h1>
        <div className="agentes-lista">
          {agentes.map((agente, index) => (
            <button
              key={index}
              className="agente-button"
              onClick={() => setAgenteSelecionado(agente.agent_id)}
            >
              {agente.agent_id}
            </button>
          ))}
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Conversando com {agenteSelecionado}</h1>
      <div className="chat-container" ref={chatContainerRef}>
        {conversa.map((msg, index) => (
          <div
            key={index}
            className={`chat-balao ${msg.autor === 'usuario' ? 'usuario' : (msg.texto === 'digitando...' ? 'digitando' : 'bot')}`}
          >
            {msg.texto === 'digitando...' ? (
            <div className="typing-indicator">
                <span></span><span></span><span></span>
            </div>
            ) : (
            msg.autor === 'bot' ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.texto}
                </ReactMarkdown>
            ) : (
                msg.texto
            )
            )}
          </div>
        ))}
      </div>
      <form className="chat-form" onSubmit={handleEnviarMensagem}>
        <input
          type="text"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Digite sua pergunta..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>

      <button className="voltar-button" onClick={voltarEscolherAgente}>⮌ Voltar</button>

      <ToastContainer />
    </div>
  );
}
