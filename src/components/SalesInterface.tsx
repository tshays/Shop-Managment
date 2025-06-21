import React, { useState, useEffect } from 'react';
import { ShoppingCart, Receipt, User } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { generateSaleReceipt } from './PDFGenerator';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

const SalesInterface = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleSale = async () => {
    if (!selectedProduct || !userProfile) return;
    
    setLoading(true);
    try {
      const selectedProductData = products.find(p => p.id === selectedProduct);
      if (!selectedProductData) return;

      const totalPrice = selectedProductData.price * quantity;
      const saleTimestamp = new Date();

      // Add sale record to Firebase
      await addDoc(collection(db, 'sales'), {
        productId: selectedProduct,
        productName: selectedProductData.name,
        quantity,
        unitPrice: selectedProductData.price,
        totalPrice,
        buyerName: buyerName || 'Walk-in Customer',
        sellerId: userProfile.uid,
        sellerName: userProfile.name,
        timestamp: saleTimestamp,
        date: saleTimestamp.toISOString().split('T')[0]
      });

      // Update product stock
      const productRef = doc(db, 'products', selectedProduct);
      await updateDoc(productRef, {
        stock: selectedProductData.stock - quantity
      });

      // Generate PDF receipt
      generateSaleReceipt({
        productName: selectedProductData.name,
        quantity,
        unitPrice: selectedProductData.price,
        totalPrice,
        buyerName: buyerName || 'Walk-in Customer',
        timestamp: saleTimestamp
      }, userProfile);

      // Reset form
      setSelectedProduct('');
      setQuantity(1);
      setBuyerName('');

      // Refresh products to show updated stock
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);

      alert('Sale processed successfully and receipt generated!');
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Error processing sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedProductData = products.find(p => p.id === selectedProduct);
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
            disabled={!selectedProduct || loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <ShoppingCart size={16} className="mr-2" />
            {loading ? 'Processing...' : 'Process Sale'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesInterface;
