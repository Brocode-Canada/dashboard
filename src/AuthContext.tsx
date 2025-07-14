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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Fetch user data from Firestore
          const userDataFromFirestore = await firebaseService.getUserById(firebaseUser.uid);
          if (userDataFromFirestore) {
            setUserData(userDataFromFirestore);
            setRole(userDataFromFirestore.role as UserRole);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
        setRole('user');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const firebaseUser = await firebaseService.signIn(email, password);
      
      // Fetch user data from Firestore
      const userDataFromFirestore = await firebaseService.getUserById(firebaseUser.uid);
      if (userDataFromFirestore) {
        setUserData(userDataFromFirestore);
        setRole(userDataFromFirestore.role as UserRole);
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