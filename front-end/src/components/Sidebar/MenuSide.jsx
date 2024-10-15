import { useEffect, useState } from 'react';
import { PencilSquare, ClockHistory, Gear, BoxArrowLeft, SquareHalf } from 'react-bootstrap-icons';
import { useNavigate, Link } from 'react-router-dom';
import WeatherCard from '../WeatherCard/WeatherCard';  // Importe o WeatherCard
import './Sidebar.css';
import mascoteImg from '../../assets/Mascote.png';
import atmosLogo from '../../assets/Atmos.png';
import ModalConfig from '../Modal/ModalConfig';

const MenuSide = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [consultas, setConsultas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

  const fetchConsultas = async () => {
    try {
      const response = await fetch('https://atmos-chatbot-climatico-backend.onrender.com/api/dialogflow/consultas', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConsultas(data);
      } else {
        console.error('Erro ao buscar consultas:', response.status);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultas();
  }, []);

  const handleNavigateToConversation = (consultationId) => {
    console.log('ID da consulta:', consultationId);
    navigate(`/consulta/${consultationId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    
    navigate('/'); 
  };

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
            <Link className="new-consultation" to="/nova-consulta">
              <PencilSquare className="icon" />
              {!isCollapsed && <span>NOVA CONSULTA</span>}
            </Link>
          </div>

          <div className="menu-section">
            <div className="menu-item">
              <ClockHistory className="icon" />
              {!isCollapsed && <span>CONSULTAS</span>}
            </div>
            {!isCollapsed && (
              <div className="conversation-list scrollable-section">
                {isLoading ? (
                  <div className="conversation-item">
                    <p>Carregando consultas...</p>
                  </div>
                ) : (
                  consultas && consultas.length > 0 ? (
                    consultas.map((consulta, index) => (
                      <div
                        className="conversation-item"
                        key={index}
                        onClick={() => handleNavigateToConversation(consulta._id)}
                      >
                        <p>Consulta {index + 1}: {consulta.messages.length > 0 ? consulta.messages[0].question : 'Sem pergunta disponível'}</p>
                      </div>
                    ))
                  ) : (
                    <div className="conversation-item">
                      <p>Nenhuma consulta disponível</p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div className="menu-section">
            {!isCollapsed && <WeatherCard />}
          </div>

          <div className="menu-section">
            <div className="menu-item" onClick={handleOpenSettingsModal}>
              <Gear className="icon" />
              {!isCollapsed && <span>CONFIGURAÇÕES</span>}
            </div>
            <div className="menu-item" onClick={handleLogout}>
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
