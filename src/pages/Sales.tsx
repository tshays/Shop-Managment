
import React from 'react';
import SalesInterface from '../components/SalesInterface';
import DailySalesRecords from '../components/DailySalesRecords';

const Sales = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
        <p className="text-gray-600 mt-1">Process sales and track performance.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesInterface />
        <DailySalesRecords />
      </div>
    </div>
  );
};

export default Sales;
