import { useState } from 'react'; 
import { MicFill, Send } from 'react-bootstrap-icons';
import './Textarea.css';

const TextareaQuestion = ({ onNewMessage }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return; // Garante que a pergunta não está vazia
  
    onNewMessage({ type: 'question', text: question }); // Adiciona localmente
  
    setLoading(true);
  
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado.');
  
      const response = await fetch(`https://atmos-chatbot-climatico-backend.onrender.com/api/dialogflow/nova-consulta`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ text: question }),
      });
  
      if (!response.ok) {
        throw new Error('Erro ao enviar a mensagem');
      }
  
      const data = await response.json();
  
      if (data.fulfillmentText) {
        onNewMessage({ type: 'answer', text: data.fulfillmentText }); // Adiciona a resposta do backend
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao enviar a pergunta:', error);
    } finally {
      setLoading(false);
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



