import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string): string => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/')}`}>🏠 Dashboard</Link>
        <Link to="/grupos" className={`nav-link ${isActive('/grupos')}`}>🛡️ Gremios</Link>
        <Link to="/amigos" className={`nav-link ${isActive('/amigos')}`}>👥 Amigos</Link>
      </div>
    </nav>
  );
};

export default Navbar;