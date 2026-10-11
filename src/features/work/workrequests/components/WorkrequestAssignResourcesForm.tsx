import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Briefcase } from 'lucide-react';
import { useAssignResources } from '@/hooks/workrequest/useWorkrequestQueries';
import { useUsersQuery } from '@/hooks/user/useUserQueries';

interface WorkrequestAssignResourcesFormProps {
  isOpen: boolean;
  onClose: () => void;
  workrequestSlug: string;
  workrequestNumber: string;
  currentTechnician: number | null;
}

// Technician only — the Requester's side of "resources". Vendor is a
// Procurement & Store decision (see WorkrequestVendorForm), since it's the
// payee the eventual Payment Requisition gets raised to; the backend
// assign-resources action itself now enforces that split, this form just
// doesn't offer a field the Requester isn't allowed to set. The approving
// officer is likewise a separate concern (see WorkrequestApproverForm).
const schema = z.object({
  technician: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const WorkrequestAssignResourcesForm = ({
  isOpen,
  onClose,
  workrequestSlug,
  workrequestNumber,
  currentTechnician,
}: WorkrequestAssignResourcesFormProps) => {
  const assignResourcesMutation = useAssignResources();
  const { data: usersData } = useUsersQuery();

  const users: any[] = (usersData as any)?.results ?? (Array.isArray(usersData) ? usersData : []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      technician: currentTechnician ? String(currentTechnician) : '',
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = async (data: FormValues) => {
    try {
      await assignResourcesMutation.mutateAsync({
        slug: workrequestSlug,
        data: {
          technician: data.technician ? Number(data.technician) : null,
        },
      });
      handleClose();
    } catch {
      // error surfaced by the mutation's own onError toast — e.g. the
      // backend's "cost/PO not imputed yet" message if this got opened too early
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Briefcase className="h-5 w-5" /> Assign Technician
          </DialogTitle>
          <DialogDescription>
            Work Request #{workrequestNumber}. Optional here, required by the time this closes as a Work Order.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="technician" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Technician (Resource)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>{u.name || u.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
