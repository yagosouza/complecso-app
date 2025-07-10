// src/pages/adminDashboardManagement/UserManagementView.js
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, PlusCircle } from 'lucide-react';
import UserList from '../../components/ui/UserList';
import FullScreenFormModal from '../../components/modals/FullScreenFormModal';
import { useAppContext } from '../../context/AppContext';
import { maskPhone } from '../../utils/helpers';
import ClassPackManager from './ClassPackManager';

export default function UserManagementView() {
    const { users, setUsers, handleCreateUser, handleResetPassword, modalities, categories } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [activeTab, setActiveTab] = useState('students');

    // Efeito para manter os dados do formulário sincronizados com o estado global
    useEffect(() => {
        if (editingUser && editingUser.id) {
            const freshUserData = users.find(u => u.id === editingUser.id);
            if (freshUserData) {
                // Previne a perda de dados ao comparar string JSON para evitar re-renderizações desnecessárias
                if (JSON.stringify(freshUserData) !== JSON.stringify(editingUser)) {
                    setEditingUser(freshUserData);
                }
            }
        }
    }, [users, editingUser]);

    const handleSearchTermChange = useCallback((e) => setSearchTerm(e.target.value), []);

    const openModalForNew = useCallback(() => {
        setEditingUser({
            id: null, name: '', username: '', role: activeTab === 'students' ? 'student' : 'teacher', 
            status: 'active', phone: '', email: '', birthDate: '', enrolledIn: [], specialties: [], 
            classPacks: [], // Garante que a propriedade exista para novos usuários
            categories: []
        });
        setIsModalOpen(true);
    }, [activeTab]);

    const openModalForEdit = useCallback((user) => {
        setEditingUser({
            ...user,
            classPacks: user.classPacks || [], // Garante que a propriedade exista ao editar
        });
        setIsModalOpen(true);
    }, []);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditingUser(currentUser => {
            const updatedUser = { ...currentUser };
            if (type === 'checkbox') {
                 const currentArray = updatedUser[name] || [];
                 if (name === "categories" || name === "enrolledIn" || name === "specialties") {
                    updatedUser[name] = checked ? [...currentArray, value] : currentArray.filter(v => v !== value);
                 }
            } else {
                updatedUser[name] = value;
            }
            return updatedUser;
        });
    };

    const handleSave = () => {
        if (!editingUser) return;
        const { id, ...formData } = editingUser;
        const userData = { ...formData, phone: formData.phone.replace(/\D/g, '') };

        if (id) {
            setUsers(currentUsers => currentUsers.map(u => u.id === id ? userData : u));
        } else {
            handleCreateUser({ ...userData, password: 'password', checkedInClassIds: [], lateCancellations: [] });
        }
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users.filter(u => u.role !== 'admin');
        const term = searchTerm.toLowerCase();
        return users.filter(u => u.role !== 'admin' && (u.name.toLowerCase().includes(term) || u.username.toLowerCase().includes(term)));
    }, [users, searchTerm]);

    const students = useMemo(() => filteredUsers.filter(u => u.role === 'student'), [filteredUsers]);
    const teachers = useMemo(() => filteredUsers.filter(u => u.role === 'teacher'), [filteredUsers]);

    return (
        <div className="space-y-6">
            <FullScreenFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                title={editingUser?.id ? 'Editar Usuário' : 'Novo Usuário'}
            >
                {editingUser && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className="text-sm font-medium">Nome</label><input type="text" name="name" value={editingUser.name} onChange={handleFormChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                            <div><label className="text-sm font-medium">Username</label><input type="text" name="username" value={editingUser.username} onChange={handleFormChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                            <div><label className="text-sm font-medium">Email</label><input type="email" name="email" value={editingUser.email} onChange={handleFormChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                            <div><label className="text-sm font-medium">Telefone/Whats</label><input type="tel" name="phone" value={editingUser.phone} onChange={e => setEditingUser({...editingUser, phone: maskPhone(e.target.value)})} className="w-full mt-1 p-2 border rounded-md"/></div>
                            <div><label className="text-sm font-medium">Data de Nascimento</label><input type="date" name="birthDate" value={editingUser.birthDate} onChange={handleFormChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                            <div><label className="text-sm font-medium">Função</label><select name="role" value={editingUser.role} onChange={handleFormChange} className="w-full mt-1 p-2 border rounded-md bg-white"><option value="student">Aluno</option><option value="teacher">Professor</option></select></div>
                        </div>

                        <div><label className="font-semibold">Status</label><select name="status" value={editingUser.status} onChange={handleFormChange} className="w-full mt-1 p-2 border rounded-md bg-white"><option value="active">Ativo</option><option value="inactive">Inativo</option></select></div>

                        {editingUser.role === 'student' && (
                            <>
                                <div className="p-4 border rounded-md space-y-4">
                                    <label className="font-semibold">Categorias:</label>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                                        {categories.map(cat => (
                                            <label key={cat} className="flex items-center gap-2">
                                                <input type="checkbox" name="categories" value={cat} checked={editingUser.categories?.includes(cat)} onChange={handleFormChange}/>{cat}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 border rounded-md space-y-4">
                                    <label className="font-semibold">Modalidades:</label>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                                        {modalities.map(type => (
                                            <label key={type} className="flex items-center gap-2">
                                                <input type="checkbox" name="enrolledIn" value={type} checked={editingUser.enrolledIn?.includes(type)} onChange={handleFormChange}/>{type}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                {editingUser.id && <ClassPackManager userId={editingUser.id} />}
                            </>
                        )}

                        {editingUser.role === 'teacher' && (
                             <div className="p-4 border rounded-md space-y-4">
                                <label className="font-semibold">Especialidades:</label>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-1">{modalities.map(type => (<label key={type} className="flex items-center gap-2"><input type="checkbox" name="specialties" value={type} checked={editingUser.specialties?.includes(type)} onChange={handleFormChange}/>{type}</label>))}</div>
                             </div>
                        )}

                        {editingUser.id && <button type="button" onClick={() => handleResetPassword(editingUser.id)} className="text-sm text-blue-600 hover:underline mt-2">Redefinir Senha</button>}
                    </div>
                )}
            </FullScreenFormModal>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input type="text" placeholder="Buscar por nome ou usuário..." value={searchTerm} onChange={handleSearchTermChange} className="w-full pl-10 pr-4 py-2 border rounded-full"/>
                </div>
                <button onClick={openModalForNew} className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90">
                    <PlusCircle className="h-5 w-5" />
                    Novo {activeTab === 'students' ? 'Aluno' : 'Professor'}
                </button>
            </div>

            <div>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex gap-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('students')}
                            className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${activeTab === 'students' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                        >
                            Alunos
                        </button>
                        <button
                             onClick={() => setActiveTab('teachers')}
                            className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${activeTab === 'teachers' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                        >
                            Professores
                        </button>
                    </nav>
                </div>
            </div>

            <div>
                {activeTab === 'students' && <UserList title="Alunos" users={students} onEditClick={openModalForEdit} />}
                {activeTab === 'teachers' && <UserList title="Professores" users={teachers} onEditClick={openModalForEdit} />}
            </div>
        </div>
    );
}