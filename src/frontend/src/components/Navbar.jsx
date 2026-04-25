import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const location = useLocation();

  // Función para saber qué pestaña está activa
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/')}`}>
          🏠 Dashboard
        </Link>
        <Link to="/grupos" className={`nav-link ${isActive('/grupos')}`}>
          🛡️ Gremios
        </Link>
        <Link to="/amigos" className={`nav-link ${isActive('/amigos')}`}>
          👥 Amigos
        </Link>
      </div>
    </nav>
  )
}