import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(isLogin ? "Iniciando sesión..." : "Registrando usuario...");
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <div className="auth-tabs">
          <button className={`tab-btn ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Iniciar Sesión</button>
          <button className={`tab-btn ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Registrarse</button>
        </div>
        <header className="auth-header">
          <h2>{isLogin ? '🏰 Bienvenido de nuevo' : '📜 Crea tu cuenta'}</h2>
          <p>{isLogin ? 'Introduce tus credenciales' : 'Únete a la alianza de tareas'}</p>
        </header>
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <label>Nombre de Usuario</label>
              <input type="text" placeholder="Tu nombre o apodo..." required />
            </div>
          )}
          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="aventurero@gremio.com" required />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input type="password" placeholder="••••••••" required />
          </div>
          {!isLogin && (
            <div className="input-group">
              <label>Confirmar Contraseña</label>
              <input type="password" placeholder="••••••••" required />
            </div>
          )}
          <button type="submit" className="btn-auth-submit">
            {isLogin ? 'ENTRAR AL CASTILLO' : 'FUNDAR CUENTA'}
          </button>
        </form>
        <p className="auth-footer">
          {isLogin ? "¿Aún no tienes cuenta? Dale a Registrarse arriba." : "¿Ya eres miembro? Inicia sesión arriba."}
        </p>
      </div>
    </div>
  );
};

export default Auth;