import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate() // Hook para navegar

  const groups = [
    { id: 1, name: '🏠 Piso 4', members: 4, tasks: 5 },
    { id: 2, name: '✈️ Viaje Verano', members: 8, tasks: 12 }
  ]

  return (
    <div className="dashboard-hero">
      <header className="welcome-banner">
        <div className="welcome-text">
          <h1>¡Saludos, Aventurero! ⚔️</h1>
          <p>Gestiona tus gremios y completa tus misiones diarias.</p>
        </div>
        {/* BOTÓN CONECTADO */}
        <button 
          className="btn-create-massive" 
          onClick={() => navigate('/crear-gremio')}
        >
          + CREAR NUEVO GREMIO
        </button>
      </header>

      <main className="dashboard-grid-layout">
        <section className="dashboard-panel groups-panel card">
          <div className="panel-header">
            <h2>🛡️ Mis Gremios</h2>
            <Link to="/grupos" className="view-all">Ver todos</Link>
          </div>
          <div className="groups-list-compact">
            {groups.map(group => (
              <Link key={group.id} to={`/grupos/${group.id}`} className="group-item-link">
                <div className="group-item">
                  <span className="group-avatar">{group.name.split(' ')[0]}</span>
                  <div className="group-info">
                    <h3>{group.name.split(' ').slice(1).join(' ')}</h3>
                    <p>{group.members} miembros • {group.tasks} tareas</p>
                  </div>
                  <span className="arrow-icon">➜</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="dashboard-panel events-panel card">
          <div className="panel-header"><h2>📅 Próximas Citas</h2></div>
          <div className="events-mini-list">
            <div className="event-item-mini">
              <div className="event-date"><span>28</span><span>ABR</span></div>
              <div className="event-details">
                <h4>Limpieza General</h4>
                <p>Piso 4</p>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-panel checklist-panel card">
          <div className="panel-header"><h2>✅ Misiones Críticas</h2></div>
          <div className="checklist-mini-list">
            <div className="check-item-mini">
              <input type="checkbox" readOnly />
              <span>Comprar suministros</span>
            </div>
          </div>
        </section>

        <section className="dashboard-panel challenges-panel card">
          <div className="panel-header"><h2>🏆 Retos Activos</h2></div>
          <div className="challenges-mini-list">
            <div className="challenge-mini">
              <div className="ch-mini-info"><span>🏃 Pasos Totales</span><span>75%</span></div>
              <div className="progress-bar-mini"><div className="progress-fill" style={{width: '75%'}}></div></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}