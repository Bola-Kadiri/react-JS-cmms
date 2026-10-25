// src/features/my-tasks/MyTasksPage.tsx
// Everything waiting on this person in the five-stage flow, oldest first.
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Inbox, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchMyTasks, MyTask } from '@/services/workRequestFlowApi';

const TIMING = {
  on_time: { label: 'On time', className: 'bg-green-100 text-green-800 border-green-200' },
  reminder: { label: 'Due soon', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  late: { label: 'Late', className: 'bg-red-100 text-red-800 border-red-200' },
};

const WHAT_TO_DO: Record<MyTask['step'], string> = {
  requester: 'Fix and resubmit',
  approver: 'Review',
  client_rep: 'Approve or reject',
  procurement: 'Price it and submit',
  contractor: 'Accept the job',
  central_operation: 'Verify the work on site',
  ap_officer: 'Check the invoice',
  head_of_finance: 'Approve the invoice',
  reviewer: 'Check the payment voucher',
};

const TITLE: Record<MyTask['kind'], string> = {
  work_request: 'Work Request',
  work_order: 'Work Order',
  work_order_to_raise: 'Work Request',
  wcc: 'Certificate',
  wcc_to_raise: 'Work Order',
  invoice: 'Invoice',
  invoice_to_raise: 'Certificate',
  voucher: 'Voucher',
  voucher_to_raise: 'Invoice',
};

const linkFor = (task: MyTask) =>
  task.kind === 'work_order' || task.kind === 'wcc_to_raise' ? `/dashboard/work/orders/view/${task.slug}`
    : task.kind === 'wcc' ? `/dashboard/work/work-order-completions/${task.slug}`
    : task.kind === 'work_order_to_raise' ? '/dashboard/procurement-queue'
    : task.kind === 'invoice' ? `/dashboard/work/invoice-items/${task.slug}`
    : task.kind === 'invoice_to_raise' ? '/dashboard/work/invoice-items/to-invoice'
    : task.kind === 'voucher' ? `/dashboard/payments/${task.slug}`
    : task.kind === 'voucher_to_raise' ? '/dashboard/payments'
    : `/dashboard/work/requests/view/${task.slug}`;

const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

const MyTasksPage = () => {
  const navigate = useNavigate();
  const { data: tasks = [], isLoading } = useQuery({ queryKey: ['my-tasks'], queryFn: fetchMyTasks, refetchInterval: 60_000 });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="mt-2 text-gray-600">Everything waiting for you, oldest first.</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <Table>
          <TableHeader className="bg-green-50">
            <TableRow>
              <TableHead className="text-green-800">Job</TableHead>
              <TableHead className="text-green-800">Facility</TableHead>
              <TableHead className="text-green-800">Your step</TableHead>
              <TableHead className="text-green-800">Waiting since</TableHead>
              <TableHead className="text-green-800">Time limit</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin inline text-green-600" /></TableCell></TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  <Inbox className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  Nothing is waiting for you. New jobs appear here as soon as they reach your step.
                </TableCell>
              </TableRow>
            ) : tasks.map((task) => (
              <TableRow key={`${task.kind}-${task.id}`}>
                <TableCell>
                  <div className="font-semibold">{TITLE[task.kind]} {task.number}</div>
                  <div className="text-xs text-gray-500 max-w-xs truncate">{task.description}</div>
                </TableCell>
                <TableCell>{task.facility ?? '—'}</TableCell>
                <TableCell>
                  <div className="font-medium">{task.kind === 'work_order_to_raise' ? 'Create the Work Order'
                    : task.kind === 'wcc_to_raise' ? 'Raise the completion certificate'
                    : task.kind === 'invoice_to_raise' ? (task.step === 'ap_officer' ? 'Enter the invoice for the vendor' : 'Submit your invoice')
                    : task.kind === 'invoice' && ['Draft', 'Returned'].includes(task.status) ? 'Complete and submit the invoice'
                    : task.kind === 'voucher_to_raise' ? 'Raise the payment voucher'
                    : task.kind === 'voucher' && ['Draft', 'Returned'].includes(task.status) ? 'Complete and submit the voucher'
                    : task.kind === 'voucher' && task.status === 'Awaiting Approval' ? 'Approve the payment'
                    : task.kind === 'voucher' && ['Approved', 'Payment Failed'].includes(task.status) ? 'Pay and confirm Paid'
                    : task.kind === 'wcc' && task.step === 'approver' ? 'Approve the certificate'
                    : WHAT_TO_DO[task.step]}</div>
                  <div className="text-xs text-gray-500">
                    {task.step_label}{task.on_behalf_of ? ` · on behalf of ${task.on_behalf_of}` : ''}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">{when(task.waiting_since)}</TableCell>
                <TableCell>
                  {task.timing ? (
                    <Badge variant="outline" className={TIMING[task.timing.state].className}>
                      {TIMING[task.timing.state].label}
                    </Badge>
                  ) : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => navigate(linkFor(task))}>
                    Open
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MyTasksPage;
