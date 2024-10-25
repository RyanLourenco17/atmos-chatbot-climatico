import { useState } from 'react';
import { MicFill, Send } from 'react-bootstrap-icons';
import './Textarea.css';

const TextareaQuestion = ({ onNewQuestion, onSubmit, isMessageMode, consultationId }) => {
  const [question, setQuestion] = useState('');

  const handleInputChange = (e) => {
    setQuestion(e.target.value);
  };

  const intentKeywords = {
    "Temperatura": ["temperatura", "clima", "calor"],
    "PoluiçaoDoAr": ["poluição", "qualidade do ar"],
  };
  
  const identifyIntent = (question) => {
    const lowerCaseQuestion = question.toLowerCase();
    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      if (keywords.some(keyword => lowerCaseQuestion.includes(keyword))) {
        return { intent, parameters: extractCityFromQuestion(question) };
      }
    }
    return null;
  };
  

  // Função para extrair a cidade da pergunta
  const extractCityFromQuestion = (question) => {
    const match = question.match(/em\s+([a-zA-Z\s]+)/i);
    return match ? match[1].trim() : null; // Retorna a cidade ou null
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (question.trim() === '') {
      alert('Por favor, insira uma pergunta.');
      return;
    }

    const { intent, parameters } = identifyIntent(question);
    if (!intent) {
      alert('Desculpe, não consegui identificar a intenção da sua pergunta.');
      return;
    }

    const city = parameters || "default city"; // Use a cidade extraída ou um valor padrão
    const bodyContent = {
      queryResult: {
        intent: { displayName: intent },
        parameters: {
          Cidade: city,
        },
        queryText: question,
      },
    };

    try {
      const url = isMessageMode && consultationId
        ? `https://atmos-chatbot-climatico-backend.onrender.com/api/dialogflow/adicionar-mensagem/${consultationId}`
        : 'https://atmos-chatbot-climatico-backend.onrender.com/api/dialogflow/nova-consulta';

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
      setQuestion('');

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
