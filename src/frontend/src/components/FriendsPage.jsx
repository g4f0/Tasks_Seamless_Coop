import React from 'react'
import { useNavigate } from 'react-router-dom'
import './FriendsPage.css'

export default function FriendsPage() {
  const navigate = useNavigate()

  const friends = [
    { id: 1, name: 'Ana', email: 'ana@email.com', groups: 2 },
    { id: 2, name: 'Bruno', email: 'bruno@email.com', groups: 3 },
    { id: 3, name: 'Carlos', email: 'carlos@email.com', groups: 1 }
  ]

  return (
    <div className="friends-page">
      <header className="friends-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>👥 Mis Amigos</h2>
        {/* BOTÓN CONECTADO A LA NUEVA VENTANA */}
        <button className="btn" onClick={() => navigate('/añadir-amigo')}>
          + Añadir amigo
        </button>
      </header>

      <div className="friends-list">
        {friends.map(friend => (
          <div key={friend.id} className="card friend-card">
            <div className="friend-card-content">
              <h3>👤 {friend.name}</h3>
              <p className="friend-email">{friend.email}</p>
              <p className="friend-groups">En grupos: <strong>{friend.groups}</strong></p>
            </div>
            
            <div className="card-buttons">
              {/* Hemos simplificado quitando "Ver perfil" para evitar errores */}
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%' }}
                onClick={() => alert(`Eliminando a ${friend.name}...`)}
              >
                Remover Amigo
              </button>
            </div>
          </div>
        ))}
      </div>

      {friends.length === 0 && (
        <div className="empty-state card">
          <p>No tienes aliados en tu lista todavía. ¡Convoca a alguien!</p>
        </div>
      )}
    </div>
  )
}