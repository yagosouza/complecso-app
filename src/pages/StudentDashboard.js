// src/pages/StudentDashboard.js
import React, { useState, useMemo, useCallback } from 'react';
import { CheckCircle2, Award } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { calculateTotalClasses } from '../utils/classHelpers';
import DayView from '../components/ui/DayView';
import ConfirmModal from '../components/modals/ConfirmModal';
import ClassItem from '../components/ui/ClassItem';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';

export default function StudentDashboard() {
    const { currentUser, users, classes, cancellationDeadlineHours } = useAppContext();
    const [displayedDate, setDisplayedDate] = useState(new Date());
    const [modalState, setModalState] = useState({ isOpen: false, classId: null });

    const student = useMemo(() => users.find(u => u.id === currentUser.uid), [currentUser.uid, users]);

    const handleCheckIn = useCallback(async (classId) => {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { checkedInClassIds: arrayUnion(classId) });
    }, [currentUser.uid]);
    
    const handleCancelCheckIn = useCallback(async (classId) => {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { checkedInClassIds: arrayRemove(classId) });
        // Aqui você adicionaria a lógica para estornar a aula, se aplicável
    }, [currentUser.uid]);

    const filteredClasses = useMemo(() => {
        if (!student) return [];
        // CORREÇÃO: Compara apenas o dia, mês e ano, ignorando a hora.
        return classes
            .filter(c => {
                if (!c.date) return false;
                const classDate = new Date(c.date);
                const studentCanSee = (student.categories || []).some(cat => (c.categories || []).includes(cat));
                return (student.enrolledIn || []).includes(c.type) && classDate.toDateString() === displayedDate.toDateString() && studentCanSee;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [classes, displayedDate, student]);

    if (!student) {
        return <div className="text-center p-8">Carregando dados do aluno...</div>;
    }

    const totalClasses = calculateTotalClasses(student.classPacks);

    return (
        <>
            <ConfirmModal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, classId: null })} onConfirm={() => handleCancelCheckIn(modalState.classId)} title="Cancelamento de Última Hora">
                 {`Você está cancelando com menos de ${cancellationDeadlineHours} horas de antecedência. Sua aula não será estornada. Deseja continuar?`}
            </ConfirmModal>
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold text-black mb-4">Olá, {student.name}!</h2>
                    <div className="flex items-center mt-1 flex-wrap mb-4">
                        {(student.categories || []).map(cat => (
                            <span key={cat} className="text-sm font-semibold mr-2 mb-1 px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full flex items-center">
                                <Award className="w-4 h-4 mr-1" />{cat}
                            </span>
                        ))}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Seu Saldo de Aulas</h3>
                    <p className="text-center text-green-600 font-bold py-4 text-2xl">{totalClasses === Infinity ? 'Ilimitado' : totalClasses}</p>
                </div>
                <div>
                    <DayView displayedDate={displayedDate} setDisplayedDate={setDisplayedDate} />
                    <div className="space-y-4 mt-4">
                        {filteredClasses.length > 0 ? filteredClasses.map(cls => {
                            const isCheckedIn = (student.checkedInClassIds || []).includes(cls.id);
                            return (
                                <ClassItem
                                    key={cls.id} cls={cls} allUsers={users} studentView={true}
                                    actionButton={
                                        isCheckedIn ? (
                                            <button onClick={() => handleCancelCheckIn(cls.id)} className="w-full md:w-auto px-6 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200">
                                                Cancelar Check-in
                                            </button>
                                        ) : (
                                            <button onClick={() => handleCheckIn(cls.id)} className="w-full md:w-auto px-6 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90 flex items-center justify-center gap-2">
                                                <CheckCircle2 className="h-5 w-5" /> Fazer Check-in
                                            </button>
                                        )
                                    }
                                />
                            );
                        }) : <p className="text-center text-gray-500 bg-white p-8 rounded-lg mt-4">Nenhuma aula encontrada para este dia.</p>}
                    </div>
                </div>
            </div>
        </>
    );
}