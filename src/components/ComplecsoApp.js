// src/components/ComplecsoApp.js
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

import ProfilePage from '../pages/ProfilePage';
import MainContent from '../MainContent';
import InstallPWA from './InstallPWA';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import BottomNavbar from './layout/BottomNavbar';

export default function ComplecsoApp() {
  const { currentUser, view, setView } = useAppContext();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Função simplificada para voltar à tela inicial de cada perfil
  const goHome = () => {
    switch (currentUser.role) {
      case 'admin':
        setView('home');
        break;
      case 'student':
      case 'teacher':
        setView('dashboard');
        break;
      default:
        break;
    }
  };

  return (
    <div className='h-screen bg-gray-50 flex font-sans'>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className='flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 md:pb-4'>
          <div className='max-w-7xl mx-auto'>
              {view === 'profile' 
                  ? <ProfilePage onBack={goHome} />
                  : <MainContent />
              }
          </div>
        </main>

        <BottomNavbar />
        <InstallPWA />
      </div>
    </div>
  );
}