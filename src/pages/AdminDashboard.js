// src/pages/AdminDashboard.js
import React from 'react';
import UserManagementView from './adminDashboardManagement/UserManagementView';
import ClassManagementView from './adminDashboardManagement/ClassManagementView';
import ModalityManagementView from './adminDashboardManagement/ModalityManagementView';
import PlanManagementView from './adminDashboardManagement/PlanManagementView';
import AdminHomeScreen from './adminDashboardManagement/AdminHomeScreen'; // Importe a nova tela
import { useAppContext } from '../context/AppContext';

export default function AdminDashboard() {
    const { view, setCancellationDeadlineHours, cancellationDeadlineHours } = useAppContext();

    return (
        <div className="space-y-6">
            {/* O conteúdo renderizado agora depende do 'view' do AppContext */}
            {view === 'home' && <AdminHomeScreen />}
            {view === 'users' && <UserManagementView />}
            {view === 'classes' && <ClassManagementView />}
            {view === 'modalities' && <ModalityManagementView />}
            {view === 'plans' && <PlanManagementView />}
            {view === 'settings' && (
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