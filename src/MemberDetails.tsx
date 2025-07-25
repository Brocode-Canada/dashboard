import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, message, Tag } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, CalendarOutlined, BankOutlined, TeamOutlined } from '@ant-design/icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';


import { Navigation } from './components/Navigation';

interface MemberData {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  'Age Group?': string;
  'Are you self-employed, working for a company, or a student?': string;
  'Briefly describe what you do or are passionate about?': string;
  'City & Province?': string;
  'Did you follow us on Instagram? https://shorturl.at/eFvMX': string;
  'Did you like our Facebook page? https://shorturl.at/KmR5d': string;
  'How did you hear about BroCode Canada?': string;
  'Industry / Field of Work?': string;
  'Nearest Intersection? (eg. Hurontario St & Eglinton Ave)': string;
  'Occupation / Job Title?': string;
  'What do you hope to gain from joining Bro Code Canada? (Select all that apply) ': string;
  created_at: string;
}

const MemberDetails: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();

  
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (memberId) {
      fetchMemberDetails();
    }
  }, [memberId]);

  const fetchMemberDetails = async () => {
    try {
      setLoading(true);
      if (!memberId) {
        setError('Member ID is required');
        return;
      }
      
      const memberDoc = doc(db, 'members', memberId);
      const memberSnapshot = await getDoc(memberDoc);
      
      if (memberSnapshot.exists()) {
        setMember({ id: memberSnapshot.id, ...memberSnapshot.data() } as MemberData);
      } else {
        setError('Member not found');
        message.error('Member not found');
      }
    } catch (err) {
      console.error('Error fetching member details:', err);
      setError('Failed to load member details');
      message.error('Failed to load member details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getGainFromJoining = (gains: string) => {
    if (!gains) return 'Not specified';
    return gains.split(',').map(gain => gain.trim()).join(', ');
  };

  const getSocialMediaStatus = (status: string) => {
    return status === 'Yes' ? (
      <Tag color="green">✓ Followed</Tag>
    ) : (
      <Tag color="red">✗ Not Followed</Tag>
    );
  };

  if (loading) {
    return (
      <div className="page" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        maxWidth: '100vw',
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
          Loading member details...
        </p>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="page" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        maxWidth: '100vw',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}>
        <p style={{ 
          color: '#dc2626',
          fontSize: '1.2rem',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          {error || 'Member not found'}
        </p>
        <Button 
          type="primary" 
          onClick={() => navigate('/dashboard/members')}
          style={{ background: '#dc2626', borderColor: '#dc2626' }}
        >
          Back to All Members
        </Button>
      </div>
    );
  }

  return (
    <div className="page" style={{
      minHeight: '100vh',
      width: '100vw',
      maxWidth: '100vw',
      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      padding: '2rem',
      margin: 0,
      borderRadius: 0
    }}>
      {/* Navigation Component */}
      <Navigation />
      
      {/* Navigation Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          color: '#dc2626',
          fontSize: '2rem',
          fontWeight: '700',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <UserOutlined />
          Member Details
        </h1>
      </div>

      {/* Member Information Cards */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Basic Information */}
        <Card 
          title={
            <span style={{ 
              color: '#dc2626',
              fontSize: '1.3rem',
              fontWeight: '600'
            }}>
              <UserOutlined style={{ marginRight: '0.5rem' }} />
              Basic Information
            </span>
          }
          style={{
            marginBottom: '1.5rem',
            background: 'white',
            border: '2px solid #fecaca',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)'
          }}
        >
          <Descriptions 
            column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
            labelStyle={{ 
              color: '#374151',
              fontWeight: '600'
            }}
            contentStyle={{ 
              color: '#1f2937'
            }}
          >
            <Descriptions.Item label="Full Name" span={2}>
              <strong>{member.name}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="First Name">
              {member.first_name}
            </Descriptions.Item>
            <Descriptions.Item label="Last Name">
              {member.last_name}
            </Descriptions.Item>
            <Descriptions.Item label="Email" span={2}>
              <MailOutlined style={{ marginRight: '0.5rem' }} />
              {member.email}
            </Descriptions.Item>
            <Descriptions.Item label="Phone Number">
              <PhoneOutlined style={{ marginRight: '0.5rem' }} />
              {member.phone_number}
            </Descriptions.Item>
            <Descriptions.Item label="Age Group">
              <CalendarOutlined style={{ marginRight: '0.5rem' }} />
              {member['Age Group?'] || 'Not specified'}
            </Descriptions.Item>
            <Descriptions.Item label="Registration Date">
              <CalendarOutlined style={{ marginRight: '0.5rem' }} />
              {formatDate(member.created_at)}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Location Information */}
        <Card 
          title={
            <span style={{ 
              color: '#dc2626',
              fontSize: '1.3rem',
              fontWeight: '600'
            }}>
              <EnvironmentOutlined style={{ marginRight: '0.5rem' }} />
              Location Information
            </span>
          }
          style={{
            marginBottom: '1.5rem',
            background: 'white',
            border: '2px solid #fecaca',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)'
          }}
        >
          <Descriptions 
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
            labelStyle={{ 
              color: '#374151',
              fontWeight: '600'
            }}
            contentStyle={{ 
              color: '#1f2937'
            }}
          >
            <Descriptions.Item label="City & Province">
              <EnvironmentOutlined style={{ marginRight: '0.5rem' }} />
              {member['City & Province?'] || 'Not specified'}
            </Descriptions.Item>
            <Descriptions.Item label="Nearest Intersection">
              <EnvironmentOutlined style={{ marginRight: '0.5rem' }} />
              {member['Nearest Intersection? (eg. Hurontario St & Eglinton Ave)'] || 'Not specified'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Professional Information */}
        <Card 
          title={
            <span style={{ 
              color: '#dc2626',
              fontSize: '1.3rem',
              fontWeight: '600'
            }}>
              <BankOutlined style={{ marginRight: '0.5rem' }} />
              Professional Information
            </span>
          }
          style={{
            marginBottom: '1.5rem',
            background: 'white',
            border: '2px solid #fecaca',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)'
          }}
        >
          <Descriptions 
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
            labelStyle={{ 
              color: '#374151',
              fontWeight: '600'
            }}
            contentStyle={{ 
              color: '#1f2937'
            }}
          >
            <Descriptions.Item label="Employment Status">
              {member['Are you self-employed, working for a company, or a student?'] || 'Not specified'}
            </Descriptions.Item>
            <Descriptions.Item label="Occupation/Job Title">
              {member['Occupation / Job Title?'] || 'Not specified'}
            </Descriptions.Item>
            <Descriptions.Item label="Industry/Field of Work">
              {member['Industry / Field of Work?'] || 'Not specified'}
            </Descriptions.Item>
            <Descriptions.Item label="Passion/Interests">
              {member['Briefly describe what you do or are passionate about?'] || 'Not specified'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Engagement & Goals */}
        <Card 
          title={
            <span style={{ 
              color: '#dc2626',
              fontSize: '1.3rem',
              fontWeight: '600'
            }}>
              <TeamOutlined style={{ marginRight: '0.5rem' }} />
              Engagement & Goals
            </span>
          }
          style={{
            marginBottom: '1.5rem',
            background: 'white',
            border: '2px solid #fecaca',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)'
          }}
        >
          <Descriptions 
            column={1}
            labelStyle={{ 
              color: '#374151',
              fontWeight: '600'
            }}
            contentStyle={{ 
              color: '#1f2937'
            }}
          >
            <Descriptions.Item label="How did you hear about BroCode Canada?">
              {member['How did you hear about BroCode Canada?'] || 'Not specified'}
            </Descriptions.Item>
            <Descriptions.Item label="What do you hope to gain from joining BroCode Canada?">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {getGainFromJoining(member['What do you hope to gain from joining Bro Code Canada? (Select all that apply) ']).split(', ').map((gain, index) => (
                  <Tag key={index} color="red">
                    {gain}
                  </Tag>
                ))}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Instagram Follow">
              {getSocialMediaStatus(member['Did you follow us on Instagram? https://shorturl.at/eFvMX'])}
            </Descriptions.Item>
            <Descriptions.Item label="Facebook Like">
              {getSocialMediaStatus(member['Did you like our Facebook page? https://shorturl.at/KmR5d'])}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
};

export default MemberDetails; 