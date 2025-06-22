import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, FileText, Download, Printer } from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCurrency } from '../contexts/CurrencyContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { format } from 'date-fns';

interface SaleRecord {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  buyerName: string;
  sellerName: string;
  timestamp: any;
  date: string;
  productId?: string;
}

interface CategorySummary {
  category: string;
  totalRevenue: number;
  totalQuantity: number;
  itemCount: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
}

const ReportGenerator = () => {
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<SaleRecord[]>([]);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [itemSearch, setItemSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [salesRecords, startDate, endDate, itemSearch, categoryFilter]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch products first to get categories
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      setProducts(productsData);
      const uniqueCategories = [...new Set(productsData.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);

      // Fetch all sales records
      const salesSnapshot = await getDocs(
        query(collection(db, 'sales'), orderBy('timestamp', 'desc'))
      );
      const salesData = salesSnapshot.docs.map(doc => {
        const saleData = { id: doc.id, ...doc.data() } as SaleRecord;
        
        // Find the product to get its category
        const product = productsData.find(p => p.name === saleData.productName || p.id === saleData.productId);
        if (product && product.category) {
          saleData.category = product.category;
        }
        
        return saleData;
      });

      setSalesRecords(salesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...salesRecords];

    // Filter by date range
    if (startDate || endDate) {
      filtered = filtered.filter(record => {
        const recordDate = record.timestamp?.toDate ? record.timestamp.toDate() : new Date(record.timestamp);
        if (startDate && recordDate < startDate) return false;
        if (endDate && recordDate > endDate) return false;
        return true;
      });
    }

    // Filter by item name
    if (itemSearch.trim()) {
      filtered = filtered.filter(record =>
        record.productName.toLowerCase().includes(itemSearch.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter(record => record.category === categoryFilter);
    }

    setFilteredRecords(filtered);
    generateCategorySummary(filtered);
  };

  const generateCategorySummary = (records: SaleRecord[]) => {
    const categoryMap = new Map<string, CategorySummary>();

    records.forEach(record => {
      const category = record.category || 'Uncategorized';
      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category)!;
        existing.totalRevenue += record.totalPrice;
        existing.totalQuantity += record.quantity;
        existing.itemCount += 1;
      } else {
        categoryMap.set(category, {
          category,
          totalRevenue: record.totalPrice,
          totalQuantity: record.quantity,
          itemCount: 1
        });
      }
    });

    const summary = Array.from(categoryMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
    setCategorySummary(summary);
  };

  const handleGenerateReport = () => {
    applyFilters();
    toast({
      title: "Report Generated",
      description: `Found ${filteredRecords.length} records matching your criteria`
    });
  };

  const handlePrintReport = () => {
    const printContent = document.getElementById('report-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Sales Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { text-align: center; margin-bottom: 20px; }
            .summary { margin-bottom: 30px; }
            .print-date { text-align: right; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>EthioMerkato Store</h1>
            <h2>Sales Report</h2>
          </div>
          <div class="print-date">
            <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleExportCSV = () => {
    const csvHeaders = ['Date', 'Product', 'Category', 'Quantity', 'Unit Price', 'Total Price', 'Customer', 'Seller'];
    const csvRows = filteredRecords.map(record => [
      new Date(record.timestamp?.toDate?.() || record.timestamp).toLocaleDateString(),
      record.productName,
      record.category || 'Uncategorized',
      record.quantity,
      record.unitPrice,
      record.totalPrice,
      record.buyerName || 'Walk-in Customer',
      record.sellerName
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Success",
      description: "Report exported successfully!"
    });
  };

  const totalRevenue = filteredRecords.reduce((sum, record) => sum + record.totalPrice, 0);
  const totalQuantity = filteredRecords.reduce((sum, record) => sum + record.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Select start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Select end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Item Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Item</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by product name"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleGenerateReport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText size={16} className="mr-2" />
            Generate Report
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Printer size={16} className="mr-2" />
            Print
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} className="mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div id="report-content">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-sm font-medium text-gray-600">Total Records</h4>
            <p className="text-2xl font-bold text-gray-900">{filteredRecords.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-sm font-medium text-gray-600">Total Revenue</h4>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-sm font-medium text-gray-600">Items Sold</h4>
            <p className="text-2xl font-bold text-gray-900">{totalQuantity}</p>
          </div>
        </div>

        {/* Category Summary */}
        {categorySummary.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Summary</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Items Sold</TableHead>
                  <TableHead>Total Quantity</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>% of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorySummary.map((category) => (
                  <TableRow key={category.category}>
                    <TableCell className="font-medium">{category.category}</TableCell>
                    <TableCell>{category.itemCount}</TableCell>
                    <TableCell>{category.totalQuantity}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(category.totalRevenue)}</TableCell>
                    <TableCell>
                      {totalRevenue > 0 ? ((category.totalRevenue / totalRevenue) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Detailed Records */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Records</h3>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Seller</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {new Date(record.timestamp?.toDate?.() || record.timestamp).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">{record.productName}</TableCell>
                        <TableCell>{record.category || 'Uncategorized'}</TableCell>
                        <TableCell>{record.quantity}</TableCell>
                        <TableCell>{formatCurrency(record.unitPrice)}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(record.totalPrice)}</TableCell>
                        <TableCell>{record.buyerName || 'Walk-in Customer'}</TableCell>
                        <TableCell>{record.sellerName}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No records found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
