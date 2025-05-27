import React from 'react';
import { useAuth } from '../context/AuthContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  
  const systemName = 'MIP - Smart Inventory';
  const version = '1.0.0';
  const lastUpdated = '2025-05-25';
  
  // Static system information
  const systemInfo = [
    { label: 'System Name', value: systemName },
    { label: 'Version', value: version },
    { label: 'Environment', value: process.env.NODE_ENV || 'development' },
    { label: 'Backend API', value: 'http://localhost:5000/api' },
    { label: 'Last Updated', value: lastUpdated }
  ];
  
  // Static security information
  const securityInfo = [
    { label: 'Password Requirements', value: 'Minimum 8 characters with uppercase, lowercase, numbers, and special characters' },
    { label: 'Session Timeout', value: '30 minutes of inactivity' },
    { label: 'API Authentication', value: 'JWT (JSON Web Token)' },
    { label: 'User Roles', value: 'Admin, OJT' }
  ];
  
  // Static usage guidelines
  const usageGuidelines = [
    'Always log out when you finish using the system',
    'Keep your password confidential and change it regularly',
    'Report any suspicious activity to the IT department',
    'Regularly backup critical data',
    'Do not share your account with others'
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>System Information</h1>
        <p className='mt-1 text-sm text-gray-500'>
          Important details about the inventory management system
        </p>
      </div>

      {/* Information Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* System Information */}
        <div className='bg-white shadow rounded-lg p-6'>
          <h2 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
            <span className='mr-2'>⚙️</span> System Details
          </h2>
          <div className='space-y-4'>
            {systemInfo.map((item, index) => (
              <div key={index} className='flex flex-col border-b border-gray-100 pb-2'>
                <span className='text-sm font-medium text-gray-700'>{item.label}</span>
                <span className='text-sm text-gray-900'>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Information */}
        <div className='bg-white shadow rounded-lg p-6'>
          <h2 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
            <span className='mr-2'>🔒</span> Security Configuration
          </h2>
          <div className='space-y-4'>
            {securityInfo.map((item, index) => (
              <div key={index} className='flex flex-col border-b border-gray-100 pb-2'>
                <span className='text-sm font-medium text-gray-700'>{item.label}</span>
                <span className='text-sm text-gray-900'>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Usage Guidelines */}
      <div className='bg-white shadow rounded-lg p-6'>
        <h2 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
          <span className='mr-2'>📋</span> Usage Guidelines
        </h2>
        <ul className='list-disc pl-5 space-y-2'>
          {usageGuidelines.map((guideline, index) => (
            <li key={index} className='text-sm text-gray-700'>{guideline}</li>
          ))}
        </ul>
      </div>

      {/* Current User */}
      <div className='bg-white shadow rounded-lg p-6'>
        <h2 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
          <span className='mr-2'>👤</span> Current Session
        </h2>
        <div className='space-y-4'>
          <div className='flex flex-col border-b border-gray-100 pb-2'>
            <span className='text-sm font-medium text-gray-700'>Username</span>
            <span className='text-sm text-gray-900'>{user?.username}</span>
          </div>
          <div className='flex flex-col border-b border-gray-100 pb-2'>
            <span className='text-sm font-medium text-gray-700'>Role</span>
            <span className='text-sm text-gray-900 capitalize'>{user?.role}</span>
          </div>
          <div className='flex flex-col border-b border-gray-100 pb-2'>
            <span className='text-sm font-medium text-gray-700'>Login Time</span>
            <span className='text-sm text-gray-900'>{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
