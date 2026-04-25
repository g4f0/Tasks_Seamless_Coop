import React from 'react'
import './FriendsPage.css'

export default function FriendsPage() {
  const friends = [
    { id: 1, name: 'Ana', email: 'ana@email.com', groups: 2 },
    { id: 2, name: 'Bruno', email: 'bruno@email.com', groups: 3 },
    { id: 3, name: 'Carlos', email: 'carlos@email.com', groups: 1 }
  ]

  return (
    <div className="friends-page">
      <h2>👥 Mis Amigos</h2>
      <button className="btn">+ Añadir amigo</button>

      <div className="friends-list">
        {friends.map(friend => (
          <div key={friend.id} className="card friend-card">
            <h3>👤 {friend.name}</h3>
            <p>{friend.email}</p>
            <p>En grupos: {friend.groups}</p>
            <div className="card-buttons">
              <button className="btn">Ver perfil</button>
              <button className="btn btn-secondary">Remover</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}