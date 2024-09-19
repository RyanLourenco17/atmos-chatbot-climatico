import { useState } from 'react';
import { Tabs, Tab, Form } from 'react-bootstrap';
import './LoginOrRegister.css';

const LoginOrRegister = () => {
  const [key, setKey] = useState('login');

  return (
    <div className="login-register-container">
      <Tabs
        id="login-register-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-5 custom-tabs justify-content-center"
      >
        {/* Aba de Login */}
        <Tab eventKey="login" title="ENTRAR" tabClassName="custom-tab">
          <Form className="custom-form">
            <Form.Floating className="mb-3">
              <Form.Control
                id="formEmailLogin"
                type="email"
                className="custom-input"
                placeholder="Digite seu email"
              />
              <Form.Label className='label' htmlFor="formEmailLogin">Email</Form.Label>
            </Form.Floating>

            <Form.Floating className="mb-3">
              <Form.Control
                id="formPasswordLogin"
                type="password"
                className="custom-input"
                placeholder="Digite sua senha"
              />
              <Form.Label className='label' htmlFor="formPasswordLogin">Senha</Form.Label>
            </Form.Floating>

            <button className="custom-button">Entrar</button>
          </Form>
        </Tab>

        {/* Aba de Cadastro */}
        <Tab eventKey="register" title="CADASTRAR" tabClassName="custom-tab">
          <Form className="custom-form">
            <Form.Floating className="mb-3">
              <Form.Control
                id="formUsernameRegister"
                type="text"
                className="custom-input"
                placeholder="Digite seu nome de usuário"
              />
              <Form.Label className='label' htmlFor="formUsernameRegister">Nome de Usuário</Form.Label>
            </Form.Floating>

            <Form.Floating className="mb-3">
              <Form.Control
                id="formEmailRegister"
                type="email"
                className="custom-input"
                placeholder="Digite seu email"
              />
              <Form.Label className='label' htmlFor="formEmailRegister">Email</Form.Label>
            </Form.Floating>

            <Form.Floating className="mb-3">
              <Form.Control
                id="formPasswordRegister"
                type="password"
                className="custom-input"
                placeholder="Crie uma senha"
              />
              <Form.Label className='label' htmlFor="formPasswordRegister">Senha</Form.Label>
            </Form.Floating>

            <button className="custom-button">Cadastrar</button>
          </Form>
        </Tab>
      </Tabs>
    </div>
  );
};

export default LoginOrRegister;






