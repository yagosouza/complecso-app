// src/components/ui/ClassItem.js
import React from 'react';
import { Repeat, X, UserCheck, UserX, Award, Info } from 'lucide-react';

const ClassItem = React.memo(({ cls, allUsers, onDeleteClass, onEditClass, studentView = false, actionButton = null }) => {
    const teacher = allUsers.find(u => u.id === cls.teacherId);
    const isPast = new Date(cls.date) < new Date();

    const checkedInStudentNames = cls.checkedInStudents
        .map(id => allUsers.find(u => u.id === id)?.name)
        .filter(Boolean);

    const lateCancellationStudentNames = (cls.lateCancellations || [])
        .map(id => allUsers.find(u => u.id === id)?.name)
        .filter(Boolean);

    return (
        <div className={`bg-white p-5 rounded-lg shadow-sm ${isPast && !studentView ? 'opacity-70' : ''}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-black">{cls.type}: {new Date(cls.date).toLocaleDateString('pt-BR')} - {new Date(cls.date).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</p>
                    <p className="text-sm text-gray-600">Prof: {teacher?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Alunos: {cls.checkedInStudents.length}/{cls.maxStudents}</p>
                    {/* MOSTRAR DESCRIÇÃO SE EXISTIR */}
                    {cls.description && (
                        <div className="mt-2 flex items-start text-sm text-gray-500">
                            <Info className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                            <p>{cls.description}</p>
                        </div>
                    )}
                    <div className="flex items-center mt-1 flex-wrap">
                        {cls.categories.map(cat => (
                            <span key={cat} className="text-xs font-semibold mr-2 mb-1 px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full flex items-center">
                                <Award className="w-3 h-3 mr-1" />{cat}
                            </span>
                        ))}
                    </div>
                </div>
                {!studentView &&
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEditClass(cls)}
                            className="p-2 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 disabled:bg-gray-200 disabled:cursor-not-allowed"
                            title="Editar Aula"
                            disabled={isPast}
                        >
                            <Repeat className="w-4 h-4"/>
                        </button>
                        <button
                            onClick={() => onDeleteClass(cls.id)}
                            className="p-2 text-sm font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200 disabled:bg-gray-200 disabled:cursor-not-allowed"
                            title="Excluir Aula"
                            disabled={isPast}
                        >
                            <X className="w-4 h-4"/>
                        </button>
                    </div>
                }
                {studentView && actionButton && !isPast &&
                    <div>{actionButton}</div>
                }
            </div>

            {(!studentView || (studentView && isPast)) && (checkedInStudentNames.length > 0 || lateCancellationStudentNames.length > 0) && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    {checkedInStudentNames.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase flex items-center"><UserCheck className="w-4 h-4 mr-1 text-green-500"/> Check-ins</h4>
                            <p className="text-sm text-gray-800">{checkedInStudentNames.join(', ')}</p>
                        </div>
                    )}
                    {lateCancellationStudentNames.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase flex items-center"><UserX className="w-4 h-4 mr-1 text-orange-500"/> Cancelamentos Fora do Prazo</h4>
                            <p className="text-sm text-gray-800">{lateCancellationStudentNames.join(', ')}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

export default ClassItem;