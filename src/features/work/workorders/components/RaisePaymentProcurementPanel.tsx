// src/features/work/workorders/components/RaisePaymentProcurementPanel.tsx
// Raise Payment bills of NGN 100,000 or more: Procurement & Store adds the PO number and the
// quotation before the Approver acts, or returns the bill to the Requester with a reason.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, Clock, FileText, Loader2, Send, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Workorder } from '@/types/workorder';
import { procurementReturnWorkorder, procurementSubmitWorkorder, raisePaymentResubmitWorkorder } from '@/services/workordersApi';
import { workorderKeys } from '@/hooks/workorder/useWorkorderQueries';

interface Props {
  workorder: Workorder;
  userRole: string;
  currentUserId: number;
}

const errorText = (error: any) => {
  const data = error?.response?.data;
  if (!data) return 'Could not complete the action. Please try again.';
  if (data.error) return data.error as string;
  return Object.values(data).flat().join(' ');
};

const RaisePaymentProcurementPanel = ({ workorder, userRole, currentUserId }: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [poNumber, setPoNumber] = useState('');
  const [quotationRef, setQuotationRef] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [returnOpen, setReturnOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const isRaiser = workorder.requester === currentUserId || workorder.owner === currentUserId;
  const canProcure = ['PROCUREMENT AND STORE', 'ADMIN', 'SUPER ADMIN'].includes(userRole) && !isRaiser;
  const canResubmit = isRaiser || ['ADMIN', 'SUPER ADMIN'].includes(userRole);
  const status = workorder.approval_status;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: workorderKeys.all });
    queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
  };
  const onError = (e: any) => { setError(errorText(e)); toast.error(errorText(e)); };

  const submit = useMutation({
    mutationFn: () => procurementSubmitWorkorder(workorder.slug, { po_number: poNumber, quotation_reference: quotationRef, quotation_file: file }),
    onSuccess: () => { refresh(); toast.success('PO and quotation added. The Approver has been told.'); setError(''); },
    onError,
  });
  const giveBack = useMutation({
    mutationFn: () => procurementReturnWorkorder(workorder.slug, reason),
    onSuccess: () => { refresh(); toast.success('Returned to the Requester'); setReturnOpen(false); setError(''); },
    onError,
  });
  const resubmit = useMutation({
    mutationFn: () => raisePaymentResubmitWorkorder(workorder.slug),
    onSuccess: () => { refresh(); toast.success('Bill resubmitted'); setError(''); },
    onError,
  });

  const missing = [!poNumber.trim() && 'Enter the PO number.', !file && 'Attach the quotation.'].filter(Boolean) as string[];

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden mb-6">
      <div className="p-4 bg-green-50 border-b border-green-100 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-green-800">Procurement &amp; Store · PO and quotation</h2>
        <span className="text-xs text-gray-600">Needed for bills of NGN 100,000 or more</span>
      </div>
      <div className="p-4 space-y-4 text-sm">
        {/* Done */}
        {workorder.procurement_at && status !== 'Awaiting Procurement' && (
          <div className="grid gap-3 md:grid-cols-4">
            <div><p className="text-xs text-gray-500">PO number</p><p className="font-medium">{workorder.po_number || '—'}</p></div>
            <div><p className="text-xs text-gray-500">Quotation reference</p><p className="font-medium">{workorder.quotation_reference || '—'}</p></div>
            <div><p className="text-xs text-gray-500">Quotation</p>
              {workorder.quotation_file
                ? <a href={workorder.quotation_file} target="_blank" rel="noreferrer" className="text-green-700 underline inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Open</a>
                : <p>—</p>}
            </div>
            <div><p className="text-xs text-gray-500">Added</p>
              <p className="font-medium flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> {format(new Date(workorder.procurement_at), 'PPP p')}</p>
            </div>
          </div>
        )}

        {/* Returned to the Requester */}
        {status === 'Procurement Returned' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 space-y-2">
            <p className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Returned by Procurement &amp; Store</p>
            {workorder.procurement_reason && <p>Reason: {workorder.procurement_reason}</p>}
            {canResubmit && (
              <div className="flex flex-wrap gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/work/orders/edit/${workorder.slug}`)}>Fix the bill</Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={resubmit.isPending} onClick={() => resubmit.mutate()}>
                  {resubmit.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Resubmit
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Waiting for Procurement */}
        {status === 'Awaiting Procurement' && !canProcure && (
          <p className="flex items-center gap-2 text-gray-700">
            <Clock className="h-4 w-4 text-amber-600" /> Waiting for Procurement &amp; Store to add the PO number and quotation. The Approver acts after them.
          </p>
        )}
        {status === 'Awaiting Procurement' && canProcure && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="po-number" className="font-medium text-gray-700">PO number<span className="text-red-500 ml-1">*</span></label>
                <Input id="po-number" value={poNumber} onChange={(e) => setPoNumber(e.target.value)} placeholder="e.g. PO-2026-0101" />
              </div>
              <div className="space-y-2">
                <label htmlFor="quote-ref" className="font-medium text-gray-700">Quotation reference</label>
                <Input id="quote-ref" value={quotationRef} onChange={(e) => setQuotationRef(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label htmlFor="quote-file" className="font-medium text-gray-700">Quotation<span className="text-red-500 ml-1">*</span></label>
                <Input id="quote-file" type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </div>
            </div>
            {error && <p className="text-red-600">{error}</p>}
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-50" onClick={() => { setReason(''); setReturnOpen(true); }}>
                Return to Requester
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={missing.length > 0 || submit.isPending}
                      title={missing.join(' ') || undefined} onClick={() => submit.mutate()}>
                {submit.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Submit to Approver
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700"><XCircle className="h-5 w-5" /> Return to Requester</DialogTitle>
            <DialogDescription>Say what needs fixing on {workorder.work_order_number}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="return-reason" className="text-sm font-medium text-gray-700">Reason<span className="text-red-500 ml-1">*</span></label>
            <Textarea id="return-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[100px]" />
            {error && returnOpen && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setReturnOpen(false)} disabled={giveBack.isPending}>Cancel</Button>
            <Button variant="destructive" disabled={!reason.trim() || giveBack.isPending} onClick={() => giveBack.mutate()}>
              {giveBack.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Return bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RaisePaymentProcurementPanel;
