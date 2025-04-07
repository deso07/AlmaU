import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Extended user interface with additional profile information
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  university?: string;
  faculty?: string;
  year?: string;
  phone?: string;
  about?: string;
  createdAt?: string;
  lastLogin?: string;
  role?: 'student' | 'teacher' | 'admin';  // Add role property
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, userData?: Partial<User>) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;
}

// Мок функции для имитации запросов к API
const mockAPICall = (success: boolean, data: any, errorMessage?: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (success) {
        resolve(data);
      } else {
        reject(new Error(errorMessage || 'An error occurred'));
      }
    }, 1000);
  });
};

// Создание хранилища состояния авторизации
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          // Get current date for lastLogin
          const currentDate = new Date().toISOString();
          
          // Check if we have saved user data for this email
          const savedUsers = localStorage.getItem('registered-users');
          let user = null;
          
          if (savedUsers) {
            const users = JSON.parse(savedUsers);
            user = users.find((u: User) => u.email === email);
          }
          
          // If no saved user, create a basic one
          if (!user) {
            user = {
              uid: '1',
              email: email,
              displayName: '',
              photoURL: null,
              createdAt: currentDate,
            };
          }
          
          // Update last login time
          user.lastLogin = currentDate;
          
          // Assign role based on email
          let role: 'student' | 'teacher' | 'admin' = 'student';
          if (email.includes('teacher')) {
            role = 'teacher';
          } else if (email.includes('admin')) {
            role = 'admin';
          }
          user.role = role;
          
          // Imitate API request
          const mockUser = await mockAPICall(
            true, // Success flag
            user,
            'Invalid email or password'
          );
          
          set({ isAuthenticated: true, user: mockUser, loading: false });
        } catch (error) {
          set({ 
            isAuthenticated: false, 
            user: null, 
            loading: false, 
            error: (error as Error).message 
          });
          throw error;
        }
      },
      register: async (email: string, password: string, displayName: string, userData?: Partial<User>) => {
        set({ loading: true, error: null });
        try {
          // Get current date for createdAt and lastLogin
          const currentDate = new Date().toISOString();
          
          // Assign role based on email
          let role: 'student' | 'teacher' | 'admin' = 'student';
          if (email.includes('teacher')) {
            role = 'teacher';
          } else if (email.includes('admin')) {
            role = 'admin';
          }
          
          // Create new user with basic + provided data
          const newUser = {
            uid: `user_${Date.now()}`,
            email,
            displayName,
            photoURL: null,
            createdAt: currentDate,
            lastLogin: currentDate,
            role,
            ...userData
          };
          
          // Store user in local storage for future logins
          const savedUsers = localStorage.getItem('registered-users');
          const users = savedUsers ? JSON.parse(savedUsers) : [];
          users.push(newUser);
          localStorage.setItem('registered-users', JSON.stringify(users));
          
          // Imitate API request
          const mockUser = await mockAPICall(
            true, // Success flag
            newUser,
            'Email already in use'
          );
          
          set({ isAuthenticated: true, user: mockUser, loading: false });
        } catch (error) {
          set({ 
            isAuthenticated: false, 
            user: null, 
            loading: false, 
            error: (error as Error).message 
          });
          throw error;
        }
      },
      logout: () => {
        set({ isAuthenticated: false, user: null });
      },
      updateUserProfile: (data) => {
        const currentUser = get().user;
        if (currentUser) {
          // Create updated user object
          const updatedUser = { 
            ...currentUser, 
            ...data 
          };
          
          // Update in local storage if registered
          const savedUsers = localStorage.getItem('registered-users');
          if (savedUsers) {
            const users = JSON.parse(savedUsers);
            const updatedUsers = users.map((u: User) => 
              u.email === currentUser.email ? updatedUser : u
            );
            localStorage.setItem('registered-users', JSON.stringify(updatedUsers));
          }
          
          set({ user: updatedUser });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Initialize auth state from localStorage on app load
if (typeof window !== 'undefined') {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser) as User;
      useAuthStore.setState({ 
        user, 
        isAuthenticated: true, 
        loading: false 
      });
    } catch (error) {
      console.error('Failed to parse stored user data', error);
      localStorage.removeItem('user');
      useAuthStore.setState({ loading: false });
    }
  } else {
    useAuthStore.setState({ loading: false });
  }
}
