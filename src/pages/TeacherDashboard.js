// src/pages/TeacherDashboard.js
import React, { useState, useMemo, useCallback } from 'react';
import { PlusCircle } from 'lucide-react';
import DayView from '../components/ui/DayView';
import ConfirmModal from '../components/modals/ConfirmModal';
import FullScreenFormModal from '../components/modals/FullScreenFormModal';
import ClassItem from '../components/ui/ClassItem';
import ClassForm from '../components/forms/ClassForm';
import { useAppContext } from '../context/AppContext';
import { Timestamp } from 'firebase/firestore';

const initialFormState = (modalities) => ({
    date: '', time: '', maxStudents: 10,
    type: modalities.length === 1 ? modalities[0] : '', 
    categories: [], description: ''
});
const initialRecurrenceState = { isRecurring: false, days: [], occurrences: 4 };

export default function TeacherDashboard() {
    const { currentUser, classes, users, handleSaveClass, handleDeleteClass } = useAppContext();
    
    const [displayedDate, setDisplayedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [classForm, setClassForm] = useState(initialFormState(currentUser.specialties || []));
    const [editingClass, setEditingClass] = useState(null);
    const [recurrence, setRecurrence] = useState(initialRecurrenceState);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, classId: null });
    const [isSaving, setIsSaving] = useState(false);
    
    const filteredClasses = useMemo(() => {
        // CORREÇÃO: Compara o ID do professor (que é o UID do Firebase) e as datas corretamente.
        return classes
            .filter(c => {
                if (!c.date) return false; // Ignora aulas sem data
                const classDate = new Date(c.date);
                return c.teacherId === currentUser.uid && classDate.toDateString() === displayedDate.toDateString();
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [classes, displayedDate, currentUser.uid]);
    
    const handleSave = async () => {
        const { date, time, maxStudents, type, categories, description } = classForm; 
        if (!date || !time || !type) return alert("Por favor, preencha todos os campos obrigatórios.");
        setIsSaving(true);

        const classDate = new Date(`${date}T${time}`);
        const classData = {
            id: editingClass ? editingClass.id : null,
            date: Timestamp.fromDate(classDate),
            maxStudents: parseInt(maxStudents),
            teacherId: currentUser.uid, // Usa o UID do professor logado
            type, categories, description
        };

        try {
            await handleSaveClass(classData);
            setIsModalOpen(false);
        } catch (error) {
            alert("Não foi possível salvar a aula.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const openModalForNew = useCallback(() => {
        setEditingClass(null);
        setClassForm(initialFormState(currentUser.specialties || []));
        setRecurrence(initialRecurrenceState);
        setIsModalOpen(true);
    }, [currentUser.specialties]);

    const openModalForEdit = useCallback((cls) => {
        setEditingClass(cls);
        const d = new Date(cls.date);
        setClassForm({
            date: d.toISOString().split('T')[0],
            time: d.toTimeString().substring(0, 5),
            maxStudents: cls.maxStudents, type: cls.type,
            categories: cls.categories, description: cls.description || '',
            teacherId: cls.teacherId
        });
        setIsModalOpen(true);
    }, []);
    
    const requestDelete = (classId) => setDeleteModal({ isOpen: true, classId });

    const confirmDelete = async () => {
        await handleDeleteClass(deleteModal.classId);
        setDeleteModal({ isOpen: false, classId: null });
    };

    return (
        <>
            <ConfirmModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({isOpen: false, classId: null})} onConfirm={confirmDelete} title="Excluir Aula" />

            <FullScreenFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} isSaving={isSaving} title={editingClass ? 'Editar Aula' : 'Nova Aula'}>
                <ClassForm classForm={classForm} setClassForm={setClassForm} recurrence={recurrence} setRecurrence={setRecurrence} isEditing={!!editingClass} isTeacherView={true} />
            </FullScreenFormModal>

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <DayView displayedDate={displayedDate} setDisplayedDate={setDisplayedDate} />
                    <button onClick={openModalForNew} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90 ml-4">
                        <PlusCircle className="h-5 w-5" />Nova Aula
                    </button>
                </div>
                
                <div className="space-y-4">
                    {filteredClasses.length > 0 ? filteredClasses.map(cls => (
                        <ClassItem key={cls.id} cls={cls} allUsers={users} onDeleteClass={requestDelete} onEditClass={openModalForEdit} />
                    )) : <p className="text-center text-gray-500 bg-white p-8 rounded-lg">Nenhuma aula sua marcada para este dia.</p>}
                </div>
            </div>
        </>
    );
}