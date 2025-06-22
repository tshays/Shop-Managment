
import React from 'react';
import ReportGenerator from '../components/ReportGenerator';

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate detailed sales reports with filters</p>
        </div>
      </div>

      <div className="space-y-8">
        <ReportGenerator />
      </div>
    </div>
  );
};

export default Reports;
