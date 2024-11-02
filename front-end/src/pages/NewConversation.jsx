import { useNavigate } from 'react-router-dom';
import CardSugestion from "../components/CardSugestion/CardSugestion";
import MenuSide from "../components/Sidebar/MenuSide";
import TextareaQuestion from "../components/TextareaQuestion/TextareaQuestion";
import Loading from "../components/LoadingWave/Loading";
import './NewConversation.css';

const NewConversation = () => {
  const navigate = useNavigate();

  // Recebe consultationId e navega para a página correta
  const handleSubmit = (consultationId) => {
    if (consultationId) {
      navigate(`/consulta/${consultationId}`);
    } else {
      console.error("Consulta ID não foi retornado");
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
            onNewQuestion={handleSubmit} // Passa a função handleSubmit
            isMessageMode={false}
            apiRoute="consultar-dialogflow"
          />
        </div>
      </div>
    </div>
  );
};

export default NewConversation;
