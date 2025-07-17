import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Button, Modal } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import SignIn from './SignIn';
import UserManagement from './UserManagement';
import MemberDetails from './MemberDetails';
import CSVImport from './components/CSVImport';
import { Navigation } from './components/Navigation';

// import { AdvancedAnalytics } from './components/AdvancedAnalytics';

type UserRole = 'superadmin' | 'admin' | 'moderator' | 'user';

const COLORS = ['#dc2626', '#b91c1c', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5'];

function getUnique(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}



// Test component to verify routing and role-based access
const TestPage = () => {
  const { user, role } = useAuth();
  console.log('🚀 TestPage: Component rendered');
  console.log('🚀 TestPage: User role:', role);
  console.log('🚀 TestPage: User:', user?.email);
  
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>🧪 Test Page</h1>
      <p>If you can see this, routing is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <p>User: {user?.email}</p>
      <p>Role: {role}</p>
      <p>Admin access: {(role === 'admin' || role === 'moderator' || role === 'superadmin') ? 'Yes' : 'No'}</p>
      <p>Super admin access: {(role === 'admin' || role === 'superadmin') ? 'Yes' : 'No'}</p>
    </div>
  );
};

// Custom hook to manage dashboard data and operations
function useDashboardData() {
  console.log('🚀 useDashboardData: Hook initialized');
  
  const { user } = useAuth(); // Get the current user from auth context
  const [data, setData] = useState<Record<string, string | number>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // CRUD state
  const [editingMember, setEditingMember] = useState<Record<string, string | number> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState<Record<string, string>>({
    name: '',
    email: '',
    phone_number: '',
    'City & Province?': '',
    'Age Group?': '',
    'Occupation / Job Title?': '',
    'Industry / Field of Work?': '',
    'Are you self-employed, working for a company, or a student?': '',
    'Nearest Intersection? (eg. Hurontario St & Eglinton Ave)': '',
    'Briefly describe what you do or are passionate about?': '',
    'What do you hope to gain from joining Bro Code Canada? (Select all that apply) ': '',
    'How did you hear about BroCode Canada?': '',
    'Did you follow us on Instagram? https://shorturl.at/eFvMX': '',
    'Did you like our Facebook page? https://shorturl.at/KmR5d': ''
  });

  // Table state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState({
    city: '',
    ageGroup: '',
    employment: '',
    intersection: ''
  });

  useEffect(() => {
    console.log('🚀 useDashboardData: useEffect triggered, user:', user ? 'authenticated' : 'not authenticated');
    
    if (!user) {
      console.log('🚀 useDashboardData: No user, setting empty data and showing auth message');
      setData([]);
      setLoading(false);
      setError('You must be signed in to view member data. Please sign in to access the dashboard.');
      return;
    }

    setLoading(true);
    setError(null);
    
    console.log('🚀 useDashboardData: Setting up Firestore listener...');
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(
      collection(db, 'members'),
      (snapshot) => {
        console.log('🚀 useDashboardData: Firestore data received, count:', snapshot.docs.length);
        const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setData(members);
        setLoading(false);
      },
      (err) => {
        console.error('❌ useDashboardData: Firestore error:', err);
        setError(`Failed to load data from Firestore: ${err.message}`);
        setLoading(false);
        
        // If it's a permission error, show a more user-friendly message
        if (err.code === 'permission-denied') {
          setError('Data access requires authentication. Please sign in to view member data.');
        }
      }
    );

    // Cleanup subscription
    return () => {
      console.log('🚀 useDashboardData: Cleaning up Firestore listener');
      unsubscribe();
    };
  }, [user]); // Add user as dependency

  // CRUD Functions
  const addMember = async (memberData: Record<string, string>) => {
    try {
      await addDoc(collection(db, 'members'), {
        ...memberData,
        created_at: new Date().toISOString()
      });
      setShowAddForm(false);
      setNewMember({
        name: '',
        email: '',
        phone_number: '',
        'City & Province?': '',
        'Age Group?': '',
        'Occupation / Job Title?': '',
        'Industry / Field of Work?': '',
        'Are you self-employed, working for a company, or a student?': '',
        'Nearest Intersection? (eg. Hurontario St & Eglinton Ave)': '',
        'Briefly describe what you do or are passionate about?': '',
        'What do you hope to gain from joining Bro Code Canada? (Select all that apply) ': '',
        'How did you hear about BroCode Canada?': '',
        'Did you follow us on Instagram? https://shorturl.at/eFvMX': '',
        'Did you like our Facebook page? https://shorturl.at/KmR5d': ''
      });
    } catch (err) {
      console.error('Error adding member:', err);
      alert('Failed to add member');
    }
  };

  const updateMember = async (memberId: string, memberData: Record<string, string | number>) => {
    try {
      const memberRef = doc(db, 'members', memberId);
      await updateDoc(memberRef, memberData);
      setEditingMember(null);
    } catch (err) {
      console.error('Error updating member:', err);
      alert('Failed to update member');
    }
  };

  const deleteMember = async (memberId: string) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        const memberRef = doc(db, 'members', memberId);
        await deleteDoc(memberRef);
      } catch (err) {
        console.error('Error deleting member:', err);
        alert('Failed to delete member');
      }
    }
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPageNum(1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPageNum(page);
  };

  return {
    data,
    loading,
    error,
    editingMember,
    setEditingMember,
    showAddForm,
    setShowAddForm,
    newMember,
    setNewMember,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    currentPageNum,
    pageSize,
    setPageSize,
    filters,
    setFilters,
    addMember,
    updateMember,
    deleteMember,
    handleSort,
    handlePageChange
  };
}

// Navigation component moved to separate file

// Page Components
const OverviewPage = () => {
  console.log('🚀 OverviewPage component loaded');
  const { data, loading, error } = useDashboardData();
  
  console.log('🚀 OverviewPage: useDashboardData result:', { dataLength: data.length, loading, error });
  
  if (loading) {
    console.log('🚀 OverviewPage: Showing loading state');
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '6px solid #fecaca',
          borderTop: '6px solid #dc2626',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '2rem'
        }}></div>
        <p style={{
          color: '#dc2626',
          fontSize: '1.2rem',
          fontWeight: '600',
          margin: 0,
          textAlign: 'center'
        }}>
          Loading BroCode Canada Data...
        </p>
      </div>
    );
  }

  if (error) {
    console.log('🚀 OverviewPage: Showing error state:', error);
    return (
      <div className="page">
        <Navigation />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{
            background: '#fef2f2',
            border: '2px solid #dc2626',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px'
          }}>
            <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>🔐 Authentication Required</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{error}</p>
            <div>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                To view member data and analytics, please sign in with your admin credentials.
              </p>
              <button 
                onClick={() => window.location.href = '/dashboard/signin'}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#b91c1c'}
                onMouseOut={(e) => e.currentTarget.style.background = '#dc2626'}
              >
                Sign In to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('🚀 OverviewPage: Rendering dashboard with data length:', data.length);

  // Basic Stats
  const totalMembers = data.length;
  const uniqueCities = getUnique(data.map((d) => String(d['City & Province?'] || '')));
  
  // Employment Status
  const selfEmployed = data.filter((d) => String(d['Are you self-employed, working for a company, or a student?'] || '').toLowerCase().includes('self')).length;
  const company = data.filter((d) => String(d['Are you self-employed, working for a company, or a student?'] || '').toLowerCase().includes('company')).length;
  const student = data.filter((d) => String(d['Are you self-employed, working for a company, or a student?'] || '').toLowerCase().includes('student')).length;
  
  // Social Media Engagement
  const instagram = data.filter((d) => String(d['Did you follow us on Instagram? https://shorturl.at/eFvMX'] || '').toLowerCase() === 'yes').length;
  const facebook = data.filter((d) => String(d['Did you like our Facebook page? https://shorturl.at/KmR5d'] || '').toLowerCase() === 'yes').length;
  
  // Recent Members
  const recentMembers = data.filter((d) => {
    const date = new Date(String(d.created_at || ''));
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 30;
  }).length;

  // Monthly Growth Data
  const monthlyData = data.reduce((acc, member) => {
    const date = new Date(String(member.created_at || ''));
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[monthYear] = (Number(acc[monthYear]) || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const growthData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month,
      members: count,
    }));

  return (
    <div className="page">
      <Navigation />
      <h1>📊 Brocode Canada Dashboard Overview</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>👥 Total Members</h3>
          <div className="stat-number">{totalMembers}</div>
        </div>
        <div className="stat-card">
          <h3>🌍 Unique Cities</h3>
          <div className="stat-number">{uniqueCities.length}</div>
        </div>
        <div className="stat-card">
          <h3>📈 New Members (30 days)</h3>
          <div className="stat-number">{recentMembers}</div>
        </div>
        <div className="stat-card">
          <h3>📱 Social Engagement</h3>
          <div className="stat-number">{instagram + facebook}</div>
        </div>
        <div className="stat-card">
          <h3>💼 Self-Employed</h3>
          <div className="stat-number">{selfEmployed}</div>
        </div>
        <div className="stat-card">
          <h3>🎓 Students</h3>
          <div className="stat-number">{student}</div>
        </div>
        <div className="stat-card">
          <h3>🏢 Company Employees</h3>
          <div className="stat-number">{company}</div>
        </div>
        <div className="stat-card">
          <h3>📸 Instagram Followers</h3>
          <div className="stat-number">{instagram}</div>
        </div>
      </div>

      <div className="chart-container">
        <h2>📈 Member Growth Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={growthData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [value, 'New Members']} />
            <Line type="monotone" dataKey="members" stroke="#1890ff" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const DemographicsPage = () => {
  const { data, loading, error } = useDashboardData();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '6px solid #fecaca',
          borderTop: '6px solid #dc2626',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '2rem'
        }}></div>
        <p style={{
          color: '#dc2626',
          fontSize: '1.2rem',
          fontWeight: '600',
          margin: 0,
          textAlign: 'center'
        }}>
          Loading BroCode Canada Data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Navigation />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{
            background: '#fef2f2',
            border: '2px solid #dc2626',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px'
          }}>
            <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>🔐 Authentication Required</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{error}</p>
            <div>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                To view member data and analytics, please sign in with your admin credentials.
              </p>
              <button 
                onClick={() => window.location.href = '/dashboard/signin'}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#b91c1c'}
                onMouseOut={(e) => e.currentTarget.style.background = '#dc2626'}
              >
                Sign In to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ageGroups = getUnique(data.map((d) => String(d['Age Group?'] || '')));
  const occupationStats = getUnique(data.map((d) => String(d['Occupation / Job Title?'] || '')));
  const industryStats = getUnique(data.map((d) => String(d['Industry / Field of Work?'] || '')));

  // Chart Data
  const ageGroupCounts = ageGroups.map((group) => ({
    name: group,
    value: data.filter((d) => String(d['Age Group?'] || '') === group).length,
  }));

  const occupationCounts = occupationStats.map((occ) => ({
    name: occ,
    value: data.filter((d) => String(d['Occupation / Job Title?'] || '') === occ).length,
  })).sort((a, b) => b.value - a.value).slice(0, 10);

  const industryCounts = industryStats.map((industry) => ({
    name: industry,
    value: data.filter((d) => String(d['Industry / Field of Work?'] || '') === industry).length,
  })).sort((a, b) => b.value - a.value).slice(0, 8);

  return (
    <div className="page">
      <Navigation />
      <h1>👥 Demographics Analysis</h1>
      
      <div className="charts-grid">
        <div className="chart-card">
          <h3>🎂 Age Group Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={ageGroupCounts} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={100} 
                label={({ name, percent }: { name: string; percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                              {ageGroupCounts.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Members']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>💼 Top Occupations</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={occupationCounts} margin={{ left: 10, right: 10, top: 10, bottom: 50 }}>
              <XAxis dataKey="name" stroke="#262626" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#262626" />
              <Bar dataKey="value" fill="#dc2626" />
              <Tooltip formatter={(value) => [value, 'Members']} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>🏭 Top Industries</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={industryCounts} margin={{ left: 10, right: 10, top: 10, bottom: 50 }}>
              <XAxis dataKey="name" stroke="#262626" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#262626" />
              <Bar dataKey="value" fill="#b91c1c" />
              <Tooltip formatter={(value) => [value, 'Members']} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const GeographyPage = () => {
  const { data, loading, error } = useDashboardData();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '6px solid #fecaca',
          borderTop: '6px solid #dc2626',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '2rem'
        }}></div>
        <p style={{
          color: '#dc2626',
          fontSize: '1.2rem',
          fontWeight: '600',
          margin: 0,
          textAlign: 'center'
        }}>
          Loading BroCode Canada Data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Navigation />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{
            background: '#fef2f2',
            border: '2px solid #dc2626',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px'
          }}>
            <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>🔐 Authentication Required</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{error}</p>
            <div>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                To view member data and analytics, please sign in with your admin credentials.
              </p>
              <button 
                onClick={() => window.location.href = '/dashboard/signin'}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#b91c1c'}
                onMouseOut={(e) => e.currentTarget.style.background = '#dc2626'}
              >
                Sign In to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const uniqueCities = getUnique(data.map((d) => String(d['City & Province?'] || '')));
  
  const cityCounts = uniqueCities.map((city) => ({
    name: city,
    value: data.filter((d) => String(d['City & Province?'] || '') === city).length,
  })).sort((a, b) => b.value - a.value).slice(0, 10);

  return (
    <div className="page">
      <Navigation />
      <h1>🌍 Geographic Distribution</h1>
      
      <div className="chart-container">
        <h3>🏙️ Top Cities by Member Count</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={cityCounts} margin={{ left: 10, right: 10, top: 10, bottom: 50 }}>
            <XAxis dataKey="name" stroke="#262626" angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="#262626" />
            <Bar dataKey="value" fill="#dc2626" />
            <Tooltip formatter={(value) => [value, 'Members']} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const EmploymentPage = () => {
  const { data, loading, error } = useDashboardData();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '6px solid #fecaca',
          borderTop: '6px solid #dc2626',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '2rem'
        }}></div>
        <p style={{
          color: '#dc2626',
          fontSize: '1.2rem',
          fontWeight: '600',
          margin: 0,
          textAlign: 'center'
        }}>
          Loading BroCode Canada Data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  // Employment Status
  const selfEmployed = data.filter((d) => String(d['Are you self-employed, working for a company, or a student?'] || '').toLowerCase().includes('self')).length;
  const company = data.filter((d) => String(d['Are you self-employed, working for a company, or a student?'] || '').toLowerCase().includes('company')).length;
  const student = data.filter((d) => String(d['Are you self-employed, working for a company, or a student?'] || '').toLowerCase().includes('student')).length;

  const employmentData = [
    { name: 'Self-Employed', value: selfEmployed },
    { name: 'Company Employee', value: company },
    { name: 'Student', value: student }
  ];

  return (
    <div className="page">
      <Navigation />
      <h1>💼 Employment Analysis</h1>
      
      <div className="chart-container">
        <h3>👔 Employment Status Distribution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie 
              data={employmentData} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              outerRadius={150} 
              label={({ name, percent }: { name: string; percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
            >
              {employmentData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, 'Members']} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const MembersPage = () => {
  const { data, loading, error, setEditingMember, searchTerm, setSearchTerm, sortField, sortDirection, currentPageNum, pageSize, deleteMember, handleSort, handlePageChange } = useDashboardData();
  const { role } = useAuth();
  const navigate = useNavigate();
  const [showCSVModal, setShowCSVModal] = useState(false);


  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '6px solid #fecaca',
          borderTop: '6px solid #dc2626',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '2rem'
        }}></div>
        <p style={{
          color: '#dc2626',
          fontSize: '1.2rem',
          fontWeight: '600',
          margin: 0,
          textAlign: 'center'
        }}>
          Loading BroCode Canada Data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  // Filter and sort data for table
  const filteredData = data.filter((member) => {
    const matchesSearch = 
      String(member.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(member.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(member.phone_number || '').includes(searchTerm) ||
      String(member['City & Province?'] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(member['Occupation / Job Title?'] || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle date sorting
    if (sortField === 'created_at') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    // Handle string sorting
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPageNum - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  return (
    <div className="page">
      <Navigation />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>👥 All Members</h1>
        
        {/* CSV Import Button - Only show for admin and superadmin */}
        {(role === 'admin' || role === 'superadmin') && (
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => setShowCSVModal(true)}
            style={{
                      background: '#dc2626',
        borderColor: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            Import CSV
          </Button>
        )}
      </div>
      
      <div className="table-controls">
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table className="members-table">
          <thead>
            <tr>
              <th 
                onClick={() => handleSort('name')}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #fecaca',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  transition: 'none'
                }}
              >
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('email')}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #fecaca',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  transition: 'none'
                }}
              >
                Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('phone_number')}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #fecaca',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  transition: 'none'
                }}
              >
                Phone {sortField === 'phone_number' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('City & Province?')}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #fecaca',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  transition: 'none'
                }}
              >
                City {sortField === 'City & Province?' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('Age Group?')}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #fecaca',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  transition: 'none'
                }}
              >
                Age Group {sortField === 'Age Group?' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('Occupation / Job Title?')}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #fecaca',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  transition: 'none'
                }}
              >
                Occupation {sortField === 'Occupation / Job Title?' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  fontWeight: '600',
                  padding: '0.75rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #fecaca',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  transition: 'none'
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((member) => (
              <tr key={member.id}>
                <td style={{ color: '#000' }}>
                  <div 
                    style={{ 
                      fontWeight: 600, 
                      cursor: 'pointer',
                      color: '#dc2626',
                      textDecoration: 'underline',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#b91c1c';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#dc2626';
                    }}
                    onClick={() => navigate(`/dashboard/member-details/${member.id}`)}
                    title="Click to view member details"
                  >
                    {member.name}
                  </div>
                </td>
                <td style={{ color: '#000' }}>{member.email}</td>
                <td style={{ color: '#000' }}>{member.phone_number}</td>
                <td style={{ color: '#000' }}>{member['City & Province?']}</td>
                <td style={{ color: '#000' }}>{member['Age Group?']}</td>
                <td style={{ color: '#000' }}>{member['Occupation / Job Title?'] || 'Not specified'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => setEditingMember(member)}
                      disabled={role !== 'admin' && role !== 'superadmin'}
                      style={{
                        background: (role === 'admin' || role === 'superadmin')
                          ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
                          : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: (role === 'admin' || role === 'superadmin') ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: (role === 'admin' || role === 'superadmin')
                          ? '0 2px 4px rgba(59, 130, 246, 0.2)' 
                          : '0 2px 4px rgba(156, 163, 175, 0.2)',
                        transition: 'all 0.2s ease',
                        minWidth: '60px',
                        justifyContent: 'center',
                        opacity: (role === 'admin' || role === 'superadmin') ? 1 : 0.6
                      }}
                      onMouseEnter={(e) => {
                        if (role === 'admin' || role === 'superadmin') {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (role === 'admin' || role === 'superadmin') {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2)';
                        }
                      }}
                      title={(role !== 'admin' && role !== 'superadmin') ? 'Only admins and superadmins can edit members' : 'Edit member'}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => deleteMember(member.id as string)}
                      disabled={role !== 'admin' && role !== 'superadmin'}
                      style={{
                        background: (role === 'admin' || role === 'superadmin')
                          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                          : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: (role === 'admin' || role === 'superadmin') ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: (role === 'admin' || role === 'superadmin')
                          ? '0 2px 4px rgba(239, 68, 68, 0.2)' 
                          : '0 2px 4px rgba(156, 163, 175, 0.2)',
                        transition: 'all 0.2s ease',
                        minWidth: '60px',
                        justifyContent: 'center',
                        opacity: (role === 'admin' || role === 'superadmin') ? 1 : 0.6
                      }}
                      onMouseEnter={(e) => {
                        if (role === 'admin' || role === 'superadmin') {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (role === 'admin' || role === 'superadmin') {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.2)';
                        }
                      }}
                      title={(role !== 'admin' && role !== 'superadmin') ? 'Only admins and superadmins can delete members' : 'Delete member'}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button 
          onClick={() => handlePageChange(currentPageNum - 1)} 
          disabled={currentPageNum === 1}
        >
          Previous
        </button>
        <span>Page {currentPageNum} of {totalPages}</span>
        <button 
          onClick={() => handlePageChange(currentPageNum + 1)} 
          disabled={currentPageNum === totalPages}
        >
          Next
        </button>
      </div>

      {/* CSV Import Modal */}
      <Modal
        title={
          <span style={{ 
            color: '#dc2626',
            fontSize: '1.3rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FileTextOutlined />
            Import Members from CSV
          </span>
        }
        open={showCSVModal}
        onCancel={() => setShowCSVModal(false)}
        footer={null}
        width={900}
        style={{
          top: 20
        }}
        bodyStyle={{
          padding: '1.5rem',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
      >
        <CSVImport />
      </Modal>
    </div>
  );
};

const AnalyticsPage = () => {
  const { data, loading, error } = useDashboardData();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '6px solid #fecaca',
          borderTop: '6px solid #dc2626',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '2rem'
        }}></div>
        <p style={{
          color: '#dc2626',
          fontSize: '1.2rem',
          fontWeight: '600',
          margin: 0,
          textAlign: 'center'
        }}>
          Loading BroCode Canada Data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  // Calculate analytics data
  const totalMembers = data.length;
  const uniqueCities = getUnique(data.map((d) => String(d['City & Province?'] || '')));
  const ageGroups = getUnique(data.map((d) => String(d['Age Group?'] || '')));
  const occupationStats = getUnique(data.map((d) => String(d['Occupation / Job Title?'] || '')));
  const industryStats = getUnique(data.map((d) => String(d['Industry / Field of Work?'] || '')));

  // Employment Status
  const selfEmployed = data.filter((d) => String(d['Are you self-employed, working for a company, or a student?'] || '').toLowerCase().includes('self')).length;
  const company = data.filter((d) => String(d['Are you self-employed, working for a company, or a student?'] || '').toLowerCase().includes('company')).length;
  const student = data.filter((d) => String(d['Are you self-employed, working for a company, or a student?'] || '').toLowerCase().includes('student')).length;

  // Social Media Engagement
  const instagram = data.filter((d) => String(d['Did you follow us on Instagram? https://shorturl.at/eFvMX'] || '').toLowerCase() === 'yes').length;
  const facebook = data.filter((d) => String(d['Did you like our Facebook page? https://shorturl.at/KmR5d'] || '').toLowerCase() === 'yes').length;

  // Monthly Growth Data
  const monthlyData = data.reduce((acc, member) => {
    const date = new Date(String(member.created_at || ''));
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[monthYear] = (Number(acc[monthYear]) || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const growthData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month,
      members: count,
    }));

  // Chart Data
  const ageGroupCounts = ageGroups.map((group) => ({
    name: group,
    value: data.filter((d) => String(d['Age Group?'] || '') === group).length,
  }));

  const cityCounts = uniqueCities.map((city) => ({
    name: city,
    value: data.filter((d) => String(d['City & Province?'] || '') === city).length,
  })).sort((a, b) => b.value - a.value).slice(0, 10);

  const occupationCounts = occupationStats.map((occ) => ({
    name: occ,
    value: data.filter((d) => String(d['Occupation / Job Title?'] || '') === occ).length,
  })).sort((a, b) => b.value - a.value).slice(0, 10);

  const industryCounts = industryStats.map((industry) => ({
    name: industry,
    value: data.filter((d) => String(d['Industry / Field of Work?'] || '') === industry).length,
  })).sort((a, b) => b.value - a.value).slice(0, 8);

  return (
    <div className="page">
      <Navigation />
      <h1>📊 Advanced Analytics Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>👥 Total Members</h3>
          <div className="stat-number">{totalMembers}</div>
        </div>
        <div className="stat-card">
          <h3>🌍 Unique Cities</h3>
          <div className="stat-number">{uniqueCities.length}</div>
        </div>
        <div className="stat-card">
          <h3>📱 Social Engagement</h3>
          <div className="stat-number">{instagram + facebook}</div>
        </div>
        <div className="stat-card">
          <h3>💼 Self-Employed</h3>
          <div className="stat-number">{selfEmployed}</div>
        </div>
        <div className="stat-card">
          <h3>🎓 Students</h3>
          <div className="stat-number">{student}</div>
        </div>
        <div className="stat-card">
          <h3>🏢 Company Employees</h3>
          <div className="stat-number">{company}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>📈 Member Growth Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [value, 'New Members']} />
              <Line type="monotone" dataKey="members" stroke="#1890ff" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>🎂 Age Group Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={ageGroupCounts} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={100} 
                label={({ name, percent }: { name: string; percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {ageGroupCounts.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Members']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>🏙️ Top Cities by Member Count</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cityCounts} margin={{ left: 10, right: 10, top: 10, bottom: 50 }}>
              <XAxis dataKey="name" stroke="#262626" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#262626" />
              <Bar dataKey="value" fill="#dc2626" />
              <Tooltip formatter={(value) => [value, 'Members']} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>💼 Top Occupations</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={occupationCounts} margin={{ left: 10, right: 10, top: 10, bottom: 50 }}>
              <XAxis dataKey="name" stroke="#262626" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#262626" />
              <Bar dataKey="value" fill="#b91c1c" />
              <Tooltip formatter={(value) => [value, 'Members']} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>🏭 Top Industries</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={industryCounts} margin={{ left: 10, right: 10, top: 10, bottom: 50 }}>
              <XAxis dataKey="name" stroke="#262626" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#262626" />
              <Bar dataKey="value" fill="#ef4444" />
              <Tooltip formatter={(value) => [value, 'Members']} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="analytics-insights">
        <h2>🔍 Key Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>📊 Growth Trends</h4>
            <p>Member growth has been {growthData.length > 1 ? 'consistent' : 'steady'} over the past {growthData.length} months.</p>
          </div>
          <div className="insight-card">
            <h4>🌍 Geographic Distribution</h4>
            <p>Members are spread across {uniqueCities.length} different cities, with the majority concentrated in major urban areas.</p>
          </div>
          <div className="insight-card">
            <h4>💼 Employment Patterns</h4>
            <p>{selfEmployed > company && selfEmployed > student ? 'Self-employed' : company > student ? 'Company employees' : 'Students'} make up the largest employment category.</p>
          </div>
          <div className="insight-card">
            <h4>📱 Social Media Engagement</h4>
            <p>Social media engagement rate is {Math.round(((instagram + facebook) / totalMembers) * 100)}% across all platforms.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Role-based route protection for admin features
const RequireAuth = ({ allowedRoles }: { allowedRoles: UserRole[] }) => {
  const { user, role, loading } = useAuth();
  
  console.log('🚀 RequireAuth: Checking access for roles:', allowedRoles);
  console.log('🚀 RequireAuth: Current user role:', role);
  console.log('🚀 RequireAuth: User authenticated:', !!user);
  if (loading) return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '6px solid #fecaca',
        borderTop: '6px solid #dc2626',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '2rem'
      }}></div>
      <p style={{
        color: '#dc2626',
        fontSize: '1.2rem',
        fontWeight: '600',
        margin: 0,
        textAlign: 'center'
      }}>
        Loading BroCode Canada Dashboard...
      </p>
    </div>
  );
  if (!user) return <Navigate to="/dashboard/signin" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/dashboard/overview" replace />;
  return <Outlet />;
};

function DashboardRoutes() {
  console.log('🚀 DashboardRoutes component loaded');
  console.log('🚀 DashboardRoutes: Current pathname:', window.location.pathname);
  
  return (
    <Routes>
      {/* Test route */}
      <Route path="test" element={<TestPage />} />
      
      {/* Public pages - accessible to everyone */}
      <Route path="overview" element={<OverviewPage />} />
      <Route path="demographics" element={<DemographicsPage />} />
      <Route path="geography" element={<GeographyPage />} />
      <Route path="employment" element={<EmploymentPage />} />
      
      {/* Admin-only pages - require authentication */}
      <Route path="members" element={<RequireAuth allowedRoles={['admin', 'moderator', 'superadmin']} />}>
        <Route path="" element={<MembersPage />} />
      </Route>
      <Route path="analytics" element={<RequireAuth allowedRoles={['admin', 'moderator', 'superadmin']} />}>
        <Route path="" element={<AnalyticsPage />} />
      </Route>
      <Route path="user-management" element={<RequireAuth allowedRoles={['superadmin']} />}>
        <Route path="" element={<UserManagement />} />
      </Route>
      <Route path="member-details/:memberId" element={<RequireAuth allowedRoles={['admin', 'moderator', 'superadmin']} />}>
        <Route path="" element={<MemberDetails />} />
      </Route>
      
      {/* Default route - redirect to overview */}
      <Route index element={<Navigate to="overview" replace />} />
      {/* Fallback route - redirect to overview for any unknown path */}
      <Route path="*" element={<Navigate to="overview" replace />} />
    </Routes>
  );
}

function AppRoutes() {
  console.log('🚀 AppRoutes component loaded');
  console.log('🚀 AppRoutes: Current location:', window.location.href);
  
  try {
    return (
        <Router>
          <Routes>
            {/* Redirect root to dashboard overview */}
            <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="/signin" element={<Navigate to="/dashboard/signin" replace />} />
            <Route path="/dashboard/signin" element={<SignIn />} />
            {/* Dashboard routes - public access for analytics, protected for admin features */}
            <Route path="/dashboard/*" element={<DashboardRoutes />} />
            {/* Fallback for any other routes */}
            <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
          </Routes>
        </Router>
    );
  } catch (error) {
    console.error('❌ AppRoutes: Error in render:', error);
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>🚨 Error in AppRoutes</h1>
        <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
}

export default AppRoutes;
