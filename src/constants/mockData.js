// src/constants/mockData.js
const today = new Date();

const createDate = (day, hour, monthOffset = 0) => {
    const baseDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, day);
    baseDate.setHours(hour, 0, 0, 0);
    return baseDate;
};

// Dados Iniciais para serem carregados no Contexto
export const INITIAL_MODALITIES = ['Futevôlei', 'Beach Tennis'];
export const INITIAL_CATEGORIES = ['Livre', 'Bronze'];
export const INITIAL_PLANS = [
  { id: 'plan1', name: 'Plano Bronze 8 Aulas', classes: 8, price: 100 },
  { id: 'plan2', name: 'Plano Bronze 12 Aulas', classes: 12, price: 140 },
  { id: 'plan3', name: 'Plano Livre', classes: Infinity, price: 200 }, // Plano ilimitado
];


export const initialUsers = [
  // ADMIN
  { id: 200, name: 'Admin', role: 'admin', username: 'admin', password: 'password', status: 'active' },

  // PROFESSORES
  { id: 100, name: 'Professor Alex', role: 'teacher', username: 'alex', password: 'password', status: 'active', phone: '11988880001', email: 'alex@email.com', birthDate: '1990-03-15', specialties: ['Futevôlei'] },
  { id: 101, name: 'Professora Bia', role: 'teacher', username: 'bia', password: 'password', status: 'active', phone: '11988880002', email: 'bia@email.com', birthDate: '1992-10-05', specialties: ['Beach Tennis'] },

  // ALUNOS
  {
    id: 1,
    name: 'Ana Júlia',
    role: 'student',
    username: 'ana',
    password: 'password',
    status: 'active',
    phone: '11999990001',
    email: 'ana@email.com',
    birthDate: '2000-05-10',
    checkedInClassIds: [],
    enrolledIn: ['Futevôlei'],
    categories: ['Bronze'],
    classPacks: [
      { id: 'p1', planId: 'plan1', purchaseDate: '2025-06-10', classesPurchased: 8, bonusClasses: 0, classesRemaining: 6, expiryDate: '2025-07-20' }
    ]
  },
  {
    id: 2,
    name: 'Bruno Costa',
    role: 'student',
    username: 'bruno',
    password: 'password',
    status: 'active',
    phone: '11999990002',
    email: 'bruno@email.com',
    birthDate: '1998-11-20',
    checkedInClassIds: [1],
    enrolledIn: ['Futevôlei', 'Beach Tennis'],
    categories: ['Livre'],
    classPacks: [
      { id: 'p2', planId: 'plan3', purchaseDate: '2025-06-15', classesPurchased: Infinity, bonusClasses: 0, classesRemaining: Infinity, expiryDate: '2025-07-25' }
    ]
  },
];

export const initialClasses = [
    { id: 1, date: createDate(today.getDate() + 1, 18), maxStudents: 10, checkedInStudents: [2], lateCancellations: [], teacherId: 100, type: 'Futevôlei', categories: ['Livre', 'Bronze'] },
    { id: 2, date: createDate(today.getDate() + 2, 19), maxStudents: 8, checkedInStudents: [], lateCancellations: [], teacherId: 101, type: 'Beach Tennis', categories: ['Bronze'] },
];