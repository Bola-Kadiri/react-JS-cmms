import { useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Upload, X, FileText, Image, Loader2, Plus, Trash2 } from 'lucide-react';
import {
  useCreateInvoiceItemMutation,
  useUpdateInvoiceItemMutation,
  useInvoiceItemQuery
} from '@/hooks/invoiceitem/useInvoiceitemQueries';
import { useRaisePaymentWorkOrdersQuery, useWorkOrderCompletionsByRequesterQuery } from '@/hooks/workordercompletion/useWorkordercompletionQueries';
import { usePpmReviewersQuery } from '@/hooks/ppm/usePpmQueries';
import { useApproverUsersQuery } from '@/hooks/workorder/useWorkorderQueries';
import { useFacilitiesQuery } from '@/hooks/facility/useFacilityQueries';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

// Form schema
const invoiceItemSchema = z.object({
  facility: z.number().min(1, 'Please select a facility'),
  work_order: z.number().min(0),
  work_completion: z.number().min(0),
  invoice_date: z.string().min(1, 'Invoice date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  subtotal: z.string().min(1, 'Subtotal is required'),
  tax_amount: z.string().min(1, 'Tax amount is required'),
  total_amount: z.string().min(1, 'Total amount is required'),
  currency: z.enum(['USD', 'NGN', 'EUR', 'GBP'], {
    errorMap: () => ({ message: 'Please select a currency' })
  }),
  notes: z.string().optional(),
  approver: z.number().min(1, 'Please select an approver'),
  reviewers: z.array(z.number()).min(1, 'Please select at least one reviewer'),
  items: z.array(z.object({
    item_name: z.string().min(1, 'Item name is required'),
    amount: z.string().min(1, 'Amount is required'),
    description: z.string().min(1, 'Description is required'),
  })).min(1, 'Please add at least one item'),
  attachments: z.array(z.any()).default([]),
}).refine(
  (data) => data.work_order > 0 || data.work_completion > 0,
  {
    message: 'Please select either a work order or a work completion',
    path: ['work_order'],
  }
);

type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;

interface InvoiceitemFormProps {
  isEditMode?: boolean;
}

const InvoiceitemForm = ({ isEditMode = false }: InvoiceitemFormProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  // File handling
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Mutations and queries
  const createMutation = useCreateInvoiceItemMutation();
  const updateMutation = useUpdateInvoiceItemMutation();
  const { data: invoiceItem, isLoading: isLoadingInvoiceItem } = useInvoiceItemQuery(
    isEditMode && id ? id : ''
  );
  const { data: raisePaymentWorkOrders, isLoading: isLoadingWorkOrders } = useRaisePaymentWorkOrdersQuery();
  const { data: reviewers, isLoading: isLoadingReviewers } = usePpmReviewersQuery();
  const { data: approvers, isLoading: isLoadingApprovers } = useApproverUsersQuery();
  const { data: facilities, isLoading: isLoadingFacilities } = useFacilitiesQuery();
  
  // Get requester ID from authenticated user
  const requesterId = user?.id ? (typeof user.id === 'number' ? user.id : parseInt(user.id)) : 0;
  
  const { data: workCompletions, isLoading: isLoadingWorkCompletions } = useWorkOrderCompletionsByRequesterQuery(
    requesterId
  );

  const isLoading = isLoadingInvoiceItem || isLoadingWorkOrders || isLoadingReviewers || isLoadingApprovers || isLoadingFacilities || isLoadingWorkCompletions;

  // Form setup
  const form = useForm<InvoiceItemFormData>({
    resolver: zodResolver(invoiceItemSchema),
    defaultValues: {
      facility: 0,
      work_order: 0,
      work_completion: 0,
      invoice_date: '',
      due_date: '',
      subtotal: '',
      tax_amount: '',
      total_amount: '',
      currency: 'USD',
      notes: '',
      approver: 0,
      reviewers: [],
      items: [{ item_name: '', amount: '', description: '' }],
      attachments: [],
    },
  });

  // Dynamic items array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Watch work_order and work_completion for mutual exclusivity
  const watchWorkOrder = form.watch('work_order');
  const watchWorkCompletion = form.watch('work_completion');

  // Watch items amounts for auto-calculation
  const watchItems = form.watch('items');
  const watchTaxAmount = form.watch('tax_amount');

  // Auto-calculate subtotal and total
  useEffect(() => {
    const items = watchItems || [];
    const subtotal = items.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      return sum + amount;
    }, 0);
    
    form.setValue('subtotal', subtotal.toFixed(2));
    
    const taxAmount = parseFloat(watchTaxAmount) || 0;
    const total = subtotal + taxAmount;
    form.setValue('total_amount', total.toFixed(2));
  }, [watchItems, watchTaxAmount, form]);

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && invoiceItem) {
      form.reset({
        facility: invoiceItem.facility || 0,
        work_order: invoiceItem.work_order || 0,
        work_completion: invoiceItem.work_completion || 0,
        invoice_date: invoiceItem.invoice_date || '',
        due_date: invoiceItem.due_date || '',
        subtotal: invoiceItem.subtotal || '',
        tax_amount: invoiceItem.tax_amount || '',
        total_amount: invoiceItem.total_amount || '',
        currency: invoiceItem.currency || 'USD',
        notes: invoiceItem.notes || '',
        approver: invoiceItem.approver || 0,
        reviewers: invoiceItem.reviewers || [],
        items: invoiceItem.items_detail && invoiceItem.items_detail.length > 0
          ? invoiceItem.items_detail.map(item => ({
              item_name: item.item_name,
              amount: item.amount,
              description: item.description,
            }))
          : [{ item_name: '', amount: '', description: '' }],
        attachments: [],
      });
    }
  }, [isEditMode, invoiceItem, form]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload PDF, DOCX, or image files.`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB. Please choose a smaller file.`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Reset the input
    if (event.target) {
      event.target.value = '';
    }
  };

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Get file icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    }
    return <FileText className="h-4 w-4 text-red-500" />;
  };

  // Submit handler
  const onSubmit = async (data: InvoiceItemFormData) => {
    try {
      const payload: any = {
        facility: data.facility,
        invoice_date: data.invoice_date,
        due_date: data.due_date,
        subtotal: parseFloat(data.subtotal),
        tax_amount: parseFloat(data.tax_amount),
        total_amount: parseFloat(data.total_amount),
        currency: data.currency,
        notes: data.notes || null,
        approver: data.approver,
        reviewers: data.reviewers,
        items: data.items.map(item => ({
          item_name: item.item_name,
          amount: parseFloat(item.amount),
          description: item.description,
        })),
      };

      // Conditionally add work_order or work_completion
      if (data.work_order > 0) {
        payload.work_order = data.work_order;
      } else if (data.work_completion > 0) {
        payload.work_completion = data.work_completion;
      }

      // Convert to FormData for file upload support
      const formData = new FormData();
      formData.append('data', JSON.stringify(payload));
      
      // Append files
      selectedFiles.forEach((file) => {
        formData.append('attachments', file);
      });
      
      if (isEditMode && id) {
        const slug = invoiceItem?.slug || id;
        await updateMutation.mutateAsync({ slug, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      
      navigate('/dashboard/work/invoice-items');
    } catch (error: any) {
      console.error('Error submitting invoice item:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || 'Failed to save invoice item',
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          <span className="text-sm text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard/work/invoice-items')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoice Items
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Invoice Item' : 'Create New Invoice Item'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isEditMode ? 'Update the invoice item details below' : 'Fill in the details to create a new invoice item'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-900">
            Invoice Item Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Facility */}
                <FormField
                  control={form.control}
                  name="facility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Facility <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select facility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {facilities?.results && facilities.results.length > 0 ? (
                            facilities.results.map((facility) => (
                              <SelectItem key={facility.id} value={facility.id.toString()}>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{facility.name}</span>
                                  <span className="text-xs text-gray-500">{facility.code}</span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-facilities" disabled>
                              No facilities available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Work Order */}
                <FormField
                  control={form.control}
                  name="work_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Work Order <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))} 
                        value={field.value?.toString()}
                        disabled={watchWorkCompletion > 0}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select work order" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {raisePaymentWorkOrders?.results && raisePaymentWorkOrders.results.length > 0 ? (
                            raisePaymentWorkOrders.results.map((workOrder) => (
                              <SelectItem key={workOrder.id} value={workOrder.id.toString()}>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">WO-{workOrder.work_order_number}</span>
                                  {workOrder.title && (
                                    <span className="text-xs text-gray-500">{workOrder.title}</span>
                                  )}
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-work-orders" disabled>
                              No work orders available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Work Completion */}
                <FormField
                  control={form.control}
                  name="work_completion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Work Completion <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))} 
                        value={field.value?.toString()}
                        disabled={watchWorkOrder > 0}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select work completion" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workCompletions?.results && workCompletions.results.length > 0 ? (
                            workCompletions.results.map((completion) => (
                              <SelectItem key={completion.id} value={completion.id.toString()}>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">WOC-{completion.id}</span>
                                  <span className="text-xs text-gray-500">
                                    WO-{completion.work_order_detail?.work_order_number || completion.work_order}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-completions" disabled>
                              No work completions available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Currency */}
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Currency <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Invoice Date */}
                <FormField
                  control={form.control}
                  name="invoice_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Invoice Date <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Due Date */}
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Due Date <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tax Amount */}
                <FormField
                  control={form.control}
                  name="tax_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Tax Amount <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="Enter tax amount"
                          className="focus:ring-green-500 focus:border-green-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Subtotal (Read-only, auto-calculated) */}
                <FormField
                  control={form.control}
                  name="subtotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Subtotal <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          readOnly
                          className="bg-gray-50 cursor-not-allowed"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Total Amount (Read-only, auto-calculated) */}
                <FormField
                  control={form.control}
                  name="total_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Total Amount <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          readOnly
                          className="bg-gray-50 cursor-not-allowed font-semibold"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Approver Selection */}
              <FormField
                control={form.control}
                  name="approver"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                        Approver <span className="text-red-500">*</span>
                    </FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select approver" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          {approvers?.results && approvers.results.length > 0 ? (
                            approvers.results.map((user) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                              <div className="flex flex-col">
                                  <span className="text-sm font-medium">{user.name}</span>
                                  <span className="text-xs text-gray-500">{user.email}</span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                            <SelectItem value="no-approvers" disabled>
                              No approvers available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Notes
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter any additional notes or comments"
                        rows={3}
                        className="focus:ring-green-500 focus:border-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reviewers Selection (Multi-select) */}
              <FormField
                control={form.control}
                name="reviewers"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Reviewers <span className="text-red-500">*</span>
                      </FormLabel>
                      <p className="text-xs text-gray-500 mt-1">Select at least one reviewer</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded-lg p-4">
                      {reviewers && reviewers.length > 0 ? (
                        reviewers.map((user) => (
                          <FormField
                            key={user.id}
                            control={form.control}
                            name="reviewers"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={user.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(user.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, user.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== user.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium">{user.name}</span>
                                      {user.email && (
                                        <span className="text-xs text-gray-500">{user.email}</span>
                                      )}
                                    </div>
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
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

              {/* Invoice Items */}
              <Card className="border-2 border-dashed">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-medium text-gray-900">
                        Invoice Items <span className="text-red-500">*</span>
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-1">Add line items for this invoice</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ item_name: '', amount: '', description: '' })}
                      className="text-green-700 border-green-300 hover:bg-green-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="bg-gray-50">
                      <CardContent className="pt-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-700">Item {index + 1}</h4>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Item Name */}
                            <FormField
                              control={form.control}
                              name={`items.${index}.item_name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    Item Name <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Enter item name"
                                      className="focus:ring-green-500 focus:border-green-500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Amount */}
                            <FormField
                              control={form.control}
                              name={`items.${index}.amount`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    Amount <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.01"
                                      placeholder="Enter amount"
                                      className="focus:ring-green-500 focus:border-green-500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Description */}
                          <FormField
                            control={form.control}
                            name={`items.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Description <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="Enter item description"
                                    rows={2}
                                    className="focus:ring-green-500 focus:border-green-500"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              {/* File Upload Section */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Attachments (Documents/Images)
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-green-700 border-green-300 hover:bg-green-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                    <span className="text-xs text-gray-500">
                      Supported: PDF, DOCX, Images (Max 10MB each)
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Selected Files Display */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center gap-2">
                            {getFileIcon(file)}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {isEditMode ? 'Update Invoice Item' : 'Create Invoice Item'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard/work/invoice-items')}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceitemForm; 
