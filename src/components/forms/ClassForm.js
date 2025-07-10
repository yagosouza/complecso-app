// src/components/forms/ClassForm.js
import React, { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const ClassForm = ({
  classForm,
  setClassForm,
  recurrence,
  setRecurrence,
  isEditing,
  isTeacherView = false
}) => {
  const { users, modalities, categories, currentUser } = useAppContext();
  const teachers = users.filter(u => u.role === 'teacher');

  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'categories') {
      setClassForm(current => ({
        ...current,
        categories: checked
          ? [...current.categories, value]
          : current.categories.filter(c => c !== value),
      }));
    } else {
      setClassForm(current => ({ ...current, [name]: value }));
    }
  };

  const handleRecurrenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'days') {
      const dayIndex = parseInt(value, 10);
      setRecurrence(prev => ({
        ...prev,
        days: checked ? [...prev.days, dayIndex] : prev.days.filter(d => d !== dayIndex),
      }));
    } else {
      setRecurrence(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };
  
  // Efeito para selecionar modalidade automaticamente
  useEffect(() => {
    const availableModalities = isTeacherView ? currentUser.specialties : modalities;
    if (availableModalities.length === 1 && !classForm.type) {
        setClassForm(prev => ({ ...prev, type: availableModalities[0] }));
    }
  }, [isTeacherView, currentUser.specialties, modalities, classForm.type, setClassForm]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="text-sm font-medium">Data</label><input type="date" name="date" value={classForm.date} onChange={handleFormChange} required className="mt-1 block w-full p-2 border rounded-md"/></div>
        <div><label className="text-sm font-medium">Hora</label><input type="time" name="time" value={classForm.time} onChange={handleFormChange} required className="mt-1 block w-full p-2 border rounded-md"/></div>
        <div><label className="text-sm font-medium">Máx. Alunos</label><input type="number" name="maxStudents" value={classForm.maxStudents} onChange={handleFormChange} min="1" required className="mt-1 block w-full p-2 border rounded-md"/></div>
        <div>
          <label className="text-sm font-medium">Modalidade</label>
          <select name="type" value={classForm.type} onChange={handleFormChange} required className="mt-1 block w-full p-2 border rounded-md bg-white">
            <option value="" disabled>Selecione...</option>
            {(isTeacherView ? currentUser.specialties : modalities).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        {!isTeacherView && (
          <div>
            <label className="text-sm font-medium">Professor</label>
            <select name="teacherId" value={classForm.teacherId} onChange={handleFormChange} required className="mt-1 block w-full p-2 border rounded-md bg-white" disabled={!classForm.type}>
              <option value="" disabled>Selecione...</option>
              {teachers.filter(t => t.specialties.includes(classForm.type)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="font-semibold">Categorias</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categories.map(cat => (
              <label key={cat} className="flex items-center gap-2">
                <input type="checkbox" name="categories" value={cat} checked={classForm.categories?.includes(cat)} onChange={handleFormChange}/>
                {cat}
              </label>
            ))}
          </div>
        </div>
      </div>

      {!isEditing && (
        <div className="p-4 border rounded-md space-y-4 mt-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isRecurring" checked={recurrence.isRecurring} onChange={handleRecurrenceChange} />
            Repetir aula
          </label>
          {recurrence.isRecurring && (
            <div className="space-y-4 pl-6">
              <div>
                <label className="font-semibold text-sm">Repetir em:</label>
                <div className="flex gap-2 mt-2">
                  {weekDays.map((day, index) => (
                    <label key={index} className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${recurrence.days.includes(index) ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                      <input type="checkbox" name="days" value={index} checked={recurrence.days.includes(index)} onChange={handleRecurrenceChange} className="sr-only" />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-semibold text-sm">Termina após:</label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="number" name="occurrences" value={recurrence.occurrences} onChange={handleRecurrenceChange} className="w-20 p-2 border rounded-md" />
                  <span>ocorrências</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassForm;