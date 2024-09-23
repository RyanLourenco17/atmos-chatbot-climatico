import { useState } from 'react';
import { Tabs, Tab, Form } from 'react-bootstrap';
import { validateEmail } from '../../validations/validateEmail';
import { validateRequired } from '../../validations/validateRequired';
import './LoginOrRegister.css';

const LoginOrRegister = () => {
  const [key, setKey] = useState('login');
  const [errors, setErrors] = useState({});

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validações
    newErrors.email = validateEmail(loginForm.email);
    newErrors.password = validateRequired(loginForm.password, 'Senha');

    setErrors(newErrors);

    // Se não houver erros, continue com a lógica de login
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validações
    newErrors.username = validateRequired(registerForm.username, 'Nome de Usuário');
    newErrors.email = validateEmail(registerForm.email);
    newErrors.password = validateRequired(registerForm.password, 'Senha');

    setErrors(newErrors);

    // Se não houver erros, continue com a lógica de cadastro
  };

  return (
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

            <button className="custom-button">Entrar</button>
          </Form>
        </Tab>

        {/* Cadastro */}
        <Tab eventKey="register" title="CADASTRAR" tabClassName="custom-tab">
          <Form className="custom-form" onSubmit={handleRegisterSubmit}>
            <Form.Floating className="mb-3">
              <Form.Control
                id="formUsernameRegister"
                type="text"
                className={`custom-input ${errors.username ? 'is-invalid' : ''}`}
                placeholder="Digite seu nome de usuário"
                value={registerForm.username}
                onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
              />
              <Form.Label className='label' htmlFor="formUsernameRegister">Nome de Usuário</Form.Label>
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
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
                placeholder="Crie uma senha"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              />
              <Form.Label className='label' htmlFor="formPasswordRegister">Senha</Form.Label>
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </Form.Floating>

            <button className="custom-button">Cadastrar</button>
          </Form>
        </Tab>
      </Tabs>
    </div>
  );
};

export default LoginOrRegister;







