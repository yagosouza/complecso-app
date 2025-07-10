// src/constants/mockData.js
const today = new Date();

const createDate = (day, hour, monthOffset = 0) => {
    const baseDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, day);
    baseDate.setHours(hour, 0, 0, 0);
    return baseDate;
};

export const initialModalities = ['Futevôlei']; // Apenas Futevôlei

export const initialCategories = ['Livre', 'Bronze', 'Prata']; // Adicionado 'Prata'

export const initialUsers = [
  { id: 1, name: 'Admin', username: 'admin', password: 'password', role: 'admin', status: 'active', phone: '51999999999', email: 'admin@example.com', birthDate: '1990-01-01', enrolledIn: [], specialties: [], checkedInClassIds: [], lateCancellations: [], classPacks: [], categories: [] },
  { id: 2, name: 'Alice', username: 'alice', password: 'password', role: 'student', status: 'active', phone: '51988888888', email: 'alice@example.com', birthDate: '1995-05-10', enrolledIn: ['Futevôlei'], specialties: [], checkedInClassIds: [1], lateCancellations: [], classPacks: [{ id: 'pack1', classesPurchased: 10, classesRemaining: 8, purchaseDate: '2025-06-20', expiryDate: '2025-07-20' }], categories: ['Bronze'] },
  { id: 3, name: 'Beto', username: 'beto', password: 'password', role: 'student', status: 'active', phone: '51977777777', email: 'beto@example.com', birthDate: '1998-08-20', enrolledIn: ['Futevôlei'], specialties: [], checkedInClassIds: [], lateCancellations: [], classPacks: [], categories: ['Prata'] },
  { id: 100, name: 'Carlos', username: 'carlos', password: 'password', role: 'teacher', status: 'active', phone: '51966666666', email: 'carlos@example.com', birthDate: '1988-03-15', enrolledIn: [], specialties: ['Futevôlei'], checkedInClassIds: [], lateCancellations: [], classPacks: [], categories: [] },
  { id: 101, name: 'Diana', username: 'diana', password: 'password', role: 'teacher', status: 'active', phone: '51955555555', email: 'diana@example.com', birthDate: '1992-11-25', enrolledIn: [], specialties: ['Futevôlei'], checkedInClassIds: [], lateCancellations: [], classPacks: [], categories: [] }
];

export const initialClasses = [
    // Removida a aula de Beach Tennis, deixamos apenas Futevôlei
    { id: 1, date: createDate(today.getDate() + 1, 18), maxStudents: 10, checkedInStudents: [2], lateCancellations: [], teacherId: 100, type: 'Futevôlei', categories: ['Livre', 'Bronze', 'Prata'], description: 'Aula com foco em defesa e recepção.' },
    { id: 2, date: createDate(today.getDate() + 2, 19), maxStudents: 8, checkedInStudents: [], lateCancellations: [], teacherId: 101, type: 'Futevôlei', categories: ['Prata'], description: 'Treino de ataque e saque.' },
];

export const initialPlans = [
    { id: 1, name: 'Aula Avulsa', price: 50.00, classes: 1, validityDays: 30 },
    { id: 2, name: 'Pacote 8 Aulas', price: 320.00, classes: 8, validityDays: 45 },
    { id: 3, name: 'Pacote 12 Aulas', price: 420.00, classes: 12, validityDays: 60 },
    { id: 4, name: 'Plano Mensal Ilimitado', price: 500.00, classes: Infinity, validityDays: 30 }
];

export const initialCancellationDeadlineHours = 2;