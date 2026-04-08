import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { User, defaultUser } from '@/types/user';

interface UserState {
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
}

// Initial mock data
const initialUsers: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    designation: 'Maintenance Manager',
    supervisor: 'Jane Smith',
    dateOfBirth: '1985-05-15',
    gender: 'Male',
    nationality: 'American',
    passportNo: 'A12345678',
    address: '123 Main St, New York, NY',
    role: 'Manager',
    status: 'Active',
    access: {
      allFacilities: true,
      facilities: [],
      allBuildings: false,
      buildings: ['Building A', 'Building B']
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1987654321',
    designation: 'Operations Director',
    supervisor: '',
    dateOfBirth: '1980-10-20',
    gender: 'Female',
    nationality: 'British',
    passportNo: 'B87654321',
    address: '456 Park Ave, Boston, MA',
    role: 'SUPER ADMIN',
    status: 'Active',
    access: {
      allFacilities: true,
      facilities: [],
      allBuildings: true,
      buildings: []
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
];

export const useUserStore = create<UserState>((set, get) => ({
  users: initialUsers,
  
  addUser: (userData) => {
    const now = new Date().toISOString();
    const newUser: User = {
      ...userData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    set((state) => ({
      users: [...state.users, newUser]
    }));
    
    return newUser;
  },
  
  updateUser: (id, userData) => {
    set((state) => ({
      users: state.users.map((user) => 
        user.id === id 
          ? { ...user, ...userData, updatedAt: new Date().toISOString() } 
          : user
      )
    }));
  },
  
  deleteUser: (id) => {
    set((state) => ({
      users: state.users.filter((user) => user.id !== id)
    }));
  },
  
  getUserById: (id) => {
    return get().users.find((user) => user.id === id);
  }
}));