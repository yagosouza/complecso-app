// src/pages/adminDashboardManagement/AdminHomeScreen.js
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Users, Calendar, CheckCircle } from 'lucide-react';

// Componente para os cards de estatísticas
const StatCard = ({ icon, title, value, color }) => {
    const IconComponent = icon;
    return (
        <div className={`bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 border-l-4 ${color}`}>
            <div className="p-3 bg-gray-100 rounded-full">
                <IconComponent className="h-6 w-6 text-gray-700" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-black">{value}</p>
            </div>
        </div>
    );
};


export default function AdminHomeScreen() {
    const { users, classes } = useAppContext();

    // 1. Total de Alunos
    const totalStudents = users.filter(u => u.role === 'student').length;

    // 2. Alunos Ativos (considerando alunos com check-in em aulas futuras)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeStudentIds = new Set(
        classes
            .filter(c => new Date(c.date) >= today)
            .flatMap(c => c.checkedInStudents)
    );
    const activeStudents = activeStudentIds.size;

    // 3. Aulas no Dia
    const classesToday = classes.filter(c => {
        const classDate = new Date(c.date);
        return classDate.getFullYear() === today.getFullYear() &&
               classDate.getMonth() === today.getMonth() &&
               classDate.getDate() === today.getDate();
    }).length;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-black">Início</h1>
            <p className="text-gray-600">Bem-vindo ao seu painel de controle. Aqui está um resumo rápido do seu negócio.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    icon={Users} 
                    title="Total de Alunos" 
                    value={totalStudents}
                    color="border-blue-500"
                />
                <StatCard 
                    icon={CheckCircle} 
                    title="Alunos Ativos" 
                    value={activeStudents}
                    color="border-green-500"
                />
                <StatCard 
                    icon={Calendar} 
                    title="Aulas Agendadas Hoje" 
                    value={classesToday}
                    color="border-yellow-500"
                />
            </div>

            {/* Aqui você pode adicionar mais seções no futuro, como um gráfico de crescimento ou uma lista de próximas aulas */}
        </div>
    );
}