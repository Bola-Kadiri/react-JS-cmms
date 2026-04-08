import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { Workorder } from '@/types/workorder';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface WorkorderPrintViewProps {
  workorder: Workorder;
}

const WorkorderPrintView: React.FC<WorkorderPrintViewProps> = ({ workorder }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Work Order - ${workorder.work_order_number}</title>
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
          <DialogTitle>Work Order Print Preview</DialogTitle>
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
          <div className="title">WORK ORDER DETAILS</div>

          {/* Details Table */}
          <table className="details-table">
            <tbody>
              <tr>
                <td>No</td>
                <td>WO-{workorder.work_order_number}</td>
              </tr>
              <tr>
                <td>Category</td>
                <td>{workorder.category_detail?.name || 'N/A'}</td>
              </tr>
              <tr>
                <td>Sub Category</td>
                <td>{workorder.subcategory_detail?.title || 'N/A'}</td>
              </tr>
              <tr>
                <td>Title</td>
                <td>{workorder.title || 'N/A'}</td>
              </tr>
              <tr>
                <td>Description</td>
                <td>{workorder.description || 'No description provided'}</td>
              </tr>
              <tr>
                <td>Expected Start Date</td>
                <td>{formatDate(workorder.expected_start_date)}</td>
              </tr>
              <tr>
                <td>Due Date</td>
                <td>{workorder.due_status || 'N/A'}</td>
              </tr>
              <tr>
                <td>Status</td>
                <td>{workorder.status}</td>
              </tr>
            </tbody>
          </table>

          {/* Approvals Section */}
          <div className="approvals-section">
            <div className="approvals-title">APPROVALS</div>
            
            <table className="approvals-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Submitted By</th>
                  <th>Reviewed / Approved By</th>
                  <th>Approved</th>
                </tr>
              </thead>
              <tbody>
                {/* First Row - Requester */}
                {workorder.requester_detail && (
                  <tr>
                    <td>1</td>
                    <td>
                      {workorder.requester_detail.first_name} {workorder.requester_detail.last_name}
                    </td>
                    <td>-</td>
                    <td>-</td>
                  </tr>
                )}
                
                {/* Reviewers Rows */}
                {workorder.reviewers_detail && workorder.reviewers_detail.length > 0 ? (
                  workorder.reviewers_detail.map((reviewer, index) => (
                    <tr key={reviewer.id}>
                      <td>{workorder.requester_detail ? index + 2 : index + 1}</td>
                      <td>-</td>
                      <td>
                        {reviewer.first_name} {reviewer.last_name}
                      </td>
                      <td>{workorder.is_reviewed ? 'Yes' : 'Pending'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>{workorder.requester_detail ? '2' : '1'}</td>
                    <td>-</td>
                    <td>No reviewers assigned</td>
                    <td>-</td>
                  </tr>
                )}

                {/* Approval Status Row */}
                <tr>
                  <td colSpan={3} style={{ fontWeight: 'bold', textAlign: 'right' }}>
                    Approval Status:
                  </td>
                  <td style={{ fontWeight: 'bold' }}>
                    {workorder.approval_status || 'Pending'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signature Section */}
          <div className="signature-section">
            <div className="signature-box">
              <strong>Submitted By:</strong>
              <div className="signature-line">
                {workorder.requester_detail 
                  ? `${workorder.requester_detail.first_name} ${workorder.requester_detail.last_name}`
                  : ''}
              </div>
            </div>
            <div className="signature-box">
              <strong>Approved By:</strong>
              <div className="signature-line">
                {workorder.reviewers_detail && workorder.reviewers_detail.length > 0
                  ? workorder.reviewers_detail.map(r => `${r.first_name} ${r.last_name}`).join(', ')
                  : ''}
              </div>
            </div>
            <div className="signature-box">
              <strong>Vendor(s) Name & Signature</strong>
              <div className="signature-line">&nbsp;</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkorderPrintView;

