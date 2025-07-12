// src/pages/adminDashboardManagement/PlanManagementView.js
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Trash2, Edit } from 'lucide-react';
import FullScreenFormModal from '../../components/modals/FullScreenFormModal';

export default function PlanManagementView() {
    const { plans, handleSavePlan, handleDeletePlan } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formState, setFormState] = useState({ name: '', classes: 8, price: 0, isUnlimited: false });
    const [isSaving, setIsSaving] = useState(false);

    const openModalForNew = () => {
        setEditingPlan(null);
        setFormState({ name: '', classes: 8, price: 0, isUnlimited: false });
        setIsModalOpen(true);
    };

    const openModalForEdit = (plan) => {
        setEditingPlan(plan);
        setFormState({ 
            ...plan, 
            price: Number(plan.price) || 0, 
            classes: Number(plan.classes) || 0, 
            isUnlimited: plan.classes === Infinity 
        });
        setIsModalOpen(true);
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormState(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSave = async () => {
        setIsSaving(true);

        const planData = {
            id: editingPlan ? editingPlan.id : null,
            name: formState.name,
            price: Number(formState.price),
            classes: formState.isUnlimited ? Infinity : Number(formState.classes),
        };
        // Remove a propriedade temporária antes de salvar
        delete planData.isUnlimited;

        await handleSavePlan(planData);
        setIsSaving(false);
        setIsModalOpen(false); // Só fecha o modal após salvar
    };

    const handleDelete = async (planId) => {
        if (window.confirm('Tem certeza que deseja excluir este plano?')) {
            await handleDeletePlan(planId);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black flex justify-between items-center">
                <span>Gerenciar Planos</span>
                <button onClick={openModalForNew} className="p-2 bg-[#ddfb3b] text-black rounded-full hover:opacity-90"><Plus /></button>
            </h2>

            <FullScreenFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} title={editingPlan ? 'Editar Plano' : 'Novo Plano'} isSaving={isSaving}>
                <div className="space-y-4">
                    <div><label className="text-sm font-medium">Nome do Plano</label><input type="text" name="name" value={formState.name} onChange={handleFormChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="isUnlimited" checked={formState.isUnlimited} onChange={handleFormChange} id="isUnlimitedCheckbox" className="h-4 w-4 rounded text-blue-600"/>
                        <label htmlFor="isUnlimitedCheckbox" className="text-sm font-medium">Aulas ilimitadas</label>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Quantidade de Aulas</label>
                        <input type="number" name="classes" value={formState.isUnlimited ? '' : formState.classes} onChange={handleFormChange} className="w-full mt-1 p-2 border rounded-md disabled:bg-gray-100" disabled={formState.isUnlimited} />
                    </div>
                    <div><label className="text-sm font-medium">Preço (R$)</label><input type="number" name="price" value={formState.price} onChange={handleFormChange} className="w-full mt-1 p-2 border rounded-md"/></div>
                </div>
            </FullScreenFormModal>

            <div className="space-y-4">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                        <div>
                            <p className="font-bold">{plan.name}</p>
                            <p className="text-sm text-gray-600">Aulas: {plan.classes === Infinity ? 'Ilimitado' : plan.classes}</p>
                            <p className="text-sm text-gray-600">Preço: R$ {(Number(plan.price) || 0).toFixed(2)}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => openModalForEdit(plan)} className="p-2 hover:bg-gray-100 rounded-full"><Edit className="w-4 h-4 text-blue-600"/></button>
                            <button onClick={() => handleDelete(plan.id)} className="p-2 hover:bg-gray-100 rounded-full"><Trash2 className="w-4 h-4 text-red-600"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}