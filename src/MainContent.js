// src/MainContent.js
import React from 'react';
import { useAppContext } from './context/AppContext';

// Importe suas páginas
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';

export default function MainContent() {
    const { currentUser } = useAppContext();

    if (!currentUser) {
        return null; // ou um spinner de carregamento
    }

    switch (currentUser.role) {
        case 'admin':
            return <AdminDashboard />;
        case 'student':
            return <StudentDashboard />;
        case 'teacher':
            return <TeacherDashboard />;
        default:
            return <div>Seu tipo de usuário não tem um dashboard definido.</div>;
    }
}