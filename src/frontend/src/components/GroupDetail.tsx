import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDataService, useDataObserver } from '../../../services/DataContext';
import { Challenge } from '../../../backend/challenge';
import './GroupDetail.css';

const GroupDetail: React.FC = () => {
  useDataObserver();
  const { id } = useParams<{ id: string }>();
  const dataService = useDataService();
  const group = dataService.groups.find(g => g.Id === Number(id));

  const [currentDate, setCurrentDate] = useState(new Date());
  const [inputAmounts, setInputAmounts] = useState<Record<number, number>>({});

  if (!group) return <div>Gremio no encontrado</div>;

  const tasks = group.Tasks.filter(t => !(t instanceof Challenge));
  const challenges = group.Tasks.filter(t => t instanceof Challenge) as Challenge[];

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const totalCellsNeeded = Math.ceil((startingDay + totalDays) / 7) * 7;
  const trailingDays = totalCellsNeeded - (startingDay + totalDays);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const toggleTask = (taskId: number) => {
    dataService.toggleTask(taskId, group.Id);
  };

  const updateChallenge = (challengeId: number) => {
    const val = parseFloat(String(inputAmounts[challengeId])) || 0;
    const challenge = challenges.find(c => c.Id === challengeId);
    if (challenge) {
      challenge.StatA += val;
      setInputAmounts({ ...inputAmounts, [challengeId]: 0 });
    }
  };

  return (
    <div className="group-detail">
      <div className="header-detail">
        <h2>🏠 {group.Name}</h2>
        <div className="detail-tabs">
          <button className="tab-btn active"><span className="icon">📅</span> Dashboard</button>
          <button className="tab-btn"><span className="icon">👥</span> Miembros</button>
        </div>
      </div>

      <div className="group-main-layout">
        <section className="calendar-section card">
          <div className="calendar-header">
            <button onClick={() => changeMonth(-1)} className="btn-nav">◀</button>
            <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            <button onClick={() => changeMonth(1)} className="btn-nav">▶</button>
          </div>
          <div className="calendar-weekdays">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="calendar-grid">
            {[...Array(startingDay)].map((_, i) => <div key={`s-${i}`} className="calendar-day empty"></div>)}
            {[...Array(totalDays)].map((_, i) => (
              <div key={i+1} className="calendar-day"><span className="day-number">{i + 1}</span></div>
            ))}
            {[...Array(trailingDays)].map((_, i) => <div key={`e-${i}`} className="calendar-day empty"></div>)}
          </div>
        </section>

        <aside className="sidebar-section">
          <div className="card side-card">
            <div className="side-header">
              <h3>✅ Checklist</h3>
              <button className="btn-add">+</button>
            </div>
            <ul className="list-items">
              {tasks.map(task => (
                <li key={task.Id} className={task.Checked === 1 ? 'completed' : ''}>
                  <input type="checkbox" checked={task.Checked === 1} onChange={() => toggleTask(task.Id)} />
                  <span>{task.Name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card side-card">
            <h3>🏆 Retos</h3>
            {challenges.map(ch => {
              const percent = ch.StatB ? Math.min(100, (ch.StatA / ch.StatB) * 100) : 0;
              return (
                <div key={ch.Id} className="challenge-container">
                  <div className="challenge-info">
                    <span>{ch.Name}</span>
                    <span>{ch.StatA}/{ch.StatB}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: `${percent}%` }}></div>
                  </div>
                  <div className="challenge-controls-custom">
                    <input
                      type="number"
                      value={inputAmounts[ch.Id] || ''}
                      onChange={(e) => setInputAmounts({...inputAmounts, [ch.Id]: Number(e.target.value)})}
                      placeholder="Cant."
                    />
                    <button onClick={() => updateChallenge(ch.Id)}>Añadir</button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default GroupDetail;