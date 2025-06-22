
import React from 'react';
import ReportGenerator from '../components/ReportGenerator';
import SellerDailySales from '../components/SellerDailySales';

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate detailed sales reports with filters and seller performance</p>
        </div>
      </div>

      <div className="space-y-8">
        <ReportGenerator />
        <SellerDailySales />
      </div>
    </div>
  );
};

export default Reports;
