import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/css/botao.css';

function Button({ text, to, onClick }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  return (
    <button className="my-button" onClick={handleClick}>
      {text}
    </button>
  );
}

export default Button;
