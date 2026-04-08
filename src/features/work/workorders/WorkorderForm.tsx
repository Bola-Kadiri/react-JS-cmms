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
import { ArrowLeft, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Workorder } from '@/types/workorder';
import { useWorkorderQuery, useCreateWorkorder, useUpdateWorkorder, useApproverUsersQuery } from '@/hooks/workorder/useWorkorderQueries';
import { useCategoriesQuery } from '@/hooks/category/useCategoryQueries';
import { useSubcategoriesQuery } from '@/hooks/subcategory/useSubcategoryQueries';
import { useApprovedPpmsQuery, usePpmReviewersQuery } from '@/hooks/ppm/usePpmQueries';
import { useApprovedWorkrequestsQuery } from '@/hooks/workrequest/useWorkrequestQueries';
import { useFacilitiesQuery } from '@/hooks/facility/useFacilityQueries';
import { useDepartmentsQuery } from '@/hooks/department/useDepartmentQueries';
import { useAssetsByFacilityQuery, useBuildingsByFacilityQuery, useProcurementUsersQuery } from '@/hooks/workrequest/useWorkrequestQueries';
import { toast } from '@/components/ui/use-toast';

// Form schema definition
const workorderSchema = z.object({
  type: z.enum(['FROM-PPM', 'FROM-WORK-REQUEST', 'RAISE-PAYMENT']),
  source_ppm: z.number().optional(),
  source_work_request: z.number().optional(),
  category: z.number().optional(),
  subcategory: z.number().optional(),
  facility: z.number().optional(),
  building: z.number().optional(),
  department: z.number().optional(),
  asset: z.number().optional(),
  description: z.string().optional().default(""),
  expected_start_date: z.string().min(1, "Expected start date is required"),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  cost: z.string().optional().default(""),
  currency: z.enum(['USD', 'EUR', 'NGN']).optional(),
  approver: z.number().optional(),
  reviewers: z.array(z.number()).optional().default([])
}).refine((data) => {
  // If type is FROM-WORK-REQUEST, source_work_request is required
  if (data.type === 'FROM-WORK-REQUEST' && !data.source_work_request) {
    return false;
  }
  // If type is FROM-PPM, source_ppm is required
  if (data.type === 'FROM-PPM' && !data.source_ppm) {
    return false;
  }
  return true;
}, {
  message: "Source field is required for selected type",
  path: ["source_work_request"], // This will show the error on the source field
});

type WorkorderFormValues = z.infer<typeof workorderSchema>;

const WorkorderForm = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEditMode = !!slug;
  
  // UI state
  const [openSections, setOpenSections] = useState({
    basic: true,
    conditional: true
  });
  
  // Flag to prevent dependency resets during auto-fill
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  
  // Track auto-filled fields to disable them
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  
  // Form setup
  const workorderForm = useForm<WorkorderFormValues>({
    resolver: zodResolver(workorderSchema),
    defaultValues: {
      type: 'FROM-PPM',
      source_ppm: undefined,
      source_work_request: undefined,
      category: undefined,
      subcategory: undefined,
      facility: undefined,
      building: undefined,
      department: undefined,
      asset: undefined,
      description: '',
      expected_start_date: '',
      priority: 'Medium',
      cost: '',
      currency: 'NGN',
      approver: undefined,
      reviewers: []
    }
  });

  // Watch form values for auto-fill and conditional rendering
  const selectedType = workorderForm.watch('type');
  const selectedFacility = workorderForm.watch('facility');
  const selectedCategory = workorderForm.watch('category');
  const selectedSourceWorkRequest = workorderForm.watch('source_work_request');
  const selectedSourcePpm = workorderForm.watch('source_ppm');

  // Data fetching hooks
  const { data: categoriesData = { results: [] } } = useCategoriesQuery();
  const { data: subcategoriesData = { results: [] } } = useSubcategoriesQuery();
  const { data: facilitiesData = { results: [] } } = useFacilitiesQuery();
  const { data: departmentsData = { results: [] } } = useDepartmentsQuery();
  const { data: procurementUsers = [] } = useProcurementUsersQuery();
  const { data: approverUsers = { results: [] } } = useApproverUsersQuery();
  const { data: approvedRequests = [] } = useApprovedWorkrequestsQuery();
  const { data: approvedPpms = { results: [] } } = useApprovedPpmsQuery();
  const { data: reviewers = [] } = usePpmReviewersQuery();

  // Facility-dependent data hooks
  const { data: buildingsData = [] } = useBuildingsByFacilityQuery(selectedFacility || undefined);
  const { data: assetsData = [] } = useAssetsByFacilityQuery(selectedFacility || undefined);

  // Filter subcategories based on selected category
  const filteredSubcategories = Array.isArray(subcategoriesData.results) 
    ? subcategoriesData.results.filter(
        (subcat: any) => selectedCategory ? subcat.category === selectedCategory : true
      )
    : [];


  // Fetch workorder data for edit mode
  const { 
    data: workorderData, 
    isLoading: isLoadingWorkorder, 
    isError: isWorkorderError,
    error: workorderError
  } = useWorkorderQuery(isEditMode ? slug : undefined);

  // Mutation hooks
  const createWorkorderMutation = useCreateWorkorder();
  const updateWorkorderMutation = useUpdateWorkorder(slug);

  // Helper functions
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Reset building and asset when facility changes (but not during auto-fill)
  useEffect(() => {
    if (selectedFacility && !isAutoFilling) {
      workorderForm.setValue('building', undefined);
      workorderForm.setValue('asset', undefined);
    }
  }, [selectedFacility, workorderForm, isAutoFilling]);

  // Reset subcategory when category changes (but not during auto-fill)
  useEffect(() => {
    if (selectedCategory && !isAutoFilling) {
      workorderForm.setValue('subcategory', undefined);
    }
  }, [selectedCategory, workorderForm, isAutoFilling]);

  // Auto-fill form when source work request is selected
  useEffect(() => {
    if (selectedSourceWorkRequest && Array.isArray(approvedRequests) && approvedRequests.length > 0) {
      const selectedRequest = approvedRequests.find(
        (request: any) => request.id === selectedSourceWorkRequest
      );
      
      if (selectedRequest) {
        // Set auto-filling flag to prevent dependency resets
        setIsAutoFilling(true);
        
        // Track which fields will be auto-filled
        const fieldsToAutoFill = new Set<string>();
        
        // First, set the parent fields (category and facility)
        if (selectedRequest.category) {
          workorderForm.setValue('category', selectedRequest.category);
          fieldsToAutoFill.add('category');
        }
        if (selectedRequest.facility) {
          workorderForm.setValue('facility', selectedRequest.facility);
          fieldsToAutoFill.add('facility');
        }
        
        // Set other non-dependent fields
        if (selectedRequest.department) {
          workorderForm.setValue('department', selectedRequest.department);
          fieldsToAutoFill.add('department');
        }
        if (selectedRequest.description) {
          workorderForm.setValue('description', selectedRequest.description);
          fieldsToAutoFill.add('description');
        }
        if (selectedRequest.priority) {
          workorderForm.setValue('priority', selectedRequest.priority);
          fieldsToAutoFill.add('priority');
        }
        if (selectedRequest.cost) {
          workorderForm.setValue('cost', selectedRequest.cost);
          fieldsToAutoFill.add('cost');
        }
        if (selectedRequest.currency) {
          workorderForm.setValue('currency', selectedRequest.currency);
          fieldsToAutoFill.add('currency');
        }
        
        if (selectedRequest.approver) {
          workorderForm.setValue('approver', selectedRequest.approver);
          fieldsToAutoFill.add('approver');
        }
        
        // Wait for dependent data to load, then set dependent fields
        setTimeout(() => {
          if (selectedRequest.subcategory) {
            workorderForm.setValue('subcategory', selectedRequest.subcategory);
            fieldsToAutoFill.add('subcategory');
          }
          if (selectedRequest.building) {
            workorderForm.setValue('building', selectedRequest.building);
            fieldsToAutoFill.add('building');
          }
          if (selectedRequest.asset) {
            workorderForm.setValue('asset', selectedRequest.asset);
            fieldsToAutoFill.add('asset');
          }
          
          // Update auto-filled fields state
          setAutoFilledFields(fieldsToAutoFill);
          
          // Clear auto-filling flag after all setValue calls complete
          setTimeout(() => {
            setIsAutoFilling(false);
          }, 150);
        }, 500); // Increased wait time to 500ms for dependent data to be fetched
      }
    } else {
      // Clear auto-filled fields when source is deselected
      setAutoFilledFields(new Set());
    }
  }, [selectedSourceWorkRequest, approvedRequests, workorderForm]);

  // Auto-fill form when source PPM is selected
  useEffect(() => {
    if (selectedSourcePpm && approvedPpms && approvedPpms.results && Array.isArray(approvedPpms.results) && approvedPpms.results.length > 0) {
      const selectedPpm = approvedPpms.results.find(
        (ppm: any) => ppm.id === selectedSourcePpm
      );
      
      if (selectedPpm) {
        // Set auto-filling flag to prevent dependency resets
        setIsAutoFilling(true);
        
        // Track which fields will be auto-filled
        const fieldsToAutoFill = new Set<string>();
        
        // First, set the parent fields (category and facility)
        if (selectedPpm.category) {
          workorderForm.setValue('category', selectedPpm.category);
          fieldsToAutoFill.add('category');
        }
        
        // PPM has facilities array, take the first one if available
        if (selectedPpm.facilities && selectedPpm.facilities.length > 0) {
          workorderForm.setValue('facility', selectedPpm.facilities[0]);
          fieldsToAutoFill.add('facility');
        }
        
        // Set other fields from PPM
        if (selectedPpm.description) {
          workorderForm.setValue('description', selectedPpm.description);
          fieldsToAutoFill.add('description');
        }
        if (selectedPpm.work_order_priority) {
          workorderForm.setValue('priority', selectedPpm.work_order_priority);
          fieldsToAutoFill.add('priority');
        }
        if (selectedPpm.total_amount) {
          workorderForm.setValue('cost', selectedPpm.total_amount);
          fieldsToAutoFill.add('cost');
        }
        if (selectedPpm.currency) {
          workorderForm.setValue('currency', selectedPpm.currency);
          fieldsToAutoFill.add('currency');
        }
        
        // Wait for dependent data to load, then set dependent fields
        setTimeout(() => {
          if (selectedPpm.subcategory) {
            workorderForm.setValue('subcategory', selectedPpm.subcategory);
            fieldsToAutoFill.add('subcategory');
          }
          
          // PPM has buildings array, take the first one if available
          if (selectedPpm.buildings && selectedPpm.buildings.length > 0) {
            workorderForm.setValue('building', selectedPpm.buildings[0]);
            fieldsToAutoFill.add('building');
          }
          
          // PPM has assets array, take the first one if available
          if (selectedPpm.assets && selectedPpm.assets.length > 0) {
            workorderForm.setValue('asset', selectedPpm.assets[0]);
            fieldsToAutoFill.add('asset');
          }
          
          // Update auto-filled fields state
          setAutoFilledFields(fieldsToAutoFill);
          
          // Clear auto-filling flag after all setValue calls complete
          setTimeout(() => {
            setIsAutoFilling(false);
          }, 150);
        }, 500); // Increased wait time to 500ms for dependent data to be fetched
      }
    } else {
      // Clear auto-filled fields when source is deselected
      setAutoFilledFields(new Set());
    }
  }, [selectedSourcePpm, approvedPpms, workorderForm]);



  // Load workorder data for edit mode
  useEffect(() => {
    if (workorderData && isEditMode) {
      // Reset the form with workorder data
      workorderForm.reset({
        type: workorderData.type,
        source_ppm: workorderData.source_ppm,
        source_work_request: workorderData.source_work_request,
        category: workorderData.category,
        subcategory: workorderData.subcategory,
        facility: workorderData.facility,
        building: workorderData.building,
        department: workorderData.department,
        asset: workorderData.asset,
        description: workorderData.description || '',
        expected_start_date: workorderData.expected_start_date || '',
        priority: workorderData.priority,
        cost: workorderData.cost || '',
        currency: workorderData.currency,
        approver: workorderData.approver,
        reviewers: Array.isArray(workorderData.reviewers) ? workorderData.reviewers : []
      });
    }
  }, [workorderData, isEditMode, workorderForm]);

  // Form submission handler
  const onSubmitWorkorder = async (data: WorkorderFormValues) => {
    try {
      // Send all form data to server, but handle source fields appropriately
      let formDataToSend: any = { ...data };

      // Only include the relevant source field based on type, clear the others
      if (data.type === 'FROM-WORK-REQUEST') {
        // Keep source_work_request, remove source_ppm
        delete formDataToSend.source_ppm;
      } else if (data.type === 'FROM-PPM') {
        // Keep source_ppm, remove source_work_request
        delete formDataToSend.source_work_request;
      } else if (data.type === 'RAISE-PAYMENT') {
        // Remove both source fields for raise payment
        delete formDataToSend.source_work_request;
        delete formDataToSend.source_ppm;
      }

      // Create form data for submission
      const formData = new FormData();
      
      // Add all form fields to formData
      Object.entries(formDataToSend).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '' && value !== 0) {
          if (typeof value === 'boolean') {
            formData.append(key, value ? 'true' : 'false');
          } else if (Array.isArray(value)) {
            // Handle arrays by appending each element separately
            value.forEach((item) => {
              formData.append(key, String(item));
            });
          } else {
            formData.append(key, String(value));
          }
        }
      });
      
      // Submit the form
      if (isEditMode && slug) {
        updateWorkorderMutation.mutate(
          { slug, formData },
          { 
            onSuccess: () => {
              toast({
                title: "Success",
                description: "Workorder updated successfully",
                variant: "default",
              });
              navigate('/dashboard/work/orders');
            },
            onError: (error) => {
              console.error('Error updating workorder:', error);
              toast({
                title: "Error",
                description: "Failed to update workorder. Please try again.",
                variant: "destructive",
              });
            }
          }
        );
      } else {
        // Create form data for create operation too
        const createFormData = new FormData();
        
        // Add all form fields to formData
        Object.entries(formDataToSend).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '' && value !== 0) {
            if (typeof value === 'boolean') {
              createFormData.append(key, value ? 'true' : 'false');
            } else if (Array.isArray(value)) {
              // Handle arrays by appending each element separately
              value.forEach((item) => {
                createFormData.append(key, String(item));
              });
            } else {
              createFormData.append(key, String(value));
            }
          }
        });

        createWorkorderMutation.mutate(
          createFormData,
          { 
            onSuccess: () => {
              toast({
                title: "Success",
                description: "Workorder created successfully",
                variant: "default",
              });
              navigate('/dashboard/work/orders');
            },
            onError: (error) => {
              console.error('Error creating workorder:', error);
              toast({
                title: "Error",
                description: "Failed to create workorder. Please try again.",
                variant: "destructive",
              });
            }
          }
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
    navigate('/dashboard/work/orders');
  };

  // Loading state
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

  // Error state
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
          {/* Type Selection Section */}
          <div className="rounded-lg border border-green-200 overflow-hidden bg-white shadow-sm">
            <div className="p-6 bg-green-50 border-b border-green-100">
              <h2 className="text-lg font-semibold text-green-800">Work Order Type</h2>
              <p className="text-sm text-green-600 mt-1">Select the type of work order you want to create</p>
            </div>
            
            <div className="p-6 bg-white">
              <FormField
                control={workorderForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Type<span className="text-red-500 ml-1">*</span></FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 border-green-200 focus:border-green-500 focus:ring-green-500">
                          <SelectValue placeholder="Select work order type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FROM-PPM">From PPM</SelectItem>
                        <SelectItem value="FROM-WORK-REQUEST">From Work Request</SelectItem>
                        <SelectItem value="RAISE-PAYMENT">Raise Payment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Work Order Details Section */}
          <div className="rounded-lg border border-green-200 overflow-hidden bg-white shadow-sm">
            <button
              type="button"
              className="flex justify-between items-center w-full p-6 bg-green-50 border-b border-green-100 text-left hover:bg-green-100 transition-colors"
              onClick={() => toggleSection('conditional')}
            >
              <h2 className="text-lg font-semibold text-green-800">Work Order Details</h2>
              {openSections.conditional ? 
                <ChevronUp className="h-5 w-5 text-green-600" /> : 
                <ChevronDown className="h-5 w-5 text-green-600" />
              }
            </button>
            
            {openSections.conditional && (
              <div className="p-6 space-y-6 bg-white">
                {/* Source Fields Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={workorderForm.control}
                    name="source_work_request"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Source Work Request
                          {selectedType === 'FROM-WORK-REQUEST' && <span className="text-red-500 ml-1">*</span>}
                        </FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                          disabled={selectedType !== 'FROM-WORK-REQUEST'}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
                              <SelectValue placeholder="Select approved work request" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(approvedRequests) && approvedRequests.length > 0 ? (
                              approvedRequests.map((request: any) => (
                                <SelectItem key={request.id} value={String(request.id)}>
                                  #{request.work_request_number} - {request.description?.substring(0, 50)}{request.description && request.description.length > 50 ? '...' : ''}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-approved-requests" disabled>
                                No approved work requests available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={workorderForm.control}
                    name="source_ppm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Source PPM
                          {selectedType === 'FROM-PPM' && <span className="text-red-500 ml-1">*</span>}
                        </FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                          disabled={selectedType !== 'FROM-PPM'}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
                              <SelectValue placeholder="Select approved PPM" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(approvedPpms.results) && approvedPpms.results.length > 0 ? (
                              approvedPpms.results.map((ppm: any) => (
                                <SelectItem key={ppm.id} value={String(ppm.id)}>
                                  {ppm?.category_detail?.code} - {ppm?.category_detail?.title}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-approved-ppms" disabled>
                                No approved PPMs available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Category and Subcategory */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {!autoFilledFields.has('category') && (
                    <FormField
                      control={workorderForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Category</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(Number(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(categoriesData.results) && categoriesData.results.length > 0 ? (
                                categoriesData.results.map((category: any) => (
                                  <SelectItem key={category.id} value={String(category.id)}>
                                    {category.name || category.title}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-categories" disabled>
                                  No categories available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {!autoFilledFields.has('subcategory') && (
                    <FormField
                      control={workorderForm.control}
                      name="subcategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Subcategory</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(Number(value))}
                            value={field.value?.toString()}
                            disabled={!selectedCategory}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
                                <SelectValue placeholder={!selectedCategory ? "Select category first" : "Select subcategory"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(filteredSubcategories) && filteredSubcategories.length > 0 ? (
                                filteredSubcategories.map((subcat: any) => (
                                  <SelectItem key={subcat.id} value={String(subcat.id)}>
                                    {subcat.name || subcat.title}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-subcategories" disabled>
                                  {!selectedCategory ? "Select category first" : "No subcategories available"}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Facility and Building */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {!autoFilledFields.has('facility') && (
                    <FormField
                      control={workorderForm.control}
                      name="facility"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Facility</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(Number(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
                                <SelectValue placeholder="Select facility" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(facilitiesData.results) && facilitiesData.results.length > 0 ? (
                                facilitiesData.results.map((facility: any) => (
                                  <SelectItem key={facility.id} value={String(facility.id)}>
                                    {facility.name}
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
                  )}
                  
                  {!autoFilledFields.has('building') && (
                    <FormField
                      control={workorderForm.control}
                      name="building"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Building</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(Number(value))}
                            value={field.value?.toString()}
                            disabled={!selectedFacility}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
                                <SelectValue placeholder={!selectedFacility ? "Select facility first" : "Select building"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(buildingsData) && buildingsData.length > 0 ? (
                                buildingsData.map((building: any) => (
                                  <SelectItem key={building.id} value={String(building.id)}>
                                    {building.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-buildings" disabled>
                                  {!selectedFacility ? "Select facility first" : "No buildings available"}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Department and Asset */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {!autoFilledFields.has('department') && (
                    <FormField
                      control={workorderForm.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Department</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(Number(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(departmentsData.results) && departmentsData.results.length > 0 ? (
                                departmentsData.results.map((department: any) => (
                                  <SelectItem key={department.id} value={String(department.id)}>
                                    {department.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-departments" disabled>
                                  No departments available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {!autoFilledFields.has('asset') && (
                    <FormField
                      control={workorderForm.control}
                      name="asset"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Asset</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(Number(value))}
                            value={field.value?.toString()}
                            disabled={!selectedFacility}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
                                <SelectValue placeholder={!selectedFacility ? "Select facility first" : "Select asset"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(assetsData) && assetsData.length > 0 ? (
                                assetsData.map((asset: any) => (
                                  <SelectItem key={asset.id} value={String(asset.id)}>
                                    {asset.asset_name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-assets" disabled>
                                  {!selectedFacility ? "Select facility first" : "No assets available"}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Description */}
                {!autoFilledFields.has('description') && (
                  <FormField
                    control={workorderForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter work order description"
                            {...field}
                            className="min-h-[120px] resize-y border-gray-300 focus:border-green-500 focus:ring-green-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Cost and Currency - Always visible */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={workorderForm.control}
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Cost</FormLabel>
                        <FormControl>
                          <Input 
                            type="text"
                            placeholder="1500.00"
                            {...field}
                            disabled={autoFilledFields.has('cost')}
                            className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
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
                        <FormLabel className="text-sm font-medium text-gray-700">Currency</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={autoFilledFields.has('currency')}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="NGN">NGN</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Expected Start Date */}
                <FormField
                  control={workorderForm.control}
                  name="expected_start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Expected Start Date<span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field}
                          className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Priority */}
                {!autoFilledFields.has('priority') && (
                  <FormField
                    control={workorderForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Priority</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
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
                )}

                {/* Reviewers */}
                <FormField
                  control={workorderForm.control}
                  name="reviewers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Reviewers<span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Array.isArray(reviewers) && reviewers.length > 0 ? reviewers.map(reviewer => (
                            <div key={reviewer.id} className="flex items-start space-x-3 p-3 bg-white rounded-md shadow-sm border">
                              <Checkbox 
                                id={`reviewer-${reviewer.id}`}
                                checked={field.value.includes(reviewer.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, reviewer.id]);
                                  } else {
                                    field.onChange(field.value.filter(id => id !== reviewer.id));
                                  }
                                }}
                              />
                              <label 
                                htmlFor={`reviewer-${reviewer.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {reviewer.name}
                                {reviewer.email && <div className="text-xs text-gray-500 mt-1">{reviewer.email}</div>}
                              </label>
                            </div>
                          )) : (
                            <div className="col-span-full text-center py-4 text-gray-500">
                              No reviewers available
                            </div>
                          )}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Approver */}
                {!autoFilledFields.has('approver') && (
                  <FormField
                    control={workorderForm.control}
                    name="approver"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Select Approver<span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
                              <SelectValue placeholder="Select approver" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(approverUsers?.results) && approverUsers?.results?.length > 0 ? (
                              approverUsers?.results?.map((user: any) => (
                                <SelectItem key={user.id} value={String(user.id)}>
                                  {user.name}({user.email})
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-approver-users" disabled>
                                No approver users available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createWorkorderMutation.isPending || updateWorkorderMutation.isPending}
              className="px-6 bg-green-600 hover:bg-green-700"
            >
              {(createWorkorderMutation.isPending || updateWorkorderMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Update Work Order' : 'Create Work Order'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default WorkorderForm;