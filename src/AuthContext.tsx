import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';
import { firebaseService } from './services/firebaseService';
import type { User as FirebaseUserData } from './services/firebaseService';
import type { AuthContextType, UserRole } from './types/auth';

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  role: 'user',
  loading: false,
  login: async () => {},
  signOut: async () => {},
  createUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<FirebaseUserData | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);

  console.log('🚀 AuthProvider: Component initialized, loading:', loading);

  useEffect(() => {
    console.log('🚀 AuthProvider: Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🚀 AuthProvider: Auth state changed, user:', firebaseUser ? 'exists' : 'null');
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          console.log('🚀 AuthProvider: Fetching user data from Firestore...');
          // Fetch user data from Firestore
          const userDataFromFirestore = await firebaseService.getUserById(firebaseUser.uid);
          if (userDataFromFirestore) {
            console.log('🚀 AuthProvider: User data fetched, role:', userDataFromFirestore.role);
            console.log('🚀 AuthProvider: User data:', userDataFromFirestore);
            setUserData(userDataFromFirestore);
            setRole(userDataFromFirestore.role as UserRole);
          } else {
            console.log('🚀 AuthProvider: No user data found in Firestore');
            console.log('🚀 AuthProvider: Setting default role to "user"');
            setRole('user');
          }
        } catch (error) {
          console.error('❌ AuthProvider: Error fetching user data:', error);
        }
      } else {
        console.log('🚀 AuthProvider: No user, resetting user data and role');
        setUserData(null);
        setRole('user');
      }
      
      console.log('🚀 AuthProvider: Setting loading to false');
      setLoading(false);
    });

    return () => {
      console.log('🚀 AuthProvider: Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const firebaseUser = await firebaseService.signIn(email, password);
      
      // Fetch user data from Firestore
      const userDataFromFirestore = await firebaseService.getUserById(firebaseUser.uid);
      if (userDataFromFirestore) {
        console.log('🚀 AuthProvider: Login - User data fetched:', userDataFromFirestore);
        console.log('🚀 AuthProvider: Login - Setting role to:', userDataFromFirestore.role);
        setUserData(userDataFromFirestore);
        setRole(userDataFromFirestore.role as UserRole);
      } else {
        console.log('🚀 AuthProvider: Login - No user data found, setting default role');
        setRole('user');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseService.signOut();
      setUser(null);
      setUserData(null);
      setRole('user');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const createUser = async (userData: Omit<FirebaseUserData, 'uid' | 'createdAt' | 'lastLoginAt'>, password: string) => {
    try {
      await firebaseService.signUp(userData, password);
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, role, loading, login, signOut, createUser }}>
      {children}
    </AuthContext.Provider>
  );
}; 