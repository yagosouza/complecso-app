// src/pages/AdminDashboard/ClassManagementView.js
import React, { useState, useMemo, useCallback } from 'react';
import { PlusCircle } from 'lucide-react';
import MonthNavigator from '../../components/ui/MonthNavigator';
import ClassItem from '../../components/ui/ClassItem';
import ConfirmModal from '../../components/modals/ConfirmModal';
import { useAppContext } from '../../context/AppContext';
import { CLASS_TYPES } from '../../constants/mockData';

export default function ClassManagementView() {
    const { classes, setClasses, users, handleCreateClass, handleDeleteClass } = useAppContext();

    const [displayedDate, setDisplayedDate] = useState(new Date());
    const [showCreateClassForm, setShowCreateClassForm] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [classForm, setClassForm] = useState({ date: '', time: '', maxStudents: 10, teacherId: '', type: '' });
    const [modalState, setModalState] = useState({ isOpen: false, classId: null });

    const teachers = useMemo(() => users.filter(u => u.role === 'teacher'), [users]);

    const handlePreviousMonth = () => setDisplayedDate(current => new Date(current.getFullYear(), current.getMonth() - 1, 1));
    const handleNextMonth = () => setDisplayedDate(current => new Date(current.getFullYear(), current.getMonth() + 1, 1));

    const handleClassFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setClassForm(currentForm => ({ ...currentForm, [name]: value }));
    }, []);

    const onClassFormSubmit = (e) => {
        e.preventDefault();
        const { date, time, maxStudents, teacherId, type } = classForm;
        if (!date || !time || !teacherId || !type) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        const [year, month, day] = date.split('-');
        const [hour, minute] = time.split(':');
        const classDate = new Date(year, month - 1, day, hour, minute);

        if (editingClass) {
            // Lógica de atualização
            setClasses(prevClasses => prevClasses.map(c => 
                c.id === editingClass.id ? { ...c, date: classDate, maxStudents: parseInt(maxStudents), teacherId: parseInt(teacherId), type } : c
            ));
            setEditingClass(null);
        } else {
            // Lógica de criação
            handleCreateClass({ date: classDate, maxStudents: parseInt(maxStudents), type }, parseInt(teacherId));
        }
        
        setShowCreateClassForm(false);
        setClassForm({ date: '', time: '', maxStudents: 10, teacherId: '', type: '' });
    };

    const requestDelete = (classId) => {
        setModalState({ isOpen: true, classId });
    };
    
    const confirmDelete = () => {
        handleDeleteClass(modalState.classId);
        setModalState({ isOpen: false, classId: null });
    };

    const handleEditClassClick = (cls) => {
        setEditingClass(cls);
        const date = new Date(cls.date);
        setClassForm({
            date: date.toISOString().split('T')[0],
            time: date.toTimeString().substring(0, 5),
            maxStudents: cls.maxStudents,
            teacherId: cls.teacherId,
            type: cls.type
        });
        setShowCreateClassForm(true);
    };

    const toggleForm = () => {
        setEditingClass(null);
        setClassForm({ date: '', time: '', maxStudents: 10, teacherId: '', type: '' });
        setShowCreateClassForm(prev => !prev);
    };
    
    const filteredAndSortedClasses = useMemo(() => 
        classes
            .filter(c => new Date(c.date).getFullYear() === displayedDate.getFullYear() && new Date(c.date).getMonth() === displayedDate.getMonth())
            .sort((a, b) => new Date(a.date) - new Date(b.date)), 
        [classes, displayedDate]
    );

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

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-black">Gerenciar Aulas</h2>
                <button onClick={toggleForm} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90">
                    <PlusCircle className="h-5 w-5" />{showCreateClassForm ? 'Fechar' : 'Nova Aula'}
                </button>
            </div>
            
            {showCreateClassForm && (
                 <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                    <form onSubmit={onClassFormSubmit} className="space-y-4">
                        <h3 className="text-lg font-semibold text-black">{editingClass ? 'Editar Aula' : 'Adicionar Nova Aula'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div><label>Data</label><input type="date" name="date" value={classForm.date} onChange={handleClassFormChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/></div>
                            <div><label>Hora</label><input type="time" name="time" value={classForm.time} onChange={handleClassFormChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/></div>
                            <div><label>Máx. Alunos</label><input type="number" name="maxStudents" value={classForm.maxStudents} onChange={handleClassFormChange} min="1" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/></div>
                            <div>
                                <label>Modalidade</label>
                                <select name="type" value={classForm.type} onChange={handleClassFormChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                    <option value="" disabled>Selecione...</option>
                                    {CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label>Professor</label>
                                <select name="teacherId" value={classForm.teacherId} onChange={handleClassFormChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" disabled={!classForm.type}>
                                    <option value="" disabled>Selecione...</option>
                                    {teachers.filter(t => t.specialties.includes(classForm.type)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="w-full md:w-auto px-6 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90">{editingClass ? 'Salvar Alterações' : 'Salvar Aula'}</button>
                    </form>
                 </div>
            )}
            
            <MonthNavigator displayedDate={displayedDate} onPrevious={handlePreviousMonth} onNext={handleNextMonth} />
            
            <div className="space-y-4">
                {filteredAndSortedClasses.map(cls => 
                    <ClassItem 
                        key={cls.id} 
                        cls={cls} 
                        allUsers={users} 
                        onDeleteClass={requestDelete} 
                        onEditClass={handleEditClassClick} 
                    />
                )}
            </div>
        </>
    );
}