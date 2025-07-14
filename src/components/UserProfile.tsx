import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useRoleAuth } from '../hooks/useRoleAuth';

export const UserProfile: React.FC = () => {
  const { user, userData, signOut } = useAuth();
  const { userRole, isAdmin, isModerator } = useRoleAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const getRoleBadgeColor = () => {
    if (isAdmin) return 'bg-red-100 text-red-800';
    if (isModerator) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getRoleDisplayName = () => {
    if (isAdmin) return 'Administrator';
    if (isModerator) return 'Moderator';
    return 'User';
  };

  if (!user || !userData) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {userData.profilePicture ? (
            <img
              className="h-12 w-12 rounded-full"
              src={userData.profilePicture}
              alt={`${userData.firstName} ${userData.lastName}`}
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {userData.firstName} {userData.lastName}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {userData.email}
          </p>
          <div className="flex items-center mt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor()}`}>
              {getRoleDisplayName()}
            </span>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningOut ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing out...
              </>
            ) : (
              'Sign out'
            )}
          </button>
        </div>
      </div>

      {/* User Details */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
            <dd className="text-sm text-gray-900">
              {userData.phoneNumber || 'Not provided'}
            </dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="text-sm text-gray-900">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                userData.status === 'active' ? 'bg-green-100 text-green-800' :
                userData.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>
                {userData.status.charAt(0).toUpperCase() + userData.status.slice(1)}
              </span>
            </dd>
          </div>

          {userData.metadata && (
            <>
              {userData.metadata.city && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">City</dt>
                  <dd className="text-sm text-gray-900">{userData.metadata.city}</dd>
                </div>
              )}
              
              {userData.metadata.province && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Province</dt>
                  <dd className="text-sm text-gray-900">{userData.metadata.province}</dd>
                </div>
              )}
            </>
          )}
        </dl>
      </div>

      {/* Permissions */}
      {userData.permissions && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Permissions</h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={userData.permissions.canManageUsers}
                disabled
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Manage Users</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={userData.permissions.canViewAnalytics}
                disabled
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">View Analytics</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={userData.permissions.canEditContent}
                disabled
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Edit Content</label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 