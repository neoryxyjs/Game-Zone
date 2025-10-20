import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
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
          <Route path="/lol" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">League of Legends</h1><p className="mt-4">Página en construcción</p></div>} />
          <Route path="/valorant" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Valorant</h1><p className="mt-4">Página en construcción</p></div>} />
          <Route path="/rankings" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Rankings</h1><p className="mt-4">Página en construcción</p></div>} />
          <Route path="/teams" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Equipos</h1><p className="mt-4">Página en construcción</p></div>} />
          <Route path="/about" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Sobre Nosotros</h1><p className="mt-4">Página en construcción</p></div>} />
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
