// src/pages/TeacherDashboard.js
import React, { useState, useMemo, useCallback } from 'react';
import { PlusCircle } from 'lucide-react';
import MonthNavigator from '../components/ui/MonthNavigator';
import ConfirmModal from '../components/modals/ConfirmModal';
import FullScreenFormModal from '../components/modals/FullScreenFormModal';
import ClassItem from '../components/ui/ClassItem'; // Importação do componente reutilizável
import { useAppContext } from '../context/AppContext';

const initialFormState = { date: '', time: '', maxStudents: 10, type: '' };

export default function TeacherDashboard() {
    // Adicionamos 'setClasses' e 'users' para edição e exibição dos nomes
    const { currentUser, classes, setClasses, users, handleCreateClass, handleDeleteClass } = useAppContext();
    
    const [displayedDate, setDisplayedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [classForm, setClassForm] = useState(initialFormState);
    const [editingClass, setEditingClass] = useState(null); // Estado para controlar a edição
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, classId: null });
    
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

    // Lógica para salvar (agora trata criação e edição)
    const handleSaveClass = () => {
        const { date, time, maxStudents, type } = classForm;
        if (!date || !time || !type) {
            alert("Por favor, preencha todos os campos.");
            return;
        }
        const [year, month, day] = date.split('-');
        const [hour, minute] = time.split(':');
        const classDate = new Date(year, parseInt(month) - 1, day, hour, minute);

        const classData = { date: classDate, maxStudents: parseInt(maxStudents), type };

        if (editingClass) {
            // Atualiza a aula existente
            setClasses(prevClasses => prevClasses.map(c => 
                c.id === editingClass.id 
                ? { ...editingClass, ...classData } 
                : c
            ));
        } else {
            // Cria uma nova aula
            handleCreateClass(classData, currentUser.id);
        }
        
        setIsModalOpen(false);
    };
    
    // Abre o modal para uma nova aula
    const openModalForNew = () => {
        setEditingClass(null); // Garante que não está em modo de edição
        setClassForm(initialFormState);
        setIsModalOpen(true);
    };

    // Abre o modal para editar uma aula existente
    const openModalForEdit = useCallback((cls) => {
        setEditingClass(cls);
        const d = new Date(cls.date);
        setClassForm({
            date: d.toISOString().split('T')[0],
            time: d.toTimeString().substring(0, 5),
            maxStudents: cls.maxStudents,
            type: cls.type,
        });
        setIsModalOpen(true);
    }, []);
    
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
                title={editingClass ? 'Editar Aula' : 'Nova Aula'}
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
                    {filteredClasses.length > 0 ? filteredClasses.map(cls => (
                        <ClassItem
                            key={cls.id}
                            cls={cls}
                            allUsers={users}
                            onDeleteClass={requestDelete}
                            onEditClass={openModalForEdit} // Passando a nova função de edição
                        />
                    )) : <p className="text-center text-gray-500 bg-white p-8 rounded-lg">Nenhuma aula sua marcada para este mês.</p>}
                </div>
            </div>
        </>
    );
}