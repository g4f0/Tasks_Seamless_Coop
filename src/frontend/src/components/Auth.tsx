import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataService } from '../../../services/DataContext';
import './Auth.css';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const dataService = useDataService();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const ok = dataService.login(emailOrUser, password);
      if (!ok) {
        setError('Credenciales incorrectas.');
        return;
      }
      navigate('/');
      return;
    }

    if (password !== password2) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const registerName = username.trim() || emailOrUser.split('@')[0];
    const ok = dataService.register(registerName, password);
    if (!ok) {
      setError('No se pudo registrar (usuario ya existe o datos inválidos).');
      return;
    }
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
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tu nombre o apodo..." />
            </div>
          )}
          <div className="input-group">
            <label>{isLogin ? 'Usuario o Email' : 'Email'}</label>
            <input
              type="text"
              placeholder="aventurero@gremio.com o Usuario"
              value={emailOrUser}
              onChange={(e) => setEmailOrUser(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {!isLogin && (
            <div className="input-group">
              <label>Confirmar Contraseña</label>
              <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="••••••••" required />
            </div>
          )}

          {error && <p style={{ color: 'crimson', marginTop: 8 }}>{error}</p>}

          <button type="submit" className="btn-auth-submit">
            {isLogin ? 'ENTRAR AL CASTILLO' : 'FUNDAR CUENTA'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
