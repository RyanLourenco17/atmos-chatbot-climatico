import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Pages
import NewConversation from './pages/NewConversation';
import LoginOrRegister from './pages/Login-Or-Register/LoginOrRegister';
import ConversationPage from './pages/ConversationPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/nova-conversa' element={<NewConversation />} />
        <Route path='/' element={<LoginOrRegister />} />
        <Route path='/conversa/:id' element={<ConversationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

