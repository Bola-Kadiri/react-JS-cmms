// src/features/asset/purchaseorders/PurchaseorderForm.tsx
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
import { ArrowLeft, Loader2, ChevronDown, ChevronUp, Paperclip, X, Upload, FileText } from 'lucide-react';
import { Purchaseorder } from '@/types/purchaseorder';
import { User } from '@/types/user';
import { Facility } from '@/types/facility';
import { Department } from '@/types/department';
import { Vendor } from '@/types/vendor';
import { usePurchaseorderQuery, useCreatePurchaseorder, useUpdatePurchaseorder } from '@/hooks/purchaseorder/usePurchaseorderQueries';

import { useList } from '@/hooks/crud/useCrudOperations';
import { toast } from '@/components/ui/use-toast';

const ownerEndpoint = 'accounts/api/users/';
const vendorEndpoint = 'accounts/api/vendors/';
const facilityEndpoint = 'facility/api/api/facilities/';
const departmentEndpoint = 'asset_inventory/api/departments/';

// Form schema definition
const purchaseorderSchema = z.object({
  attachments: z.array(z.instanceof(File)).default([]),
  type: z.string(),
  requested_date: z.string(),
  contact_person: z.string(),
  expected_delivery_date: z.string(),
  ship_to: z.string(),
  terms_and_conditions: z.string().optional().default(""),
  status: z.enum(['Draft', 'Pending', 'Sent', 'Delivered', 'Cancelled']),
  owner: z.number().optional(),
  facility: z.number().optional(),
  department: z.number().optional(),
  requested_by: z.number().optional(),
  vendor: z.number().optional()
});

type PurchaseorderFormValues = z.infer<typeof purchaseorderSchema>;

const PurchaseorderForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Collapsible section states
  const [openSections, setOpenSections] = useState({
    basic: true,
    delivery: false,
    attachments: false,
    additional: false
  });
  
  // File preview state
  const [filePreview, setFilePreview] = useState<{name: string, url: string}[]>([]);
  
  // Purchaseorder form setup
  const purchaseorderForm = useForm<PurchaseorderFormValues>({
    resolver: zodResolver(purchaseorderSchema),
    defaultValues: {
      attachments: [],
      type: '',
      requested_date: new Date().toISOString().split('T')[0],
      contact_person: '',
      expected_delivery_date: '',
      ship_to: '',
      terms_and_conditions: '',
      status: 'Draft',
      owner: undefined as unknown as number,
      facility: undefined as unknown as number,
      department: undefined as unknown as number,
      requested_by: undefined as unknown as number,
      vendor: undefined as unknown as number
    }
  });

  // Data fetching hooks
  const { data: users = [] } = useList<User>('users', ownerEndpoint);
  const { data: facilities = [] } = useList<Facility>('facilities', facilityEndpoint);
  const { data: vendors = [] } = useList<Vendor>('vendors', vendorEndpoint);
  const { data: departments = [] } = useList<Department>('departments', departmentEndpoint);

  // Fetch purchaseorder data for edit mode using our custom hook
  const { 
    data: purchaseorderData, 
    isLoading: isLoadingPurchaseorder, 
    isError: isPurchaseorderError,
    error: purchaseorderError
  } = usePurchaseorderQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createPurchaseorderMutation = useCreatePurchaseorder();
  const updatePurchaseorderMutation = useUpdatePurchaseorder(id);

  // Toggle section visibility
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle purchaseorder data loading
  useEffect(() => {
    if (purchaseorderData && isEditMode) {
      // Reset the form with purchaseorder data
      purchaseorderForm.reset({
        attachments: [],  // We can't load the files, just providing an empty array
        type: purchaseorderData.type,
        requested_date: purchaseorderData.requested_date,
        contact_person: purchaseorderData.contact_person,
        expected_delivery_date: purchaseorderData.expected_delivery_date,
        ship_to: purchaseorderData.ship_to,
        terms_and_conditions: purchaseorderData.terms_and_conditions || '',
        status: purchaseorderData.status,
        owner: purchaseorderData.owner,
        facility: purchaseorderData.facility,
        department: purchaseorderData.department,
        requested_by: purchaseorderData.requested_by,
        vendor: purchaseorderData.vendor
      });
      
      // If there were file attachments, we could show their names here
      if (purchaseorderData.attachments && Array.isArray(purchaseorderData.attachments)) {
        const fileNames = purchaseorderData.attachments.map((attachment, index) => ({
          name: typeof attachment === 'string' ? attachment.split('/').pop() || `File ${index + 1}` : `File ${index + 1}`,
          url: typeof attachment === 'string' ? attachment : ''
        }));
        setFilePreview(fileNames);
      }
    }
  }, [purchaseorderData, isEditMode, purchaseorderForm]);

  const onSubmitPurchaseorder = async (data: PurchaseorderFormValues) => {
    try {
      // Create FormData for handling file uploads
      const formData = new FormData();
      
      // Append all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'attachments') {
          // Only handle file attachments if there are actual files
          const files = value as File[];
          if (files && files.length > 0) {
            Array.from(files).forEach((file) => {
              formData.append('attachments', file);
            });
          }
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      
      if (isEditMode && id) {
        updatePurchaseorderMutation.mutate(
          { id, purchaseorder:formData },
          { onSuccess: () => navigate('/procurement/purchase-order') }
        );
      } else {
        createPurchaseorderMutation.mutate(
          formData,
          { onSuccess: () => navigate('/procurement/purchase-order') }
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
    navigate('/procurement/purchase-order');
  };
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      // Update form value
      const currentFiles = purchaseorderForm.getValues("attachments");
      purchaseorderForm.setValue("attachments", [...currentFiles, ...filesArray]);
      
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
    const currentFiles = purchaseorderForm.getValues("attachments");
    const newFiles = [...currentFiles];
    newFiles.splice(index, 1);
    purchaseorderForm.setValue("attachments", newFiles);
    
    // Remove from preview
    const newFilePreview = [...filePreview];
    
    // Release the object URL to prevent memory leaks
    if (newFilePreview[index]?.url) {
      URL.revokeObjectURL(newFilePreview[index].url);
    }
    
    newFilePreview.splice(index, 1);
    setFilePreview(newFilePreview);
  };

  if (isEditMode && isLoadingPurchaseorder) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading purchase order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEditMode && isPurchaseorderError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-500 text-xl">Error loading purchase order details</div>
          <p className="text-sm text-muted-foreground mb-4">
            {purchaseorderError instanceof Error ? purchaseorderError.message : 'An unknown error occurred'}
          </p>
          <Button onClick={handleCancel} variant="outline">
            Back to Purchase orders
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
            {isEditMode ? 'Edit Purchase Order' : 'Create New Purchase Order'}
          </h1>
        </div>
      </div>

      <Form {...purchaseorderForm}>
        <form onSubmit={purchaseorderForm.handleSubmit(onSubmitPurchaseorder)} className="space-y-6">
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
                    control={purchaseorderForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter purchase order type"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={purchaseorderForm.control}
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
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Sent">Sent</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={purchaseorderForm.control}
                    name="requested_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requested Date<span className="text-red-500 ml-1">*</span></FormLabel>
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
                  
                  <FormField
                    control={purchaseorderForm.control}
                    name="contact_person"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter contact person"
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
                    control={purchaseorderForm.control}
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
                  
                  <FormField
                    control={purchaseorderForm.control}
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={purchaseorderForm.control}
                    name="requested_by"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requested By</FormLabel>
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
                    control={purchaseorderForm.control}
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
                </div>
                
                <FormField
                    control={purchaseorderForm.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map(department => (
                              <SelectItem key={department.id} value={String(department.id)}>
                                {department.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
            )}
          </div>
          
          {/* Delivery Details Section */}
          <div className="rounded-md border overflow-hidden">
            <button
              type="button"
              className="flex justify-between items-center w-full p-4 bg-gray-50 text-left"
              onClick={() => toggleSection('delivery')}
            >
              <h2 className="text-lg font-medium">Delivery Information</h2>
              {openSections.delivery ? 
                <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                <ChevronDown className="h-5 w-5 text-gray-500" />
              }
            </button>
            
            {openSections.delivery && (
              <div className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={purchaseorderForm.control}
                    name="expected_delivery_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Delivery Date<span className="text-red-500 ml-1">*</span></FormLabel>
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
                  
                  <FormField
                    control={purchaseorderForm.control}
                    name="ship_to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ship To<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter shipping address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={purchaseorderForm.control}
                  name="terms_and_conditions"
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
                  control={purchaseorderForm.control}
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
              disabled={createPurchaseorderMutation.isPending || updatePurchaseorderMutation.isPending}
            >
              {(createPurchaseorderMutation.isPending || updatePurchaseorderMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Update Purchase Order' : 'Create Purchase Order'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default PurchaseorderForm;