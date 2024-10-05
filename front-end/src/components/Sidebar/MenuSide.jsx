import { useEffect, useState } from 'react';
import { Bell, PencilSquare, ClockHistory, Gear, BoxArrowLeft, SquareHalf } from 'react-bootstrap-icons';
import './Sidebar.css';
import mascoteImg from '../../assets/Mascote.png';
import atmosLogo from '../../assets/Atmos.png';

import ModalConfig from '../Modal/ModalConfig';

const MenuSide = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Estado para controle em telas menores
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [conversations, setConversations] = useState([]);

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

  // Busca o histórico de conversas
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch("https://atmos-chatbot-climatico-backend.onrender.com/api/conversations", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        setConversations(data); // Supondo que a resposta seja uma lista de conversas
      } catch (error) {
        console.error("Erro ao buscar conversas:", error);
      }
    };

    fetchConversations();
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
        {/* Botão de alternância só será exibido em telas maiores */}
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
              {!isCollapsed && <span>CONVERSAS</span>}
            </div>
            {!isCollapsed && (
              <div className="conversation-list scrollable-section">
                {conversations.map(conversation => (
                  <div key={conversation.id} className="conversation-item">
                    {conversation.title} {/* Exibe o título da conversa */}
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
