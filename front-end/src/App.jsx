import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Pages
import NewConversation from './pages/NewConversation';
import LoginOrRegister from './pages/Login-Or-Register/LoginOrRegister';
import ConsultationPage from './pages/ConsultationPage';

function App() {
  const applyTheme = (theme) => {
    if (theme === 'light') {
      document.body.classList.add('light_theme');
    } else {
      document.body.classList.remove('light_theme');
    }
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'default';
    applyTheme(storedTheme);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/nova-consulta' element={<NewConversation />} />
        <Route path='/' element={<LoginOrRegister />} />
        <Route path='/consulta/:consultationId' element={<ConsultationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

