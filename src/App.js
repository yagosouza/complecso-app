import React, { useState, useMemo, useCallback } from 'react';
import { User, Lock, CalendarDays, CheckCircle2, PlusCircle, LogOut, X, AlertTriangle, ChevronLeft, ChevronRight, Edit3, Shield, Users, Repeat, KeyRound, UserCog, Search, Settings } from 'lucide-react';

// --- DADOS MOCK (Simulando um banco de dados) ---
const CLASS_TYPES = ['Futevôlei', 'Beach Tennis', 'Funcional'];
const today = new Date();
const createDate = (day, hour, monthOffset = 0) => {
    const d = new Date(today.getFullYear(), today.getMonth() + monthOffset, day, hour, 0);
    // Para facilitar testes, as datas são criadas relativas ao dia de hoje
    const baseDate = new Date();
    baseDate.setDate(day);
    baseDate.setMonth(baseDate.getMonth() + monthOffset);
    baseDate.setHours(hour, 0, 0, 0);
    return baseDate;
};

// Adicionado paymentDueDate para alunos e lateCancellations nas aulas
const initialUsers = [
  { id: 200, name: 'Admin', role: 'admin', username: 'admin', password: 'password', status: 'active' },
  { id: 1, name: 'Ana Júlia', role: 'student', username: 'ana', password: 'password', status: 'active', phone: '11999990001', email: 'ana@email.com', birthDate: '2000-05-10', paymentDueDate: 10, plan: { name: 'Plano 6 Aulas', total: 6, extraClasses: [] }, checkedInClassIds: [], enrolledIn: ['Futevôlei'] },
  { id: 2, name: 'Bruno Costa', role: 'student', username: 'bruno', password: 'password', status: 'active', phone: '11999990002', email: 'bruno@email.com', birthDate: '1998-11-20', paymentDueDate: 20, plan: { name: 'Plano 8 Aulas', total: 8, extraClasses: [] }, checkedInClassIds: [], enrolledIn: ['Futevôlei', 'Beach Tennis'] },
  { id: 3, name: 'Carlos Dias', role: 'student', username: 'carlos', password: 'password', status: 'inactive', phone: '11999990003', email: 'carlos@email.com', birthDate: '2002-01-30', paymentDueDate: 1, plan: { name: 'Plano 8 Aulas', total: 8, extraClasses: [] }, checkedInClassIds: [], enrolledIn: ['Beach Tennis'] },
  { id: 4, name: 'Fernanda Lima', role: 'student', username: 'fernanda', password: 'password', status: 'active', phone: '11999990004', email: 'fernanda@email.com', birthDate: '1999-07-22', paymentDueDate: 15, plan: { name: 'Plano 6 Aulas', total: 6, extraClasses: [] }, checkedInClassIds: [], enrolledIn: ['Funcional', 'Futevôlei'] },
  { id: 100, name: 'Professor Alex', role: 'teacher', username: 'alex', password: 'password', status: 'active', phone: '11988880001', email: 'alex@email.com', birthDate: '1990-03-15', specialties: ['Futevôlei', 'Funcional'] },
  { id: 101, name: 'Professora Bia', role: 'teacher', username: 'bia', password: 'password', status: 'active', phone: '11988880002', email: 'bia@email.com', birthDate: '1992-10-05', specialties: ['Beach Tennis'] },
];

const initialClasses = [
  { id: 1, date: createDate(today.getDate() + 1, 18), maxStudents: 10, checkedInStudents: [2], lateCancellations: [], teacherId: 100, type: 'Futevôlei' },
  { id: 2, date: createDate(today.getDate() + 2, 19), maxStudents: 8, checkedInStudents: [4], lateCancellations: [], teacherId: 101, type: 'Beach Tennis' },
  { id: 3, date: createDate(today.getDate() + 3, 18), maxStudents: 10, checkedInStudents: [], lateCancellations: [], teacherId: 100, type: 'Funcional' },
  { id: 4, date: createDate(2, 19, 1), maxStudents: 8, checkedInStudents: [], lateCancellations: [], teacherId: 100, type: 'Futevôlei' },
  { id: 5, date: createDate(3, 17, 1), maxStudents: 12, checkedInStudents: [], lateCancellations: [], teacherId: 101, type: 'Beach Tennis' },
  { id: 6, date: createDate(2, 18, 1), maxStudents: 10, checkedInStudents: [], lateCancellations: [], teacherId: 100, type: 'Funcional' },
];

// --- UTILS ---
const maskPhone = (value) => {
    if (!value) return "";
    value = value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    return value;
}

const getBillingCycle = (paymentDueDate) => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let startYear = currentYear;
    let startMonth = currentMonth;
    
    if (currentDay < paymentDueDate) {
        startMonth = currentMonth - 1;
        if (startMonth < 0) {
            startMonth = 11;
            startYear -= 1;
        }
    }

    const startDate = new Date(startYear, startMonth, paymentDueDate);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate() - 1);
    endDate.setHours(23, 59, 59, 999);

    return { start: startDate, end: endDate };
};


// --- COMPONENTES DA APLICAÇÃO ---

function ConfirmModal({ isOpen, onClose, onConfirm, title, children }) {
    if (!isOpen) return null;
    return (<div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"><div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"><div className="flex items-start"><div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"><AlertTriangle className="h-6 w-6 text-red-600" /></div><div className="ml-4 text-left"><h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3><div className="mt-2"><p className="text-sm text-gray-600">{children}</p></div></div></div><div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse"><button type="button" onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">Confirmar</button><button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">Cancelar</button></div></div></div>);
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const handleLogin = (e) => { e.preventDefault(); setError(''); onLogin(username, password, (err) => { if(err) setError(err); }); };
  return (<div className="bg-gray-100 flex items-center justify-center min-h-screen"><div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-2xl shadow-lg"><div className="text-center"><h1 className="text-4xl font-bold text-black">Complecso App</h1><p className="mt-2 text-gray-600">Faça seu login para continuar</p></div><form className="space-y-6" onSubmit={handleLogin}><div><label htmlFor="username" className="text-sm font-medium text-gray-700">Usuário</label><div className="mt-1"><input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" /></div></div><div><label htmlFor="password" className="text-sm font-medium text-gray-700">Senha</label><div className="mt-1"><input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" /></div></div>{error && <p className="text-sm text-red-600 text-center">{error}</p>}<button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-black bg-[#ddfb3b] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e3fc5b] transition-all duration-300"><Lock className="h-5 w-5 mr-2" />Entrar</button></form></div></div>);
}

function MonthNavigator({ displayedDate, onPrevious, onNext }) {
    const formattedMonth = displayedDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    return (<div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm"><button onClick={onPrevious} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft className="h-6 w-6 text-gray-700" /></button><h3 className="text-xl font-bold text-black capitalize">{formattedMonth}</h3><button onClick={onNext} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight className="h-6 w-6 text-gray-700" /></button></div>);
}

function StudentDashboard({ student, classes, allUsers, onCheckIn, onCancelCheckInRequest, displayedDate, onPreviousMonth, onNextMonth }) {
    const usedInBillingCycle = student.plan.usedInBillingCycle || 0;
    const extraClassesForMonth = student.plan.extraClasses?.find(ec => ec.month === `${today.getFullYear()}-${today.getMonth()}`)?.count || 0;
    const remainingClasses = student.plan.total + extraClassesForMonth - usedInBillingCycle;
    const hasCredits = remainingClasses > 0;

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-black">Olá, {student.name}!</h2>
                    <p className="text-gray-700">Seu plano: <strong>{student.plan.name}</strong></p>
                    <p className="text-gray-700">Modalidades: <strong>{student.enrolledIn.join(', ')}</strong></p>
                </div>
                <div className="text-center bg-gray-50 p-4 rounded-lg w-full sm:w-auto">
                    <p className="font-semibold text-gray-800">Créditos do ciclo (vence dia {student.paymentDueDate})</p>
                    <p className={`text-4xl font-bold ${hasCredits ? 'text-black' : 'text-red-500'}`}>{remainingClasses}</p>
                    <p className="text-sm text-gray-600">de {student.plan.total + extraClassesForMonth} disponíveis</p>
                </div>
            </div>
            <div>
                <MonthNavigator displayedDate={displayedDate} onPrevious={onPreviousMonth} onNext={onNextMonth} />
                <div className="space-y-4">
                    {classes.length > 0 ? classes.map(cls => {
                        const { start, end } = getBillingCycle(student.paymentDueDate);
                        const isPast = cls.date < new Date();
                        const isOutsideCycle = cls.date < start || cls.date > end;
                        const isFull = cls.checkedInStudents.length >= cls.maxStudents;
                        const isCheckedIn = student.checkedInClassIds.includes(cls.id);
                        const classDate = cls.date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
                        const classTime = cls.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                        const teacher = allUsers.find(u => u.id === cls.teacherId);
                        
                        let buttonLabel = 'Fazer Check-in';
                        if (!hasCredits) buttonLabel = 'Sem créditos';
                        else if (isFull) buttonLabel = 'Turma Cheia';
                        else if (isPast) buttonLabel = 'Aula Encerrada';
                        else if (isOutsideCycle) buttonLabel = 'Fora do Ciclo';

                        return (
                            <div key={cls.id} className="bg-white p-5 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-center">
                                <div className="mb-4 md:mb-0 text-left mr-auto">
                                    <p className="font-bold text-lg text-black capitalize">{cls.type}: {classDate} - {classTime}</p>
                                    <p className="text-sm text-gray-600">Professor(a): {teacher ? teacher.name : 'N/A'}</p>
                                    <p className="text-sm text-gray-600">Vagas: {cls.checkedInStudents.length} / {cls.maxStudents}</p>
                                </div>
                                <div>
                                    {isCheckedIn ? (
                                        <button onClick={() => onCancelCheckInRequest(student.id, cls.id)} disabled={isPast} className="w-full md:w-auto px-6 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500">Cancelar Check-in</button>
                                    ) : (
                                        <button onClick={() => onCheckIn(student.id, cls.id)} disabled={isFull || !hasCredits || isPast || isOutsideCycle} className="w-full md:w-auto px-6 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                            <CheckCircle2 className="h-5 w-5" />
                                            {buttonLabel}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    }) : <p className="text-center text-gray-500 bg-white p-8 rounded-lg">Nenhuma aula da sua modalidade marcada para este mês.</p>}
                </div>
            </div>
        </div>
    );
}

function TeacherDashboard({ currentUser, classes, users, onCreateClass, onDeleteClass, displayedDate, onPreviousMonth, onNextMonth }) {
    const [date, setDate] = useState(''); const [time, setTime] = useState(''); const [maxStudents, setMaxStudents] = useState(10); const [classType, setClassType] = useState(currentUser.specialties[0] || ''); const [showCreateForm, setShowCreateForm] = useState(false);
    const handleCreateClass = (e) => { e.preventDefault(); if(date && time && classType) { const [year, month, day] = date.split('-'); const [hour, minute] = time.split(':'); onCreateClass({ date: new Date(year, month - 1, day, hour, minute), maxStudents: parseInt(maxStudents), type: classType }, currentUser.id); setDate(''); setTime(''); setMaxStudents(10); setShowCreateForm(false); } };
    const students = useMemo(() => users.filter(u => u.role === 'student'), [users]);
    return (<div className="p-4 md:p-8 space-y-8"><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-black">Minhas Aulas</h2><button onClick={() => setShowCreateForm(!showCreateForm)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90"><PlusCircle className="h-5 w-5" />{showCreateForm ? 'Fechar' : 'Nova Aula'}</button></div>{showCreateForm && (<div className="bg-white p-6 rounded-xl shadow-md"><form onSubmit={handleCreateClass} className="space-y-4"><h3 className="text-lg font-semibold text-black">Adicionar nova aula</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><div><label htmlFor="date" className="block text-sm font-medium text-gray-700">Data</label><input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/></div><div><label htmlFor="time" className="block text-sm font-medium text-gray-700">Hora</label><input type="time" id="time" value={time} onChange={e => setTime(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/></div><div><label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700">Máx. Alunos</label><input type="number" id="maxStudents" value={maxStudents} onChange={e => setMaxStudents(e.target.value)} min="1" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/></div><div><label htmlFor="classType" className="block text-sm font-medium text-gray-700">Modalidade</label><select id="classType" value={classType} onChange={e => setClassType(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">{currentUser.specialties.map(s => <option key={s} value={s}>{s}</option>)}</select></div></div><button type="submit" className="w-full md:w-auto px-6 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90">Salvar Aula</button></form></div>)}<MonthNavigator displayedDate={displayedDate} onPrevious={onPreviousMonth} onNext={onNextMonth} /><div className="space-y-6">{classes.length > 0 ? classes.map(cls => { const confirmedStudents = cls.checkedInStudents.map(studentId => students.find(s => s.id === studentId)).filter(Boolean); const lateCancelStudents = (cls.lateCancellations || []).map(studentId => students.find(s => s.id === studentId)).filter(Boolean); const classDate = cls.date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' }); const classTime = cls.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); return (<div key={cls.id} className="bg-white p-5 rounded-lg shadow-sm"><div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4"><div className="text-left mr-auto"><p className="font-bold text-lg text-black capitalize">{cls.type}: {classDate} - {classTime}</p><p className="text-sm font-semibold text-gray-700">Check-ins: {confirmedStudents.length} / {cls.maxStudents}</p></div><button onClick={() => onDeleteClass(cls.id)} className="mt-2 md:mt-0 px-4 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200">Excluir</button></div><div><h4 className="font-semibold text-black mb-2">Alunos com Check-in:</h4>{confirmedStudents.length > 0 ? (<ul className="list-disc list-inside space-y-1">{confirmedStudents.map(student => <li key={student.id} className="text-gray-700">{student.name}</li>)}</ul>) : (<p className="text-sm text-gray-500 italic">Nenhum aluno fez check-in ainda.</p>)} {lateCancelStudents.length > 0 && (<> <h4 className="font-semibold text-red-600 mt-2 mb-2">Cancelamentos de última hora:</h4> <ul className="list-disc list-inside space-y-1">{lateCancelStudents.map(student => <li key={student.id} className="text-red-500 italic">{student.name}</li>)}</ul></>)}</div></div>);}) : <p className="text-center text-gray-500 bg-white p-8 rounded-lg">Nenhuma aula sua marcada para este mês.</p>}</div></div>);
}

const UserList = React.memo(({ title, users, onEditClick }) => {
    const Icon = title === 'Professores' ? Shield : Users;
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <Icon className="text-[#ddfb3b]" /> {title} ({users.length})
            </h3>
            <div className="space-y-3">
                {users.map(user => (
                    <div key={user.id} className={`p-3 border rounded-md flex justify-between items-center ${user.status === 'inactive' ? 'bg-gray-50 opacity-60' : ''}`}>
                        <div className="flex items-center gap-3">
                            <span className={`w-3 h-3 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <div>
                                <p className="font-semibold text-black">{user.name}</p>
                                <p className="text-sm text-gray-600">@{user.username}</p>
                                <p className="text-sm text-gray-500">{maskPhone(user.phone)}</p>
                            </div>
                        </div>
                        <button onClick={() => onEditClick(user)} className="p-2 hover:bg-gray-100 rounded-full">
                            <Edit3 className="w-4 h-4 text-gray-600"/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
});

const ClassItem = React.memo(({ cls, allUsers, onDeleteClass, onEditClass }) => {
    const teacher = allUsers.find(u => u.id === cls.teacherId);
    return (
        <div className="bg-white p-5 rounded-lg shadow-sm flex justify-between items-center">
            <div>
                <p className="font-bold text-black">{cls.type}: {cls.date.toLocaleDateString('pt-BR')} - {cls.date.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</p>
                <p className="text-sm text-gray-600">Prof: {teacher?.name || 'N/A'}</p>
                <p className="text-sm text-gray-600">Alunos: {cls.checkedInStudents.length}/{cls.maxStudents}</p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => onEditClass(cls)} className="p-2 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200"><Repeat className="w-4 h-4"/></button>
                <button onClick={() => onDeleteClass(cls.id)} className="p-2 text-sm font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200"><X className="w-4 h-4"/></button>
            </div>
        </div>
    );
});

const UserManagementView = React.memo(({ searchTerm, handleSearchTermChange, filteredUsers, handleEditUserClick, onAddUserClick }) => {
    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div className="relative flex-grow mr-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input type="text" placeholder="Buscar por nome, usuário ou telefone..." value={searchTerm} onChange={handleSearchTermChange} className="w-full pl-10 pr-4 py-2 border rounded-full"/>
                </div>
                <button onClick={onAddUserClick} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90">
                    <PlusCircle className="h-5 w-5" />Novo Usuário
                </button>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                <UserList title="Alunos" users={filteredUsers.filter(u => u.role === 'student')} onEditClick={handleEditUserClick} />
                <UserList title="Professores" users={filteredUsers.filter(u => u.role === 'teacher')} onEditClick={handleEditUserClick} />
            </div>
        </>
    );
});

const ClassManagementView = React.memo(({ showCreateClassForm, setShowCreateClassForm, handleCreateClass, classForm, handleClassFormChange, CLASS_TYPES, teachers, displayedDate, onPreviousMonth, onNextMonth, filteredAndSortedClasses, allUsers, onDeleteClass, onEditClass }) => {
    return (
        <>
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-black">Gerenciar Aulas</h2><button onClick={() => setShowCreateClassForm(prev => !prev)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90"><PlusCircle className="h-5 w-5" />{showCreateClassForm ? 'Fechar' : 'Nova Aula'}</button></div>
            {showCreateClassForm && (<div className="bg-white p-6 rounded-xl shadow-md"><form onSubmit={handleCreateClass} className="space-y-4"><h3 className="text-lg font-semibold text-black">Adicionar Nova Aula</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><div><label>Data</label><input type="date" name="date" value={classForm.date} onChange={handleClassFormChange} required className="mt-1 block w-full"/></div><div><label>Hora</label><input type="time" name="time" value={classForm.time} onChange={handleClassFormChange} required className="mt-1 block w-full"/></div><div><label>Máx. Alunos</label><input type="number" name="maxStudents" value={classForm.maxStudents} onChange={handleClassFormChange} min="1" required className="mt-1 block w-full"/></div><div><label>Modalidade</label><select name="type" value={classForm.type} onChange={handleClassFormChange} required className="mt-1 block w-full"><option value="" disabled>Selecione...</option>{CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div><div><label>Professor</label><select name="teacherId" value={classForm.teacherId} onChange={handleClassFormChange} required className="mt-1 block w-full" disabled={!classForm.type}><option value="" disabled>Selecione...</option>{teachers.filter(t => t.specialties.includes(classForm.type)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div></div><button type="submit" className="w-full md:w-auto px-6 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90">Salvar Aula</button></form></div>)}
            <MonthNavigator displayedDate={displayedDate} onPrevious={onPreviousMonth} onNext={onNextMonth} />
            <div className="space-y-4">{filteredAndSortedClasses.map(cls => <ClassItem key={cls.id} cls={cls} allUsers={allUsers} onDeleteClass={onDeleteClass} onEditClass={onEditClass} />)}</div>
        </>
    );
});

function AdminDashboard({ allUsers, setUsers, onCreateUser, allClasses, setClasses, onCreateClass, onDeleteClass, displayedDate, onPreviousMonth, onNextMonth, onResetPassword, onAddExtraClasses, cancellationDeadlineHours, setCancellationDeadlineHours }) {
    const [view, setView] = useState('users');
    const [userModal, setUserModal] = useState({ isOpen: false, data: null });
    const [extraClassesToAdd, setExtraClassesToAdd] = useState(0);
    const [editingClass, setEditingClass] = useState(null);
    const [showCreateClassForm, setShowCreateClassForm] = useState(false);
    const [classForm, setClassForm] = useState({ date: '', time: '', maxStudents: 10, teacherId: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    
    const teachers = useMemo(() => allUsers.filter(u => u.role === 'teacher'), [allUsers]);
    
    const handleUserFormChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        
        setUserModal(currentModal => {
            const currentData = { ...currentModal.data };
            let finalValue;
    
            if (type === 'checkbox') {
                const currentArray = currentData[name] || [];
                if (checked) {
                    finalValue = [...currentArray, value];
                } else {
                    finalValue = currentArray.filter(v => v !== value);
                }
            } else if (name === 'phone') {
                finalValue = maskPhone(value);
            } else if (name === 'plan.total') {
                currentData.plan.total = value;
                finalValue = currentData.plan;
                name = 'plan';
            }
             else {
                finalValue = value;
            }
    
            return {
                ...currentModal,
                data: { ...currentData, [name]: finalValue }
            };
        });
    }, []);

    const handleAddUserClick = useCallback(() => {
        setUserModal({
            isOpen: true,
            data: { id: null, name: '', username: '', role: 'student', status: 'active', phone: '', email: '', birthDate: '', paymentDueDate: 1, plan: { total: 8 }, enrolledIn: [], specialties: [] }
        });
    }, []);
    
    const handleEditUserClick = useCallback((user) => {
        setUserModal({
            isOpen: true,
            data: {
                ...user,
                phone: maskPhone(user.phone || ''),
                plan: user.plan ? { ...user.plan } : { total: 0 },
            }
        });
        setExtraClassesToAdd(0);
    }, []);
    
    const handleSaveUser = () => {
        if (!userModal.data) return;
        const { id, ...formData } = userModal.data;
        const userData = { ...formData, phone: formData.phone.replace(/\D/g, ''), };
    
        if (userData.role === 'student') {
            userData.plan = { ...userData.plan, total: parseInt(userData.plan.total, 10) };
        } else {
            userData.plan = null;
        }
    
        if (id) {
            setUsers(currentUsers => currentUsers.map(u => u.id === id ? { ...u, ...userData } : u));
            if (extraClassesToAdd > 0) {
                onAddExtraClasses(id, extraClassesToAdd);
            }
        } else {
            onCreateUser({ ...userData, password: 'password', checkedInClassIds: [], lateCancellations: [] });
        }
        setUserModal({ isOpen: false, data: null });
    };

    const handleClassFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setClassForm(currentForm => ({...currentForm, [name]: value}));
    }, []);
    
    const handleCreateClass = useCallback((e) => { e.preventDefault(); const { date, time, maxStudents, teacherId, type } = classForm; if(date && time && teacherId && type) { const [year, month, day] = date.split('-'); const [hour, minute] = time.split(':'); onCreateClass({ date: new Date(year, month - 1, day, hour, minute), maxStudents: parseInt(maxStudents), type }, parseInt(teacherId)); setShowCreateClassForm(false); setClassForm({ date: '', time: '', maxStudents: 10, teacherId: '', type: ''}); } else { alert("Por favor, preencha todos os campos."); } }, [classForm, onCreateClass]);
    
    const handleSearchTermChange = useCallback((e) => { setSearchTerm(e.target.value); }, []);
    
    const handleEditClassClick = useCallback((cls) => { setEditingClass(cls); const date = new Date(cls.date); setClassForm({ date: date.toISOString().split('T')[0], time: date.toTimeString().substring(0,5), maxStudents: cls.maxStudents, teacherId: cls.teacherId, type: cls.type }); }, []);
    
    const handleUpdateClass = useCallback(() => { if(!editingClass) return; const { date, time, maxStudents, teacherId, type } = classForm; if(date && time && teacherId && type) { const [year, month, day] = date.split('-'); const [hour, minute] = time.split(':'); const newDate = new Date(year, month - 1, day, hour, minute); setClasses(prevClasses => prevClasses.map(c => c.id === editingClass.id ? { ...c, date: newDate, maxStudents: parseInt(maxStudents), teacherId: parseInt(teacherId), type } : c)); setEditingClass(null); setClassForm({ date: '', time: '', maxStudents: 10, teacherId: '', type: ''}); } else { alert("Por favor, preencha todos os campos."); } }, [editingClass, classForm, setClasses]);
    
    const filteredUsers = useMemo(() => {
        if (!searchTerm) return allUsers.filter(u => u.role !== 'admin');
        const term = searchTerm.toLowerCase();
        const numericTerm = searchTerm.replace(/\D/g, '');
        return allUsers.filter(u => u.role !== 'admin' && (
            u.name.toLowerCase().includes(term) ||
            u.username.toLowerCase().includes(term) ||
            (numericTerm && u.phone && u.phone.replace(/\D/g, '').includes(numericTerm))
        ));
    }, [allUsers, searchTerm]);
    
    const filteredAndSortedClasses = useMemo(() => allClasses.filter(c => c.date.getFullYear() === displayedDate.getFullYear() && c.date.getMonth() === displayedDate.getMonth()).sort((a, b) => a.date - b.date), [allClasses, displayedDate]);

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex justify-center border-b border-gray-200 mb-6"><button onClick={() => setView('users')} className={`px-6 py-3 font-semibold ${view === 'users' ? 'border-b-2 border-[#ddfb3b] text-black' : 'text-gray-500'}`}>Usuários</button><button onClick={() => setView('classes')} className={`px-6 py-3 font-semibold ${view === 'classes' ? 'border-b-2 border-[#ddfb3b] text-black' : 'text-gray-500'}`}>Aulas</button><button onClick={() => setView('settings')} className={`px-6 py-3 font-semibold ${view === 'settings' ? 'border-b-2 border-[#ddfb3b] text-black' : 'text-gray-500'}`}>Configurações</button></div>
            {userModal.isOpen && userModal.data && (<div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"><div className="bg-white rounded-lg p-6 space-y-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto"><h3 className="text-xl font-bold">{userModal.data.id ? `Editando ${userModal.data.name}` : 'Criar Novo Usuário'}</h3><div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label>Nome</label><input type="text" name="name" value={userModal.data.name} onChange={handleUserFormChange} className="w-full mt-1 p-2 border rounded-md"/></div><div><label>Username</label><input type="text" name="username" value={userModal.data.username} onChange={handleUserFormChange} className="w-full mt-1 p-2 border rounded-md"/></div><div><label>Email</label><input type="email" name="email" value={userModal.data.email} onChange={handleUserFormChange} className="w-full mt-1 p-2 border rounded-md"/></div><div><label>Telefone/Whats</label><input type="tel" name="phone" value={userModal.data.phone} onChange={handleUserFormChange} className="w-full mt-1 p-2 border rounded-md"/></div><div><label>Data de Nascimento</label><input type="date" name="birthDate" value={userModal.data.birthDate} onChange={handleUserFormChange} className="w-full mt-1 p-2 border rounded-md"/></div><div><label>Função</label><select name="role" value={userModal.data.role} onChange={handleUserFormChange} className="w-full mt-1 p-2 border rounded-md"><option value="student">Aluno</option><option value="teacher">Professor</option></select></div></div></div><div><label className="font-semibold">Status</label><select name="status" value={userModal.data.status} onChange={handleUserFormChange} className="w-full mt-1 p-2 border rounded-md"><option value="active">Ativo</option><option value="inactive">Inativo</option></select></div>{userModal.data.role === 'student' && (<><div><label className="font-semibold">Plano Mensal (Créditos):</label><input type="number" name="plan.total" value={userModal.data.plan.total} onChange={handleUserFormChange} className="w-full mt-1 p-2 border rounded-md"/></div><div><label className="font-semibold">Dia de Vencimento:</label><input type="number" name="paymentDueDate" value={userModal.data.paymentDueDate} onChange={handleUserFormChange} min="1" max="31" className="w-full mt-1 p-2 border rounded-md"/></div>{userModal.data.id && <div><label className="font-semibold">Aulas Extras (este mês):</label><input type="number" value={extraClassesToAdd} onChange={(e) => setExtraClassesToAdd(parseInt(e.target.value) || 0)} className="w-full mt-1 p-2 border rounded-md"/></div>}<div><label className="font-semibold">Modalidades:</label><div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-1">{CLASS_TYPES.map(type => (<label key={type} className="flex items-center gap-2"><input type="checkbox" name="enrolledIn" value={type} checked={userModal.data.enrolledIn?.includes(type)} onChange={handleUserFormChange}/>{type}</label>))}</div></div></>)}{userModal.data.role === 'teacher' && (<div><label className="font-semibold">Especialidades:</label><div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-1">{CLASS_TYPES.map(type => (<label key={type} className="flex items-center gap-2"><input type="checkbox" name="specialties" value={type} checked={userModal.data.specialties?.includes(type)} onChange={handleUserFormChange}/>{type}</label>))}</div></div>)}{userModal.data.id && <button onClick={() => onResetPassword(userModal.data.id)} className="text-sm text-blue-600 hover:underline">Redefinir Senha</button>}<div className="flex justify-end gap-3 pt-4"><button onClick={() => setUserModal({isOpen: false, data: null})} className="px-4 py-2 text-sm rounded-md border">Cancelar</button><button onClick={handleSaveUser} className="px-4 py-2 text-sm rounded-md bg-[#ddfb3b] text-black font-bold">Salvar</button></div></div></div>)}
            {editingClass && (<div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"><div className="bg-white p-6 rounded-xl shadow-md w-full max-w-2xl"><form onSubmit={(e) => { e.preventDefault(); handleUpdateClass(); }} className="space-y-4"><h3 className="text-lg font-semibold text-black">Editar Aula</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><div><label>Data</label><input type="date" value={classForm.date} onChange={e => handleClassFormChange(e, 'date')} required className="mt-1 block w-full"/></div><div><label>Hora</label><input type="time" value={classForm.time} onChange={e => handleClassFormChange(e, 'time')} required className="mt-1 block w-full"/></div><div><label>Máx. Alunos</label><input type="number" value={classForm.maxStudents} onChange={e => handleClassFormChange(e, 'maxStudents')} min="1" required className="mt-1 block w-full"/></div><div><label>Modalidade</label><select value={classForm.type} onChange={e => handleClassFormChange(e, 'type')} required className="mt-1 block w-full"><option value="" disabled>Selecione...</option>{CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div><div><label>Professor</label><select value={classForm.teacherId} onChange={e => handleClassFormChange(e, 'teacherId')} required className="mt-1 block w-full" disabled={!classForm.type}><option value="" disabled>Selecione...</option>{teachers.filter(t => t.specialties.includes(classForm.type)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div></div><div className="flex justify-end gap-3"><button type="button" onClick={() => setEditingClass(null)} className="px-4 py-2 rounded-md border">Cancelar</button><button type="submit" className="px-4 py-2 rounded-md bg-[#ddfb3b] text-black font-bold">Salvar Alterações</button></div></form></div></div>)}
            {view === 'users' && <UserManagementView searchTerm={searchTerm} handleSearchTermChange={handleSearchTermChange} filteredUsers={filteredUsers} handleEditUserClick={handleEditUserClick} onAddUserClick={handleAddUserClick}/>}
            {view === 'classes' && <ClassManagementView showCreateClassForm={showCreateClassForm} setShowCreateClassForm={setShowCreateClassForm} handleCreateClass={handleCreateClass} classForm={classForm} handleClassFormChange={handleClassFormChange} CLASS_TYPES={CLASS_TYPES} teachers={teachers} displayedDate={displayedDate} onPreviousMonth={onPreviousMonth} onNextMonth={onNextMonth} filteredAndSortedClasses={filteredAndSortedClasses} allUsers={allUsers} onDeleteClass={onDeleteClass} onEditClass={handleEditClassClick}/>}
            {view === 'settings' && <div className="bg-white p-6 rounded-xl shadow-md"> <h2 className="text-2xl font-bold text-black mb-4">Configurações Gerais</h2><div><label className="block text-sm font-medium text-gray-700">Prazo para cancelamento sem perda de crédito (em horas)</label><input type="number" value={cancellationDeadlineHours} onChange={(e) => setCancellationDeadlineHours(Number(e.target.value))} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/></div></div>}
        </div>
    );
}

function ProfilePage({ currentUser, onUpdatePassword, onBack }) {
    const [oldPassword, setOldPassword] = useState(''); const [newPassword, setNewPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState(''); const [error, setError] = useState(''); const [success, setSuccess] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); setError(''); setSuccess(''); if (newPassword !== confirmPassword) { setError('As novas senhas não coincidem.'); return; } onUpdatePassword(currentUser.id, oldPassword, newPassword, (err) => { if (err) { setError(err); } else { setSuccess('Senha alterada com sucesso!'); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); } }); };
    return (<div className="p-4 md:p-8 max-w-lg mx-auto"><h2 className="text-2xl font-bold text-black mb-6">Meu Perfil</h2><div className="bg-white p-6 rounded-xl shadow-md"><form onSubmit={handleSubmit} className="space-y-4"><h3 className="text-lg font-semibold text-black">Alterar Senha</h3><div><label className="block text-sm font-medium text-gray-700">Senha Atual</label><input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/></div><div><label className="block text-sm font-medium text-gray-700">Nova Senha</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/></div><div><label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/></div>{error && <p className="text-sm text-red-600">{error}</p>}{success && <p className="text-sm text-green-600">{success}</p>}<div className="flex justify-between items-center pt-2"><button type="button" onClick={onBack} className="text-sm text-gray-600 hover:underline">Voltar</button><button type="submit" className="px-6 py-2 text-sm font-bold text-black bg-[#ddfb3b] rounded-full hover:opacity-90">Salvar</button></div></form></div></div>);
}

// --- Componente Principal da Aplicação ---
export default function App() {
  const [currentUser, setCurrentUser] = useState(null); 
  const [users, setUsers] = useState(initialUsers); 
  const [classes, setClasses] = useState(initialClasses); 
  const [modalState, setModalState] = useState({ isOpen: false, data: null, type: '' }); 
  const [displayedDate, setDisplayedDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1)); 
  const [view, setView] = useState('dashboard');
  const [cancellationDeadlineHours, setCancellationDeadlineHours] = useState(24);

  const handleLogin = (username, password, callback) => { const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password); if(user) { if(user.status === 'active'){ setCurrentUser(user); setView('dashboard');} else { callback('Usuário inativo. Por favor, entre em contato com o suporte.'); }} else { callback('Usuário ou senha inválidos.'); }};
  const handleLogout = () => {setCurrentUser(null); setView('dashboard');};
  const handleUpdatePassword = (userId, oldPassword, newPassword, callback) => { const user = users.find(u => u.id === userId); if (user && user.password === oldPassword) { setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, password: newPassword } : u)); callback(null); } else { callback('A senha atual está incorreta.'); } };
  const handleResetPassword = (userId) => { if(window.confirm('Tem certeza que deseja redefinir a senha deste usuário para "password"?')) { setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, password: 'password' } : u)); alert('Senha redefinida com sucesso!'); }};
  const handleAddExtraClasses = (userId, count) => { const monthIdentifier = `${displayedDate.getFullYear()}-${displayedDate.getMonth()}`; setUsers(prevUsers => prevUsers.map(u => { if (u.id === userId) { const newPlan = { ...u.plan }; let extraClasses = [...(newPlan.extraClasses || [])]; const monthIndex = extraClasses.findIndex(e => e.month === monthIdentifier); if (monthIndex > -1) { extraClasses[monthIndex] = { ...extraClasses[monthIndex], count: extraClasses[monthIndex].count + count }; } else { extraClasses.push({ month: monthIdentifier, count }); } return { ...u, plan: { ...newPlan, extraClasses } }; } return u; })); };
  
  const handleCheckIn = (studentId, classId) => {
    const student = users.find(u => u.id === studentId);
    const aClass = classes.find(c => c.id === classId);
    if (!student || !aClass) return;
    if (student.checkedInClassIds.includes(classId)) return;

    if (aClass.date < today) {
        alert("Não é possível fazer check-in em aulas que já ocorreram.");
        return;
    }

    const { start, end } = getBillingCycle(student.paymentDueDate);
    if (aClass.date < start || aClass.date > end) {
        alert("Esta aula está fora do seu ciclo de pagamento atual.");
        return;
    }

    const usedInBillingCycle = student.checkedInClassIds.filter(id => {
        const c = classes.find(cls => cls.id === id);
        return c && c.date >= start && c.date <= end;
    }).length;
    
    const extraClassesForMonth = student.plan.extraClasses?.find(ec => ec.month === `${today.getFullYear()}-${today.getMonth()}`)?.count || 0;
    if (student.plan.total + extraClassesForMonth - usedInBillingCycle <= 0) {
        alert("Você não tem créditos de aula suficientes para este ciclo.");
        return;
    }
    
    if (aClass.checkedInStudents.length >= aClass.maxStudents) {
        alert("Esta turma já está cheia.");
        return;
    }
    
    setUsers(currentUsers => currentUsers.map(u => u.id === studentId ? { ...u, checkedInClassIds: [...u.checkedInClassIds, classId] } : u));
    setClasses(currentClasses => currentClasses.map(c => c.id === classId ? { ...c, checkedInStudents: [...c.checkedInStudents, studentId] } : c));
};

  const performNormalCancellation = (studentId, classId) => {
      setUsers(currentUsers => currentUsers.map(u => u.id === studentId ? { ...u, checkedInClassIds: u.checkedInClassIds.filter(id => id !== classId) } : u));
      setClasses(currentClasses => currentClasses.map(c => c.id === classId ? { ...c, checkedInStudents: c.checkedInStudents.filter(id => id !== studentId) } : c));
  };

  const performLateCancellation = (studentId, classId) => {
      setClasses(currentClasses => currentClasses.map(c => {
          if (c.id === classId) {
              return {
                  ...c,
                  checkedInStudents: c.checkedInStudents.filter(id => id !== studentId),
                  lateCancellations: [...(c.lateCancellations || []), studentId]
              };
          }
          return c;
      }));
  };

  const handleCancelCheckInRequest = (studentId, classId) => {
      const aClass = classes.find(c => c.id === classId);
      if (!aClass) return;

      const hoursBefore = (aClass.date.getTime() - new Date().getTime()) / (1000 * 60 * 60);

      if (hoursBefore < cancellationDeadlineHours) {
          setModalState({ 
              isOpen: true, 
              data: { studentId, classId }, 
              type: 'lateCancel' 
          });
      } else {
          performNormalCancellation(studentId, classId);
      }
  };

  const handleConfirmModal = () => {
    if (modalState.type === 'lateCancel') {
        const { studentId, classId } = modalState.data;
        performLateCancellation(studentId, classId);
    } else if (modalState.type === 'deleteClass') {
        const { classId } = modalState.data;
        if (!classId) return;
        setUsers(currentUsers => currentUsers.map(user => { if (user.role === 'student' && user.checkedInClassIds.includes(classId)) { return { ...user, checkedInClassIds: user.checkedInClassIds.filter(id => id !== classId) };} return user; }));
        setClasses(currentClasses => currentClasses.filter(c => c.id !== classId));
    }
    setModalState({ isOpen: false, data: null, type: '' });
  };
  
  const handleCreateClass = (newClassData, teacherId) => setClasses(prev => [...prev, { id: Date.now(), ...newClassData, teacherId, checkedInStudents: [], lateCancellations: [] }]);
  const handleCreateUser = (newUserData) => setUsers(prev => [...prev, { id: Date.now(), ...newUserData }]);
  const handleDeleteRequest = (classId) => setModalState({ isOpen: true, data: { classId }, type: 'deleteClass' });
  const handlePreviousMonth = () => setDisplayedDate(current => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  const handleNextMonth = () => setDisplayedDate(current => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  
  const filteredAndSortedClasses = useMemo(() => { const baseFilter = classes.filter(c => c.date.getFullYear() === displayedDate.getFullYear() && c.date.getMonth() === displayedDate.getMonth()); if (currentUser?.role === 'teacher') return baseFilter.filter(c => c.teacherId === currentUser.id).sort((a,b) => a.date - b.date); if (currentUser?.role === 'student') return baseFilter.filter(c => currentUser.enrolledIn.includes(c.type)).sort((a,b) => a.date - b.date); return baseFilter.sort((a, b) => a.date - b.date); }, [classes, displayedDate, currentUser]);
  const studentDataForDashboard = useMemo(() => { if (currentUser?.role !== 'student') return null; const student = users.find(u => u.id === currentUser.id); if (!student) return null; const { start, end } = getBillingCycle(student.paymentDueDate); const usedInBillingCycle = student.checkedInClassIds.filter(id => { const c = classes.find(cls => cls.id === id); return c && c.date >= start && c.date <= end; }).length; return { ...student, plan: { ...student.plan, usedInBillingCycle }}; }, [currentUser, users, classes]);

  if (!currentUser) return <LoginPage onLogin={handleLogin} />;
  
  const modalMessages = {
      deleteClass: {
          title: "Excluir Aula",
          body: "Tem certeza que deseja excluir esta aula? Os check-ins dos alunos serão cancelados."
      },
      lateCancel: {
          title: "Cancelamento de Última Hora",
          body: `Você está cancelando com menos de ${cancellationDeadlineHours} horas de antecedência. Seu crédito não será estornado. Deseja continuar?`
      }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <ConfirmModal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState({ isOpen: false, data: null, type: '' })} 
        onConfirm={handleConfirmModal} 
        title={modalMessages[modalState.type]?.title || ''}
      >
        <p>{modalMessages[modalState.type]?.body || ''}</p>
      </ConfirmModal>

      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-black cursor-pointer" onClick={() => setView('dashboard')}>Complecso</h1>
            <div className="flex items-center gap-4">
                <span className="text-gray-800 hidden sm:block">Bem-vindo(a), <strong>{currentUser.name}</strong></span>
                <button onClick={() => setView('profile')} className="p-2 rounded-full hover:bg-gray-200"><UserCog className="h-5 w-5 text-gray-600"/></button>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"><LogOut className="h-5 w-5" />Sair</button>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {view === 'profile' ? (
            <ProfilePage currentUser={currentUser} onUpdatePassword={handleUpdatePassword} onBack={() => setView('dashboard')} />
        ) : (
            <>
                {currentUser.role === 'admin' && (
                    <AdminDashboard allUsers={users} setUsers={setUsers} onCreateUser={handleCreateUser} allClasses={classes} setClasses={setClasses} onCreateClass={handleCreateClass} onDeleteClass={handleDeleteRequest} displayedDate={displayedDate} onPreviousMonth={handlePreviousMonth} onNextMonth={handleNextMonth} onResetPassword={handleResetPassword} onAddExtraClasses={handleAddExtraClasses} cancellationDeadlineHours={cancellationDeadlineHours} setCancellationDeadlineHours={setCancellationDeadlineHours} />
                )}
                {currentUser.role === 'student' && studentDataForDashboard && (
                    <StudentDashboard student={studentDataForDashboard} classes={filteredAndSortedClasses} allUsers={users} onCheckIn={handleCheckIn} onCancelCheckInRequest={handleCancelCheckInRequest} displayedDate={displayedDate} onPreviousMonth={handlePreviousMonth} onNextMonth={handleNextMonth} />
                )}
                {currentUser.role === 'teacher' && (
                    <TeacherDashboard currentUser={currentUser} classes={filteredAndSortedClasses} users={users} onCreateClass={handleCreateClass} onDeleteClass={handleDeleteRequest} displayedDate={displayedDate} onPreviousMonth={handlePreviousMonth} onNextMonth={handleNextMonth} />
                )}
            </>
        )}
      </main>
    </div>
  );
}