// src/pages/AdminDashboard.js
import React from 'react';
import UserManagementView from './adminDashboardManagement/UserManagementView';
import ClassManagementView from './adminDashboardManagement/ClassManagementView';
import { useAppContext } from '../context/AppContext';
import { Users, CalendarDays, Settings } from 'lucide-react';

export default function AdminDashboard() {
    // A view agora é controlada tanto pela BottomNavbar (mobile) quanto pelas abas (desktop)
    const { view, setView, cancellationDeadlineHours, setCancellationDeadlineHours } = useAppContext();

    const adminNavItems = [
        { id: 'users', label: 'Usuários', icon: Users },
        { id: 'classes', label: 'Aulas', icon: CalendarDays },
        { id: 'settings', label: 'Ajustes', icon: Settings },
    ];
    
    // Garante que a view padrão para admin seja 'users' se nenhuma válida for selecionada
    const currentView = ['users', 'classes', 'settings'].includes(view) ? view : 'users';

    return (
        <div className="space-y-6">
            {/* Navegação para Desktop */}
            <div className="hidden md:block border-b border-gray-200">
                <nav className="-mb-px flex gap-8" aria-label="Tabs">
                    {adminNavItems.map(item => (
                         <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`shrink-0 flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-medium ${currentView === item.id ? 'border-black text-black' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                         >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            {/* Título para Mobile (gerado dinamicamente) */}
            <div className="md:hidden">
                <h2 className="text-2xl font-bold text-black capitalize">
                    {adminNavItems.find(item => item.id === currentView)?.label || 'Painel do Admin'}
                </h2>
            </div>

            {/* Conteúdo baseado na view */}
            {currentView === 'users' && <UserManagementView />}
            {currentView === 'classes' && <ClassManagementView />}
            {currentView === 'settings' && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold text-black mb-4">Configurações Gerais</h2>
                    <div>
                        <label htmlFor="cancellation-deadline" className="block text-sm font-medium text-gray-700">Prazo para cancelamento (em horas)</label>
                        <input 
                            id="cancellation-deadline"
                            type="number" 
                            value={cancellationDeadlineHours} 
                            onChange={(e) => setCancellationDeadlineHours(Number(e.target.value))} 
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}