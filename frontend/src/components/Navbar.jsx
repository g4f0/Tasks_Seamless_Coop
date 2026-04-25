import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="nav-link">📊 Dashboard</Link>
        <Link to="/amigos" className="nav-link">👥 Amigos</Link>
        <Link to="/grupos" className="nav-link">🎯 Grupos</Link>
        <a href="#" className="nav-link">⚙️ Perfil</a>
      </div>
    </nav>
  )
}