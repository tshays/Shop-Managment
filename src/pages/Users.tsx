
import React from 'react';
import UserManagement from '../components/UserManagement';

const Users = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage system users and their roles.</p>
      </div>
      
      <UserManagement />
    </div>
  );
};

export default Users;
