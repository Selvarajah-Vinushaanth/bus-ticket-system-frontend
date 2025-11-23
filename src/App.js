import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import AnimatedBackground from './components/AnimatedBackground';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TicketGenerator from './components/TicketGenerator';
import TicketHistory from './components/TicketHistory';
import Statistics from './components/Statistics';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('conductor');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('conductor', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('conductor');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <AnimatedBackground />
      <Router>
        <div className="App">
          <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
          />
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/ticket"
            element={user ? <TicketGenerator user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/history"
            element={user ? <TicketHistory user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/statistics"
            element={user ? <Statistics user={user} /> : <Navigate to="/login" />}
          />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;

