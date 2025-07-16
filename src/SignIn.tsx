import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { message } from 'antd';

const SignIn: React.FC = () => {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  console.log('SignIn component rendered:', { user, loading, error });

  React.useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard/overview');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    try {
      if (!email || !password) {
        setError('Email and password are required');
        return;
      }
      
      await login(email, password);
      message.success('Successfully signed in!');
      // Redirect handled by useEffect
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/user-not-found') {
        setError('User not found. Please check your email or contact an administrator.');
      } else if (firebaseError.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Sign in failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      width: '100vw',
      maxWidth: '100%',
      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999
    }}>
      <form onSubmit={handleSubmit} style={{ 
        background: '#fff', 
        padding: '2rem', 
        borderRadius: '16px', 
        boxShadow: '0 8px 32px rgba(220,38,38,0.15)', 
        minWidth: 320, 
        maxWidth: 360, 
        width: '90%',
        margin: '0 auto'
      }}>
        <h1 style={{ color: '#dc2626', textAlign: 'center', marginBottom: '1.5rem', fontSize: '2rem', fontWeight: 'bold' }}>Sign In</h1>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: '#b91c1c', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              borderRadius: 8, 
              border: '2px solid #fecaca', 
              marginTop: 4, 
              fontSize: 16,
              boxSizing: 'border-box'
            }}
            placeholder="Enter your email"
            autoFocus
            disabled={submitting}
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: '#b91c1c', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                paddingRight: '3rem',
                borderRadius: 8, 
                border: '2px solid #fecaca', 
                marginTop: 4, 
                fontSize: 16,
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                color: '#666',
                padding: '0.25rem',
                marginTop: '4px'
              }}
              disabled={submitting}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        {error && <div style={{ color: '#dc2626', marginBottom: '1rem', textAlign: 'center', fontSize: 14 }}>{error}</div>}
        <button
          type="submit"
          disabled={submitting || loading}
          style={{ 
            width: '100%', 
            background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)', 
            color: '#fff', 
            fontWeight: 700, 
            fontSize: 18, 
            border: 'none', 
            borderRadius: 8, 
            padding: '0.75rem', 
            cursor: submitting || loading ? 'not-allowed' : 'pointer', 
            boxShadow: '0 2px 8px rgba(220,38,38,0.10)',
            opacity: submitting || loading ? 0.7 : 1,
            boxSizing: 'border-box'
          }}
        >
          {submitting ? 'Signing In...' : 'Sign In'}
        </button>
        
        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: 12, color: '#666' }}>
          <p>Need an account? Contact your administrator.</p>
        </div>
      </form>
    </div>
  );
};

export default SignIn; 