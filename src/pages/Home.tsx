
import React from 'react';
import QuickSale from '../components/QuickSale';

const Home = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quick Sale</h1>
        <p className="text-gray-600 mt-1">Search products and process sales quickly.</p>
      </div>
      
      <QuickSale />
    </div>
  );
};

export default Home;
