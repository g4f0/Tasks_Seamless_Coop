import React, { useState } from 'react'
import './GroupDetail.css'

export default function GroupDetail() {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // --- ESTADO CHECKLIST ---
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Comprar pan', completed: false },
    { id: 2, text: 'Limpiar cocina', completed: true },
    { id: 3, text: 'Pagar internet', completed: false }
  ])

  // --- ESTADO RETOS ---
  const [challenges, setChallenges] = useState([
    { id: 1, title: '🏃 Pasos', current: 6000, goal: 10000, unit: 'pasos' },
    { id: 2, title: '💧 Agua', current: 1.5, goal: 3, unit: 'L' }
  ])
  const [inputAmounts, setInputAmounts] = useState({ 1: 0, 2: 0 })

  // --- LÓGICA CALENDARIO ---
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
  
  const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth())
  const totalCellsNeeded = Math.ceil((startingDay + totalDays) / 7) * 7
  const trailingDays = totalCellsNeeded - (startingDay + totalDays)

  // --- FUNCIONES ---
  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1))
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const updateChallenge = (id) => {
    const val = parseFloat(inputAmounts[id]) || 0
    setChallenges(challenges.map(c => 
      c.id === id ? { ...c, current: Math.max(0, parseFloat((c.current + val).toFixed(2))) } : c
    ))
    setInputAmounts({ ...inputAmounts, [id]: 0 })
  }

  return (
    <div className="group-detail">
      <div className="header-detail">
        <h2>🏠 Piso 4</h2>
        <div className="detail-tabs">
          <button className="tab-btn active">
            <span className="icon">📅</span> Dashboard
          </button>
          <button className="tab-btn">
            <span className="icon">👥</span> Miembros
          </button>
        </div>
      </div>

      <div className="group-main-layout">
        {/* IZQUIERDA: CALENDARIO */}
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

        {/* DERECHA: SIDEBAR */}
        <aside className="sidebar-section">
          <div className="card side-card">
            <div className="side-header">
              <h3>✅ Checklist</h3>
              <button className="btn-add">+</button>
            </div>
            <ul className="list-items">
              {tasks.map(task => (
                <li key={task.id} className={task.completed ? 'completed' : ''}>
                  <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} />
                  <span>{task.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card side-card">
            <h3>🏆 Retos</h3>
            {challenges.map(ch => {
              const percent = Math.min(100, (ch.current / ch.goal) * 100);
              return (
                <div key={ch.id} className="challenge-container">
                  <div className="challenge-info">
                    <span>{ch.title}</span>
                    <span>{ch.current}/{ch.goal}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: `${percent}%` }}></div>
                  </div>
                  <div className="challenge-controls-custom">
                    <input 
                      type="number" 
                      value={inputAmounts[ch.id] || ''} 
                      onChange={(e) => setInputAmounts({...inputAmounts, [ch.id]: e.target.value})}
                      placeholder="Cant."
                    />
                    <button onClick={() => updateChallenge(ch.id)}>Añadir</button>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}