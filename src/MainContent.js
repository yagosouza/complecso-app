// src/MainContent.js
import React, { useEffect } from 'react'; // Adicione o useEffect
import { useAppContext } from './context/AppContext';

// Importe suas páginas
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ClassHistoryView from './pages/ClassHistoryView';

export default function MainContent() {
    const { currentUser, view, setView } = useAppContext(); // Obtenha o setView

    // Efeito para definir a view inicial baseada no perfil do usuário
    useEffect(() => {
        if (currentUser) {
            switch (currentUser.role) {
                case 'admin':
                    // Se a view atual não for uma das opções do admin, define para 'home'
                    const adminViews = ['home', 'users', 'classes', 'modalities', 'plans', 'settings', 'profile'];
                    if (!adminViews.includes(view)) {
                        setView('home');
                    }
                    break;
                case 'student':
                    const studentViews = ['dashboard', 'history', 'profile'];
                     if (!studentViews.includes(view)) {
                        setView('dashboard');
                    }
                    break;
                case 'teacher':
                     const teacherViews = ['dashboard', 'profile'];
                     if (!teacherViews.includes(view)) {
                        setView('dashboard');
                    }
                    break;
                default:
                    break;
            }
        }
    }, [currentUser, view, setView]);


    if (!currentUser) {
        return null; 
    }

    if (currentUser.role === 'student') {
        if (view === 'history') {
            return <ClassHistoryView />;
        }
        return <StudentDashboard />;
    }

    switch (currentUser.role) {
        case 'admin':
            return <AdminDashboard />;
        case 'teacher':
            return <TeacherDashboard />;
        default:
            return <div>Seu tipo de usuário não tem um dashboard definido.</div>;
    }
}