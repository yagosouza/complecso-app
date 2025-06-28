// src/pages/AdminDashboard/UserManagementView.js
import React, { useState, useMemo, useCallback } from 'react';
import { Search, PlusCircle } from 'lucide-react';
import UserList from '../../components/ui/UserList';
import FullScreenFormModal from '../../components/modals/FullScreenFormModal';
import { useAppContext } from '../../context/AppContext';
import { maskPhone } from '../../utils/helpers';
import { CLASS_TYPES } from '../../constants/mockData';

export default function UserManagementView() {
    const { users, setUsers, handleCreateUser, handleResetPassword, handleAddExtraClasses } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [extraClassesToAdd, setExtraClassesToAdd] = useState(0);
    const [activeTab, setActiveTab] = useState('students'); // Estado para as abas

    const handleSearchTermChange = useCallback((e) => setSearchTerm(e.target.value), []);

    const openModalForNew = useCallback(() => {
        setEditingUser({
            id: null, name: '', username: '', role: activeTab === 'students' ? 'student' : 'teacher', status: 'active', phone: '', email: '', birthDate: '', paymentDueDate: 10, plan: { total: 8, name: 'Plano 8 Aulas', extraClasses: [] }, enrolledIn: [], specialties: []
        });
        setIsModalOpen(true);
    }, [activeTab]);
    
    const openModalForEdit = useCallback((user) => {
        setEditingUser({ ...user, plan: user.plan ? { ...user.plan } : { total: 0, name: 'Plano 0 Aulas' } });
        setExtraClassesToAdd(0);
        setIsModalOpen(true);
    }, []);
    
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditingUser(currentUser => {
            const updatedUser = JSON.parse(JSON.stringify(currentUser)); // Deep copy para evitar mutação
            if (name === 'plan.total') {
                updatedUser.plan.total = value;
                updatedUser.plan.name = `Plano ${value} Aulas`;
            } else if (type === 'checkbox') {
                 const currentArray = updatedUser[name] || [];
                 updatedUser[name] = checked ? [...currentArray, value] : currentArray.filter(v => v !== value);
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
    
        if (userData.role === 'student') {
            userData.plan = { ...userData.plan, total: parseInt(userData.plan.total, 10) || 0 };
        } else {
            userData.plan = null;
            delete userData.enrolledIn;
        }
    
        if (id) {
            setUsers(currentUsers => currentUsers.map(u => u.id === id ? { ...u, ...userData } : u));
            if (extraClassesToAdd > 0) handleAddExtraClasses(id, extraClassesToAdd, new Date());
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
                            <div className="p-4 border rounded-md space-y-4">
                                <h4 className="font-semibold">Dados de Aluno</h4>
                                <div><label className="font-semibold">Plano Mensal (Créditos):</label><input type="number" name="plan.total" value={editingUser.plan?.total || 0} onChange={handleFormChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                                <div><label className="font-semibold">Dia de Vencimento:</label><input type="number" name="paymentDueDate" value={editingUser.paymentDueDate} onChange={handleFormChange} min="1" max="31" className="w-full mt-1 p-2 border rounded-md"/></div>
                                {editingUser.id && <div><label className="font-semibold">Adicionar Aulas Extras (este mês):</label><input type="number" value={extraClassesToAdd} onChange={(e) => setExtraClassesToAdd(parseInt(e.target.value) || 0)} className="w-full mt-1 p-2 border rounded-md"/></div>}
                                <div>
                                    <label className="font-semibold">Modalidades:</label>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-2">{CLASS_TYPES.map(type => (<label key={type} className="flex items-center gap-2"><input type="checkbox" name="enrolledIn" value={type} checked={editingUser.enrolledIn?.includes(type)} onChange={handleFormChange}/>{type}</label>))}</div>
                                </div>
                            </div>
                        )}
                        
                        {editingUser.role === 'teacher' && (
                             <div className="p-4 border rounded-md space-y-4">
                                <h4 className="font-semibold">Dados de Professor</h4>
                                <label className="font-semibold">Especialidades:</label>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-1">{CLASS_TYPES.map(type => (<label key={type} className="flex items-center gap-2"><input type="checkbox" name="specialties" value={type} checked={editingUser.specialties?.includes(type)} onChange={handleFormChange}/>{type}</label>))}</div>
                             </div>
                        )}
                        
                        {editingUser.id && <button onClick={() => handleResetPassword(editingUser.id)} className="text-sm text-blue-600 hover:underline mt-2">Redefinir Senha</button>}
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