import { useState } from 'react';
import { Send } from 'react-bootstrap-icons';

import './Textarea.css';

const TextareaQuestion = ({ onNewQuestion, isMessageMode, consultationId, apiRoute }) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado para controle de carregamento

  const handleInputChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true); // Ativa o estado de carregamento

    try {
      const response = await fetch(`https://atmos-chatbot-climatico-backend.onrender.com/api/dialogflow/${apiRoute}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          question,
          ...(isMessageMode ? { consultationId } : {}),
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        if (isMessageMode) {
          onNewQuestion(question); // Caso de mensagem em conversa existente
        } else {
          onNewQuestion(data.consultationId); // Caso de nova conversa
        }
      } else {
        console.error('Erro ao consultar o Dialogflow:', data.error);
      }
    } catch (error) {
      console.error('Erro ao processar a solicitação:', error);
    } finally {
      setIsLoading(false); // Desativa o estado de carregamento
      setQuestion(''); 
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
      </div>
      <button className="btn-send" type="submit" disabled={!question.trim() || isLoading}>
        <Send className="icon" />
      </button>
    </form>
  );
};

export default TextareaQuestion;
