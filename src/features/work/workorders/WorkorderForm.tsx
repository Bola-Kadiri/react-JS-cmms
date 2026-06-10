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
import { useWorkorderQuery, useCreateWorkorder, useUpdateWorkorder, useApproverUsersQuery } from '@/hooks/workorder/useWorkorderQueries';
import { useCategoriesQuery } from '@/hooks/category/useCategoryQueries';
import { useApprovedPpmsQuery } from '@/hooks/ppm/usePpmQueries';
import {
  useReviewersQuery,
  useApprovedWorkrequestsQuery,
  useApproversQuery,
  useAssetsByFacilityQuery,
  useBuildingsByFacilityQuery,
} from '@/hooks/workrequest/useWorkrequestQueries';
import { useFacilitiesQuery } from '@/hooks/facility/useFacilityQueries';
import { useDepartmentsQuery } from '@/hooks/department/useDepartmentQueries';
import { toast } from '@/components/ui/use-toast';

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
  description: z.string().optional().default(''),
  expected_start_date: z.string().min(1, 'Expected start date is required'),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  cost: z.string().optional().default(''),
  currency: z.enum(['USD', 'EUR', 'NGN']).optional(),
  approver: z.number().optional(),
  reviewers: z.array(z.number()).optional().default([]),
  invoice_no: z.string().optional().default(''),
  request_to: z.number().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'FROM-WORK-REQUEST' && !data.source_work_request) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Source work request is required', path: ['source_work_request'] });
  }
  if (data.type === 'FROM-PPM' && !data.source_ppm) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Source PPM is required', path: ['source_ppm'] });
  }
  if (!data.reviewers || data.reviewers.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'At least one reviewer must be selected', path: ['reviewers'] });
  }
  if (!data.approver) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Approver is required — select a reviewer first', path: ['approver'] });
  }
});

type WorkorderFormValues = z.infer<typeof workorderSchema>;

const WorkorderForm = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEditMode = !!slug;

  const [openSections, setOpenSections] = useState({
    conditional: true,
    wrBasic: true,
    wrDetails: false,
    wrInvoice: true,
    wrApproval: true,
  });

  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [selectedWrVendorName, setSelectedWrVendorName] = useState<string | null>(null);
  const [selectedWrInvoiceUrl, setSelectedWrInvoiceUrl] = useState<string | null>(null);
  const [invoiceDocument, setInvoiceDocument] = useState<File | null>(null);

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
      reviewers: [],
      invoice_no: '',
      request_to: undefined,
    },
  });

  const selectedType = workorderForm.watch('type');
  const selectedFacility = workorderForm.watch('facility');
  const selectedCategory = workorderForm.watch('category');
  const selectedSourceWorkRequest = workorderForm.watch('source_work_request');
  const selectedSourcePpm = workorderForm.watch('source_ppm');
  const selectedReviewers = workorderForm.watch('reviewers');

  const { data: categoriesData = { results: [] } } = useCategoriesQuery();
  const { data: facilitiesData = { results: [] } } = useFacilitiesQuery();
  const { data: departmentsData = { results: [] } } = useDepartmentsQuery();
  const { data: approverUsers = { results: [] } } = useApproverUsersQuery();
  const { data: approvers = [] } = useApproversQuery();
  const { data: approvedRequests = [] } = useApprovedWorkrequestsQuery();
  const { data: approvedPpms = { results: [] } } = useApprovedPpmsQuery();
  const { data: reviewers = [] } = useReviewersQuery();


  const { data: buildingsData = [] } = useBuildingsByFacilityQuery(selectedFacility || undefined);
  const { data: assetsData = [] } = useAssetsByFacilityQuery(selectedFacility || undefined);

  const selectedCategoryData = categoriesData.results.find((cat: any) => cat.id === selectedCategory);
  const filteredSubcategories = selectedCategoryData?.subcategories || [];

  const {
    data: workorderData,
    isLoading: isLoadingWorkorder,
    isError: isWorkorderError,
    error: workorderError,
  } = useWorkorderQuery(isEditMode ? slug : undefined);

  const createWorkorderMutation = useCreateWorkorder();
  const updateWorkorderMutation = useUpdateWorkorder(slug);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    if (selectedFacility && !isAutoFilling) {
      workorderForm.setValue('building', undefined);
      workorderForm.setValue('asset', undefined);
    }
  }, [selectedFacility, workorderForm, isAutoFilling]);

  useEffect(() => {
    if (selectedCategory && !isAutoFilling) {
      workorderForm.setValue('subcategory', undefined);
    }
  }, [selectedCategory, workorderForm, isAutoFilling]);

  // Auto-fill from source work request
  useEffect(() => {
    if (selectedSourceWorkRequest && Array.isArray(approvedRequests) && approvedRequests.length > 0) {
      const selectedRequest = approvedRequests.find((r: any) => r.id === selectedSourceWorkRequest);

      if (selectedRequest) {
        setIsAutoFilling(true);
        const fieldsToAutoFill = new Set<string>();

        if (selectedRequest.category) { workorderForm.setValue('category', selectedRequest.category); fieldsToAutoFill.add('category'); }
        if (selectedRequest.facility) { workorderForm.setValue('facility', selectedRequest.facility); fieldsToAutoFill.add('facility'); }
        if (selectedRequest.department) { workorderForm.setValue('department', selectedRequest.department); fieldsToAutoFill.add('department'); }
        if (selectedRequest.description) { workorderForm.setValue('description', selectedRequest.description); fieldsToAutoFill.add('description'); }
        if (selectedRequest.priority) { workorderForm.setValue('priority', selectedRequest.priority); fieldsToAutoFill.add('priority'); }
        if (selectedRequest.approver) { workorderForm.setValue('approver', selectedRequest.approver); fieldsToAutoFill.add('approver'); }
        if (selectedRequest.invoice_no) { workorderForm.setValue('invoice_no', selectedRequest.invoice_no); fieldsToAutoFill.add('invoice_no'); }
        if (selectedRequest.reviewers && selectedRequest.reviewers.length > 0) {
          workorderForm.setValue('reviewers', selectedRequest.reviewers);
          fieldsToAutoFill.add('reviewers');
        }
        if (selectedRequest.po_amount) {
          workorderForm.setValue('cost', String(selectedRequest.po_amount));
          fieldsToAutoFill.add('cost');
        }

        setSelectedWrVendorName(selectedRequest.vendor_detail?.name || null);
        setSelectedWrInvoiceUrl(selectedRequest.vendor_invoice || null);

        setTimeout(() => {
          if (selectedRequest.subcategory) { workorderForm.setValue('subcategory', selectedRequest.subcategory); fieldsToAutoFill.add('subcategory'); }
          if (selectedRequest.building) { workorderForm.setValue('building', selectedRequest.building); fieldsToAutoFill.add('building'); }
          if (selectedRequest.asset) { workorderForm.setValue('asset', selectedRequest.asset); fieldsToAutoFill.add('asset'); }
          setAutoFilledFields(fieldsToAutoFill);
          setTimeout(() => setIsAutoFilling(false), 150);
        }, 500);
      }
    } else {
      setAutoFilledFields(new Set());
      setSelectedWrVendorName(null);
      setSelectedWrInvoiceUrl(null);
    }
  }, [selectedSourceWorkRequest, approvedRequests, workorderForm]);

  // Auto-fill from source PPM
  useEffect(() => {
    if (selectedSourcePpm && approvedPpms?.results && Array.isArray(approvedPpms.results) && approvedPpms.results.length > 0) {
      const selectedPpm = approvedPpms.results.find((ppm: any) => ppm.id === selectedSourcePpm);

      if (selectedPpm) {
        setIsAutoFilling(true);
        const fieldsToAutoFill = new Set<string>();

        if (selectedPpm.category) { workorderForm.setValue('category', selectedPpm.category); fieldsToAutoFill.add('category'); }
        if (selectedPpm.facilities?.length > 0) { workorderForm.setValue('facility', selectedPpm.facilities[0]); fieldsToAutoFill.add('facility'); }
        if (selectedPpm.description) { workorderForm.setValue('description', selectedPpm.description); fieldsToAutoFill.add('description'); }
        if (selectedPpm.currency) { workorderForm.setValue('currency', selectedPpm.currency); fieldsToAutoFill.add('currency'); }

        setTimeout(() => {
          if (selectedPpm.subcategory) { workorderForm.setValue('subcategory', selectedPpm.subcategory); fieldsToAutoFill.add('subcategory'); }
          if (selectedPpm.buildings?.length > 0) { workorderForm.setValue('building', selectedPpm.buildings[0]); fieldsToAutoFill.add('building'); }
          if (selectedPpm.assets?.length > 0) { workorderForm.setValue('asset', selectedPpm.assets[0]); fieldsToAutoFill.add('asset'); }
          setAutoFilledFields(fieldsToAutoFill);
          setTimeout(() => setIsAutoFilling(false), 150);
        }, 500);
      }
    } else {
      setAutoFilledFields(new Set());
    }
  }, [selectedSourcePpm, approvedPpms, workorderForm]);

  useEffect(() => {
    if (workorderData && isEditMode) {
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
        reviewers: Array.isArray(workorderData.reviewers) ? workorderData.reviewers : [],
        invoice_no: workorderData.invoice_no || '',
        request_to: workorderData.request_to || undefined,
      });
    }
  }, [workorderData, isEditMode, workorderForm]);

  const onSubmitWorkorder = async (data: WorkorderFormValues) => {
    try {
      const formDataToSend: any = { ...data };

      if (data.type === 'FROM-WORK-REQUEST') {
        delete formDataToSend.source_ppm;
        delete formDataToSend.request_to;
      } else if (data.type === 'FROM-PPM') {
        delete formDataToSend.source_work_request;
        delete formDataToSend.invoice_no;
        delete formDataToSend.request_to;
      } else {
        // RAISE-PAYMENT — keep invoice_no, drop source fields
        delete formDataToSend.source_work_request;
        delete formDataToSend.source_ppm;
        delete formDataToSend.request_to;
      }

      const buildFd = (obj: any) => {
        const fd = new FormData();
        Object.entries(obj).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            if (typeof value === 'boolean') {
              fd.append(key, value ? 'true' : 'false');
            } else if (Array.isArray(value)) {
              value.forEach((item) => {
                if (item !== null && item !== undefined) {
                  fd.append(key, String(item));
                }
              });
            } else {
              fd.append(key, String(value));
            }
          }
        });
        return fd;
      };

      const formData = buildFd(formDataToSend);

      if (data.type === 'RAISE-PAYMENT' && invoiceDocument) {
        formData.append('resources', invoiceDocument);
      }

      if (isEditMode && slug) {
        updateWorkorderMutation.mutate(
          { slug, formData },
          {
            onSuccess: () => { toast({ title: 'Success', description: 'Workorder updated successfully' }); navigate('/dashboard/work/orders'); },
            onError: () => { toast({ title: 'Error', description: 'Failed to update workorder', variant: 'destructive' }); },
          },
        );
      } else {
        createWorkorderMutation.mutate(
          formData,
          {
            onSuccess: () => { toast({ title: 'Success', description: 'Workorder created successfully' }); navigate('/dashboard/work/orders'); },
            onError: (error: any) => {
              const data = error?.response?.data;
              const FIELD_LABELS: Record<string, string> = {
                source_ppm: 'Source PPM',
                source_work_request: 'Source Work Request',
              };
              const description = data && typeof data === 'object'
                ? Object.entries(data).map(([k, v]) => `${FIELD_LABELS[k] ?? k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
                : 'Failed to create workorder';
              toast({ title: 'Validation Error', description, variant: 'destructive' });
            },
          },
        );
      }
    } catch {
      toast({ title: 'Error', description: 'There was a problem submitting the form', variant: 'destructive' });
    }
  };

  const handleCancel = () => navigate('/dashboard/work/orders');

  if (isEditMode && isLoadingWorkorder) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading workorder details...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isWorkorderError) {
    return (
      <div className="container mx-auto py-8 flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading workorder details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {workorderError instanceof Error ? workorderError.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleCancel} variant="outline">Back to Workorders</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleCancel} aria-label="Go back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Workorder' : 'Create New Workorder'}</h1>
        </div>
      </div>

      <Form {...workorderForm}>
        <form onSubmit={workorderForm.handleSubmit(onSubmitWorkorder)} className="space-y-6">

          {/* Type Selection */}
          <div className="rounded-lg border border-green-200 overflow-hidden bg-white shadow-sm">
            <div className="p-6 bg-green-50 border-b border-green-100">
              <h2 className="text-lg font-semibold text-green-800">Work Order Type</h2>
              <p className="text-sm text-green-600 mt-1">Select the type of work order you want to create</p>
            </div>
            <div className="p-6 bg-white">
              <FormField control={workorderForm.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Type<span className="text-red-500 ml-1">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
              )} />
            </div>
          </div>

          {/* ── FROM-WORK-REQUEST: Work Request–style layout ── */}
          {selectedType === 'FROM-WORK-REQUEST' && (
            <>
              {/* Source Work Request */}
              <div className="rounded-lg border border-green-200 overflow-hidden bg-white shadow-sm">
                <div className="p-6 bg-green-50 border-b border-green-100">
                  <h2 className="text-lg font-semibold text-green-800">Source Work Request</h2>
                  <p className="text-sm text-green-600 mt-1">Select the approved work request to raise this work order from</p>
                </div>
                <div className="p-6 bg-white">
                  <FormField control={workorderForm.control} name="source_work_request" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Source Work Request<span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
                            <SelectValue placeholder="Select approved work request" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(approvedRequests) && approvedRequests.length > 0 ? (
                            approvedRequests.map((r: any) => (
                              <SelectItem key={r.id} value={String(r.id)}>
                                #{r.work_request_number} — {r.description?.substring(0, 50)}{r.description?.length > 50 ? '...' : ''}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-approved-requests" disabled>No approved work requests available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Basic Information */}
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
                <button type="button" className="flex justify-between items-center w-full p-6 bg-green-50 border-b border-green-100 text-left hover:bg-green-100 transition-colors" onClick={() => toggleSection('wrBasic')}>
                  <h2 className="text-lg font-semibold text-green-800">Basic Information</h2>
                  {openSections.wrBasic ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
                </button>
                {openSections.wrBasic && (
                  <div className="p-6 space-y-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={workorderForm.control} name="category" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Category</FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={autoFilledFields.has('category')}>
                            <FormControl><SelectTrigger className="h-10 text-black"><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {categoriesData.results.map((c: any) => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.description || c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={workorderForm.control} name="subcategory" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Subcategory</FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedCategory || autoFilledFields.has('subcategory')}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={!selectedCategory ? 'Select category first' : 'Select subcategory'} /></SelectTrigger></FormControl>
                            <SelectContent>
                              {filteredSubcategories.map((s: any) => (
                                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={workorderForm.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Description<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter work order description" {...field} className="min-h-[120px] resize-y" disabled={autoFilledFields.has('description')} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={workorderForm.control} name="priority" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Priority<span className="text-red-500 ml-1">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={autoFilledFields.has('priority')}>
                          <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}
              </div>

              {/* Location & Asset Details */}
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
                <button type="button" className="flex justify-between items-center w-full p-6 bg-green-50 border-b border-green-100 text-left hover:bg-green-100 transition-colors" onClick={() => toggleSection('wrDetails')}>
                  <h2 className="text-lg font-semibold text-green-800">Location & Asset Details</h2>
                  {openSections.wrDetails ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
                </button>
                {openSections.wrDetails && (
                  <div className="p-6 space-y-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={workorderForm.control} name="facility" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Facility<span className="text-red-500 ml-1">*</span></FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={autoFilledFields.has('facility')}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select facility" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {facilitiesData.results.map((f: any) => (
                                <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={workorderForm.control} name="building" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Building</FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedFacility || autoFilledFields.has('building')}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={!selectedFacility ? 'Select facility first' : 'Select building'} /></SelectTrigger></FormControl>
                            <SelectContent>
                              {(Array.isArray(buildingsData) ? buildingsData : []).map((b: any) => (
                                <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={workorderForm.control} name="department" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Department</FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={autoFilledFields.has('department')}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select department" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {departmentsData.results.map((d: any) => (
                                <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={workorderForm.control} name="asset" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Asset</FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedFacility || autoFilledFields.has('asset')}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={!selectedFacility ? 'Select facility first' : 'Select asset'} /></SelectTrigger></FormControl>
                            <SelectContent>
                              {(Array.isArray(assetsData) ? assetsData : []).map((a: any) => (
                                <SelectItem key={a.id} value={String(a.id)}>{a.asset_name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                )}
              </div>

              {/* Invoice & Vendor */}
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
                <button type="button" className="flex justify-between items-center w-full p-6 bg-green-50 border-b border-green-100 text-left hover:bg-green-100 transition-colors" onClick={() => toggleSection('wrInvoice')}>
                  <h2 className="text-lg font-semibold text-green-800">Invoice & Vendor</h2>
                  {openSections.wrInvoice ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
                </button>
                {openSections.wrInvoice && (
                  <div className="p-6 space-y-6 bg-white">
                    {selectedWrInvoiceUrl && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Vendor Invoice (from Work Request)</label>
                        <a href={selectedWrInvoiceUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 underline text-sm">
                          View uploaded vendor invoice
                        </a>
                      </div>
                    )}

                    {selectedWrVendorName && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Vendor on Invoice</label>
                        <div className="h-10 px-3 flex items-center border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-700">
                          {selectedWrVendorName}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={workorderForm.control} name="invoice_no" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Invoice Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. INV-2026-001" {...field} className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                          Cost (from PO)
                          {autoFilledFields.has('cost') && (
                            <span className="text-xs text-green-600 ml-2 font-normal">Auto-filled from PO amount</span>
                          )}
                        </label>
                        <Input
                          type="text"
                          value={workorderForm.watch('cost') || ''}
                          readOnly
                          className="h-10 bg-gray-50 cursor-not-allowed"
                          placeholder="Select work request to auto-fill"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Expected Start Date */}
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm p-6">
                <FormField control={workorderForm.control} name="expected_start_date" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Expected Start Date<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Approval Chain */}
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
                <button type="button" className="flex justify-between items-center w-full p-6 bg-green-50 border-b border-green-100 text-left hover:bg-green-100 transition-colors" onClick={() => toggleSection('wrApproval')}>
                  <h2 className="text-lg font-semibold text-green-800">Approval Chain</h2>
                  {openSections.wrApproval ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
                </button>
                {openSections.wrApproval && (
                  <div className="p-6 space-y-6 bg-white">
                    <p className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      Approval chain is pre-filled from the Work Request. Select in order: Reviewer → Approver.
                    </p>

                    {/* Step 1: Reviewers */}
                    <FormField control={workorderForm.control} name="reviewers" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Step 1 — Reviewer<span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <div className="border rounded-lg p-4 bg-gray-50">
                          {(Array.isArray(reviewers) && reviewers.length === 0) ? (
                            <p className="text-sm text-gray-500">No reviewers available</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {(reviewers as any[]).map((reviewer: any) => (
                                <div key={reviewer.id} className="flex items-start space-x-3 p-3 bg-white rounded-md shadow-sm border">
                                  <Checkbox
                                    id={`wo-reviewer-${reviewer.id}`}
                                    checked={(field.value || []).includes(reviewer.id)}
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked
                                        ? [...(field.value || []), reviewer.id]
                                        : (field.value || []).filter((id: number) => id !== reviewer.id),
                                      );
                                    }}
                                  />
                                  <label htmlFor={`wo-reviewer-${reviewer.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                    {reviewer.name}
                                    <div className="text-xs text-gray-500 mt-1">{reviewer.email}</div>
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Step 2: Approver */}
                    <FormField control={workorderForm.control} name="approver" render={({ field }) => (
                      <FormItem>
                        <FormLabel className={`text-sm font-medium ${!selectedReviewers?.length ? 'text-gray-400' : 'text-gray-700'}`}>
                          Step 2 — Approver{selectedReviewers?.length > 0 ? <span className="text-red-500 ml-1">*</span> : null}
                        </FormLabel>
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedReviewers?.length}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder={!selectedReviewers?.length ? 'Select a reviewer first' : 'Select approver'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(approvers as any[]).map((approver: any) => (
                              <SelectItem key={approver.id} value={String(approver.id)}>
                                {approver.name} — {approver.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── FROM-PPM: structured layout matching FROM-WORK-REQUEST ── */}
          {selectedType === 'FROM-PPM' && (
            <>
              {/* Source PPM */}
              <div className="rounded-lg border border-green-200 overflow-hidden bg-white shadow-sm">
                <div className="p-6 bg-green-50 border-b border-green-100">
                  <h2 className="text-lg font-semibold text-green-800">Source PPM</h2>
                  <p className="text-sm text-green-600 mt-1">Select the approved PPM to raise this work order from — fields will auto-fill</p>
                </div>
                <div className="p-6 bg-white">
                  <FormField control={workorderForm.control} name="source_ppm" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Source PPM<span className="text-red-500 ml-1">*</span></FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
                            <SelectValue placeholder="Select approved PPM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(approvedPpms.results) && approvedPpms.results.length > 0 ? (
                            approvedPpms.results.map((ppm: any) => (
                              <SelectItem key={ppm.id} value={String(ppm.id)}>
                                #{ppm.id} — {ppm?.category_detail?.name || ppm?.category_detail?.code || 'PPM'}{ppm.description ? ` · ${ppm.description.substring(0, 40)}` : ''}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-approved-ppms" disabled>No approved PPMs available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Basic Information */}
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
                <button type="button" className="flex justify-between items-center w-full p-6 bg-green-50 border-b border-green-100 text-left hover:bg-green-100 transition-colors" onClick={() => toggleSection('wrBasic')}>
                  <h2 className="text-lg font-semibold text-green-800">Basic Information</h2>
                  {openSections.wrBasic ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
                </button>
                {openSections.wrBasic && (
                  <div className="p-6 space-y-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={workorderForm.control} name="category" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Category {autoFilledFields.has('category') && <span className="text-xs text-green-600 font-normal ml-1">Auto-filled from PPM</span>}
                          </FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={autoFilledFields.has('category')}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {categoriesData.results.map((c: any) => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.description || c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={workorderForm.control} name="subcategory" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Subcategory {autoFilledFields.has('subcategory') && <span className="text-xs text-green-600 font-normal ml-1">Auto-filled</span>}
                          </FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedCategory || autoFilledFields.has('subcategory')}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={!selectedCategory ? 'Select category first' : 'Select subcategory'} /></SelectTrigger></FormControl>
                            <SelectContent>
                              {filteredSubcategories.map((s: any) => (
                                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={workorderForm.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Description {autoFilledFields.has('description') && <span className="text-xs text-green-600 font-normal ml-1">Auto-filled from PPM</span>}
                        </FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter work order description" {...field} className="min-h-[120px] resize-y" disabled={autoFilledFields.has('description')} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={workorderForm.control} name="priority" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Priority<span className="text-red-500 ml-1">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}
              </div>

              {/* Location & Asset Details */}
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
                <button type="button" className="flex justify-between items-center w-full p-6 bg-green-50 border-b border-green-100 text-left hover:bg-green-100 transition-colors" onClick={() => toggleSection('wrDetails')}>
                  <h2 className="text-lg font-semibold text-green-800">Location & Asset Details</h2>
                  {openSections.wrDetails ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
                </button>
                {openSections.wrDetails && (
                  <div className="p-6 space-y-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={workorderForm.control} name="facility" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Facility {autoFilledFields.has('facility') && <span className="text-xs text-green-600 font-normal ml-1">Auto-filled</span>}
                          </FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={autoFilledFields.has('facility')}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select facility" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {facilitiesData.results.map((f: any) => (
                                <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={workorderForm.control} name="building" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Building {autoFilledFields.has('building') && <span className="text-xs text-green-600 font-normal ml-1">Auto-filled</span>}
                          </FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedFacility || autoFilledFields.has('building')}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={!selectedFacility ? 'Select facility first' : 'Select building'} /></SelectTrigger></FormControl>
                            <SelectContent>
                              {(Array.isArray(buildingsData) ? buildingsData : []).map((b: any) => (
                                <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={workorderForm.control} name="department" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Department</FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select department" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {departmentsData.results.map((d: any) => (
                                <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={workorderForm.control} name="asset" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Asset {autoFilledFields.has('asset') && <span className="text-xs text-green-600 font-normal ml-1">Auto-filled</span>}
                          </FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedFacility || autoFilledFields.has('asset')}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={!selectedFacility ? 'Select facility first' : 'Select asset'} /></SelectTrigger></FormControl>
                            <SelectContent>
                              {(Array.isArray(assetsData) ? assetsData : []).map((a: any) => (
                                <SelectItem key={a.id} value={String(a.id)}>{a.asset_name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                )}
              </div>

              {/* Cost & Schedule */}
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm p-6 space-y-6">
                <h2 className="text-lg font-semibold text-green-800">Cost & Schedule</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={workorderForm.control} name="cost" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Cost</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g. 150000.00" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={workorderForm.control} name="currency" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Currency {autoFilledFields.has('currency') && <span className="text-xs text-green-600 font-normal ml-1">Auto-filled</span>}
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={autoFilledFields.has('currency')}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select currency" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="NGN">NGN</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={workorderForm.control} name="expected_start_date" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Expected Start Date<span className="text-red-500 ml-1">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Approval Chain */}
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
                <button type="button" className="flex justify-between items-center w-full p-6 bg-green-50 border-b border-green-100 text-left hover:bg-green-100 transition-colors" onClick={() => toggleSection('wrApproval')}>
                  <h2 className="text-lg font-semibold text-green-800">Approval Chain</h2>
                  {openSections.wrApproval ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
                </button>
                {openSections.wrApproval && (
                  <div className="p-6 space-y-6 bg-white">
                    <p className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      Select in order: Reviewer → Approver. Both are required before the work order can be submitted.
                    </p>

                    {/* Step 1: Reviewers */}
                    <FormField control={workorderForm.control} name="reviewers" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Step 1 — Reviewer<span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <div className="border rounded-lg p-4 bg-gray-50">
                          {(Array.isArray(reviewers) && reviewers.length === 0) ? (
                            <p className="text-sm text-gray-500">No reviewers available</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {(reviewers as any[]).map((reviewer: any) => (
                                <div key={reviewer.id} className="flex items-start space-x-3 p-3 bg-white rounded-md shadow-sm border">
                                  <Checkbox
                                    id={`ppm-reviewer-${reviewer.id}`}
                                    checked={(field.value || []).includes(reviewer.id)}
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked
                                        ? [...(field.value || []), reviewer.id]
                                        : (field.value || []).filter((id: number) => id !== reviewer.id));
                                    }}
                                  />
                                  <label htmlFor={`ppm-reviewer-${reviewer.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                    {reviewer.name}
                                    <div className="text-xs text-gray-500 mt-1">{reviewer.email}</div>
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Step 2: Approver */}
                    <FormField control={workorderForm.control} name="approver" render={({ field }) => (
                      <FormItem>
                        <FormLabel className={`text-sm font-medium ${!selectedReviewers?.length ? 'text-gray-400' : 'text-gray-700'}`}>
                          Step 2 — Approver{selectedReviewers?.length > 0 ? <span className="text-red-500 ml-1">*</span> : null}
                        </FormLabel>
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedReviewers?.length}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder={!selectedReviewers?.length ? 'Select a reviewer first' : 'Select approver'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(approvers as any[]).map((approver: any) => (
                              <SelectItem key={approver.id} value={String(approver.id)}>
                                {approver.name} — {approver.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── RAISE-PAYMENT: original Work Order Details layout ── */}
          {selectedType === 'RAISE-PAYMENT' && (
            <div className="rounded-lg border border-green-200 overflow-hidden bg-white shadow-sm">
              <button
                type="button"
                className="flex justify-between items-center w-full p-6 bg-green-50 border-b border-green-100 text-left hover:bg-green-100 transition-colors"
                onClick={() => toggleSection('conditional')}
              >
                <h2 className="text-lg font-semibold text-green-800">Work Order Details</h2>
                {openSections.conditional ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
              </button>
              {openSections.conditional && (
                <div className="p-6 space-y-6 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={workorderForm.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Category</FormLabel>
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                          <FormControl><SelectTrigger className="h-10 border-gray-300"><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {categoriesData.results.map((c: any) => (
                              <SelectItem key={c.id} value={String(c.id)}>{c.name || c.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={workorderForm.control} name="subcategory" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Subcategory</FormLabel>
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedCategory}>
                          <FormControl><SelectTrigger className="h-10 border-gray-300"><SelectValue placeholder={!selectedCategory ? 'Select category first' : 'Select subcategory'} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {filteredSubcategories.map((s: any) => (
                              <SelectItem key={s.id} value={String(s.id)}>{s.name || s.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={workorderForm.control} name="facility" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Facility</FormLabel>
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                          <FormControl><SelectTrigger className="h-10 border-gray-300"><SelectValue placeholder="Select facility" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {facilitiesData.results.map((f: any) => (
                              <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={workorderForm.control} name="building" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Building</FormLabel>
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedFacility}>
                          <FormControl><SelectTrigger className="h-10 border-gray-300"><SelectValue placeholder={!selectedFacility ? 'Select facility first' : 'Select building'} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {(Array.isArray(buildingsData) ? buildingsData : []).map((b: any) => (
                              <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={workorderForm.control} name="department" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Department</FormLabel>
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                          <FormControl><SelectTrigger className="h-10 border-gray-300"><SelectValue placeholder="Select department" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {departmentsData.results.map((d: any) => (
                              <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={workorderForm.control} name="asset" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Asset</FormLabel>
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedFacility}>
                          <FormControl><SelectTrigger className="h-10 border-gray-300"><SelectValue placeholder={!selectedFacility ? 'Select facility first' : 'Select asset'} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {(Array.isArray(assetsData) ? assetsData : []).map((a: any) => (
                              <SelectItem key={a.id} value={String(a.id)}>{a.asset_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={workorderForm.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter work order description" {...field} className="min-h-[120px] resize-y border-gray-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={workorderForm.control} name="cost" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Cost</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="1500.00" {...field} className="h-10 border-gray-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={workorderForm.control} name="currency" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Currency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-10 border-gray-300"><SelectValue placeholder="Select currency" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="NGN">NGN</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={workorderForm.control} name="expected_start_date" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Expected Start Date<span className="text-red-500 ml-1">*</span></FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="h-10 border-gray-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={workorderForm.control} name="priority" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 border-gray-300"><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={workorderForm.control} name="invoice_no" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Invoice No.</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g. INV-2024-001" {...field} className="h-10 border-gray-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">
                      Invoice Document<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => setInvoiceDocument(e.target.files?.[0] ?? null)}
                      className="block w-full text-sm text-gray-600 border border-gray-300 rounded-md cursor-pointer bg-gray-50 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    {invoiceDocument && (
                      <p className="text-xs text-green-700 mt-1">{invoiceDocument.name}</p>
                    )}
                  </div>
                  <FormField control={workorderForm.control} name="reviewers" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Reviewers<span className="text-red-500 ml-1">*</span></FormLabel>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Array.isArray(reviewers) && reviewers.length > 0 ? (reviewers as any[]).map((reviewer: any) => (
                            <div key={reviewer.id} className="flex items-start space-x-3 p-3 bg-white rounded-md shadow-sm border">
                              <Checkbox
                                id={`rp-reviewer-${reviewer.id}`}
                                checked={(field.value || []).includes(reviewer.id)}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked
                                    ? [...(field.value || []), reviewer.id]
                                    : (field.value || []).filter((id: number) => id !== reviewer.id));
                                }}
                              />
                              <label htmlFor={`rp-reviewer-${reviewer.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                {reviewer.name}
                                {reviewer.email && <div className="text-xs text-gray-500 mt-1">{reviewer.email}</div>}
                              </label>
                            </div>
                          )) : (
                            <div className="col-span-full text-center py-4 text-gray-500">No reviewers available</div>
                          )}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={workorderForm.control} name="approver" render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`text-sm font-medium ${!selectedReviewers?.length ? 'text-gray-400' : 'text-gray-700'}`}>
                        Select Approver{selectedReviewers?.length > 0 ? <span className="text-red-500 ml-1">*</span> : null}
                      </FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedReviewers?.length}>
                        <FormControl>
                          <SelectTrigger className="h-10 border-gray-300">
                            <SelectValue placeholder={!selectedReviewers?.length ? 'Select a reviewer first' : 'Select approver'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(approvers as any[]).map((approver: any) => (
                            <SelectItem key={approver.id} value={String(approver.id)}>
                              {approver.name} — {approver.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <Button type="button" variant="outline" onClick={handleCancel} className="px-6">Cancel</Button>
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
