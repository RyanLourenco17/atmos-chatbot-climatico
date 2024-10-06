import { useState } from 'react'; 
import { MicFill, Send } from 'react-bootstrap-icons';
import './Textarea.css';

const TextareaQuestion = ({ onNewMessage }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question) return;

    // Adiciona a pergunta ao histórico local
    onNewMessage({ type: 'question', text: question });

    setLoading(true);
    
    try {
      // Faz a requisição POST para o backend
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

      // Adiciona a resposta ao histórico local
      onNewMessage({ type: 'answer', text: data.fulfillmentText });
    } catch (error) {
      console.error('Erro ao enviar a pergunta:', error);
    } finally {
      setLoading(false);
      setQuestion(''); // Limpa o input após envio
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



