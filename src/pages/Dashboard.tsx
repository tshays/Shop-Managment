
import React from 'react';
import DashboardStats from '../components/DashboardStats';
import SalesChart from '../components/SalesChart';
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div>
          <SalesInterface />
        </div>
      </div>
      
      <ProductTable />
    </div>
  );
};

export default Dashboard;
