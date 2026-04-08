import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle } from 'lucide-react';
import { useApproveWorkrequest } from '@/hooks/workrequest/useWorkrequestQueries';
import { ApproveWorkrequestData } from '@/services/workrequestsApi';

const approvalSchema = z.object({
  approval_status: z.enum(['Pending', 'Approved', 'Rejected']),
  notes: z.string().min(1, 'Notes are required'),
});

type ApprovalFormValues = z.infer<typeof approvalSchema>;

interface ApprovalFormProps {
  isOpen: boolean;
  onClose: () => void;
  workrequestSlug: string;
  workrequestNumber: string;
}

export const ApprovalForm = ({
  isOpen,
  onClose,
  workrequestSlug,
  workrequestNumber,
}: ApprovalFormProps) => {
  const approveWorkrequestMutation = useApproveWorkrequest();

  const form = useForm<ApprovalFormValues>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      approval_status: 'Approved',
      notes: '',
    },
  });

  const onSubmit = async (data: ApprovalFormValues) => {
    try {
      await approveWorkrequestMutation.mutateAsync({
        slug: workrequestSlug,
        approvalData: {
          approval_status: data.approval_status,
          notes: data.notes,
        },
      });
      onClose();
      form.reset();
    } catch (error) {
      console.error('Error approving workrequest:', error);
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            Approve Work Request
          </DialogTitle>
          <DialogDescription>
            Update the approval details for work request #{workrequestNumber}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="approval_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Approval Status<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Notes<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter approval notes or comments..."
                      {...field}
                      className="min-h-[100px] resize-y"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={approveWorkrequestMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={approveWorkrequestMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {approveWorkrequestMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {form.watch('approval_status') === 'Approved' ? 'Approve Request' : 
                 form.watch('approval_status') === 'Rejected' ? 'Reject Request' : 
                 'Update Status'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 