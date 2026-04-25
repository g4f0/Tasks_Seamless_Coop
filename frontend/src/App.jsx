import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

import Header from './components/Header'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import GroupsPage from './components/GroupsPage'
import GroupDetail from './components/GroupDetail'
import FriendsPage from './components/FriendsPage'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true) // Cambiar a false para login

  return (
    <Router>
      <div className="app">
        {isLoggedIn ? (
          <>
            <Header />
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/grupos" element={<GroupsPage />} />
                <Route path="/grupos/:id" element={<GroupDetail />} />
                <Route path="/amigos" element={<FriendsPage />} />
              </Routes>
            </main>
          </>
        ) : (
          <h1>Login</h1>
        )}
      </div>
    </Router>
  )
}

export default App