import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css'

// Pages
import NewConversation from './pages/NewConversation';



function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<NewConversation />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
