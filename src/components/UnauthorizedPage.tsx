import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const { user, role } = useAuth();
  const isAuthenticated = !!user;
  const userRole = role;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Current Access Level
              </h3>
              <div className="flex justify-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  userRole === 'admin' ? 'bg-blue-100 text-blue-800' :
                  userRole === 'user' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Guest'}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                What you can do:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {isAuthenticated ? (
                  <>
                    <li>• Contact an administrator to request access</li>
                    <li>• Navigate to pages you have permission to access</li>
                    <li>• Check your current permissions in your profile</li>
                  </>
                ) : (
                  <>
                    <li>• Sign in to access the dashboard</li>
                    <li>• Contact support if you need an account</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/profile"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Profile
              </Link>
            </>
          ) : (
            <Link
              to="/signin"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}; 