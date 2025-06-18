
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  User,
  Receipt,
  Database,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  userRole: 'admin' | 'seller';
}

const Sidebar = ({ userRole }: SidebarProps) => {
  const location = useLocation();
  const { logout, userProfile } = useAuth();

  const adminMenuItems = [
    { icon: Database, label: 'Dashboard', path: '/' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: ShoppingCart, label: 'Sales', path: '/sales' },
    { icon: Receipt, label: 'Reports', path: '/reports' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const sellerMenuItems = [
    { icon: Database, label: 'Dashboard', path: '/' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: ShoppingCart, label: 'Sales', path: '/sales' },
    { icon: Receipt, label: 'Receipts', path: '/receipts' },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : sellerMenuItems;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="bg-slate-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-center">MobiShop Admin</h1>
        <p className="text-slate-400 text-sm text-center mt-1">Electronics Store</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
        
        <div className="flex items-center space-x-3 px-4 py-3 bg-slate-800 rounded-lg">
          <User size={20} className="text-slate-400" />
          <div>
            <p className="text-sm font-medium">{userProfile?.name || 'User'}</p>
            <p className="text-xs text-slate-400 capitalize">{userRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
