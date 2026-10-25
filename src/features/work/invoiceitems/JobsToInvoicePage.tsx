// src/features/work/invoiceitems/JobsToInvoicePage.tsx
// Contractors: their approved jobs waiting for an invoice. AP Officers: the same, for vendors with no login.
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Inbox, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/contexts/PermissionsContext';
import { fetchJobsToInvoice, startInvoice } from '@/services/invoiceFlowApi';

const naira = (value?: string | null) => (value == null ? '—' : `₦${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

const JobsToInvoicePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userRole } = usePermissions();
  const isAp = userRole === 'AP OFFICER';
  const { data: rows = [], isLoading } = useQuery({ queryKey: ['jobs-to-invoice'], queryFn: fetchJobsToInvoice });

  const start = useMutation({
    mutationFn: (completionId: number) => startInvoice(completionId),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['jobs-to-invoice'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      navigate(`/dashboard/work/invoice-items/${created.id}`);
    },
    onError: (error: any) => toast.error(error?.response?.data?.error || 'Could not start the invoice.'),
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Jobs to invoice</h1>
        <p className="mt-2 text-gray-600">
          {isAp
            ? 'Approved jobs for vendors who have no login. Enter the invoice for them from their PDF.'
            : 'Your completed jobs whose completion certificate has been approved.'}
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <Table>
          <TableHeader className="bg-green-50">
            <TableRow>
              <TableHead className="text-green-800">Job</TableHead>
              <TableHead className="text-green-800">Facility</TableHead>
              {isAp && <TableHead className="text-green-800">Vendor</TableHead>}
              <TableHead className="text-green-800">Work Order amount</TableHead>
              <TableHead className="text-green-800">Approved</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin inline text-green-600" /></TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  <Inbox className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  Nothing to invoice right now.
                </TableCell>
              </TableRow>
            ) : rows.map((row) => (
              <TableRow key={row.completion_id}>
                <TableCell>
                  <div className="font-semibold">WCC-{row.wcc_number} · WO {row.work_order}</div>
                  <div className="text-xs text-gray-500 max-w-xs truncate">{row.description}</div>
                </TableCell>
                <TableCell>{row.facility ?? '—'}</TableCell>
                {isAp && <TableCell>{row.vendor ?? '—'}</TableCell>}
                <TableCell>{naira(row.amount)}</TableCell>
                <TableCell className="whitespace-nowrap">{when(row.approved_at)}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={start.isPending}
                          onClick={() => start.mutate(row.completion_id)}>
                    {start.isPending && start.variables === row.completion_id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isAp ? 'Enter invoice' : 'Submit invoice'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
        You can only invoice a job whose completion certificate has been approved, once, and for no more than the Work Order amount.
      </p>
    </div>
  );
};

export default JobsToInvoicePage;
