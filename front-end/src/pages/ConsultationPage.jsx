import { useEffect, useState } from 'react';
import { useParams} from 'react-router-dom';
import './ConsultationPage.css'; // Estilos para a página

const ConsultationPage = () => {
  const { id } = useParams(); 
  const [messages, setMessages] = useState([]); // Estado para armazenar mensagens
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar as mensagens da consulta específica
  const fetchMessages = async () => {
    try {
        const response = await fetch(`https://atmos-chatbot-climatico-backend.onrender.com/api/dialogflow/consultas/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao buscar mensagens');
        }
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
    }
};


  useEffect(() => {
    if (id) {
      fetchMessages(); // Chamar a função apenas se o ID estiver definido
    } else {
      console.error('ID da consulta não está definido');
    }
  }, [id]); // Dependência no ID para refazer a requisição quando o ID mudar

  return (
    <div className="consultation-page">
      <h2>Mensagens da Consulta</h2>
      {isLoading ? (
        <p>Carregando mensagens...</p>
      ) : (
        messages.length > 0 ? (
          <ul>
            {messages.map((message, index) => (
              <li key={index}>
                <strong>Pergunta:</strong> {message.question}<br />
                <strong>Resposta:</strong> {message.answer}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma mensagem disponível</p>
        )
      )}
    </div>
  );
};

export default ConsultationPage;
