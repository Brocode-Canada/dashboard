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

  const isAdmin = userRole === 'admin';
  const isSuperAdmin = userRole === 'superadmin';
  const isUser = userRole === 'user';

  return {
    isAuthenticated: !!user,
    userRole,
    userData,
    hasPermission,
    isSuperadmin: isSuperAdmin,
    isAdmin,
    isModerator: false, // Removed as per edit hint
    isUser,
    loading
  };
}; 