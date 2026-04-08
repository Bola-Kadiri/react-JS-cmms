import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { Workrequest } from '@/types/workrequest';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface WorkrequestPrintViewProps {
  workrequest: Workrequest;
}

const WorkrequestPrintView: React.FC<WorkrequestPrintViewProps> = ({ workrequest }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Work Request - ${workrequest.work_request_number}</title>
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

  const formatCurrency = (cost: string, currency: string) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'NGN': '₦'
    };
    
    const symbol = symbols[currency as keyof typeof symbols] || '';
    return `${symbol}${cost}`;
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
          <DialogTitle>Work Request Print Preview</DialogTitle>
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
          <div className="title">WORK REQUEST DETAILS</div>

          {/* Details Table */}
          <table className="details-table">
            <tbody>
              <tr>
                <td>Request Number</td>
                <td>{workrequest.work_request_number}</td>
              </tr>
              <tr>
                <td>Type</td>
                <td>{workrequest.type}</td>
              </tr>
              <tr>
                <td>Priority</td>
                <td>{workrequest.priority}</td>
              </tr>
              <tr>
                <td>Category</td>
                <td>{workrequest.category_detail?.title || 'N/A'}</td>
              </tr>
              <tr>
                <td>Subcategory</td>
                <td>{workrequest.subcategory_detail?.title || 'N/A'}</td>
              </tr>
              <tr>
                <td>Department</td>
                <td>{workrequest.department_detail?.name || 'N/A'}</td>
              </tr>
              <tr>
                <td>Facility</td>
                <td>
                  {workrequest.facility_detail?.name || 'N/A'}
                  {workrequest.facility_detail?.code && ` (${workrequest.facility_detail.code})`}
                </td>
              </tr>
              <tr>
                <td>Description</td>
                <td>{workrequest.description || 'No description provided'}</td>
              </tr>
              <tr>
                <td>Cost</td>
                <td>{formatCurrency(workrequest.cost, workrequest.currency)}</td>
              </tr>
              <tr>
                <td>Currency</td>
                <td>{workrequest.currency}</td>
              </tr>
              <tr>
                <td>Approval Status</td>
                <td>{workrequest.approval_status}</td>
              </tr>
              <tr>
                <td>Created Date</td>
                <td>{formatDate(workrequest.created_at)}</td>
              </tr>
              {workrequest.follow_up_notes && (
                <tr>
                  <td>Follow-up Notes</td>
                  <td>{workrequest.follow_up_notes}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Asset Information */}
          {workrequest.asset_detail && (
            <>
              <div className="approvals-title">ASSET INFORMATION</div>
              <table className="details-table">
                <tbody>
                  <tr>
                    <td>Asset Name</td>
                    <td>{workrequest.asset_detail.asset_name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Asset Type</td>
                    <td>{workrequest.asset_detail.asset_type || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Asset Tag</td>
                    <td>{workrequest.asset_detail.asset_tag || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Serial Number</td>
                    <td>{workrequest.asset_detail.serial_number || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td>Condition</td>
                    <td>{workrequest.asset_detail.condition || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          {/* Vendor Information */}
          {workrequest.suggested_vendor_detail && (
            <>
              <div className="approvals-title">VENDOR INFORMATION</div>
              <table className="details-table">
                <tbody>
                  <tr>
                    <td>Vendor Name</td>
                    <td>{workrequest.suggested_vendor_detail.name}</td>
                  </tr>
                  {workrequest.suggested_vendor_detail.email && (
                    <tr>
                      <td>Email</td>
                      <td>{workrequest.suggested_vendor_detail.email}</td>
                    </tr>
                  )}
                  {workrequest.suggested_vendor_detail.phone && (
                    <tr>
                      <td>Phone</td>
                      <td>{workrequest.suggested_vendor_detail.phone}</td>
                    </tr>
                  )}
                  {workrequest.vendor_description && (
                    <tr>
                      <td>Description</td>
                      <td>{workrequest.vendor_description}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}

          {/* Approvals Section */}
          <div className="approvals-section">
            <div className="approvals-title">APPROVALS & ASSIGNMENTS</div>
            
            <table className="approvals-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Role</th>
                  <th>Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Requester */}
                {workrequest.requester_detail && (
                  <tr>
                    <td>1</td>
                    <td>Requester</td>
                    <td>
                      {workrequest.requester_detail.first_name} {workrequest.requester_detail.last_name}
                    </td>
                    <td>Submitted</td>
                  </tr>
                )}
                
                {/* Reviewers */}
                {workrequest.reviewers_detail && workrequest.reviewers_detail.length > 0 ? (
                  workrequest.reviewers_detail.map((reviewer, index) => (
                    <tr key={reviewer.id}>
                      <td>{workrequest.requester_detail ? index + 2 : index + 1}</td>
                      <td>Reviewer</td>
                      <td>
                        {reviewer.first_name} {reviewer.last_name}
                      </td>
                      <td>Assigned</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>{workrequest.requester_detail ? '2' : '1'}</td>
                    <td>Reviewer</td>
                    <td>No reviewers assigned</td>
                    <td>-</td>
                  </tr>
                )}

                {/* Approver */}
                {workrequest.approver_detail && (
                  <tr>
                    <td>{(workrequest.requester_detail ? 1 : 0) + (workrequest.reviewers_detail?.length || 0) + 1}</td>
                    <td>Approver</td>
                    <td>
                      {workrequest.approver_detail.first_name} {workrequest.approver_detail.last_name}
                    </td>
                    <td>Assigned</td>
                  </tr>
                )}

                {/* Approval Status Row */}
                <tr>
                  <td colSpan={3} style={{ fontWeight: 'bold', textAlign: 'right' }}>
                    Approval Status:
                  </td>
                  <td style={{ fontWeight: 'bold' }}>
                    {workrequest.approval_status || 'Pending'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Request Options */}
          <div className="approvals-section">
            <div className="approvals-title">REQUEST OPTIONS</div>
            <table className="details-table">
              <tbody>
                <tr>
                  <td>Mobilization Fee Required</td>
                  <td>{workrequest.require_mobilization_fee ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td>Quotation Required</td>
                  <td>{workrequest.require_quotation ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td>Payment Requisition</td>
                  <td>{workrequest.payment_requisition ? 'Yes' : 'No'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signature Section */}
          <div className="signature-section">
            <div className="signature-box">
              <strong>Requested By:</strong>
              <div className="signature-line">
                {workrequest.requester_detail 
                  ? `${workrequest.requester_detail.first_name} ${workrequest.requester_detail.last_name}`
                  : ''}
              </div>
            </div>
            <div className="signature-box">
              <strong>Reviewed By:</strong>
              <div className="signature-line">
                {workrequest.reviewers_detail && workrequest.reviewers_detail.length > 0
                  ? workrequest.reviewers_detail.map(r => `${r.first_name} ${r.last_name}`).join(', ')
                  : ''}
              </div>
            </div>
            <div className="signature-box">
              <strong>Approved By:</strong>
              <div className="signature-line">
                {workrequest.approver_detail 
                  ? `${workrequest.approver_detail.first_name} ${workrequest.approver_detail.last_name}`
                  : ''}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkrequestPrintView;

