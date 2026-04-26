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
type TabType = "dashboard" | "members";

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

const GroupDetail: React.FC = () => {
  useDataObserver();
  const { id } = useParams<{ id: string }>();
  const dataService = useDataService();

  const parsedId = Number(id);
  const hasValidId = Number.isInteger(parsedId) && parsedId >= 0;

  const group = hasValidId ? dataService.groups.find(g => g.Id === parsedId) : undefined;
  const safeTasks = group && Array.isArray(group.Tasks) ? group.Tasks : [];

  const tasks = safeTasks.filter(t => !(t instanceof Challenge) && !(t instanceof Event));
  const events = safeTasks.filter(t => t instanceof Event) as Event[];
  const challenges = safeTasks.filter(t => t instanceof Challenge) as Challenge[];

  const groupId = hasValidId ? String(parsedId) : "";

  // ── Estados ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
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
  const [showCreateForm, setShowCreateForm] = useState(false);

  // ── Memos ─────────────────────────────────────────────────────────────────
  const eventsByDay = useMemo(() => {
    const map: Record<number, Event[]> = {};
    if (!group) return map;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    for (const ev of events) {
      const evDate = ev.EndDate;
      if (!evDate || !(evDate instanceof Date) || isNaN(evDate.getTime())) continue;
      if (evDate.getFullYear() === year && evDate.getMonth() === month) {
        const day = evDate.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(ev);
      }
    }
    return map;
  }, [events, currentDate]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [currentDate]);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const publishingRef = useRef(false);
  const lastPublishRef = useRef(0);

  // ── Efectos ───────────────────────────────────────────────────────────────
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

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePrevMonth = () => {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const handleToggleTask = (taskId: number) => {
    dataService.toggleTask(taskId, parsedId);
  };

  const handleInputAmount = (challengeId: number, value: number) => {
    setInputAmounts(prev => ({ ...prev, [challengeId]: value }));
  };

  const handleAddProgress = (challenge: Challenge) => {
    const amount = inputAmounts[challenge.Id] ?? 1;
    // DataService no expone addChallengeProgress, mutamos directamente y emitimos
    challenge.StatA = Math.min((challenge.StatA ?? 0) + amount, challenge.StatB ?? 100);
    dataService.emit();
    setInputAmounts(prev => ({ ...prev, [challenge.Id]: 1 }));
  };

  const handleCreateSession = async () => {
    try {
      setP2pMsg("Creando sesión...");
      const code = await createGroupSession(groupId);
      setInviteCode(code);
      setP2pConnected(true);
      setP2pMsg("Sesión creada. Comparte el código.");
      const snapshot = dataService.exportSnapshot();
      await publishGroupSnapshot(groupId, snapshot);
    } catch (e) {
      console.error(e);
      setP2pMsg("Error al crear sesión.");
    }
  };

  const handleJoinSession = async () => {
    if (!joinCode.trim()) return;
    try {
      setP2pMsg("Uniéndose...");
      await joinGroupSession(groupId, joinCode.trim());
      setP2pConnected(true);
      setP2pMsg("Conectado al grupo.");
      const latest = await getGroupLatest(groupId);
      if (latest) dataService.replaceStateFromSnapshot(latest);
    } catch (e) {
      console.error(e);
      setP2pMsg("Error al unirse.");
    }
  };

  const handleCreateItem = () => {
    if (!name.trim()) return;

    const resolvedEndDate = endDate ? new Date(endDate) : new Date();

    if (createType === "Task") {
      dataService.addTaskToGroup(parsedId, {
        name,
        description,
        priority,
        endDate: resolvedEndDate,
      });
    } else if (createType === "Event") {
      dataService.addEventToGroup(parsedId, {
        name,
        description,
        priority,
        endDate: resolvedEndDate,
      });
    } else if (createType === "Challenge") {
      dataService.addChallengeToGroup(parsedId, {
        name,
        description,
        priority,
        endDate: resolvedEndDate,
        winCondition,
        loseCondition,
        statA: 0,
        statB,
      });
    }

    // Reset form
    setName("");
    setDescription("");
    setPriority(1);
    setEndDate("");
    setWinCondition("");
    setLoseCondition("");
    setStatB(100);
    setShowCreateForm(false);

    // Sync p2p
    if (p2pConnected) {
      const snapshot = dataService.exportSnapshot();
      publishGroupSnapshot(groupId, snapshot).catch(console.error);
    }
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!hasValidId) return <div>ID de gremio inválido</div>;
  if (!group) return <div>Gremio no encontrado</div>;

  const members = Array.isArray(group.Users) ? group.Users : [];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="group-detail">

      {/* ── HEADER ── */}
      <div className="header-detail">
        <h2>{group.Name}</h2>
        <div className="detail-tabs">
          <button
            className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <span className="icon">📋</span> Dashboard
          </button>
          <button
            className={`tab-btn ${activeTab === "members" ? "active" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            <span className="icon">👥</span> Miembros
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/*  TAB: DASHBOARD                                                   */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "dashboard" && (
        <div className="group-main-layout">

          {/* ── LEFT: CALENDARIO ── */}
          <div className="card calendar-section">
            <div className="calendar-header">
              <button className="btn-nav" onClick={handlePrevMonth}>‹</button>
              <strong>
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </strong>
              <button className="btn-nav" onClick={handleNextMonth}>›</button>
            </div>

            <div className="calendar-weekdays">
              {WEEKDAYS.map(d => <span key={d}>{d}</span>)}
            </div>

            <div className="calendar-grid">
              {calendarDays.map((day, i) => (
                <div key={i} className={`calendar-day ${day === null ? "empty" : ""}`}>
                  {day !== null && (
                    <>
                      <div className="day-number">{day}</div>
                      {(eventsByDay[day] ?? []).map(ev => (
                        <div key={ev.Id} className="event-marker" title={ev.Name}>
                          {ev.Name}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: SIDEBAR ── */}
          <div className="sidebar-section">

            {/* ── TAREAS ── */}
            <div className="card">
              <div className="side-header">
                <h3>✅ Tareas</h3>
                <button
                  className="btn-add"
                  title="Añadir tarea"
                  onClick={() => { setCreateType("Task"); setShowCreateForm(true); }}
                >+</button>
              </div>
              {tasks.length === 0 && (
                <p style={{ color: "#888", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                  Sin tareas. ¡Crea la primera!
                </p>
              )}
              <ul className="list-items">
                {tasks.map((t: any) => (
                  <li key={t.Id} className={t.Completed ? "completed" : ""}>
                    <input
                      type="checkbox"
                      checked={!!t.Completed}
                      onChange={() => handleToggleTask(t.Id)}
                    />
                    <span>{t.Name}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── EVENTOS ── */}
            <div className="card">
              <div className="side-header">
                <h3>📅 Eventos</h3>
                <button
                  className="btn-add"
                  title="Añadir evento"
                  onClick={() => { setCreateType("Event"); setShowCreateForm(true); }}
                >+</button>
              </div>
              {events.length === 0 && (
                <p style={{ color: "#888", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                  Sin eventos este mes.
                </p>
              )}
              <ul className="list-items">
                {events.map(ev => (
                  <li key={ev.Id}>
                    <span>📌</span>
                    <span>
                      {ev.Name}
                      {ev.EndDate instanceof Date && (
                        <small style={{ color: "#888", marginLeft: 6 }}>
                          {ev.EndDate.toLocaleDateString()}
                        </small>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── RETOS ── */}
            <div className="card">
              <div className="side-header">
                <h3>⚔️ Retos</h3>
                <button
                  className="btn-add"
                  title="Añadir reto"
                  onClick={() => { setCreateType("Challenge"); setShowCreateForm(true); }}
                >+</button>
              </div>
              {challenges.length === 0 && (
                <p style={{ color: "#888", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                  Sin retos activos.
                </p>
              )}
              <div className="challenge-container">
                {challenges.map(ch => {
                  const current = (ch as any).StatA ?? 0;
                  const total = (ch as any).StatB ?? 100;
                  const pct = Math.min(100, Math.round((current / total) * 100));
                  return (
                    <div key={ch.Id} style={{ marginBottom: "1rem" }}>
                      <strong style={{ fontSize: "0.9rem" }}>{ch.Name}</strong>
                      <div className="challenge-info">
                        <span>{current} / {total}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="challenge-controls-custom">
                        <input
                          type="number"
                          min={1}
                          value={inputAmounts[ch.Id] ?? 1}
                          onChange={e => handleInputAmount(ch.Id, Number(e.target.value))}
                        />
                        <button onClick={() => handleAddProgress(ch)}>
                          + Añadir progreso
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── P2P ── */}
            <div className="card">
              <h3>🔗 Sesión en tiempo real</h3>
              {p2pMsg && (
                <p style={{ fontSize: "0.8rem", color: "var(--primary)", margin: "0.5rem 0" }}>
                  {p2pMsg}
                </p>
              )}
              {!p2pConnected ? (
                <>
                  <button
                    className="btn-add"
                    style={{ width: "100%", borderRadius: 6, padding: "6px", marginBottom: 8 }}
                    onClick={handleCreateSession}
                  >
                    Crear sesión
                  </button>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      type="text"
                      placeholder="Código de invitación"
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value)}
                      style={{ flex: 1, padding: "4px 8px", border: "1px solid var(--primary)", borderRadius: 4 }}
                    />
                    <button
                      style={{
                        background: "var(--primary)", color: "white",
                        border: "none", borderRadius: 4, padding: "4px 10px",
                        cursor: "pointer", fontWeight: "bold"
                      }}
                      onClick={handleJoinSession}
                    >
                      Unirse
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: "0.85rem" }}>✅ Conectado</p>
                  {inviteCode && (
                    <p style={{ fontSize: "0.8rem" }}>
                      Código: <strong>{inviteCode}</strong>
                    </p>
                  )}
                </>
              )}
            </div>

          </div>{/* end sidebar-section */}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/*  TAB: MIEMBROS                                                    */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "members" && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <h3>👥 Miembros del gremio</h3>
          {members.length === 0 ? (
            <p style={{ color: "#888", marginTop: "0.5rem" }}>No hay miembros registrados.</p>
          ) : (
            <ul className="list-items">
              {members.map((m: any, i: number) => (
                <li key={m.Id ?? i}>
                  <span>👤</span>
                  <span>{m.Name ?? m.name ?? `Miembro ${i + 1}`}</span>
                  {m.Role && (
                    <small style={{ marginLeft: "auto", color: "#888" }}>{m.Role}</small>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/*  MODAL: CREAR ÍTEM                                                */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {showCreateForm && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000
          }}
          onClick={() => setShowCreateForm(false)}
        >
          <div
            className="card"
            style={{ width: "min(420px, 90vw)", padding: "1.5rem" }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "1rem" }}>
              {createType === "Task" ? "✅ Nueva Tarea"
                : createType === "Event" ? "📅 Nuevo Evento"
                : "⚔️ Nuevo Reto"}
            </h3>

            {/* Selector de tipo */}
            <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
              {(["Task", "Event", "Challenge"] as CreateType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setCreateType(t)}
                  style={{
                    flex: 1,
                    padding: "6px",
                    border: "2px solid var(--primary)",
                    borderRadius: 6,
                    background: createType === t ? "var(--primary)" : "white",
                    color: createType === t ? "white" : "var(--primary)",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  {t === "Task" ? "Tarea" : t === "Event" ? "Evento" : "Reto"}
                </button>
              ))}
            </div>

            {/* Campos comunes */}
            <input
              placeholder="Nombre *"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: "100%", marginBottom: 8, padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4 }}
            />
            <textarea
              placeholder="Descripción"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              style={{ width: "100%", marginBottom: 8, padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4, resize: "vertical" }}
            />

            {/* Campos por tipo */}
            {createType === "Task" && (
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: "0.85rem" }}>Prioridad: {priority}</label>
                <input
                  type="range" min={1} max={5} value={priority}
                  onChange={e => setPriority(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </div>
            )}

            {createType === "Event" && (
              <input
                type="datetime-local"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                style={{ width: "100%", marginBottom: 8, padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4 }}
              />
            )}

            {createType === "Challenge" && (
              <>
                <input
                  placeholder="Condición de victoria"
                  value={winCondition}
                  onChange={e => setWinCondition(e.target.value)}
                  style={{ width: "100%", marginBottom: 8, padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4 }}
                />
                <input
                  placeholder="Condición de derrota"
                  value={loseCondition}
                  onChange={e => setLoseCondition(e.target.value)}
                  style={{ width: "100%", marginBottom: 8, padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4 }}
                />
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: "0.85rem" }}>Meta: {statB}</label>
                  <input
                    type="number" min={1} value={statB}
                    onChange={e => setStatB(Number(e.target.value))}
                    style={{ width: "100%", padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4 }}
                  />
                </div>
              </>
            )}

            {/* Botones */}
            <div style={{ display: "flex", gap: 8, marginTop: "1rem" }}>
              <button
                onClick={handleCreateItem}
                style={{
                  flex: 2, background: "var(--primary)", color: "white",
                  border: "none", borderRadius: 6, padding: "8px",
                  fontWeight: "bold", cursor: "pointer"
                }}
              >
                Crear
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                style={{
                  flex: 1, background: "white", color: "var(--primary)",
                  border: "2px solid var(--primary)", borderRadius: 6, padding: "8px",
                  fontWeight: "bold", cursor: "pointer"
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GroupDetail;