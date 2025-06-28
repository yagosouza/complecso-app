import React, { useState, useMemo } from 'react';
import { PlusCircle } from 'lucide-react';
import MonthNavigator from '../components/ui/MonthNavigator';
import ConfirmModal from '../components/modals/ConfirmModal';
import { useAppContext } from '../context/AppContext';

export default function TeacherDashboard() {
    const { currentUser, users, classes, handleCreateClass, handleDeleteClass } = useAppContext();
    
    const today = new Date();
    const [displayedDate, setDisplayedDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [date, setDate] = useState(''); 
    const [time, setTime] = useState(''); 
    const [maxStudents, setMaxStudents] = useState(10); 
    const [classType, setClassType] = useState(currentUser.specialties[0] || ''); 
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [modalState, setModalState] = useState({ isOpen: false, classId: null });

    const students = useMemo(() => users.filter(u => u.role === 'student'), [users]);
    
    const filteredClasses = useMemo(() => {
        return classes
            .filter(c => 
                c.teacherId === currentUser.id &&
                c.date.getFullYear() === displayedDate.getFullYear() && 
                c.date.getMonth() === displayedDate.getMonth()
            )
            .sort((a, b) => a.date - b.date);
    }, [classes, displayedDate, currentUser.id]);

    const onCreateClassSubmit = (e) => {
        e.preventDefault();
        if (date && time && classType) {
            const [year, month, day] = date.split('-');
            const [hour, minute] = time.split(':');
            const classDate = new Date(year, month - 1, day, hour, minute);
            handleCreateClass({ date: classDate, maxStudents: parseInt(maxStudents), type: classType }, currentUser.id);
            setDate('');
            setTime('');
            setMaxStudents(10);
            setShowCreateForm(false);
        }
    };

    const requestDelete = (classId) => {
        setModalState({ isOpen: true, classId });
    };

    const confirmDelete = () => {
        handleDeleteClass(modalState.classId);
        setModalState({ isOpen: false, classId: null });
    };

    const handlePreviousMonth = () => setDisplayedDate(current => new Date(current.getFullYear(), current.getMonth() - 1, 1));
    const handleNextMonth = () => setDisplayedDate(current => new Date(current.getFullYear(), current.getMonth() + 1, 1));

    return (
        <>
            <ConfirmModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, classId: null })}
                onConfirm={confirmDelete}
                title="Excluir Aula"
            >
                Tem certeza que deseja excluir esta aula? Os check-ins dos alunos serão cancelados.
            </ConfirmModal>

            <div className="p-4 md:p-8 space-y-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-black">Minhas Aulas</h2>
                    <button onClick={() => setShowCreateForm(!showCreateForm)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90">
                        <PlusCircle className="h-5 w-5" />{showCreateForm ? 'Fechar' : 'Nova Aula'}
                    </button>
                </div>
                
                {showCreateForm && (
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <form onSubmit={onCreateClassSubmit} className="space-y-4">
                            <h3 className="text-lg font-semibold text-black">Adicionar nova aula</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Data</label>
                                    <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                                </div>
                                <div>
                                    <label htmlFor="time" className="block text-sm font-medium text-gray-700">Hora</label>
                                    <input type="time" id="time" value={time} onChange={e => setTime(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                                </div>
                                <div>
                                    <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700">Máx. Alunos</label>
                                    <input type="number" id="maxStudents" value={maxStudents} onChange={e => setMaxStudents(e.target.value)} min="1" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                                </div>
                                <div>
                                    <label htmlFor="classType" className="block text-sm font-medium text-gray-700">Modalidade</label>
                                    <select id="classType" value={classType} onChange={e => setClassType(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                        {currentUser.specialties.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full md:w-auto px-6 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90">Salvar Aula</button>
                        </form>
                    </div>
                )}
                
                <MonthNavigator displayedDate={displayedDate} onPrevious={handlePreviousMonth} onNext={handleNextMonth} />
                
                <div className="space-y-6">
                    {filteredClasses.length > 0 ? filteredClasses.map(cls => {
                        const confirmedStudents = cls.checkedInStudents.map(studentId => students.find(s => s.id === studentId)).filter(Boolean);
                        const lateCancelStudents = (cls.lateCancellations || []).map(studentId => students.find(s => s.id === studentId)).filter(Boolean);
                        const classDate = cls.date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
                        const classTime = cls.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                        return (
                            <div key={cls.id} className="bg-white p-5 rounded-lg shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                    <div className="text-left mr-auto">
                                        <p className="font-bold text-lg text-black capitalize">{cls.type}: {classDate} - {classTime}</p>
                                        <p className="text-sm font-semibold text-gray-700">Check-ins: {confirmedStudents.length} / {cls.maxStudents}</p>
                                    </div>
                                    <button onClick={() => requestDelete(cls.id)} className="mt-2 md:mt-0 px-4 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200">
                                        Excluir
                                    </button>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-black mb-2">Alunos com Check-in:</h4>
                                    {confirmedStudents.length > 0 ? (
                                        <ul className="list-disc list-inside space-y-1">
                                            {confirmedStudents.map(student => <li key={student.id} className="text-gray-700">{student.name}</li>)}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">Nenhum aluno fez check-in ainda.</p>
                                    )}
                                    
                                    {lateCancelStudents.length > 0 && (
                                        <>
                                            <h4 className="font-semibold text-red-600 mt-2 mb-2">Cancelamentos de última hora:</h4>
                                            <ul className="list-disc list-inside space-y-1">
                                                {lateCancelStudents.map(student => <li key={student.id} className="text-red-500 italic">{student.name}</li>)}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    }) : <p className="text-center text-gray-500 bg-white p-8 rounded-lg">Nenhuma aula sua marcada para este mês.</p>}
                </div>
            </div>
        </>
    );
}