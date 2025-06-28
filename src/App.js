// src/App.js
import React, { useState } from 'react';
import { LogOut, UserCog } from 'lucide-react';
import { useAppContext } from './context/AppContext';

import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import MainContent from './MainContent'; // Importe o novo MainContent

export default function App() {
  const { currentUser, handleLogout } = useAppContext();
  const [view, setView] = useState('dashboard');

  // Se não houver usuário logado, mostre a página de login.
  if (!currentUser) {
    return <LoginPage />;
  }

  // Se o usuário estiver logado, mostre o layout principal.
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-black cursor-pointer" onClick={() => setView('dashboard')}>Complecso</h1>
            <div className="flex items-center gap-4">
                <span className="text-gray-800 hidden sm:block">Bem-vindo(a), <strong>{currentUser.name}</strong></span>
                <button onClick={() => setView('profile')} className="p-2 rounded-full hover:bg-gray-200"><UserCog className="h-5 w-5 text-gray-600"/></button>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"><LogOut className="h-5 w-5" />Sair</button>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {view === 'dashboard' ? (
            <MainContent />
        ) : (
            <ProfilePage onBack={() => setView('dashboard')} />
        )}
      </main>
    </div>
  );
}