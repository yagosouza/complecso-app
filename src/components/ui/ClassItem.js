import React from 'react';
import { Repeat, X } from 'lucide-react';

// Este componente é usado pelo AdminDashboard, recebendo as funções por props
const ClassItem = React.memo(({ cls, allUsers, onDeleteClass, onEditClass }) => {
    const teacher = allUsers.find(u => u.id === cls.teacherId);
    
    return (
        <div className="bg-white p-5 rounded-lg shadow-sm flex justify-between items-center">
            <div>
                <p className="font-bold text-black">{cls.type}: {new Date(cls.date).toLocaleDateString('pt-BR')} - {new Date(cls.date).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</p>
                <p className="text-sm text-gray-600">Prof: {teacher?.name || 'N/A'}</p>
                <p className="text-sm text-gray-600">Alunos: {cls.checkedInStudents.length}/{cls.maxStudents}</p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => onEditClass(cls)} className="p-2 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200">
                    <Repeat className="w-4 h-4"/>
                </button>
                <button onClick={() => onDeleteClass(cls.id)} className="p-2 text-sm font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200">
                    <X className="w-4 h-4"/>
                </button>
            </div>
        </div>
    );
});

export default ClassItem;