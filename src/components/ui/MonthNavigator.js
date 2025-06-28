import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MonthNavigator({ displayedDate, onPrevious, onNext }) {
    const formattedMonth = displayedDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    
    return (
        <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm">
            <button onClick={onPrevious} className="p-2 rounded-full hover:bg-gray-100">
                <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
            <h3 className="text-xl font-bold text-black capitalize">{formattedMonth}</h3>
            <button onClick={onNext} className="p-2 rounded-full hover:bg-gray-100">
                <ChevronRight className="h-6 w-6 text-gray-700" />
            </button>
        </div>
    );
}