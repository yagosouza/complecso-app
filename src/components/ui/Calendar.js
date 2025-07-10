// src/components/ui/Calendar.js
import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CalendarView({ date, setDate }) {
  return (
    <div className="my-4">
      <Calendar
        onChange={setDate}
        value={date}
        className="w-full border-0 shadow-lg rounded-lg"
      />
    </div>
  );
}