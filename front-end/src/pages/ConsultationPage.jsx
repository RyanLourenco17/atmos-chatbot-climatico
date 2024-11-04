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
  const [isQuestionLoading, setIsQuestionLoading] = useState(false); // Estado para o loading da pergunta

  // Função para buscar mensagens da consulta ao carregar a página
  const fetchMessages = async (consultationId) => {
    try {
      const response = await fetch(`https://atmos-chatbot-climatico-backend.onrender.com/api/dialogflow/consultas/${consultationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Erro ao buscar mensagens');
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (consultationId) {
      fetchMessages(consultationId);
    }
  }, [consultationId]);

  const handleNewQuestion = async (question) => {
    // Adiciona a pergunta na interface e ativa o loading enquanto aguarda a resposta
    setMessages((prevMessages) => [...prevMessages, { question, answer: null }]);
    setIsQuestionLoading(true);
  
    try {
      const response = await fetch(`https://atmos-chatbot-climatico-backend.onrender.com/api/dialogflow/adicionar-mensagem/${consultationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          question,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        // Atualiza a última mensagem com a resposta recebida
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, prevMessages.length - 1),
          { question, answer: data.fulfillmentText }
        ]);
      } else {
        console.error('Erro ao adicionar mensagem:', data.error);
      }
    } catch (error) {
      console.error('Erro ao processar a solicitação:', error);
    } finally {
      setIsQuestionLoading(false); // Desativa o loading da pergunta
    }
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
                    {message.answer ? (
                      <p className="answer-text">{message.answer}</p>
                    ) : (
                      <Loading /> // Exibe o componente de loading enquanto a resposta não chega
                    )}
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
            apiRoute={`adicionar-mensagem/${consultationId}`} 
          />
        </div>
      </div>
    </div>
  );
};

export default ConsultationPage;
