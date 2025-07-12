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
import {
    collection, onSnapshot, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, writeBatch, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import useStickyState from '../hooks/useStickyState';
import { calculateTotalClasses } from '../utils/classHelpers';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // --- STATES ---
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [users, setUsers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [modalities, setModalities] = useState([]);
    const [plans, setPlans] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [view, setView] = useState('dashboard');
    const [cancellationDeadlineHours, setCancellationDeadlineHours] = useStickyState(24, 'cancellationDeadline');

    // --- REAL-TIME DATA FETCHING ---
    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                setCurrentUser(userDocSnap.exists() ? { uid: user.uid, ...userDocSnap.data() } : null);
            } else {
                setCurrentUser(null);
            }
            setLoadingAuth(false);
        });

        const unsubUsers = onSnapshot(collection(db, "users"), snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        const unsubClasses = onSnapshot(collection(db, "classes"), snap => {
            setClasses(snap.docs.map(d => ({ id: d.id, ...d.data(), date: d.data().date?.toDate() })));
        });
        const unsubModalities = onSnapshot(collection(db, "modalities"), snap => setModalities(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        const unsubCategories = onSnapshot(collection(db, "categories"), snap => setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        const unsubPlans = onSnapshot(collection(db, "plans"), snap => {
            setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoadingData(false);
        });

        return () => { unsubAuth(); unsubUsers(); unsubClasses(); unsubModalities(); unsubCategories(); unsubPlans(); };
    }, []);

    // --- FUNÇÕES DE AUTENTICAÇÃO E CRUD ---
    
    const handleLogin = useCallback(async (email, password, callback) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            if (callback) callback(null);
        } catch (error) {
            if (callback) callback('Email ou senha inválidos.');
        }
    }, []);

    const handleLogout = useCallback(() => signOut(auth), []);
    
    const handleResetPassword = useCallback(async (email, callback) => {
        try {
            await sendPasswordResetEmail(auth, email);
            if (callback) callback(null, 'Link para redefinição de senha enviado!');
        } catch (error) {
            if (callback) callback('Erro ao enviar e-mail. Verifique o endereço.');
        }
    }, []);

    const handleUpdatePassword = useCallback(async (newPassword, callback) => {
        if (!auth.currentUser) return callback("Nenhum usuário logado.");
        try {
            await updatePassword(auth.currentUser, newPassword);
            if (callback) callback(null, "Senha alterada com sucesso!");
        } catch (error) {
            const msg = error.code === 'auth/requires-recent-login'
                ? "Operação sensível. Faça login novamente para alterar a senha."
                : "Erro ao atualizar senha.";
            if (callback) callback(msg);
        }
    }, []);

    const handleSaveUser = useCallback(async (userData, callback) => {
        const { id, password, ...dataToSave } = userData;
        try {
            if (id) {
                await updateDoc(doc(db, 'users', id), dataToSave);
                if (callback) callback(null, "Usuário atualizado com sucesso!");
            } else {
                const cred = await createUserWithEmailAndPassword(auth, dataToSave.email, password);
                const finalData = { ...dataToSave, createdAt: new Date(), classPacks: [], checkedInClassIds: [], lateCancellations: [] };
                await setDoc(doc(db, "users", cred.user.uid), finalData);
                if (callback) callback(null, "Usuário criado com sucesso!");
            }
        } catch (error) {
            const msg = error.code === 'auth/email-already-in-use' ? 'Este e-mail já está em uso.' : 'Ocorreu um erro ao salvar o usuário.';
            if (callback) callback(msg);
        }
    }, []);

    // --- CORE STUDENT/CLASS LOGIC ---
    const handleStudentCheckIn = useCallback(async (studentId, classId, callback) => {
        const studentRef = doc(db, 'users', studentId);
        const classRef = doc(db, 'classes', classId);

        try {
            const studentDoc = await getDoc(studentRef);
            if (!studentDoc.exists()) throw new Error("Aluno não encontrado.");
            const studentData = studentDoc.data();

            const totalClasses = calculateTotalClasses(studentData.classPacks);
            if (totalClasses <= 0) throw new Error("Você não tem créditos de aula suficientes.");

            const batch = writeBatch(db);
            
            // Adiciona o check-in na aula e no aluno
            batch.update(classRef, { checkedInStudents: arrayUnion(studentId) });
            batch.update(studentRef, { checkedInClassIds: arrayUnion(classId) });

            // Deduz o crédito (se não for plano ilimitado)
            if (totalClasses !== Infinity) {
                const sortedPacks = [...(studentData.classPacks || [])]
                    .filter(b => new Date(b.expiryDate) >= new Date() && b.classesRemaining > 0)
                    .sort((a, b) => new Date(a.purchaseDate) - new Date(a.purchaseDate));

                if (sortedPacks.length > 0) {
                    const packToDecrement = sortedPacks[0];
                    const updatedPacks = studentData.classPacks.map(p => 
                        p.id === packToDecrement.id ? { ...p, classesRemaining: p.classesRemaining - 1 } : p
                    );
                    batch.update(studentRef, { classPacks: updatedPacks });
                }
            }

            await batch.commit();
            if (callback) callback(null);

        } catch (error) {
            console.error("Erro no check-in:", error);
            if (callback) callback(error.message);
        }
    }, []);

    const handleStudentCancel = useCallback(async (studentId, classId, isLate, callback) => {
        const studentRef = doc(db, 'users', studentId);
        const classRef = doc(db, 'classes', classId);
        
        try {
            const studentDoc = await getDoc(studentRef);
            if (!studentDoc.exists()) throw new Error("Aluno não encontrado.");
            const studentData = studentDoc.data();

            const batch = writeBatch(db);

            // Remove o aluno da lista de check-in da aula
            batch.update(classRef, { checkedInStudents: arrayRemove(studentId) });
            // Remove a aula da lista de check-ins do aluno
            batch.update(studentRef, { checkedInClassIds: arrayRemove(classId) });

            if (isLate) {
                // Adiciona o aluno à lista de cancelamentos tardios
                batch.update(classRef, { lateCancellations: arrayUnion(studentId) });
            } else {
                // Devolve o crédito se o cancelamento não for tardio e não for plano ilimitado
                const totalClasses = calculateTotalClasses(studentData.classPacks);
                if (totalClasses !== Infinity) {
                    const packToRefund = [...(studentData.classPacks || [])]
                        .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
                        .find(p => p.classesRemaining < p.classesPurchased);
                    
                    if (packToRefund) {
                        const updatedPacks = studentData.classPacks.map(p =>
                            p.id === packToRefund.id ? { ...p, classesRemaining: p.classesRemaining + 1 } : p
                        );
                        batch.update(studentRef, { classPacks: updatedPacks });
                    }
                }
            }
            
            await batch.commit();
            if (callback) callback(null);
        } catch (error) {
            console.error("Erro ao cancelar check-in:", error);
            if (callback) callback(error.message);
        }
    }, []);

    const handleSaveClass = useCallback(async (classData) => {
        const { id, ...data } = classData;
        if (id) {
            await updateDoc(doc(db, 'classes', id), data);
        } else {
            await addDoc(collection(db, 'classes'), { ...data, checkedInStudents: [], lateCancellations: [] });
        }
    }, []);

    const handleDeleteClass = useCallback(async (classId) => {
        if (!classId) return;
        await deleteDoc(doc(db, 'classes', classId));
        const batch = writeBatch(db);
        users.forEach(user => {
            if (user.checkedInClassIds?.includes(classId)) {
                const updatedCheckIns = user.checkedInClassIds.filter(id => id !== classId);
                batch.update(doc(db, 'users', user.id), { checkedInClassIds: updatedCheckIns });
            }
        });
        await batch.commit();
    }, [users]);
    
    const handleAddModality = useCallback(async (modalityName) => {
        if (modalityName && !modalities.some(m => m.name === modalityName)) {
            await addDoc(collection(db, 'modalities'), { name: modalityName });
        }
    }, [modalities]);

    const handleDeleteModality = useCallback(async (modalityId) => {
        if (modalityId) {
            await deleteDoc(doc(db, 'modalities', modalityId));
        }
    }, []);

    const handleSavePlan = useCallback(async (planData) => {
        const { id, ...data } = planData;
        if (id) {
            await updateDoc(doc(db, 'plans', id), data);
        } else {
            await addDoc(collection(db, 'plans'), data);
        }
    }, []);

    const handleDeletePlan = useCallback(async (planId) => {
        if (planId) {
            await deleteDoc(doc(db, 'plans', planId));
        }
    }, []);

    // --- PROVIDER VALUE ---
    const value = useMemo(() => ({
        currentUser, loadingAuth, loadingData,
        users, classes, modalities, plans, categories, view, cancellationDeadlineHours,
        setUsers, setClasses, setModalities, setPlans, setCategories, setView, setCancellationDeadlineHours,
        handleLogin, handleLogout, handleResetPassword, handleUpdatePassword,
        handleSaveUser, handleSaveClass, handleDeleteClass,
        handleAddModality, handleDeleteModality, handleSavePlan, handleDeletePlan
    }), [
        currentUser, loadingAuth, loadingData, users, classes, modalities, plans, categories, view, cancellationDeadlineHours,
        handleLogin, handleLogout, handleResetPassword, handleUpdatePassword,
        handleSaveUser, handleSaveClass, handleDeleteClass, handleAddModality, handleDeleteModality, handleSavePlan, handleDeletePlan,
        setUsers, setClasses, setModalities, setPlans, setCategories, setView, setCancellationDeadlineHours
    ]);

    if (loadingAuth || loadingData) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <LoadingSpinner text="Carregando" />
            </div>
        );
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within a AppProvider');
    return context;
};