// src/components/ComplecsoApp.js
import React from 'react';
import { LogOut, UserCog, RotateCcw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

import ProfilePage from '../pages/ProfilePage';
import MainContent from '../MainContent';
import BottomNavbar from './layout/BottomNavbar';
import InstallPWA from './InstallPWA';

export default function ComplecsoApp() {
  const { currentUser, handleLogout, view, setView } = useAppContext();

  const handleResetData = () => {
    if (window.confirm('Isso irá limpar todos os dados salvos e recarregar a aplicação com os dados iniciais. Deseja continuar?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className='h-screen bg-gray-100 flex flex-col font-sans'>
      {/* HEADER FIXO NO TOPO */}
      <header className='flex-shrink-0 bg-white shadow-md z-20 pt-[env(safe-area-inset-top)]'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center'>
            <h1 className='text-2xl font-bold text-black cursor-pointer' onClick={() => setView(currentUser.role === 'admin' ? 'users' : 'dashboard')}>
                Complecso
            </h1>
            <div className='flex items-center gap-2 md:gap-4'>
                <button onClick={handleResetData} className='p-2 rounded-full hover:bg-gray-200' title='Resetar dados da aplicação'>
                  <RotateCcw className='h-5 w-5 text-red-500'/>
                </button>
                <button onClick={() => setView('profile')} className='p-2 rounded-full hover:bg-gray-200' title="Meu Perfil">
                    <UserCog className='h-5 w-5 text-gray-600'/>
                </button>
                <button onClick={handleLogout} className='p-2 rounded-full hover:bg-gray-200' title="Sair">
                    <LogOut className='h-5 w-5 text-gray-600' />
                    <span className='hidden sm:inline ml-2 text-sm'>Sair</span>
                </button>
            </div>
        </div>
      </header>

      {/* ÁREA DE CONTEÚDO PRINCIPAL (COM SCROLL) */}
      {/* Ajustado o padding-bottom para dar mais espaço acima da BottomNavbar */}
      <main className='flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 md:pb-8'>
        <div className='max-w-7xl mx-auto'>
            {view === 'profile' 
                ? <ProfilePage onBack={() => setView(currentUser.role === 'admin' ? 'users' : 'dashboard')} />
                : <MainContent />
            }
        </div>
      </main>

      {/* NAVBAR E PWA (MOBILE) */}
      <BottomNavbar />
      <InstallPWA />
    </div>
  );
}