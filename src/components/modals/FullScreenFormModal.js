// src/components/modals/FullScreenFormModal.js
import React from 'react';
import { X } from 'lucide-react';

export default function FullScreenFormModal({ isOpen, onClose, onSave, title, children, isSaveDisabled = false }) {
    if (!isOpen) return null;

    return (
        // Aumentamos o z-index para z-[100] para garantir que o modal fique sobre tudo
        <div className="fixed inset-0 bg-gray-50 z-[100] flex flex-col animate-slide-up pt-[env(safe-area-inset-top)]">
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-white shadow-sm">
                <button onClick={onClose} className="p-2 text-gray-600 hover:text-black">
                    <X className="h-6 w-6" />
                </button>
                <h2 className="text-lg font-bold text-black">{title}</h2>
                <button
                    onClick={onSave}
                    disabled={isSaveDisabled}
                    className="px-5 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Salvar
                </button>
            </header>
            
            {/* - Adicionamos padding-bottom para a safe area do iOS.
              - O `calc` adiciona um espaço extra (1.5rem) para que o último campo não fique colado na borda.
            */}
            <main className="flex-grow p-6 overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                <div className="max-w-4xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}