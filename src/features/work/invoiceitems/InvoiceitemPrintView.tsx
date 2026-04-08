import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { Invoiceitem } from '@/types/invoiceitem';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface InvoiceitemPrintViewProps {
  invoiceItem: Invoiceitem;
}

const InvoiceitemPrintView: React.FC<InvoiceitemPrintViewProps> = ({ invoiceItem }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice Item - ${invoiceItem.invoice_number}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #333;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #333;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2d6a4f;
            }
            .company-info {
              text-align: right;
              font-size: 12px;
              line-height: 1.6;
            }
            .company-info strong {
              font-size: 14px;
              display: block;
              margin-bottom: 5px;
            }
            .title {
              text-align: center;
              font-size: 20px;
              font-weight: bold;
              margin: 30px 0;
              text-transform: uppercase;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            table.details-table td {
              padding: 12px;
              border: 1px solid #ddd;
              vertical-align: top;
            }
            table.details-table td:first-child {
              font-weight: bold;
              background-color: #f8f9fa;
              width: 180px;
            }
            table.items-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            table.items-table th {
              background-color: #f8f9fa;
              padding: 12px;
              text-align: left;
              border: 1px solid #ddd;
              font-weight: bold;
            }
            table.items-table td {
              padding: 12px;
              border: 1px solid #ddd;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              margin: 30px 0 15px;
              text-transform: uppercase;
            }
            .approvals-section {
              margin-top: 40px;
            }
            .approvals-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 20px;
              text-transform: uppercase;
            }
            table.approvals-table {
              width: 100%;
              border-collapse: collapse;
            }
            table.approvals-table th {
              background-color: #f8f9fa;
              padding: 12px;
              text-align: left;
              border: 1px solid #ddd;
              font-weight: bold;
            }
            table.approvals-table td {
              padding: 12px;
              border: 1px solid #ddd;
            }
            .signature-section {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
            }
            .signature-box {
              width: 30%;
            }
            .signature-box strong {
              display: block;
              margin-bottom: 40px;
            }
            .signature-line {
              border-top: 1px solid #333;
              padding-top: 5px;
              font-size: 12px;
            }
            .totals {
              margin-top: 20px;
              text-align: right;
            }
            .totals table {
              margin-left: auto;
              width: 300px;
            }
            .totals td {
              padding: 8px;
              border: 1px solid #ddd;
            }
            .totals td:first-child {
              font-weight: bold;
              background-color: #f8f9fa;
            }
            .total-row {
              font-weight: bold;
              font-size: 18px;
              background-color: #2d6a4f !important;
              color: white !important;
            }
            @media print {
              body {
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatAmount = (amount: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-green-200 hover:bg-green-50">
          <Printer className="mr-2 h-4 w-4" />
          Print / Download
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice Item Print Preview</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-end gap-2 mb-4 no-print">
          <Button onClick={handlePrint} className="bg-green-600 hover:bg-green-700">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {/* Printable Content */}
        <div ref={printRef} className="bg-white p-8">
          {/* Header */}
          <div className="header">
            <div className="logo">
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d6a4f' }}>
                Alpha Mead Group
              </div>
            </div>
            <div className="company-info">
              <strong>Alpha Mead Group</strong>
              <div>6 Mobolaji Johnson Ave, Ikoyi, Lagos</div>
              <div>https://alphamead.com/</div>
              <div>0700 ALPHA MEAD, +234700257426323</div>
            </div>
          </div>

          {/* Title */}
          <div className="title">INVOICE ITEM DETAILS</div>

          {/* Basic Details Table */}
          <table className="details-table">
            <tbody>
              <tr>
                <td>Invoice ID</td>
                <td>II-{invoiceItem.id}</td>
              </tr>
              <tr>
                <td>Invoice Number</td>
                <td>{invoiceItem.invoice_number}</td>
              </tr>
              <tr>
                <td>Status</td>
                <td>{invoiceItem.status}</td>
              </tr>
              <tr>
                <td>Currency</td>
                <td>{invoiceItem.currency}</td>
              </tr>
              <tr>
                <td>Invoice Date</td>
                <td>{formatDate(invoiceItem.invoice_date)}</td>
              </tr>
              <tr>
                <td>Due Date</td>
                <td>{formatDate(invoiceItem.due_date)}</td>
              </tr>
              {invoiceItem.work_order_detail && (
                <tr>
                  <td>Work Order</td>
                  <td>WO-{invoiceItem.work_order_detail.work_order_number || invoiceItem.work_order_detail.id}</td>
                </tr>
              )}
              {invoiceItem.notes && (
                <tr>
                  <td>Notes</td>
                  <td>{invoiceItem.notes}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Items Section */}
          {invoiceItem.items_detail && invoiceItem.items_detail.length > 0 && (
            <>
              <div className="section-title">INVOICE ITEMS</div>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item Name</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItem.items_detail.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.item_name}</td>
                      <td>{item.description}</td>
                      <td style={{ textAlign: 'right' }}>
                        {invoiceItem.currency} {formatAmount(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Totals */}
          <div className="totals">
            <table>
              <tbody>
                <tr>
                  <td>Subtotal</td>
                  <td style={{ textAlign: 'right' }}>
                    {invoiceItem.currency} {formatAmount(invoiceItem.subtotal)}
                  </td>
                </tr>
                <tr>
                  <td>Tax Amount</td>
                  <td style={{ textAlign: 'right' }}>
                    {invoiceItem.currency} {formatAmount(invoiceItem.tax_amount)}
                  </td>
                </tr>
                <tr className="total-row">
                  <td>Total Amount</td>
                  <td style={{ textAlign: 'right' }}>
                    {invoiceItem.currency} {formatAmount(invoiceItem.total_amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Approvals Section */}
          <div className="approvals-section">
            <div className="approvals-title">APPROVALS</div>
            
            <table className="approvals-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Reviewers */}
                {invoiceItem.reviewers_detail && invoiceItem.reviewers_detail.length > 0 ? (
                  invoiceItem.reviewers_detail.map((reviewer, index) => (
                    <tr key={reviewer.id}>
                      <td>Reviewer {index + 1}</td>
                      <td>
                        {reviewer.first_name} {reviewer.last_name}
                      </td>
                      <td>{invoiceItem.is_reviewed ? 'Reviewed' : 'Pending Review'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>Reviewer</td>
                    <td>No reviewers assigned</td>
                    <td>-</td>
                  </tr>
                )}

                {/* Approver */}
                {invoiceItem.approver_detail ? (
                  <tr>
                    <td>Approver</td>
                    <td>
                      {invoiceItem.approver_detail.first_name} {invoiceItem.approver_detail.last_name}
                    </td>
                    <td>{invoiceItem.is_approved ? 'Approved' : 'Pending Approval'}</td>
                  </tr>
                ) : (
                  <tr>
                    <td>Approver</td>
                    <td>No approver assigned</td>
                    <td>-</td>
                  </tr>
                )}

                {/* Review Status Row */}
                <tr>
                  <td colSpan={2} style={{ fontWeight: 'bold', textAlign: 'right' }}>
                    Review Status:
                  </td>
                  <td style={{ fontWeight: 'bold' }}>
                    {invoiceItem.is_reviewed ? 'Reviewed' : 'Pending Review'}
                  </td>
                </tr>
                
                {/* Approval Status Row */}
                <tr>
                  <td colSpan={2} style={{ fontWeight: 'bold', textAlign: 'right' }}>
                    Approval Status:
                  </td>
                  <td style={{ fontWeight: 'bold' }}>
                    {invoiceItem.is_approved ? 'Approved' : 'Pending Approval'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signature Section */}
          <div className="signature-section">
            <div className="signature-box">
              <strong>Reviewed By:</strong>
              <div className="signature-line">
                {invoiceItem.reviewers_detail && invoiceItem.reviewers_detail.length > 0
                  ? invoiceItem.reviewers_detail.map(r => `${r.first_name} ${r.last_name}`).join(', ')
                  : ''}
              </div>
            </div>
            <div className="signature-box">
              <strong>Approved By:</strong>
              <div className="signature-line">
                {invoiceItem.approver_detail 
                  ? `${invoiceItem.approver_detail.first_name} ${invoiceItem.approver_detail.last_name}`
                  : ''}
              </div>
            </div>
            <div className="signature-box">
              <strong>Date:</strong>
              <div className="signature-line">{format(new Date(), 'MMM dd, yyyy')}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceitemPrintView;

