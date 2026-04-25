import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, useDataService, useDataObserver } from './../../services/DataContext';
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

const AppRoutes: React.FC = () => {
  useDataObserver();
  const dataService = useDataService();
  const isLoggedIn = !!dataService.currentUser;

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
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
          <Route path="/auth" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
};

function App() {
  return (
    <DataProvider>
      <Router>
        <div className="app">
          <AppRoutes />
        </div>
      </Router>
    </DataProvider>
  );
}

export default App;
