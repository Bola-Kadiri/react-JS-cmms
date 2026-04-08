// src/features/procurement/vendorcontracts/VendorcontractForm.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Upload, FileText, X } from 'lucide-react';
import { VendorContract } from '@/types/vendorcontract';
import { useVendorContractQuery, useCreateVendorContract, useUpdateVendorContract } from '@/hooks/vendorcontract/useVendorcontractQueries';
import { useVendorsQuery } from '@/hooks/vendor/useVendorQueries';
import { usePpmReviewersQuery } from '@/hooks/ppm/usePpmQueries';

// Form schema definition
const vendorcontractSchema = z.object({
  contract_title: z.string().min(1, "Contract title is required"),
  vendor: z.number({ required_error: "Vendor is required" }),
  contract_type: z.enum(['Service', 'Purchase', 'Lease', 'NDA'], {
    required_error: "Contract type is required"
  }),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  proposed_value: z.string().min(1, "Proposed value is required"),
  reviewer: z.number({ required_error: "Reviewer is required" }),
  attachment: z.array(z.instanceof(File)).default([]),
}).refine((data) => {
  // Validate that end date is after start date
  if (data.start_date && data.end_date) {
    return new Date(data.end_date) >= new Date(data.start_date);
  }
  return true;
}, {
  message: "End date must be after or equal to start date",
  path: ["end_date"],
});

type VendorcontractFormValues = z.infer<typeof vendorcontractSchema>;

const VendorcontractForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // File preview state
  const [filePreview, setFilePreview] = useState<{name: string, url: string}[]>([]);
  
  // Vendor contract form setup
  const vendorcontractForm = useForm<VendorcontractFormValues>({
    resolver: zodResolver(vendorcontractSchema),
    defaultValues: {
      contract_title: '',
      vendor: undefined as unknown as number,
      contract_type: 'Service',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      proposed_value: '',
      reviewer: undefined as unknown as number,
      attachment: [],
    }
  });

  // Data fetching hooks
  const { data: vendorsResponse } = useVendorsQuery();
  const vendors = vendorsResponse?.results || [];
  const { data: reviewers = [] } = usePpmReviewersQuery();

  // Fetch vendor contract data for edit mode
  const { 
    data: vendorcontractData, 
    isLoading: isLoadingVendorContract, 
    isError: isVendorContractError,
    error: vendorcontractError
  } = useVendorContractQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createVendorContractMutation = useCreateVendorContract();
  const updateVendorContractMutation = useUpdateVendorContract(id);

  // Handle vendor contract data loading
  useEffect(() => {
    if (vendorcontractData && isEditMode) {
      // Reset the form with vendor contract data
      vendorcontractForm.reset({
        contract_title: vendorcontractData.contract_title || '',
        vendor: vendorcontractData.vendor,
        contract_type: vendorcontractData.contract_type || 'Service',
        start_date: vendorcontractData.start_date || new Date().toISOString().split('T')[0],
        end_date: vendorcontractData.end_date || '',
        proposed_value: vendorcontractData.proposed_value || '',
        reviewer: vendorcontractData.reviewer,
        attachment: [], // We can't load files directly, initialize empty
      });
      
      // If attachments were present, set preview info
      if (vendorcontractData.attachments_data && Array.isArray(vendorcontractData.attachments_data)) {
        const fileNames = vendorcontractData.attachments_data.map((agreement: any, index: number) => ({
          name: typeof agreement === 'string' ? agreement.split('/').pop() || `File ${index + 1}` : agreement.name || `File ${index + 1}`,
          url: typeof agreement === 'string' ? agreement : (agreement.url || '')
        }));
        setFilePreview(fileNames);
      }
    }
  }, [vendorcontractData, isEditMode, vendorcontractForm]);

  // Handle error state
  useEffect(() => {
    if (isVendorContractError && isEditMode) {
      console.error('Error loading vendor contract:', vendorcontractError);
    }
  }, [isVendorContractError, vendorcontractError, isEditMode]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      const currentFiles = vendorcontractForm.getValues('attachment') || [];
      vendorcontractForm.setValue('attachment', [...currentFiles, ...filesArray]);
      
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
    const currentFiles = vendorcontractForm.getValues('attachment') || [];
    const newFiles = currentFiles.filter((_, i) => i !== index);
    vendorcontractForm.setValue('attachment', newFiles);
    
    // Update preview
    const newPreviews = filePreview.filter((_, i) => i !== index);
    setFilePreview(newPreviews);
  };

  // Form submission handler
  const onSubmit = async (values: VendorcontractFormValues) => {
    try {
      const formData = new FormData();
      
      // Append all form fields
      formData.append('contract_title', values.contract_title);
      formData.append('vendor', values.vendor.toString());
      formData.append('contract_type', values.contract_type);
      formData.append('start_date', values.start_date);
      formData.append('end_date', values.end_date);
      formData.append('proposed_value', values.proposed_value);
      formData.append('reviewer', values.reviewer.toString());
      
      // Append files if any
      if (values.attachment && values.attachment.length > 0) {
        values.attachment.forEach((file, index) => {
          formData.append(`attachment`, file);
        });
      }

      if (isEditMode) {
        await updateVendorContractMutation.mutateAsync({
          id: id as string,
          vendorContract: formData
        });
        navigate(`/dashboard/procurement/vendor-contracts/view/${id}`);
      } else {
        const result = await createVendorContractMutation.mutateAsync(formData);
        navigate(`/dashboard/procurement/vendor-contracts/view/${result.id}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (isEditMode && isLoadingVendorContract) {
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
            onClick={() => navigate('/dashboard/procurement/vendor-contracts')}
            className="hover:bg-emerald-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Vendor Contract' : 'Create Vendor Contract'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEditMode ? 'Update vendor contract information' : 'Enter vendor contract details'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <Form {...vendorcontractForm}>
          <form onSubmit={vendorcontractForm.handleSubmit(onSubmit)} className="space-y-6">
            {/* Contract Title */}
            <FormField
              control={vendorcontractForm.control}
              name="contract_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Contract Title *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Annual Maintenance Contract" 
                      {...field}
                      className="border-gray-300 focus:border-emerald-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Vendor and Contract Type Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vendor */}
              <FormField
                control={vendorcontractForm.control}
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

              {/* Contract Type */}
              <FormField
                control={vendorcontractForm.control}
                name="contract_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Contract Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select contract type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Service">Service</SelectItem>
                        <SelectItem value="Purchase">Purchase</SelectItem>
                        <SelectItem value="Lease">Lease</SelectItem>
                        <SelectItem value="NDA">NDA</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date Range Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <FormField
                control={vendorcontractForm.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Start Date *</FormLabel>
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

              {/* End Date */}
              <FormField
                control={vendorcontractForm.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">End Date *</FormLabel>
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
            </div>

            {/* Proposed Value and Reviewer Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Proposed Value */}
              <FormField
                control={vendorcontractForm.control}
                name="proposed_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Proposed Value *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="e.g., 500000.00" 
                        {...field}
                        className="border-gray-300 focus:border-emerald-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reviewer */}
              <FormField
                control={vendorcontractForm.control}
                name="reviewer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Reviewer *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select reviewer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reviewers.map((reviewer) => (
                          <SelectItem key={reviewer.id} value={reviewer.id.toString()}>
                            {reviewer.email || `User ${reviewer.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* File Upload Section */}
            <div className="space-y-4">
              <FormLabel className="text-gray-700">Agreement Documents (Optional)</FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Upload className="h-10 w-10 text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX up to 10MB each
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
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
                onClick={() => navigate('/dashboard/procurement/vendor-contracts')}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createVendorContractMutation.isPending || updateVendorContractMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {(createVendorContractMutation.isPending || updateVendorContractMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? 'Update' : 'Create'} Vendor Contract
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default VendorcontractForm;

