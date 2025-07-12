// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    // 1. Adiciona o estado de carregamento
    const [isLoading, setIsLoading] = useState(false);
    
    const { handleLogin, handleResetPassword } = useAppContext();

    const onLoginSubmit = (e) => {
        e.preventDefault();
        setError('');
        
        // 2. Ativa o loading antes de chamar o Firebase
        setIsLoading(true);

        handleLogin(email, password, (err) => {
            // 3. Desativa o loading ao final da operação
            setIsLoading(false);
            if (err) {
                setError(err);
            }
            // Se não houver erro, o AppContext irá redirecionar automaticamente
        });
    };

    const onForgotPassword = () => {
        const userEmail = prompt("Digite seu e-mail para redefinir a senha:");
        if (userEmail) {
            handleResetPassword(userEmail, (err, successMsg) => {
                if (err) {
                    alert(err);
                } else {
                    alert(successMsg);
                }
            });
        }
    };

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen">
            <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-black">Complecso App</h1>
                    <p className="mt-2 text-gray-600">Faça seu login para continuar</p>
                </div>
                <form className="space-y-6" onSubmit={onLoginSubmit}>
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">E-mail</label>
                        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm" disabled={isLoading} />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">Senha</label>
                        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm" disabled={isLoading} />
                    </div>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    
                    {/* 4. Atualiza o botão para reagir ao estado 'isLoading' */}
                    <button 
                        type="submit" 
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-black bg-[#ddfb3b] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e3fc5b] transition-all duration-300 disabled:bg-gray-300 disabled:cursor-wait"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-black border-e-transparent" role="status" />
                        ) : (
                            <>
                                <Lock className="h-5 w-5 mr-2" />
                                Entrar
                            </>
                        )}
                    </button>
                    
                    <div className="text-sm text-center text-gray-600">
                        <Link to="/register" className="font-medium text-black hover:underline">
                            Criar uma conta
                        </Link>
                        <span className="mx-2">|</span>
                        <button type="button" onClick={onForgotPassword} className="font-medium text-black hover:underline">
                            Esqueceu a senha?
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}