import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataService, useDataObserver } from '../../../services/DataContext';
import './FriendsPage.css';

const FriendsPage: React.FC = () => {
  useDataObserver();
  const navigate = useNavigate();
  const dataService = useDataService();
  const currentUser = dataService.currentUser;
  const friendsList = currentUser ? currentUser.Friends : [];

  const handleRemove = (id: number) => {
    dataService.removeFriend(id);
  };

  return (
    <div className="friends-page">
      <header className="friends-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>👥 Mis Amigos</h2>
        <button className="btn" onClick={() => navigate('/añadir-amigo')}>+ Añadir amigo</button>
      </header>

      <div className="friends-list">
        {friendsList.map(friend => (
          <div key={friend.Id} className="card friend-card">
            <div className="friend-card-content">
              <h3>👤 {friend.Name}</h3>
              <p className="friend-email">{friend.Name.toLowerCase()}@email.com</p>
              <p className="friend-groups">En grupos: <strong>{friend.Groups.length}</strong></p>
            </div>
            <div className="card-buttons">
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => handleRemove(friend.Id)}>
                Remover Amigo
              </button>
            </div>
          </div>
        ))}
      </div>

      {friendsList.length === 0 && (
        <div className="empty-state card">
          <p>No tienes aliados en tu lista todavía. ¡Convoca a alguien!</p>
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
