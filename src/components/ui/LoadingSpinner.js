// src/components/ui/LoadingSpinner.js
import React from 'react';

// Um componente simples de spinner usando Tailwind CSS
export default function LoadingSpinner({ text = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-black motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status"
      />
      <span className="text-sm font-semibold text-gray-700">{text}</span>
    </div>
  );
}