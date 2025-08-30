import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

interface ProfileData {
  username: string;
  email: string;
  full_name: string;
  country: string;
  timezone: string;
}

interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    username: '',
    email: '',
    full_name: '',
    country: '',
    timezone: ''
  });
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      
      if (response && response.data && response.data.success) {
        const userData = response.data.user;
        setProfileData({
          username: userData.username || '',
          email: userData.email || '',
          full_name: userData.full_name || '',
          country: userData.country || '',
          timezone: userData.timezone || 'UTC'
        });
        setError(null);
      } else {
        setError('Failed to load profile data');
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await authAPI.updateProfile(profileData);
      
      if (response && response.data && response.data.success) {
        setSuccess('Profile updated successfully!');
        // Update the user context with new data
        // You might need to add a method to update user context
      } else {
        setError('Failed to update profile');
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.new_password)) {
      setError('New password must contain at least one lowercase letter, one uppercase letter, and one number');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await authAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      
      if (response && response.data && response.data.success) {
        setSuccess('Password changed successfully!');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setShowPasswordModal(false);
      } else {
        setError('Failed to change password');
      }
    } catch (err: any) {
      console.error('Error changing password:', err);
      if (err.response?.status === 400) {
        setError('Current password is incorrect');
      } else {
        setError('Failed to change password');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user?.username) {
      setError('Please type your username exactly to confirm deletion');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Call the delete account API
      await authAPI.deleteAccount();
      
      // Logout and redirect
      logout();
      window.location.href = '/register';
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Profile</h2>
          <p className="text-purple-200 mb-4">{error}</p>
          <button 
            onClick={fetchProfile}
            className="btn-primary inline-flex items-center glow-purple hover-lift"
          >
            <span className="mr-2">🔄</span>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="gamified-card border-b border-purple-200 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">👤 Profile Settings</h1>
              <p className="text-purple-200">Manage your account information and preferences</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="xp-counter">
                <div className="text-sm text-purple-200">User ID</div>
                <div className="text-2xl font-bold">#{user?.id}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-500/20 border border-green-300/30 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-300">{success}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-300/30 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="gamified-card mb-6">
          <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-purple-200">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full px-3 py-2 border border-purple-300/30 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-purple-500/10 text-white placeholder-purple-300"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-purple-200">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full px-3 py-2 border border-purple-300/30 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-purple-500/10 text-white placeholder-purple-300"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-purple-200">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={profileData.full_name}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full px-3 py-2 border border-purple-300/30 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-purple-500/10 text-white placeholder-purple-300"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-purple-200">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={profileData.country}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full px-3 py-2 border border-purple-300/30 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-purple-500/10 text-white placeholder-purple-300"
                />
              </div>
              
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-purple-200">
                  Timezone
                </label>
                <select
                  id="timezone"
                  name="timezone"
                  value={profileData.timezone}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full px-3 py-2 border border-purple-300/30 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-purple-500/10 text-white"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Shanghai">Shanghai</option>
                  <option value="Asia/Kolkata">Mumbai</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary inline-flex items-center glow-purple hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '💾 Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Account Actions */}
        <div className="gamified-card">
          <h2 className="text-xl font-semibold text-white mb-6">Account Actions</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-purple-300/30 rounded-lg bg-purple-500/10">
              <div>
                <h3 className="text-lg font-medium text-white">Change Password</h3>
                <p className="text-sm text-purple-200">Update your account password</p>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="btn-primary inline-flex items-center glow-purple hover-lift"
              >
                🔐 Change Password
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-red-300/30 rounded-lg bg-red-500/10">
              <div>
                <h3 className="text-lg font-medium text-white">Delete Account</h3>
                <p className="text-sm text-red-300">Permanently delete your account and all data</p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 glow-purple hover-lift"
              >
                🗑️ Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 6 characters with lowercase, uppercase, and number
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Account</h3>
              <p className="text-sm text-gray-500 mb-4">
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type your username <span className="font-bold">{user?.username}</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your username"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={saving || deleteConfirmation !== user?.username}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
