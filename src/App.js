// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; // Importe a nova página
import GymApp from './components/ComplecsoApp';

export default function App() {
  const { currentUser } = useAppContext();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!currentUser ? <RegisterPage /> : <Navigate to="/" />} />
        <Route path="/*" element={currentUser ? <GymApp /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}