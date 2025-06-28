import React, { useState, useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getBillingCycle } from '../utils/helpers';
import MonthNavigator from '../components/ui/MonthNavigator';
import ConfirmModal from '../components/modals/ConfirmModal';

export default function StudentDashboard() {
    const {
        currentUser,
        users,
        classes,
        handleCheckIn,
        performNormalCancellation,
        performLateCancellation,
        cancellationDeadlineHours
    } = useAppContext();

    const today = new Date();
    const [displayedDate, setDisplayedDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [modalState, setModalState] = useState({ isOpen: false, studentId: null, classId: null });

    // Calcula os dados específicos do aluno logado
    const student = useMemo(() => {
        if (!currentUser || currentUser.role !== 'student') return null;
        const studentData = users.find(u => u.id === currentUser.id);
        if (!studentData) return null;

        const { start, end } = getBillingCycle(studentData.paymentDueDate);
        const usedInBillingCycle = studentData.checkedInClassIds.filter(id => {
            const c = classes.find(cls => cls.id === id);
            return c && c.date >= start && c.date <= end;
        }).length;

        return { ...studentData, plan: { ...studentData.plan, usedInBillingCycle } };
    }, [currentUser, users, classes]);

    // Filtra as aulas relevantes para o aluno e para o mês exibido
    const filteredClasses = useMemo(() => {
        if (!student) return [];
        return classes
            .filter(c =>
                new Date(c.date).getFullYear() === displayedDate.getFullYear() &&
                new Date(c.date).getMonth() === displayedDate.getMonth() &&
                student.enrolledIn.includes(c.type)
            )
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [classes, displayedDate, student]);

    const handleCancelCheckInRequest = (studentId, classId) => {
        const aClass = classes.find(c => c.id === classId);
        if (!aClass) return;

        const hoursBefore = (new Date(aClass.date).getTime() - new Date().getTime()) / (1000 * 60 * 60);

        if (hoursBefore < cancellationDeadlineHours) {
            setModalState({ isOpen: true, studentId, classId });
        } else {
            performNormalCancellation(studentId, classId);
        }
    };

    const handleConfirmCancellation = () => {
        const { studentId, classId } = modalState;
        performLateCancellation(studentId, classId);
        setModalState({ isOpen: false, studentId: null, classId: null });
    };
    
    const handlePreviousMonth = () => setDisplayedDate(current => new Date(current.getFullYear(), current.getMonth() - 1, 1));
    const handleNextMonth = () => setDisplayedDate(current => new Date(current.getFullYear(), current.getMonth() + 1, 1));

    if (!student) {
        return <div className="text-center p-8">Carregando dados do aluno...</div>;
    }

    const usedInBillingCycle = student.plan.usedInBillingCycle || 0;
    const extraClassesForMonth = student.plan.extraClasses?.find(ec => ec.month === `${today.getFullYear()}-${today.getMonth()}`)?.count || 0;
    const remainingClasses = student.plan.total + extraClassesForMonth - usedInBillingCycle;
    const hasCredits = remainingClasses > 0;

    return (
        <>
            <ConfirmModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, studentId: null, classId: null })}
                onConfirm={handleConfirmCancellation}
                title="Cancelamento de Última Hora"
            >
                {`Você está cancelando com menos de ${cancellationDeadlineHours} horas de antecedência. Seu crédito não será estornado. Deseja continuar?`}
            </ConfirmModal>

            <div className="p-4 md:p-8 space-y-8">
                <div className="bg-white p-6 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-black">Olá, {student.name}!</h2>
                        <p className="text-gray-700">Seu plano: <strong>{student.plan.name}</strong></p>
                        <p className="text-gray-700">Modalidades: <strong>{student.enrolledIn.join(', ')}</strong></p>
                    </div>
                    <div className="text-center bg-gray-50 p-4 rounded-lg w-full sm:w-auto">
                        <p className="font-semibold text-gray-800">Créditos do ciclo (vence dia {student.paymentDueDate})</p>
                        <p className={`text-4xl font-bold ${hasCredits ? 'text-black' : 'text-red-500'}`}>{remainingClasses}</p>
                        <p className="text-sm text-gray-600">de {student.plan.total + extraClassesForMonth} disponíveis</p>
                    </div>
                </div>
                <div>
                    <MonthNavigator displayedDate={displayedDate} onPrevious={handlePreviousMonth} onNext={handleNextMonth} />
                    <div className="space-y-4">
                        {filteredClasses.length > 0 ? filteredClasses.map(cls => {
                            const { start, end } = getBillingCycle(student.paymentDueDate);
                            const isPast = new Date(cls.date) < new Date();
                            const isOutsideCycle = new Date(cls.date) < start || new Date(cls.date) > end;
                            const isFull = cls.checkedInStudents.length >= cls.maxStudents;
                            const isCheckedIn = student.checkedInClassIds.includes(cls.id);
                            const classDate = new Date(cls.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
                            const classTime = new Date(cls.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                            const teacher = users.find(u => u.id === cls.teacherId);
                            
                            let buttonLabel = 'Fazer Check-in';
                            if (!hasCredits) buttonLabel = 'Sem créditos';
                            else if (isFull) buttonLabel = 'Turma Cheia';
                            else if (isPast) buttonLabel = 'Aula Encerrada';
                            else if (isOutsideCycle) buttonLabel = 'Fora do Ciclo';

                            return (
                                <div key={cls.id} className="bg-white p-5 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-center">
                                    <div className="mb-4 md:mb-0 text-left mr-auto">
                                        <p className="font-bold text-lg text-black capitalize">{cls.type}: {classDate} - {classTime}</p>
                                        <p className="text-sm text-gray-600">Professor(a): {teacher ? teacher.name : 'N/A'}</p>
                                        <p className="text-sm text-gray-600">Vagas: {cls.checkedInStudents.length} / {cls.maxStudents}</p>
                                    </div>
                                    <div>
                                        {isCheckedIn ? (
                                            <button onClick={() => handleCancelCheckInRequest(student.id, cls.id)} disabled={isPast} className="w-full md:w-auto px-6 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500">
                                                Cancelar Check-in
                                            </button>
                                        ) : (
                                            <button onClick={() => handleCheckIn(student.id, cls.id)} disabled={isFull || !hasCredits || isPast || isOutsideCycle} className="w-full md:w-auto px-6 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                                <CheckCircle2 className="h-5 w-5" />
                                                {buttonLabel}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        }) : <p className="text-center text-gray-500 bg-white p-8 rounded-lg">Nenhuma aula da sua modalidade marcada para este mês.</p>}
                    </div>
                </div>
            </div>
        </>
    );
}