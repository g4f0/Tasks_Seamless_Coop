import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataService } from '../../../services/DataContext';
import './UserProfile.css';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const dataService = useDataService();
  const user = dataService.currentUser;
  if (!user) return null;

  const userData = {
    username: user.Name,
    email: user.Name.toLowerCase() + "@ejemplo.com",
    joined: "Marzo 2024",
    bio: user.Description,
    stats: {
      misionesCompletadas: user.Groups.flatMap(g => g.Tasks).filter(t => t.Checked === 1).length,
      gremiosActivos: user.Groups.length,
      amigos: user.Friends.length
    }
  };

  return (
    <div className="profile-page-container">
      <button className="btn-back" onClick={() => navigate(-1)}>◀ VOLVER</button>
      <div className="profile-card card">
        <div className="profile-main-info">
          <div className="avatar-placeholder">👤</div>
          <div className="user-details">
            <h1>{userData.username}</h1>
            <p className="user-email">{userData.email}</p>
            <p className="user-since">Miembro desde: {userData.joined}</p>
          </div>
          <button className="btn btn-edit-profile">Editar Perfil</button>
        </div>
        <div className="profile-content-section">
          <h3>Sobre mí</h3>
          <p className="bio-description">{userData.bio}</p>
        </div>
        <div className="profile-stats-grid">
          <div className="stat-item">
            <span className="stat-num">{userData.stats.misionesCompletadas}</span>
            <span className="stat-name">Tareas Realizadas</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{userData.stats.gremiosActivos}</span>
            <span className="stat-name">Gremios</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{userData.stats.amigos}</span>
            <span className="stat-name">Amigos</span>
          </div>
        </div>
        <div className="profile-actions-footer">
          <button className="btn btn-secondary">Cambiar Contraseña</button>
          <button className="btn btn-danger">Cerrar Sesión</button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;