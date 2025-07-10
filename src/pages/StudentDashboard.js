// src/pages/StudentDashboard.js
import React, { useState, useMemo } from 'react';
import { CheckCircle2, History, Award } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { calculateTotalClasses } from '../utils/classHelpers';
import DayView from '../components/ui/DayView';
import ConfirmModal from '../components/modals/ConfirmModal';
import ClassItem from '../components/ui/ClassItem';

export default function StudentDashboard() {
    const { currentUser, users, setUsers, classes, setClasses, cancellationDeadlineHours } = useAppContext();

    const [displayedDate, setDisplayedDate] = useState(new Date());
    const [modalState, setModalState] = useState({ isOpen: false, classId: null });
    const [showHistory, setShowHistory] = useState(false);

    const student = useMemo(() => users.find(u => u.id === currentUser.id), [currentUser.id, users]);

    const handleCheckIn = (classId) => {
        const cls = classes.find(c => c.id === classId);
        if (cls.checkedInStudents.includes(student.id)) return alert("Você já fez check-in nesta aula.");

        const totalClasses = calculateTotalClasses(student.classPacks);

        if (totalClasses === Infinity) {
             setUsers(currentUsers => currentUsers.map(user => {
                if (user.id === student.id) {
                    return { ...user, checkedInClassIds: [...user.checkedInClassIds, classId] };
                }
                return user;
            }));
        } else {
            if (totalClasses <= 0) return alert("Você não tem aulas suficientes.");

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const sortedPacks = [...(student.classPacks || [])]
                .filter(b => new Date(b.expiryDate) >= today && b.classesRemaining > 0)
                .sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));

            if (sortedPacks.length === 0) return alert('Você não tem pacotes de aulas válidos para fazer o check-in.');

            const packToDecrement = sortedPacks[0];

            setUsers(currentUsers => currentUsers.map(user => {
                if (user.id === student.id) {
                    const updatedPacks = user.classPacks.map(pack =>
                        pack.id === packToDecrement.id
                            ? { ...pack, classesRemaining: pack.classesRemaining - 1 }
                            : pack
                    );
                    return { ...user, classPacks: updatedPacks, checkedInClassIds: [...user.checkedInClassIds, classId] };
                }
                return user;
            }));
        }

        setClasses(currentClasses => currentClasses.map(c =>
            c.id === classId
                ? { ...c, checkedInStudents: [...c.checkedInStudents, student.id] }
                : c
        ));

        alert("Check-in realizado com sucesso!");
    };

    const performNormalCancellation = (classId) => {
        setUsers(currentUsers => currentUsers.map(user => {
            const totalClasses = calculateTotalClasses(user.classPacks);
            if (user.id === student.id && totalClasses !== Infinity) {
                const packToRefund = [...user.classPacks]
                    .filter(b => b.classesRemaining < b.classesPurchased && new Date(b.expiryDate) >= new Date())
                    .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))[0];

                let newPacks = user.classPacks;
                if (packToRefund) {
                    newPacks = user.classPacks.map(b => b.id === packToRefund.id ? {...b, classesRemaining: b.classesRemaining + 1} : b);
                }
                return { ...user, classPacks: newPacks, checkedInClassIds: user.checkedInClassIds.filter(id => id !== classId) };
            } else if (user.id === student.id) {
                 return { ...user, checkedInClassIds: user.checkedInClassIds.filter(id => id !== classId) };
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

    const filteredClasses = useMemo(() => {
        if (!student) return [];
        return classes
            .filter(c => {
                const classDate = new Date(c.date);
                const isSameDay = classDate.toDateString() === displayedDate.toDateString();
                const studentCanSee = student.categories.some(cat => c.categories.includes(cat));
                return student.enrolledIn.includes(c.type) && isSameDay && studentCanSee;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [classes, displayedDate, student]);

    const classHistory = useMemo(() => {
        if (!student) return [];
        return student.checkedInClassIds
            .map(id => classes.find(c => c.id === id))
            .filter(c => c && new Date(c.date) < new Date())
            .sort((a,b) => new Date(b.date) - new Date(a.date));
    }, [classes, student]);


    if (!student) {
        return <div className="text-center p-8">Carregando dados do aluno...</div>;
    }

    const totalClasses = calculateTotalClasses(student.classPacks);
    const hasClasses = totalClasses > 0;

    const activeClassPacks = [...(student.classPacks || [])]
        .filter(b => new Date(b.expiryDate) >= new Date() && b.classesRemaining > 0)
        .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    return (
        <>
            <ConfirmModal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, classId: null })} onConfirm={handleConfirmCancellation} title="Cancelamento de Última Hora">
                {`Você está cancelando com menos de ${cancellationDeadlineHours} horas de antecedência. Sua aula não será estornada. Deseja continuar?`}
            </ConfirmModal>

            <div className="space-y-6">
                 <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold text-black mb-4">Olá, {student.name}!</h2>
                    <div className="flex items-center mt-1 flex-wrap mb-4">
                        {student.categories?.map(cat => (
                            <span key={cat} className="text-sm font-semibold mr-2 mb-1 px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full flex items-center">
                                <Award className="w-4 h-4 mr-1" />{cat}
                            </span>
                        ))}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Suas Aulas</h3>
                     <div className="space-y-2">
                        {totalClasses === Infinity ? (
                             <p className="text-center text-green-600 font-semibold py-4">Você possui aulas ilimitadas!</p>
                        ) : activeClassPacks.length > 0 ? (
                            activeClassPacks.map(pack => (
                                <div key={pack.id} className="p-3 rounded-lg flex justify-between items-center bg-green-50 text-green-800">
                                    <div>
                                        <p className="font-bold text-lg">{pack.classesRemaining} <span className="text-sm font-normal">aulas</span></p>
                                        <p className="text-xs">Vencem em: {new Date(pack.expiryDate).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-4">Você não possui aulas ativas.</p>
                        )}
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <DayView displayedDate={displayedDate} setDisplayedDate={setDisplayedDate} />
                        <button onClick={() => setShowHistory(!showHistory)} className="p-2 rounded-full hover:bg-gray-100 ml-4" title={showHistory ? 'Ver aulas do dia' : 'Ver histórico de aulas'}>
                            <History className="h-6 w-6 text-gray-700" />
                        </button>
                    </div>

                    {showHistory ? (
                        <div>
                             <h3 className="text-xl font-bold mb-4 text-center">Histórico de Aulas</h3>
                             <div className="space-y-4">
                                {classHistory.length > 0 ? classHistory.map(cls => (
                                    <ClassItem key={cls.id} cls={cls} allUsers={users} studentView={true}/>
                                )) : <p className="text-center text-gray-500 bg-white p-8 rounded-lg">Nenhum histórico de aulas.</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredClasses.length > 0 ? filteredClasses.map(cls => {
                                const isFull = cls.checkedInStudents.length >= cls.maxStudents;
                                const isCheckedIn = student.checkedInClassIds.includes(cls.id);
                                const isPast = new Date(cls.date) < new Date();

                                let buttonLabel = 'Fazer Check-in';
                                if (!hasClasses) buttonLabel = 'Sem aulas';
                                else if (isFull) buttonLabel = 'Turma Cheia';

                                return (
                                    <ClassItem
                                        key={cls.id}
                                        cls={cls}
                                        allUsers={users}
                                        studentView={true}
                                        actionButton={
                                            isCheckedIn ? (
                                                <button onClick={() => handleCancelCheckInRequest(cls.id)} disabled={isPast} className="w-full md:w-auto px-6 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500">
                                                    Cancelar Check-in
                                                </button>
                                            ) : (
                                                <button onClick={() => handleCheckIn(cls.id)} disabled={isFull || !hasClasses || isPast} className="w-full md:w-auto px-6 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                    {buttonLabel}
                                                </button>
                                            )
                                        }
                                    />
                                );
                            }) : <p className="text-center text-gray-500 bg-white p-8 rounded-lg">Nenhuma aula encontrada para este dia.</p>}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}