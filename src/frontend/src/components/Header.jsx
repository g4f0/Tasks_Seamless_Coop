import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Header.css'

export default function Header() {
  const navigate = useNavigate()
  
  // Estados para controlar los dos menús desplegables
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  // Datos de ejemplo para las solicitudes
  const [requests, setRequests] = useState([
    { id: 1, name: 'Diego', avatar: '🛡️' },
    { id: 2, name: 'Lucía', avatar: '🏹' }
  ])

  // Funciones de control
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
    setShowUserMenu(false) // Cerrar el otro si se abre este
  }

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
    setShowNotifications(false) // Cerrar el otro si se abre este
  }

  const handleAction = (path) => {
    setShowUserMenu(false)
    setShowNotifications(false)
    navigate(path)
  }

  const removeRequest = (id) => {
    setRequests(requests.filter(r => r.id !== id))
  }

  return (
    <header className="main-header">
      <div className="header-left">
        <h2 className="header-logo" onClick={() => navigate('/')}>
          🏰 Tasks Seamless Coop 🐉
        </h2>
      </div>

      <div className="header-right">
        {/* SECCIÓN NOTIFICACIONES (CAMPANA) */}
        <div className="header-item">
          <button className="header-btn bell-btn" onClick={toggleNotifications}>
            🔔 
            {requests.length > 0 && <span className="header-badge">{requests.length}</span>}
          </button>

          {showNotifications && (
            <div className="header-dropdown card">
              <h4 className="dropdown-title">Solicitudes de Alianza</h4>
              {requests.length === 0 ? (
                <p className="empty-text">No hay mensajes nuevos...</p>
              ) : (
                requests.map(req => (
                  <div key={req.id} className="dropdown-row">
                    <span>{req.avatar} {req.name}</span>
                    <div className="row-actions">
                      <button className="mini-btn ok" onClick={() => removeRequest(req.id)}>✅</button>
                      <button className="mini-btn no" onClick={() => removeRequest(req.id)}>❌</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* SECCIÓN USUARIO */}
        <div className="header-item">
          <button className="header-btn user-btn" onClick={toggleUserMenu}>
            👤 Usuario
          </button>

          {showUserMenu && (
            <div className="header-dropdown card user-menu">
              <button className="menu-link" onClick={() => handleAction('/mi-perfil')}>
                🖼️ Ver mi Perfil
              </button>
              <div className="divider"></div>
              <button className="menu-link auth-link" onClick={() => handleAction('/auth')}>
                🔑 Iniciar Sesión / Registro
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}