import React, { useState, useMemo, useCallback } from 'react';
import { PlusCircle } from 'lucide-react';
import MonthNavigator from '../../components/ui/MonthNavigator';
import ClassItem from '../../components/ui/ClassItem';
import ConfirmModal from '../../components/modals/ConfirmModal';
import FullScreenFormModal from '../../components/modals/FullScreenFormModal';
import { useAppContext } from '../../context/AppContext';
import { CLASS_TYPES } from '../../constants/mockData';

const initialFormState = { date: '', time: '', maxStudents: 10, teacherId: '', type: '' };

export default function ClassManagementView() {
    const { classes, setClasses, users, handleCreateClass, handleDeleteClass } = useAppContext();

    const [displayedDate, setDisplayedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [classForm, setClassForm] = useState(initialFormState);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, classId: null });

    const teachers = useMemo(() => users.filter(u => u.role === 'teacher'), [users]);

    const handlePreviousMonth = () => setDisplayedDate(current => new Date(current.getFullYear(), current.getMonth() - 1, 1));
    const handleNextMonth = () => setDisplayedDate(current => new Date(current.getFullYear(), current.getMonth() + 1, 1));

    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setClassForm(currentForm => ({ ...currentForm, [name]: value }));
    }, []);

    const handleSave = () => {
        const { date, time, maxStudents, teacherId, type } = classForm;
        if (!date || !time || !teacherId || !type) {
            alert("Por favor, preencha todos os campos.");
            return;
        }
        const [year, month, day] = date.split('-');
        const [hour, minute] = time.split(':');
        const classDate = new Date(year, parseInt(month) - 1, day, hour, minute);

        if (editingClass) {
            setClasses(prev => prev.map(c => c.id === editingClass.id ? { ...c, date: classDate, maxStudents: parseInt(maxStudents), teacherId: parseInt(teacherId), type } : c));
        } else {
            handleCreateClass({ date: classDate, maxStudents: parseInt(maxStudents), type }, parseInt(teacherId));
        }
        
        setIsModalOpen(false);
    };

    const openModalForNew = () => {
        setEditingClass(null);
        setClassForm(initialFormState);
        setIsModalOpen(true);
    };

    const openModalForEdit = (cls) => {
        setEditingClass(cls);
        const d = new Date(cls.date);
        setClassForm({
            date: d.toISOString().split('T')[0],
            time: d.toTimeString().substring(0, 5),
            maxStudents: cls.maxStudents,
            teacherId: cls.teacherId,
            type: cls.type
        });
        setIsModalOpen(true);
    };

    const requestDelete = (classId) => setDeleteModal({ isOpen: true, classId });
    
    const confirmDelete = () => {
        handleDeleteClass(deleteModal.classId);
        setDeleteModal({ isOpen: false, classId: null });
    };

    const filteredAndSortedClasses = useMemo(() => 
        classes
            .filter(c => new Date(c.date).getFullYear() === displayedDate.getFullYear() && new Date(c.date).getMonth() === displayedDate.getMonth())
            .sort((a, b) => new Date(a.date) - new Date(b.date)), 
        [classes, displayedDate]
    );

    return (
        <>
            <ConfirmModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({isOpen: false, classId: null})} onConfirm={confirmDelete} title="Excluir Aula">
                Tem certeza que deseja excluir esta aula? Os check-ins dos alunos serão cancelados.
            </ConfirmModal>

            <FullScreenFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                title={editingClass ? 'Editar Aula' : 'Nova Aula'}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium">Data</label><input type="date" name="date" value={classForm.date} onChange={handleFormChange} required className="mt-1 block w-full p-2 border rounded-md"/></div>
                        <div><label className="text-sm font-medium">Hora</label><input type="time" name="time" value={classForm.time} onChange={handleFormChange} required className="mt-1 block w-full p-2 border rounded-md"/></div>
                        <div><label className="text-sm font-medium">Máx. Alunos</label><input type="number" name="maxStudents" value={classForm.maxStudents} onChange={handleFormChange} min="1" required className="mt-1 block w-full p-2 border rounded-md"/></div>
                        <div>
                            <label className="text-sm font-medium">Modalidade</label>
                            <select name="type" value={classForm.type} onChange={handleFormChange} required className="mt-1 block w-full p-2 border rounded-md bg-white">
                                <option value="" disabled>Selecione...</option>
                                {CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Professor</label>
                            <select name="teacherId" value={classForm.teacherId} onChange={handleFormChange} required className="mt-1 block w-full p-2 border rounded-md bg-white" disabled={!classForm.type}>
                                <option value="" disabled>Selecione...</option>
                                {teachers.filter(t => t.specialties.includes(classForm.type)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </FullScreenFormModal>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-black">Gerenciar Aulas</h2>
                <button onClick={openModalForNew} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90">
                    <PlusCircle className="h-5 w-5" />Nova Aula
                </button>
            </div>
            
            <MonthNavigator displayedDate={displayedDate} onPrevious={handlePreviousMonth} onNext={handleNextMonth} />
            
            <div className="space-y-4">
                {filteredAndSortedClasses.map(cls => 
                    <ClassItem 
                        key={cls.id} 
                        cls={cls} 
                        allUsers={users} 
                        onDeleteClass={requestDelete} 
                        onEditClass={openModalForEdit} 
                    />
                )}
            </div>
        </>
    );
}