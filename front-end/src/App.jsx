import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

// Pages
import NewConversation from './pages/NewConversation';
import LoginOrRegister from './pages/Login-Or-Register/LoginOrRegister';



function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/nova-conversa' element={<NewConversation />}/>
        <Route path='/' element={<LoginOrRegister />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
