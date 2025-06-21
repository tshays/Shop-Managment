
import React, { useState, useEffect } from 'react';
import { Printer, Paperclip } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCurrency } from '../contexts/CurrencyContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useToast } from "@/hooks/use-toast";

interface SaleRecord {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  buyerName: string;
  sellerName: string;
  timestamp: any;
  date: string;
}

const DailySalesRecords = () => {
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();

  useEffect(() => {
    fetchSalesRecords();
  }, []);

  const fetchSalesRecords = async () => {
    try {
      const salesQuery = query(
        collection(db, 'sales'),
        orderBy('timestamp', 'desc')
      );
      const salesSnapshot = await getDocs(salesQuery);
      const salesData = salesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SaleRecord[];
      setSalesRecords(salesData);
    } catch (error) {
      console.error('Error fetching sales records:', error);
      toast({
        title: "Error",
        description: "Failed to load sales records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('sales-records-table');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Daily Sales Records</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { text-align: center; margin-bottom: 20px; }
            .print-date { text-align: right; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>EthioMerkato Store</h1>
            <h2>Daily Sales Records</h2>
          </div>
          <div class="print-date">
            <p>Printed on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
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

  const handleAttachment = () => {
    // Create CSV content
    const csvHeaders = ['Date', 'Product', 'Quantity', 'Unit Price', 'Total Price', 'Customer', 'Seller'];
    const csvRows = salesRecords.map(record => [
      new Date(record.timestamp?.toDate?.() || record.timestamp).toLocaleDateString(),
      record.productName,
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

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `daily_sales_records_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Success",
      description: "Sales records exported successfully!"
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Daily Sales Records</h3>
        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer size={16} className="mr-2" />
            Print
          </button>
          <button
            onClick={handleAttachment}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Paperclip size={16} className="mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <div id="sales-records-table" className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Seller</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salesRecords.length > 0 ? (
              salesRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {new Date(record.timestamp?.toDate?.() || record.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">{record.productName}</TableCell>
                  <TableCell>{record.quantity}</TableCell>
                  <TableCell>{formatCurrency(record.unitPrice)}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(record.totalPrice)}</TableCell>
                  <TableCell>{record.buyerName || 'Walk-in Customer'}</TableCell>
                  <TableCell>{record.sellerName}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No sales records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {salesRecords.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Total Records: {salesRecords.length} | 
          Total Sales: {formatCurrency(salesRecords.reduce((sum, record) => sum + record.totalPrice, 0))}
        </div>
      )}
    </div>
  );
};

export default DailySalesRecords;
