// src/pages/StudentDashboard.js
import React, { useState, useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { calculateTotalCredits } from '../utils/creditHelpers';
import MonthNavigator from '../components/ui/MonthNavigator';
import ConfirmModal from '../components/modals/ConfirmModal';

export default function StudentDashboard() {
    const {
        currentUser, users, setUsers, classes, setClasses,
        cancellationDeadlineHours
    } = useAppContext();

    const [displayedDate, setDisplayedDate] = useState(new Date());
    const [modalState, setModalState] = useState({ isOpen: false, classId: null });

    const student = useMemo(() => users.find(u => u.id === currentUser.id), [currentUser.id, users]);

    const handleCheckIn = (classId) => {
        const cls = classes.find(c => c.id === classId);
        if (cls.checkedInStudents.includes(student.id)) return alert("Você já fez check-in nesta aula.");

        const totalCredits = calculateTotalCredits(student.creditBatches);
        if (totalCredits <= 0) return alert("Você não tem créditos suficientes.");

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const sortedBatches = [...(student.creditBatches || [])]
            .filter(b => new Date(b.expiryDate) >= today && b.creditsRemaining > 0)
            .sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));

        if (sortedBatches.length === 0) return alert('Você não tem créditos válidos para fazer o check-in.');
        
        const batchToDecrement = sortedBatches[0];

        setUsers(currentUsers => currentUsers.map(user => {
            if (user.id === student.id) {
                const updatedBatches = user.creditBatches.map(batch =>
                    batch.id === batchToDecrement.id
                        ? { ...batch, creditsRemaining: batch.creditsRemaining - 1 }
                        : batch
                );
                return { ...user, creditBatches: updatedBatches, checkedInClassIds: [...user.checkedInClassIds, classId] };
            }
            return user;
        }));

        setClasses(currentClasses => currentClasses.map(c =>
            c.id === classId
                ? { ...c, checkedInStudents: [...c.checkedInStudents, student.id] }
                : c
        ));

        alert("Check-in realizado com sucesso!");
    };

    const performNormalCancellation = (classId) => {
        setUsers(currentUsers => currentUsers.map(user => {
            if (user.id === student.id) {
                const batchToRefund = [...user.creditBatches]
                    .filter(b => b.creditsRemaining < b.creditsPurchased && new Date(b.expiryDate) >= new Date())
                    .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))[0];

                let newBatches = user.creditBatches;
                if (batchToRefund) {
                    newBatches = user.creditBatches.map(b => b.id === batchToRefund.id ? {...b, creditsRemaining: b.creditsRemaining + 1} : b);
                }
                return { ...user, creditBatches: newBatches, checkedInClassIds: user.checkedInClassIds.filter(id => id !== classId) };
            }
            return user;
        }));

        setClasses(currentClasses => currentClasses.map(c => 
            c.id === classId ? { ...c, checkedInStudents: c.checkedInStudents.filter(id => id !== student.id) } : c
        ));
    };

    const performLateCancellation = (classId) => {
        setClasses(currentClasses => currentClasses.map(c => 
            c.id === classId ? { ...c, checkedInStudents: c.checkedInStudents.filter(id => id !== student.id), lateCancellations: [...(c.lateCancellations || []), student.id] } : c
        ));
        setUsers(currentUsers => currentUsers.map(user => 
            user.id === student.id ? { ...user, checkedInClassIds: user.checkedInClassIds.filter(id => id !== classId)} : user
        ));
    };

    const handleCancelCheckInRequest = (classId) => {
        const aClass = classes.find(c => c.id === classId);
        if (!aClass) return;

        const hoursBefore = (new Date(aClass.date).getTime() - new Date().getTime()) / (1000 * 60 * 60);

        if (hoursBefore < cancellationDeadlineHours) {
            setModalState({ isOpen: true, classId });
        } else {
            performNormalCancellation(classId);
        }
    };

    const handleConfirmCancellation = () => {
        performLateCancellation(modalState.classId);
        setModalState({ isOpen: false, classId: null });
    };

    const handlePreviousMonth = () => setDisplayedDate(current => new Date(current.getFullYear(), current.getMonth() - 1, 1));
    const handleNextMonth = () => setDisplayedDate(current => new Date(current.getFullYear(), current.getMonth() + 1, 1));

    if (!student) {
        return <div className="text-center p-8">Carregando dados do aluno...</div>;
    }

    const hasCredits = calculateTotalCredits(student.creditBatches) > 0;
    const activeCreditBatches = [...(student.creditBatches || [])]
        .filter(b => new Date(b.expiryDate) >= new Date() && b.creditsRemaining > 0)
        .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    return (
        <>
            <ConfirmModal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, classId: null })} onConfirm={handleConfirmCancellation} title="Cancelamento de Última Hora">
                {`Você está cancelando com menos de ${cancellationDeadlineHours} horas de antecedência. Seu crédito não será estornado. Deseja continuar?`}
            </ConfirmModal>

            <div className="space-y-6">
                 <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold text-black mb-4">Olá, {student.name}!</h2>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Seus Créditos Ativos</h3>
                     <div className="space-y-2">
                        {activeCreditBatches.length > 0 ? (
                            activeCreditBatches.map(batch => (
                                <div key={batch.id} className="p-3 rounded-lg flex justify-between items-center bg-green-50 text-green-800">
                                    <div>
                                        <p className="font-bold text-lg">{batch.creditsRemaining} <span className="text-sm font-normal">créditos</span></p>
                                        <p className="text-xs">Vencem em: {new Date(batch.expiryDate).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-4">Você não possui créditos ativos.</p>
                        )}
                    </div>
                </div>
                <div>
                    <MonthNavigator displayedDate={displayedDate} onPrevious={handlePreviousMonth} onNext={handleNextMonth} />
                    <div className="space-y-4">
                        {classes.filter(c => student.enrolledIn.includes(c.type) && new Date(c.date).getMonth() === displayedDate.getMonth()).sort((a,b) => new Date(a.date) - new Date(b.date)).map(cls => {
                            const isPast = new Date(cls.date) < new Date();
                            const isFull = cls.checkedInStudents.length >= cls.maxStudents;
                            const isCheckedIn = student.checkedInClassIds.includes(cls.id);
                            const classDate = new Date(cls.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
                            const classTime = new Date(cls.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                            const teacher = users.find(u => u.id === cls.teacherId);
                            
                            let buttonLabel = 'Fazer Check-in';
                            if (!hasCredits) buttonLabel = 'Sem créditos';
                            else if (isFull) buttonLabel = 'Turma Cheia';

                            return (
                                <div key={cls.id} className="bg-white p-5 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-center">
                                    <div className="mb-4 md:mb-0 text-left mr-auto">
                                        <p className="font-bold text-lg text-black capitalize">{cls.type}: {classDate} - {classTime}</p>
                                        <p className="text-sm text-gray-600">Professor(a): {teacher ? teacher.name : 'N/A'}</p>
                                        <p className="text-sm text-gray-600">Vagas: {cls.checkedInStudents.length} / {cls.maxStudents}</p>
                                    </div>
                                    <div>
                                        {isCheckedIn ? (
                                            <button onClick={() => handleCancelCheckInRequest(cls.id)} disabled={isPast} className="w-full md:w-auto px-6 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500">
                                                Cancelar Check-in
                                            </button>
                                        ) : (
                                            <button onClick={() => handleCheckIn(cls.id)} disabled={isFull || !hasCredits || isPast} className="w-full md:w-auto px-6 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                                <CheckCircle2 className="h-5 w-5" />
                                                {buttonLabel}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}