// src/features/work/paymentrequisitions/PaymentrequisitionForm.tsx
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
import { Paymentrequisition } from '@/types/paymentrequisition';
import { usePaymentrequisitionQuery, useCreatePaymentrequisition, useUpdatePaymentrequisition } from '@/hooks/paymentrequisition/usePaymentrequisitionQueries';
import { Checkbox } from '@/components/ui/checkbox';
import { useList } from '@/hooks/crud/useCrudOperations';
import { Vendor } from '@/types/vendor';
import { User } from '@/types/user';
import { Workorder } from '@/types/workorder';
import { Paymentitem } from '@/types/paymentitem';

const endpoint1 = 'accounts/api/vendors/';
const endpoint2 = 'accounts/api/users/';
const endpoint3 = 'work/api/work-orders/'
const endpoint4 = 'work/api/payment-items/'

// Form schema definition
const paymentrequisitionSchema = z.object({
  requisition_date: z.string().min(1, 'Requisition date is required'),
  pay_to: z.number().int().positive('Pay to is required'),
  status: z.enum(['Active', 'Inactive']),
  expected_payment_date: z.string().min(1, 'Expected payment date is required'),
  retirement: z.boolean(),
  remark: z.string().optional(),
  approval_status: z.enum(['request', 'approve']),
  comment: z.string().optional(),
  withholding_tax: z.string().optional(),
  expected_payment_amount: z.string().min(1, 'Expected payment amount is required'),
  owner: z.number().int().positive('Owner is required'),
  work_orders: z.array(z.number().int()),
  request_to: z.array(z.number().int()),
  items: z.array(z.number().int())
});

type PaymentrequisitionFormValues = z.infer<typeof paymentrequisitionSchema>;

const PaymentrequisitionForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Mock data for select fields
  const [payToOptions, setPayToOptions] = useState([
    { id: 1, name: 'Vendor 1' },
    { id: 2, name: 'Vendor 2' },
    { id: 3, name: 'Vendor 3' }
  ]);
  
  const [ownerOptions, setOwnerOptions] = useState([
    { id: 1, name: 'User 1' },
    { id: 2, name: 'User 2' },
    { id: 3, name: 'User 3' }
  ]);
  
  const [_workOrders, setWorkOrders] = useState([
    { id: 1, name: 'Work Order 1' },
    { id: 2, name: 'Work Order 2' },
    { id: 3, name: 'Work Order 3' }
  ]);
  
  const [requestTo, setRequestTo] = useState([
    { id: 1, name: 'Approver 1' },
    { id: 2, name: 'Approver 2' },
    { id: 3, name: 'Approver 3' }
  ]);
  
  const [_items, setItems] = useState([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' }
  ]);
  
  // Paymentrequisition form setup
  const paymentrequisitionForm = useForm<PaymentrequisitionFormValues>({
    resolver: zodResolver(paymentrequisitionSchema),
    defaultValues: {
      requisition_date: '',
      pay_to: undefined as unknown as number,
      status: 'Active',
      expected_payment_date: '',
      retirement: false,
      remark: '',
      approval_status: 'request',
      comment: '',
      withholding_tax: '',
      expected_payment_amount: '',
      owner: undefined as unknown as number,
      work_orders: [],
      request_to: [],
      items: []
    }
  });

  // Fetch all categories
    const { data: vendors = [] } = useList<Vendor>('vendors', endpoint1);
    const { data: users = [] } = useList<User>('users', endpoint2);
    const { data: workOrders = [] } = useList<Workorder>('workorders', endpoint3);
    const { data: paymentItems = [] } = useList<Paymentitem>('paymentitems', endpoint4);

  // Fetch paymentrequisition data for edit mode using our custom hook
  const { 
    data: paymentrequisitionData, 
    isLoading: isLoadingPaymentrequisition, 
    isError: isPaymentrequisitionError,
    error: paymentrequisitionError
  } = usePaymentrequisitionQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createPaymentrequisitionMutation = useCreatePaymentrequisition();
  const updatePaymentrequisitionMutation = useUpdatePaymentrequisition(id);

  // Handle paymentrequisition data loading
  useEffect(() => {
    if (paymentrequisitionData && isEditMode) {
      // Reset the form with paymentrequisition data
      paymentrequisitionForm.reset({
        requisition_date: paymentrequisitionData.requisition_date,
        pay_to: paymentrequisitionData.pay_to,
        status: paymentrequisitionData.status,
        expected_payment_date: paymentrequisitionData.expected_payment_date,
        retirement: paymentrequisitionData.retirement,
        remark: paymentrequisitionData.remark,
        approval_status: paymentrequisitionData.approval_status,
        comment: paymentrequisitionData.comment,
        withholding_tax: paymentrequisitionData.withholding_tax,
        expected_payment_amount: paymentrequisitionData.expected_payment_amount,
        owner: paymentrequisitionData.owner,
        work_orders: paymentrequisitionData.work_orders,
        request_to: paymentrequisitionData.request_to,
        items: paymentrequisitionData.items
      });
    }
  }, [paymentrequisitionData, isEditMode, paymentrequisitionForm]);

  const onSubmitPaymentrequisition = (data: PaymentrequisitionFormValues) => {
    if (isEditMode && id) {
      updatePaymentrequisitionMutation.mutate(
        { id, paymentrequisition: data },
        { onSuccess: () => navigate('/work/payment-requisitions') }
      );
    } else {
      createPaymentrequisitionMutation.mutate(
        data as Omit<Paymentrequisition, 'id'>,
        { onSuccess: () => navigate('/work/payment-requisitions') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/work/payment-requisitions');
  };

  if (isEditMode && isLoadingPaymentrequisition) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading paymentrequisition details...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isPaymentrequisitionError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading paymentrequisition details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {paymentrequisitionError instanceof Error ? paymentrequisitionError.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleCancel} variant="outline">
          Back to Paymentrequisitions
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
            {isEditMode ? 'Edit Paymentrequisition' : 'Create New Paymentrequisition'}
          </h1>
        </div>
      </div>

      <Form {...paymentrequisitionForm}>
        <form onSubmit={paymentrequisitionForm.handleSubmit(onSubmitPaymentrequisition)} className="space-y-6">
          <div className="space-y-4">
            {/* Paymentrequisition Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-50 border-2 border-gray-100 text-black rounded-t-md">
                <h2 className="text-lg font-medium">Payment Requisition Details</h2>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={paymentrequisitionForm.control}
                    name="requisition_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requisition Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={paymentrequisitionForm.control}
                    name="expected_payment_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Payment Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={paymentrequisitionForm.control}
                    name="pay_to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pay To</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a vendor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vendors.map((option) => (
                              <SelectItem key={option.id} value={option.id.toString()}>
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={paymentrequisitionForm.control}
                    name="owner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an owner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users.map((option) => (
                              <SelectItem key={option.id} value={option.id.toString()}>
                                {option.first_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={paymentrequisitionForm.control}
                    name="expected_payment_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Payment Amount</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Enter amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={paymentrequisitionForm.control}
                    name="withholding_tax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Withholding Tax</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Enter tax amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={paymentrequisitionForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={paymentrequisitionForm.control}
                    name="approval_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Approval Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select approval status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="request">Request</SelectItem>
                            <SelectItem value="approve">Approve</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={paymentrequisitionForm.control}
                  name="retirement"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Retirement</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentrequisitionForm.control}
                  name="remark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remark</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter remarks"
                          {...field}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentrequisitionForm.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comment</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter comments"
                          {...field}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentrequisitionForm.control}
                  name="work_orders"
                  render={() => (
                    <FormItem>
                      <FormLabel>Work Orders</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {workOrders.map((workOrder) => {
                          const workOrderId = workOrder.id;
                          const selectedWorkOrders = paymentrequisitionForm.watch("work_orders");
                          
                          return (
                            <label key={workOrder.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                value={workOrderId}
                                checked={selectedWorkOrders.includes(workOrderId)}
                                onChange={(e) => {
                                  const newValue = Number(e.target.value);
                                  if (e.target.checked) {
                                    paymentrequisitionForm.setValue("work_orders", [...selectedWorkOrders, newValue]);
                                  } else {
                                    paymentrequisitionForm.setValue(
                                      "work_orders",
                                      selectedWorkOrders.filter((id) => id !== newValue)
                                    );
                                  }
                                }}
                              />
                              <span>{workOrder.title}</span>
                            </label>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentrequisitionForm.control}
                  name="request_to"
                  render={() => (
                    <FormItem>
                      <FormLabel>Request To</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {users.map((person) => {
                          const personId = person.id;
                          const selectedPersons = paymentrequisitionForm.watch("request_to");
                          
                          return (
                            <label key={person.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                value={personId}
                                checked={selectedPersons.includes(personId)}
                                onChange={(e) => {
                                  const newValue = Number(e.target.value);
                                  if (e.target.checked) {
                                    paymentrequisitionForm.setValue("request_to", [...selectedPersons, newValue]);
                                  } else {
                                    paymentrequisitionForm.setValue(
                                      "request_to",
                                      selectedPersons.filter((id) => id !== newValue)
                                    );
                                  }
                                }}
                              />
                              <span>{person.first_name}</span>
                            </label>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentrequisitionForm.control}
                  name="items"
                  render={() => (
                    <FormItem>
                      <FormLabel>Items</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {paymentItems.map((item) => {
                          const itemId = item.id;
                          const selectedItems = paymentrequisitionForm.watch("items");
                          
                          return (
                            <label key={item.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                value={itemId}
                                checked={selectedItems.includes(itemId)}
                                onChange={(e) => {
                                  const newValue = Number(e.target.value);
                                  if (e.target.checked) {
                                    paymentrequisitionForm.setValue("items", [...selectedItems, newValue]);
                                  } else {
                                    paymentrequisitionForm.setValue(
                                      "items",
                                      selectedItems.filter((id) => id !== newValue)
                                    );
                                  }
                                }}
                              />
                              <span>{item.item_name}</span>
                            </label>
                          );
                        })}
                      </div>
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
              disabled={createPaymentrequisitionMutation.isPending || updatePaymentrequisitionMutation.isPending}
            >
              {(createPaymentrequisitionMutation.isPending || updatePaymentrequisitionMutation.isPending) && (
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

export default PaymentrequisitionForm;