import React from 'react'
import './Dashboard.css'

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h2>Bienvenido! 👋</h2>
      
      <div className="dashboard-grid">
        <div className="card">
          <h3>🎯 Mis Grupos</h3>
          <ul>
            <li>🏠 Piso 4</li>
            <li>✈️ Viaje Verano</li>
            <li>💪 Gym Friends</li>
          </ul>
          <button className="btn">+ Crear grupo</button>
        </div>

        <div className="card">
          <h3>📅 Próximos (3)</h3>
          <ul>
            <li>• Cena Grupo</li>
            <li>• Reto Pasos</li>
            <li>• Comprar leche</li>
          </ul>
          <a href="/grupos" className="btn">Ver todos</a>
        </div>

        <div className="card">
          <h3>🏆 Mis Retos (2)</h3>
          <p>• Pasos (30.5%)</p>
          <p>• Gym (40%)</p>
          <button className="btn">+ Crear reto</button>
        </div>

        <div className="card">
          <h3>✅ Mis Checklists</h3>
          <p>Activos: 3</p>
          <p>• Compras (20%)</p>
          <p>• Limpiar (60%)</p>
          <button className="btn">+ Crear check</button>
        </div>
      </div>
    </div>
  )
}