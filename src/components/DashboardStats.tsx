
import React, { useEffect, useState } from 'react';
import { TrendingUp, Package, Users, Receipt } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    productsSold: 0,
    activeUsers: 0,
    receiptsGenerated: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch products
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Fetch sales
        const salesSnapshot = await getDocs(collection(db, 'sales'));
        const sales = salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Calculate stats
        const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
        const productsSold = sales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
        const activeUsers = users.length;
        const receiptsGenerated = sales.length;
        
        setStats({
          totalRevenue,
          productsSold,
          activeUsers,
          receiptsGenerated
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: '+12.5%',
      icon: TrendingUp,
      color: 'bg-green-500',
      changeColor: 'text-green-600'
    },
    {
      title: 'Products Sold',
      value: stats.productsSold.toLocaleString(),
      change: '+8.2%',
      icon: Package,
      color: 'bg-blue-500',
      changeColor: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toString(),
      change: '+2.1%',
      icon: Users,
      color: 'bg-purple-500',
      changeColor: 'text-purple-600'
    },
    {
      title: 'Receipts Generated',
      value: stats.receiptsGenerated.toString(),
      change: '+15.3%',
      icon: Receipt,
      color: 'bg-orange-500',
      changeColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className={`text-sm mt-1 ${stat.changeColor}`}>
                {stat.change} from last month
              </p>
            </div>
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="text-white" size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
