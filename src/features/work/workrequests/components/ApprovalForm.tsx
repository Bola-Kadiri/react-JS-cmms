import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import {
  useReviewerApprove,
  useReviewerReject,
  useFinalApprove,
  useFinalReject,
} from '@/hooks/workrequest/useWorkrequestQueries';
import { toast } from '@/components/ui/use-toast';

export type ApprovalAction =
  | 'reviewer-approve'
  | 'reviewer-reject'
  | 'final-approve'
  | 'final-reject';

interface ApprovalFormProps {
  isOpen: boolean;
  onClose: () => void;
  workrequestSlug: string;
  workrequestNumber: string;
  action: ApprovalAction;
}

const rejectSchema = z.object({ reason: z.string().min(1, 'Reason is required') });
const signatureSchema = z.object({ digital_signature: z.string().min(1, 'Signature is required') });

type RejectValues = z.infer<typeof rejectSchema>;
type SignatureValues = z.infer<typeof signatureSchema>;

const ACTION_META: Record<ApprovalAction, { title: string; description: string; confirmLabel: string; isApprove: boolean }> = {
  'reviewer-approve': {
    title: 'Approve — Three-Way Audit',
    description: 'Confirm the original request, PO, and invoice all match. This moves the request to final approval.',
    confirmLabel: 'Confirm Approval',
    isApprove: true,
  },
  'reviewer-reject': {
    title: 'Reject — Discrepancy Found',
    description: 'Log the specific discrepancy. The Requester will be notified to correct and resubmit.',
    confirmLabel: 'Reject Request',
    isApprove: false,
  },
  'final-approve': {
    title: 'Final Executive Approval',
    description: 'Sign off with your full name. This commits the request to the ledger permanently.',
    confirmLabel: 'Sign & Approve',
    isApprove: true,
  },
  'final-reject': {
    title: 'Reject — Executive Decision',
    description: 'Provide a mandatory reason. The request will be sent to the remediation queue.',
    confirmLabel: 'Reject Request',
    isApprove: false,
  },
};

export const ApprovalForm = ({
  isOpen,
  onClose,
  workrequestSlug,
  workrequestNumber,
  action,
}: ApprovalFormProps) => {
  const reviewerApproveMutation = useReviewerApprove();
  const reviewerRejectMutation = useReviewerReject();
  const finalApproveMutation = useFinalApprove();
  const finalRejectMutation = useFinalReject();

  const rejectForm = useForm<RejectValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: '' },
  });

  const signatureForm = useForm<SignatureValues>({
    resolver: zodResolver(signatureSchema),
    defaultValues: { digital_signature: '' },
  });

  const meta = ACTION_META[action];

  const isPending =
    reviewerApproveMutation.isPending ||
    reviewerRejectMutation.isPending ||
    finalApproveMutation.isPending ||
    finalRejectMutation.isPending;

  const handleClose = () => {
    rejectForm.reset();
    signatureForm.reset();
    onClose();
  };

  const handleReviewerApprove = async () => {
    try {
      await reviewerApproveMutation.mutateAsync(workrequestSlug);
      handleClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.error || 'Failed to approve', variant: 'destructive' });
    }
  };

  const handleReviewerReject = async (data: RejectValues) => {
    try {
      await reviewerRejectMutation.mutateAsync({ slug: workrequestSlug, data: { reviewer_reason: data.reason } });
      handleClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.error || 'Failed to reject', variant: 'destructive' });
    }
  };

  const handleFinalApprove = async () => {
    try {
      await finalApproveMutation.mutateAsync({ slug: workrequestSlug, data: { digital_signature: '' } });
      handleClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.error || 'Failed to approve', variant: 'destructive' });
    }
  };

  const handleFinalReject = async (data: RejectValues) => {
    try {
      await finalRejectMutation.mutateAsync({ slug: workrequestSlug, data: { approver_reason: data.reason } });
      handleClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.error || 'Failed to reject', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${meta.isApprove ? 'text-green-700' : 'text-red-700'}`}>
            {meta.isApprove
              ? <CheckCircle className="h-5 w-5" />
              : <XCircle className="h-5 w-5" />
            }
            {meta.title}
          </DialogTitle>
          <DialogDescription>
            {meta.description} (#{workrequestNumber})
          </DialogDescription>
        </DialogHeader>

        {/* Reviewer Approve — just a confirm */}
        {action === 'reviewer-approve' && (
          <div className="py-4">
            <p className="text-sm text-gray-700 bg-green-50 border border-green-200 rounded-lg p-4">
              You are confirming that the original request, generated PO, and vendor invoice all match. This action is irreversible.
            </p>
            <DialogFooter className="flex gap-3 pt-6">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>Cancel</Button>
              <Button onClick={handleReviewerApprove} disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {meta.confirmLabel}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Reviewer Reject — requires reason */}
        {action === 'reviewer-reject' && (
          <Form {...rejectForm}>
            <form onSubmit={rejectForm.handleSubmit(handleReviewerReject)} className="space-y-4">
              <FormField control={rejectForm.control} name="reason" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Discrepancy Description<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe exactly what doesn't match..." {...field} className="min-h-[100px] resize-y" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>Cancel</Button>
                <Button type="submit" disabled={isPending} variant="destructive">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {meta.confirmLabel}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {/* Final Approve — one-click confirm */}
        {action === 'final-approve' && (
          <div className="py-4">
            <p className="text-sm text-gray-700 bg-green-50 border border-green-200 rounded-lg p-4">
              You are giving final approval for request #{workrequestNumber}. This commits the request to the ledger permanently and is irreversible.
            </p>
            <DialogFooter className="flex gap-3 pt-6">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>Cancel</Button>
              <Button onClick={handleFinalApprove} disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Approve
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Final Reject — requires reason */}
        {action === 'final-reject' && (
          <Form {...rejectForm}>
            <form onSubmit={rejectForm.handleSubmit(handleFinalReject)} className="space-y-4">
              <FormField control={rejectForm.control} name="reason" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Rejection Reason<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="State the reason for rejection..." {...field} className="min-h-[100px] resize-y" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>Cancel</Button>
                <Button type="submit" disabled={isPending} variant="destructive">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {meta.confirmLabel}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
