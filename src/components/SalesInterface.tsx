
import React, { useState } from 'react';
import { ShoppingCart, Receipt, User } from 'lucide-react';

const SalesInterface = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState('');

  const products = [
    { id: 1, name: 'iPhone 14 Pro', price: 920, stock: 25 },
    { id: 2, name: 'Samsung Galaxy S23', price: 826, stock: 15 },
    { id: 3, name: 'MacBook Pro 16"', price: 2240, stock: 8 },
    { id: 4, name: 'Phone Case - Clear', price: 20, stock: 50 }
  ];

  const handleSale = () => {
    console.log('Processing sale:', { selectedProduct, quantity, buyerName });
    // Here you would integrate with your backend to process the sale
  };

  const selectedProductData = products.find(p => p.id.toString() === selectedProduct);
  const totalPrice = selectedProductData ? selectedProductData.price * quantity : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-6">
        <ShoppingCart className="text-blue-600 mr-3" size={24} />
        <h3 className="text-lg font-semibold text-gray-900">Process Sale</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Product
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a product...</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - ${product.price} (Stock: {product.stock})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            max={selectedProductData?.stock || 1}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buyer Name (Optional)
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Enter buyer name"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {selectedProductData && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Sale Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Product:</span>
                <span>{selectedProductData.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Unit Price:</span>
                <span>${selectedProductData.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span>{quantity}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleSale}
            disabled={!selectedProduct}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <ShoppingCart size={16} className="mr-2" />
            Process Sale
          </button>
          <button
            disabled={!selectedProduct}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Receipt size={16} className="mr-2" />
            Generate Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesInterface;
