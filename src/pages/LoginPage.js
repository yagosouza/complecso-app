import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { handleLogin } = useAppContext();

    const onLoginSubmit = (e) => {
        e.preventDefault();
        setError('');
        handleLogin(username, password, (err) => {
            if (err) setError(err);
        });
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
                        <label htmlFor="username" className="text-sm font-medium text-gray-700">Usuário</label>
                        <div className="mt-1">
                            <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">Senha</label>
                        <div className="mt-1">
                            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-black bg-[#ddfb3b] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e3fc5b] transition-all duration-300">
                        <Lock className="h-5 w-5 mr-2" />
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
}