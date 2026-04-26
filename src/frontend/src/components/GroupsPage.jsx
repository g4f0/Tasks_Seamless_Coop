import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDataService, useDataObserver } from '../../../services/DataContext';
import './GroupsPage.css';

export default function GroupsPage() {
  useDataObserver();
  const navigate = useNavigate();
  const dataService = useDataService();
  const currentUser = dataService.currentUser;

  // Usar SIEMPRE los grupos reales del usuario logado (IDs reales, no índice visual)
  const groups = currentUser ? currentUser.Groups : [];

  return (
    <div className="groups-container">
      <header className="groups-header">
        <h1>🛡️ Tus Gremios</h1>
        <button
          className="btn-create-small"
          onClick={() => navigate('/crear-gremio')}
        >
          + Nuevo Gremio
        </button>
      </header>

      <div className="groups-grid">
        {groups.map((group) => {
          const emoji = group.Name.split(' ')[0] || '🛡️';
          const title = group.Name.split(' ').slice(1).join(' ') || group.Name;

          return (
            <div key={group.Id} className="group-card-simple">
              <div className="group-card-header">
                <span className="group-emoji">{emoji}</span>
                <h2>{title}</h2>
              </div>

              <p className="group-desc">{group.Description}</p>

              <div className="group-card-footer">
                <div className="group-meta">
                  <span>👥 {group.Users.length}</span>
                  <span>✅ {group.Tasks.length}</span>
                </div>

                {/* CRÍTICO: navegar con ID real */}
                <Link to={`/grupos/${group.Id}`} className="btn-enter">
                  ENTRAR
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {groups.length === 0 && (
        <div className="empty-state card">
          <p>No perteneces a ningún gremio todavía.</p>
        </div>
      )}
    </div>
  );
}
