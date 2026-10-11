import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Users } from 'lucide-react';
import { useAssignWorkorderRouting } from '@/hooks/workorder/useWorkorderQueries';
import { useReviewersQuery, useApproversQuery } from '@/hooks/workrequest/useWorkrequestQueries';

interface WorkorderRoutingFormProps {
  isOpen: boolean;
  onClose: () => void;
  workorderSlug: string;
  workorderNumber: string;
  currentReviewers: number[];
  currentApprover: number | null;
}

const schema = z.object({
  reviewers: z.array(z.number()).min(1, 'At least one reviewer is required'),
  approver: z.number().min(1, 'An approver is required'),
});

type FormValues = z.infer<typeof schema>;

// The Work Order's own approval routing — separate from the Work Request's.
// Assigning here notifies the newly-picked reviewer(s)/approver.
export const WorkorderRoutingForm = ({
  isOpen,
  onClose,
  workorderSlug,
  workorderNumber,
  currentReviewers,
  currentApprover,
}: WorkorderRoutingFormProps) => {
  const assignRoutingMutation = useAssignWorkorderRouting(workorderSlug);
  const { data: reviewers = [] } = useReviewersQuery();
  const { data: approvers = [] } = useApproversQuery();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      reviewers: currentReviewers,
      approver: currentApprover || 0,
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = async (data: FormValues) => {
    try {
      await assignRoutingMutation.mutateAsync({ reviewers: data.reviewers, approver: data.approver });
      handleClose();
    } catch {
      // error surfaced by the mutation's own onError toast
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" /> Assign Reviewer &amp; Approver
          </DialogTitle>
          <DialogDescription>
            Work Order #{workorderNumber}. The assigned people will be notified immediately.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="approver" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Approver<span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value ? field.value.toString() : undefined}>
                  <FormControl>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select approver" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {approvers && approvers.length > 0 ? (
                      approvers.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{user.name}</span>
                            <span className="text-xs text-gray-500">{user.email}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-approvers" disabled>No approvers available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField
              control={form.control}
              name="reviewers"
              render={() => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Reviewer(s)<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <div className="grid grid-cols-1 gap-3 max-h-56 overflow-y-auto border rounded-lg p-4">
                    {reviewers && reviewers.length > 0 ? (
                      reviewers.map((user) => (
                        <FormField
                          key={user.id}
                          control={form.control}
                          name="reviewers"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(user.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, user.id])
                                      : field.onChange(field.value?.filter((value) => value !== user.id));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{user.name}</span>
                                  {user.email && <span className="text-xs text-gray-500">{user.email}</span>}
                                </div>
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No reviewers available</p>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={assignRoutingMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={assignRoutingMutation.isPending}>
                {assignRoutingMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save &amp; Notify
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
