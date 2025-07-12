// src/components/modals/FullScreenFormModal.js
import React from 'react';
import { X } from 'lucide-react';

// Adicionamos a nova prop "isSaving"
export default function FullScreenFormModal({ isOpen, onClose, onSave, title, children, isSaving = false }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-50 z-[100] flex flex-col animate-slide-up pt-[env(safe-area-inset-top)]">
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-white shadow-sm">
                <button onClick={onClose} className="p-2 text-gray-600 hover:text-black" disabled={isSaving}>
                    <X className="h-6 w-6" />
                </button>
                <h2 className="text-lg font-bold text-black">{title}</h2>
                <button
                    onClick={onSave}
                    disabled={isSaving} // Botão é desabilitado enquanto está salvando
                    className="px-5 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                >
                    {isSaving ? (
                        <div
                            className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-e-transparent"
                            role="status"
                        />
                    ) : (
                        'Salvar'
                    )}
                </button>
            </header>
            
            <main className="flex-grow p-6 overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                <div className="max-w-4xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}