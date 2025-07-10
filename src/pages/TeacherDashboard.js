// src/pages/TeacherDashboard.js
import React, { useState, useMemo, useCallback } from 'react';
import { PlusCircle } from 'lucide-react';
import DayView from '../components/ui/DayView';
import ConfirmModal from '../components/modals/ConfirmModal';
import FullScreenFormModal from '../components/modals/FullScreenFormModal';
import ClassItem from '../components/ui/ClassItem';
import ClassForm from '../components/forms/ClassForm';
import { useAppContext } from '../context/AppContext';

const initialFormState = { date: '', time: '', maxStudents: 10, type: '', categories: [] };
const initialRecurrenceState = { isRecurring: false, days: [], occurrences: 4 };

export default function TeacherDashboard() {
    const { currentUser, classes, setClasses, users, handleCreateClass, handleDeleteClass } = useAppContext();
    
    const [displayedDate, setDisplayedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [classForm, setClassForm] = useState(initialFormState);
    const [editingClass, setEditingClass] = useState(null);
    const [recurrence, setRecurrence] = useState(initialRecurrenceState);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, classId: null });
    
    const filteredClasses = useMemo(() => {
        return classes
            .filter(c => 
                c.teacherId === currentUser.id &&
                new Date(c.date).toDateString() === displayedDate.toDateString()
            )
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [classes, displayedDate, currentUser.id]);
    
    const handleSaveClass = () => {
        const { date, time, maxStudents, type, categories: classCategories } = classForm;
        if (!date || !time || !type || classCategories.length === 0) {
            alert("Por favor, preencha todos os campos, incluindo ao menos uma categoria.");
            return;
        }

        const teacherId = currentUser.id;

        if (editingClass) {
            const [year, month, day] = date.split('-');
            const [hour, minute] = time.split(':');
            const classDate = new Date(year, parseInt(month) - 1, day, hour, minute);
            setClasses(prevClasses => prevClasses.map(c => 
                c.id === editingClass.id 
                ? { ...editingClass, date: classDate, maxStudents: parseInt(maxStudents), type, categories: classCategories, teacherId } 
                : c
            ));
        } else if (recurrence.isRecurring && recurrence.days.length > 0) {
            let classesToCreate = [];
            let occurrencesFound = 0;
            const startDate = new Date(`${date}T${time}`);

            for (let i = 0; occurrencesFound < recurrence.occurrences && i < 90; i++) {
                const newDate = new Date(startDate);
                newDate.setDate(startDate.getDate() + i);

                if (recurrence.days.includes(newDate.getDay())) {
                    const newClassData = {
                        date: newDate,
                        maxStudents: parseInt(maxStudents),
                        type,
                        categories: classCategories,
                    };
                    classesToCreate.push({ ...newClassData, id: Date.now() + occurrencesFound, teacherId, checkedInStudents: [], lateCancellations: [] });
                    occurrencesFound++;
                }
            }
            setClasses(prev => [...prev, ...classesToCreate]);
        } else {
            const [year, month, day] = date.split('-');
            const [hour, minute] = time.split(':');
            const classDate = new Date(year, parseInt(month) - 1, day, hour, minute);
            const classData = { date: classDate, maxStudents: parseInt(maxStudents), type, categories: classCategories };
            handleCreateClass(classData, teacherId);
        }
        
        setIsModalOpen(false);
    };
    
    const openModalForNew = () => {
        setEditingClass(null);
        setClassForm(initialFormState);
        setRecurrence(initialRecurrenceState);
        setIsModalOpen(true);
    };

    const openModalForEdit = useCallback((cls) => {
        setEditingClass(cls);
        const d = new Date(cls.date);
        setClassForm({
            date: d.toISOString().split('T')[0],
            time: d.toTimeString().substring(0, 5),
            maxStudents: cls.maxStudents,
            type: cls.type,
            categories: cls.categories,
            teacherId: cls.teacherId
        });
        setRecurrence({ ...initialRecurrenceState, isRecurring: false });
        setIsModalOpen(true);
    }, []);
    
    const requestDelete = (classId) => setDeleteModal({ isOpen: true, classId });
    const confirmDelete = () => {
        handleDeleteClass(deleteModal.classId);
        setDeleteModal({ isOpen: false, classId: null });
    };

    return (
        <>
            <ConfirmModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({isOpen: false, classId: null})} onConfirm={confirmDelete} title="Excluir Aula">
                Tem certeza que deseja excluir esta aula?
            </ConfirmModal>

            <FullScreenFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveClass}
                title={editingClass ? 'Editar Aula' : 'Nova Aula'}
            >
                <ClassForm
                    classForm={classForm}
                    setClassForm={setClassForm}
                    recurrence={recurrence}
                    setRecurrence={setRecurrence}
                    isEditing={!!editingClass}
                    isTeacherView={true}
                />
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
                        <ClassItem
                            key={cls.id}
                            cls={cls}
                            allUsers={users}
                            onDeleteClass={requestDelete}
                            onEditClass={openModalForEdit}
                        />
                    )) : <p className="text-center text-gray-500 bg-white p-8 rounded-lg">Nenhuma aula sua marcada para este dia.</p>}
                </div>
            </div>
        </>
    );
}