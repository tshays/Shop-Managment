
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, DollarSign, Package } from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('month');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    fetchReportsData();
  }, [timeframe]);

  const fetchReportsData = async () => {
    try {
      // Fetch sales data
      const salesSnapshot = await getDocs(collection(db, 'sales'));
      const sales = salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch products data
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Process sales data for charts
      const processedSalesData = processSalesData(sales, timeframe);
      const processedCategoryData = processCategoryData(sales, products);

      setSalesData(processedSalesData);
      setCategoryData(processedCategoryData);
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processSalesData = (sales: any[], timeframe: string) => {
    const grouped: { [key: string]: number } = {};

    sales.forEach(sale => {
      const date = sale.createdAt?.toDate ? sale.createdAt.toDate() : new Date(sale.createdAt);
      let key = '';

      if (timeframe === 'day') {
        key = date.toLocaleDateString();
      } else if (timeframe === 'month') {
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      } else if (timeframe === 'year') {
        key = date.getFullYear().toString();
      }

      const saleTotal = sale.totalPrice || sale.total || 0;
      grouped[key] = (grouped[key] || 0) + (typeof saleTotal === 'number' ? saleTotal : 0);
    });

    return Object.entries(grouped).map(([period, revenue]) => ({
      period,
      revenue
    })).slice(-10); // Last 10 periods
  };

  const processCategoryData = (sales: any[], products: any[]) => {
    const categoryRevenue: { [key: string]: number } = {};

    sales.forEach(sale => {
      const product = products.find(p => p.id === sale.productId);
      if (product) {
        const category = product.category || 'Unknown';
        const saleTotal = sale.totalPrice || sale.total || 0;
        categoryRevenue[category] = (categoryRevenue[category] || 0) + (typeof saleTotal === 'number' ? saleTotal : 0);
      }
    });

    return Object.entries(categoryRevenue).map(([category, revenue]) => ({
      category,
      revenue
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Analyze your business performance</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3">Loading reports...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Analyze your business performance</p>
        </div>
        
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="day">Daily</option>
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <DollarSign className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${salesData.reduce((sum, item: any) => sum + item.revenue, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Package className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categoryData.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <TrendingUp className="text-purple-600 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Growth</p>
              <p className="text-2xl font-bold text-gray-900">+12.5%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Calendar className="text-orange-600 mr-3" size={24} />
            <div>
              <p className="text-sm font-medium text-gray-600">Timeframe</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">{timeframe}ly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Category Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryData.map((category: any, index) => {
                const totalRevenue = categoryData.reduce((sum: number, item: any) => sum + item.revenue, 0);
                const percentage = totalRevenue > 0 ? (category.revenue / totalRevenue) * 100 : 0;
                
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {category.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      ${category.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {percentage.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
