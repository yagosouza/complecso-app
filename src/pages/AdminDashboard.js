// src/pages/AdminDashboard.js
import React, { useState } from 'react';
import UserManagementView from './AdminDashboard/UserManagementView';
import ClassManagementView from './AdminDashboard/ClassManagementView';
import { useAppContext } from '../context/AppContext';

export default function AdminDashboard() {
    const { cancellationDeadlineHours, setCancellationDeadlineHours } = useAppContext();
    const [view, setView] = useState('users');
    
    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex justify-center border-b border-gray-200 mb-6">
                <button onClick={() => setView('users')} className={`px-6 py-3 font-semibold ${view === 'users' ? 'border-b-2 border-[#ddfb3b] text-black' : 'text-gray-500'}`}>
                    Usuários
                </button>
                <button onClick={() => setView('classes')} className={`px-6 py-3 font-semibold ${view === 'classes' ? 'border-b-2 border-[#ddfb3b] text-black' : 'text-gray-500'}`}>
                    Aulas
                </button>
                <button onClick={() => setView('settings')} className={`px-6 py-3 font-semibold ${view === 'settings' ? 'border-b-2 border-[#ddfb3b] text-black' : 'text-gray-500'}`}>
                    Configurações
                </button>
            </div>
            
            {view === 'users' && <UserManagementView />}
            {view === 'classes' && <ClassManagementView />}
            
            {view === 'settings' && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold text-black mb-4">Configurações Gerais</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Prazo para cancelamento sem perda de crédito (em horas)</label>
                        <input 
                            type="number" 
                            value={cancellationDeadlineHours} 
                            onChange={(e) => setCancellationDeadlineHours(Number(e.target.value))} 
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}