import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDataService, useDataObserver } from '../../../services/DataContext';
import { Challenge } from '../../../backend/challenge';
import { Event } from '../../../backend/event';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  useDataObserver();
  const navigate = useNavigate();
  const dataService = useDataService();
  const currentUser = dataService.currentUser;
  const userGroups = currentUser ? currentUser.Groups : [];

  // Protegemos con flatMap que devuelva array vacío si algo falla
  const tasks = userGroups.flatMap(g =>
    (g?.Tasks ?? []).filter(t => !(t instanceof Challenge) && !(t instanceof Event) && t.Checked === 0)
  ).slice(0, 3);

  const events = userGroups.flatMap(g =>
    (g?.Tasks ?? []).filter(t => t instanceof Event) as Event[]
  ).slice(0, 3);

  const toggleTask = (id: number) => {
    dataService.toggleTask(id);
  };

  return (
    <div className="dashboard-hero">
      <header className="welcome-banner">
        <div className="welcome-text">
          <h1>¡Saludos, Aventurero! ⚔️</h1>
          <p>Gestiona tus gremios y completa tus misiones diarias.</p>
        </div>
        <button className="btn-create-massive" onClick={() => navigate('/crear-gremio')}>
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
            {userGroups.map(group => (
              <Link key={group.Id} to={`/grupos/${group.Id}`} className="group-item-link">
                <div className="group-item">
                  <span className="group-avatar">🏠</span>
                  <div className="group-info">
                    <h3>{group.Name}</h3>
                    <p>{group.Users?.length || 0} miembros • {group.Tasks?.length || 0} items</p>
                  </div>
                  <span className="arrow-icon">➜</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="dashboard-panel events-panel card">
          <div className="panel-header"><h2>📅 Próximos Eventos</h2></div>
          <div className="events-mini-list">
            {events.map(ev => {
              const evDate = ev?.EndDate ? new Date(ev.EndDate) : null;
              return (
                <div key={ev.Id} className="event-item-mini">
                  <div className="event-date">
                    <span>{evDate ? evDate.getDate() : '?'}</span>
                    <span>{evDate ? evDate.toLocaleString('es-ES', { month: 'short' }).toUpperCase() : ''}</span>
                  </div>
                  <div className="event-details">
                    <h4>{ev.Name}</h4>
                    <p>{ev.Description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="dashboard-panel checklist-panel card">
          <div className="panel-header"><h2>📝 Tareas pendientes</h2></div>
          <div className="checklist-mini-list">
            {tasks.map(task => (
              <div key={task.Id} className={`check-item-mini ${task.Checked === 1 ? 'completed' : ''}`}>
                <input type="checkbox" checked={task.Checked === 1} onChange={() => toggleTask(task.Id)} />
                <span>{task.Name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-panel challenges-panel card">
          <div className="panel-header"><h2>🏆 Retos Activos</h2></div>
          <div className="challenges-mini-list">
            {userGroups.flatMap(g => (g?.Tasks ?? []).filter(t => t instanceof Challenge)).map(challenge => {
              const ch = challenge as Challenge;
              const percent = ch.StatB ? (ch.StatA / ch.StatB) * 100 : 0;
              return (
                <div key={ch.Id} className="challenge-mini">
                  <div className="ch-mini-info">
                    <span>🏃 {ch.Name}</span>
                    <span>{Math.min(100, percent).toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar-mini">
                    <div className="progress-fill" style={{ width: `${Math.min(100, percent)}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;