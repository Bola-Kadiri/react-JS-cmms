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
import { Loader2, Package } from 'lucide-react';
import { useAddProcurementDetails } from '@/hooks/workrequest/useWorkrequestQueries';
import { ProcurementData } from '@/services/workrequestsApi';

const procurementSchema = z.object({
  cost: z.number().min(0.01, 'Cost must be greater than 0'),
  currency: z.enum(['USD', 'EUR', 'NGN']),
  attach_po: z.string().optional(),
  notes: z.string().optional(),
});

type ProcurementFormValues = z.infer<typeof procurementSchema>;

interface ProcurementFormProps {
  isOpen: boolean;
  onClose: () => void;
  workrequestSlug: string;
  workrequestNumber: string;
}

export const ProcurementForm = ({
  isOpen,
  onClose,
  workrequestSlug,
  workrequestNumber,
}: ProcurementFormProps) => {
  const addProcurementDetailsMutation = useAddProcurementDetails();

  const form = useForm<ProcurementFormValues>({
    resolver: zodResolver(procurementSchema),
    defaultValues: {
      cost: 0,
      currency: 'NGN',
      attach_po: '',
      notes: '',
    },
  });

  const onSubmit = async (data: ProcurementFormValues) => {
    try {
      await addProcurementDetailsMutation.mutateAsync({
        slug: workrequestSlug,
        procurementData: {
          cost: data.cost,
          currency: data.currency,
          attach_po: data.attach_po || '',
          notes: data.notes || '',
        },
      });
      onClose();
      form.reset();
    } catch (error) {
      console.error('Error adding procurement details:', error);
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
            <Package className="h-5 w-5" />
            Add Procurement Details
          </DialogTitle>
          <DialogDescription>
            Add procurement details for work request #{workrequestNumber}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Cost<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter cost"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        value={field.value}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Currency<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NGN">Nigerian Naira (NGN)</SelectItem>
                        <SelectItem value="USD">US Dollar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="attach_po"
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Attach Purchase Order</FormLabel>
                  <FormControl>
                    <Input 
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file ? file.name : '');
                      }}
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter procurement notes or additional details..."
                      {...field}
                      className="min-h-[80px] resize-y"
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
                disabled={addProcurementDetailsMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addProcurementDetailsMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {addProcurementDetailsMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Procurement Details
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 
