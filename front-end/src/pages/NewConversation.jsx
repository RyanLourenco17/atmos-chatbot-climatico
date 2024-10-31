import { useNavigate } from 'react-router-dom';
import CardSugestion from "../components/CardSugestion/CardSugestion";
import MenuSide from "../components/Sidebar/MenuSide";
import TextareaQuestion from "../components/TextareaQuestion/TextareaQuestion";
import Loading from "../components/LoadingWave/Loading";
import './NewConversation.css';

const NewConversation = () => {
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const response = await fetch('https://atmos-chatbot-climatico-backend.onrender.com/api/dialogflow/consultar-dialogflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId: localStorage.getItem('userId') }),
      });

      const data = await response.json();
      navigate(`/consulta/${data.consultationId}`);
    } catch (error) {
      console.error('Erro ao criar nova consulta:', error);
    }
  };

  return (
    <div className="page-container">
      <MenuSide />
      <div className="content-container">
        <div className="interactive-area">
          <Loading />
          <CardSugestion />
          <TextareaQuestion
            onNewQuestion={handleSubmit}
            isMessageMode={false} 
            apiRoute="consultar-dialogflow"
          />
        </div>
      </div>
    </div>
  );
};

export default NewConversation;
