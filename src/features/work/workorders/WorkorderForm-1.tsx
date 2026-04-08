// src/features/asset/workorders/WorkorderForm.tsx
import { useState, useEffect } from 'react';
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
import { ArrowLeft, Loader2, Calendar, Clock, Upload, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Workorder } from '@/types/workorder';
import { User } from '@/types/user';
import { Category } from '@/types/category';
import { Subcategory } from '@/types/subcategory';
import { Asset } from '@/types/asset';
import { Facility } from '@/types/facility';
import { Apartment } from '@/types/apartment';
import { Department } from '@/types/department';
import { useWorkorderQuery, useCreateWorkorder, useUpdateWorkorder } from '@/hooks/workorder/useWorkorderQueries';
import { useList } from '@/hooks/crud/useCrudOperations';

const ownerEndpoint = 'accounts/api/users/';
const catEndpoint = 'accounts/api/categories/';
const subcatEndpoint = 'accounts/api/subcategories/';
const assetEndpoint = 'asset_inventory/api/assets/';
const facilityEndpoint = 'facility/api/api/facilities/';
const apartmentEndpoint = 'facility/api/api/apartments/';
const departmentEndpoint = 'accounts/api/departments/';

// Form schema definition
const workorderSchema = z.object({
  status: z.enum(['Active', 'Inactive']),
  type: z.enum(['Unplanned', 'Planned']),
  sub_type: z.string(),
  priority: z.enum(['Low', 'Medium', 'High']),
  ppm_type: z.enum(['Scheduled', 'Unscheduled']),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  expected_start_date: z.string(),
  expected_start_time: z.string(),
  // duration: z.string(),
  approved: z.boolean(),
  mobilization_fee_required: z.boolean(),
  po_required: z.boolean(),
  is_approved: z.boolean(),
  remark: z.string().optional().default(""),
  item_cost: z.string(),
  payment_requisition: z.boolean(),
  approval_status: z.enum(['Pending', 'Approved', 'Rejected']),
  currency: z.enum(['USD', 'EUR', 'NGN']),
  exclude_management_fee: z.boolean(),
  add_discount: z.boolean(),
  require_mobilization_fee: z.boolean(),
  follow_up_notes: z.string().optional().default(""),
  invoice_no: z.string().optional().default(""),
  facility: z.number().optional(),
  apartment: z.number().optional(),
  category: z.number().optional(),
  subcategory: z.number().optional(),
  department: z.number().optional(),
  work_owner: z.number().optional(),
  request_to: z.number().optional(),
  // follow_up: z.number().optional(),
  asset: z.number().optional(),
  files: z.array(z.any()).default([])
});

type WorkorderFormValues = z.infer<typeof workorderSchema>;

const WorkorderForm = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEditMode = !!slug;
  
  // Collapsible section states
  const [openSections, setOpenSections] = useState({
    basic: true,
    schedule: false,
    options: false,
    additional: false
  });
  
  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Workorder form setup
  const workorderForm = useForm<WorkorderFormValues>({
    resolver: zodResolver(workorderSchema),
    defaultValues: {
      status: 'Active',
      type: 'Unplanned',
      sub_type: '',
      priority: 'Medium',
      ppm_type: 'Scheduled',
      title: '',
      description: '',
      expected_start_date: '',
      expected_start_time: '',
      // duration: '',
      approved: false,
      mobilization_fee_required: false,
      po_required: false,
      is_approved: false,
      remark: '',
      item_cost: '',
      payment_requisition: false,
      approval_status: 'Pending',
      currency: 'NGN',
      exclude_management_fee: false,
      add_discount: false,
      require_mobilization_fee: false,
      follow_up_notes: '',
      invoice_no: '',
      facility: undefined as unknown as number,
      apartment: undefined as unknown as number,
      category: undefined as unknown as number, 
      subcategory: undefined as unknown as number,
      department: undefined as unknown as number,
      work_owner: undefined as unknown as number,
      request_to: undefined as unknown as number,
      // follow_up: undefined as unknown as number,
      asset: undefined as unknown as number,
      files: []
    }
  });

  // Data fetching hooks
  const { data: users = [] } = useList<User>('users', ownerEndpoint);
  const { data: categories = [] } = useList<Category>('categories', catEndpoint);
  const { data: subcategories = [] } = useList<Subcategory>('subcategories', subcatEndpoint);
  const { data: assets = [] } = useList<Asset>('assets', assetEndpoint);
  const { data: facilities = [] } = useList<Facility>('facilities', facilityEndpoint);
  const { data: apartments = [] } = useList<Apartment>('apartments', apartmentEndpoint);
  const { data: departments = [] } = useList<Department>('departments', departmentEndpoint);

  // Fetch workorder data for edit mode using our custom hook
  const { 
    data: workorderData, 
    isLoading: isLoadingWorkorder, 
    isError: isWorkorderError,
    error: workorderError
  } = useWorkorderQuery(isEditMode ? slug : undefined);

  // Use our custom mutation hooks
  const createWorkorderMutation = useCreateWorkorder();
  const updateWorkorderMutation = useUpdateWorkorder(slug);

  // Toggle section visibility
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      // Update form value
      const currentFiles = workorderForm.getValues('files');
      workorderForm.setValue('files', [...currentFiles, ...newFiles]);
    }
  };

  // Remove a file
  const removeFile = (index: number) => {
    const updatedFiles = [...uploadedFiles];
    updatedFiles.splice(index, 1);
    setUploadedFiles(updatedFiles);
    
    const currentFormFiles = workorderForm.getValues('files');
    const updatedFormFiles = [...currentFormFiles];
    updatedFormFiles.splice(index, 1);
    workorderForm.setValue('files', updatedFormFiles);
  };

  // Handle workorder data loading
  useEffect(() => {
    if (workorderData && isEditMode) {
      // Reset the form with workorder data
      workorderForm.reset({
        status: workorderData.status,
        type: workorderData.type,
        sub_type: workorderData.sub_type,
        priority: workorderData.priority,
        ppm_type: workorderData.ppm_type,
        title: workorderData.title,
        description: workorderData.description,
        expected_start_date: workorderData.expected_start_date,
        expected_start_time: workorderData.expected_start_time,
        // duration: workorderData.duration,
        approved: workorderData.approved,
        mobilization_fee_required: workorderData.mobilization_fee_required,
        po_required: workorderData.po_required,
        is_approved: workorderData.is_approved,
        remark: workorderData.remark,
        item_cost: workorderData.item_cost,
        payment_requisition: workorderData.payment_requisition,
        approval_status: workorderData.approval_status,
        currency: workorderData.currency,
        exclude_management_fee: workorderData.exclude_management_fee,
        add_discount: workorderData.add_discount,
        require_mobilization_fee: workorderData.require_mobilization_fee,
        follow_up_notes: workorderData.follow_up_notes,
        invoice_no: workorderData.invoice_no,
        facility: workorderData.facility,
        apartment: workorderData.apartment,
        category: workorderData.category,
        subcategory: workorderData.subcategory,
        department: workorderData.department,
        work_owner: workorderData.work_owner,
        request_to: workorderData.request_to,
        // follow_up: workorderData.follow_up,
        asset: workorderData.asset,
        files: workorderData.files || []
      });
      
      // Set uploaded files if available
      if (workorderData.files && workorderData.files.length > 0) {
        // setUploadedFiles(workorderData.files);
        // setUploadedFiles(workorderData.files);
      }
    }
  }, [workorderData, isEditMode, workorderForm]);

  const onSubmitWorkorder = (data: WorkorderFormValues) => {
    // Create form data for file uploads
    const formData = new FormData();
    
    // Append files to formData if using multipart/form-data
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach((file, index) => {
        if (file instanceof File) {
          formData.append(`files[${index}]`, file);
        }
      });
    }
    
    // if (isEditMode && slug) {
    //   updateWorkorderMutation.mutate(
    //     { slug, workorder: data },
    //     { onSuccess: () => navigate('/work/orders') }
    //   );
    // } else {
    //   createWorkorderMutation.mutate(
    //     data as Omit<Workorder, 'id'>,
    //     { onSuccess: () => navigate('/work/orders') }
    //   );
    // }
  };

  const handleCancel = () => {
    navigate('/work/orders');
  };

  if (isEditMode && isLoadingWorkorder) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading workorder details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEditMode && isWorkorderError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-500 text-xl">Error loading workorder details</div>
          <p className="text-sm text-muted-foreground mb-4">
            {workorderError instanceof Error ? workorderError.message : 'An unknown error occurred'}
          </p>
          <Button onClick={handleCancel} variant="outline">
            Back to Workorders
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
            {isEditMode ? 'Edit Workorder' : 'Create New Workorder'}
          </h1>
        </div>
      </div>

      <Form {...workorderForm}>
        <form onSubmit={workorderForm.handleSubmit(onSubmitWorkorder)} className="space-y-6">
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
                <FormField
                  control={workorderForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title<span className="text-red-500 ml-1">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter workorder title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={workorderForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={String(category.id)}>
                                {category.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={workorderForm.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subcategory" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subcategories.map(subcat => (
                              <SelectItem key={subcat.id} value={String(subcat.id)}>
                                {subcat.title}
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
                    control={workorderForm.control}
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
                  
                  <FormField
                    control={workorderForm.control}
                    name="apartment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apartment</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select apartment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {apartments.map(apartment => (
                              <SelectItem key={apartment.id} value={String(apartment.id)}>
                                {apartment.type}
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
                    control={workorderForm.control}
                    name="work_owner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Owner</FormLabel>
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
                    control={workorderForm.control}
                    name="request_to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Request To</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select requestee" />
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
                  
                  {/* <FormField
                    control={workorderForm.control}
                    name="follow_up"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Follow Up</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select follow up person" />
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
                  /> */}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={workorderForm.control}
                  name="asset"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select asset" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {assets.map(asset => (
                            <SelectItem key={asset.id} value={String(asset.id)}>
                              {asset.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={workorderForm.control}
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
                
                <FormField
                  control={workorderForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter workorder description"
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
          
          {/* Second Collapsible: Schedule and Priority */}
          <div className="rounded-md border overflow-hidden">
            <button
              type="button"
              className="flex justify-between items-center w-full p-4 bg-gray-50 text-left"
              onClick={() => toggleSection('schedule')}
            >
              <h2 className="text-lg font-medium">Schedule and Priority</h2>
              {openSections.schedule ? 
                <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                <ChevronDown className="h-5 w-5 text-gray-500" />
              }
            </button>
            
            {openSections.schedule && (
              <div className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={workorderForm.control}
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
                    control={workorderForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Planned">Planned</SelectItem>
                            <SelectItem value="Unplanned">Unplanned</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={workorderForm.control}
                    name="sub_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub Type</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter sub type"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={workorderForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={workorderForm.control}
                    name="ppm_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workorder Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select workorder type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                            <SelectItem value="Unscheduled">Unscheduled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={workorderForm.control}
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
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={workorderForm.control}
                    name="item_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Cost</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="Enter cost amount"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={workorderForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
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
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={workorderForm.control}
                    name="expected_start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Start Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="date" 
                              {...field}
                              className="pl-10"
                            />
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={workorderForm.control}
                    name="expected_start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Start Time</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="time" 
                              {...field}
                              className="pl-10"
                            />
                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* <FormField
                    control={workorderForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. 2 hours"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                </div>
                </div>
            )}
          </div>

          <div className="rounded-md border overflow-hidden">
            <button
              type="button"
              className="flex justify-between items-center w-full p-4 bg-gray-50 text-left"
              onClick={() => toggleSection('options')}
            >
              <h2 className="text-lg font-medium">Options</h2>
              {openSections.options ? 
                <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                <ChevronDown className="h-5 w-5 text-gray-500" />
              }
            </button>
            
            {openSections.options && (
              <div className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={workorderForm.control}
                    name="approved"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-medium leading-none">Approved</FormLabel>
                          <p className="text-sm text-muted-foreground">Mark if the workorder has been approved</p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={workorderForm.control}
                    name="mobilization_fee_required"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-medium leading-none">Mobilization Fee Required</FormLabel>
                          <p className="text-sm text-muted-foreground">Mark if mobilization fee is needed</p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={workorderForm.control}
                    name="add_discount"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-medium leading-none">Add Discount</FormLabel>
                          <p className="text-sm text-muted-foreground">Mark to apply discount</p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={workorderForm.control}
                    name="po_required"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-medium leading-none">PO Required</FormLabel>
                          <p className="text-sm text-muted-foreground">Mark if purchase order is required</p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={workorderForm.control}
                    name="is_approved"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-medium leading-none">Is Approved</FormLabel>
                          <p className="text-sm text-muted-foreground">Mark if approval has been granted</p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={workorderForm.control}
                    name="exclude_management_fee"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-medium leading-none">Exclude Management Fee</FormLabel>
                          <p className="text-sm text-muted-foreground">Mark to exclude management fee</p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={workorderForm.control}
                    name="payment_requisition"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-medium leading-none">Payment Requisition</FormLabel>
                          <p className="text-sm text-muted-foreground">Mark if payment requisition is needed</p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={workorderForm.control}
                    name="require_mobilization_fee"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0 border p-4 rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-medium leading-none">Require Mobilization Fee</FormLabel>
                          <p className="text-sm text-muted-foreground">Mark if mobilization fee is required</p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </div>

          {/* First Collapsible: Basic Information */}
          <div className="rounded-md border overflow-hidden">
            <button
              type="button"
              className="flex justify-between items-center w-full p-4 bg-gray-50 text-left"
              onClick={() => toggleSection('additional')}
            >
              <h2 className="text-lg font-medium">Additional Information</h2>
              {openSections.additional ? 
                <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                <ChevronDown className="h-5 w-5 text-gray-500" />
              }
            </button>
            
            {openSections.additional && (
              <div className="p-6 space-y-6 bg-white">
              <FormField
                control={workorderForm.control}
                name="invoice_no"
                render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
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
                  control={workorderForm.control}
                  name="follow_up_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow Up Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter follow up notes"
                          {...field}
                          className="min-h-[100px] resize-y"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={workorderForm.control}
                  name="remark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter remarks"
                          {...field}
                          className="min-h-[100px] resize-y"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={workorderForm.control}
                  name="files"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Files</FormLabel>
                      <FormControl>
                        <div className="border rounded-md p-4 space-y-4">
                          <div className="flex items-center justify-center w-full">
                            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-10 h-10 mb-3 text-gray-500" />
                                <p className="mb-2 text-sm text-gray-600 font-medium">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">
                                  PDF, DOCX, JPG, PNG or any other relevant file types
                                </p>
                              </div>
                              <input 
                                id="file-upload" 
                                type="file" 
                                className="hidden" 
                                multiple
                                onChange={handleFileChange}
                              />
                            </label>
                          </div>
                          
                          {/* Display uploaded files */}
                          {uploadedFiles.length > 0 && (
                            <div className="mt-6">
                              <h3 className="text-sm font-medium text-gray-700 mb-3">Uploaded Files:</h3>
                              <ul className="space-y-3">
                                {uploadedFiles.map((file, index) => (
                                  <li key={index} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-md">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-md">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                      </div>
                                      <span className="text-sm font-medium">{file.name}</span>
                                    </div>
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => removeFile(index)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
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
              disabled={createWorkorderMutation.isPending || updateWorkorderMutation.isPending}
            >
              {(createWorkorderMutation.isPending || updateWorkorderMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Update Workorder' : 'Create Workorder'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default WorkorderForm;
