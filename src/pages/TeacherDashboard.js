import React, { useState, useMemo, useCallback } from 'react';
import { PlusCircle } from 'lucide-react';
import MonthNavigator from '../components/ui/MonthNavigator';
import ConfirmModal from '../components/modals/ConfirmModal';
import FullScreenFormModal from '../components/modals/FullScreenFormModal';
import { useAppContext } from '../context/AppContext';

const initialFormState = { date: '', time: '', maxStudents: 10, type: '' };

export default function TeacherDashboard() {
    const { currentUser, classes, handleCreateClass, handleDeleteClass } = useAppContext();
    
    const [displayedDate, setDisplayedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [classForm, setClassForm] = useState(initialFormState);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, classId: null });

    //const students = useMemo(() => users.filter(u => u.role === 'student'), [users]);
    
    const filteredClasses = useMemo(() => {
        return classes
            .filter(c => 
                c.teacherId === currentUser.id &&
                new Date(c.date).getFullYear() === displayedDate.getFullYear() && 
                new Date(c.date).getMonth() === displayedDate.getMonth()
            )
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [classes, displayedDate, currentUser.id]);
    
    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setClassForm(current => ({ ...current, [name]: value }));
    }, []);

    const handleSaveClass = () => {
        const { date, time, maxStudents, type } = classForm;
        if (!date || !time || !type) {
            alert("Por favor, preencha todos os campos.");
            return;
        }
        const [year, month, day] = date.split('-');
        const [hour, minute] = time.split(':');
        const classDate = new Date(year, parseInt(month) - 1, day, hour, minute);

        handleCreateClass({ date: classDate, maxStudents: parseInt(maxStudents), type }, currentUser.id);
        setIsModalOpen(false);
    };
    
    const openModalForNew = () => {
        setClassForm(initialFormState);
        setIsModalOpen(true);
    };
    
    const requestDelete = (classId) => setDeleteModal({ isOpen: true, classId });
    const confirmDelete = () => {
        handleDeleteClass(deleteModal.classId);
        setDeleteModal({ isOpen: false, classId: null });
    };

    const handlePreviousMonth = () => setDisplayedDate(current => new Date(current.getFullYear(), current.getMonth() - 1, 1));
    const handleNextMonth = () => setDisplayedDate(current => new Date(current.getFullYear(), current.getMonth() + 1, 1));

    return (
        <>
            <ConfirmModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({isOpen: false, classId: null})} onConfirm={confirmDelete} title="Excluir Aula">
                Tem certeza que deseja excluir esta aula?
            </ConfirmModal>

            <FullScreenFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveClass}
                title="Nova Aula"
            >
                <div className="space-y-6">
                    <div><label className="text-sm font-medium">Data</label><input type="date" name="date" value={classForm.date} onChange={handleFormChange} required className="w-full mt-1 p-2 border rounded-md"/></div>
                    <div><label className="text-sm font-medium">Hora</label><input type="time" name="time" value={classForm.time} onChange={handleFormChange} required className="w-full mt-1 p-2 border rounded-md"/></div>
                    <div><label className="text-sm font-medium">Máx. de Alunos</label><input type="number" name="maxStudents" value={classForm.maxStudents} onChange={handleFormChange} min="1" required className="w-full mt-1 p-2 border rounded-md"/></div>
                    <div>
                        <label className="text-sm font-medium">Modalidade</label>
                        <select name="type" value={classForm.type} onChange={handleFormChange} required className="w-full mt-1 p-2 border rounded-md bg-white">
                            <option value="" disabled>Selecione...</option>
                            {currentUser.specialties.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </FullScreenFormModal>

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-black">Minhas Aulas</h2>
                    <button onClick={openModalForNew} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90">
                        <PlusCircle className="h-5 w-5" />Nova Aula
                    </button>
                </div>
                
                <MonthNavigator displayedDate={displayedDate} onPrevious={handlePreviousMonth} onNext={handleNextMonth} />
                
                <div className="space-y-4">
                    {filteredClasses.length > 0 ? filteredClasses.map(cls => {
                        const classDate = new Date(cls.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
                        const classTime = new Date(cls.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                        return (
                            <div key={cls.id} className="bg-white p-5 rounded-lg shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                    <div className="text-left mr-auto">
                                        <p className="font-bold text-lg text-black capitalize">{cls.type}: {classDate} - {classTime}</p>
                                        <p className="text-sm font-semibold text-gray-700">Check-ins: {cls.checkedInStudents.length} / {cls.maxStudents}</p>
                                    </div>
                                    <button onClick={() => requestDelete(cls.id)} className="mt-2 md:mt-0 px-4 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200">
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        );
                    }) : <p className="text-center text-gray-500 bg-white p-8 rounded-lg">Nenhuma aula sua marcada para este mês.</p>}
                </div>
            </div>
        </>
    );
}