import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDataService, useDataObserver } from '../../../services/DataContext';
import { Challenge } from '../../../backend/challenge';
import { Event } from '../../../backend/event';
import { createGroupSession, getGroupStatus, joinGroupSession, onGroupSnapshot, publishGroupSnapshot } from '../services/p2pClient';
import './GroupDetail.css';

type CreateType = "Task" | "Event" | "Challenge";

const GroupDetail: React.FC = () => {
  useDataObserver();
  const { id } = useParams<{ id: string }>();
  const dataService = useDataService();
  const group = dataService.groups.find(g => g.Id === Number(id));
  const groupId = String(id ?? "");

  const [currentDate, setCurrentDate] = useState(new Date());
  const [inputAmounts, setInputAmounts] = useState<Record<number, number>>({});

  const [createType, setCreateType] = useState<CreateType>("Task");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(1);
  const [endDate, setEndDate] = useState<string>("");
  const [winCondition, setWinCondition] = useState("");
  const [loseCondition, setLoseCondition] = useState("");
  const [statB, setStatB] = useState(100);

  const [joinCode, setJoinCode] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [p2pConnected, setP2pConnected] = useState(false);
  const [p2pMsg, setP2pMsg] = useState("");

  if (!group) return <div>Gremio no encontrado</div>;

  const tasks = useMemo(
    () => group.Tasks.filter(t => !(t instanceof Challenge) && !(t instanceof Event)),
    [group.Tasks]
  );
  const events = useMemo(
    () => group.Tasks.filter(t => t instanceof Event) as Event[],
    [group.Tasks]
  );
  const challenges = useMemo(
    () => group.Tasks.filter(t => t instanceof Challenge) as Challenge[],
    [group.Tasks]
  );

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      try {
        const st = await getGroupStatus(groupId);
        if (!mounted) return;
        setP2pConnected(!!st.connected);
        if (st.inviteCode) setInviteCode(st.inviteCode);
      } catch {
        if (!mounted) return;
        setP2pConnected(false);
      }
    };

    fetchStatus();
    const timer = setInterval(fetchStatus, 3000);

    const unsubWs = onGroupSnapshot((gid, snapshot) => {
      if (gid !== groupId) return;
      dataService.replaceStateFromSnapshot(snapshot);
    });

    const unsubData = dataService.subscribe(async () => {
      if (!p2pConnected || dataService.isApplyingRemoteUpdate) return;
      const snap = dataService.exportSnapshot();
      await publishGroupSnapshot(groupId, snap);
    });

    return () => {
      mounted = false;
      clearInterval(timer);
      unsubWs();
      unsubData();
    };
  }, [groupId, dataService, p2pConnected]);

  const handleCreateSession = async () => {
    try {
      const r = await createGroupSession(groupId);
      setInviteCode(r.inviteCode ?? "");
      setP2pConnected(true);
      setP2pMsg("Sesión P2P del grupo creada.");
      await publishGroupSnapshot(groupId, dataService.exportSnapshot());
    } catch (e: any) {
      setP2pMsg(e.message);
    }
  };

  const handleJoinSession = async () => {
    try {
      await joinGroupSession(groupId, joinCode.trim());
      setP2pConnected(true);
      setP2pMsg("Conectado al grupo P2P.");
    } catch (e: any) {
      setP2pMsg(e.message);
    }
  };

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
      dataService.emit();
    }
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    const date = endDate ? new Date(endDate) : new Date();

    if (createType === "Task") {
      dataService.addTaskToGroup(group.Id, { name, description, priority, endDate: date });
    } else if (createType === "Event") {
      dataService.addEventToGroup(group.Id, { name, description, priority, endDate: date });
    } else {
      dataService.addChallengeToGroup(group.Id, {
        name, description, priority, endDate: date,
        winCondition, loseCondition, statA: 0, statB
      });
    }

    setName("");
    setDescription("");
    setPriority(1);
    setEndDate("");
    setWinCondition("");
    setLoseCondition("");
    setStatB(100);
  };

  return (
    <div className="group-detail">
      <div className="header-detail">
        <h2>🏠 {group.Name}</h2>
      </div>

      <div className="card side-card" style={{ marginBottom: 12 }}>
        <h3>🔗 Sincronización P2P del grupo</h3>
        <p>Estado: <strong>{p2pConnected ? "Conectado" : "Desconectado"}</strong></p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={handleCreateSession}>Crear sesión de este grupo</button>
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Código de invitación"
          />
          <button onClick={handleJoinSession}>Unirme con código</button>
        </div>
        {inviteCode && <p>Invite code: <code>{inviteCode}</code></p>}
        {p2pMsg && <p>{p2pMsg}</p>}
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
              <div key={i + 1} className="calendar-day"><span className="day-number">{i + 1}</span></div>
            ))}
            {[...Array(trailingDays)].map((_, i) => <div key={`e-${i}`} className="calendar-day empty"></div>)}
          </div>

          <div className="card side-card" style={{ marginTop: 16 }}>
            <h3>👥 Miembros</h3>
            <ul className="list-items">
              {group.Users.map(u => <li key={u.Id}>👤 {u.Name}</li>)}
            </ul>
          </div>
        </section>

        <aside className="sidebar-section">
          <div className="card side-card">
            <h3>➕ Añadir item al grupo</h3>
            <form onSubmit={handleCreateItem} className="challenge-controls-custom">
              <select value={createType} onChange={(e) => setCreateType(e.target.value as CreateType)}>
                <option value="Task">Tarea</option>
                <option value="Event">Evento</option>
                <option value="Challenge">Reto</option>
              </select>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" required />
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción" required />
              <input type="number" min={1} max={3} value={priority} onChange={(e) => setPriority(Number(e.target.value))} />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

              {createType === "Challenge" && (
                <>
                  <input value={winCondition} onChange={(e) => setWinCondition(e.target.value)} placeholder="Win condition" required />
                  <input value={loseCondition} onChange={(e) => setLoseCondition(e.target.value)} placeholder="Lose condition" required />
                  <input type="number" min={1} value={statB} onChange={(e) => setStatB(Number(e.target.value))} placeholder="Objetivo (statB)" />
                </>
              )}

              <button type="submit">Crear</button>
            </form>
          </div>

          <div className="card side-card">
            <h3>📝 Tareas</h3>
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
            <h3>📅 Eventos</h3>
            <ul className="list-items">
              {events.map(ev => (
                <li key={ev.Id}>
                  <span>{ev.Name} — {ev.EndDate.toLocaleDateString()}</span>
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
                  <small>{ch.WinCondition} / {ch.LoseCondition}</small>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: `${percent}%` }}></div>
                  </div>
                  <div className="challenge-controls-custom">
                    <input
                      type="number"
                      value={inputAmounts[ch.Id] || ''}
                      onChange={(e) => setInputAmounts({ ...inputAmounts, [ch.Id]: Number(e.target.value) })}
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
