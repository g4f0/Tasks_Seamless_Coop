import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CreateGroup.css'

export default function CreateGroup() {
  const navigate = useNavigate()
  
  const [groupName, setGroupName] = useState('')
  const [description, setDescription] = useState('') // Estado para la descripción
  const [selectedFriends, setSelectedFriends] = useState([])

  // Lista de amigos disponibles
  const myFriends = [
    { id: 1, name: 'Ana', avatar: '👤' },
    { id: 2, name: 'Bruno', avatar: '👤' },
    { id: 3, name: 'Carlos', avatar: '👤' },
    { id: 4, name: 'Elena', avatar: '👤' }
  ]

  const handleSelectFriend = (e) => {
    const friendId = parseInt(e.target.value)
    if (!friendId) return

    if (!selectedFriends.find(f => f.id === friendId)) {
      const friendToAdd = myFriends.find(f => f.id === friendId)
      setSelectedFriends([...selectedFriends, friendToAdd])
    }
    e.target.value = ""
  }

  const removeFriend = (id) => {
    setSelectedFriends(selectedFriends.filter(f => f.id !== id))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({
      nombre: groupName,
      descripcion: description,
      aliados: selectedFriends
    })
    navigate('/') 
  }

  return (
    <div className="create-group-container">
      <button className="btn-back" onClick={() => navigate(-1)}>◀ VOLVER AL MAPA</button>
      
      <div className="scroll-form card">
        <header className="form-header">
          <h1>📜 Fundar Gremio</h1>
          <p>Define tu propósito y convoca a tus aliados más leales.</p>
        </header>

        <form onSubmit={handleSubmit} className="medieval-form">
          {/* NOMBRE */}
          <div className="input-group">
            <label>Nombre del Gremio</label>
            <input 
              type="text" 
              placeholder="Ej: Los Guardianes del Sofá..." 
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div className="input-group">
            <label>Crónica del Gremio (Descripción)</label>
            <textarea 
              placeholder="Escribe aquí los objetivos o reglas de tu alianza..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            />
          </div>

          {/* SELECTOR DE AMIGOS */}
          <div className="input-group">
            <label>Convocar Aliados</label>
            <select className="medieval-select" onChange={handleSelectFriend} defaultValue="">
              <option value="" disabled>Selecciona un aliado para invitar...</option>
              {myFriends.map(friend => (
                <option key={friend.id} value={friend.id}>
                  {friend.name}
                </option>
              ))}
            </select>

            {/* CHIPS DE AMIGOS SELECCIONADOS */}
            <div className="selected-friends-list">
              {selectedFriends.length === 0 && <p className="no-friends">Aún no has convocado a ningún aliado...</p>}
              {selectedFriends.map(friend => (
                <div key={friend.id} className="friend-chip">
                  <span>{friend.avatar} {friend.name}</span>
                  <button type="button" onClick={() => removeFriend(friend.id)} className="btn-remove-chip">×</button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-submit-epic">
            FUNDAR GREMIO
          </button>
        </form>
      </div>
    </div>
  )
}