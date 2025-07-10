// src/pages/ClassHistoryView.js
import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import ClassItem from '../components/ui/ClassItem';

export default function ClassHistoryView() {
    const { currentUser, users, classes } = useAppContext();

    const student = useMemo(() => users.find(u => u.id === currentUser.id), [currentUser.id, users]);

    const classHistory = useMemo(() => {
        if (!student) return [];
        return student.checkedInClassIds
            .map(id => classes.find(c => c.id === id))
            .filter(c => c && new Date(c.date) < new Date())
            .sort((a,b) => new Date(b.date) - new Date(a.date));
    }, [classes, student]);

    if (!student) {
        return <div className="text-center p-8">Carregando dados do aluno...</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black">Histórico de Aulas</h2>
            <div className="space-y-4">
                {classHistory.length > 0 
                    ? classHistory.map(cls => (
                        <ClassItem key={cls.id} cls={cls} allUsers={users} studentView={true} />
                      )) 
                    : <p className="text-center text-gray-500 bg-white p-8 rounded-lg">Nenhum histórico de aulas encontrado.</p>
                }
            </div>
        </div>
    );
}