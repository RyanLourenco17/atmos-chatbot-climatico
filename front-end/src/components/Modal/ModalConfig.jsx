import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Loading from '../LoadingWave/Loading';

import './Modal.css';

const ModalConfig = ({ show, handleClose }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState('light');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    setToken(storedToken);
    setUserId(storedUserId);

    const fetchUserData = async () => {
      setIsLoading(true); 
      try {
        const response = await fetch(`https://atmos-chatbot-climatico-backend.onrender.com/api/user/${storedUserId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUsername(data.user.name);
          setEmail(data.user.email);
          setTheme(data.user.theme);
          setPassword('');
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (show) {
      fetchUserData(); 
    }
  }, [show, token]);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light_theme');
    } else {
      document.body.classList.remove('light_theme');
    }
  }, [theme]);

  const handleSave = async () => {
    try {
      const response = await fetch(`https://atmos-chatbot-climatico-backend.onrender.com/api/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: username,
          email: email,
          theme: theme,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Dados atualizados com sucesso!');
      } else {
        console.error(data.error);
        alert('Erro ao atualizar dados.');
      }
    } catch (error) {
      console.error("Erro ao atualizar os dados:", error);
      alert("Erro ao atualizar os dados.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`https://atmos-chatbot-climatico-backend.onrender.com/api/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        localStorage.clear();
        navigate('/');
      } else {
        const data = await response.json();
        console.error(data.error);
        alert('Erro ao deletar conta.');
      }
    } catch (error) {
      console.error("Erro ao deletar a conta:", error);
      alert("Erro ao deletar a conta.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Configurações de Conta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <Loading /> // Exibe o componente de loading enquanto carrega
        ) : (
          <Form>
            <Form.Group controlId="formUsername">
              <Form.Label>Nome de Usuário</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Atualize seu nome de usuário"
              />
            </Form.Group>

            <Form.Group controlId="formEmail" className="mt-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Atualize seu email"
              />
            </Form.Group>

            <Form.Group controlId="formTheme" className="mt-3">
              <Form.Label>Tema</Form.Label>
              <Form.Select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="default">Padrão</option>
                <option value="light">Claro</option>
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="formPassword" className="mt-3">
              <Form.Label>Senha</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Atualize sua senha"
              />
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button className='btn delete' onClick={handleDeleteAccount}>
          Deletar Conta
        </Button>
        <Button className='btn update' onClick={handleSave}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalConfig;
