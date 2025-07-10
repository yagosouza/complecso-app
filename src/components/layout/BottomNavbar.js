// src/components/layout/BottomNavbar.js
import React from 'react';
import { Users, CalendarDays, Home, UserCog, History  } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function BottomNavbar() {
    const { currentUser, view, setView } = useAppContext();

    if (!currentUser) return null;

    const navItems = {
        admin: [
            // Itens simplificados para o admin no mobile
            { id: 'home', label: 'Início', icon: Home },
            { id: 'users', label: 'Usuários', icon: Users },
            { id: 'classes', label: 'Aulas', icon: CalendarDays },
        ],
        teacher: [
            { id: 'dashboard', label: 'Minhas Aulas', icon: CalendarDays },
            { id: 'profile', label: 'Perfil', icon: UserCog },
        ],
        student: [
            { id: 'dashboard', label: 'Aulas', icon: Home },
            { id: 'history', label: 'Histórico', icon: History }, // Adicionado
            { id: 'profile', label: 'Perfil', icon: UserCog },
        ],
    };

    const items = navItems[currentUser.role] || [];
    if (items.length <= 1) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-lg pb-[env(safe-area-inset-bottom)] md:hidden z-50">
            <div className="flex justify-around items-center h-16">
                {items.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${view === item.id ? 'text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                        <item.icon className="h-6 w-6 mb-1" strokeWidth={view === item.id ? 2.5 : 2} />
                        <span className="text-xs font-medium">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
}