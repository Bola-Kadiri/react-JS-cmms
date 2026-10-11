import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useAssignResources, useEligibleApprovers } from '@/hooks/workrequest/useWorkrequestQueries';
import { useFormatters } from '@/utils/formatters';

interface WorkrequestApproverFormProps {
  isOpen: boolean;
  onClose: () => void;
  workrequestSlug: string;
  workrequestNumber: string;
  currentApprover: number | null;
  currency?: 'NGN' | 'USD' | 'EUR' | 'GBP';
}

const schema = z.object({
  approver: z.string().min(1, 'An approving officer is required'),
});

type FormValues = z.infer<typeof schema>;

// The "approval matrix" picker — a separate concern from Resources (vendor/
// technician). Reuses the same backend assign-resources action, but only
// ever sends `approver`.
export const WorkrequestApproverForm = ({
  isOpen,
  onClose,
  workrequestSlug,
  workrequestNumber,
  currentApprover,
  currency = 'NGN',
}: WorkrequestApproverFormProps) => {
  const { formatCurrency } = useFormatters();
  const assignResourcesMutation = useAssignResources();
  const { data: eligibleApprovers, isLoading: isLoadingApprovers } = useEligibleApprovers(workrequestSlug);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { approver: currentApprover ? String(currentApprover) : '' },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = async (data: FormValues) => {
    try {
      await assignResourcesMutation.mutateAsync({
        slug: workrequestSlug,
        data: { approver: Number(data.approver) },
      });
      handleClose();
    } catch {
      // error surfaced by the mutation's own onError toast
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5" /> Add Approving Officer
          </DialogTitle>
          <DialogDescription>
            Work Request #{workrequestNumber}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="approver" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Approving Officer<span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={isLoadingApprovers ? 'Loading approval matrix...' : 'Select approving officer'} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(eligibleApprovers ?? []).map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.name}
                        {a.approval_limit ? ` — limit ${formatCurrency(a.approval_limit, currency)}` : ' — unlimited'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Only officers whose approval limit covers this request's imputed cost are listed.
                </p>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={assignResourcesMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={assignResourcesMutation.isPending}>
                {assignResourcesMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
