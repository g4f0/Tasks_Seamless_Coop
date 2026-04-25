import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataService } from '../../../services/DataContext';
import './AddFriend.css';

const AddFriend: React.FC = () => {
  const navigate = useNavigate();
  const dataService = useDataService();
  const [searchTerm, setSearchTerm] = useState('');
  const [resultMsg, setResultMsg] = useState<string>('');
  const [sent, setSent] = useState(false);

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const target = dataService.users.find(u => u.Name.toLowerCase() === searchTerm.trim().toLowerCase());

    if (!target) {
      setResultMsg("Usuario no encontrado.");
      setSent(false);
      return;
    }

    const res = dataService.sendFriendRequest(target);
    setResultMsg(res.message);
    setSent(res.ok);

    if (res.ok) {
      setTimeout(() => navigate('/amigos'), 1200);
    }
  };

  return (
    <div className="add-friend-container">
      <button className="btn-back" onClick={() => navigate(-1)}>◀ VOLVER A LA POSADA</button>
      <div className="scroll-form card">
        <header className="form-header">
          <h1>🤝 Convocar Aliado</h1>
          <p>Introduce el nombre de usuario para enviar invitación.</p>
        </header>

        <form onSubmit={handleSendRequest} className="medieval-form">
          <div className="input-group">
            <label>Nombre del Aventurero</label>
            <input type="text" placeholder="Ej: Ana" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} required />
          </div>
          <button type="submit" className="btn-submit-epic">ENVIAR INVITACIÓN</button>
        </form>

        {resultMsg && (
          <p style={{ marginTop: 12, color: sent ? 'green' : 'crimson' }}>{resultMsg}</p>
        )}
      </div>
    </div>
  );
};

export default AddFriend;
