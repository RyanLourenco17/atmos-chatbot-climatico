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
      // Requisição para consultar o Dialogflow ou adicionar mensagem
      const response = await fetch(`https://atmos-chatbot-climatico-backend.onrender.com/api/dialogflow/${apiRoute}`, {
        method: isMessageMode ? 'POST' : 'POST', // Método POST para ambas as operações
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          question,
          ...(isMessageMode ? { consultationId } : {}), // Adiciona consultationId se for adicionar mensagem
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Resposta do Dialogflow:', data.fulfillmentText);
        // Aqui você pode adicionar lógica para exibir a resposta na interface
      } else {
        console.error('Erro ao consultar o Dialogflow:', data.error);
      }

    } catch (error) {
      console.error('Erro ao processar a solicitação:', error);
    } finally {
      setQuestion(''); // Limpa o campo de input
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
