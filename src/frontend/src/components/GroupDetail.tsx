import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useDataService, useDataObserver } from "../../../services/DataContext";
import { Challenge } from "../../../backend/challenge";
import { Event } from "../../../backend/event";
import {
  createGroupSession,
  joinGroupSession,
  getGroupStatus,
  getGroupLatest,
  onGroupSnapshot,
  publishGroupSnapshot
} from "../services/p2pClient";
import "./GroupDetail.css";

type CreateType = "Task" | "Event" | "Challenge";

const GroupDetail: React.FC = () => {
  useDataObserver();
  const { id } = useParams<{ id: string }>();
  const dataService = useDataService();

  const parsedId = Number(id);
  const hasValidId = Number.isInteger(parsedId) && parsedId >= 0;

  // CRÍTICO: resolver por ID real, nunca por índice de array
  const group = hasValidId ? dataService.groups.find(g => g.Id === parsedId) : undefined;
  const groupId = hasValidId ? String(parsedId) : "";

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

  const [inviteCode, setInviteCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [p2pConnected, setP2pConnected] = useState(false);
  const [p2pMsg, setP2pMsg] = useState("");

  const publishingRef = useRef(false);
  const lastPublishRef = useRef(0);

  const tasks = useMemo(
    () => (group ? group.Tasks.filter(t => !(t instanceof Challenge) && !(t instanceof Event)) : []),
    [group]
  );
  const events = useMemo(
    () => (group ? (group.Tasks.filter(t => t instanceof Event) as Event[]) : []),
    [group]
  );
  const challenges = useMemo(
    () => (group ? (group.Tasks.filter(t => t instanceof Challenge) as Challenge[]) : []),
    [group]
  );

  useEffect(() => {
    if (!hasValidId) return;

    const unsub = onGroupSnapshot((gid, snapshot) => {
      if (gid !== groupId) return;
      try {
        dataService.replaceStateFromSnapshot(snapshot);
      } catch (e) {
        console.error("[GroupDetail] snapshot apply failed", e);
      }
    });
    return unsub;
  }, [groupId, dataService, hasValidId]);

  useEffect(() => {
    if (!hasValidId) return;

    const unsub = dataService.subscribe(async () => {
      if (!p2pConnected) return;
      if (dataService.isApplyingRemoteUpdate) return;
      if (publishingRef.current) return;

      const now = Date.now();
      if (now - lastPublishRef.current < 300) return;

      publishingRef.current = true;
      try {
        await publishGroupSnapshot(groupId, dataService.exportSnapshot());
        lastPublishRef.current = Date.now();
      } catch (e) {
        console.error("[P2P][PUBLISH] error", e);
      } finally {
        publishingRef.current = false;
      }
    });
    return unsub;
  }, [groupId, p2pConnected, dataService, hasValidId]);

  useEffect(() => {
    if (!hasValidId) return;
    let alive = true;

    const tick = async () => {
      try {
        const st = await getGroupStatus(groupId);
        if (!alive) return;
        setP2pConnected(!!st.connected);
        if (st.inviteCode && !inviteCode) setInviteCode(st.inviteCode);
      } catch {
        if (!alive) return;
        setP2pConnected(false);
      }
    };

    tick();
    const t = setInterval(tick, 2000);

    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [groupId, inviteCode, hasValidId]);

  const hydrateFromP2POrPublishLocal = async () => {
    if (!hasValidId) return;
    const latest = await getGroupLatest(groupId);
    if (latest?.snapshot) {
      dataService.replaceStateFromSnapshot(latest.snapshot);
      setP2pMsg("Estado del grupo cargado desde P2P.");
    } else {
      await publishGroupSnapshot(groupId, dataService.exportSnapshot());
      setP2pMsg("Sin snapshot remoto. Publicado estado local.");
    }
  };

  const handleCreateSession = async () => {
    if (!hasValidId) return;
    try {
      const r = await createGroupSession(groupId);
      const code = r.inviteCode ?? "";

      setInviteCode(code);
      localStorage.setItem(`p2p-invite-${groupId}`, code);
      setP2pConnected(true);

      await hydrateFromP2POrPublishLocal();
      setP2pMsg("Sesión creada. Comparte el código.");
    } catch (e: any) {
      setP2pMsg(`Error al crear sesión: ${e?.message ?? "desconocido"}`);
      setP2pConnected(false);
    }
  };

  const handleJoinSession = async () => {
    if (!hasValidId) return;
    try {
      const code = joinCode.trim();
      if (!code) {
        setP2pMsg("Pega un código de invitación.");
        return;
      }

      await joinGroupSession(groupId, code);
      localStorage.setItem(`p2p-invite-${groupId}`, code);
      setInviteCode(code);
      setP2pConnected(true);

      await hydrateFromP2POrPublishLocal();
      setP2pMsg("Unido al grupo P2P.");
    } catch (e: any) {
      setP2pMsg(`Error al unirte: ${e?.message ?? "desconocido"}`);
      setP2pConnected(false);
    }
  };

  const handleJoinSaved = async () => {
    if (!hasValidId) return;
    try {
      const saved = localStorage.getItem(`p2p-invite-${groupId}`) ?? "";
      if (!saved) {
        setP2pMsg("No hay código guardado para este grupo.");
        return;
      }

      await joinGroupSession(groupId, saved);
      setInviteCode(saved);
      setP2pConnected(true);

      await hydrateFromP2POrPublishLocal();
      setP2pMsg("Reconectado con código guardado.");
    } catch (e: any) {
      setP2pMsg(`No se pudo reconectar: ${e?.message ?? "desconocido"}`);
      setP2pConnected(false);
    }
  };

  const copyInvite = async () => {
    try {
      if (!inviteCode) {
        setP2pMsg("No hay código para copiar. Crea sesión primero.");
        return;
      }
      await navigator.clipboard.writeText(inviteCode);
      setP2pMsg("Código copiado.");
    } catch {
      setP2pMsg("No se pudo copiar el código.");
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
    if (!group) return;
    dataService.toggleTask(taskId, group.Id);
  };

  const updateChallenge = (challengeId: number) => {
    const val = parseFloat(String(inputAmounts[challengeId])) || 0;
    const challenge = challenges.find(c => c.Id === challengeId);
    if (challenge) {
      challenge.StatA += val;
      setInputAmounts(prev => ({ ...prev, [challengeId]: 0 }));
      dataService.emit();
    }
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;

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

  if (!hasValidId) {
    return <div>ID de gremio inválido</div>;
  }

  if (!group) {
    return <div>Gremio no encontrado</div>;
  }

  return (
    <div className="group-detail">
      <div className="header-detail">
        <h2>🏠 {group.Name}</h2>
      </div>

      <div className="card side-card" style={{ marginBottom: 12 }}>
        <h3>🔗 Sync de grupo</h3>
        <p>Estado: <strong>{p2pConnected ? "ON" : "OFF"}</strong></p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <button type="button" onClick={handleCreateSession}>Crear sesión</button>
          <button type="button" onClick={handleJoinSaved}>Reconectar (código guardado)</button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Pega código de invitación"
            style={{ minWidth: 320 }}
          />
          <button type="button" onClick={handleJoinSession}>Unirme con código</button>
        </div>

        {inviteCode && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <code style={{ userSelect: "all" }}>{inviteCode}</code>
            <button type="button" onClick={copyInvite}>Copiar código</button>
          </div>
        )}

        {p2pMsg && <p>{p2pMsg}</p>}
      </div>

      <div className="group-main-layout">
        <section className="calendar-section card">
          <div className="calendar-header">
            <button type="button" onClick={() => changeMonth(-1)} className="btn-nav">◀</button>
            <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            <button type="button" onClick={() => changeMonth(1)} className="btn-nav">▶</button>
          </div>
          <div className="calendar-weekdays">
            {["L", "M", "X", "J", "V", "S", "D"].map(d => <div key={d}>{d}</div>)}
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
                <li key={task.Id} className={task.Checked === 1 ? "completed" : ""}>
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
                      value={inputAmounts[ch.Id] || ""}
                      onChange={(e) => setInputAmounts({ ...inputAmounts, [ch.Id]: Number(e.target.value) })}
                      placeholder="Cant."
                    />
                    <button type="button" onClick={() => updateChallenge(ch.Id)}>Añadir</button>
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
