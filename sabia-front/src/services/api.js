const API_BASE_URL = 'http://54.197.170.229:8080'; // atualiza se precisar

export const listarAgentes = async () => {

  const response = await fetch(`${API_BASE_URL}/agentes`);
  if (!response.ok) {
    throw new Error('Erro ao listar agentes');
  }
  return response.json();

};

export const criarAgente = async (nomeAgente, pdfFile) => {
  const formData = new FormData();
  formData.append('pdf', pdfFile);

  const response = await fetch(`${API_BASE_URL}/agentes/${encodeURIComponent(nomeAgente)}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Erro ao criar agente');
  }
  return response.json();
};

export const deletarAgente = async (nomeAgente) => {
  const response = await fetch(`${API_BASE_URL}/agentes/${encodeURIComponent(nomeAgente)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Erro ao deletar agente');
  }
  return response.json();
};

export const editarAgente = async (nomeAntigo, nomeNovo) => {
  const response = await fetch(`${API_BASE_URL}/agentes/${encodeURIComponent(nomeAntigo)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ novo_nome: nomeNovo }),
  });

  if (!response.ok) {
    throw new Error('Erro ao editar agente');
  }
  return response.json();
};

export const perguntarAgente = async (nomeAgente, pergunta) => {
    const response = await fetch(`${API_BASE_URL}/perguntar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agente: nomeAgente,
        pergunta: pergunta,
      }),
    });
  
    if (!response.ok) {
      throw new Error('Erro ao perguntar para agente');
    }
  
    return response.json();
  };
  
  export const getAgenteDetalhes = async (agentId) => {

  const response = await fetch(
    `${API_BASE_URL}/tarefas/${encodeURIComponent(agentId)}`
  );
  if (!response.ok) {
    throw new Error('Erro ao carregar detalhes do agente');
  }
  return response.json();
};

/**
 * Cria uma nova atividade para um agente específico
 * @param {string} agentId 
 * @param {{titulo: string, descricao: string, data: string}} dados 
 */
export const criarAtividade = async (agentId, dados) => {
  const response = await fetch(
    `${API_BASE_URL}/tarefas/${encodeURIComponent(agentId)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    }
  );
  if (!response.ok) {
    throw new Error('Erro ao criar atividade');
  }
  return response.json();
};

export const getTarefas = async (agentId) => {
  const res = await fetch(`${API_BASE_URL}/tarefas/${encodeURIComponent(agentId)}`);
  if (!res.ok) throw new Error('Erro ao listar tarefas');
  return res.json();
};

/**
 * Atualiza uma tarefa existente para um agente
 */
export const editarAtividade = async (agentId, tarefaId, dados) => {
  const response = await fetch(
    `${API_BASE_URL}/tarefas/${encodeURIComponent(agentId)}/${encodeURIComponent(tarefaId)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    }
  );
  if (!response.ok) {
    throw new Error('Erro ao editar atividade');
  }
  return response.json();
};

/**
 * Remove uma tarefa de um agente
 */
export const deletarAtividade = async (agentId, tarefaId) => {
  const response = await fetch(
    `${API_BASE_URL}/tarefas/${encodeURIComponent(agentId)}/${encodeURIComponent(tarefaId)}`,
    {
      method: 'DELETE',
    }
  );
  if (!response.ok) {
    throw new Error('Erro ao deletar atividade');
  }
  return response.json();
};

/**
 * Gera perguntas automaticamente a partir do agente
 * @param {string} agentId
 * @returns {{perguntas: Array<{pergunta:string, alternativas:object, resposta:string}>}}
 */
export const gerarPerguntasIA = async (agentId) => {
  const response = await fetch(
    `${API_BASE_URL}/perguntas/${encodeURIComponent(agentId)}`
  );
  if (!response.ok) {
    throw new Error('Erro ao gerar perguntas IA');
  }
  return response.json();
};
