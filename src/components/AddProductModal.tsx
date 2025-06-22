
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useToast } from "@/hooks/use-toast";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

const AddProductModal = ({ isOpen, onClose, onProductAdded }: AddProductModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    purchasePrice: 0,
    interestPercent: 0,
    stock: 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const categories = [
    'Mobiles',
    'Smart Phones',
    'Non-Smart Phones',
    'Laptops',
    'Computers & Desktops',
    'Mobile Accessories',
    'Glasses',
    'Covers',
    'Chargers',
    'Electrical Tools'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Validation Error", 
        description: "Please select a category",
        variant: "destructive"
      });
      return;
    }

    if (formData.purchasePrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Purchase price must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (formData.interestPercent < 0) {
      toast({
        title: "Validation Error",
        description: "Interest percentage cannot be negative",
        variant: "destructive"
      });
      return;
    }

    if (formData.stock < 0) {
      toast({
        title: "Validation Error",
        description: "Stock quantity cannot be negative",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const sellingPrice = formData.purchasePrice + (formData.purchasePrice * formData.interestPercent / 100);
      
      console.log('Adding product with data:', {
        name: formData.name,
        category: formData.category,
        purchasePrice: formData.purchasePrice,
        interestPercent: formData.interestPercent,
        price: sellingPrice,
        stock: formData.stock
      });

      await addDoc(collection(db, 'products'), {
        name: formData.name.trim(),
        category: formData.category,
        purchasePrice: formData.purchasePrice,
        interestPercent: formData.interestPercent,
        price: sellingPrice,
        stock: formData.stock,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('Product added successfully');

      // Reset form
      setFormData({
        name: '',
        category: '',
        purchasePrice: 0,
        interestPercent: 0,
        stock: 0
      });

      // Close modal and refresh products
      onClose();
      onProductAdded();

      toast({
        title: "Success",
        description: "Product added successfully!"
      });

    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Product</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter product name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Price (birr) *
            </label>
            <input
              type="number"
              value={formData.purchasePrice || ''}
              onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Percentage (%)
            </label>
            <input
              type="number"
              value={formData.interestPercent || ''}
              onChange={(e) => setFormData({ ...formData, interestPercent: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.1"
              placeholder="0.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity *
            </label>
            <input
              type="number"
              value={formData.stock || ''}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              placeholder="0"
              required
            />
          </div>

          <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
            <strong>Selling Price: birr{(formData.purchasePrice + (formData.purchasePrice * formData.interestPercent / 100)).toFixed(2)}</strong>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
