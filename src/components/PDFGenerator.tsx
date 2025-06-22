
import { jsPDF } from 'jspdf';

interface SaleItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface SaleData {
  items?: SaleItem[];
  productName?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  buyerName: string;
  timestamp: Date;
  totalAmount?: number;
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
  doc.text(`Customer: ${saleData.buyerName}`, 20, 100);
  
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
  
  let yPosition = 160;
  let grandTotal = 0;
  
  // Handle multiple items or single item
  if (saleData.items && saleData.items.length > 0) {
    // Multiple items
    saleData.items.forEach((item) => {
      doc.text(item.productName, 20, yPosition);
      doc.text(item.quantity.toString(), 80, yPosition);
      doc.text(`$${item.unitPrice.toFixed(2)}`, 110, yPosition);
      doc.text(`$${item.totalPrice.toFixed(2)}`, 150, yPosition);
      grandTotal += item.totalPrice;
      yPosition += 15;
    });
  } else {
    // Single item (backward compatibility)
    doc.text(saleData.productName || '', 20, yPosition);
    doc.text((saleData.quantity || 0).toString(), 80, yPosition);
    doc.text(`$${(saleData.unitPrice || 0).toFixed(2)}`, 110, yPosition);
    doc.text(`$${(saleData.totalPrice || 0).toFixed(2)}`, 150, yPosition);
    grandTotal = saleData.totalPrice || 0;
    yPosition += 15;
  }
  
  // Total line
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 15;
  
  // Total amount
  doc.setFontSize(14);
  const finalTotal = saleData.totalAmount || grandTotal;
  doc.text(`TOTAL AMOUNT: $${finalTotal.toFixed(2)}`, 105, yPosition, { align: 'center' });
  
  // Footer
  yPosition += 25;
  doc.setFontSize(10);
  doc.text('Thank you for your Purchase!', 105, yPosition, { align: 'center' });
  doc.text('Visit us again soon!', 105, yPosition + 10, { align: 'center' });
  
  // Save the PDF
  const filename = `receipt_${Date.now()}.pdf`;
  doc.save(filename);
};
