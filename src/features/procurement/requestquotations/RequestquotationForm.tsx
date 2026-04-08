// src/features/asset/requestquotations/RequestquotationForm.tsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, ChevronDown, ChevronUp, Paperclip, X, Upload, FileText } from 'lucide-react';
import { Requestquotation } from '@/types/requestquotation';
import { User } from '@/types/user';
import { Facility } from '@/types/facility';
import { Vendor } from '@/types/vendor';
import { useRequestquotationQuery, useCreateRequestquotation, useUpdateRequestquotation } from '@/hooks/requestquotation/useRequestquotationQueries';

import { useList } from '@/hooks/crud/useCrudOperations';
import { toast } from '@/components/ui/use-toast';

const ownerEndpoint = 'accounts/api/users/';
const vendorEndpoint = 'accounts/api/vendors/';
const facilityEndpoint = 'facility/api/api/facilities/';

// Form schema definition
const requestquotationSchema = z.object({
  attachments: z.array(z.instanceof(File)).default([]),
  type: z.string().min(1, "Type is required"),
  title: z.string().min(1, "Title is required"),
  currency: z.string().min(1, "Currency is required"),
  terms: z.string().optional().default(""),
  requester: z.number({ required_error: "Requester is required" }),
  facility: z.number().optional(),
  vendors: z.array(z.number()).min(1, "At least one vendor is required")
});

type RequestquotationFormValues = z.infer<typeof requestquotationSchema>;

const RequestquotationForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Collapsible section states
  const [openSections, setOpenSections] = useState({
    basic: true,
    details: false,
    attachments: false
  });
  
  // File preview state
  const [filePreview, setFilePreview] = useState<{name: string, url: string}[]>([]);
  
  // Requestquotation form setup
  const requestquotationForm = useForm<RequestquotationFormValues>({
    resolver: zodResolver(requestquotationSchema),
    defaultValues: {
      attachments: [],
      type: '',
      title: '',
      currency: 'NGN',
      terms: '',
      requester: undefined as unknown as number,
      facility: undefined as unknown as number,
      vendors: []
    }
  });

  // Data fetching hooks
  const { data: users = [] } = useList<User>('users', ownerEndpoint);
  const { data: facilities = [] } = useList<Facility>('facilities', facilityEndpoint);
  const { data: vendors = [] } = useList<Vendor>('vendors', vendorEndpoint);

  // Filter users to only show requesters
  const requesters = useMemo(() => {
    return users.filter(user => user.roles === 'REQUESTER');
  }, [users]);

  // Fetch requestquotation data for edit mode using our custom hook
  const { 
    data: requestquotationData, 
    isLoading: isLoadingRequestquotation, 
    isError: isRequestquotationError,
    error: requestquotationError
  } = useRequestquotationQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createRequestquotationMutation = useCreateRequestquotation();
  const updateRequestquotationMutation = useUpdateRequestquotation(id);

  // Toggle section visibility
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle requestquotation data loading
  useEffect(() => {
    if (requestquotationData && isEditMode) {
      // Reset the form with requestquotation data
      requestquotationForm.reset({
        attachments: [],  // We can't load the files, just providing an empty array
        type: requestquotationData.type || '',
        title: requestquotationData.title || requestquotationData.title_en || '',
        currency: requestquotationData.currency || 'NGN',
        terms: requestquotationData.terms || requestquotationData.terms_en || '',
        requester: requestquotationData.requester || undefined as unknown as number,
        facility: requestquotationData.facility || undefined as unknown as number,
        vendors: Array.isArray(requestquotationData.vendors) ? requestquotationData.vendors : []
      });
      
      // If there were file attachments, show their names
      if (requestquotationData.attachments_data && Array.isArray(requestquotationData.attachments_data)) {
        const fileNames = requestquotationData.attachments_data.map((attachment, index) => ({
          name: attachment.file_url ? attachment.file_url.split('/').pop() || `File ${index + 1}` : `File ${index + 1}`,
          url: attachment.file_url || ''
        }));
        setFilePreview(fileNames);
      }
    }
  }, [requestquotationData, isEditMode, requestquotationForm]);

  const onSubmitRequestquotation = async (data: RequestquotationFormValues) => {
    try {
      // Create FormData for handling file uploads
      const formData = new FormData();
      
      // Append all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'attachments') {
          // Only handle file attachments if there are actual valid files
          const files = value as File[];
          if (files && Array.isArray(files) && files.length > 0) {
            files.forEach((file) => {
              // Double-check that each file is actually a File object
              if (file instanceof File) {
                formData.append('attachments', file);
              }
            });
          }
        } else if (key === 'vendors') {
          // Only handle vendors if there are actual vendor IDs
          const vendorIds = value as number[];
          if (vendorIds && Array.isArray(vendorIds) && vendorIds.length > 0) {
            vendorIds.forEach((vendorId) => {
              formData.append('vendors', String(vendorId));
            });
          }
        } else if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      });
      
      if (isEditMode && id) {
        updateRequestquotationMutation.mutate(
          { id, requestquotation: formData },
          { onSuccess: () => navigate('/dashboard/procurement/request-quotation') }
        );
      } else {
        createRequestquotationMutation.mutate(
          formData,
          { onSuccess: () => navigate('/dashboard/procurement/request-quotation') }
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
    navigate('/dashboard/procurement/request-quotation');
  };
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      // Update form value
      const currentFiles = requestquotationForm.getValues("attachments");
      requestquotationForm.setValue("attachments", [...currentFiles, ...filesArray]);
      
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
    const currentFiles = requestquotationForm.getValues("attachments");
    const newFiles = [...currentFiles];
    newFiles.splice(index, 1);
    requestquotationForm.setValue("attachments", newFiles);
    
    // Remove from preview
    const newFilePreview = [...filePreview];
    
    // Release the object URL to prevent memory leaks
    if (newFilePreview[index]?.url) {
      URL.revokeObjectURL(newFilePreview[index].url);
    }
    
    newFilePreview.splice(index, 1);
    setFilePreview(newFilePreview);
  };

  if (isEditMode && isLoadingRequestquotation) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading request quotation details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEditMode && isRequestquotationError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-500 text-xl">Error loading request quotation details</div>
          <p className="text-sm text-muted-foreground mb-4">
            {requestquotationError instanceof Error ? requestquotationError.message : 'An unknown error occurred'}
          </p>
          <Button onClick={handleCancel} variant="outline">
            Back to Request Quotations
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
            {isEditMode ? 'Edit Request Quotation' : 'Create New Request Quotation'}
          </h1>
        </div>
      </div>

      <Form {...requestquotationForm}>
        <form onSubmit={requestquotationForm.handleSubmit(onSubmitRequestquotation)} className="space-y-6">
          {/* First Collapsible: Basic Information */}
          <div className="rounded-md border overflow-hidden">
            <button
              type="button"
              className="flex justify-between items-center w-full p-4 bg-gray-50 text-left"
              onClick={() => toggleSection('basic')}
            >
              <h2 className="text-lg font-medium">Basic Information</h2>
              {openSections.basic ? 
                <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                <ChevronDown className="h-5 w-5 text-gray-500" />
              }
            </button>
            
            {openSections.basic && (
              <div className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={requestquotationForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter quotation title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={requestquotationForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type<span className="text-red-500 ml-1">*</span></FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select quotation type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="IFM Services">IFM Services</SelectItem>
                            <SelectItem value="Supply">Supply</SelectItem>
                            <SelectItem value="General Services">General Services</SelectItem>
                            <SelectItem value="Other Services">Other Services</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={requestquotationForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency<span className="text-red-500 ml-1">*</span></FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NGN">Nigerian Naira (NGN)</SelectItem>
                          <SelectItem value="USD">US Dollar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                          <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={requestquotationForm.control}
                    name="requester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requester<span className="text-red-500 ml-1">*</span></FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select requester" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {requesters.length > 0 ? (
                              requesters.map(user => (
                                <SelectItem key={user.id} value={String(user.id)}>
                                  {user.first_name} {user.last_name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-sm text-muted-foreground text-center">
                                No requesters available
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={requestquotationForm.control}
                    name="facility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facility</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select facility" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {facilities.map(facility => (
                              <SelectItem key={facility.id} value={String(facility.id)}>
                                {facility.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Details Section */}
          <div className="rounded-md border overflow-hidden">
            <button
              type="button"
              className="flex justify-between items-center w-full p-4 bg-gray-50 text-left"
              onClick={() => toggleSection('details')}
            >
              <h2 className="text-lg font-medium">Terms & Vendors</h2>
              {openSections.details ? 
                <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                <ChevronDown className="h-5 w-5 text-gray-500" />
              }
            </button>
            
            {openSections.details && (
              <div className="p-6 space-y-6 bg-white">
                <FormField
                  control={requestquotationForm.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms and Conditions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter terms and conditions"
                          {...field}
                          className="min-h-[120px] resize-y"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={requestquotationForm.control}
                  name="vendors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendors<span className="text-red-500 ml-1">*</span></FormLabel>
                      <div className="border rounded-md p-4 max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {vendors.map(vendor => (
                            <div key={vendor.id} className="flex items-start space-x-2">
                              <Checkbox 
                                id={`vendor-${vendor.id}`}
                                checked={field.value.includes(vendor.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, vendor.id]);
                                  } else {
                                    field.onChange(field.value.filter(id => id !== vendor.id));
                                  }
                                }}
                              />
                              <label 
                                htmlFor={`vendor-${vendor.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {vendor.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
          
          {/* Attachments Section */}
          <div className="rounded-md border overflow-hidden">
            <button
              type="button"
              className="flex justify-between items-center w-full p-4 bg-gray-50 text-left"
              onClick={() => toggleSection('attachments')}
            >
              <h2 className="text-lg font-medium">Attachments</h2>
              {openSections.attachments ? 
                <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                <ChevronDown className="h-5 w-5 text-gray-500" />
              }
            </button>
            
            {openSections.attachments && (
              <div className="p-6 space-y-6 bg-white">
                <FormField
                  control={requestquotationForm.control}
                  name="attachments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attachments</FormLabel>
                      <FormControl>
                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center space-y-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => fileInputRef.current?.click()}>
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
            )}
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
              disabled={createRequestquotationMutation.isPending || updateRequestquotationMutation.isPending}
            >
              {(createRequestquotationMutation.isPending || updateRequestquotationMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Update Request Quotation' : 'Create Request Quotation'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default RequestquotationForm;