const API_BASE_URL = 'backend'; // atualiza se precisar

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
  