// src/features/work/workorders/ProcurementQueuePage.tsx
// Procurement & Store: client-approved Work Requests waiting for a Work Order, oldest first.
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Inbox, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchProcurementQueue, startWorkOrder } from '@/services/workOrderFlowApi';

const TIMING = {
  on_time: { label: 'On time', className: 'bg-green-100 text-green-800 border-green-200' },
  reminder: { label: 'Due soon', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  late: { label: 'Late', className: 'bg-red-100 text-red-800 border-red-200' },
};

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—');

const ProcurementQueuePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: rows = [], isLoading } = useQuery({ queryKey: ['procurement-queue'], queryFn: fetchProcurementQueue, refetchInterval: 60_000 });

  const start = useMutation({
    mutationFn: (slug: string) => startWorkOrder(slug),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['procurement-queue'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      navigate(`/dashboard/work/orders/view/${created.slug}`);
    },
    onError: (error: any) => toast.error(error?.response?.data?.error || 'Could not create the Work Order.'),
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Work Orders to raise</h1>
        <p className="mt-2 text-gray-600">Work Requests approved by the client, waiting for you to price them.</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <Table>
          <TableHeader className="bg-green-50">
            <TableRow>
              <TableHead className="text-green-800">Work Request</TableHead>
              <TableHead className="text-green-800">Facility</TableHead>
              <TableHead className="text-green-800">Category</TableHead>
              <TableHead className="text-green-800">Client approved</TableHead>
              <TableHead className="text-green-800">Time limit</TableHead>
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
                  Nothing to price. Client-approved Work Requests appear here.
                </TableCell>
              </TableRow>
            ) : rows.map((row) => (
              <TableRow key={row.slug}>
                <TableCell>
                  <div className="font-semibold">{row.number}</div>
                  <div className="text-xs text-gray-500 max-w-xs truncate">{row.description}</div>
                </TableCell>
                <TableCell>{row.facility ?? '—'}</TableCell>
                <TableCell>{row.category ?? '—'}</TableCell>
                <TableCell className="whitespace-nowrap">{when(row.client_approved_at)}</TableCell>
                <TableCell>
                  {row.timing ? <Badge variant="outline" className={TIMING[row.timing.state].className}>{TIMING[row.timing.state].label}</Badge> : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={start.isPending}
                          onClick={() => start.mutate(row.slug)}>
                    {start.isPending && start.variables === row.slug && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Work Order
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
        Anyone in Procurement &amp; Store can pick up a request. The Stage 2 clock starts when the client approved the request.
      </p>
    </div>
  );
};

export default ProcurementQueuePage;
