import { useState } from 'react';
import { MicFill, Send } from 'react-bootstrap-icons';
import './Textarea.css';

const TextareaQuestion = ({ onNewQuestion, isMessageMode, consultationId, apiRoute }) => {
  const [question, setQuestion] = useState('');

  const handleInputChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    onNewQuestion(question); // Adiciona a nova pergunta à interface

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
        console.log('Resposta do Dialogflow:', data.fulfillmentText);
      } else {
        console.error('Erro ao consultar o Dialogflow:', data.error);
      }
    } catch (error) {
      console.error('Erro ao processar a solicitação:', error);
    } finally {
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
        <MicFill className="icon" />
      </div>
      <button className="btn-send" type="submit" disabled={!question.trim()}>
        <Send className="icon" />
      </button>
    </form>
  );
};

export default TextareaQuestion;
