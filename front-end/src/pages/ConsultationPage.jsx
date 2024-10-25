import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MenuSide from '../components/Sidebar/MenuSide';
import TextareaQuestion from '../components/TextareaQuestion/TextareaQuestion';
import Loading from '../components/LoadingWave/Loading';
import mascoteImg from '../assets/Mascote.png';
import './ConsultationPage.css';

const ConsultationPage = () => {
  const { consultationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar as mensagens da consulta
  const fetchMessages = async (id) => {
    try {
      const response = await fetch(`https://atmos-chatbot-climatico-backend.onrender.com/api/dialogflow/consultas/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar mensagens');
      }

      const data = await response.json();
      setMessages(data.messages);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      setIsLoading(false);
    }
  };

  // Efeito para carregar mensagens ao montar o componente
  useEffect(() => {
    if (consultationId) {
      fetchMessages(consultationId);
    }
  }, [consultationId]);

  const handleNewQuestion = (newQuestion) => {
    // Adiciona a nova mensagem ao estado local
    const newMessage = { question: newQuestion, answer: 'Buscando resposta...' };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  return (
    <div className="page-container">
      <MenuSide />
      <div className="content-container">
        <div className="consultation-area">
          <div className="consultation-display scrollable-section">
            {isLoading ? (
              <Loading />
            ) : (
              messages.map((message, index) => (
                <div className="messages" key={index}>
                  <p className="question-text">{message.question}</p>
                  <div className="answer-wrapper">
                    <img src={mascoteImg} alt="Mascote" />
                    <p className="answer-text">{message.answer}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="interactive-area">
        <TextareaQuestion 
          onNewQuestion={handleNewQuestion} 
          isMessageMode={true} 
          consultationId={consultationId} 
          intent="Temperatura"
        />

        </div>
      </div>
    </div>
  );
};

export default ConsultationPage;
