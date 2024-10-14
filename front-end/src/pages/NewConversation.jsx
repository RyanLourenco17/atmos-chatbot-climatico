import { useNavigate } from 'react-router-dom';
import CardSugestion from "../components/CardSugestion/CardSugestion";
import MenuSide from "../components/Sidebar/MenuSide";
import TextareaQuestion from "../components/TextareaQuestion/TextareaQuestion";
import Loading from "../components/LoadingWave/Loading";
import './NewConversation.css';

const NewConversation = () => {
  const navigate = useNavigate();

  const handleSubmit = (consultaData) => {
    // Navega para a página da consulta após o envio
    navigate(`/consulta/consultationId`); // Use o ID da consulta retornada do servidor, se necessário
  };

  return (
    <div className="page-container">
      <MenuSide />
      <div className="content-container">
        <div className="interactive-area">
          <Loading />
          <CardSugestion />
          <TextareaQuestion onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default NewConversation;
