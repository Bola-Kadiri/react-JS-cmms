// src/features/asset/workrequests/WorkrequestForm.tsx
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
import { Workrequest } from '@/types/workrequest';
import { useWorkrequestQuery, useCreateWorkrequest, useUpdateWorkrequest, useAssetsByFacilityQuery, useBuildingsByFacilityQuery, useProcurementUsersQuery } from '@/hooks/workrequest/useWorkrequestQueries';
import { useCategoriesQuery } from '@/hooks/category/useCategoryQueries';
import { useVendorsQuery } from '@/hooks/vendor/useVendorQueries';
import { usePpmReviewersQuery } from '@/hooks/ppm/usePpmQueries';
import { useList } from '@/hooks/crud/useCrudOperations';
import { useFacilitiesQuery } from '@/hooks/facility/useFacilityQueries';
import { useDepartmentsQuery } from '@/hooks/department/useDepartmentQueries';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

// Form schema definition
// const workrequestSchema = z.object({
//   type: z.enum(['Work', 'Procurement']),
//   category: z.number(),
//   subcategory: z.number(),
//   facility: z.number(),
//   building: z.number(),
//   department: z.number(),
//   asset: z.number(),
//   description: z.string(),
//   require_mobilization_fee: z.boolean(),
//   require_quotation: z.boolean(),
//   payment_requisition: z.boolean(),
//   follow_up_notes: z.string(),
//   procurement_officers: z.array(z.number()).default([]),
//   suggested_vendor: z.number(),
//   vendor_description: z.string(),
//   // approver: z.number(),
//   reviewers: z.array(z.number()).default([])
// });

const workrequestSchema = z.object({
  type: z.enum(['Work', 'Procurement']),
  
  // Use .nullable() so the initial state can be null.
  // Use .refine() to ensure the user picks a valid ID (greater than 0).
  category: z.number().nullable().refine((val) => val !== null && val > 0, {
    message: "Please select a category",
  }),
  
  subcategory: z.number().nullable().refine((val) => val !== null && val > 0, {
    message: "Please select a subcategory",
  }),
  
  facility: z.number().nullable().refine((val) => val !== null && val > 0, {
    message: "Please select a facility",
  }),
  
  building: z.number().nullable().refine((val) => val !== null && val > 0, {
    message: "Please select a building",
  }),
  
  department: z.number().nullable().refine((val) => val !== null && val > 0, {
    message: "Please select a department",
  }),
  
  asset: z.number().nullable().refine((val) => val !== null && val > 0, {
    message: "Please select an asset",
  }),

  description: z.string().min(1, "Description is required"),
  require_mobilization_fee: z.boolean(),
  require_quotation: z.boolean(),
  payment_requisition: z.boolean(),
  follow_up_notes: z.string().optional(),
  
  procurement_officers: z.array(z.number()).default([]),
  
  // Optional relational field
  suggested_vendor: z.number().nullable().optional(),
  
  vendor_description: z.string().optional(),
  reviewers: z.array(z.number()).default([])
});
type WorkrequestFormValues = z.infer<typeof workrequestSchema>;

const WorkrequestForm = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEditMode = !!slug;
  
  // Collapsible section states
  const [openSections, setOpenSections] = useState({
    basic: true,
    details: false,
    options: false,
    additional: false
  });
  
  // Workrequest form setup
  const workrequestForm = useForm<WorkrequestFormValues>({
    resolver: zodResolver(workrequestSchema),
    defaultValues: {
      type: 'Work',
      category: null,
      subcategory: null,
      facility: null,
      building: null,
      department: null,
      asset: null,
      description: '',
      require_mobilization_fee: false,
      require_quotation: false,
      payment_requisition: false,
      follow_up_notes: '',
      procurement_officers: [],
      suggested_vendor: null,
      vendor_description: '',
      // approver: 0,
      reviewers: []
    }
  });

  // Watch facility and category changes to fetch related data
  const selectedFacility = workrequestForm.watch('facility');
  const selectedCategory = workrequestForm.watch('category');

  // Data fetching hooks
  const { data: categoriesData = { results: [] } } = useCategoriesQuery();

  // console.log (categoriesData)
  
  const { data: facilitiesData = { results: [] } } = useFacilitiesQuery();
  console.log(facilitiesData)
  const { data: departmentsData = { results: [] } } = useDepartmentsQuery();
  const { data: procurementUsers = [] } = useProcurementUsersQuery();
  const { data: vendorsData = { results: [] } } = useVendorsQuery();
  const { data: reviewers = [] } = usePpmReviewersQuery();

  

  const procurement = procurementUsers.length > 0 
  ? procurementUsers 
  : (reviewers.length > 0 ? reviewers : []); 

const review = reviewers.length > 0 
  ? reviewers
  : (procurementUsers.length > 0 ? procurementUsers : []);

  console.log(review)
  console.log(procurement)
  
  // Fetch approvers (users with APPROVER role)
  const { data: approvers = [] } = useList('approvers', 'accounts/api/users/?role=APPROVER');
  
  // Get subcategories from the selected category
  const selectedCategoryData = categoriesData.results.find(cat => cat.id === selectedCategory);
  const availableSubcategories = selectedCategoryData?.subcategories || [];
  
  // Facility-dependent data hooks
  const { data: buildingsDataRaw } = useBuildingsByFacilityQuery(selectedFacility || undefined);
  const { data: assetsDataRaw } = useAssetsByFacilityQuery(selectedFacility || undefined);
  
  // Handle both array and object with results property
  const buildingsData = buildingsDataRaw ? (Array.isArray(buildingsDataRaw) ? buildingsDataRaw : (buildingsDataRaw as any)?.results || []) : [];
  const assetsData = assetsDataRaw ? (Array.isArray(assetsDataRaw) ? assetsDataRaw : (assetsDataRaw as any)?.results || []) : [];

  // Fetch workrequest data for edit mode
  const { 
    data: workrequestData, 
    isLoading: isLoadingWorkrequest, 
    isError: isWorkrequestError,
    error: workrequestError
  } = useWorkrequestQuery(isEditMode ? slug : undefined);

  // Use our custom mutation hooks
  const createWorkrequestMutation = useCreateWorkrequest();
  const updateWorkrequestMutation = useUpdateWorkrequest(slug);

  // Toggle section visibility
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Reset subcategory when category changes
  useEffect(() => {
    if (selectedCategory) {
      const currentSubcategory = workrequestForm.getValues('subcategory');
      const isValidSubcategory = availableSubcategories.some(subcat => subcat.id === currentSubcategory);
      if (!isValidSubcategory) {
        workrequestForm.setValue('subcategory', 0);
      }
    }
  }, [selectedCategory, availableSubcategories, workrequestForm]);

  // Handle workrequest data loading
  useEffect(() => {
    if (workrequestData && isEditMode) {
      // Reset the form with workrequest data
      workrequestForm.reset({
        type: workrequestData.type,
        category: workrequestData.category,
        subcategory: workrequestData.subcategory,
        facility: workrequestData.facility,
        building: workrequestData.building,
        department: workrequestData.department,
        asset: workrequestData.asset,
        description: workrequestData.description || '',
        require_mobilization_fee: workrequestData.require_mobilization_fee,
        require_quotation: workrequestData.require_quotation,
        payment_requisition: workrequestData.payment_requisition,
        follow_up_notes: workrequestData.follow_up_notes || '',
        procurement_officers: Array.isArray(workrequestData.procurement_officers) ? workrequestData.procurement_officers : [],
        suggested_vendor: workrequestData.suggested_vendor || 0,
        vendor_description: workrequestData.vendor_description || '',
        // approver: workrequestData.approver || 0,
        reviewers: Array.isArray(workrequestData.reviewers) ? workrequestData.reviewers : []
      });
    }
  }, [workrequestData, isEditMode, workrequestForm]);

  // Reset building and asset when facility changes
  useEffect(() => {
    if (selectedFacility) {
      workrequestForm.setValue('building', 0);
      workrequestForm.setValue('asset', 0);
    }
  }, [selectedFacility, workrequestForm]);

  const onSubmitWorkrequest = async (data: WorkrequestFormValues) => {
    try {
      if (isEditMode && slug) {
        updateWorkrequestMutation.mutate(
          { slug, workrequest: data },
          { onSuccess: () => navigate('/dashboard/work/requests') }
        );
      } else {
        createWorkrequestMutation.mutate(
          data as unknown as Omit<Workrequest, 'id'>,
          { onSuccess: () => navigate('/dashboard/work/requests') }
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
    navigate('/dashboard/work/requests');
  };

  if (isEditMode && isLoadingWorkrequest) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading workrequest details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEditMode && isWorkrequestError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-500 text-xl">Error loading workrequest details</div>
          <p className="text-sm text-muted-foreground mb-4">
            {workrequestError instanceof Error ? workrequestError.message : 'An unknown error occurred'}
          </p>
          <Button onClick={handleCancel} variant="outline">
            Back to Workrequests
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
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Workrequest' : 'Create New Workrequest'}
          </h1>
        </div>
      </div>

      <Form {...workrequestForm}>
        <form onSubmit={workrequestForm.handleSubmit(onSubmitWorkrequest)} className="space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
            <button
              type="button"
              className="flex justify-between items-center w-full p-6 bg-green-50 border-b border-green-100 text-left hover:bg-green-100 transition-colors"
              onClick={() => toggleSection('basic')}
            >
              <h2 className="text-lg font-semibold text-green-800">Basic Information</h2>
              {openSections.basic ? 
                <ChevronUp className="h-5 w-5 text-green-600" /> : 
                <ChevronDown className="h-5 w-5 text-green-600" />
              }
            </button>
            
            {openSections.basic && (
              <div className="p-6 space-y-6 bg-white">
                <FormField
                  control={workrequestForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Type<span className="text-red-500 ml-1">*</span></FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Work">Work</SelectItem>
                          <SelectItem value="Procurement">Procurement</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={workrequestForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Category<span className="text-red-500 ml-1">*</span></FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 text-black">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoriesData?.results.map(category => (
                              <SelectItem key={category.id} value={String(category.id)}>
                                {category.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  
                  <FormField
                    control={workrequestForm.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Subcategory<span className="text-red-500 ml-1">*</span></FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                          disabled={!selectedCategory}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder={!selectedCategory ? "Select category first" : "Select subcategory"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableSubcategories.map(subcat => (
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
                
                <FormField
                  control={workrequestForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Description<span className="text-red-500 ml-1">*</span></FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter workrequest description"
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
          
          {/* Location & Asset Details */}
          <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
            <button
              type="button"
              className="flex justify-between items-center w-full p-6 bg-green-50 border-b border-green-100 text-left hover:bg-green-100 transition-colors"
              onClick={() => toggleSection('details')}
            >
              <h2 className="text-lg font-semibold text-green-800">Location & Asset Details</h2>
              {openSections.details ? 
                <ChevronUp className="h-5 w-5 text-green-600" /> : 
                <ChevronDown className="h-5 w-5 text-green-600" />
              }
            </button>
            
            {openSections.details && (
              <div className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={workrequestForm.control}
                    name="facility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Facility<span className="text-red-500 ml-1">*</span></FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select facility" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {facilitiesData.results.map(facility => (
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
                    control={workrequestForm.control}
                    name="building"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Building<span className="text-red-500 ml-1">*</span></FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                          disabled={!selectedFacility}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder={!selectedFacility ? "Select facility first" : "Select building"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {buildingsData.map(building => (
                              <SelectItem key={building.id} value={String(building.id)}>
                                {building.name}
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
                    control={workrequestForm.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Department<span className="text-red-500 ml-1">*</span></FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departmentsData.results.map(department => (
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
                  
                  <FormField
                    control={workrequestForm.control}
                    name="asset"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Asset<span className="text-red-500 ml-1">*</span></FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                          disabled={!selectedFacility}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder={!selectedFacility ? "Select facility first" : "Select asset"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {assetsData.map(asset => (
                              <SelectItem key={asset.id} value={String(asset.id)}>
                                {asset.asset_name}
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
                  control={workrequestForm.control}
                  name="procurement_officers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Request To (Procurement Officers)</FormLabel>
                      <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {procurementUsers.map(user => (
                            <div key={user.id} className="flex items-start space-x-3 p-3 bg-white rounded-md shadow-sm border">
                              <Checkbox 
                                id={`user-${user.id}`}
                                checked={field.value.includes(user.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, user.id]);
                                  } else {
                                    field.onChange(field.value.filter(id => id !== user.id));
                                  }
                                }}
                              />
                              <label 
                                htmlFor={`user-${user.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {user.name}
                                <div className="text-xs text-gray-500 mt-1">{user.email}</div>
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
                
          {/* Options */}
          {/* <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
            <button
              type="button"
              className="flex justify-between items-center w-full p-6 bg-green-50 border-b border-green-100 text-left hover:bg-green-100 transition-colors"
              onClick={() => toggleSection('options')}
            >
              <h2 className="text-lg font-semibold text-green-800">Options</h2>
              {openSections.options ? 
                <ChevronUp className="h-5 w-5 text-green-600" /> : 
                <ChevronDown className="h-5 w-5 text-green-600" />
              }
            </button>
            
            {openSections.options && (
              <div className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={workrequestForm.control}
                    name="require_mobilization_fee"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0 border border-green-200 p-4 rounded-lg bg-green-50">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-medium leading-none text-green-800">Require Mobilization Fee</FormLabel>
                          <p className="text-sm text-green-600">Mark if mobilization fee is required</p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={workrequestForm.control}
                    name="require_quotation"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0 border border-green-200 p-4 rounded-lg bg-green-50">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-medium leading-none text-green-800">Require Quotation</FormLabel>
                          <p className="text-sm text-green-600">Mark if quotation is needed</p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={workrequestForm.control}
                  name="payment_requisition"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0 border border-green-200 p-4 rounded-lg bg-green-50">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="font-medium leading-none text-green-800">Payment Requisition</FormLabel>
                        <p className="text-sm text-green-600">Mark if payment requisition is needed</p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div> */}

          {/* Additional Information */}
          <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
            <button
              type="button"
              className="flex justify-between items-center w-full p-6 bg-green-50 border-b border-green-100 text-left hover:bg-green-100 transition-colors"
              onClick={() => toggleSection('additional')}
            >
              <h2 className="text-lg font-semibold text-green-800">Additional Information</h2>
              {openSections.additional ? 
                <ChevronUp className="h-5 w-5 text-green-600" /> : 
                <ChevronDown className="h-5 w-5 text-green-600" />
              }
            </button>
            
            {openSections.additional && (
              <div className="p-6 space-y-6 bg-white">


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={workrequestForm.control}
                    name="suggested_vendor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Suggested Vendor</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select vendor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vendorsData.results.map(vendor => (
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

                  {/* <FormField
                    control={workrequestForm.control}
                    name="approver"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Approver</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select approver" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {approvers.map(approver => (
                              <SelectItem key={approver.id} value={String(approver.id)}>
                                <div className="flex flex-col">
                                  <span>{approver.first_name} {approver.last_name}</span>
                                  <span className="text-xs text-muted-foreground">{approver.email}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                </div>

                <FormField
                  control={workrequestForm.control}
                  name="vendor_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Vendor Agreement</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter vendor agreement"
                          {...field}
                          className="min-h-[100px] resize-y"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={workrequestForm.control}
                  name="reviewers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Reviewers</FormLabel>
                      <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {reviewers.map(reviewer => (
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
                                <div className="text-xs text-gray-500 mt-1">{reviewer.email}</div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={workrequestForm.control}
                  name="follow_up_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Follow Up Notes</FormLabel>
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
              disabled={createWorkrequestMutation.isPending || updateWorkrequestMutation.isPending}
              className="px-6 bg-green-600 hover:bg-green-700"
            >
              {(createWorkrequestMutation.isPending || updateWorkrequestMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Update Workrequest' : 'Create Workrequest'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default WorkrequestForm;