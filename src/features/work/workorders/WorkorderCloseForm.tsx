import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle, Star } from 'lucide-react';
import { useSetWorkorderStatus } from '@/hooks/workorder/useWorkorderQueries';
import { useVendorsQuery } from '@/hooks/vendor/useVendorQueries';
import { useUsersQuery } from '@/hooks/user/useUserQueries';

interface WorkorderCloseFormProps {
  isOpen: boolean;
  onClose: () => void;
  workorderSlug: string;
  workorderNumber: string;
}

const closeSchema = z.object({
  vendor: z.string().min(1, 'Vendor is required'),
  technician: z.string().min(1, 'Technician is required'),
  rating: z.string().min(1, 'Rating is required'),
  started_at: z.string().min(1, 'Start date/time is required'),
  completed_at: z.string().min(1, 'Completion date/time is required'),
  expected_payment_date: z.string().min(1, 'Expected payment date is required'),
});

type CloseValues = z.infer<typeof closeSchema>;

export const WorkorderCloseForm = ({
  isOpen,
  onClose,
  workorderSlug,
  workorderNumber,
}: WorkorderCloseFormProps) => {
  const setStatusMutation = useSetWorkorderStatus(workorderSlug);
  const { data: vendorsData } = useVendorsQuery();
  const { data: usersData } = useUsersQuery();
  const vendors: any[] = (vendorsData as any)?.results ?? (Array.isArray(vendorsData) ? vendorsData : []);
  const users: any[] = (usersData as any)?.results ?? (Array.isArray(usersData) ? usersData : []);

  const form = useForm<CloseValues>({
    resolver: zodResolver(closeSchema),
    defaultValues: {
      vendor: '', technician: '', rating: '', started_at: '', completed_at: '', expected_payment_date: '',
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = async (data: CloseValues) => {
    try {
      await setStatusMutation.mutateAsync({
        work_status: 'closed',
        vendor: Number(data.vendor),
        technician: Number(data.technician),
        rating: Number(data.rating),
        started_at: new Date(data.started_at).toISOString(),
        completed_at: new Date(data.completed_at).toISOString(),
        expected_payment_date: data.expected_payment_date,
      });
      handleClose();
    } catch (error: any) {
      // Most importantly this surfaces the backend's "An approved Work
      // Completion Certificate is required before this Work Order can be
      // closed" message when no approved WCC exists yet — see
      // useSetWorkorderStatus's onError, which already toasts it. We only
      // need to swallow the rejection here so the dialog stays open for
      // the user to fix and retry (e.g. once the WCC is approved).
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" /> Close Work Order
          </DialogTitle>
          <DialogDescription>
            Work Order #{workorderNumber}. Requires an approved Work Completion Certificate.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="vendor" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Vendor<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
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

              <FormField control={form.control} name="technician" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Technician<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
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
            </div>

            <FormField control={form.control} name="rating" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Work Order Rating<span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => field.onChange(String(n))}
                      className="p-1"
                    >
                      <Star
                        className={`h-6 w-6 ${Number(field.value) >= n ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="started_at" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Started At<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="completed_at" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Completed At<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="expected_payment_date" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Expected Payment Date<span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-10" />
                </FormControl>
                <p className="text-xs text-gray-500">Used to seed the Payment Requisition this creates.</p>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={setStatusMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={setStatusMutation.isPending} className="bg-green-600 hover:bg-green-700 text-white">
                {setStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Close Work Order
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
