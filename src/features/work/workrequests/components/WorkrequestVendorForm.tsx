import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Truck } from 'lucide-react';
import { useAssignResources } from '@/hooks/workrequest/useWorkrequestQueries';
import { useVendorsQuery } from '@/hooks/vendor/useVendorQueries';

interface WorkrequestVendorFormProps {
  isOpen: boolean;
  onClose: () => void;
  workrequestSlug: string;
  workrequestNumber: string;
  currentVendor: number | null;
}

const schema = z.object({
  vendor: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// Procurement & Store only — this is who the eventual Payment Requisition
// gets raised to, so the backend restricts writing this field to that role
// (or Admin); this dialog is only ever rendered for those users.
export const WorkrequestVendorForm = ({
  isOpen,
  onClose,
  workrequestSlug,
  workrequestNumber,
  currentVendor,
}: WorkrequestVendorFormProps) => {
  const assignResourcesMutation = useAssignResources();
  const { data: vendorsData } = useVendorsQuery();

  const vendors: any[] = (vendorsData as any)?.results ?? (Array.isArray(vendorsData) ? vendorsData : []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { vendor: currentVendor ? String(currentVendor) : '' },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = async (data: FormValues) => {
    try {
      await assignResourcesMutation.mutateAsync({
        slug: workrequestSlug,
        data: { vendor: data.vendor ? Number(data.vendor) : null },
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
            <Truck className="h-5 w-5" /> Assign Vendor
          </DialogTitle>
          <DialogDescription>
            Work Request #{workrequestNumber}. This is who the Payment Requisition will later be raised to.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="vendor" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Vendor (Resource)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vendors.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
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
