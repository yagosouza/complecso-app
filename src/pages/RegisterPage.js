// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
    const { handleSaveUser, plans } = useAppContext(); // Usamos a nova função
    const navigate = useNavigate();
    
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        planId: '',
        // Adicione outros campos que o admin preenche, se houver
    });

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onRegisterSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!formData.planId) {
            setError("Por favor, selecione um plano.");
            return;
        }

        const newUserData = {
            ...formData,
            role: 'student', // Auto-registro é sempre como aluno
            status: 'active'
        };

        handleSaveUser(newUserData, (err) => {
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
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-black">Criar Sua Conta</h1>
                    <p className="mt-2 text-gray-600">Preencha seus dados para começar.</p>
                </div>
                <form className="space-y-4" onSubmit={onRegisterSubmit}>
                    {/* Campos do formulário */}
                    <input name="name" type="text" placeholder="Nome Completo" value={formData.name} onChange={handleFormChange} required className="w-full px-3 py-2 border rounded-md" />
                    <input name="email" type="email" placeholder="E-mail" value={formData.email} onChange={handleFormChange} required className="w-full px-3 py-2 border rounded-md" />
                    <input name="password" type="password" placeholder="Senha (mínimo 6 caracteres)" value={formData.password} onChange={handleFormChange} required className="w-full px-3 py-2 border rounded-md" />
                    <input name="phone" type="tel" placeholder="Telefone (ex: 11987654321)" value={formData.phone} onChange={handleFormChange} required className="w-full px-3 py-2 border rounded-md" />
                    
                    <select name="planId" value={formData.planId} onChange={handleFormChange} required className="w-full px-3 py-2 border rounded-md">
                        <option value="" disabled>Selecione seu plano</option>
                        {plans.map(plan => (
                            <option key={plan.id} value={plan.id}>{plan.name} - R${plan.price}</option>
                        ))}
                    </select>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    
                    <button type="submit" className="w-full flex justify-center py-3 px-4 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90">
                        <UserPlus className="h-5 w-5 mr-2" />
                        Finalizar Cadastro
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