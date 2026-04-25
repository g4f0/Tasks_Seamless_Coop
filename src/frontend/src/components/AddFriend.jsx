import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AddFriend.css'

export default function AddFriend() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [sent, setSent] = useState(false)

  const handleSendRequest = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para enviar la petición a la base de datos
    setSent(true)
    setTimeout(() => {
      navigate('/amigos')
    }, 2000)
  }

  return (
    <div className="add-friend-container">
      <button className="btn-back" onClick={() => navigate(-1)}>◀ VOLVER A LA POSADA</button>
      
      <div className="scroll-form card">
        <header className="form-header">
          <h1>🤝 Convocar Aliado</h1>
          <p>Introduce el nombre de usuario o email para enviar un pergamino de invitación.</p>
        </header>

        {!sent ? (
          <form onSubmit={handleSendRequest} className="medieval-form">
            <div className="input-group">
              <label>Identificador del Aventurero</label>
              <input 
                type="text" 
                placeholder="Ej: jaskier_bardo@reinos.com" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                required
              />
            </div>

            <div className="search-preview">
              <p>Se buscará en todos los reinos conocidos...</p>
            </div>

            <button type="submit" className="btn-submit-epic">
              ENVIAR INVITACIÓN
            </button>
          </form>
        ) : (
          <div className="success-message">
            <div className="success-icon">🕊️</div>
            <h2>¡Pergamino Enviado!</h2>
            <p>El mensajero está en camino. Serás redirigido a tu lista de amigos...</p>
          </div>
        )}
      </div>
    </div>
  )
}