// src/pages/adminDashboardManagement/ModalityManagementView.js
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Trash2 } from 'lucide-react';

export default function ModalityManagementView() {
    const { modalities, handleAddModality, handleDeleteModality } = useAppContext();
    const [newModality, setNewModality] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const onAddClick = async () => {
        setIsSaving(true);
        if (newModality.trim()) {
            await handleAddModality(newModality.trim());
            setNewModality('');
        }
        setIsSaving(false);
    };

    const onDeleteClick = async (modality) => {
        if (window.confirm(`Tem certeza que deseja excluir a modalidade "${modality.name}"?`)) {
            await handleDeleteModality(modality.id);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black">Gerenciar Modalidades</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newModality}
                        onChange={(e) => setNewModality(e.target.value)}
                        placeholder="Nova modalidade"
                        className="w-full p-2 border rounded-md"
                    />
                    <button onClick={onAddClick} className="p-2 bg-[#ddfb3b] text-black rounded-md hover:opacity-90">
                        <Plus />
                    </button>
                </div>
                <div className="space-y-2">
                    {modalities.map(modality => (
                        <div key={modality.id} className="flex justify-between items-center p-3 border rounded-md">
                            <span>{modality.name}</span>
                            <button onClick={() => onDeleteClick(modality)} className="p-2 hover:bg-gray-100 rounded-full">
                                <Trash2 className="w-4 h-4 text-red-600"/>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}