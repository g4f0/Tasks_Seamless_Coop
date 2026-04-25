import React from 'react'
import './GroupsPage.css'

export default function GroupsPage() {
  const groups = [
    { id: 1, name: '🏠 Piso 4', members: 4, events: 12 },
    { id: 2, name: '✈️ Viaje Verano', members: 8, events: 24 },
    { id: 3, name: '💪 Gym Friends', members: 5, events: 8 }
  ]

  return (
    <div className="groups-page">
      <h2>Mis Grupos</h2>
      <button className="btn">+ Crear grupo</button>

      <div className="groups-list">
        {groups.map(group => (
          <div key={group.id} className="card group-card">
            <h3>{group.name}</h3>
            <p>Miembros: {group.members}</p>
            <p>Eventos: {group.events}</p>
            <div className="card-buttons">
              <button className="btn">Ver grupo</button>
              <button className="btn btn-secondary">⭐ Favorito</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}