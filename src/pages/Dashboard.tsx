
import React from 'react';
import DashboardStats from '../components/DashboardStats';
import ProductTable from '../components/ProductTable';
import SalesInterface from '../components/SalesInterface';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening in your store.</p>
      </div>
      
      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SalesInterface />
        </div>
        <div>
          <ProductTable />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
