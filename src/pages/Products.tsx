
import React from 'react';
import ProductTable from '../components/ProductTable';

const Products = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
        <p className="text-gray-600 mt-1">Manage your inventory and product pricing.</p>
      </div>
      
      <ProductTable />
    </div>
  );
};

export default Products;
