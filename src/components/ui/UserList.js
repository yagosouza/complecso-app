// src/components/ui/UserList.js
import React from 'react';
import { Shield, Users, Edit3, Award, CreditCard } from 'lucide-react';
import { maskPhone } from '../../utils/helpers';
import { calculateTotalClasses } from '../../utils/classHelpers';

const UserList = React.memo(({ title, users, onEditClick }) => {
    const Icon = title === 'Professores' ? Shield : Users;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <Icon className="text-[#ddfb3b]" /> {title} ({users.length})
            </h3>
            <div className="space-y-3">
                {users.map(user => {
                    const totalClasses = user.role === 'student'
                        ? calculateTotalClasses(user.classPacks)
                        : null;

                    return (
                        <div key={user.id} className={`p-3 border rounded-md flex justify-between items-center ${user.status === 'inactive' ? 'bg-gray-50 opacity-60' : ''}`}>
                            <div className="flex items-center gap-3">
                                <span className={`w-3 h-3 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <div>
                                    <p className="font-semibold text-black">{user.name}</p>
                                    <p className="text-sm text-gray-600">@{user.username}</p>
                                    {user.role === 'student' ? (
                                        <>
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <CreditCard className="w-4 h-4" />
                                                Aulas: <strong>{totalClasses === Infinity ? 'Ilimitado' : totalClasses}</strong>
                                            </p>
                                            <div className="flex items-center mt-1 flex-wrap">
                                                {user.categories?.map(cat => (
                                                    <span key={cat} className="text-xs font-semibold mr-2 mb-1 px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full flex items-center">
                                                        <Award className="w-4 h-4 mr-1" />{cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                         <p className="text-sm text-gray-500">{maskPhone(user.phone)}</p>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => onEditClick(user)} className="p-2 hover:bg-gray-100 rounded-full">
                                <Edit3 className="w-4 h-4 text-gray-600"/>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default UserList;