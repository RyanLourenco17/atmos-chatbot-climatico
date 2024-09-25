import { useEffect } from 'react';
import './Alert.css'; // Importando o CSS para estilização

const Alert = ({ message, show, onClose }) => {
  // useEffect para fechar o alerta automaticamente após 3 segundos
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // Alerta fica visível por 3 segundos

      return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
    }
  }, [show, onClose]);

  return (
    <div className={`alert-container ${show ? 'show' : ''}`}>
      <p>{message}</p>
    </div>
  );
};

export default Alert;
