import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  type Timestamp,
  type FieldValue
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updatePassword,
  deleteUser as deleteAuthUser
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { db, auth } from '../firebase';

// User interface
export interface User {
  uid?: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'superadmin' | 'admin' | 'moderator' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  createdAt?: Timestamp | FieldValue;
  lastLoginAt?: Timestamp | FieldValue;
  profilePicture?: string;
  permissions?: {
    canManageUsers: boolean;
    canViewAnalytics: boolean;
    canEditContent: boolean;
  };
  metadata?: {
    city?: string;
    province?: string;
    registrationSource?: string;
  };
}

// Firebase service class
export class FirebaseService {
  private usersCollection = collection(db, 'users');

  // Authentication methods
  async signUp(userData: Omit<User, 'uid' | 'createdAt' | 'lastLoginAt'>, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
      const user = userCredential.user;

      const newUser: User = {
        uid: user.uid,
        ...userData,
        createdAt: serverTimestamp() as FieldValue,
        lastLoginAt: serverTimestamp() as FieldValue,
        permissions: {
          canManageUsers: userData.role === 'superadmin' || userData.role === 'admin',
          canViewAnalytics: userData.role === 'superadmin' || userData.role === 'admin' || userData.role === 'moderator',
          canEditContent: userData.role === 'superadmin' || userData.role === 'admin' || userData.role === 'moderator',
        }
      };

      await addDoc(this.usersCollection, newUser);
      return newUser;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update last login time
      await this.updateLastLogin(user.uid);
      
      return user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // User management methods
  async getAllUsers(): Promise<User[]> {
    try {
      const q = query(this.usersCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[];
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  async getUserById(uid: string): Promise<User | null> {
    try {
      const q = query(this.usersCollection, where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return {
        uid: doc.id,
        ...doc.data()
      } as User;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async createUser(userData: Omit<User, 'uid' | 'createdAt' | 'lastLoginAt'>, password: string): Promise<User> {
    try {
      // First, create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
      const authUser = userCredential.user;

      // Then, create user document in Firestore
      const newUser: User = {
        uid: authUser.uid,
        ...userData,
        createdAt: serverTimestamp() as FieldValue,
        lastLoginAt: serverTimestamp() as FieldValue,
        permissions: {
          canManageUsers: userData.role === 'superadmin' || userData.role === 'admin',
          canViewAnalytics: userData.role === 'superadmin' || userData.role === 'admin' || userData.role === 'moderator',
          canEditContent: userData.role === 'superadmin' || userData.role === 'admin' || userData.role === 'moderator',
        }
      };

      await addDoc(this.usersCollection, newUser);
      return {
        uid: authUser.uid,
        ...newUser
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(uid: string, updates: Partial<User>): Promise<void> {
    try {
      const q = query(this.usersCollection, where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('User not found');
      }
      
      const docRef = doc(db, 'users', querySnapshot.docs[0].id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      const q = query(this.usersCollection, where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('User not found in Firestore');
      }
      
      // Delete from Firestore first
      const docRef = doc(db, 'users', querySnapshot.docs[0].id);
      await deleteDoc(docRef);
      
      // Then delete from Firebase Authentication
      try {
        // Note: This requires admin SDK or the user to be signed in
        // For now, we'll just delete from Firestore and log a warning
        console.warn('User deleted from Firestore. Firebase Auth user deletion requires admin SDK.');
        console.warn('To fully delete the user, use the Firebase Admin SDK or manually delete from Firebase Console.');
      } catch (authError) {
        console.error('Error deleting user from Firebase Auth:', authError);
        // Don't throw here as the Firestore deletion was successful
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async updateLastLogin(uid: string): Promise<void> {
    try {
      const q = query(this.usersCollection, where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = doc(db, 'users', querySnapshot.docs[0].id);
        await updateDoc(docRef, {
          lastLoginAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  // Search and filter methods
  async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      const q = query(
        this.usersCollection,
        where('firstName', '>=', searchTerm),
        where('firstName', '<=', searchTerm + '\uf8ff'),
        orderBy('firstName')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[];
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  async getUsersByRole(role: User['role']): Promise<User[]> {
    try {
      const q = query(
        this.usersCollection,
        where('role', '==', role),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[];
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  }

  async getUsersByStatus(status: User['status']): Promise<User[]> {
    try {
      const q = query(
        this.usersCollection,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[];
    } catch (error) {
      console.error('Error getting users by status:', error);
      throw error;
    }
  }

  async updateUserPassword(uid: string, newPassword: string): Promise<void> {
    try {
      // Get the current user
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user is currently signed in');
      }

      // Check if the current user is trying to update their own password
      if (currentUser.uid === uid) {
        // Update current user's password
        // Note: User should be re-authenticated before calling this method
        await updatePassword(currentUser, newPassword);
      } else {
        // For updating other users' passwords, we need the Admin SDK
        // For now, we'll throw an error and suggest using the Admin SDK
        throw new Error('To update other users\' passwords, please use the Firebase Admin SDK or contact the system administrator');
      }
    } catch (error) {
      console.error('Error updating user password:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService(); 