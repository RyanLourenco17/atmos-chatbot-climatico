import { useState, useEffect } from 'react';
import { Tabs, Tab, Form, Button } from 'react-bootstrap';
import { validateEmail } from '../../validations/validateEmail';
import { validateRequired } from '../../validations/validateRequired';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/LoadingWave/Loading'
import './LoginOrRegister.css';

const LoginOrRegister = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState('login');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setKey((prevKey) => (prevKey === 'login' ? 'register' : 'login'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
  
    const emailError = validateEmail(loginForm.email);
    const passwordError = validateRequired(loginForm.password, 'Senha');
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
  
    setErrors(newErrors);
  
    
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
  
      try {
        const response = await fetch('https://atmos-chatbot-climatico-backend.onrender.com/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: loginForm.email,
            password: loginForm.password,
          }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setMessage(data.message);
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId);
          navigate('/nova-consulta');
        } else {
          setMessage(data.error);
        }
      } catch (error) {
        setMessage('Ocorreu um erro ao fazer login. Tente novamente mais tarde.');
        console.error('Erro ao fazer login:', error);
      }
  
      setIsLoading(false);
    }
  };
  
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    const nameError = validateRequired(registerForm.name, 'Nome');
    const emailError = validateEmail(registerForm.email);
    const passwordError = validateRequired(registerForm.password, 'Senha');
    if (nameError) newErrors.name = nameError;
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
  
    setErrors(newErrors);
  
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      
      try {
        const response = await fetch('https://atmos-chatbot-climatico-backend.onrender.com/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: registerForm.name,
            email: registerForm.email,
            password: registerForm.password,
          }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setMessage(data.message);
          localStorage.setItem('token', data.token);     // Armazena o token
          localStorage.setItem('userId', data.userId);   // Armazena o userId
          navigate('/nova-consulta');
        } else {
          setMessage(data.error);
        }
      } catch (error) {
        setMessage('Ocorreu um erro ao fazer o cadastro. Tente novamente mais tarde.');
        console.error('Erro ao fazer cadastro:', error);
      }
  
      setIsLoading(false);
    }
  };
  

  return (
    <>
      {isLoading ? (
        <div className="loading">
          <Loading/>
        </div>
      ) : (
        <div className="login-register-container">
          <Tabs
            id="login-register-tabs"
            activeKey={key}
            variant={'pill'}
            onSelect={(k) => setKey(k)}
            className="mb-5 custom-tabs justify-content-center"
          >
            {/* Login */}
            <Tab eventKey="login" title="ENTRAR" tabClassName="custom-tab">
              <Form className="custom-form" onSubmit={handleLoginSubmit}>
                <Form.Floating className="mb-3">
                  <Form.Control
                    id="formEmailLogin"
                    type="email"
                    className={`custom-input ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="Digite seu email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  />
                  <Form.Label className='label' htmlFor="formEmailLogin">Email</Form.Label>
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </Form.Floating>

                <Form.Floating className="mb-3">
                  <Form.Control
                    id="formPasswordLogin"
                    type="password"
                    className={`custom-input ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Digite sua senha"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                  <Form.Label className='label' htmlFor="formPasswordLogin">Senha</Form.Label>
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </Form.Floating>

                <Button type="submit" className="custom-button">Entrar</Button>

                {message && <div className="alert alert-info">{message}</div>}
              </Form>
            </Tab>

            {/* Cadastro */}
            <Tab eventKey="register" title="CADASTRAR" tabClassName="custom-tab">
              <Form className="custom-form" onSubmit={handleRegisterSubmit}>
                <Form.Floating className="mb-3">
                  <Form.Control
                    id="formNameRegister"
                    type="text"
                    className={`custom-input ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="Digite seu nome"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  />
                  <Form.Label className='label' htmlFor="formNameRegister">Nome</Form.Label>
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </Form.Floating>

                <Form.Floating className="mb-3">
                  <Form.Control
                    id="formEmailRegister"
                    type="email"
                    className={`custom-input ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="Digite seu email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  />
                  <Form.Label className='label' htmlFor="formEmailRegister">Email</Form.Label>
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </Form.Floating>

                <Form.Floating className="mb-3">
                  <Form.Control
                    id="formPasswordRegister"
                    type="password"
                    className={`custom-input ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Digite sua senha"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  />
                  <Form.Label className='label' htmlFor="formPasswordRegister">Senha</Form.Label>
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </Form.Floating>
          
                <Button type="submit" className="custom-button">Cadastrar</Button>

                {message && <div className="alert alert-info">{message}</div>}
              </Form>
            </Tab>
          </Tabs>
        </div>
      )}
    </>
  );
};

export default LoginOrRegister;

