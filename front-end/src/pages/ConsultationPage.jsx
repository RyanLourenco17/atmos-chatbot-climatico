import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './ConsultationPage.css'; // Estilos para a página
import MenuSide from '../components/Sidebar/MenuSide';
import TextareaQuestion from '../components/TextareaQuestion/TextareaQuestion';

import mascoteImg from '../assets/Mascote.png';

const ConsultationPage = () => {
  const { consultationId } = useParams(); 
  const [messages, setMessages] = useState([]); // Estado para armazenar mensagens
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar as mensagens da consulta específica
  const fetchMessages = async (id) => {
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
      setMessages(data.messages); // Armazena mensagens no estado
      setIsLoading(false); // Atualiza o estado de loading
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      setIsLoading(false); // Atualiza o estado de loading
    }
  };

  useEffect(() => {
    console.log('ID da consulta:', consultationId); // Log do ID
    if (consultationId) {
      fetchMessages(consultationId);
    } else {
      console.error('ID da consulta não está definido');
    }
  }, [consultationId]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="page-container">
      <MenuSide />
      <div className="content-container">
        <div className="consultation-area">
          <div className="consultation-display">
            {messages.map((message, index) => (
              <div className='messages' key={index}>
                <p className="question-text"><strong>Pergunta:</strong> {message.question}</p>
                <div className="answer-wrapper">
                  <img src={mascoteImg} alt="Mascote" />
                  <p className="answer-text"><strong>Resposta:</strong> {message.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="interactive-area">
          <TextareaQuestion />
        </div>
      </div>
    </div> 
  );
};

export default ConsultationPage;
