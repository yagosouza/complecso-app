// src/pages/adminDashboardManagement/ClassPackManager.js
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { calculateNewExpiryDate } from '../../utils/classHelpers';
import { Plus, Edit, Trash2 } from 'lucide-react';
import FullScreenFormModal from '../../components/modals/FullScreenFormModal';

export default function ClassPackManager({ userId }) {
    const { users, setUsers, plans } = useAppContext();
    const student = users.find(u => u.id === userId);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPack, setEditingPack] = useState(null);
    const [formState, setFormState] = useState({ planId: plans[0]?.id || '', bonusClasses: 0, purchaseDate: new Date().toISOString().split('T')[0] });

    const openModalForNew = () => {
        setEditingPack(null);
        setFormState({ planId: plans[0]?.id || '', bonusClasses: 0, purchaseDate: new Date().toISOString().split('T')[0] });
        setIsModalOpen(true);
    };

    const openModalForEdit = (pack) => {
        setEditingPack(pack);
        setFormState({
            planId: pack.planId,
            bonusClasses: pack.bonusClasses || 0,
            purchaseDate: new Date(pack.purchaseDate).toISOString().split('T')[0],
        });
    };

    const handleSave = () => {
        const paymentDate = new Date(formState.purchaseDate);
        const selectedPlan = plans.find(p => p.id === formState.planId);
        if (!selectedPlan) return alert("Plano não encontrado!");

        const classesPurchased = selectedPlan.classes === Infinity ? Infinity : selectedPlan.classes + parseInt(formState.bonusClasses, 10);
        const classesRemaining = classesPurchased;

        setUsers(currentUsers => currentUsers.map(user => {
            if (user.id === userId) {
                let updatedPacks;
                if (editingPack) {
                    updatedPacks = user.classPacks.map(p => p.id === editingPack.id ? {
                        ...p,
                        planId: selectedPlan.id,
                        purchaseDate: paymentDate.toISOString(),
                        classesPurchased: classesPurchased,
                        classesRemaining: classesRemaining - (p.classesPurchased - p.classesRemaining),
                        bonusClasses: parseInt(formState.bonusClasses, 10)
                    } : p);
                } else {
                    const expiryDate = calculateNewExpiryDate(paymentDate);
                    const newPack = {
                        id: `p${Date.now()}`,
                        planId: selectedPlan.id,
                        purchaseDate: paymentDate.toISOString(),
                        classesPurchased: classesPurchased,
                        classesRemaining: classesRemaining,
                        bonusClasses: parseInt(formState.bonusClasses, 10),
                        expiryDate: expiryDate.toISOString(),
                    };
                    updatedPacks = [...(user.classPacks || []), newPack];
                }
                return { ...user, classPacks: updatedPacks };
            }
            return user;
        }));

        setIsModalOpen(false);
    };

    const handleDelete = (packId) => {
        if (window.confirm('Tem certeza que deseja excluir este pacote de aulas?')) {
            setUsers(currentUsers => currentUsers.map(user => {
                if (user.id === userId) {
                    const updatedPacks = user.classPacks.filter(p => p.id !== packId);
                    return { ...user, classPacks: updatedPacks };
                }
                return user;
            }));
        }
    };

    const handleFormChange = (e) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="mt-6 p-4 border rounded-md space-y-4 bg-gray-50">
            <FullScreenFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                title={editingPack ? 'Editar Pacote de Aulas' : 'Adicionar Pagamento'}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data do Pagamento</label>
                        <input type="date" name="purchaseDate" value={formState.purchaseDate} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Plano</label>
                        <select name="planId" value={formState.planId} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md bg-white">
                            {plans.map(plan => (
                                <option key={plan.id} value={plan.id}>{plan.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Aulas Bônus</label>
                        <input type="number" name="bonusClasses" value={formState.bonusClasses} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md"/>
                    </div>
                </div>
            </FullScreenFormModal>

            <h4 className="font-semibold text-black flex justify-between items-center">
                <span>Histórico de Pagamentos</span>
                <button onClick={openModalForNew} className="p-2 hover:bg-gray-200 rounded-full"><Plus className="w-5 h-5"/></button>
            </h4>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {student.classPacks?.length > 0 ? [...student.classPacks].reverse().map(pack => (
                    <div key={pack.id} className="bg-white p-3 rounded-md shadow-sm flex justify-between items-center">
                        <div>
                            <p className="font-semibold">
                                {pack.classesRemaining === Infinity ? 'Ilimitado' : `${pack.classesRemaining} / ${pack.classesPurchased}`} aulas
                            </p>
                            <p className="text-xs text-gray-500">
                                Pago em: {new Date(pack.purchaseDate).toLocaleDateString('pt-BR')} |
                                Vence em: {new Date(pack.expiryDate).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => openModalForEdit(pack)} className="p-2 hover:bg-gray-100 rounded-full"><Edit className="w-4 h-4 text-blue-600"/></button>
                            <button onClick={() => handleDelete(pack.id)} className="p-2 hover:bg-gray-100 rounded-full"><Trash2 className="w-4 h-4 text-red-600"/></button>
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-center text-gray-500 py-4">Nenhum pagamento registrado.</p>
                )}
            </div>
        </div>
    );
}