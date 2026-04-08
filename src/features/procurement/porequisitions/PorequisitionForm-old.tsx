// src/features/asset/porequisitions/PorequisitionForm.tsx
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
import { ArrowLeft, Loader2, Paperclip, Upload, FileText, X } from 'lucide-react';
import { Porequisition } from '@/types/porequisition';
import { User } from '@/types/user';
import { Vendor } from '@/types/vendor';
import { usePorequisitionQuery, useCreatePorequisition, useUpdatePorequisition } from '@/hooks/porequisition/usePorequisitionQueries';

import { useList } from '@/hooks/crud/useCrudOperations';
import { toast } from '@/components/ui/use-toast';

const ownerEndpoint = 'accounts/api/users/';
const vendorEndpoint = 'accounts/api/vendors/'

// Form schema definition
const porequisitionSchema = z.object({
  attachments: z.array(z.instanceof(File)).default([]),
  expected_payment_date: z.string(),
  invoice_number: z.string(),
  remark: z.string().optional().default(""),
  status: z.enum(['Draft', 'Pending', 'Approved', 'Rejected', 'Paid']),
  withholding_tax: z.string(),
  owner: z.number().optional(),
  vendor: z.number().optional(),
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
      attachments: [],
      expected_payment_date: new Date().toISOString().split('T')[0],
      invoice_number: '',
      remark: '',
      status: 'Draft',
      withholding_tax: '',
      owner: undefined as unknown as number,
      vendor: undefined as unknown as number,
    }
  });

  // Data fetching hooks
  const { data: users = [] } = useList<User>('users', ownerEndpoint);
  const { data: vendors = [] } = useList<Vendor>('vendors', vendorEndpoint);

  // Fetch porequisition data for edit mode using our custom hook
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
        attachments: [], // We can't load files directly, initialize empty
        expected_payment_date: porequisitionData.expected_payment_date || new Date().toISOString().split('T')[0],
        invoice_number: porequisitionData.invoice_number || '',
        remark: porequisitionData.remark || '',
        status: porequisitionData.status || 'Draft',
        withholding_tax: porequisitionData.withholding_tax || '',
        owner: porequisitionData.owner,
        vendor: porequisitionData.vendor,
      });
      
      // If attachments were present, set preview info
      if (porequisitionData.attachments && Array.isArray(porequisitionData.attachments)) {
        const fileNames = porequisitionData.attachments.map((attachment, index) => ({
          name: typeof attachment === 'string' ? attachment.split('/').pop() || `File ${index + 1}` : `File ${index + 1}`,
          url: typeof attachment === 'string' ? attachment : ''
        }));
        setFilePreview(fileNames);
      }
    }
  }, [porequisitionData, isEditMode, porequisitionForm]);

  const onSubmitPorequisition = async (data: PorequisitionFormValues) => {
    try {
      // Create FormData for handling file uploads
      const formData = new FormData();
      
      // Append all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'attachments') {
          // Handle file attachments separately
          Array.from(value as File[]).forEach((file) => {
            formData.append('attachments', file);
          });
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      
      if (isEditMode && id) {
        updatePorequisitionMutation.mutate(
          { id, porequisition: formData },
          { onSuccess: () => navigate('/procurement/po-requisition') }
        );
      } else {
        createPorequisitionMutation.mutate(
          formData,
          { onSuccess: () => navigate('/procurement/po-requisition') }
        );
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting the form",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    navigate('/procurement/po-requisition');
  };
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      // Update form value
      const currentFiles = porequisitionForm.getValues("attachments");
      porequisitionForm.setValue("attachments", [...currentFiles, ...filesArray]);
      
      // Create URL previews
      const newFilePreviews = filesArray.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file)
      }));
      
      setFilePreview(prev => [...prev, ...newFilePreviews]);
    }
  };
  
  // Handle file removal
  const handleRemoveFile = (index: number) => {
    // Remove from form value
    const currentFiles = porequisitionForm.getValues("attachments");
    const newFiles = [...currentFiles];
    newFiles.splice(index, 1);
    porequisitionForm.setValue("attachments", newFiles);
    
    // Remove from preview
    const newFilePreview = [...filePreview];
    
    // Release the object URL to prevent memory leaks
    if (newFilePreview[index]?.url) {
      URL.revokeObjectURL(newFilePreview[index].url);
    }
    
    newFilePreview.splice(index, 1);
    setFilePreview(newFilePreview);
  };

  if (isEditMode && isLoadingPorequisition) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading porequisition details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEditMode && isPorequisitionError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-500 text-xl">Error loading porequisition details</div>
          <p className="text-sm text-muted-foreground mb-4">
            {porequisitionError instanceof Error ? porequisitionError.message : 'An unknown error occurred'}
          </p>
          <Button onClick={handleCancel} variant="outline">
            Back to Porequisitions
          </Button>
        </div>
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
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit PO Requisition' : 'Create New PO Requisition'}
          </h1>
        </div>
      </div>

      <Form {...porequisitionForm}>
        <form onSubmit={porequisitionForm.handleSubmit(onSubmitPorequisition)} className="space-y-6">
          <div className="bg-white p-6 border rounded-md shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={porequisitionForm.control}
                name="invoice_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number<span className="text-red-500 ml-1">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter invoice number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={porequisitionForm.control}
                name="expected_payment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Payment Date<span className="text-red-500 ml-1">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={porequisitionForm.control}
                name="withholding_tax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Withholding Tax<span className="text-red-500 ml-1">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter withholding tax"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={porequisitionForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status<span className="text-red-500 ml-1">*</span></FormLabel>
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
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={porequisitionForm.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner<span className="text-red-500 ml-1">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={String(user.id)}>
                            {user.first_name} {user.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={porequisitionForm.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor<span className="text-red-500 ml-1">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vendors.map(vendor => (
                          <SelectItem key={vendor.id} value={String(vendor.id)}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={porequisitionForm.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remark</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter additional remarks"
                      {...field}
                      className="min-h-[100px] resize-y"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={porequisitionForm.control}
              name="attachments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attachments</FormLabel>
                  <FormControl>
                    <div 
                      className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center space-y-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      />
                      <div className="p-4 rounded-full bg-blue-50">
                        <Upload className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, Word, Excel, Images (max. 10MB each)
                        </p>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                  
                  {/* File preview area */}
                  {filePreview.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h3 className="text-sm font-medium">Attached Files:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {filePreview.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText className="h-4 w-4 flex-shrink-0 text-blue-500" />
                              <span className="text-sm truncate" title={file.name}>
                                {file.name}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFile(index)}
                              className="h-7 w-7 p-0 rounded-full"
                            >
                              <X className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createPorequisitionMutation.isPending || updatePorequisitionMutation.isPending}
            >
              {(createPorequisitionMutation.isPending || updatePorequisitionMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Update PO Requisition' : 'Create PO Requisition'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default PorequisitionForm;