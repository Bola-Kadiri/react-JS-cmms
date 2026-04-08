// src/features/procurement/porequisitions/PorequisitionForm.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Upload, FileText, X } from 'lucide-react';
import { usePorequisitionQuery, useCreatePorequisition, useUpdatePorequisition } from '@/hooks/porequisition/usePorequisitionQueries';
import { useVendorsQuery } from '@/hooks/vendor/useVendorQueries';
import { useApproverUsersQuery } from '@/hooks/workorder/useWorkorderQueries';

// Form schema definition
const porequisitionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  vendor: z.number({ required_error: "Vendor is required" }),
  description: z.string().min(1, "Description is required"),
  amount: z.string().min(1, "Amount is required"),
  expected_delivery_date: z.string().min(1, "Expected delivery date is required"),
  sage_reference_number: z.string().optional(),
  approver: z.number().optional(),
  attachment: z.array(z.instanceof(File)).default([]),
});

type PorequisitionFormValues = z.infer<typeof porequisitionSchema>;

const PorequisitionForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // File preview state
  const [filePreview, setFilePreview] = useState<{name: string, url: string}[]>([]);
  
  // Porequisition form setup
  const porequisitionForm = useForm<PorequisitionFormValues>({
    resolver: zodResolver(porequisitionSchema),
    defaultValues: {
      title: '',
      vendor: undefined as unknown as number,
      description: '',
      amount: '',
      expected_delivery_date: new Date().toISOString().split('T')[0],
      sage_reference_number: '',
      approver: undefined,
      attachment: [],
    }
  });

  // Data fetching hooks
  const { data: vendorsResponse } = useVendorsQuery();
  const vendors = vendorsResponse?.results || [];
  const { data: approversResponse } = useApproverUsersQuery();
  const approvers = approversResponse?.results || [];

  // Fetch porequisition data for edit mode
  const { 
    data: porequisitionData, 
    isLoading: isLoadingPorequisition, 
    isError: isPorequisitionError,
    error: porequisitionError
  } = usePorequisitionQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createPorequisitionMutation = useCreatePorequisition();
  const updatePorequisitionMutation = useUpdatePorequisition(id);

  // Handle porequisition data loading
  useEffect(() => {
    if (porequisitionData && isEditMode) {
      // Reset the form with porequisition data
      porequisitionForm.reset({
        title: porequisitionData.title || '',
        vendor: porequisitionData.vendor,
        description: porequisitionData.description || '',
        amount: porequisitionData.amount || '',
        expected_delivery_date: porequisitionData.expected_delivery_date || new Date().toISOString().split('T')[0],
        sage_reference_number: porequisitionData.sage_reference_number || '',
        approver: porequisitionData.approver,
        attachment: [], // We can't load files directly, initialize empty
      });
      
      // If attachments were present, set preview info
      if (porequisitionData.attachments_data && Array.isArray(porequisitionData.attachments_data)) {
        const fileNames = porequisitionData.attachments_data.map((attachment: any, index: number) => ({
          name: typeof attachment === 'string' ? attachment.split('/').pop() || `File ${index + 1}` : attachment.name || `File ${index + 1}`,
          url: typeof attachment === 'string' ? attachment : (attachment.url || '')
        }));
        setFilePreview(fileNames);
      }
    }
  }, [porequisitionData, isEditMode, porequisitionForm]);

  // Handle error state
  useEffect(() => {
    if (isPorequisitionError && isEditMode) {
      console.error('Error loading porequisition:', porequisitionError);
    }
  }, [isPorequisitionError, porequisitionError, isEditMode]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      const currentFiles = porequisitionForm.getValues('attachment') || [];
      porequisitionForm.setValue('attachment', [...currentFiles, ...filesArray]);
      
      // Create preview
      const newPreviews = filesArray.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file)
      }));
      setFilePreview(prev => [...prev, ...newPreviews]);
    }
  };

  // Remove file from selection
  const removeFile = (index: number) => {
    const currentFiles = porequisitionForm.getValues('attachment') || [];
    const newFiles = currentFiles.filter((_, i) => i !== index);
    porequisitionForm.setValue('attachment', newFiles);
    
    // Update preview
    const newPreviews = filePreview.filter((_, i) => i !== index);
    setFilePreview(newPreviews);
  };

  // Form submission handler
  const onSubmit = async (values: PorequisitionFormValues) => {
    try {
      const formData = new FormData();
      
      // Append all form fields
      formData.append('title', values.title);
      formData.append('vendor', values.vendor.toString());
      formData.append('description', values.description);
      formData.append('amount', values.amount);
      formData.append('expected_delivery_date', values.expected_delivery_date);
      
      if (values.sage_reference_number) {
        formData.append('sage_reference_number', values.sage_reference_number);
      }
      
      if (values.approver) {
        formData.append('approver', values.approver.toString());
      }
      
      // Append files if any
      if (values.attachment && values.attachment.length > 0) {
        values.attachment.forEach((file) => {
          formData.append(`attachment`, file);
        });
      }

      if (isEditMode) {
        await updatePorequisitionMutation.mutateAsync({
          id: id as string,
          porequisition: formData
        });
        navigate(`/dashboard/procurement/po-requisition/view/${id}`);
      } else {
        const result = await createPorequisitionMutation.mutateAsync(formData);
        navigate(`/dashboard/procurement/po-requisition/view/${result.id}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (isEditMode && isLoadingPorequisition) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard/procurement/po-requisition')}
            className="hover:bg-emerald-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit PO Requisition' : 'Create PO Requisition'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEditMode ? 'Update PO requisition information' : 'Enter PO requisition details'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <Form {...porequisitionForm}>
          <form onSubmit={porequisitionForm.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={porequisitionForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Title *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Office Supplies Requisition" 
                      {...field}
                      className="border-gray-300 focus:border-emerald-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Vendor and Amount Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vendor */}
              <FormField
                control={porequisitionForm.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Vendor *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id.toString()}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount */}
              <FormField
                control={porequisitionForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Amount *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="e.g., 50000.00" 
                        {...field}
                        className="border-gray-300 focus:border-emerald-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Expected Delivery Date and Sage Reference Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expected Delivery Date */}
              <FormField
                control={porequisitionForm.control}
                name="expected_delivery_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Expected Delivery Date *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                        className="border-gray-300 focus:border-emerald-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sage Reference Number */}
              <FormField
                control={porequisitionForm.control}
                name="sage_reference_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Sage Reference Number (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., SAGE-001" 
                        {...field}
                        className="border-gray-300 focus:border-emerald-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Approver */}
            <FormField
              control={porequisitionForm.control}
              name="approver"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Approver (Optional)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'none' ? undefined : Number(value))}
                    value={field.value?.toString() || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select approver" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No approver</SelectItem>
                      {approvers.map((approver) => (
                        <SelectItem key={approver.id} value={approver.id.toString()}>
                          {approver.name || approver.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={porequisitionForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter description"
                      {...field}
                      className="min-h-[100px] resize-y border-gray-300 focus:border-emerald-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload Section */}
            <div className="space-y-4">
              <FormLabel className="text-gray-700">Attachment Documents (Optional)</FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Upload className="h-10 w-10 text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX, Images up to 10MB each
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  >
                    Select Files
                  </Button>
                </div>
              </div>

              {/* File Preview */}
              {filePreview.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                  {filePreview.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/procurement/po-requisition')}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPorequisitionMutation.isPending || updatePorequisitionMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {(createPorequisitionMutation.isPending || updatePorequisitionMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? 'Update' : 'Create'} PO Requisition
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PorequisitionForm;

