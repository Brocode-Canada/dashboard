import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { KeyOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { useAuth } from '../AuthContext';
import { ChangePassword } from './ChangePassword';

export const Navigation: React.FC = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  console.log('🚀 Navigation: Current user role:', role);
  console.log('🚀 Navigation: User authenticated:', !!user);

  const handleSignOut = async () => {
    await signOut();
    navigate('/dashboard/signin');
  };

  const toggleMobileMenu = () => {
    console.log('🚀 Mobile menu toggle clicked, current state:', mobileMenuOpen);
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (!user) {
    // Not logged in: show public dashboard with Sign In option for admin features
  return (
      <nav className="navigation">
        <div className="nav-header">
          <div className="header-logo-title">
            <img 
              src={process.env.NODE_ENV === 'production' ? '/dashboard/brocode_logo.png' : '/brocode_logo.png'} 
              alt="Brocode Logo" 
              className="brocode-logo" 
            />
            <div style={{ marginLeft: '1rem' }}>
              <h1 style={{ 
                color: '#dc2626', 
                fontSize: '2rem', 
                fontWeight: '800', 
                margin: 0,
                textShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
                letterSpacing: '-0.5px'
              }}>
                BroCode Canada
              </h1>
              <h2 style={{ 
                color: '#6b7280', 
                fontSize: '1rem', 
                fontWeight: '500', 
                margin: '0.25rem 0 0 0',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Analytics Dashboard
              </h2>
            </div>
          </div>
          <div className="user-info">
            <Link to="/dashboard/signin" className="signout-btn" style={{ background: '#dc2626', color: '#fff', border: 'none' }}>
              Admin Sign In
            </Link>
          </div>
        </div>
        <div className="nav-links">
          <Link to="/dashboard/overview">Overview</Link>
          <Link to="/dashboard/demographics">Demographics</Link>
          <Link to="/dashboard/geography">Geography</Link>
          <Link to="/dashboard/employment">Employment</Link>
          <span style={{ color: '#9ca3af', fontSize: '0.9rem', padding: '0.5rem 1rem', borderLeft: '1px solid #e5e7eb' }}>
            📊 Public Analytics
                  </span>
                </div>
      </nav>
    );
  }

  return (
    <nav className="navigation">
      <div className="nav-header">
        <div className="header-logo-title">
          <img 
            src={process.env.NODE_ENV === 'production' ? '/dashboard/brocode_logo.png' : '/brocode_logo.png'} 
            alt="Brocode Logo" 
            className="brocode-logo" 
          />
          <div style={{ marginLeft: '1rem' }}>
            <h1 style={{ 
              color: '#dc2626', 
              fontSize: '2rem', 
              fontWeight: '800', 
              margin: 0,
              textShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
              letterSpacing: '-0.5px'
            }}>
              BroCode Canada
            </h1>
            <h2 style={{ 
              color: '#6b7280', 
              fontSize: '1rem', 
              fontWeight: '500', 
              margin: '0.25rem 0 0 0',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Admin Portal
            </h2>
          </div>
        </div>
        <div className="user-info">
          <span style={{ 
            color: '#374151', 
            fontWeight: '600', 
            marginRight: '12px',
            fontSize: '0.9rem',
            background: '#f3f4f6',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #e5e7eb'
          }}>
            {user.email} ({role})
          </span>
          <Button
            type="default"
            icon={<KeyOutlined />}
            size="small"
            onClick={() => setShowPasswordModal(true)}
            style={{ 
              background: 'transparent', 
              border: '1px solid #e5e7eb',
              color: '#374151',
              marginRight: '8px'
            }}
            title="Change Password"
          >
            Password
          </Button>
          <button onClick={handleSignOut} className="signout-btn">Sign Out</button>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            style={{ 
              background: '#dc2626', 
              color: 'white', 
              border: '2px solid #dc2626',
              borderRadius: '8px',
              padding: '8px',
              fontSize: '1.2rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
            }}
          >
            {mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <div className="nav-links desktop-nav">
        {/* Public pages - accessible to all authenticated users */}
        <Link to="/dashboard/overview">Overview</Link>
        <Link to="/dashboard/demographics">Demographics</Link>
        <Link to="/dashboard/geography">Geography</Link>
        <Link to="/dashboard/employment">Employment</Link>
        
        {/* Admin-only pages - only show for admin roles */}
        {(role === 'admin' || role === 'moderator' || role === 'superadmin') && (
          <>
            <Link to="/dashboard/members">All Members</Link>
            <Link to="/dashboard/analytics">Analytics</Link>
          </>
        )}
        
        {/* Super admin only pages */}
        {role === 'superadmin' && (
          <Link to="/dashboard/user-management">User Management</Link>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-links">
          {/* Public pages */}
          <Link to="/dashboard/overview" onClick={() => setMobileMenuOpen(false)}>Overview</Link>
          <Link to="/dashboard/demographics" onClick={() => setMobileMenuOpen(false)}>Demographics</Link>
          <Link to="/dashboard/geography" onClick={() => setMobileMenuOpen(false)}>Geography</Link>
          <Link to="/dashboard/employment" onClick={() => setMobileMenuOpen(false)}>Employment</Link>
          
          {/* Admin-only pages */}
          {(role === 'admin' || role === 'moderator' || role === 'superadmin') && (
            <>
              <Link to="/dashboard/members" onClick={() => setMobileMenuOpen(false)}>All Members</Link>
              <Link to="/dashboard/analytics" onClick={() => setMobileMenuOpen(false)}>Analytics</Link>
            </>
          )}
          
          {/* Super admin only pages */}
          {role === 'superadmin' && (
            <Link to="/dashboard/user-management" onClick={() => setMobileMenuOpen(false)}>User Management</Link>
          )}
        </div>
      </div>
      
      {/* Password Change Modal */}
      <ChangePassword 
        visible={showPasswordModal} 
        onCancel={() => setShowPasswordModal(false)} 
      />
    </nav>
  );
}; 