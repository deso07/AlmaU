import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { app } from '../config/firebase';

const auth = getAuth(app);
const db = getFirestore(app);

// Helper function to get user-friendly error message
const getAuthErrorMessage = (error: FirebaseError): string => {
  switch (error.code) {
    case 'auth/invalid-credential':
      return 'Неверный email или пароль';
    case 'auth/user-not-found':
      return 'Пользователь не найден';
    case 'auth/wrong-password':
      return 'Неверный пароль';
    case 'auth/email-already-in-use':
      return 'Этот email уже используется';
    case 'auth/weak-password':
      return 'Пароль слишком слабый';
    case 'auth/invalid-email':
      return 'Неверный формат email';
    case 'auth/operation-not-allowed':
      return 'Операция не разрешена';
    case 'auth/too-many-requests':
      return 'Слишком много попыток. Попробуйте позже';
    default:
      return 'Произошла ошибка при аутентификации';
  }
};

// Extended user interface with additional profile information
interface User {
  id: string;
  uid: string;
  email: string;
  username: string;
  displayName?: string;
  photoURL?: string;
  role?: 'admin' | 'teacher' | 'student';
  university?: string;
  faculty?: string;
  year?: string;
  phone?: string;
  about?: string;
  createdAt?: string;
  position?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, userData?: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
      success: null,
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          let role: 'admin' | 'teacher' | 'student' = 'student';
          if (email.includes('teacher')) {
            role = 'teacher';
          } else if (email.includes('admin')) {
            role = 'admin';
          }
          // --- Load profile from Firestore ---
          let profileData = {};
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              profileData = userDoc.data();
            }
          } catch (e) {
            console.error('Ошибка при загрузке профиля из Firestore:', e);
          }
          set({
            isAuthenticated: true,
            user: {
              id: user.uid,
              uid: user.uid,
              email: user.email || '',
              username: user.displayName || user.email?.split('@')[0] || '',
              role: (profileData as any).role || role,
              position: (profileData as any).position,
              photoURL: user.photoURL || undefined,
              displayName: user.displayName || undefined,
              ...profileData
            },
            loading: false,
            error: null
          });
        } catch (error: any) {
          const errorMessage = error instanceof FirebaseError ? getAuthErrorMessage(error) : 'Произошла ошибка при входе';
          set({ 
            isAuthenticated: false, 
            user: null,
            loading: false, 
            error: errorMessage
          });
          console.error('Login error:', error);
          throw new Error(errorMessage);
        }
      },
      register: async (username, email, password, userData) => {
        set({ loading: true, error: null });
        try {
          // Email validation using a more standard regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            set({ loading: false });
            throw new Error('Пожалуйста, введите корректный email адрес');
          }
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          if (user) {
            await updateProfile(user, {
              displayName: username
            });
            // --- Save profile to Firestore ---
            try {
              // Валидация и очистка данных
              const cleanString = (val: unknown): string | undefined =>
                typeof val === 'string' && val.trim() !== '' ? val : undefined;

              let firestorePayload: Record<string, string | undefined> = {
                displayName: cleanString(username),
                email: cleanString(email),
                university: cleanString(userData?.university),
                faculty: cleanString(userData?.faculty),
                phone: cleanString(userData?.phone),
                about: cleanString(userData?.about),
                photoURL: cleanString(user.photoURL),
                createdAt: new Date().toISOString(),
                role: userData?.role,
                position: userData?.role === 'teacher' ? cleanString(userData?.year) : undefined,
                year: userData?.role === 'student' ? cleanString(userData?.year) : undefined,
              };
              // Удаляем undefined значения
              Object.keys(firestorePayload).forEach(
                (key) => firestorePayload[key] === undefined && delete firestorePayload[key]
              );
              // Сохраняем профиль в Firestore
              await setDoc(doc(db, 'users', user.uid), firestorePayload, { merge: true });
            } catch (e) {
              console.error('Error saving profile to Firestore:', e);
              set({ loading: false });
              throw new Error('Ошибка при сохранении профиля в базе данных');
            }
          }
          // After successful registration, log in the user
          await get().login(email, password);
        } catch (error: any) {
          const errorMessage = error instanceof FirebaseError ? getAuthErrorMessage(error) : error.message || 'Произошла ошибка при регистрации';
          set({ 
            isAuthenticated: false, 
            user: null,
            loading: false, 
            error: errorMessage
          });
          console.error('Registration error:', error);
          throw new Error(errorMessage);
        }
      },
      logout: async () => {
        try {
          await signOut(auth);
          set({ isAuthenticated: false, user: null, error: null });
        } catch (error: any) {
          const errorMessage = error instanceof FirebaseError ? getAuthErrorMessage(error) : 'Ошибка при выходе из системы';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },
      updateUserProfile: async (userData) => {
        set({ loading: true, error: null });
        try {
          const currentUser = get().user;
          if (!currentUser) throw new Error('Пользователь не найден');
          
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            await updateProfile(firebaseUser, {
              displayName: userData.displayName || null,
              photoURL: userData.photoURL || null
            });
          }

          set({
            user: {
              ...currentUser,
              ...userData
            },
            loading: false,
            error: null
          });
        } catch (error: any) {
          const errorMessage = error instanceof FirebaseError ? getAuthErrorMessage(error) : 'Произошла ошибка при обновлении профиля';
          set({ loading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },
      resetPassword: async (email) => {
        set({ loading: true, error: null });
        try {
          await sendPasswordResetEmail(auth, email);
          set({ 
            loading: false, 
            error: null,
            success: 'Инструкции по сбросу пароля отправлены на ваш email'
          });
        } catch (error: any) {
          const errorMessage = error instanceof FirebaseError ? getAuthErrorMessage(error) : 'Произошла ошибка при сбросе пароля';
          set({ 
            loading: false, 
            error: errorMessage,
            success: null
          });
          throw new Error(errorMessage);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated, user: state.user })
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
