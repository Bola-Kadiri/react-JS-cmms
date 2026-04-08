// src/features/work/paymentitems/PaymentitemForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Paymentitem } from '@/types/paymentitem';
import { usePaymentitemQuery, useCreatePaymentitem, useUpdatePaymentitem } from '@/hooks/paymentitem/usePaymentitemQueries';
import { Workorder } from '@/types/workorder';
import { Checkbox } from '@/components/ui/checkbox';
import { useList } from '@/hooks/crud/useCrudOperations';

const workOrderEndpoint = 'work/api/work-orders/'


// Form schema definition
const paymentitemSchema = z.object({
  item_name: z.string().min(1, 'Item name is required'),
  amount: z.string().min(1, 'Amount is required'),
  description: z.string(),
  work_order: z.number()
});

type PaymentitemFormValues = z.infer<typeof paymentitemSchema>;

const PaymentitemForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Mock work order options (replace with actual data fetching)
  const workOrderOptions = [
    { id: 1, name: "Work Order #1" },
    { id: 2, name: "Work Order #2" },
    { id: 3, name: "Work Order #3" },
  ];
  
  // Paymentitem form setup
  const paymentitemForm = useForm<PaymentitemFormValues>({
    resolver: zodResolver(paymentitemSchema),
    defaultValues: {
      item_name: '',
      amount: '',
      description: '',
      work_order: 0,
    }
  });

  const { data: workorders = [] } = useList<Workorder>('workorders', workOrderEndpoint);

  // Fetch paymentitem data for edit mode using our custom hook
  const { 
    data: paymentitemData, 
    isLoading: isLoadingPaymentitem, 
    isError: isPaymentitemError,
    error: paymentitemError
  } = usePaymentitemQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createPaymentitemMutation = useCreatePaymentitem();
  const updatePaymentitemMutation = useUpdatePaymentitem(id);

  // Handle paymentitem data loading
  useEffect(() => {
    if (paymentitemData && isEditMode) {
      // Reset the form with paymentitem data
      paymentitemForm.reset({
        item_name: paymentitemData.item_name,
        amount: String(paymentitemData.amount),
        description: paymentitemData.description,
        work_order: paymentitemData.work_order
      });
    }
  }, [paymentitemData, isEditMode, paymentitemForm]);

  const onSubmitBuilding = (data: PaymentitemFormValues) => {
    if (isEditMode && id) {
      updatePaymentitemMutation.mutate(
        { id, paymentitem: data },
        { onSuccess: () => navigate('/work/payment-items') }
      );
    } else {
      createPaymentitemMutation.mutate(
        data as Omit<Paymentitem, 'id'>,
        { onSuccess: () => navigate('/work/payment-items') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/work/payment-items');
  };

  if (isEditMode && isLoadingPaymentitem) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading paymentitem details...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isPaymentitemError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading paymentitem details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {paymentitemError instanceof Error ? paymentitemError.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleCancel} variant="outline">
          Back to Paymentitems
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit Paymentitem' : 'Create New Paymentitem'}
          </h1>
        </div>
      </div>

      <Form {...paymentitemForm}>
        <form onSubmit={paymentitemForm.handleSubmit(onSubmitBuilding)} className="space-y-6">
          <div className="space-y-4">
            {/* Paymentitem Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-50 border-2 border-gray-100 text-black rounded-t-md">
                <h2 className="text-lg font-medium">Payment Item Details</h2>
                {/* <Button variant="ghost" size="sm" className="h-8 text-white bg-gray-500 hover:bg-gray-600 hover:text-white px-3">
                  Toggle
                </Button> */}
              </CollapsibleTrigger>
              
              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={paymentitemForm.control}
                    name="item_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter item name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={paymentitemForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={paymentitemForm.control}
                  name="work_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Order</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))} 
                        defaultValue={field.value ? field.value.toString() : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a work order" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workorders.map((option) => (
                            <SelectItem key={option.id} value={option.id.toString()}>
                              {option.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentitemForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter item description"
                          {...field}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>
          
          {/* Form submit buttons */}
          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
            >
              Cancel
            </Button>
            
            <Button 
              type="submit"
              disabled={createPaymentitemMutation.isPending || updatePaymentitemMutation.isPending}
            >
              {(createPaymentitemMutation.isPending || updatePaymentitemMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PaymentitemForm;