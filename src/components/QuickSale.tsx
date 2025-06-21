
import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Package, Filter } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { generateSaleReceipt } from './PDFGenerator';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

const QuickSale = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState('');
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();
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

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData.filter(p => p.stock > 0)); // Only show products in stock
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const handleSale = async () => {
    if (!selectedProduct || !userProfile) return;
    
    if (quantity > selectedProduct.stock) {
      toast({
        title: "Error",
        description: "Insufficient stock available",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const totalPrice = selectedProduct.price * quantity;
      const saleTimestamp = new Date();

      // Add sale record
      await addDoc(collection(db, 'sales'), {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        unitPrice: selectedProduct.price,
        totalPrice,
        buyerName: buyerName || 'Walk-in Customer',
        sellerId: userProfile.uid,
        sellerName: userProfile.name,
        timestamp: saleTimestamp,
        date: saleTimestamp.toISOString().split('T')[0]
      });

      // Update product stock
      const productRef = doc(db, 'products', selectedProduct.id);
      await updateDoc(productRef, {
        stock: selectedProduct.stock - quantity,
        updatedAt: new Date()
      });

      // Generate PDF receipt
      generateSaleReceipt({
        productName: selectedProduct.name,
        quantity,
        unitPrice: selectedProduct.price,
        totalPrice,
        buyerName: buyerName || 'Walk-in Customer',
        timestamp: saleTimestamp
      }, userProfile);

      // Reset and refresh
      setSelectedProduct(null);
      setQuantity(1);
      setBuyerName('');
      fetchProducts();

      toast({
        title: "Success",
        description: "Sale processed and receipt generated!"
      });

    } catch (error) {
      console.error('Error processing sale:', error);
      toast({
        title: "Error",
        description: "Failed to process sale",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Product Search Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-4">
          <Package className="text-blue-600 mr-3" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Available Products</h3>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductSelect(product)}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedProduct?.id === product.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${product.price}</p>
                  <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                </div>
              </div>
            </div>
          ))}
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No products found matching your criteria
            </div>
          )}
        </div>
      </div>

      {/* Sale Processing Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-4">
          <ShoppingCart className="text-green-600 mr-3" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Process Sale</h3>
        </div>

        {selectedProduct ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Selected Product</h4>
              <p className="text-sm text-gray-600">Name: {selectedProduct.name}</p>
              <p className="text-sm text-gray-600">Category: {selectedProduct.category}</p>
              <p className="text-sm text-gray-600">Price: ${selectedProduct.price}</p>
              <p className="text-sm text-gray-600">Available Stock: {selectedProduct.stock}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                max={selectedProduct.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Enter customer name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total Amount:</span>
                <span className="text-xl font-bold text-blue-600">
                  ${(selectedProduct.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleSale}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <ShoppingCart size={16} className="mr-2" />
              {loading ? 'Processing Sale...' : 'Complete Sale & Generate Receipt'}
            </button>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Select a product from the list to process a sale</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickSale;
