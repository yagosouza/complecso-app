// src/context/AppContext.js

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updatePassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; // Certifique-se que você criou o arquivo src/firebase.js

// Importe seus hooks e dados iniciais
import useStickyState from '../hooks/useStickyState';
import { initialUsers, initialClasses, initialModalities, initialCategories, initialPlans } from '../constants/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // --- STATE MANAGEMENT ---
    
    // Mantemos os dados que ainda não foram migrados para o Firestore no sticky state
    const [classes, setClasses] = useStickyState(initialClasses, 'classes');
    const [modalities, setModalities] = useStickyState(initialModalities, 'modalities');
    const [categories, setCategories] = useStickyState(initialCategories, 'categories');
    const [plans, setPlans] = useStickyState(initialPlans, 'plans');
    const [users, setUsers] = useStickyState(initialUsers, 'users'); // Pode ser usado para dados temporários ou até a migração completa

    // State para o usuário logado e controle de loading
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    // State para a navegação interna da UI
    const [view, setView] = useState('dashboard');
    const [cancellationDeadlineHours, setCancellationDeadlineHours] = useStickyState(24, 'cancellationDeadline');

    // --- FIREBASE AUTH EFFECT ---

    // Efeito que roda uma vez para escutar mudanças no estado de autenticação
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Usuário está logado (ex: após login, registro ou refresh da página)
                // Busca o documento do usuário no Firestore usando o UID dele
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    // Se o documento existe, define o currentUser com os dados do Firestore
                    setCurrentUser({ uid: user.uid, ...userDocSnap.data() });
                } else {
                    // Caso raro: usuário existe no Auth mas não no Firestore. Trata como deslogado.
                    console.error("Usuário autenticado sem perfil no Firestore.");
                    setCurrentUser(null);
                }
            } else {
                // Usuário está deslogado
                setCurrentUser(null);
            }
            // Finaliza o estado de carregamento inicial
            setLoadingAuth(false);
        });

        // Retorna a função de cleanup para remover o listener ao desmontar o componente
        return () => unsubscribe();
    }, []);


    // --- FUNÇÕES DE AUTENTICAÇÃO ---

    const handleLogin = useCallback(async (email, password, callback) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            if (callback) callback(null);
        } catch (error) {
            console.error("Erro de Login:", error.code);
            if (callback) callback('Email ou senha inválidos.');
        }
    }, []);

    const handleLogout = useCallback(async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    }, []);

    const handleCreateUser = useCallback(async (newUserData, callback) => {
        // Separa email e senha do resto dos dados
        const { email, password, ...restOfData } = newUserData;
        
        try {
            // 1. Cria o usuário no Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Prepara os dados para salvar no Firestore
            const userDataForFirestore = {
                ...restOfData,
                email: email.toLowerCase(), // Salva o email em minúsculas para consistência
                createdAt: new Date(), // Adiciona data de criação
                // Valores padrão para um novo usuário
                checkedInClassIds: [],
                lateCancellations: [],
                classPacks: [],
            };
            
            // 3. Salva os dados no Firestore usando o UID como ID do documento
            await setDoc(doc(db, "users", user.uid), userDataForFirestore);

            if (callback) callback(null);

        } catch (error) {
            console.error("Erro ao criar usuário:", error.code);
            let userMessage = 'Ocorreu um erro ao criar o usuário.';
            if (error.code === 'auth/email-already-in-use') {
                userMessage = 'Este e-mail já está em uso.';
            } else if (error.code === 'auth/weak-password') {
                userMessage = 'A senha deve ter pelo menos 6 caracteres.';
            }
            if (callback) callback(userMessage);
        }
    }, []);
    
    // Alterada para não precisar da senha antiga, mais simples para o usuário
    const handleUpdatePassword = useCallback(async (newPassword, callback) => {
        if (!auth.currentUser) {
            if (callback) callback("Nenhum usuário logado.");
            return;
        }

        try {
            await updatePassword(auth.currentUser, newPassword);
            if (callback) callback(null);
        } catch (error) {
            console.error("Erro ao atualizar senha:", error.code);
            let userMessage = "Ocorreu um erro. Tente fazer login novamente antes de alterar a senha.";
            // O Firebase exige login recente para operações sensíveis como esta
            if (error.code === 'auth/requires-recent-login') {
                userMessage = "Esta operação é sensível e exige autenticação recente. Por favor, faça o login novamente antes de tentar alterar a senha.";
            }
            if (callback) callback(userMessage);
        }
    }, []);

    const handleResetPassword = useCallback(async (email, callback) => {
        try {
            await sendPasswordResetEmail(auth, email);
            if (callback) callback(null, 'Link para redefinição de senha enviado para o seu e-mail!');
        } catch (error) {
            console.error("Erro ao resetar senha:", error.code);
            if (callback) callback('Não foi possível enviar o e-mail. Verifique se o endereço está correto e tente novamente.');
        }
    }, []);
    
    // --- FUNÇÕES LEGADAS (a serem migradas para o Firebase no futuro) ---

    const handleCreateClass = useCallback((newClassData, teacherId) => {
        setClasses(prev => [...prev, { id: Date.now(), ...newClassData, teacherId, checkedInStudents: [], lateCancellations: [] }]);
    }, [setClasses]);
    
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
    
    // --- PROVIDER VALUE ---

    const value = useMemo(() => ({
        // User and Auth
        currentUser,
        loadingAuth,
        handleLogin,
        handleLogout,
        handleCreateUser,
        handleUpdatePassword,
        handleResetPassword,
        
        // App Data (a ser migrado)
        users, setUsers,
        classes, setClasses,
        modalities, setModalities,
        categories, setCategories,
        plans, setPlans,
        cancellationDeadlineHours, setCancellationDeadlineHours,

        // UI State
        view, setView,
        
        // Funções legadas
        handleCreateClass, 
        handleDeleteClass

    }), [
        currentUser, loadingAuth, users, setUsers, classes, setClasses, modalities, setModalities, 
        categories, setCategories, plans, setPlans, cancellationDeadlineHours, setCancellationDeadlineHours,
        handleLogin, handleLogout, handleUpdatePassword, handleResetPassword, handleCreateUser,
        handleCreateClass, handleDeleteClass, view, setView
    ]);

    // Não renderiza o app enquanto o Firebase não define o estado de autenticação
    if (loadingAuth) {
        return <div className="flex justify-center items-center h-screen font-bold text-lg">Carregando App...</div>;
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook customizado para usar o contexto
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};