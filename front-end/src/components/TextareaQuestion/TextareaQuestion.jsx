import { MicFill, Send } from 'react-bootstrap-icons';
import './Textarea.css';

const TextareaQuestion = () => {
  return (
    <form className="componentTextarea">
      <div className="input-text">
        <input type="text" placeholder="Faça aqui sua consulta do clima" />
        <MicFill className="icon" />
      </div>
      <button className="btn-send">
        <Send className="icon" />
      </button>
    </form>
  );
}

export default TextareaQuestion;
