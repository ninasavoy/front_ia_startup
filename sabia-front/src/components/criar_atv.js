import React, { useState } from 'react';
import '../css/criar_atv.css';

export default function CriarATV({ onCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const newActivity = {
      id: Date.now(), // Temporary ID, replace with backend ID after creating
      title,
      description,
      dueDate,
    };

    // Call the onCreate function from parent component
    onCreate(newActivity);

    // Reset fields
    setTitle('');
    setDescription('');
    setDueDate('');
  };

  return (
    <form className="activity-form" onSubmit={handleSubmit}>
      <h2>Criar Nova Atividade</h2>

      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="activity-input"
      />

      <textarea
        placeholder="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className="activity-textarea"
      />

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        required
        className="activity-input"
      />

      <button type="submit" className="activity-button">
        Criar Atividade
      </button>
    </form>
  );
}
