// src/App.js
import React from 'react';
import { useAppContext } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import GymApp from './components/ComplecsoApp';

export default function App() {
  const { currentUser } = useAppContext();

  if (!currentUser) {
    return <LoginPage />;
  }

  return <GymApp />;
}