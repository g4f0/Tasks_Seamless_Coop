import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group } from '../../../backend/group';
import { User } from '../../../backend/user';
import { useDataService } from '../../../services/DataContext';
import './CreateGroup.css';

const CreateGroup: React.FC = () => {
  const navigate = useNavigate();
  const dataService = useDataService();
  const myFriends = dataService.currentUser?.Friends ?? [];

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<User[]>([]);

  const handleSelectFriend = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const friendId = parseInt(e.target.value);
    if (!friendId) return;
    const friend = myFriends.find(f => f.Id === friendId);
    if (friend && !selectedFriends.some(f => f.Id === friendId)) {
      setSelectedFriends([...selectedFriends, friend]);
    }
    e.target.value = "";
  };

  const removeFriend = (id: number) => {
    setSelectedFriends(selectedFriends.filter(f => f.Id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) return;

    const newGroup = new Group(groupName.trim(), description.trim());

    // Añadimos invitados seleccionados
    selectedFriends.forEach(f => newGroup.Users.push(f));
    
    // Añadimos creador (si existe)
    if (dataService.currentUser && !newGroup.Users.some(u => u.Id === dataService.currentUser!.Id)) {
      newGroup.Users.push(dataService.currentUser);
    }

    const res = dataService.addGroup(newGroup);

    if (res.ok) {
      navigate('/grupos');
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="create-group-container">
      <button className="btn-back" onClick={() => navigate(-1)}>◀ VOLVER AL MAPA</button>
      <div className="scroll-form card">
        <header className="form-header">
          <h1>📜 Fundar Gremio</h1>
          <p>Define tu propósito y convoca a tus aliados más leales.</p>
        </header>
        <form onSubmit={handleSubmit} className="medieval-form">
          <div className="input-group">
            <label>Nombre del Gremio</label>
            <input
              type="text"
              placeholder="Ej: Los Guardianes del Sofá..."
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Crónica del Gremio (Descripción)</label>
            <textarea
              placeholder="Escribe aquí los objetivos o reglas de tu alianza..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="input-group">
            <label>Convocar Aliados</label>
            <select className="medieval-select" onChange={handleSelectFriend} defaultValue="">
              <option value="" disabled>Selecciona un aliado para invitar...</option>
              {myFriends.map(friend => (
                <option key={friend.Id} value={friend.Id}>{friend.Name}</option>
              ))}
            </select>

            <div className="selected-friends-list">
              {selectedFriends.length === 0 && <p className="no-friends">Aún no has convocado a ningún aliado...</p>}
              {selectedFriends.map(friend => (
                <div key={friend.Id} className="friend-chip">
                  <span>👤 {friend.Name}</span>
                  <button type="button" onClick={() => removeFriend(friend.Id)} className="btn-remove-chip">×</button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-submit-epic">FUNDAR GREMIO</button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
