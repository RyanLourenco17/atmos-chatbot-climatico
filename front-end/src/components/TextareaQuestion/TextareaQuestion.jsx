import { useState } from 'react';
import { MicFill, Send } from 'react-bootstrap-icons';
import './Textarea.css';

const TextareaQuestion = ({ onNewQuestion, onSubmit }) => {
  const [question, setQuestion] = useState('');

  const handleInputChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (question.trim() === '') {
      alert('Por favor, insira uma pergunta.');
      return;
    }

    try {
      const response = await fetch('https://atmos-chatbot-climatico-backend.onrender.com/api/dialogflow/nova-consulta', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queryResult: {
            intent: { displayName: 'Temperatura' },  // Ajuste se necessário
            parameters: { 'Cidade': question }
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer a consulta');
      }

      const data = await response.json();
      console.log('Resposta do servidor:', data);

      // Adiciona a nova pergunta à interface
      onNewQuestion(question);

      // Limpa o campo de pergunta
      setQuestion('');

      // Navega para a página da consulta após o sucesso da requisição
      if (onSubmit) {
        onSubmit(data); // Passa os dados da consulta
      }

    } catch (error) {
      console.error('Erro ao enviar a pergunta:', error);
    }
  };

  return (
    <form className="componentTextarea" onSubmit={handleSubmit}>
      <div className="input-text">
        <input 
          type="text" 
          placeholder="Faça aqui sua consulta do clima" 
          value={question} 
          onChange={handleInputChange} 
        />
        <MicFill className="icon" />
      </div>
      <button className="btn-send" type="submit">
        <Send className="icon" />
      </button>
    </form>
  );
};

export default TextareaQuestion;
