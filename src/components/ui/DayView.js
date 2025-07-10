// src/components/ui/DayView.js
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function DayView({ displayedDate, setDisplayedDate }) {
    const [showCalendar, setShowCalendar] = useState(false);

    const handleDateChange = (date) => {
        setDisplayedDate(date);
        setShowCalendar(false);
    };

    const handlePrevDay = () => {
        const newDate = new Date(displayedDate);
        newDate.setDate(newDate.getDate() - 1);
        setDisplayedDate(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(displayedDate);
        newDate.setDate(newDate.getDate() + 1);
        setDisplayedDate(newDate);
    };

    const formattedDate = displayedDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long'
    });

    return (
        <div className="relative flex-grow">
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                <button onClick={handlePrevDay} className="p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeft className="h-6 w-6 text-gray-700" />
                </button>
                <button onClick={() => setShowCalendar(!showCalendar)} className="flex flex-col items-center">
                    <h3 className="text-xl font-bold text-black capitalize">{formattedDate}</h3>
                    <span className="text-xs text-gray-500 flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> Abrir Calendário</span>
                </button>
                <button onClick={handleNextDay} className="p-2 rounded-full hover:bg-gray-100">
                    <ChevronRight className="h-6 w-6 text-gray-700" />
                </button>
            </div>
            {showCalendar && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 z-10 mt-2">
                    <Calendar
                        onChange={handleDateChange}
                        value={displayedDate}
                    />
                </div>
            )}
        </div>
    );
}