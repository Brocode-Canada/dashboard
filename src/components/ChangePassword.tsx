import React, { useState } from 'react';
import { Modal, Form, Input, Button, Space, message } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from '../AuthContext';
import { reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

interface ChangePasswordProps {
  visible: boolean;
  onCancel: () => void;
}

export const ChangePassword: React.FC<ChangePasswordProps> = ({ visible, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handlePasswordChange = async (values: { 
    currentPassword: string; 
    newPassword: string; 
    confirmPassword: string 
  }) => {
    try {
      setLoading(true);

      if (values.newPassword !== values.confirmPassword) {
        message.error('New passwords do not match');
        return;
      }

      if (!user?.uid) {
        message.error('User not found');
        return;
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        message.error('No user is currently signed in');
        return;
      }

      // Re-authenticate the user before changing password
      const credential = EmailAuthProvider.credential(
        currentUser.email!,
        values.currentPassword
      );

      try {
        // Re-authenticate the user
        await reauthenticateWithCredential(currentUser, credential);
        
        // Now update the password
        await firebaseService.updateUserPassword(user.uid, values.newPassword);
        
        message.success('Password updated successfully');
        form.resetFields();
        onCancel();
      } catch (reauthError: any) {
        if (reauthError.code === 'auth/wrong-password') {
          message.error('Current password is incorrect');
        } else if (reauthError.code === 'auth/user-mismatch') {
          message.error('Current password is incorrect');
        } else {
          console.error('Re-authentication error:', reauthError);
          message.error('Failed to verify current password. Please try again.');
        }
      }
    } catch (error) {
      console.error('Failed to update password:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <KeyOutlined />
          Change My Password
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handlePasswordChange}
      >
        <Form.Item
          name="currentPassword"
          label="Current Password"
          rules={[
            { required: true, message: 'Please enter your current password' }
          ]}
        >
          <Input.Password placeholder="Enter current password" />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: 'Please enter new password' },
            { min: 6, message: 'Password must be at least 6 characters' }
          ]}
        >
          <Input.Password placeholder="Enter new password" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          rules={[
            { required: true, message: 'Please confirm new password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm new password" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ background: '#dc2626', borderColor: '#dc2626' }}
            >
              Update Password
            </Button>
            <Button onClick={onCancel}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}; 