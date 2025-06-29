// src/components/InstallPWA.js
import React, { useState, useEffect } from 'react';
import { Download, Share } from 'lucide-react';

const isIos = () => {
  if (typeof window === 'undefined' || !window.navigator) return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

export default function InstallPWA() {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState(null);
    const [isIosUser, setIsIosUser] = useState(false);
    const [showIosHint, setShowIosHint] = useState(false);

    useEffect(() => {
        setIsIosUser(isIos());

        const handler = e => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };
        window.addEventListener('beforeinstallprompt', handler);

        if (isIos() && !isInStandaloneMode()) {
            setShowIosHint(true);
            const timer = setTimeout(() => setShowIosHint(false), 8000);
            return () => clearTimeout(timer);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const onClick = evt => {
        evt.preventDefault();
        if (!promptInstall) {
            return;
        }
        promptInstall.prompt();
    };

    if (!supportsPWA && !isIosUser) {
        return null;
    }

    if (supportsPWA) {
        return (
            <button
                className='fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 font-semibold text-white shadow-lg hover:bg-green-700 md:hidden'
                id='setup_button'
                aria-label='Instalar Aplicação'
                title='Instalar Aplicação'
                onClick={onClick}
            >
                <Download size={20} />
                <span>Instalar</span>
            </button>
        );
    }
    
    if (isIosUser && showIosHint) {
        return (
             <div className='fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex animate-slide-up items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-lg md:hidden'>
                <p>Para instalar, toque em</p>
                <Share size={20}/>
                <p>e depois em 'Adicionar à Tela de Início'</p>
            </div>
        );
    }

    return null;
}