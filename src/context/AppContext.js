// src/context/AppContext.js
import React, { createContext, useContext, useMemo, useCallback, useState } from 'react';
import useStickyState from '../hooks/useStickyState';
import { initialUsers, initialClasses } from '../constants/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [users, setUsers] = useStickyState(initialUsers, 'users');
    const [classes, setClasses] = useStickyState(initialClasses, 'classes');
    const [currentUser, setCurrentUser] = useStickyState(null, 'currentUser');
    const [cancellationDeadlineHours, setCancellationDeadlineHours] = useStickyState(24, 'cancellationDeadline');
    const [view, setView] = useState('dashboard');

    const handleLogin = useCallback((username, password, callback) => {
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
        if (user) {
            if (user.status === 'active') {
                setCurrentUser(user);
                if (callback) callback(null);
            } else {
                if (callback) callback('Usuário inativo. Por favor, entre em contato com o suporte.');
            }
        } else {
            if (callback) callback('Usuário ou senha inválidos.');
        }
    }, [users, setCurrentUser]);

    const handleLogout = useCallback(() => {
        setCurrentUser(null);
    }, [setCurrentUser]);

    const handleUpdatePassword = useCallback((userId, oldPassword, newPassword, callback) => {
        const user = users.find(u => u.id === userId);
        if (user && user.password === oldPassword) {
            setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, password: newPassword } : u));
            callback(null);
        } else {
            callback('A senha atual está incorreta.');
        }
    }, [users, setUsers]);

    const handleResetPassword = useCallback((userId) => {
        if (window.confirm('Tem certeza que deseja redefinir a senha deste usuário para "password"?')) {
            setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, password: 'password' } : u));
            alert('Senha redefinida com sucesso!');
        }
    }, [setUsers]);
    
    const handleCreateClass = useCallback((newClassData, teacherId) => {
        setClasses(prev => [...prev, { id: Date.now(), ...newClassData, teacherId, checkedInStudents: [], lateCancellations: [] }]);
    }, [setClasses]);

    const handleCreateUser = useCallback((newUserData) => {
        setUsers(prev => [...prev, { id: Date.now(), ...newUserData }]);
    }, [setUsers]);

    const handleDeleteClass = useCallback((classId) => {
        if (!classId) return;
        setUsers(currentUsers => currentUsers.map(user => {
            if (user.role === 'student' && user.checkedInClassIds.includes(classId)) {
                return { ...user, checkedInClassIds: user.checkedInClassIds.filter(id => id !== classId) };
            }
            return user;
        }));
        setClasses(currentClasses => currentClasses.filter(c => c.id !== classId));
    }, [setUsers, setClasses]);

    const value = useMemo(() => ({
        users,
        setUsers,
        classes,
        setClasses,
        currentUser,
        setCurrentUser,
        cancellationDeadlineHours,
        setCancellationDeadlineHours,
        handleLogin,
        handleLogout,
        handleUpdatePassword,
        handleResetPassword,
        handleCreateClass,
        handleCreateUser,
        handleDeleteClass, 
        view, 
        setView
    }), [
        users, setUsers, classes, setClasses, currentUser, setCurrentUser, 
        cancellationDeadlineHours, setCancellationDeadlineHours,
        handleLogin, handleLogout, handleUpdatePassword, handleResetPassword, 
        handleCreateClass, handleCreateUser, handleDeleteClass, 
        view, setView
    ]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};