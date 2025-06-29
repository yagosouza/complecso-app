// src/components/admin/CreditBatchManager.js
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { calculateNewExpiryDate } from '../../utils/creditHelpers';
import { Plus, Edit, Trash2 } from 'lucide-react';
import FullScreenFormModal from '../../components/modals/FullScreenFormModal';

export default function CreditBatchManager({ userId }) {
    const { users, setUsers } = useAppContext();
    const student = users.find(u => u.id === userId);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBatch, setEditingBatch] = useState(null); // null para novo, objeto do lote para editar
    const [formState, setFormState] = useState({ creditsPurchased: 8, purchaseDate: new Date().toISOString().split('T')[0] });

    const openModalForNew = () => {
        setEditingBatch(null);
        setFormState({ creditsPurchased: 8, purchaseDate: new Date().toISOString().split('T')[0] });
        setIsModalOpen(true);
    };

    const openModalForEdit = (batch) => {
        setEditingBatch(batch);
        setFormState({
            creditsPurchased: batch.creditsPurchased,
            purchaseDate: new Date(batch.purchaseDate).toISOString().split('T')[0],
        });
        setIsModalOpen(true);
    };
    
    const handleSave = () => {
        const paymentDate = new Date(formState.purchaseDate);
        const credits = parseInt(formState.creditsPurchased, 10);
        
        setUsers(currentUsers => currentUsers.map(user => {
            if (user.id === userId) {
                let updatedBatches;
                if (editingBatch) {
                    // Editando lote existente
                    updatedBatches = user.creditBatches.map(b => b.id === editingBatch.id ? {
                        ...b,
                        purchaseDate: paymentDate.toISOString(),
                        creditsPurchased: credits,
                        // Se necessário, recalcular créditos restantes ou validade
                    } : b);
                } else {
                    // Adicionando novo lote
                    const expiryDate = calculateNewExpiryDate(user.creditBatches, paymentDate);
                    const newBatch = {
                        id: `b${Date.now()}`,
                        purchaseDate: paymentDate.toISOString(),
                        creditsPurchased: credits,
                        creditsRemaining: credits,
                        expiryDate: expiryDate.toISOString(),
                    };
                    updatedBatches = [...user.creditBatches, newBatch];
                }
                return { ...user, creditBatches: updatedBatches };
            }
            return user;
        }));

        setIsModalOpen(false);
    };

    const handleDelete = (batchId) => {
        if (window.confirm('Tem certeza que deseja excluir este lote de créditos?')) {
            setUsers(currentUsers => currentUsers.map(user => {
                if (user.id === userId) {
                    const updatedBatches = user.creditBatches.filter(b => b.id !== batchId);
                    return { ...user, creditBatches: updatedBatches };
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
                title={editingBatch ? 'Editar Lote de Créditos' : 'Adicionar Pagamento'}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data do Pagamento</label>
                        <input type="date" name="purchaseDate" value={formState.purchaseDate} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Créditos Comprados</label>
                        <input type="number" name="creditsPurchased" value={formState.creditsPurchased} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md"/>
                    </div>
                </div>
            </FullScreenFormModal>

            <h4 className="font-semibold text-black flex justify-between items-center">
                <span>Histórico de Pagamentos</span>
                <button onClick={openModalForNew} className="p-2 hover:bg-gray-200 rounded-full"><Plus className="w-5 h-5"/></button>
            </h4>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {student.creditBatches?.length > 0 ? [...student.creditBatches].reverse().map(batch => (
                    <div key={batch.id} className="bg-white p-3 rounded-md shadow-sm flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{batch.creditsRemaining} / {batch.creditsPurchased} créditos</p>
                            <p className="text-xs text-gray-500">
                                Pago em: {new Date(batch.purchaseDate).toLocaleDateString('pt-BR')} | 
                                Vence em: {new Date(batch.expiryDate).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => openModalForEdit(batch)} className="p-2 hover:bg-gray-100 rounded-full"><Edit className="w-4 h-4 text-blue-600"/></button>
                            <button onClick={() => handleDelete(batch.id)} className="p-2 hover:bg-gray-100 rounded-full"><Trash2 className="w-4 h-4 text-red-600"/></button>
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-center text-gray-500 py-4">Nenhum pagamento registrado.</p>
                )}
            </div>
        </div>
    );
}