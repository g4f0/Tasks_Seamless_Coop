import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './../../services/DataContext';
import './App.css';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import GroupsPage from './components/GroupsPage';
import GroupDetail from './components/GroupDetail';
import FriendsPage from './components/FriendsPage';
import CreateGroup from './components/CreateGroup';
import AddFriend from './components/AddFriend';
import UserProfile from './components/UserProfile';
import Auth from './components/Auth';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return (
    <DataProvider>
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
                  <Route path="/crear-gremio" element={<CreateGroup />} />
                  <Route path="/añadir-amigo" element={<AddFriend />} />
                  <Route path="/mi-perfil" element={<UserProfile />} />
                  <Route path="/auth" element={<Auth />} />
                </Routes>
              </main>
            </>
          ) : (
            <h1>Login</h1>
          )}
        </div>
      </Router>
    </DataProvider>
  );
}

export default App;