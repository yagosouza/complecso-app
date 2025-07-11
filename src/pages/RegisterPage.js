// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { handleCreateUser } = useAppContext();
    const navigate = useNavigate();

    const onRegisterSubmit = (e) => {
        e.preventDefault();
        setError('');

        const newUserData = {
            name,
            email,
            password,
            role: 'student', // Novos registros são sempre de alunos
            status: 'active'
        };

        handleCreateUser(newUserData, (err) => {
            if (err) {
                setError(err);
            } else {
                alert('Conta criada com sucesso! Você será redirecionado para o login.');
                navigate('/'); 
            }
        });
    };

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen">
            <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-black">Criar Conta</h1>
                    <p className="mt-2 text-gray-600">Preencha seus dados para começar.</p>
                </div>
                <form className="space-y-6" onSubmit={onRegisterSubmit}>
                    <div>
                        <label htmlFor="name" className="text-sm font-medium text-gray-700">Nome Completo</label>
                        <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">E-mail</label>
                        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">Senha</label>
                        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-md" placeholder="Mínimo 6 caracteres"/>
                    </div>
                    
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    
                    <button type="submit" className="w-full flex justify-center py-3 px-4 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90">
                        <UserPlus className="h-5 w-5 mr-2" />
                        Cadastrar
                    </button>
                    
                     <div className="text-sm text-center">
                        <Link to="/" className="font-medium text-gray-600 hover:underline">
                            Já tenho uma conta
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}