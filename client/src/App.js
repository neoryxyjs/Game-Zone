import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import GamePage from './pages/GamePage';
import RankingsPage from './pages/RankingsPage';
import TeamsPage from './pages/TeamsPage';
import AboutPage from './pages/AboutPage';
import UserProfile from './components/Profile/UserProfile';
import { UserProvider, useUser } from './context/UserContext';
import './App.css';

// Componente wrapper principal
const AppContent = () => {

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/lol" element={<GamePage title="League of Legends" game="lol" />} />
          <Route path="/valorant" element={<GamePage title="Valorant" game="valorant" />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/user/:userId" element={<UserProfile />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">404 - Página no encontrada</h1><p className="mt-4">La página que buscas no existe</p></div>} />
        </Routes>
      </Layout>
    </Router>
  );
};

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
