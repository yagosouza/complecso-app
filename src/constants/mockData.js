// src/constants/mockData.js
const today = new Date();

const createDate = (day, hour, monthOffset = 0) => {
    const baseDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, day);
    baseDate.setHours(hour, 0, 0, 0);
    return baseDate;
};

export const CLASS_TYPES = ['Futevôlei', 'Beach Tennis', 'Funcional'];

export const initialUsers = [
  // ADMIN
  { id: 200, name: 'Admin', role: 'admin', username: 'admin', password: 'password', status: 'active' },

  // PROFESSORES
  { id: 100, name: 'Professor Alex', role: 'teacher', username: 'alex', password: 'password', status: 'active', phone: '11988880001', email: 'alex@email.com', birthDate: '1990-03-15', specialties: ['Futevôlei', 'Funcional'] },
  { id: 101, name: 'Professora Bia', role: 'teacher', username: 'bia', password: 'password', status: 'active', phone: '11988880002', email: 'bia@email.com', birthDate: '1992-10-05', specialties: ['Beach Tennis'] },

  // ALUNOS COM A NOVA ESTRUTURA
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
    creditBatches: [
      { id: 'b1', purchaseDate: '2025-06-10', creditsPurchased: 8, creditsRemaining: 6, expiryDate: '2025-07-10' }
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
    creditBatches: [
      { id: 'b2', purchaseDate: '2025-06-20', creditsPurchased: 12, creditsRemaining: 12, expiryDate: '2025-07-20' }
    ]
  },
  { 
    id: 3, 
    name: 'Carlos Dias', 
    role: 'student', 
    username: 'carlos', 
    password: 'password', 
    status: 'inactive', 
    phone: '11999990003', 
    email: 'carlos@email.com', 
    birthDate: '2002-01-30', 
    checkedInClassIds: [], 
    enrolledIn: ['Beach Tennis'],
    creditBatches: [
      { id: 'b3', purchaseDate: '2025-04-01', creditsPurchased: 8, creditsRemaining: 0, expiryDate: '2025-05-01' }
    ]
  },
  { 
    id: 4, 
    name: 'Fernanda Lima', 
    role: 'student', 
    username: 'fernanda', 
    password: 'password', 
    status: 'active', 
    phone: '11999990004', 
    email: 'fernanda@email.com', 
    birthDate: '1999-07-22', 
    checkedInClassIds: [2], 
    enrolledIn: ['Funcional', 'Futevôlei'],
    creditBatches: []
  },
];

export const initialClasses = [
  { id: 1, date: createDate(today.getDate() + 1, 18), maxStudents: 10, checkedInStudents: [2], lateCancellations: [], teacherId: 100, type: 'Futevôlei' },
  { id: 2, date: createDate(today.getDate() + 2, 19), maxStudents: 8, checkedInStudents: [4], lateCancellations: [], teacherId: 101, type: 'Beach Tennis' },
  { id: 3, date: createDate(today.getDate() + 3, 18), maxStudents: 10, checkedInStudents: [], lateCancellations: [], teacherId: 100, type: 'Funcional' },
  { id: 4, date: createDate(2, 19, 1), maxStudents: 8, checkedInStudents: [], lateCancellations: [], teacherId: 100, type: 'Futevôlei' },
  { id: 5, date: createDate(3, 17, 1), maxStudents: 12, checkedInStudents: [], lateCancellations: [], teacherId: 101, type: 'Beach Tennis' },
  { id: 6, date: createDate(2, 18, 1), maxStudents: 10, checkedInStudents: [], lateCancellations: [], teacherId: 100, type: 'Funcional' },
];