// src/features/payments/PaymentsPage.tsx
// Stage 5: approved invoices waiting for their payment voucher (AP raises them), and every voucher.
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Banknote, Inbox, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/contexts/PermissionsContext';
import { fetchInvoicesToPay, fetchVouchers, startVoucher } from '@/services/paymentFlowApi';
import { STATUS_STYLE, errorMessage, naira, when } from './format';

const PaymentsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userRole } = usePermissions();
  const isAp = userRole === 'AP OFFICER';
  const canPay = ['HEAD OF FINANCE & TREASURY', 'AP OFFICER'].includes(userRole ?? '');

  const { data: toRaise = [] } = useQuery({ queryKey: ['invoices-to-pay'], queryFn: fetchInvoicesToPay, enabled: isAp });
  const { data: vouchers = [], isLoading } = useQuery({ queryKey: ['payment-vouchers'], queryFn: fetchVouchers });

  const start = useMutation({
    mutationFn: (invoiceId: number) => startVoucher(invoiceId),
    onSuccess: (voucher) => {
      queryClient.invalidateQueries({ queryKey: ['invoices-to-pay'] });
      queryClient.invalidateQueries({ queryKey: ['payment-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      navigate(`/dashboard/payments/${voucher.id}`);
    },
    onError: (error) => toast.error(errorMessage(error, 'Could not raise the voucher.')),
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="mt-2 text-gray-600">Payment vouchers for approved vendor invoices.</p>
        </div>
        {canPay && (
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate('/dashboard/payments/pay')}>
            <Banknote className="mr-2 h-4 w-4" /> Pay and confirm
          </Button>
        )}
      </div>

      {isAp && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-5 bg-green-50 border-b border-green-100">
            <h2 className="text-lg font-semibold text-green-800">Approved invoices to pay</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Invoice</TableHead><TableHead>Vendor</TableHead><TableHead>Facility</TableHead>
                <TableHead>Total</TableHead><TableHead>Approved</TableHead><TableHead />
              </TableRow></TableHeader>
              <TableBody>
                {toRaise.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No approved invoices waiting for a voucher.</TableCell></TableRow>
                ) : toRaise.map((row) => (
                  <TableRow key={row.invoice_id}>
                    <TableCell>
                      <div className="font-semibold">{row.vendor_invoice_number || row.invoice_number}</div>
                      <div className="text-xs text-gray-500 max-w-xs truncate">{row.description}</div>
                    </TableCell>
                    <TableCell>{row.vendor ?? '—'}</TableCell>
                    <TableCell>{row.facility ?? '—'}</TableCell>
                    <TableCell>{naira(row.total)}</TableCell>
                    <TableCell className="whitespace-nowrap">{when(row.approved_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={start.isPending}
                              onClick={() => start.mutate(row.invoice_id)}>
                        {start.isPending && start.variables === row.invoice_id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Raise voucher
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-5 bg-green-50 border-b border-green-100">
          <h2 className="text-lg font-semibold text-green-800">Payment vouchers</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Voucher</TableHead><TableHead>Payee</TableHead><TableHead>Facility</TableHead>
              <TableHead>Net to pay</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin inline text-green-600" /></TableCell></TableRow>
              ) : vouchers.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12 text-gray-500">
                  <Inbox className="h-8 w-8 mx-auto mb-2 text-gray-400" /> No payment vouchers yet.
                </TableCell></TableRow>
              ) : vouchers.map((v) => (
                <TableRow key={v.id} className="cursor-pointer hover:bg-green-50" onClick={() => navigate(`/dashboard/payments/${v.id}`)}>
                  <TableCell>
                    <div className="font-semibold text-green-700">{v.number}</div>
                    <div className="text-xs text-gray-500">{v.invoice}</div>
                  </TableCell>
                  <TableCell>{v.vendor}</TableCell>
                  <TableCell>{v.facility ?? '—'}</TableCell>
                  <TableCell>{naira(v.net_amount)}</TableCell>
                  <TableCell><Badge variant="outline" className={STATUS_STYLE[v.status]}>{v.status_label}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
