// src/pages/adminDashboardManagement/ClassManagementView.js
import React, { useState, useMemo, useCallback } from 'react';
import { PlusCircle } from 'lucide-react';
import DayView from '../../components/ui/DayView';
import ClassItem from '../../components/ui/ClassItem';
import ConfirmModal from '../../components/modals/ConfirmModal';
import FullScreenFormModal from '../../components/modals/FullScreenFormModal';
import ClassForm from '../../components/forms/ClassForm';
import { useAppContext } from '../../context/AppContext';
import { Timestamp } from 'firebase/firestore'; // Importe o Timestamp

const initialFormState = {
    date: '', time: '', maxStudents: 10, teacherId: '', 
    type: '', categories: [], description: ''
};
const initialRecurrenceState = { isRecurring: false, days: [], occurrences: 4 };

export default function ClassManagementView() {
    const { classes, users, modalities, handleSaveClass, handleDeleteClass } = useAppContext();

    const [displayedDate, setDisplayedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [classForm, setClassForm] = useState(initialFormState);
    const [recurrence, setRecurrence] = useState(initialRecurrenceState);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, classId: null });

    const handleSave = async () => {
        const { date, time, maxStudents, teacherId, type, categories, description } = classForm;
        if (!date || !time || !teacherId || !type || categories.length === 0) {
            return alert("Por favor, preencha todos os campos obrigatórios.");
        }
        setIsSaving(true);
    
        try {
            if (editingClass) {
                // Lógica para editar uma aula existente
                const [year, month, day] = date.split('-');
                const [hour, minute] = time.split(':');
                const classDate = new Date(year, parseInt(month) - 1, day, hour, minute);
    
                const classData = {
                    id: editingClass.id,
                    date: Timestamp.fromDate(classDate),
                    maxStudents: parseInt(maxStudents),
                    teacherId: teacherId,
                    type, categories, description
                };
                await handleSaveClass(classData);
            } else {
                // Lógica para criar uma ou mais aulas novas
                const startDate = new Date(`${date}T${time}`);
                
                if (recurrence.isRecurring && recurrence.days.length > 0) {
                    // Cria aulas recorrentes
                    let classesToCreate = [];
                    let occurrencesFound = 0;
                    for (let i = 0; occurrencesFound < recurrence.occurrences && i < 90; i++) {
                        const newDate = new Date(startDate);
                        newDate.setDate(startDate.getDate() + i);
                        if (recurrence.days.includes(newDate.getDay())) {
                            classesToCreate.push({
                                date: Timestamp.fromDate(newDate),
                                maxStudents: parseInt(maxStudents),
                                teacherId: teacherId,
                                type, categories, description
                            });
                            occurrencesFound++;
                        }
                    }
                    // Idealmente, você teria uma função no contexto para salvar em lote
                    await Promise.all(classesToCreate.map(cls => handleSaveClass(cls)));
                } else {
                    // Cria uma única aula
                    await handleSaveClass({
                        date: Timestamp.fromDate(startDate),
                        maxStudents: parseInt(maxStudents),
                        teacherId: teacherId,
                        type, categories, description
                    });
                }
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Erro ao salvar aula:", error);
            alert("Ocorreu um erro ao salvar a aula.");
        } finally {
            setIsSaving(false);
        }
    };

    const openModalForNew = useCallback(() => {
        setEditingClass(null);
        setClassForm(initialFormState);
        setRecurrence(initialRecurrenceState);
        setIsModalOpen(true);
    }, []);

    const openModalForEdit = useCallback((cls) => {
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
    }, []);

    const requestDelete = (classId) => setDeleteModal({ isOpen: true, classId });

    const confirmDelete = async () => {
        await handleDeleteClass(deleteModal.classId);
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

            <FullScreenFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} isSaving={isSaving} title={editingClass ? 'Editar Aula' : 'Nova Aula'}>
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