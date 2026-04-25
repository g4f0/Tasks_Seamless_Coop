import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataService } from '../../../services/DataContext';
import { FriendRequest } from '../../../backend/friendRequest';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dataService = useDataService();
  const currentUser = dataService.currentUser;

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const requests: FriendRequest[] = currentUser
    ? dataService.friendRequests.filter(req => req.IdUserDest === currentUser.Id && !req.Accepted)
    : [];

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  };

  const handleAction = (path: string) => {
    setShowUserMenu(false);
    setShowNotifications(false);
    navigate(path);
  };

  const removeRequest = (id: number) => {
    dataService.friendRequests = dataService.friendRequests.filter(r => r.Id !== id);
  };

  const getRequesterName = (req: FriendRequest): string => {
    const user = dataService.users.find(u => u.Id === req.IdUserSrc);
    return user ? user.Name : 'Desconocido';
  };

  return (
    <header className="main-header">
      <div className="header-left">
        <h2 className="header-logo" onClick={() => navigate('/')}>
          🏰 Tasks Seamless Coop 🐉
        </h2>
      </div>

      <div className="header-right">
        <div className="header-item">
          <button className="header-btn bell-btn" onClick={toggleNotifications}>
            🔔
            {requests.length > 0 && <span className="header-badge">{requests.length}</span>}
          </button>

          {showNotifications && (
            <div className="header-dropdown card">
              <h4 className="dropdown-title">Solicitudes de Alianza</h4>
              {requests.length === 0 ? (
                <p className="empty-text">No hay mensajes nuevos...</p>
              ) : (
                requests.map(req => (
                  <div key={req.Id} className="dropdown-row">
                    <span>🛡️ {getRequesterName(req)}</span>
                    <div className="row-actions">
                      <button className="mini-btn ok" onClick={() => {
                        dataService.acceptFriendRequest(req.Id);
                      }}>✅</button>
                      <button className="mini-btn no" onClick={() => removeRequest(req.Id)}>❌</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="header-item">
          <button className="header-btn user-btn" onClick={toggleUserMenu}>
            👤 {currentUser?.Name ?? 'Usuario'}
          </button>

          {showUserMenu && (
            <div className="header-dropdown card user-menu">
              <button className="menu-link" onClick={() => handleAction('/mi-perfil')}>
                🖼️ Ver mi Perfil
              </button>
              <div className="divider"></div>
              <button className="menu-link auth-link" onClick={() => handleAction('/auth')}>
                🔑 Iniciar Sesión / Registro
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;