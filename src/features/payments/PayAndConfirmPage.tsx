// src/features/payments/PayAndConfirmPage.tsx
// Approved payments waiting to be paid. The Head of Finance & Treasury pays them in the bank portal, then
// confirms Paid here (one or a batch). AP Officers can attach the bank receipt but cannot confirm Paid.
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, Inbox, Loader2, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import MultiFileInput from '@/components/MultiFileInput';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { attachReceipt, confirmPaid, fetchVouchersToPay } from '@/services/paymentFlowApi';
import { STATUS_STYLE, errorMessage, naira, when } from './format';

const today = () => new Date().toISOString().slice(0, 10);

const PayAndConfirmPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: rows = [], isLoading } = useQuery({ queryKey: ['vouchers-to-pay'], queryFn: fetchVouchersToPay });
  const canPay = rows.some((r) => r.my_actions?.includes('pay'));

  const [selected, setSelected] = useState<number[]>([]);
  const [paymentDate, setPaymentDate] = useState(today());
  const [reference, setReference] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState('');

  const chosen = useMemo(() => rows.filter((r) => selected.includes(r.id)), [rows, selected]);
  const total = chosen.reduce((sum, r) => sum + Number(r.net_amount), 0);
  const missingReceipt = chosen.filter((r) => !r.receipts);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['vouchers-to-pay'] });
    queryClient.invalidateQueries({ queryKey: ['payment-vouchers'] });
    queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
  };

  const attach = useMutation({
    mutationFn: () => attachReceipt(selected, files),
    onSuccess: () => { refresh(); setFiles([]); toast.success(files.length > 1 ? 'Receipts attached' : 'Receipt attached'); setError(''); },
    onError: (e) => { setError(errorMessage(e)); toast.error(errorMessage(e)); },
  });
  const pay = useMutation({
    mutationFn: () => confirmPaid(selected, paymentDate, reference),
    onSuccess: (result) => {
      refresh();
      toast.success(result.message);
      setSelected([]);
      setReference('');
      setConfirmOpen(false);
      setError('');
    },
    onError: (e) => { setError(errorMessage(e)); toast.error(errorMessage(e)); },
  });

  const toggle = (id: number) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const problems = [
    !selected.length && 'Select at least one voucher.',
    !paymentDate && 'Enter the payment date.',
    paymentDate > today() && 'The payment date cannot be in the future.',
    !reference.trim() && 'Enter the bank batch reference.',
    missingReceipt.length > 0 && `Attach the bank receipt for ${missingReceipt.map((r) => r.number).join(', ')}.`,
  ].filter(Boolean) as string[];

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="outline" size="icon" aria-label="Go back" onClick={() => navigate('/dashboard/payments')} className="border-green-200 text-green-700">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-[240px]">
          <h1 className="text-3xl font-bold text-gray-900">Pay and confirm</h1>
          <p className="mt-1 text-gray-600">Payments approved and waiting to be paid. Pay in the bank portal first, then confirm here.</p>
        </div>
        {selected.length > 0 && <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">{selected.length} selected</Badge>}
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <Table>
          <TableHeader className="bg-green-50"><TableRow>
            <TableHead className="w-10" /><TableHead>Voucher</TableHead><TableHead>Payee</TableHead><TableHead>Bank</TableHead>
            <TableHead>Net to pay</TableHead><TableHead>Approved</TableHead><TableHead>Receipt</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin inline text-green-600" /></TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12 text-gray-500">
                <Inbox className="h-8 w-8 mx-auto mb-2 text-gray-400" /> Nothing waiting to be paid.
              </TableCell></TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Checkbox checked={selected.includes(r.id)} onCheckedChange={() => toggle(r.id)} aria-label={`Select ${r.number}`} />
                </TableCell>
                <TableCell>
                  <button type="button" className="font-semibold text-green-700 underline" onClick={() => navigate(`/dashboard/payments/${r.id}`)}>{r.number}</button>
                  <div className="text-xs text-gray-500">{r.invoice} · {r.description}</div>
                  {r.status === 'Payment Failed' && (
                    <Badge variant="outline" className={`mt-1 ${STATUS_STYLE['Payment Failed']}`}>Failed: {r.failure_reason}</Badge>
                  )}
                </TableCell>
                <TableCell>{r.vendor}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="font-medium">{r.account_number || '—'}</div>
                  <div className="text-xs text-gray-500">{r.bank} · {r.account_name}</div>
                </TableCell>
                <TableCell>{naira(r.net_amount)}</TableCell>
                <TableCell className="whitespace-nowrap">{when(r.approved_at)}</TableCell>
                <TableCell>{r.receipts ? <span className="text-green-700 text-sm">✓ {r.receipts}</span> : <span className="text-gray-400 text-sm">None</span>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selected.length > 0 && <p className="text-right text-sm text-gray-800">Selected total <strong>{naira(String(total))}</strong></p>}

      {rows.length > 0 && (
        <div className="rounded-lg border-2 border-green-600 bg-white shadow-sm overflow-hidden">
          <div className="p-5 bg-green-50 border-b border-green-100"><h2 className="text-lg font-semibold text-green-800">Payment record</h2></div>
          <div className="p-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="receipt" className="text-sm font-medium text-gray-700">Bank receipt / batch report<span className="text-red-500 ml-1">*</span></label>
                <MultiFileInput id="receipt" files={files} onChange={setFiles} accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx" />
                <Button variant="outline" size="sm" disabled={!files.length || !selected.length || attach.isPending} onClick={() => attach.mutate()}>
                  {attach.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Paperclip className="mr-2 h-4 w-4" />}
                  Attach to selected
                </Button>
              </div>
              {canPay && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="paid-on" className="text-sm font-medium text-gray-700">Payment date<span className="text-red-500 ml-1">*</span></label>
                    <Input id="paid-on" type="date" max={today()} value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="bank-ref" className="text-sm font-medium text-gray-700">Bank batch reference<span className="text-red-500 ml-1">*</span></label>
                    <Input id="bank-ref" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. ZEN-BATCH-B1031" />
                  </div>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
              AP OFFICER can attach the bank receipt but cannot confirm Paid. Each voucher gets its own time stamp.
              A job closes when its payment is confirmed, and REVIEWER checks every confirmed payment against the bank statement each month.
            </p>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {canPay && (
              <div className="flex justify-end">
                <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={problems.length > 0}
                        title={problems.join(' ') || undefined} onClick={() => setConfirmOpen(true)}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Confirm Paid for {selected.length || ''} {selected.length === 1 ? 'voucher' : 'vouchers'}
                </Button>
              </div>
            )}
            {canPay && selected.length > 0 && problems.length > 0 && (
              <ul className="text-sm text-red-700 list-disc pl-6">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
            )}
          </div>
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700"><CheckCircle className="h-5 w-5" /> Confirm Paid</DialogTitle>
            <DialogDescription>{selected.length} {selected.length === 1 ? 'voucher' : 'vouchers'} · {naira(String(total))}</DialogDescription>
          </DialogHeader>
          <div className="text-sm text-gray-700 bg-green-50 border border-green-200 rounded-lg p-4 space-y-1">
            {chosen.map((r) => <p key={r.id}>{r.number} · {r.vendor} · {naira(r.net_amount)}</p>)}
            <p className="pt-2">Paid {paymentDate} · reference {reference}</p>
            <p className="pt-2">Each job closes and each vendor is sent a remittance advice. This cannot be undone.</p>
          </div>
          <DialogFooter className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={pay.isPending}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={pay.isPending} onClick={() => pay.mutate()}>
              {pay.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayAndConfirmPage;
