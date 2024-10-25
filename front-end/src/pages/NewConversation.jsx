import { useNavigate } from 'react-router-dom';
import CardSugestion from "../components/CardSugestion/CardSugestion";
import MenuSide from "../components/Sidebar/MenuSide";
import TextareaQuestion from "../components/TextareaQuestion/TextareaQuestion";
import Loading from "../components/LoadingWave/Loading";
import './NewConversation.css';

const NewConversation = () => {
  const navigate = useNavigate();

  const handleSubmit = (consultaData) => {
    navigate(`/consulta/${consultaData.consultationId}`);
  };

  const handleNewQuestion = (newQuestion) => {
    const newMessage = {
      question: newQuestion,
      answer: 'Buscando resposta...'
    };
  };

  return (
    <div className="page-container">
      <MenuSide />
      <div className="content-container">
        <div className="interactive-area">
          <Loading />
          <CardSugestion />
          <TextareaQuestion 
            onSubmit={handleSubmit} 
            isMessageMode={false} 
            onNewQuestion={handleNewQuestion}
          />

        </div>
      </div>
    </div>
  );
};

export default NewConversation;
