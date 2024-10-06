import { useEffect, useState } from 'react';  
import { Bell, PencilSquare, ClockHistory, Gear, BoxArrowLeft, SquareHalf } from 'react-bootstrap-icons';
import './Sidebar.css';
import mascoteImg from '../../assets/Mascote.png';
import atmosLogo from '../../assets/Atmos.png';
import ModalConfig from '../Modal/ModalConfig';

const MenuSide = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false); 
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [consultas, setConsultas] = useState([]); // Estado para armazenar consultas

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleOpenSettingsModal = () => {
    setShowSettingsModal(true); 
  };

  const handleCloseSettingsModal = () => {
    setShowSettingsModal(false);
  };

  // Função para buscar as consultas do usuário
const fetchConsultations = async () => {
  try {
    const response = await fetch('https://atmos-chatbot-climatico-backend.onrender.com/api/consultas', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Pega o token do localStorage
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Erro ao buscar consultas.');
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      setConsultas(data); // Atualiza o estado apenas se o dado for um array válido
    } else {
      setConsultas([]); // Se o dado não for um array, zera o estado
    }
  } catch (error) {
    console.error('Erro:', error);
  }
};


  useEffect(() => {
    fetchConsultations(); // Chama a função ao montar o componente
  }, []);

  return (
    <div>
      {/* Menu colapsado em dispositivos móveis */}
      <div className="mobile-header">
        <div className="mobile-logo">
          <img src={mascoteImg} alt="Mascote" className="mobile-mascote" />
        </div>
        <div className="toggle-button-mobile" onClick={toggleMobileMenu}>
          <SquareHalf className="toggle-icon-mobile" />
        </div>
      </div>

      {/* Sidebar principal */}
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="toggle-button" onClick={toggleSidebar}>
          <SquareHalf className="toggle-icon" />
        </div>

        <div className={`logo-container ${isCollapsed ? 'collapsed' : ''}`}>
          <img src={mascoteImg} alt="Mascote" className={`mascote ${isCollapsed ? 'collapsed-mascote' : ''}`} />
          {!isCollapsed && <img src={atmosLogo} alt="ATMOS Logo" className="logo-text" />}
        </div>

        <div className="menu">
          <div className="menu-item">
            <PencilSquare className="icon" />
            {!isCollapsed && <span>NOVA CONVERSA</span>}
          </div>

          <div className="menu-section">
            <div className="menu-item">
              <ClockHistory className="icon" />
              {!isCollapsed && <span>CONSULTAS</span>}
            </div>
            {!isCollapsed && (
              <div className="conversation-list scrollable-section">
                {consultas.map(consulta => (
                  <div key={consulta._id} className="conversation-item">
                    {consulta.conversations.length > 0 && consulta.conversations[0].messages.length > 0
                      ? consulta.conversations[0].messages[0].question
                      : "Sem perguntas ainda"}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="menu-section">
            <div className="menu-item">
              <Bell className='icon'/>
              {!isCollapsed && <span>NOTIFICAÇÕES</span>}
            </div>
            {!isCollapsed && (
              <div className="notification-list scrollable-section">
                <div className="notification-item">Nova previsão de chuva</div>
                <div className="notification-item">Alerta de ventania</div>
                <div className="notification-item">Temperatura subiu 5ºC</div>
              </div>
            )}
          </div>

          <div className="menu-section">
            <div className="menu-item" onClick={handleOpenSettingsModal}>
              <Gear className="icon" />
              {!isCollapsed && <span>CONFIGURAÇÕES</span>}
            </div>
            <div className="menu-item">
              <BoxArrowLeft className="icon" />
              {!isCollapsed && <span>SAIR DA CONTA</span>}
            </div>
          </div>
        </div>
      </div>
      <ModalConfig show={showSettingsModal} handleClose={handleCloseSettingsModal} />
    </div>
  );
};

export default MenuSide;


