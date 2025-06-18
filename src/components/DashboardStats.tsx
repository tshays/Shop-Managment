
import React from 'react';
import { TrendingUp, Package, Users, Receipt } from 'lucide-react';

const DashboardStats = () => {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$45,230',
      change: '+12.5%',
      icon: TrendingUp,
      color: 'bg-green-500',
      changeColor: 'text-green-600'
    },
    {
      title: 'Products Sold',
      value: '1,234',
      change: '+8.2%',
      icon: Package,
      color: 'bg-blue-500',
      changeColor: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: '56',
      change: '+2.1%',
      icon: Users,
      color: 'bg-purple-500',
      changeColor: 'text-purple-600'
    },
    {
      title: 'Receipts Generated',
      value: '892',
      change: '+15.3%',
      icon: Receipt,
      color: 'bg-orange-500',
      changeColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
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
