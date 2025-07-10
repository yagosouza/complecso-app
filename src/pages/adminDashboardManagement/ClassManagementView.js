// src/pages/adminDashboardManagement/ClassManagementView.js
import React, { useState, useMemo } from 'react';
import { PlusCircle } from 'lucide-react';
import DayView from '../../components/ui/DayView';
import ClassItem from '../../components/ui/ClassItem';
import ConfirmModal from '../../components/modals/ConfirmModal';
import FullScreenFormModal from '../../components/modals/FullScreenFormModal';
import ClassForm from '../../components/forms/ClassForm';
import { useAppContext } from '../../context/AppContext';

const initialFormState = (modalities) => { return { date: '', time: '', maxStudents: 10, teacherId: '', type: modalities.length === 1 ? modalities[0] : '', categories: [], description: '' }; };
const initialRecurrenceState = { isRecurring: false, days: [], occurrences: 4 };

export default function ClassManagementView() {
    const { classes, setClasses, users, modalities, handleCreateClass, handleDeleteClass } = useAppContext();

    const [displayedDate, setDisplayedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [classForm, setClassForm] = useState(initialFormState(modalities));
    const [recurrence, setRecurrence] = useState(initialRecurrenceState);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, classId: null });

    const handleSave = () => {
        const { date, time, maxStudents, teacherId, type, categories: classCategories, description } = classForm; // Adicione description
        if (!date || !time || !teacherId || !type || classCategories.length === 0) {
            alert("Por favor, preencha todos os campos, incluindo ao menos uma categoria.");
            return;
        }

        if (editingClass) {
            const [year, month, day] = date.split('-');
            const [hour, minute] = time.split(':');
            const classDate = new Date(year, parseInt(month) - 1, day, hour, minute);
            setClasses(prev => prev.map(c => c.id === editingClass.id ? { ...c, date: classDate, maxStudents: parseInt(maxStudents), teacherId: parseInt(teacherId), type, categories: classCategories, description } : c)); 
        } else if (recurrence.isRecurring && recurrence.days.length > 0) {
            let classesToCreate = [];
            let occurrencesFound = 0;
            const startDate = new Date(`${date}T${time}`);
            
            for (let i = 0; occurrencesFound < recurrence.occurrences && i < 90; i++) { // Adicionado um limite de 90 dias para evitar loops infinitos
                const newDate = new Date(startDate);
                newDate.setDate(startDate.getDate() + i);

                if (recurrence.days.includes(newDate.getDay())) {
                    const newClassData = {
                        date: newDate,
                        maxStudents: parseInt(maxStudents),
                        type,
                        categories: classCategories,
                        description
                    };
                    classesToCreate.push({ ...newClassData, id: Date.now() + occurrencesFound, teacherId: parseInt(teacherId), checkedInStudents: [], lateCancellations: [] });
                    occurrencesFound++;
                }
            }
            setClasses(prev => [...prev, ...classesToCreate]);

        } else {
            const [year, month, day] = date.split('-');
            const [hour, minute] = time.split(':');
            const classDate = new Date(year, parseInt(month) - 1, day, hour, minute);
            handleCreateClass({ date: classDate, maxStudents: parseInt(maxStudents), type, categories: classCategories, description }, parseInt(teacherId)); // Adicione description
        }

        setIsModalOpen(false);
    };

    const openModalForNew = () => {
        setEditingClass(null);
        setClassForm(initialFormState(modalities));
        setRecurrence(initialRecurrenceState);
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
            type: cls.type,
            categories: cls.categories,
            description: cls.description || ''
        });
        setRecurrence({ ...initialRecurrenceState, isRecurring: false });
        setIsModalOpen(true);
    };

    const requestDelete = (classId) => setDeleteModal({ isOpen: true, classId });

    const confirmDelete = () => {
        handleDeleteClass(deleteModal.classId);
        setDeleteModal({ isOpen: false, classId: null });
    };

    const filteredAndSortedClasses = useMemo(() =>
        classes
            .filter(c => new Date(c.date).toDateString() === displayedDate.toDateString())
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
                <ClassForm 
                    classForm={classForm}
                    setClassForm={setClassForm}
                    recurrence={recurrence}
                    setRecurrence={setRecurrence}
                    isEditing={!!editingClass}
                    isTeacherView={false}
                />
            </FullScreenFormModal>

            <div className="flex justify-between items-center mb-6">
                <DayView displayedDate={displayedDate} setDisplayedDate={setDisplayedDate} />
                <button onClick={openModalForNew} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90 ml-4">
                    <PlusCircle className="h-5 w-5" />Nova Aula
                </button>
            </div>
            
            <div className="space-y-4">
                {filteredAndSortedClasses.length > 0 ? (
                    filteredAndSortedClasses.map(cls => 
                        <ClassItem 
                            key={cls.id} 
                            cls={cls} 
                            allUsers={users} 
                            onDeleteClass={requestDelete} 
                            onEditClass={openModalForEdit} 
                        />
                    )
                ) : (
                    <p className="text-center text-gray-500 bg-white p-8 rounded-lg">Nenhuma aula encontrada para este dia.</p>
                )}
            </div>
        </>
    );
}