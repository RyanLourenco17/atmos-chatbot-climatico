import { useState } from 'react';
import { MicFill, Send } from 'react-bootstrap-icons';
import './Textarea.css';

const TextareaQuestion = ({ onNewQuestion, onSubmit, isMessageMode, consultationId, intent }) => {
  const [question, setQuestion] = useState('');

  const handleInputChange = (e) => {
    setQuestion(e.target.value);
  };

  const extractCityFromQuestion = (question) => {
    const match = question.match(/em\s+([a-zA-Z\s]+)/i);
    return match ? match[1].trim() : question; // Retorna a cidade ou a pergunta original
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (question.trim() === '') {
      alert('Por favor, insira uma pergunta.');
      return;
    }
  
    // Extrai a cidade da pergunta
    const city = extractCityFromQuestion(question);
  
    try {
      let url = 'https://atmos-chatbot-climatico-backend.onrender.com/api/dialogflow/nova-consulta';
      const bodyContent = {
        queryResult: {
          queryText: question,
          intent: { displayName: intent},
          parameters: { Cidade: city }
        }
      };
  
      if (isMessageMode && consultationId) {
        url = `https://atmos-chatbot-climatico-backend.onrender.com/api/dialogflow/adicionar-mensagem/${consultationId}`;
      }
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyContent),
      });
  
      if (!response.ok) {
        throw new Error('Erro ao enviar consulta ou mensagem');
      }
  
      const data = await response.json();
      console.log('Resposta do servidor:', data);
  
      // Adiciona a nova pergunta à interface
      onNewQuestion(question);
      setQuestion(''); // Limpa o campo de pergunta
  
      // Navega para a página da consulta após o sucesso da requisição, se necessário
      if (onSubmit) {
        onSubmit(data);
      }
  
    } catch (error) {
      console.error('Erro ao enviar pergunta:', error);
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
