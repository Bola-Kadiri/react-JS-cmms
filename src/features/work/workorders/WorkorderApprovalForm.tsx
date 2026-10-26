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
  useApproveByReviewer,
  useRejectByReviewer,
  useApproveByApprover,
  useRejectByApprover,
  useFinalApprove,
  useFinalReject,
} from '@/hooks/workorder/useWorkorderQueries';
import { toast } from '@/components/ui/use-toast';

export type WorkorderApprovalAction =
  | 'reviewer-approve'
  | 'reviewer-reject'
  | 'approver-approve'
  | 'approver-reject'
  | 'final-approve'
  | 'final-reject';

interface WorkorderApprovalFormProps {
  isOpen: boolean;
  onClose: () => void;
  workorderSlug: string;
  workorderNumber: string;
  action: WorkorderApprovalAction;
  // New Raise Payment bills: Approver acts first, then the Reviewer, then (for
  // bills of ₦100,000 or more) the second approver. Only changes the wording.
  approverFirst?: boolean;
  needsSecondApproval?: boolean;
}

const rejectSchema = z.object({ reason: z.string().min(1, 'Reason is required') });
const signatureSchema = z.object({ digital_signature: z.string().min(1, 'Signature is required') });

type RejectValues = z.infer<typeof rejectSchema>;
type SignatureValues = z.infer<typeof signatureSchema>;

const ACTION_META: Record<WorkorderApprovalAction, { title: string; description: string; confirmLabel: string; isApprove: boolean }> = {
  'reviewer-approve': {
    title: 'Approve — Confirm Review',
    description: 'Confirm that the work order details are correct and ready for final approval.',
    confirmLabel: 'Confirm Review',
    isApprove: true,
  },
  'reviewer-reject': {
    title: 'Reject — Reviewer Decision',
    description: 'Provide a mandatory reason. The work order will be returned for correction.',
    confirmLabel: 'Reject Work Order',
    isApprove: false,
  },
  'approver-approve': {
    title: 'Final Approval',
    description: 'Sign off with your full name to commit this work order. This action is permanent.',
    confirmLabel: 'Sign & Approve',
    isApprove: true,
  },
  'approver-reject': {
    title: 'Reject — Approver Decision',
    description: 'Provide a mandatory reason for rejection.',
    confirmLabel: 'Reject Work Order',
    isApprove: false,
  },
  'final-approve': {
    title: 'Final Approval',
    description: 'Give the final approval for this Raise Payment bill. The payment is raised and sent to Finance. This action is permanent.',
    confirmLabel: 'Sign & Give Final Approval',
    isApprove: true,
  },
  'final-reject': {
    title: 'Reject — Final Approver Decision',
    description: 'Provide a mandatory reason. No payment is raised and the Requester is notified.',
    confirmLabel: 'Reject Bill',
    isApprove: false,
  },
};

// Wording for new Raise Payment bills, where the Approver acts before the Reviewer.
const APPROVER_FIRST_META: Partial<Record<WorkorderApprovalAction, { description: string }>> = {
  'approver-approve': {
    description: 'Sign off with your full name to approve this bill. It then goes to the Reviewer.',
  },
  'reviewer-approve': {
    description: 'Confirm that the bill, amount and payee are correct.',
  },
};

export const WorkorderApprovalForm = ({
  isOpen,
  onClose,
  workorderSlug,
  workorderNumber,
  action,
  approverFirst = false,
  needsSecondApproval = false,
}: WorkorderApprovalFormProps) => {
  const approveByReviewerMutation = useApproveByReviewer(workorderSlug);
  const rejectByReviewerMutation = useRejectByReviewer(workorderSlug);
  const approveByApproverMutation = useApproveByApprover(workorderSlug);
  const rejectByApproverMutation = useRejectByApprover(workorderSlug);
  const finalApproveMutation = useFinalApprove(workorderSlug);
  const finalRejectMutation = useFinalReject(workorderSlug);

  const rejectForm = useForm<RejectValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: '' },
  });

  const signatureForm = useForm<SignatureValues>({
    resolver: zodResolver(signatureSchema),
    defaultValues: { digital_signature: '' },
  });

  const meta = { ...ACTION_META[action], ...(approverFirst ? APPROVER_FIRST_META[action] : {}) };
  // What the Reviewer's confirmation does on the approver-first route.
  const reviewerNote = !approverFirst
    ? 'You are confirming that this work order is correct and ready for final approval. This moves it to the approver queue.'
    : needsSecondApproval
    ? 'You are confirming this bill is correct. Because of its amount it then goes to the second approver for final approval.'
    : 'You are confirming this bill is correct. This is the last approval: the payment is raised and sent to Finance.';

  const isPending =
    approveByReviewerMutation.isPending ||
    rejectByReviewerMutation.isPending ||
    approveByApproverMutation.isPending ||
    rejectByApproverMutation.isPending ||
    finalApproveMutation.isPending ||
    finalRejectMutation.isPending;

  const handleClose = () => {
    rejectForm.reset();
    signatureForm.reset();
    onClose();
  };

  const handleReviewerApprove = async () => {
    try {
      await approveByReviewerMutation.mutateAsync();
      handleClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.error || 'Failed to approve', variant: 'destructive' });
    }
  };

  const handleReviewerReject = async (data: RejectValues) => {
    try {
      await rejectByReviewerMutation.mutateAsync(data.reason);
      handleClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.error || 'Failed to reject', variant: 'destructive' });
    }
  };

  const handleApproverApprove = async (data: SignatureValues) => {
    try {
      await approveByApproverMutation.mutateAsync(data.digital_signature);
      handleClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.error || 'Failed to approve', variant: 'destructive' });
    }
  };

  const handleApproverReject = async (data: RejectValues) => {
    try {
      await rejectByApproverMutation.mutateAsync(data.reason);
      handleClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.error || 'Failed to reject', variant: 'destructive' });
    }
  };

  const handleFinalApprove = async () => {
    try {
      await finalApproveMutation.mutateAsync();
      handleClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.error || 'Failed to approve', variant: 'destructive' });
    }
  };

  const handleFinalReject = async (data: RejectValues) => {
    try {
      await finalRejectMutation.mutateAsync(data.reason);
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
            {meta.isApprove ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            {meta.title}
          </DialogTitle>
          <DialogDescription>
            {meta.description} (#{workorderNumber})
          </DialogDescription>
        </DialogHeader>

        {/* Reviewer Approve — confirm only */}
        {action === 'reviewer-approve' && (
          <div className="py-4">
            <p className="text-sm text-gray-700 bg-green-50 border border-green-200 rounded-lg p-4">
              {reviewerNote}
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
                    Reason for Rejection<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the issue found..." {...field} className="min-h-[100px] resize-y" />
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

        {/* Approver Approve — requires digital signature */}
        {action === 'approver-approve' && (
          <Form {...signatureForm}>
            <form onSubmit={signatureForm.handleSubmit(handleApproverApprove)} className="space-y-4">
              <FormField control={signatureForm.control} name="digital_signature" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Digital Signature (Full Name)<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Type your full name to sign" {...field} className="h-10" />
                  </FormControl>
                  <p className="text-xs text-gray-500">
                    By typing your name you are electronically signing this approval. This is permanent and irreversible.
                  </p>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>Cancel</Button>
                <Button type="submit" disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {meta.confirmLabel}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {/* Final approval (Raise Payment second approver) — signature, then the payment is raised */}
        {action === 'final-approve' && (
          <Form {...signatureForm}>
            <form onSubmit={signatureForm.handleSubmit(handleFinalApprove)} className="space-y-4">
              <FormField control={signatureForm.control} name="digital_signature" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Digital Signature (Full Name)<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Type your full name to sign" {...field} className="h-10" />
                  </FormControl>
                  <p className="text-xs text-gray-500">
                    By typing your name you are electronically signing this approval. This is permanent and irreversible.
                  </p>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>Cancel</Button>
                <Button type="submit" disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {meta.confirmLabel}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {/* Final approver Reject — requires reason */}
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

        {/* Approver Reject — requires reason */}
        {action === 'approver-reject' && (
          <Form {...rejectForm}>
            <form onSubmit={rejectForm.handleSubmit(handleApproverReject)} className="space-y-4">
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
