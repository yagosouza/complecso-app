import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function ProfilePage({ onBack }) {
    const { currentUser, handleUpdatePassword } = useAppContext();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (newPassword !== confirmPassword) {
            setError('As novas senhas não coincidem.');
            return;
        }
        handleUpdatePassword(currentUser.id, oldPassword, newPassword, (err) => {
            if (err) {
                setError(err);
            } else {
                setSuccess('Senha alterada com sucesso!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        });
    };

    return (
        <div className="p-4 md:p-8 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-black mb-6">Meu Perfil</h2>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-lg font-semibold text-black">Alterar Senha</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Senha Atual</label>
                        <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {success && <p className="text-sm text-green-600">{success}</p>}
                    <div className="flex justify-between items-center pt-2">
                        <button type="button" onClick={onBack} className="text-sm text-gray-600 hover:underline">Voltar</button>
                        <button type="submit" className="px-6 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}