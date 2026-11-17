// src/features/work/workorders/components/RaisePaymentProcurementPanel.tsx
// Raise Payment bills of NGN 100,000 or more: Procurement & Store adds the PO number and the
// quotation before the Approver acts, or returns the bill to the Requester with a reason.
// A "PO needed" switch lets them say the bill needs no PO: they then price it as quote lines
// (item, quantity, amount) and the lines' total is the quotation amount.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, Clock, FileText, Loader2, Plus, Send, Trash2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Workorder } from '@/types/workorder';
import { procurementReturnWorkorder, procurementSubmitWorkorder, raisePaymentResubmitWorkorder } from '@/services/workordersApi';
import { workorderKeys } from '@/hooks/workorder/useWorkorderQueries';
import { procurementSubmitWithoutPo, RaisePaymentQuoteLine } from '@/services/raisePaymentProcurementApi';

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
  const [poFile, setPoFile] = useState<File | null>(null);
  const [quotationAmount, setQuotationAmount] = useState('');
  const [clientPrice, setClientPrice] = useState('');
  // On by default: the bill needs a PO, as before. Off: priced as quote lines instead.
  const [poNeeded, setPoNeeded] = useState(true);
  const blankLine = (): RaisePaymentQuoteLine => ({ description: '', quantity: '1', amount: '' });
  const [lines, setLines] = useState<RaisePaymentQuoteLine[]>([blankLine()]);
  const setLine = (index: number, patch: Partial<RaisePaymentQuoteLine>) =>
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)));
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
    mutationFn: () => (poNeeded
      ? procurementSubmitWorkorder(workorder.slug, {
        po_number: poNumber, po_document: poFile, quotation_amount: quotationAmount, client_price: clientPrice,
        quotation_reference: quotationRef,
      })
      : procurementSubmitWithoutPo(workorder.slug, {
        lines: lines.map((line) => ({ ...line, description: line.description.trim() })),
        client_price: clientPrice, quotation_reference: quotationRef,
      })),
    onSuccess: () => {
      refresh();
      toast.success(poNeeded ? 'PO and quotation added. The Approver has been told.' : 'Quotation added. The Approver has been told.');
      setError('');
    },
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

  // The quotation amount must match the bill amount; the confirmed amount is what is paid.
  const billAmount = Number(workorder.cost ?? 0);
  const money = (value: number) => `${workorder.currency ?? 'NGN'} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const sameAsBill = (value: number) => Math.round(value * 100) === Math.round(billAmount * 100);
  const mismatch = quotationAmount !== '' && !sameAsBill(Number(quotationAmount));
  // No PO: each line is quantity x amount, and the lines' total is the quotation amount.
  const lineTotal = (line: RaisePaymentQuoteLine) => (Number(line.quantity) || 0) * (Number(line.amount) || 0);
  const linesTotal = lines.reduce((sum, line) => sum + lineTotal(line), 0);
  const linesIncomplete = lines.length === 0 || lines.some(
    (line) => !line.description.trim() || !(Number(line.quantity) > 0) || line.amount === '' || Number(line.amount) < 0,
  );
  const linesMismatch = !linesIncomplete && !sameAsBill(linesTotal);
  const clientPriceMissing = (clientPrice === '' || Number(clientPrice) < 0) && 'Enter the cost to client (0 if the client is not charged).';
  const missing = (poNeeded
    ? [
      !poNumber.trim() && 'Enter the PO number.',
      !poFile && 'Attach the PO.',
      (quotationAmount === '' || Number(quotationAmount) <= 0) && 'Enter the quotation amount.',
      mismatch && 'The quotation amount must match the bill amount.',
      clientPriceMissing,
    ]
    : [
      linesIncomplete && 'Give every quote line an item, a quantity and an amount.',
      linesMismatch && 'The total must match the bill amount.',
      clientPriceMissing,
    ]).filter(Boolean) as string[];
  const fadedWhenNoPo = poNeeded ? '' : 'opacity-40 pointer-events-none select-none';

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden mb-6">
      <div className="p-4 bg-green-50 border-b border-green-100 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-green-800">Procurement &amp; Store · PO and quotation</h2>
        <span className="text-xs text-gray-600">Needed for bills of NGN 100,000 or more</span>
      </div>
      <div className="p-4 space-y-4 text-sm">
        {/* Done */}
        {workorder.procurement_at && status !== 'Awaiting Procurement' && (
          <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-6">
            {workorder.no_po_needed ? (
              <div className="md:col-span-2"><p className="text-xs text-gray-500">PO</p>
                <p className="font-medium">No PO required</p>
              </div>
            ) : (
              <>
                <div><p className="text-xs text-gray-500">PO number</p><p className="font-medium">{workorder.po_number || '—'}</p></div>
                <div><p className="text-xs text-gray-500">PO</p>
                  {workorder.po_document
                    ? <a href={workorder.po_document} target="_blank" rel="noreferrer" className="text-green-700 underline inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Open</a>
                    : <p>—</p>}
                </div>
              </>
            )}
            <div><p className="text-xs text-gray-500">Quotation amount</p>
              <p className="font-medium">{workorder.quotation_amount ? money(Number(workorder.quotation_amount)) : '—'}</p>
            </div>
            <div><p className="text-xs text-gray-500">Cost to client</p>
              <p className="font-medium">{workorder.client_price != null ? money(Number(workorder.client_price)) : '—'}</p>
            </div>
            <div><p className="text-xs text-gray-500">Quotation reference</p>
              <p className="font-medium">{workorder.quotation_reference || '—'}</p>
              {/* Earlier bills had the quotation attached as a file. */}
              {workorder.quotation_file && (
                <a href={workorder.quotation_file} target="_blank" rel="noreferrer" className="text-green-700 underline inline-flex items-center gap-1 text-xs"><FileText className="h-3 w-3" /> Quotation file</a>
              )}
            </div>
            <div><p className="text-xs text-gray-500">Added</p>
              <p className="font-medium flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> {format(new Date(workorder.procurement_at), 'PPP p')}</p>
            </div>
          </div>
          {workorder.no_po_needed && (workorder.raise_payment_lines?.length ?? 0) > 0 && (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-green-50 text-green-800">
                  <tr>
                    <th className="text-left font-semibold px-4 py-2">Item</th>
                    <th className="text-right font-semibold px-4 py-2">Qty</th>
                    <th className="text-right font-semibold px-4 py-2">Amount</th>
                    <th className="text-right font-semibold px-4 py-2">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {workorder.raise_payment_lines!.map((line) => (
                    <tr key={line.id} className="border-t">
                      <td className="px-4 py-2">{line.description}</td>
                      <td className="px-4 py-2 text-right">{Number(line.quantity).toLocaleString()}</td>
                      <td className="px-4 py-2 text-right">{money(Number(line.amount))}</td>
                      <td className="px-4 py-2 text-right">{money(Number(line.total))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t px-4 py-2 text-right">
                Total <span className="font-semibold">{money(workorder.raise_payment_lines!.reduce((sum, line) => sum + Number(line.total), 0))}</span>
              </p>
            </div>
          )}
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
            {/* Does this bill need a PO? */}
            <div className="flex items-center justify-between gap-4 rounded-lg border bg-gray-50 px-4 py-3">
              <div>
                <label htmlFor="po-needed" className="font-medium text-gray-800 cursor-pointer">This bill needs a PO</label>
                <p className="text-xs text-gray-500">
                  {poNeeded ? 'Add the PO number and document.' : 'No PO: list what is being paid for below instead.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${poNeeded ? 'text-green-700' : 'text-gray-500'}`}>{poNeeded ? 'Yes' : 'No'}</span>
                <Switch id="po-needed" checked={poNeeded} onCheckedChange={(on) => { setPoNeeded(on); setError(''); }}
                        className="data-[state=checked]:bg-green-600" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className={`space-y-2 transition-opacity ${fadedWhenNoPo}`} aria-disabled={!poNeeded}>
                <label htmlFor="po-number" className="font-medium text-gray-700">
                  PO number{poNeeded ? <span className="text-red-500 ml-1">*</span> : <span className="ml-2 text-xs font-normal text-gray-500">Not needed</span>}
                </label>
                <Input id="po-number" value={poNeeded ? poNumber : ''} disabled={!poNeeded} onChange={(e) => setPoNumber(e.target.value)} placeholder="e.g. PO-2026-0101" />
              </div>
              <div className={`space-y-2 transition-opacity ${fadedWhenNoPo}`} aria-disabled={!poNeeded}>
                <label htmlFor="po-file" className="font-medium text-gray-700">
                  PO document{poNeeded ? <span className="text-red-500 ml-1">*</span> : <span className="ml-2 text-xs font-normal text-gray-500">Not needed</span>}
                </label>
                <Input id="po-file" type="file" accept=".pdf,.png,.jpg,.jpeg" disabled={!poNeeded} onChange={(e) => setPoFile(e.target.files?.[0] ?? null)} />
              </div>
              {!poNeeded && (
                <div className="md:col-span-2 space-y-3">
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-green-50 text-green-800">
                        <tr>
                          <th className="text-left font-semibold px-4 py-3">Item</th>
                          <th className="text-left font-semibold px-2 py-3 w-24">Qty</th>
                          <th className="text-left font-semibold px-2 py-3 w-40">Amount (₦)</th>
                          <th className="w-12" />
                        </tr>
                      </thead>
                      <tbody>
                        {lines.map((line, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-3">
                              <Input aria-label={`Item ${index + 1}`} value={line.description} onChange={(e) => setLine(index, { description: e.target.value })} />
                            </td>
                            <td className="px-2 py-3">
                              <Input aria-label={`Quantity ${index + 1}`} type="number" min="0" step="0.01" value={line.quantity}
                                     onChange={(e) => setLine(index, { quantity: e.target.value })} />
                            </td>
                            <td className="px-2 py-3">
                              <Input aria-label={`Amount ${index + 1}`} type="number" min="0" step="0.01" value={line.amount}
                                     onChange={(e) => setLine(index, { amount: e.target.value })} />
                            </td>
                            <td className="px-2 py-3 text-center">
                              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600"
                                      aria-label={`Remove line ${index + 1}`} disabled={lines.length === 1}
                                      onClick={() => setLines((current) => current.filter((_, i) => i !== index))}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Button type="button" variant="outline" onClick={() => setLines((current) => [...current, blankLine()])}>
                      <Plus className="mr-2 h-4 w-4" /> Add line
                    </Button>
                    <p>Total <span className="font-semibold">{money(linesTotal)}</span></p>
                  </div>
                  <p className={`text-xs ${linesMismatch ? 'text-red-600' : 'text-gray-500'}`}>
                    {linesMismatch
                      ? `The total does not match the bill amount of ${money(billAmount)}. Return the bill to the Requester if the bill is wrong.`
                      : `The total must match the bill amount of ${money(billAmount)}. This is the amount that will be paid.`}
                  </p>
                </div>
              )}
              {poNeeded && (
              <div className="space-y-2">
                <label htmlFor="quote-amount" className="font-medium text-gray-700">Quotation amount<span className="text-red-500 ml-1">*</span></label>
                <Input id="quote-amount" type="number" min="0" step="0.01" value={quotationAmount}
                       onChange={(e) => setQuotationAmount(e.target.value)} className={mismatch ? 'border-red-500' : ''} />
                <p className={`text-xs ${mismatch ? 'text-red-600' : 'text-gray-500'}`}>
                  {mismatch
                    ? `Does not match the bill amount of ${money(billAmount)}. Return the bill to the Requester if the bill is wrong.`
                    : `Must match the bill amount of ${money(billAmount)}. This is the amount that will be paid.`}
                </p>
              </div>
              )}
              <div className="space-y-2">
                <label htmlFor="client-price" className="font-medium text-gray-700">Cost to client<span className="text-red-500 ml-1">*</span></label>
                <Input id="client-price" type="number" min="0" step="0.01" value={clientPrice}
                       onChange={(e) => setClientPrice(e.target.value)} />
                <p className="text-xs text-gray-500">
                  What the client will be billed for this bill. Enter 0 if the client is not charged.
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="quote-ref" className="font-medium text-gray-700">Quotation reference</label>
                <Input id="quote-ref" value={quotationRef} onChange={(e) => setQuotationRef(e.target.value)} />
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
