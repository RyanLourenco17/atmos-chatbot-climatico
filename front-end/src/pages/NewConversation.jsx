import CardSugestion from "../components/CardSugestion/CardSugestion";
import MenuSide from "../components/Sidebar/MenuSide";
import TextareaQuestion from "../components/TextareaQuestion/TextareaQuestion";
import './NewConversation.css';

const NewConversation = () => {
  return (
    <div className="page-container">
      <MenuSide />
      <div className="content-container">
        <div className="interactive-area">
          <CardSugestion />
          <TextareaQuestion />
        </div>
      </div>
    </div>
  );
}

export default NewConversation;

