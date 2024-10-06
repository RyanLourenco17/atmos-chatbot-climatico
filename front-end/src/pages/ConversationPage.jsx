import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MenuSide from "../components/Sidebar/MenuSide";
import TextareaQuestion from "../components/TextareaQuestion/TextareaQuestion";
import mascoteImg from '../assets/Mascote.png';
import './ConversationPage.css';

const ConversationPage = () => {
  const { id } = useParams(); // Pega o ID da conversa
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook para navegar entre as páginas

  // Busca a conversa existente ao carregar a página
  useEffect(() => {
    // Verifica e ajusta o token
const fetchConversation = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token não encontrado.');

    const response = await fetch(`https://atmos-chatbot-climatico-backend.onrender.com/api/dialogflow/conversas/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar a conversa');
    }

    const data = await response.json();
    if (!Array.isArray(data.messages)) throw new Error('Formato de dados inválido');
    setConversations(data.messages); // Certifica-se que "messages" é um array
  } catch (error) {
    console.error('Erro ao buscar a conversa:', error);
    navigate('/nova-conversa'); // Redireciona em caso de erro
  } finally {
    setLoading(false);
  }
};


    fetchConversation();
  }, [id, navigate]);

  // Função para adicionar novas mensagens (resposta do backend)
  const addNewMessage = (message) => {
    setConversations([...conversations, message]);
  };

  return (
    <div className="page-container">
      <MenuSide />
      <div className="content-container">
        <div className="conversation-area">
          <div className="conversation-display">
            {conversations.map((conversation, index) => (
              <div 
                key={index} 
                className={conversation.type === 'question' ? 'question' : 'answer'}
              >
                {conversation.type === 'question' ? (
                  <p className="question-text">{conversation.text}</p>
                ) : (
                  <div className="answer-wrapper">
                    <img src={mascoteImg} alt="Mascote" />
                    <p className="answer-text">{conversation.text}</p>
                  </div>
                )}
              </div>
            ))}

            {loading && <div className="loading">Carregando...</div>}
          </div>

          <div className="interactive-area">
            <TextareaQuestion onNewMessage={addNewMessage} conversationId={id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;

