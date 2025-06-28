import React, { useState, useMemo, useCallback } from 'react';
import { Search, PlusCircle } from 'lucide-react';
import UserList from '../../components/ui/UserList';
import { useAppContext } from '../../context/AppContext';
import { maskPhone } from '../../utils/helpers';
import { CLASS_TYPES } from '../../constants/mockData';

export default function UserManagementView() {
    const { users, setUsers, handleCreateUser, handleResetPassword, handleAddExtraClasses } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [userModal, setUserModal] = useState({ isOpen: false, data: null });
    const [extraClassesToAdd, setExtraClassesToAdd] = useState(0);
    const displayedDate = new Date();

    const handleSearchTermChange = useCallback((e) => setSearchTerm(e.target.value), []);

    const handleAddUserClick = useCallback(() => {
        setUserModal({
            isOpen: true,
            data: { id: null, name: '', username: '', role: 'student', status: 'active', phone: '', email: '', birthDate: '', paymentDueDate: 1, plan: { total: 8, name: 'Plano 8 Aulas', extraClasses: [] }, enrolledIn: [], specialties: [] }
        });
    }, []);
    
    const handleEditUserClick = useCallback((user) => {
        setUserModal({
            isOpen: true,
            data: { ...user, plan: user.plan ? { ...user.plan } : { total: 0 } }
        });
        setExtraClassesToAdd(0);
    }, []);
    
    const handleUserFormChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        
        setUserModal(currentModal => {
            const currentData = { ...currentModal.data };
            let finalValue;
    
            if (type === 'checkbox') {
                const currentArray = currentData[name] || [];
                finalValue = checked ? [...currentArray, value] : currentArray.filter(v => v !== value);
            } else if (name === 'phone') {
                finalValue = maskPhone(value);
            } else if (name === 'plan.total') {
                currentData.plan.total = value;
                // Atualiza o nome do plano para refletir a quantidade de aulas
                currentData.plan.name = `Plano ${value} Aulas`;
                return { ...currentModal, data: { ...currentData }};
            } else {
                finalValue = value;
            }
    
            return {
                ...currentModal,
                data: { ...currentData, [name]: finalValue }
            };
        });
    }, []);

    const handleSaveUser = () => {
        if (!userModal.data) return;
        const { id, ...formData } = userModal.data;
        const userData = { ...formData, phone: formData.phone.replace(/\D/g, '') };
    
        if (userData.role === 'student') {
            userData.plan = { ...userData.plan, total: parseInt(userData.plan.total, 10) };
        } else {
            userData.plan = null;
            delete userData.enrolledIn;
        }
    
        if (id) {
            setUsers(currentUsers => currentUsers.map(u => u.id === id ? { ...u, ...userData } : u));
            if (extraClassesToAdd > 0) {
                handleAddExtraClasses(id, extraClassesToAdd, displayedDate);
            }
        } else {
            handleCreateUser({ ...userData, password: 'password', checkedInClassIds: [], lateCancellations: [] });
        }
        setUserModal({ isOpen: false, data: null });
    };

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users.filter(u => u.role !== 'admin');
        const term = searchTerm.toLowerCase();
        const numericTerm = searchTerm.replace(/\D/g, '');
        return users.filter(u => u.role !== 'admin' && (
            u.name.toLowerCase().includes(term) ||
            u.username.toLowerCase().includes(term) ||
            (numericTerm && u.phone && u.phone.replace(/\D/g, '').includes(numericTerm))
        ));
    }, [users, searchTerm]);

    return (
        <>
            {userModal.isOpen && userModal.data && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg p-6 space-y-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold">{userModal.data.id ? `Editando ${userModal.data.name}` : 'Criar Novo Usuário'}</h3>
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label>Nome</label><input type="text" name="name" value={userModal.data.name} onChange={handleUserFormChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                                <div><label>Username</label><input type="text" name="username" value={userModal.data.username} onChange={handleUserFormChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                                <div><label>Email</label><input type="email" name="email" value={userModal.data.email} onChange={handleUserFormChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                                <div><label>Telefone/Whats</label><input type="tel" name="phone" value={userModal.data.phone} onChange={handleUserFormChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                                <div><label>Data de Nascimento</label><input type="date" name="birthDate" value={userModal.data.birthDate} onChange={handleUserFormChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                                <div><label>Função</label><select name="role" value={userModal.data.role} onChange={handleUserFormChange} className="w-full mt-1 p-2 border rounded-md"><option value="student">Aluno</option><option value="teacher">Professor</option></select></div>
                            </div>
                        </div>
                        <div>
                            <label className="font-semibold">Status</label>
                            <select name="status" value={userModal.data.status} onChange={handleUserFormChange} className="w-full mt-1 p-2 border rounded-md"><option value="active">Ativo</option><option value="inactive">Inativo</option></select>
                        </div>
                        {userModal.data.role === 'student' && (
                            <>
                                <div><label className="font-semibold">Plano Mensal (Créditos):</label><input type="number" name="plan.total" value={userModal.data.plan.total} onChange={handleUserFormChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                                <div><label className="font-semibold">Dia de Vencimento:</label><input type="number" name="paymentDueDate" value={userModal.data.paymentDueDate} onChange={handleUserFormChange} min="1" max="31" className="w-full mt-1 p-2 border rounded-md"/></div>
                                {userModal.data.id && <div><label className="font-semibold">Aulas Extras (este mês):</label><input type="number" value={extraClassesToAdd} onChange={(e) => setExtraClassesToAdd(parseInt(e.target.value) || 0)} className="w-full mt-1 p-2 border rounded-md"/></div>}
                                <div>
                                    <label className="font-semibold">Modalidades:</label>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
                                        {CLASS_TYPES.map(type => (<label key={type} className="flex items-center gap-2"><input type="checkbox" name="enrolledIn" value={type} checked={userModal.data.enrolledIn?.includes(type)} onChange={handleUserFormChange}/>{type}</label>))}
                                    </div>
                                </div>
                            </>
                        )}
                        {userModal.data.role === 'teacher' && (
                            <div>
                                <label className="font-semibold">Especialidades:</label>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
                                    {CLASS_TYPES.map(type => (<label key={type} className="flex items-center gap-2"><input type="checkbox" name="specialties" value={type} checked={userModal.data.specialties?.includes(type)} onChange={handleUserFormChange}/>{type}</label>))}
                                </div>
                            </div>
                        )}
                        {userModal.data.id && <button onClick={() => handleResetPassword(userModal.data.id)} className="text-sm text-blue-600 hover:underline">Redefinir Senha</button>}
                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={() => setUserModal({isOpen: false, data: null})} className="px-4 py-2 text-sm rounded-md border">Cancelar</button>
                            <button onClick={handleSaveUser} className="px-4 py-2 text-sm rounded-md bg-[#ddfb3b] text-black font-bold">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center mb-6">
                <div className="relative flex-grow mr-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input type="text" placeholder="Buscar por nome, usuário ou telefone..." value={searchTerm} onChange={handleSearchTermChange} className="w-full pl-10 pr-4 py-2 border rounded-full"/>
                </div>
                <button onClick={handleAddUserClick} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90">
                    <PlusCircle className="h-5 w-5" />Novo Usuário
                </button>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                <UserList title="Alunos" users={filteredUsers.filter(u => u.role === 'student')} onEditClick={handleEditUserClick} />
                <UserList title="Professores" users={filteredUsers.filter(u => u.role === 'teacher')} onEditClick={handleEditUserClick} />
            </div>
        </>
    );
}