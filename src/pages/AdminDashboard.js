// src/pages/AdminDashboard.js
import React from 'react';
import UserManagementView from './adminDashboard/UserManagementView';
import ClassManagementView from './adminDashboard/ClassManagementView';
import { useAppContext } from '../context/AppContext';

export default function AdminDashboard() {
    // A view é controlada pela BottomNavbar e vem do contexto
    const { view, cancellationDeadlineHours, setCancellationDeadlineHours } = useAppContext();

    // Renderiza a view de acordo com a aba/botão selecionado
    if (view === 'users') {
        return <UserManagementView />;
    }
    
    if (view === 'classes') {
        return <ClassManagementView />;
    }

    if (view === 'settings') {
        return (
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-black mb-4">Configurações Gerais</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Prazo para cancelamento (em horas)</label>
                    <input 
                        type="number" 
                        value={cancellationDeadlineHours} 
                        onChange={(e) => setCancellationDeadlineHours(Number(e.target.value))} 
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>
            </div>
        );
    }
    
    // Por padrão, exibe a tela de usuários se nenhuma outra corresponder.
    return <UserManagementView />;
}