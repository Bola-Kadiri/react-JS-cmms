import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import {
  useWorkrequestQuery,
  useCreateWorkrequest,
  useUpdateWorkrequest,
  useAssetsByFacilityQuery,
  useBuildingsByFacilityQuery,
  useProcurementUsersQuery,
  useReviewersQuery,
  useApproversQuery,
} from '@/hooks/workrequest/useWorkrequestQueries';
import { useCategoriesQuery } from '@/hooks/category/useCategoryQueries';
import { useVendorsQuery } from '@/hooks/vendor/useVendorQueries';
import { useFacilitiesQuery } from '@/hooks/facility/useFacilityQueries';
import { useDepartmentsQuery } from '@/hooks/department/useDepartmentQueries';
import { toast } from '@/components/ui/use-toast';

const workrequestSchema = z.object({
  type: z.enum(['Work', 'Procument']),
  category: z.number().nullable().optional(),
  subcategory: z.number().nullable().optional(),
  facility: z.number().nullable().refine((val) => val !== null && val > 0, {
    message: 'Please select a facility',
  }),
  building: z.number().nullable().optional(),
  department: z.number().nullable().optional(),
  asset: z.number().nullable().optional(),
  description: z.string().min(1, 'Description is required'),
  require_mobilization_fee: z.boolean(),
  require_quotation: z.boolean(),
  payment_requisition: z.boolean(),
  follow_up_notes: z.string().optional(),
  invoice_no: z.string().optional(),
  vendor: z.number().nullable().optional(),
  request_to: z.array(z.number()).min(1, 'Select at least one Procurement & Store handler'),
  reviewers: z.array(z.number()).min(1, 'Select at least one Reviewer'),
  approver: z.number().nullable().refine((val) => val !== null && val > 0, {
    message: 'Please select an Approver',
  }),
  priority: z.enum(['Low', 'Medium', 'High']),
  cost: z.coerce.number().min(0).optional().default(0),
  currency: z.enum(['USD', 'EUR', 'NGN']),
});

type WorkrequestFormValues = z.infer<typeof workrequestSchema>;

const WorkrequestForm = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEditMode = !!slug;

  const vendorInvoiceRef = useRef<HTMLInputElement>(null);
  const [vendorInvoiceFile, setVendorInvoiceFile] = useState<File | null>(null);

  const [openSections, setOpenSections] = useState({
    basic: true,
    details: false,
    invoice: true,
    approval: true,
    additional: false,
  });

  const form = useForm<WorkrequestFormValues>({
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
      invoice_no: '',
      vendor: null,
      request_to: [],
      approver: null,
      reviewers: [],
      priority: 'Medium',
      cost: 0,
      currency: 'NGN',
    },
  });

  const selectedFacility = form.watch('facility');
  const selectedCategory = form.watch('category');
  const selectedRequestTo = form.watch('request_to');
  const selectedReviewers = form.watch('reviewers');

  const { data: categoriesData = { results: [] } } = useCategoriesQuery();
  const { data: facilitiesData = { results: [] } } = useFacilitiesQuery();
  const { data: departmentsData = { results: [] } } = useDepartmentsQuery();
  const { data: procurementUsers = [] } = useProcurementUsersQuery();
  const { data: vendorsData = { results: [] } } = useVendorsQuery();
  const { data: reviewers = [] } = useReviewersQuery();
  const { data: approvers = [] } = useApproversQuery();

  const selectedCategoryData = categoriesData.results.find((cat) => cat.id === selectedCategory);
  const availableSubcategories = selectedCategoryData?.subcategories || [];

  const { data: buildingsDataRaw } = useBuildingsByFacilityQuery(selectedFacility || undefined);
  const { data: assetsDataRaw } = useAssetsByFacilityQuery(selectedFacility || undefined);

  const buildingsData = buildingsDataRaw
    ? Array.isArray(buildingsDataRaw) ? buildingsDataRaw : (buildingsDataRaw as any)?.results || []
    : [];
  const assetsData = assetsDataRaw
    ? Array.isArray(assetsDataRaw) ? assetsDataRaw : (assetsDataRaw as any)?.results || []
    : [];

  const { data: workrequestData, isLoading, isError, error } = useWorkrequestQuery(isEditMode ? slug : undefined);

  const createMutation = useCreateWorkrequest();
  const updateMutation = useUpdateWorkrequest(slug);

  const isLocked = isEditMode && workrequestData?.is_locked === true;

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    if (selectedCategory) {
      const current = form.getValues('subcategory');
      if (!availableSubcategories.some((s) => s.id === current)) {
        form.setValue('subcategory', 0);
      }
    }
  }, [selectedCategory, availableSubcategories, form]);

  useEffect(() => {
    if (workrequestData && isEditMode) {
      form.reset({
        type: (workrequestData.type as 'Work' | 'Procument') || 'Work',
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
        invoice_no: workrequestData.invoice_no || '',
        vendor: workrequestData.vendor || null,
        request_to: Array.isArray(workrequestData.request_to) ? workrequestData.request_to : [],
        approver: workrequestData.approver || null,
        reviewers: Array.isArray(workrequestData.reviewers) ? workrequestData.reviewers : [],
        priority: (workrequestData.priority as 'Low' | 'Medium' | 'High') || 'Medium',
        cost: workrequestData.cost ? Number(workrequestData.cost) : 0,
        currency: workrequestData.currency || 'NGN',
      });
    }
  }, [workrequestData, isEditMode, form]);

  useEffect(() => {
    if (selectedFacility) {
      form.setValue('building', 0);
      form.setValue('asset', 0);
    }
  }, [selectedFacility, form]);

  const buildFormData = (data: WorkrequestFormValues): FormData => {
    const fd = new FormData();
    if (vendorInvoiceFile) {
      fd.append('vendor_invoice', vendorInvoiceFile);
    }
    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (Array.isArray(value)) {
        value.forEach((v) => fd.append(key, String(v)));
      } else if (value !== '') {
        fd.append(key, String(value));
      }
    });
    return fd;
  };

  const onInvalid = () => {
    const errors = form.formState.errors;
    const basicFields = ['type', 'category', 'subcategory', 'description', 'priority', 'cost', 'currency'];
    const detailsFields = ['facility', 'building', 'department', 'asset'];
    const invoiceFields = ['vendor', 'invoice_no'];
    const approvalFields = ['payment_requisition', 'approver', 'reviewers', 'request_to'];
    setOpenSections((prev) => ({
      basic: prev.basic || basicFields.some((f) => f in errors),
      details: prev.details || detailsFields.some((f) => f in errors),
      invoice: prev.invoice || invoiceFields.some((f) => f in errors),
      approval: prev.approval || approvalFields.some((f) => f in errors),
      additional: prev.additional,
    }));
  };

  const onSubmit = (data: WorkrequestFormValues) => {
    if (!isEditMode && !vendorInvoiceFile) {
      toast({ title: 'Error', description: 'Vendor invoice is required.', variant: 'destructive' });
      return;
    }

    const formData = buildFormData(data);

    const onError = (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        Object.values(error?.response?.data || {}).flat().join(' ') ||
        'There was a problem submitting the form.';
      toast({ title: 'Error', description: String(message), variant: 'destructive' });
    };

    if (isEditMode && slug) {
      updateMutation.mutate(
        { slug, formData },
        { onSuccess: () => navigate(`/dashboard/work/requests/${slug}`), onError },
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => navigate('/dashboard/work/requests'),
        onError,
      });
    }
  };

  const handleCancel = () => navigate('/dashboard/work/requests');

  if (isEditMode && isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading work request...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isError) {
    return (
      <div className="container mx-auto py-8 flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading work request</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleCancel} variant="outline">Back to Work Requests</Button>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="container mx-auto py-8 flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <div className="text-amber-700 text-xl font-semibold">Request is locked</div>
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
          This work request is currently in the approval pipeline and cannot be edited.
          It will become editable only after it is rejected back to you.
        </p>
        <Button onClick={() => navigate(`/dashboard/work/requests/${slug}`)} variant="outline">
          View Request
        </Button>
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
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Work Request' : 'Create New Work Request'}
          </h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">

          {/* Basic Information */}
          <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
            <button type="button" className="flex justify-between items-center w-full p-6 bg-green-50 border-b border-green-100 text-left hover:bg-green-100 transition-colors" onClick={() => toggleSection('basic')}>
              <h2 className="text-lg font-semibold text-green-800">Basic Information</h2>
              {openSections.basic ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
            </button>
            {openSections.basic && (
              <div className="p-6 space-y-6 bg-white">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Type<span className="text-red-500 ml-1">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Procument">Procurement</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Category</FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                        <FormControl><SelectTrigger className="h-10 text-black"><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {categoriesData.results.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.description}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="subcategory" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Subcategory</FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedCategory}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={!selectedCategory ? 'Select category first' : 'Select subcategory'} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {availableSubcategories.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Description<span className="text-red-500 ml-1">*</span></FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter work request description" {...field} className="min-h-[120px] resize-y" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="priority" render={({ field }) => (
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
              </div>
            )}
          </div>

          {/* Location & Asset Details */}
          <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
            <button type="button" className="flex justify-between items-center w-full p-6 bg-green-50 border-b border-green-100 text-left hover:bg-green-100 transition-colors" onClick={() => toggleSection('details')}>
              <h2 className="text-lg font-semibold text-green-800">Location & Asset Details</h2>
              {openSections.details ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
            </button>
            {openSections.details && (
              <div className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="facility" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Facility<span className="text-red-500 ml-1">*</span></FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select facility" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {facilitiesData.results.map((f) => (
                            <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="building" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Building</FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedFacility}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={!selectedFacility ? 'Select facility first' : 'Select building'} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {buildingsData.map((b: any) => (
                            <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="department" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Department</FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select department" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {departmentsData.results.map((d) => (
                            <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="asset" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Asset</FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedFacility}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={!selectedFacility ? 'Select facility first' : 'Select asset'} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {assetsData.map((a: any) => (
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
            <button type="button" className="flex justify-between items-center w-full p-6 bg-green-50 border-b border-green-100 text-left hover:bg-green-100 transition-colors" onClick={() => toggleSection('invoice')}>
              <h2 className="text-lg font-semibold text-green-800">Invoice & Vendor</h2>
              {openSections.invoice ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
            </button>
            {openSections.invoice && (
              <div className="p-6 space-y-6 bg-white">
                {/* Vendor invoice file upload */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Vendor Invoice{!isEditMode && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <Input
                    ref={vendorInvoiceRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={(e) => setVendorInvoiceFile(e.target.files?.[0] || null)}
                    className="h-10"
                  />
                  {isEditMode && workrequestData?.vendor_invoice && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: <a href={workrequestData.vendor_invoice} target="_blank" rel="noopener noreferrer" className="text-green-600 underline">View uploaded invoice</a>. Upload a new file to replace it.
                    </p>
                  )}
                  {!isEditMode && !vendorInvoiceFile && (
                    <p className="text-xs text-gray-500 mt-1">Upload the vendor invoice PDF or image</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="vendor" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Vendor on Invoice<span className="text-red-500 ml-1">*</span></FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select vendor" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {vendorsData.results.map((v: any) => (
                            <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="invoice_no" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Invoice Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. INV-2026-001" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            )}
          </div>

          {/* Approval Chain */}
          <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
            <button type="button" className="flex justify-between items-center w-full p-6 bg-green-50 border-b border-green-100 text-left hover:bg-green-100 transition-colors" onClick={() => toggleSection('approval')}>
              <h2 className="text-lg font-semibold text-green-800">Approval Chain</h2>
              {openSections.approval ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
            </button>
            {openSections.approval && (
              <div className="p-6 space-y-6 bg-white">
                <p className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  Select in order: Procurement & Store first → Reviewer → Approver. All three are required.
                </p>

                {/* Step 1: Procurement & Store */}
                <FormField control={form.control} name="request_to" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Step 1 — Procurement & Store<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      {procurementUsers.length === 0 ? (
                        <p className="text-sm text-gray-500">No Procurement & Store users available</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {procurementUsers.map((user) => (
                            <div key={user.id} className="flex items-start space-x-3 p-3 bg-white rounded-md shadow-sm border">
                              <Checkbox
                                id={`proc-${user.id}`}
                                checked={field.value.includes(user.id)}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked ? [...field.value, user.id] : field.value.filter((id) => id !== user.id));
                                }}
                              />
                              <label htmlFor={`proc-${user.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                {user.name}
                                <div className="text-xs text-gray-500 mt-1">{user.email}</div>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Step 2: Reviewer */}
                <FormField control={form.control} name="reviewers" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={`text-sm font-medium ${selectedRequestTo.length === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                      Step 2 — Reviewer{selectedRequestTo.length > 0 && <span className="text-red-500 ml-1">*</span>}
                    </FormLabel>
                    <div className={`border rounded-lg p-4 ${selectedRequestTo.length === 0 ? 'bg-gray-100 opacity-50' : 'bg-gray-50'}`}>
                      {selectedRequestTo.length === 0 ? (
                        <p className="text-sm text-gray-400">Select Procurement & Store first</p>
                      ) : reviewers.length === 0 ? (
                        <p className="text-sm text-gray-500">No reviewers available</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {reviewers.map((reviewer) => (
                            <div key={reviewer.id} className={`flex items-start space-x-3 p-3 bg-white rounded-md shadow-sm border ${selectedRequestTo.length === 0 ? 'pointer-events-none' : ''}`}>
                              <Checkbox
                                id={`reviewer-${reviewer.id}`}
                                checked={field.value.includes(reviewer.id)}
                                disabled={selectedRequestTo.length === 0}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked ? [...field.value, reviewer.id] : field.value.filter((id) => id !== reviewer.id));
                                }}
                              />
                              <label htmlFor={`reviewer-${reviewer.id}`} className="text-sm font-medium leading-none cursor-pointer">
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

                {/* Step 3: Approver */}
                <FormField control={form.control} name="approver" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={`text-sm font-medium ${selectedReviewers.length === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                      Step 3 — Approver{selectedReviewers.length > 0 && <span className="text-red-500 ml-1">*</span>}
                    </FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={field.value?.toString()}
                      disabled={selectedReviewers.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={selectedReviewers.length === 0 ? 'Select Reviewer first' : 'Select approver'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {approvers.map((approver) => (
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


          <div className="flex justify-end gap-3 pt-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <Button type="button" variant="outline" onClick={handleCancel} className="px-6">Cancel</Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-6 bg-green-600 hover:bg-green-700"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Save Changes' : 'Submit Work Request'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default WorkrequestForm;
