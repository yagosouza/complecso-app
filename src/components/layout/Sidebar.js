// src/components/layout/Sidebar.js
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Users, CalendarDays, Settings, Dumbbell, Receipt, Home, UserCog, LogOut, RotateCcw, History } from 'lucide-react';

// Componente interno para o conteúdo, para evitar repetição
const SidebarContent = ({ onLinkClick }) => {
    const { currentUser, view, setView, handleLogout } = useAppContext();

    const handleResetData = () => {
        if (window.confirm('Isso irá limpar todos os dados salvos e recarregar a aplicação com os dados iniciais. Deseja continuar?')) {
          localStorage.clear();
          window.location.reload();
        }
    };

    const navItems = {
        admin: [
            { id: 'home', label: 'Início', icon: Home },
            { id: 'users', label: 'Usuários', icon: Users },
            { id: 'classes', label: 'Aulas', icon: CalendarDays },
            { id: 'modalities', label: 'Modalidades', icon: Dumbbell },
            { id: 'plans', label: 'Planos', icon: Receipt },
            { id: 'settings', label: 'Ajustes', icon: Settings },
        ],
        teacher: [
            { id: 'dashboard', label: 'Minhas Aulas', icon: CalendarDays },
        ],
        student: [
            { id: 'dashboard', label: 'Aulas', icon: Home },
            { id: 'history', label: 'Histórico', icon: History },
        ],
    };

    const items = navItems[currentUser.role] || [];
    const isActive = (itemId) => itemId === view;

    const handleButtonClick = (viewId) => {
        setView(viewId);
        if (onLinkClick) onLinkClick();
    };

    return (
        // Layout flexível com padding para a safe area superior e inferior
        <div className="flex flex-col h-full bg-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            <div className="p-6 border-b">
                <h1 className='text-2xl font-bold text-black'>Complecso</h1>
                <p className="text-sm text-gray-500 mt-2">Olá, {currentUser.name}!</p>
            </div>
            
            {/* A área de navegação agora é a única parte que rola, se necessário */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {items.map(item => (
                    <button key={item.id} onClick={() => handleButtonClick(item.id)} className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 text-sm font-medium ${isActive(item.id) ? 'bg-[#ddfb3b] text-black' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}>
                        <item.icon className="h-5 w-5 mr-3" />
                        <span>{item.label}</span>
                    </button>
                ))}
                 <button key="profile" onClick={() => handleButtonClick('profile')} className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 text-sm font-medium ${isActive('profile') ? 'bg-[#ddfb3b] text-black' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}>
                    <UserCog className="h-5 w-5 mr-3" />
                    <span>Meu Perfil</span>
                </button>
            </nav>

            {/* Rodapé da sidebar, sempre visível na parte inferior */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 space-y-2">
                 <button onClick={handleResetData} className="w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50" title='Resetar dados da aplicação'>
                  <RotateCcw className='h-5 w-5 mr-3'/>
                  Resetar Dados
                </button>
                <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100" title="Sair">
                    <LogOut className='h-5 w-5 mr-3' />
                    <span>Sair</span>
                </button>
            </div>
        </div>
    );
};


// Componente principal da Sidebar
export default function Sidebar({ isOpen, onClose }) {
    return (
        <>
            {/* Desktop: sidebar fixa */}
            <aside className="w-64 flex-col flex-shrink-0 hidden md:flex">
                <SidebarContent />
            </aside>
            
            {/* Mobile: sidebar como gaveta (drawer) */}
            <div className={`fixed inset-0 z-30 md:hidden ${isOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
                
                {/* A altura da sidebar mobile considera o espaço da BottomNavbar (h-16) */}
                <aside className={`fixed top-0 left-0 bottom-16 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <SidebarContent onLinkClick={onClose} />
                </aside>
            </div>
        </>
    );
}