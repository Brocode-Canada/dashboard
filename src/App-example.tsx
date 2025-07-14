// This is an example file - not used in production
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SignInForm } from './components/SignInForm';
import { Navigation } from './components/Navigation';
import { UnauthorizedPage } from './components/UnauthorizedPage';
import { UserProfile } from './components/UserProfile';
import { AdvancedAnalytics } from './components/AdvancedAnalytics';

// Import your existing components
import UserManagement from './UserManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            {/* Public Routes */}
            <Route path="/signin" element={<SignInForm />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
                    <p>Welcome to your dashboard!</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute requiredPermission="canViewAnalytics">
                  <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4">Analytics</h1>
                    <p>Basic analytics dashboard content here.</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/advanced-analytics" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdvancedAnalytics />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/users" 
              element={
                <ProtectedRoute requiredPermission="canManageUsers">
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/content" 
              element={
                <ProtectedRoute requiredPermission="canEditContent">
                  <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4">Content Management</h1>
                    <p>Content management interface here.</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4">Settings</h1>
                    <p>Admin settings here.</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <div className="p-6">
                    <UserProfile />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 