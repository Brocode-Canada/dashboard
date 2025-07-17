import type { User as FirebaseUser } from 'firebase/auth';
import type { User as FirebaseUserData } from '../services/firebaseService';

export type UserRole = 'superadmin' | 'admin' | 'user';

export type Permission = 'canManageUsers' | 'canViewAnalytics' | 'canEditContent';

export interface AuthContextType {
  user: FirebaseUser | null;
  userData: FirebaseUserData | null;
  role: UserRole;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createUser: (userData: Omit<FirebaseUserData, 'uid' | 'createdAt' | 'lastLoginAt'>, password: string) => Promise<void>;
} 