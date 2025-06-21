
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Sun, Moon, DollarSign } from 'lucide-react';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState('Br');

  useEffect(() => {
    // Load saved settings from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedCurrency = localStorage.getItem('currency') || 'Br';
    
    setDarkMode(savedDarkMode);
    setCurrency(savedCurrency);
    
    // Apply dark mode to document
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: newCurrency }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Customize your application preferences.</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center">
            <SettingsIcon className="text-blue-600 mr-3" size={24} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance & Display</h3>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {darkMode ? (
                <Moon className="text-blue-600 mr-3" size={20} />
              ) : (
                <Sun className="text-yellow-600 mr-3" size={20} />
              )}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Theme</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {darkMode ? 'Dark mode is enabled' : 'Light mode is enabled'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                darkMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Currency Selection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="text-green-600 mr-3" size={20} />
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Currency</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Choose your preferred currency symbol
                </p>
              </div>
            </div>
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Br">Ethiopian Birr (Br)</option>
              <option value="$">Dollar ($)</option>
              <option value="₹">Rupee (₹)</option>
              <option value="€">Euro (€)</option>
              <option value="£">Pound (£)</option>
              <option value="¥">Yen (¥)</option>
              <option value="₦">Naira (₦)</option>
              <option value="R">Rand (R)</option>
              <option value="₨">Pakistani Rupee (₨)</option>
              <option value="৳">Taka (৳)</option>
              <option value="₪">Shekel (₪)</option>
              <option value="₽">Ruble (₽)</option>
              <option value="₩">Won (₩)</option>
              <option value="¢">Cent (¢)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
