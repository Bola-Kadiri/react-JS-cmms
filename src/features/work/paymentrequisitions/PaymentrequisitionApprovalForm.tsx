import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, XCircle, Landmark } from 'lucide-react';
import {
  useApprovePaymentrequisition,
  useRejectPaymentrequisition,
  useDisbursePaymentrequisition,
} from '@/hooks/paymentrequisition/usePaymentrequisitionQueries';
import { useFormatters } from '@/utils/formatters';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

export type PaymentrequisitionApprovalAction = 'approve' | 'reject' | 'disburse';

interface PaymentrequisitionApprovalFormProps {
  isOpen: boolean;
  onClose: () => void;
  requisitionId: string;
  requisitionNumber: string;
  action: PaymentrequisitionApprovalAction;
  amount?: string;
  currency?: 'NGN' | 'USD' | 'EUR' | 'GBP';
}

const rejectSchema = z.object({ comment: z.string().min(1, 'Reason is required') });
type RejectValues = z.infer<typeof rejectSchema>;

export const PaymentrequisitionApprovalForm = ({
  isOpen,
  onClose,
  requisitionId,
  requisitionNumber,
  action,
  amount,
  currency = 'NGN',
}: PaymentrequisitionApprovalFormProps) => {
  const { t } = useTypedTranslation('work');
  const { formatCurrency } = useFormatters();
  const approveMutation = useApprovePaymentrequisition(requisitionId);
  const rejectMutation = useRejectPaymentrequisition(requisitionId);
  const disburseMutation = useDisbursePaymentrequisition(requisitionId);

  const rejectForm = useForm<RejectValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { comment: '' },
  });

  const isPending = approveMutation.isPending || rejectMutation.isPending || disburseMutation.isPending;

  const handleClose = () => {
    rejectForm.reset();
    onClose();
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync();
      handleClose();
    } catch {
      // error surfaced by the mutation's own onError toast
    }
  };

  const handleReject = async (data: RejectValues) => {
    try {
      await rejectMutation.mutateAsync(data.comment);
      handleClose();
    } catch {
      // error surfaced by the mutation's own onError toast
    }
  };

  const handleDisburse = async () => {
    try {
      await disburseMutation.mutateAsync();
      handleClose();
    } catch {
      // error surfaced by the mutation's own onError toast
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${
            action === 'reject' ? 'text-red-700' : action === 'disburse' ? 'text-blue-700' : 'text-green-700'
          }`}>
            {action === 'reject'
              ? <XCircle className="h-5 w-5" />
              : action === 'disburse'
              ? <Landmark className="h-5 w-5" />
              : <CheckCircle className="h-5 w-5" />}
            {action === 'reject'
              ? t('paymentRequisition.detail.rejectDialog.title')
              : action === 'disburse'
              ? t('paymentRequisition.detail.disburseDialog.title')
              : t('paymentRequisition.detail.approveDialog.title')}
          </DialogTitle>
          <DialogDescription>
            #{requisitionNumber}
          </DialogDescription>
        </DialogHeader>

        {action === 'approve' && (
          <div className="py-4">
            <p className="text-sm text-gray-700 bg-green-50 border border-green-200 rounded-lg p-4">
              {amount
                ? t('paymentRequisition.detail.approveDialog.confirmingWithAmount', { amount: formatCurrency(Number(amount), currency) })
                : t('paymentRequisition.detail.approveDialog.description')}
            </p>
            <DialogFooter className="flex gap-3 pt-6">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                {t('common:actions.cancel')}
              </Button>
              <Button onClick={handleApprove} disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? t('paymentRequisition.detail.approveDialog.approving') : t('paymentRequisition.detail.approveDialog.confirm')}
              </Button>
            </DialogFooter>
          </div>
        )}

        {action === 'reject' && (
          <Form {...rejectForm}>
            <form onSubmit={rejectForm.handleSubmit(handleReject)} className="space-y-4">
              <FormField control={rejectForm.control} name="comment" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t('paymentRequisition.detail.rejectDialog.reasonLabel')}<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('paymentRequisition.detail.rejectDialog.reasonPlaceholder')} {...field} className="min-h-[100px] resize-y" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                  {t('common:actions.cancel')}
                </Button>
                <Button type="submit" disabled={isPending} variant="destructive">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isPending ? t('paymentRequisition.detail.rejectDialog.rejecting') : t('paymentRequisition.detail.rejectDialog.confirm')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {action === 'disburse' && (
          <div className="py-4">
            <p className="text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded-lg p-4">
              {t('paymentRequisition.detail.disburseDialog.description', {
                amount: amount ? formatCurrency(Number(amount), currency) : '',
              })}
            </p>
            <DialogFooter className="flex gap-3 pt-6">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                {t('common:actions.cancel')}
              </Button>
              <Button onClick={handleDisburse} disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? t('paymentRequisition.detail.disburseDialog.disbursing') : t('paymentRequisition.detail.disburseDialog.confirm')}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
