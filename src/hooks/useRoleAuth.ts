import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import type { User } from '../services/firebaseService';
import type { UserRole, Permission } from '../types/auth';

interface UseRoleAuthReturn {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  userData: User | null;
  hasPermission: (permission: Permission) => boolean;
  isSuperadmin: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isUser: boolean;
  loading: boolean;
}

export const useRoleAuth = (): UseRoleAuthReturn => {
  const { user, userData, loading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (userData && userData.role) {
      setUserRole(userData.role as UserRole);
    } else {
      setUserRole(null);
    }
  }, [userData]);

  const hasPermission = (permission: Permission): boolean => {
    if (!userData || !userData.permissions) return false;
    return userData.permissions[permission] || false;
  };

  const isSuperadmin = userRole === 'superadmin';
  const isAdmin = userRole === 'admin';
  const isModerator = userRole === 'moderator';
  const isUser = userRole === 'user';

  return {
    isAuthenticated: !!user,
    userRole,
    userData,
    hasPermission,
    isSuperadmin,
    isAdmin,
    isModerator,
    isUser,
    loading
  };
}; 