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
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a1a; font-size: 13px; }
            .doc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 3px solid #16a34a; }
            .doc-logo { font-size: 22px; font-weight: 800; color: #15803d; letter-spacing: -0.5px; }
            .doc-logo span { display: block; font-size: 11px; font-weight: 400; color: #6b7280; margin-top: 2px; letter-spacing: 0; }
            .doc-meta { text-align: right; font-size: 11px; line-height: 1.7; color: #4b5563; }
            .doc-meta strong { font-size: 13px; color: #111827; display: block; margin-bottom: 2px; }
            .doc-title { text-align: center; font-size: 18px; font-weight: 700; margin: 24px 0 6px; text-transform: uppercase; letter-spacing: 1px; color: #111827; }
            .doc-ref { text-align: center; font-size: 13px; color: #6b7280; margin-bottom: 24px; }
            .section-header { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 8px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #15803d; margin: 24px 0 0; }
            table.details-table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
            table.details-table td { padding: 10px 14px; border: 1px solid #e5e7eb; vertical-align: top; font-size: 13px; }
            table.details-table td:first-child { font-weight: 600; background-color: #f9fafb; width: 200px; color: #374151; }
            table.details-table td:last-child { color: #111827; }
            .po-section table.details-table td:first-child { background-color: #f0fdf4; }
            table.approvals-table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
            table.approvals-table th { background-color: #f9fafb; padding: 10px 14px; text-align: left; border: 1px solid #e5e7eb; font-weight: 700; font-size: 12px; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; }
            table.approvals-table td { padding: 10px 14px; border: 1px solid #e5e7eb; font-size: 13px; }
            .badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
            .badge-approved { background: #dcfce7; color: #15803d; }
            .badge-pending { background: #fef9c3; color: #92400e; }
            .badge-rejected { background: #fee2e2; color: #991b1b; }
            .signature-section { margin-top: 56px; display: flex; justify-content: space-between; gap: 20px; }
            .signature-box { flex: 1; }
            .signature-box strong { display: block; margin-bottom: 36px; font-size: 12px; color: #374151; }
            .signature-line { border-top: 1px solid #9ca3af; padding-top: 6px; font-size: 11px; color: #6b7280; }
            .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 10px; color: #9ca3af; }
            @media print { body { padding: 20px; } .no-print { display: none; } }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try { return format(new Date(dateString), 'MMM dd, yyyy'); }
    catch { return 'Invalid date'; }
  };

  const formatCurrency = (cost: string | null, currency: string) => {
    if (!cost) return 'N/A';
    const symbols: Record<string, string> = { USD: '$', EUR: '€', NGN: '₦' };
    const symbol = symbols[currency] || '';
    const num = parseFloat(cost);
    return `${symbol}${isNaN(num) ? cost : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadgeStyle = (status: string) => {
    if (!status) return { background: '#f3f4f6', color: '#374151', padding: '2px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 };
    const s = status.toLowerCase();
    if (s.includes('approved') || s.includes('fully')) return { background: '#dcfce7', color: '#15803d', padding: '2px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 };
    if (s.includes('rejected')) return { background: '#fee2e2', color: '#991b1b', padding: '2px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 };
    return { background: '#fef9c3', color: '#92400e', padding: '2px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 };
  };

  const hasPO = !!workrequest.po_number;

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
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>

        {/* Printable Content */}
        <div ref={printRef} style={{ background: '#fff', padding: '32px', fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#1a1a1a' }}>

          {/* Header */}
          <div className="doc-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', paddingBottom: '20px', borderBottom: '3px solid #16a34a' }}>
            <div className="doc-logo" style={{ fontSize: '22px', fontWeight: 800, color: '#15803d' }}>
              Alpha Mead Group
              <span style={{ display: 'block', fontSize: '11px', fontWeight: 400, color: '#6b7280', marginTop: '2px' }}>Facility Management Services</span>
            </div>
            <div className="doc-meta" style={{ textAlign: 'right', fontSize: '11px', lineHeight: '1.7', color: '#4b5563' }}>
              <strong style={{ fontSize: '13px', color: '#111827', display: 'block', marginBottom: '2px' }}>Alpha Mead Group</strong>
              <div>6 Mobolaji Johnson Ave, Ikoyi, Lagos</div>
              <div>https://alphamead.com/</div>
              <div>0700 ALPHA MEAD, +234700257426323</div>
            </div>
          </div>

          {/* Title */}
          <div className="doc-title" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '1px', color: '#111827' }}>
            Work Request Details
          </div>
          <div className="doc-ref" style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>
            Ref: {workrequest.work_request_number} &nbsp;|&nbsp; Generated: {format(new Date(), 'MMM dd, yyyy')}
          </div>

          {/* Request Details */}
          <div className="section-header" style={{ background: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '8px 14px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#15803d', marginBottom: '0' }}>
            Request Information
          </div>
          <table className="details-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0' }}>
            <tbody>
              <tr>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', width: '200px', color: '#374151' }}>Request Number</td>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{workrequest.work_request_number}</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', color: '#374151' }}>Type</td>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{workrequest.type}</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', color: '#374151' }}>Priority</td>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{workrequest.priority}</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', color: '#374151' }}>Category</td>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{workrequest.category_detail?.name || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', color: '#374151' }}>Subcategory</td>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{workrequest.subcategory_detail?.title || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', color: '#374151' }}>Department</td>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{workrequest.department_detail?.name || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', color: '#374151' }}>Facility</td>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>
                  {workrequest.facility_detail?.name || 'N/A'}
                  {workrequest.facility_detail?.code && ` (${workrequest.facility_detail.code})`}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', color: '#374151' }}>Description</td>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{workrequest.description || 'No description provided'}</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', color: '#374151' }}>Estimated Cost</td>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{formatCurrency(workrequest.cost, workrequest.currency)}</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', color: '#374151' }}>Currency</td>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{workrequest.currency}</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', color: '#374151' }}>Approval Status</td>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb' }}>
                  <span style={getStatusBadgeStyle(workrequest.approval_status)}>{workrequest.approval_status}</span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', color: '#374151' }}>Created Date</td>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{formatDate(workrequest.created_at)}</td>
              </tr>
              {workrequest.follow_up_notes && (
                <tr>
                  <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', color: '#374151' }}>Follow-up Notes</td>
                  <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{workrequest.follow_up_notes}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Purchase Order Section — only shown when procurement has approved */}
          {hasPO && (
            <div className="po-section">
              <div className="section-header" style={{ background: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '8px 14px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#15803d', marginTop: '24px', marginBottom: '0' }}>
                Purchase Order (PO)
              </div>
              <table className="details-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f0fdf4', width: '200px', color: '#374151' }}>PO Number</td>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827', fontWeight: 600 }}>{workrequest.po_number}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f0fdf4', color: '#374151' }}>PO Amount</td>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#15803d', fontWeight: 700, fontSize: '14px' }}>
                      {formatCurrency(workrequest.po_amount, workrequest.currency)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f0fdf4', color: '#374151' }}>PO Vendor</td>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>
                      {workrequest.po_vendor_detail?.name || workrequest.vendor_detail?.name || 'N/A'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Asset Information */}
          {workrequest.asset_detail && (
            <>
              <div className="section-header" style={{ background: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '8px 14px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#15803d', marginTop: '24px', marginBottom: '0' }}>
                Asset Information
              </div>
              <table className="details-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', width: '200px', color: '#374151' }}>Asset Name</td>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{workrequest.asset_detail.asset_name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', color: '#374151' }}>Asset Type</td>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{workrequest.asset_detail.asset_type || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', color: '#374151' }}>Asset Tag</td>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{workrequest.asset_detail.asset_tag || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', color: '#374151' }}>Serial Number</td>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{workrequest.asset_detail.serial_number || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', color: '#374151' }}>Condition</td>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{workrequest.asset_detail.condition || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          {/* Vendor Information */}
          {workrequest.vendor_detail && (
            <>
              <div className="section-header" style={{ background: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '8px 14px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#15803d', marginTop: '24px', marginBottom: '0' }}>
                Vendor Information
              </div>
              <table className="details-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', width: '200px', color: '#374151' }}>Vendor Name</td>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{workrequest.vendor_detail.name}</td>
                  </tr>
                  {workrequest.vendor_detail.email && (
                    <tr>
                      <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', color: '#374151' }}>Email</td>
                      <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{workrequest.vendor_detail.email}</td>
                    </tr>
                  )}
                  {workrequest.vendor_detail.phone && (
                    <tr>
                      <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', color: '#374151' }}>Phone</td>
                      <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{workrequest.vendor_detail.phone}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}

          {/* Approvals */}
          <div className="section-header" style={{ background: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '8px 14px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#15803d', marginTop: '24px', marginBottom: '0' }}>
            Approvals &amp; Assignments
          </div>
          <table className="approvals-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['#', 'Role', 'Name', 'Status'].map((h) => (
                  <th key={h} style={{ background: '#f9fafb', padding: '10px 14px', textAlign: 'left', border: '1px solid #e5e7eb', fontWeight: 700, fontSize: '12px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workrequest.requester_detail && (
                <tr>
                  <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb' }}>1</td>
                  <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb' }}>Requester</td>
                  <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb' }}>{workrequest.requester_detail.first_name} {workrequest.requester_detail.last_name}</td>
                  <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb' }}><span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 }}>Submitted</span></td>
                </tr>
              )}
              {workrequest.reviewers_detail && workrequest.reviewers_detail.length > 0
                ? workrequest.reviewers_detail.map((reviewer, index) => (
                  <tr key={reviewer.id}>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb' }}>{workrequest.requester_detail ? index + 2 : index + 1}</td>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb' }}>Reviewer</td>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb' }}>{reviewer.first_name} {reviewer.last_name}</td>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb' }}><span style={{ background: '#fef9c3', color: '#92400e', padding: '2px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 }}>Assigned</span></td>
                  </tr>
                ))
                : (
                  <tr>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb' }}>{workrequest.requester_detail ? '2' : '1'}</td>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb' }}>Reviewer</td>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#9ca3af', fontStyle: 'italic' }}>No reviewers assigned</td>
                    <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb' }}>—</td>
                  </tr>
                )
              }
              {workrequest.approver_detail && (
                <tr>
                  <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb' }}>{(workrequest.requester_detail ? 1 : 0) + (workrequest.reviewers_detail?.length || 0) + 1}</td>
                  <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb' }}>Approver</td>
                  <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb' }}>{workrequest.approver_detail.first_name} {workrequest.approver_detail.last_name}</td>
                  <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb' }}><span style={{ background: '#fef9c3', color: '#92400e', padding: '2px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 }}>Assigned</span></td>
                </tr>
              )}
              <tr>
                <td colSpan={3} style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 700, textAlign: 'right', background: '#f9fafb' }}>Overall Approval Status</td>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb' }}>
                  <span style={getStatusBadgeStyle(workrequest.approval_status)}>{workrequest.approval_status || 'Pending'}</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Request Options */}
          <div className="section-header" style={{ background: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '8px 14px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#15803d', marginTop: '24px', marginBottom: '0' }}>
            Request Options
          </div>
          <table className="details-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', width: '200px', color: '#374151' }}>Mobilization Fee Required</td>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{workrequest.require_mobilization_fee ? 'Yes' : 'No'}</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', color: '#374151' }}>Quotation Required</td>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{workrequest.require_quotation ? 'Yes' : 'No'}</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', color: '#374151' }}>Payment Requisition</td>
                <td style={{ padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827' }}>{workrequest.payment_requisition ? 'Yes' : 'No'}</td>
              </tr>
            </tbody>
          </table>

          {/* Signature Section */}
          <div className="signature-section" style={{ marginTop: '56px', display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <div className="signature-box" style={{ flex: 1 }}>
              <strong style={{ display: 'block', marginBottom: '36px', fontSize: '12px', color: '#374151' }}>Requested By:</strong>
              <div className="signature-line" style={{ borderTop: '1px solid #9ca3af', paddingTop: '6px', fontSize: '11px', color: '#6b7280' }}>
                {workrequest.requester_detail ? `${workrequest.requester_detail.first_name} ${workrequest.requester_detail.last_name}` : ''}
              </div>
            </div>
            <div className="signature-box" style={{ flex: 1 }}>
              <strong style={{ display: 'block', marginBottom: '36px', fontSize: '12px', color: '#374151' }}>Reviewed By:</strong>
              <div className="signature-line" style={{ borderTop: '1px solid #9ca3af', paddingTop: '6px', fontSize: '11px', color: '#6b7280' }}>
                {workrequest.reviewers_detail && workrequest.reviewers_detail.length > 0
                  ? workrequest.reviewers_detail.map(r => `${r.first_name} ${r.last_name}`).join(', ')
                  : ''}
              </div>
            </div>
            <div className="signature-box" style={{ flex: 1 }}>
              <strong style={{ display: 'block', marginBottom: '36px', fontSize: '12px', color: '#374151' }}>Approved By:</strong>
              <div className="signature-line" style={{ borderTop: '1px solid #9ca3af', paddingTop: '6px', fontSize: '11px', color: '#6b7280' }}>
                {workrequest.approver_detail ? `${workrequest.approver_detail.first_name} ${workrequest.approver_detail.last_name}` : ''}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer" style={{ marginTop: '40px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '10px', color: '#9ca3af' }}>
            This document was generated from AlphaCMMS on {format(new Date(), 'MMM dd, yyyy HH:mm')}. For internal use only.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkrequestPrintView;
