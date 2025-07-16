import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { firebaseService, type User as FirebaseUserData } from './services/firebaseService';
import { Table, Select, Button, Popconfirm, message, Tag, Modal, Form, Input, Space, Card, Statistic, Row, Col } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useDarkMode } from './hooks/useDarkMode';

// Import Navigation component from App.tsx
const Navigation = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/dashboard/signin');
  };

  if (!user) {
    return (
      <nav className="navigation">
        <div className="nav-header">
          <div className="header-logo-title">
            <img src="/brocode_logo.png" alt="Brocode Logo" className="brocode-logo" />
            <div>
              <h1 style={{ color: '#222' }}>Brocode Canada</h1>
              <h2 className="admin-dashboard-title" style={{ color: '#222', background: 'none', borderBottom: '3px solid #b91c1c' }}>Admin Dashboard</h2>
            </div>
          </div>
          <div className="user-info">
            <Link to="/signin" className="signout-btn" style={{ background: '#dc2626', color: '#fff', border: 'none' }}>Sign In</Link>
          </div>
        </div>
        <div className="nav-links">
          <Link to="/overview">Overview</Link>
          <Link to="/demographics">Demographics</Link>
          <Link to="/geography">Geography</Link>
          <Link to="/employment">Employment</Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navigation">
      <div className="nav-header">
        <div className="header-logo-title">
          <img src="/brocode_logo.png" alt="Brocode Logo" className="brocode-logo" />
      <div>
            <h1 style={{ color: '#222' }}>Brocode Canada</h1>
            <h2 className="admin-dashboard-title" style={{ color: '#222', background: 'none', borderBottom: '3px solid #b91c1c' }}>Admin Dashboard</h2>
          </div>
        </div>
        <div className="user-info">
          <span style={{ color: '#222', fontWeight: 600, marginRight: 12 }}>{user.email} ({role})</span>
          <button onClick={handleSignOut} className="signout-btn">Sign Out</button>
        </div>
      </div>
      <div className="nav-links">
        <Link to="/overview">Overview</Link>
        <Link to="/demographics">Demographics</Link>
        <Link to="/geography">Geography</Link>
        <Link to="/employment">Employment</Link>
        {(role === 'admin' || role === 'moderator' || role === 'superadmin') && (
          <Link to="/members">All Members</Link>
        )}
        {(role === 'admin' || role === 'moderator' || role === 'superadmin') && <Link to="/analytics">Analytics</Link>}
        {(role === 'admin' || role === 'superadmin') && <Link to="/user-management">User Management</Link>}
      </div>
    </nav>
  );
};

const roleOptions = [
  { value: 'superadmin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'user', label: 'User' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
];

const UserManagement: React.FC = () => {
  const { user: currentUser, role: currentRole } = useAuth();
  const navigate = useNavigate();
  // Use the role directly since it's already properly typed
  const userRole = currentRole;
  
  // Helper function to check if user can delete another user
  const canDeleteUser = (targetRole: string, currentRole: string) => {
    if (targetRole === 'superadmin') return currentRole === 'superadmin';
    if (targetRole === 'admin') return currentRole === 'superadmin' || currentRole === 'admin';
    return true; // Can delete regular users and moderators
  };
  const [users, setUsers] = useState<FirebaseUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<FirebaseUserData | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await firebaseService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (uid: string, newRole: string) => {
    try {
      await firebaseService.updateUser(uid, { role: newRole as 'superadmin' | 'admin' | 'moderator' | 'user' });
      setUsers(users => users.map(u => u.uid === uid ? { ...u, role: newRole as 'superadmin' | 'admin' | 'moderator' | 'user' } : u));
      message.success('Role updated successfully');
    } catch (error) {
      console.error('Failed to update role:', error);
      message.error('Failed to update role');
    }
  };

  const handleStatusChange = async (uid: string, newStatus: string) => {
    try {
      await firebaseService.updateUser(uid, { status: newStatus as 'active' | 'inactive' | 'suspended' });
      setUsers(users => users.map(u => u.uid === uid ? { ...u, status: newStatus as 'active' | 'inactive' | 'suspended' } : u));
      message.success('Status updated successfully');
    } catch (error) {
      console.error('Failed to update status:', error);
      message.error('Failed to update status');
    }
  };

  const handleDelete = async (uid: string) => {
    try {
      // Find the user to get more details for error messages
      const userToDelete = users.find(u => u.uid === uid);
      if (!userToDelete) {
        message.error('User not found');
        return;
      }

      await firebaseService.deleteUser(uid);
      setUsers(users => users.filter(u => u.uid !== uid));
      message.success(`User ${userToDelete.firstName} ${userToDelete.lastName} deleted successfully`);
    } catch (error) {
      console.error('Failed to delete user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      message.error(`Failed to delete user: ${errorMessage}`);
    }
  };

  const handleCreateUser = async (values: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    phoneNumber?: string;
    role: string;
    status: string;
    city?: string;
    province?: string;
  }) => {
    try {
      const newUser = {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        role: values.role as 'admin' | 'moderator' | 'user',
        status: values.status as 'active' | 'inactive' | 'suspended',
        metadata: {
          city: values.city,
          province: values.province,
          registrationSource: 'admin_created'
        }
      };

      await firebaseService.createUser(newUser, values.password);
      message.success('User created successfully');
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
      message.error('Failed to create user');
    }
  };

  const handleEditUser = async (values: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role: string;
    status: string;
    city?: string;
    province?: string;
  }) => {
    if (!editingUser) return;
    
    try {
      await firebaseService.updateUser(editingUser.uid!, {
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        role: values.role as 'admin' | 'moderator' | 'user',
        status: values.status as 'active' | 'inactive' | 'suspended',
        metadata: {
          city: values.city,
          province: values.province
        }
      });
      
      message.success('User updated successfully');
      setEditModalVisible(false);
      setEditingUser(null);
      editForm.resetFields();
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      message.error('Failed to update user');
    }
  };

  const openEditModal = (user: FirebaseUserData) => {
    setEditingUser(user);
    editForm.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
      city: user.metadata?.city,
      province: user.metadata?.province
    });
    setEditModalVisible(true);
  };

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (record: FirebaseUserData) => (
        <div>
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
                          onClick={() => navigate(`/dashboard/member-details/${record.uid}`)}
            title="Click to view member details"
          >
            {record.firstName} {record.lastName}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone: string) => phone || '-',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (_: unknown, record: FirebaseUserData) => (
        <Select
          value={record.role}
          onChange={val => handleRoleChange(record.uid!, val)}
          disabled={record.uid === currentUser?.uid || (record.role === 'admin' && currentRole !== 'admin')}
          style={{ minWidth: 120 }}
          options={roleOptions}
        />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_: unknown, record: FirebaseUserData) => (
        <Select
          value={record.status}
          onChange={val => handleStatusChange(record.uid!, val)}
          style={{ minWidth: 120 }}
          options={statusOptions}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: FirebaseUserData) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title={
              record.uid === currentUser?.uid
                ? "You cannot delete yourself"
                : record.role === 'superadmin'
                  ? "Superadmins cannot be deleted by anyone, including themselves."
                  : record.role === 'admin' && !canDeleteUser(record.role, userRole)
                    ? "Only superadmins can delete admins."
                    : !canDeleteUser(record.role, userRole)
                      ? "You don't have permission to delete this user."
                      : "Are you sure to delete this user?"
            }
            onConfirm={() => handleDelete(record.uid!)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={
                record.uid === currentUser?.uid ||
                !canDeleteUser(record.role, userRole)
              }
              size="small"
              title={
                record.uid === currentUser?.uid
                  ? "You cannot delete yourself"
                  : record.role === 'superadmin'
                    ? "Superadmins cannot be deleted by anyone, including themselves."
                    : record.role === 'admin' && !canDeleteUser(record.role, userRole)
                      ? "Only superadmins can delete admins."
                      : !canDeleteUser(record.role, userRole)
                        ? "You don't have permission to delete this user."
                        : "Delete user"
              }
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admin: users.filter(u => u.role === 'admin').length,
    inactive: users.filter(u => u.status === 'inactive').length,
  };

  return (
    <div className="page">
      <Navigation />
      
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1>👥 User Management</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
            style={{ background: '#dc2626', borderColor: '#dc2626' }}
          >
            Add User
          </Button>
        </div>

        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Users"
                value={stats.total}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Active Users"
                value={stats.active}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Admins"
                value={stats.admin}
                valueStyle={{ color: '#dc2626' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Inactive Users"
                value={stats.inactive}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        <Table
          dataSource={users}
          columns={columns}
          rowKey="uid"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
          }}
          bordered
        />

        <div style={{ marginTop: 24, color: '#b91c1c', fontSize: 14 }}>
          <Tag color="red">Admins cannot be deleted or demoted by non-admins. You cannot delete yourself.</Tag>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button onClick={toggleDarkMode} className="dark-mode-toggle" title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            {isDarkMode ? '\u2600\ufe0f' : '\ud83c\udf19'}
          </button>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        title="Create New User"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateUser}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Please enter last name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Phone Number"
          >
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select role' }]}
              >
                <Select options={roleOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select options={statusOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label="City"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="province"
                label="Province"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" style={{ background: '#dc2626', borderColor: '#dc2626' }}>
                Create User
              </Button>
              <Button onClick={() => setCreateModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingUser(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditUser}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Please enter last name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="phoneNumber"
            label="Phone Number"
          >
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select role' }]}
              >
                <Select options={roleOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select options={statusOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label="City"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="province"
                label="Province"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" style={{ background: '#dc2626', borderColor: '#dc2626' }}>
                Update User
              </Button>
              <Button onClick={() => {
                setEditModalVisible(false);
                setEditingUser(null);
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement; 