// src/components/layout/Header.js
import React from 'react';
import { Menu } from 'lucide-react';

export default function Header({ onMenuClick }) {
    return (
        <header className='flex-shrink-0 bg-white shadow-sm z-20 pt-[env(safe-area-inset-top)] md:hidden'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center'>
              <button onClick={onMenuClick} className="p-2 -ml-2 text-gray-600">
                  <Menu className="h-6 w-6" />
              </button>
              <h1 className='text-xl font-bold text-black'>
                  Complecso App
              </h1>
              {/* Espaço reservado para manter o título centralizado */}
              <div className="w-6"></div>
          </div>
        </header>
    );
}