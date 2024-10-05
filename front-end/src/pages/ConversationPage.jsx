import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MenuSide from "../components/Sidebar/MenuSide";
import TextareaQuestion from "../components/TextareaQuestion/TextareaQuestion";
import mascoteImg from '../assets/Mascote.png';
import './ConversationPage.css';

const ConversationPage = () => {
  const { id } = useParams(); // Pega o ID da conversa
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Busca a conversa existente ao carregar a página
  useEffect(() => {
    const fetchConversation = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://atmos-chatbot-climatico-backend.onrender.com/api/conversations/${id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        setConversations(data.messages); // Supondo que "messages" seja o histórico de conversas
      } catch (error) {
        console.error('Erro ao buscar a conversa:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [id]);

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
              <div key={index} className={conversation.type === 'question' ? 'question' : 'answer'}>
                {conversation.type === 'question' ? (
                  <p>{conversation.text}</p>
                ) : (
                  <>
                    <img src={mascoteImg} alt="Mascote" />
                    <p>{conversation.text}</p>
                  </>
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


