import { useState } from 'react'; 
import { MicFill, Send } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import './Textarea.css';

const TextareaQuestion = ({ onNewMessage, conversationId }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook para navegar entre as páginas

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question) return;

    // Adiciona a pergunta ao histórico local
    onNewMessage({ type: 'question', text: question });
    
    setLoading(true);
    
    try {
      // Faz a requisição POST https://atmos-chatbot-climatico-backend.onrender.com/api/dialogflow/Dialogflow
      const response = await fetch(`https://atmos-chatbot-climatico-backend.onrender.com/api/dialogflow/Dialogflow`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ text: question }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar a mensagem');
      }

      const data = await response.json();

      // Adiciona a resposta do backend ao histórico de conversas
      onNewMessage({ type: 'answer', text: data.fulfillmentText });

      // Navega para a página de conversa após enviar a mensagem
      navigate(`/conversa/${conversationId}`);
    } catch (error) {
      console.error('Erro ao enviar a pergunta:', error);
    } finally {
      setLoading(false);
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
          onChange={(e) => setQuestion(e.target.value)} 
        />
        <MicFill className="icon" />
      </div>
      <button className="btn-send" disabled={loading}>
        <Send className="icon" />
      </button>
    </form>
  );
};

export default TextareaQuestion;


