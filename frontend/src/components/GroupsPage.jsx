import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './GroupsPage.css'

export default function GroupsPage() {
  const navigate = useNavigate() // Hook para navegar

  const groups = [
    { id: 1, name: '🏠 Piso 4', members: 4, tasks: 5, description: 'Gestión de tareas del hogar y gastos comunes.' },
    { id: 2, name: '✈️ Viaje Verano', members: 8, tasks: 12, description: 'Planificación del viaje a la costa en Agosto.' },
    { id: 3, name: '💪 Gym Friends', members: 5, tasks: 2, description: 'Seguimiento de entrenamientos y retos fitness.' }
  ]

  return (
    <div className="groups-container">
      <header className="groups-header">
        <h1>🛡️ Tus Gremios</h1>
        {/* BOTÓN CONECTADO */}
        <button 
          className="btn-create-small" 
          onClick={() => navigate('/crear-gremio')}
        >
          + Nuevo Gremio
        </button>
      </header>

      <div className="groups-grid">
        {groups.map(group => (
          <div key={group.id} className="group-card-simple">
            <div className="group-card-header">
              <span className="group-emoji">{group.name.split(' ')[0]}</span>
              <h2>{group.name.split(' ').slice(1).join(' ')}</h2>
            </div>
            
            <p className="group-desc">{group.description}</p>
            
            <div className="group-card-footer">
              <div className="group-meta">
                <span>👥 {group.members}</span>
                <span>✅ {group.tasks}</span>
              </div>
              <Link to={`/grupos/${group.id}`} className="btn-enter">
                ENTRAR
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}