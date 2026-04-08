// src/features/work/paymentcomments/PaymentcommentForm.tsx
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
import { Paymentcomment } from '@/types/paymentComment';
import { usePaymentcommentQuery, useCreatePaymentcomment, useUpdatePaymentcomment } from '@/hooks/paymentcomment/usePaymentCommentQueries';
import { Checkbox } from '@/components/ui/checkbox';


// Form schema definition
const paymentcommentSchema = z.object({
  send_notification: z.boolean(),
  message: z.string().min(1, 'Message is required'),
  internal_only: z.boolean(),
  payment: z.string().min(1, 'Payment is required')
});

type PaymentcommentFormValues = z.infer<typeof paymentcommentSchema>;

const PaymentcommentForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Paymentcomment form setup
  const paymentcommentForm = useForm<PaymentcommentFormValues>({
    resolver: zodResolver(paymentcommentSchema),
    defaultValues: {
      send_notification: false,
      message: '',
      internal_only: false,
      payment: '',
    }
  });

  // Fetch paymentcomment data for edit mode using our custom hook
  const { 
    data: paymentcommentData, 
    isLoading: isLoadingPaymentcomment, 
    isError: isPaymentcommentError,
    error: paymentcommentError
  } = usePaymentcommentQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createPaymentcommentMutation = useCreatePaymentcomment();
  const updatePaymentcommentMutation = useUpdatePaymentcomment(id);

  // Handle paymentcomment data loading
  useEffect(() => {
    if (paymentcommentData && isEditMode) {
      // Reset the form with paymentcomment data
      paymentcommentForm.reset({
        send_notification: paymentcommentData.send_notification,
        message: paymentcommentData.message,
        internal_only: paymentcommentData.internal_only,
        payment: String(paymentcommentData.payment)
      });
    }
  }, [paymentcommentData, isEditMode, paymentcommentForm]);

  const onSubmitBuilding = (data: PaymentcommentFormValues) => {
    if (isEditMode && id) {
      updatePaymentcommentMutation.mutate(
        { id, paymentcomment: data },
        { onSuccess: () => navigate('/work/payment-comments') }
      );
    } else {
      createPaymentcommentMutation.mutate(
        data as Omit<Paymentcomment, 'id'>,
        { onSuccess: () => navigate('/work/payment-comments') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/work/payment-comments');
  };

  if (isEditMode && isLoadingPaymentcomment) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading paymentcomment details...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isPaymentcommentError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading paymentcomment details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {paymentcommentError instanceof Error ? paymentcommentError.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleCancel} variant="outline">
          Back to Paymentcomments
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
            {isEditMode ? 'Edit Paymentcomment' : 'Create New Paymentcomment'}
          </h1>
        </div>
      </div>

      <Form {...paymentcommentForm}>
        <form onSubmit={paymentcommentForm.handleSubmit(onSubmitBuilding)} className="space-y-6">
          <div className="space-y-4">
            {/* Paymentcomment Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-50 border-2 border-gray-100 text-black rounded-t-md">
                <h2 className="text-lg font-medium">Payment Comment Details</h2>
                {/* <Button variant="ghost" size="sm" className="h-8 text-white bg-gray-500 hover:bg-gray-600 hover:text-white px-3">
                  Toggle
                </Button> */}
              </CollapsibleTrigger>
              
              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={paymentcommentForm.control}
                    name="payment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Payment amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={paymentcommentForm.control}
                    name="send_notification"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={(checked) => field.onChange(!!checked)}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Send Notification</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={paymentcommentForm.control}
                  name="internal_only"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Internal Only</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                control={paymentcommentForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter payment comment message"
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
              disabled={createPaymentcommentMutation.isPending || updatePaymentcommentMutation.isPending}
            >
              {(createPaymentcommentMutation.isPending || updatePaymentcommentMutation.isPending) && (
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

export default PaymentcommentForm;