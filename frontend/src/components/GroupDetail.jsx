import React from 'react'
import './GroupDetail.css'

export default function GroupDetail() {
  return (
    <div className="group-detail">
      <h2>🏠 Piso 4</h2>
      
      <div className="detail-tabs">
        <button className="tab-btn active">📅 Eventos</button>
        <button className="tab-btn">🏆 Retos</button>
        <button className="tab-btn">✅ Tareas</button>
        <button className="tab-btn">👥 Miembros</button>
      </div>

      <div className="detail-content">
        <h3>📅 Eventos del grupo</h3>
        <div className="card">
          <h4>🍽️ Cena en grupo</h4>
          <p>Viernes 26 Abril, 20:00</p>
          <p>Importancia: 🔴🔴🔴</p>
          <button className="btn">Ver detalles</button>
        </div>
      </div>
    </div>
  )
}