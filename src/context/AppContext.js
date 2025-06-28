// src/context/AppContext.js
import React, { createContext, useContext, useMemo, useCallback } from 'react';
import useStickyState from '../hooks/useStickyState';
import { initialUsers, initialClasses } from '../constants/mockData';
import { getBillingCycle } from '../utils/helpers';

const AppContext = createContext();
const today = new Date();

export const AppProvider = ({ children }) => {
    const [users, setUsers] = useStickyState(initialUsers, 'users');
    const [classes, setClasses] = useStickyState(initialClasses, 'classes');
    const [currentUser, setCurrentUser] = useStickyState(null, 'currentUser');
    const [cancellationDeadlineHours, setCancellationDeadlineHours] = useStickyState(24, 'cancellationDeadline');

    // --- Funções Estabilizadas com useCallback ---

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

    const handleAddExtraClasses = useCallback((userId, count, displayedDate) => {
        const monthIdentifier = `${displayedDate.getFullYear()}-${displayedDate.getMonth()}`;
        setUsers(prevUsers => prevUsers.map(u => {
            if (u.id === userId) {
                const newPlan = { ...u.plan };
                let extraClasses = [...(newPlan.extraClasses || [])];
                const monthIndex = extraClasses.findIndex(e => e.month === monthIdentifier);
                if (monthIndex > -1) {
                    extraClasses[monthIndex] = { ...extraClasses[monthIndex], count: extraClasses[monthIndex].count + count };
                } else {
                    extraClasses.push({ month: monthIdentifier, count });
                }
                return { ...u, plan: { ...newPlan, extraClasses } };
            }
            return u;
        }));
    }, [setUsers]);

    const handleCheckIn = useCallback((studentId, classId) => {
        const student = users.find(u => u.id === studentId);
        const aClass = classes.find(c => c.id === classId);
        if (!student || !aClass) return;

        // ... (resto da lógica de check-in) ...
        const { start, end } = getBillingCycle(student.paymentDueDate);
        const usedInBillingCycle = student.checkedInClassIds.filter(id => {
            const c = classes.find(cls => cls.id === id);
            return c && c.date >= start && c.date <= end;
        }).length;
        
        const extraClassesForMonth = student.plan.extraClasses?.find(ec => ec.month === `${today.getFullYear()}-${today.getMonth()}`)?.count || 0;
        if (student.plan.total + extraClassesForMonth - usedInBillingCycle <= 0) {
            alert("Você não tem créditos de aula suficientes para este ciclo.");
            return;
        }

        setUsers(currentUsers => currentUsers.map(u => u.id === studentId ? { ...u, checkedInClassIds: [...u.checkedInClassIds, classId] } : u));
        setClasses(currentClasses => currentClasses.map(c => c.id === classId ? { ...c, checkedInStudents: [...c.checkedInStudents, studentId] } : c));
    }, [users, classes, setUsers, setClasses]);

    const performNormalCancellation = useCallback((studentId, classId) => {
        setUsers(currentUsers => currentUsers.map(u => u.id === studentId ? { ...u, checkedInClassIds: u.checkedInClassIds.filter(id => id !== classId) } : u));
        setClasses(currentClasses => currentClasses.map(c => c.id === classId ? { ...c, checkedInStudents: c.checkedInStudents.filter(id => id !== studentId) } : c));
    }, [setUsers, setClasses]);

    const performLateCancellation = useCallback((studentId, classId) => {
        setClasses(currentClasses => currentClasses.map(c => {
            if (c.id === classId) {
                return { ...c, checkedInStudents: c.checkedInStudents.filter(id => id !== studentId), lateCancellations: [...(c.lateCancellations || []), studentId] };
            }
            return c;
        }));
    }, [setClasses]);
    
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

    // --- Objeto de Contexto Memorizado ---

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
        handleAddExtraClasses,
        handleCheckIn,
        performNormalCancellation,
        performLateCancellation,
        handleCreateClass,
        handleCreateUser,
        handleDeleteClass,
    }), [
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
        handleAddExtraClasses, 
        handleCheckIn, 
        performNormalCancellation, 
        performLateCancellation, 
        handleCreateClass, 
        handleCreateUser, 
        handleDeleteClass
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