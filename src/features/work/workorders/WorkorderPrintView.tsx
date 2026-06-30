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
            .section-header-first { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 8px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #15803d; margin: 0 0 0; }
            .section-header-red { background: #fef2f2; border-left: 4px solid #dc2626; padding: 8px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #991b1b; margin: 24px 0 0; }
            table.details-table { width: 100%; border-collapse: collapse; }
            table.details-table td { padding: 10px 14px; border: 1px solid #e5e7eb; vertical-align: top; font-size: 13px; }
            table.details-table td:first-child { font-weight: 600; background-color: #f9fafb; width: 200px; color: #374151; }
            table.details-table td:last-child { color: #111827; }
            table.approvals-table { width: 100%; border-collapse: collapse; }
            table.approvals-table th { background-color: #f9fafb; padding: 10px 14px; text-align: left; border: 1px solid #e5e7eb; font-weight: 700; font-size: 12px; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; }
            table.approvals-table td { padding: 10px 14px; border: 1px solid #e5e7eb; font-size: 13px; }
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

  const formatCurrency = (cost: string, currency: string) => {
    if (!cost) return 'N/A';
    const symbols: Record<string, string> = { USD: '$', EUR: '€', NGN: '₦' };
    const num = parseFloat(cost);
    return `${symbols[currency] || ''}${isNaN(num) ? cost : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadgeStyle = (status: string): React.CSSProperties => {
    const s = (status || '').toLowerCase();
    if (s.includes('approved')) return { background: '#dcfce7', color: '#15803d', padding: '2px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 };
    if (s.includes('rejected')) return { background: '#fee2e2', color: '#991b1b', padding: '2px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 };
    return { background: '#fef9c3', color: '#92400e', padding: '2px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 };
  };

  /* Shared inline style objects — make preview & print match */
  const tdL: React.CSSProperties = { padding: '10px 14px', border: '1px solid #e5e7eb', fontWeight: 600, background: '#f9fafb', width: '200px', color: '#374151', verticalAlign: 'top' };
  const tdV: React.CSSProperties = { padding: '10px 14px', border: '1px solid #e5e7eb', color: '#111827', verticalAlign: 'top' };
  const sectionStyle = (first = false, red = false): React.CSSProperties => ({
    background: red ? '#fef2f2' : '#f0fdf4',
    borderLeft: `4px solid ${red ? '#dc2626' : '#16a34a'}`,
    padding: '8px 14px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    color: red ? '#991b1b' : '#15803d',
    marginTop: first ? '0' : '24px',
    marginBottom: '0',
  });
  const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
  const thStyle: React.CSSProperties = { background: '#f9fafb', padding: '10px 14px', textAlign: 'left', border: '1px solid #e5e7eb', fontWeight: 700, fontSize: '12px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' };
  const tdCell: React.CSSProperties = { padding: '10px 14px', border: '1px solid #e5e7eb', fontSize: '13px' };

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
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>

        {/* Printable content */}
        <div ref={printRef} style={{ background: '#fff', padding: '32px', fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#1a1a1a' }}>

          {/* Company header */}
          <div className="doc-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', paddingBottom: '20px', borderBottom: '3px solid #16a34a' }}>
            <div className="doc-logo" style={{ fontSize: '22px', fontWeight: 800, color: '#15803d' }}>
              Alpha Mead Group
              <span style={{ display: 'block', fontSize: '11px', fontWeight: 400, color: '#6b7280', marginTop: '2px' }}>
                Facility Management Services
              </span>
            </div>
            <div className="doc-meta" style={{ textAlign: 'right', fontSize: '11px', lineHeight: '1.7', color: '#4b5563' }}>
              <strong style={{ fontSize: '13px', color: '#111827', display: 'block', marginBottom: '2px' }}>Alpha Mead Group</strong>
              <div>6 Mobolaji Johnson Ave, Ikoyi, Lagos</div>
              <div>https://alphamead.com/</div>
              <div>0700 ALPHA MEAD, +234700257426323</div>
            </div>
          </div>

          {/* Document title */}
          <div className="doc-title" style={{ textAlign: 'center', fontSize: '18px', fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '1px', color: '#111827' }}>
            Work Order Details
          </div>
          <div className="doc-ref" style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>
            Ref: {workorder.work_order_number} &nbsp;|&nbsp; Generated: {format(new Date(), 'MMM dd, yyyy')}
          </div>

          {/* ── Work Order Information ── */}
          <div className="section-header-first" style={sectionStyle(true)}>Work Order Information</div>
          <table className="details-table" style={tableStyle}>
            <tbody>
              <tr><td style={tdL}>Work Order Number</td><td style={tdV}>{workorder.work_order_number}</td></tr>
              <tr><td style={tdL}>Title</td><td style={tdV}>{workorder.title || 'N/A'}</td></tr>
              <tr><td style={tdL}>Type</td><td style={tdV}>{workorder.type || 'N/A'}</td></tr>
              <tr><td style={tdL}>Priority</td><td style={tdV}>{workorder.priority || 'N/A'}</td></tr>
              <tr><td style={tdL}>Status</td><td style={tdV}>{workorder.status}</td></tr>
              <tr>
                <td style={tdL}>Approval Status</td>
                <td style={tdV}><span style={getStatusBadgeStyle(workorder.approval_status)}>{workorder.approval_status || 'Pending'}</span></td>
              </tr>
              <tr><td style={tdL}>Expected Start Date</td><td style={tdV}>{formatDate(workorder.expected_start_date)}</td></tr>
              <tr><td style={tdL}>Due Status</td><td style={tdV}>{workorder.due_status || 'N/A'}</td></tr>
              <tr><td style={tdL}>Created Date</td><td style={tdV}>{formatDate(workorder.created_at)}</td></tr>
              <tr><td style={tdL}>Description</td><td style={tdV}>{workorder.description || 'No description provided'}</td></tr>
            </tbody>
          </table>

          {/* ── Category ── */}
          <div className="section-header" style={sectionStyle()}>Category</div>
          <table className="details-table" style={tableStyle}>
            <tbody>
              <tr><td style={tdL}>Category</td><td style={tdV}>{workorder.category_detail?.name || 'N/A'}</td></tr>
              <tr><td style={tdL}>Subcategory</td><td style={tdV}>{workorder.subcategory_detail?.name || 'N/A'}</td></tr>
            </tbody>
          </table>

          {/* ── Financial Details ── */}
          <div className="section-header" style={sectionStyle()}>Financial Details</div>
          <table className="details-table" style={tableStyle}>
            <tbody>
              {workorder.cost && (
                <tr>
                  <td style={tdL}>Total Cost</td>
                  <td style={{ ...tdV, fontWeight: 700, color: '#15803d', fontSize: '14px' }}>
                    {formatCurrency(workorder.cost, workorder.currency || 'NGN')}
                  </td>
                </tr>
              )}
              <tr><td style={tdL}>Currency</td><td style={tdV}>{workorder.currency || 'N/A'}</td></tr>
              <tr><td style={tdL}>Quotation Required</td><td style={tdV}>{workorder.require_quotation ? 'Yes' : 'No'}</td></tr>
              <tr><td style={tdL}>Payment Requisition</td><td style={tdV}>{workorder.payment_requisition ? 'Yes' : 'No'}</td></tr>
              <tr><td style={tdL}>Work Order Required</td><td style={tdV}>{workorder.wo_required ? 'Yes' : 'No'}</td></tr>
            </tbody>
          </table>

          {/* ── Facility & Asset ── */}
          {(workorder.facility_detail || workorder.asset_detail) && (
            <>
              <div className="section-header" style={sectionStyle()}>Facility &amp; Asset</div>
              <table className="details-table" style={tableStyle}>
                <tbody>
                  {workorder.facility_detail && (
                    <>
                      <tr><td style={tdL}>Facility</td><td style={tdV}>{workorder.facility_detail.name}</td></tr>
                      {workorder.facility_detail.code && (
                        <tr><td style={tdL}>Facility Code</td><td style={tdV}>{workorder.facility_detail.code}</td></tr>
                      )}
                    </>
                  )}
                  {workorder.asset_detail && (
                    <>
                      <tr><td style={tdL}>Asset Name</td><td style={tdV}>{workorder.asset_detail.asset_name || 'N/A'}</td></tr>
                      <tr><td style={tdL}>Asset Type</td><td style={tdV}>{workorder.asset_detail.asset_type || 'N/A'}</td></tr>
                      <tr><td style={tdL}>Asset Tag</td><td style={tdV}>{workorder.asset_detail.asset_tag || 'N/A'}</td></tr>
                      <tr><td style={tdL}>Serial Number</td><td style={tdV}>{workorder.asset_detail.serial_number || 'N/A'}</td></tr>
                    </>
                  )}
                </tbody>
              </table>
            </>
          )}

          {/* ── Assignee ── */}
          {workorder.request_to_detail && (
            <>
              <div className="section-header" style={sectionStyle()}>Assignee</div>
              <table className="details-table" style={tableStyle}>
                <tbody>
                  <tr>
                    <td style={tdL}>Assigned To</td>
                    <td style={tdV}>{workorder.request_to_detail.first_name} {workorder.request_to_detail.last_name}</td>
                  </tr>
                  {workorder.request_to_detail.email && (
                    <tr><td style={tdL}>Email</td><td style={tdV}>{workorder.request_to_detail.email}</td></tr>
                  )}
                </tbody>
              </table>
            </>
          )}

          {/* ── Source Work Request ── */}
          {workorder.source_work_request_detail && (
            <>
              <div className="section-header" style={sectionStyle()}>Source Work Request</div>
              <table className="details-table" style={tableStyle}>
                <tbody>
                  <tr>
                    <td style={tdL}>Request Number</td>
                    <td style={tdV}>{workorder.source_work_request_detail.work_request_number}</td>
                  </tr>
                  {workorder.source_work_request_detail.po_number && (
                    <tr>
                      <td style={tdL}>PO Number</td>
                      <td style={{ ...tdV, fontWeight: 600 }}>{workorder.source_work_request_detail.po_number}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}

          {/* ── Approvals & Assignments ── */}
          <div className="section-header" style={sectionStyle()}>Approvals &amp; Assignments</div>
          <table className="approvals-table" style={tableStyle}>
            <thead>
              <tr>
                {['#', 'Role', 'Name', 'Status'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workorder.requester_detail && (
                <tr>
                  <td style={tdCell}>1</td>
                  <td style={tdCell}>Requester</td>
                  <td style={tdCell}>{workorder.requester_detail.first_name} {workorder.requester_detail.last_name}</td>
                  <td style={tdCell}><span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 }}>Submitted</span></td>
                </tr>
              )}
              {workorder.reviewers_detail && workorder.reviewers_detail.length > 0
                ? workorder.reviewers_detail.map((reviewer, index) => (
                  <tr key={reviewer.id}>
                    <td style={tdCell}>{workorder.requester_detail ? index + 2 : index + 1}</td>
                    <td style={tdCell}>Reviewer</td>
                    <td style={tdCell}>{reviewer.first_name} {reviewer.last_name}</td>
                    <td style={tdCell}>
                      <span style={{ background: workorder.is_reviewed ? '#dcfce7' : '#fef9c3', color: workorder.is_reviewed ? '#15803d' : '#92400e', padding: '2px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600 }}>
                        {workorder.is_reviewed ? 'Reviewed' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
                : (
                  <tr>
                    <td style={tdCell}>{workorder.requester_detail ? '2' : '1'}</td>
                    <td style={tdCell}>Reviewer</td>
                    <td style={{ ...tdCell, color: '#9ca3af', fontStyle: 'italic' }}>No reviewers assigned</td>
                    <td style={tdCell}>—</td>
                  </tr>
                )
              }
              <tr>
                <td colSpan={3} style={{ ...tdCell, fontWeight: 700, textAlign: 'right', background: '#f9fafb' }}>Overall Approval Status</td>
                <td style={tdCell}><span style={getStatusBadgeStyle(workorder.approval_status)}>{workorder.approval_status || 'Pending'}</span></td>
              </tr>
            </tbody>
          </table>

          {/* ── Rejection Details (conditional) ── */}
          {(workorder.reviewer_reason || workorder.approver_reason) && (
            <>
              <div className="section-header-red" style={sectionStyle(false, true)}>Rejection Details</div>
              <table className="details-table" style={tableStyle}>
                <tbody>
                  {workorder.reviewer_reason && (
                    <tr>
                      <td style={{ ...tdL, background: '#fef2f2' }}>Reviewer Reason</td>
                      <td style={tdV}>{workorder.reviewer_reason}</td>
                    </tr>
                  )}
                  {workorder.approver_reason && (
                    <tr>
                      <td style={{ ...tdL, background: '#fef2f2' }}>Approver Reason</td>
                      <td style={tdV}>{workorder.approver_reason}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}

          {/* ── Signature Section ── */}
          <div className="signature-section" style={{ marginTop: '56px', display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <div className="signature-box" style={{ flex: 1 }}>
              <strong style={{ display: 'block', marginBottom: '36px', fontSize: '12px', color: '#374151' }}>Requested By:</strong>
              <div className="signature-line" style={{ borderTop: '1px solid #9ca3af', paddingTop: '6px', fontSize: '11px', color: '#6b7280' }}>
                {workorder.requester_detail ? `${workorder.requester_detail.first_name} ${workorder.requester_detail.last_name}` : ''}
              </div>
            </div>
            <div className="signature-box" style={{ flex: 1 }}>
              <strong style={{ display: 'block', marginBottom: '36px', fontSize: '12px', color: '#374151' }}>Reviewed By:</strong>
              <div className="signature-line" style={{ borderTop: '1px solid #9ca3af', paddingTop: '6px', fontSize: '11px', color: '#6b7280' }}>
                {workorder.reviewers_detail && workorder.reviewers_detail.length > 0
                  ? workorder.reviewers_detail.map(r => `${r.first_name} ${r.last_name}`).join(', ')
                  : ''}
              </div>
            </div>
            <div className="signature-box" style={{ flex: 1 }}>
              <strong style={{ display: 'block', marginBottom: '36px', fontSize: '12px', color: '#374151' }}>Approved By:</strong>
              <div className="signature-line" style={{ borderTop: '1px solid #9ca3af', paddingTop: '6px', fontSize: '11px', color: '#6b7280' }}>
                {workorder.digital_signature || ''}
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="footer" style={{ marginTop: '40px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '10px', color: '#9ca3af' }}>
            This document was generated from AlphaCMMS on {format(new Date(), 'MMM dd, yyyy HH:mm')}. For internal use only.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkorderPrintView;
