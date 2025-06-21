
import { jsPDF } from 'jspdf';
import { useAuth } from '../contexts/AuthContext';

interface SaleData {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  buyerName: string;
  timestamp: Date;
}

export const generateSaleReceipt = (saleData: SaleData, userProfile: any) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('SALES RECEIPT', 105, 20, { align: 'center' });
  
  // Store info
  doc.setFontSize(12);
  doc.text('EthioMerkato Store', 20, 40);
  doc.text('Sales Management System', 20, 50);
  
  // Receipt details
  doc.text(`Receipt Date: ${saleData.timestamp.toLocaleDateString()}`, 20, 70);
  doc.text(`Receipt Time: ${saleData.timestamp.toLocaleTimeString()}`, 20, 80);
  doc.text(`Seller: ${userProfile?.name || 'N/A'}`, 20, 90);
  doc.text(`Customer: ${saleData.buyerName || 'Walk-in Customer'}`, 20, 100);
  
  // Line separator
  doc.line(20, 110, 190, 110);
  
  // Product details header
  doc.setFontSize(14);
  doc.text('PRODUCT DETAILS', 20, 125);
  
  doc.setFontSize(10);
  doc.text('Product', 20, 140);
  doc.text('Qty', 80, 140);
  doc.text('Unit Price', 110, 140);
  doc.text('Total', 150, 140);
  
  // Line under header
  doc.line(20, 145, 190, 145);
  
  // Product details
  doc.text(saleData.productName, 20, 160);
  doc.text(saleData.quantity.toString(), 80, 160);
  doc.text(`$${saleData.unitPrice.toFixed(2)}`, 110, 160);
  doc.text(`$${saleData.totalPrice.toFixed(2)}`, 150, 160);
  
  // Total line
  doc.line(20, 170, 190, 170);
  
  // Total amount
  doc.setFontSize(14);
  doc.text(`TOTAL AMOUNT: $${saleData.totalPrice.toFixed(2)}`, 105, 185, { align: 'center' });
  
  // Footer
  doc.setFontSize(10);
  doc.text('Thank you for your business!', 105, 210, { align: 'center' });
  doc.text('Visit us again soon!', 105, 220, { align: 'center' });
  
  // Save the PDF
  const filename = `receipt_${Date.now()}.pdf`;
  doc.save(filename);
};
