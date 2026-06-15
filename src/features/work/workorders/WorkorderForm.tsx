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
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const WorkorderForm = () => {
  const { t } = useTypedTranslation('work');

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
    expected_start_date: z.string().min(1, t('workOrder.form.validation.expectedStartDateRequired')),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
    cost: z.string().optional().default(''),
    currency: z.enum(['USD', 'EUR', 'NGN']).optional(),
    approver: z.number().optional(),
    reviewers: z.array(z.number()).optional().default([]),
    invoice_no: z.string().optional().default(''),
    request_to: z.number().optional(),
  }).superRefine((data, ctx) => {
    if (data.type === 'FROM-WORK-REQUEST' && !data.source_work_request) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('workOrder.form.validation.sourceWorkRequestRequired'), path: ['source_work_request'] });
    }
    if (data.type === 'FROM-PPM' && !data.source_ppm) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('workOrder.form.validation.sourcePpmRequired'), path: ['source_ppm'] });
    }
    if (!data.reviewers || data.reviewers.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('workOrder.form.validation.reviewerRequired'), path: ['reviewers'] });
    }
    if (!data.approver) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('workOrder.form.validation.approverRequired'), path: ['approver'] });
    }
  });

  type WorkorderFormValues = z.infer<typeof workorderSchema>;

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
  useApproverUsersQuery();
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

      const FK_FIELDS = new Set(['subcategory', 'category', 'facility', 'building', 'department', 'asset', 'approver', 'source_work_request', 'source_ppm', 'request_to']);
      FK_FIELDS.forEach(key => { if (formDataToSend[key] === 0) delete formDataToSend[key]; });

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
            onSuccess: () => {
              toast({ title: t('workOrder.form.toast.successTitle'), description: t('workOrder.form.toast.updateSuccess') });
              navigate('/dashboard/work/orders');
            },
            onError: () => {
              toast({ title: t('workOrder.form.toast.errorTitle'), description: t('workOrder.form.toast.updateError'), variant: 'destructive' });
            },
          },
        );
      } else {
        createWorkorderMutation.mutate(
          formData,
          {
            onSuccess: () => {
              toast({ title: t('workOrder.form.toast.successTitle'), description: t('workOrder.form.toast.createSuccess') });
              navigate('/dashboard/work/orders');
            },
            onError: (error: any) => {
              const data = error?.response?.data;
              const FIELD_LABELS: Record<string, string> = {
                source_ppm: t('workOrder.form.sourcePpmLabel'),
                source_work_request: t('workOrder.form.sourceWrLabel'),
              };
              const description = data && typeof data === 'object'
                ? Object.entries(data).map(([k, v]) => `${FIELD_LABELS[k] ?? k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
                : t('workOrder.form.toast.createFallbackError');
              toast({ title: t('workOrder.form.toast.validationErrorTitle'), description, variant: 'destructive' });
            },
          },
        );
      }
    } catch {
      toast({ title: t('workOrder.form.toast.errorTitle'), description: t('workOrder.form.toast.submitError'), variant: 'destructive' });
    }
  };

  const handleCancel = () => navigate('/dashboard/work/orders');

  if (isEditMode && isLoadingWorkorder) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('workOrder.form.loadingDetails')}</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isWorkorderError) {
    return (
      <div className="container mx-auto py-8 flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('workOrder.form.errorLoading')}</div>
        <p className="text-sm text-muted-foreground mb-4">
          {workorderError instanceof Error ? workorderError.message : t('workOrder.form.errorFallback')}
        </p>
        <Button onClick={handleCancel} variant="outline">{t('workOrder.form.backToWorkorders')}</Button>
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
          <h1 className="text-2xl font-bold">{isEditMode ? t('workOrder.form.editTitle') : t('workOrder.form.createNewTitle')}</h1>
        </div>
      </div>

      <Form {...workorderForm}>
        <form onSubmit={workorderForm.handleSubmit(onSubmitWorkorder)} className="space-y-6">

          {/* Type Selection */}
          <div className="rounded-lg border border-green-200 overflow-hidden bg-white shadow-sm">
            <div className="p-6 bg-green-50 border-b border-green-100">
              <h2 className="text-lg font-semibold text-green-800">{t('workOrder.form.sectionType')}</h2>
              <p className="text-sm text-green-600 mt-1">{t('workOrder.form.sectionTypeHint')}</p>
            </div>
            <div className="p-6 bg-white">
              <FormField control={workorderForm.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.type')}<span className="text-red-500 ml-1">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 border-green-200 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder={t('workOrder.form.typeSelectPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FROM-PPM">{t('workOrder.types.fromPpm')}</SelectItem>
                      <SelectItem value="FROM-WORK-REQUEST">{t('workOrder.types.fromWorkRequest')}</SelectItem>
                      <SelectItem value="RAISE-PAYMENT">{t('workOrder.types.raisePayment')}</SelectItem>
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
                  <h2 className="text-lg font-semibold text-green-800">{t('workOrder.form.sectionSourceWr')}</h2>
                  <p className="text-sm text-green-600 mt-1">{t('workOrder.form.sectionSourceWrHint')}</p>
                </div>
                <div className="p-6 bg-white">
                  <FormField control={workorderForm.control} name="source_work_request" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t('workOrder.form.sourceWrLabel')}<span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
                            <SelectValue placeholder={t('workOrder.form.sourceWrPlaceholder')} />
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
                            <SelectItem value="no-approved-requests" disabled>{t('workOrder.form.noApprovedRequests')}</SelectItem>
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
                  <h2 className="text-lg font-semibold text-green-800">{t('workOrder.form.sectionBasic')}</h2>
                  {openSections.wrBasic ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
                </button>
                {openSections.wrBasic && (
                  <div className="p-6 space-y-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={workorderForm.control} name="category" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.category')}</FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={autoFilledFields.has('category')}>
                            <FormControl><SelectTrigger className="h-10 text-black"><SelectValue placeholder={t('workOrder.form.selectCategory')} /></SelectTrigger></FormControl>
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
                          <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.subcategory')}</FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedCategory || autoFilledFields.has('subcategory')}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={!selectedCategory ? t('workOrder.form.selectCategoryFirst') : t('workOrder.form.selectSubcategory')} /></SelectTrigger></FormControl>
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
                        <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.description')}<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('workOrder.form.descriptionPlaceholder')} {...field} className="min-h-[120px] resize-y" disabled={autoFilledFields.has('description')} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={workorderForm.control} name="priority" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.priority')}<span className="text-red-500 ml-1">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={autoFilledFields.has('priority')}>
                          <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={t('workOrder.form.selectPriority')} /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Low">{t('workOrder.priority.low')}</SelectItem>
                            <SelectItem value="Medium">{t('workOrder.priority.medium')}</SelectItem>
                            <SelectItem value="High">{t('workOrder.priority.high')}</SelectItem>
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
                  <h2 className="text-lg font-semibold text-green-800">{t('workOrder.form.sectionLocation')}</h2>
                  {openSections.wrDetails ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
                </button>
                {openSections.wrDetails && (
                  <div className="p-6 space-y-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={workorderForm.control} name="facility" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.facility')}<span className="text-red-500 ml-1">*</span></FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={autoFilledFields.has('facility')}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={t('workOrder.form.selectFacility')} /></SelectTrigger></FormControl>
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
                          <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.building')}</FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedFacility || autoFilledFields.has('building')}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={!selectedFacility ? t('workOrder.form.selectFacilityFirst') : t('workOrder.form.selectBuilding')} /></SelectTrigger></FormControl>
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
                          <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.department')}</FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={autoFilledFields.has('department')}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={t('workOrder.form.selectDepartment')} /></SelectTrigger></FormControl>
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
                          <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.asset')}</FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedFacility || autoFilledFields.has('asset')}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={!selectedFacility ? t('workOrder.form.selectFacilityFirst') : t('workOrder.form.selectAsset')} /></SelectTrigger></FormControl>
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
                  <h2 className="text-lg font-semibold text-green-800">{t('workOrder.form.sectionInvoice')}</h2>
                  {openSections.wrInvoice ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
                </button>
                {openSections.wrInvoice && (
                  <div className="p-6 space-y-6 bg-white">
                    {selectedWrInvoiceUrl && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">{t('workOrder.form.vendorInvoiceFromWr')}</label>
                        <a href={selectedWrInvoiceUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 underline text-sm">
                          {t('workOrder.form.viewUploadedVendorInvoice')}
                        </a>
                      </div>
                    )}

                    {selectedWrVendorName && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">{t('workOrder.form.vendorOnInvoice')}</label>
                        <div className="h-10 px-3 flex items-center border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-700">
                          {selectedWrVendorName}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={workorderForm.control} name="invoice_no" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.invoiceNumber')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('workOrder.form.invoiceNoPlaceholder')} {...field} className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                          {t('workOrder.form.costFromPo')}
                          {autoFilledFields.has('cost') && (
                            <span className="text-xs text-green-600 ml-2 font-normal">{t('workOrder.form.autoFilledFromPoAmount')}</span>
                          )}
                        </label>
                        <Input
                          type="text"
                          value={workorderForm.watch('cost') || ''}
                          readOnly
                          className="h-10 bg-gray-50 cursor-not-allowed"
                          placeholder={t('workOrder.form.costAutoFillPlaceholder')}
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
                      {t('workOrder.form.expectedStartDate')}<span className="text-red-500 ml-1">*</span>
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
                  <h2 className="text-lg font-semibold text-green-800">{t('workOrder.form.sectionApproval')}</h2>
                  {openSections.wrApproval ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
                </button>
                {openSections.wrApproval && (
                  <div className="p-6 space-y-6 bg-white">
                    <p className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      {t('workOrder.form.approvalChainHintWr')}
                    </p>

                    {/* Step 1: Reviewers */}
                    <FormField control={workorderForm.control} name="reviewers" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          {t('workOrder.form.step1Reviewer')}<span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <div className="border rounded-lg p-4 bg-gray-50">
                          {(Array.isArray(reviewers) && reviewers.length === 0) ? (
                            <p className="text-sm text-gray-500">{t('workOrder.form.noReviewers')}</p>
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
                          {t('workOrder.form.step2Approver')}{selectedReviewers?.length > 0 ? <span className="text-red-500 ml-1">*</span> : null}
                        </FormLabel>
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedReviewers?.length}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder={!selectedReviewers?.length ? t('workOrder.form.selectReviewerFirst') : t('workOrder.form.selectApprover')} />
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
                  <h2 className="text-lg font-semibold text-green-800">{t('workOrder.form.sectionSourcePpm')}</h2>
                  <p className="text-sm text-green-600 mt-1">{t('workOrder.form.sectionSourcePpmHint')}</p>
                </div>
                <div className="p-6 bg-white">
                  <FormField control={workorderForm.control} name="source_ppm" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.sourcePpmLabel')}<span className="text-red-500 ml-1">*</span></FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
                            <SelectValue placeholder={t('workOrder.form.sourcePpmPlaceholder')} />
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
                            <SelectItem value="no-approved-ppms" disabled>{t('workOrder.form.noApprovedPpms')}</SelectItem>
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
                  <h2 className="text-lg font-semibold text-green-800">{t('workOrder.form.sectionBasic')}</h2>
                  {openSections.wrBasic ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
                </button>
                {openSections.wrBasic && (
                  <div className="p-6 space-y-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={workorderForm.control} name="category" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            {t('workOrder.form.category')} {autoFilledFields.has('category') && <span className="text-xs text-green-600 font-normal ml-1">{t('workOrder.form.autoFilledFromPpm')}</span>}
                          </FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={autoFilledFields.has('category')}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={t('workOrder.form.selectCategory')} /></SelectTrigger></FormControl>
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
                            {t('workOrder.form.subcategory')} {autoFilledFields.has('subcategory') && <span className="text-xs text-green-600 font-normal ml-1">{t('workOrder.form.autoFilled')}</span>}
                          </FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedCategory || autoFilledFields.has('subcategory')}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={!selectedCategory ? t('workOrder.form.selectCategoryFirst') : t('workOrder.form.selectSubcategory')} /></SelectTrigger></FormControl>
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
                          {t('workOrder.form.description')} {autoFilledFields.has('description') && <span className="text-xs text-green-600 font-normal ml-1">{t('workOrder.form.autoFilledFromPpm')}</span>}
                        </FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('workOrder.form.descriptionPlaceholder')} {...field} className="min-h-[120px] resize-y" disabled={autoFilledFields.has('description')} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={workorderForm.control} name="priority" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.priority')}<span className="text-red-500 ml-1">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={t('workOrder.form.selectPriority')} /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Low">{t('workOrder.priority.low')}</SelectItem>
                            <SelectItem value="Medium">{t('workOrder.priority.medium')}</SelectItem>
                            <SelectItem value="High">{t('workOrder.priority.high')}</SelectItem>
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
                  <h2 className="text-lg font-semibold text-green-800">{t('workOrder.form.sectionLocation')}</h2>
                  {openSections.wrDetails ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
                </button>
                {openSections.wrDetails && (
                  <div className="p-6 space-y-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={workorderForm.control} name="facility" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            {t('workOrder.form.facility')} {autoFilledFields.has('facility') && <span className="text-xs text-green-600 font-normal ml-1">{t('workOrder.form.autoFilled')}</span>}
                          </FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={autoFilledFields.has('facility')}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={t('workOrder.form.selectFacility')} /></SelectTrigger></FormControl>
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
                            {t('workOrder.form.building')} {autoFilledFields.has('building') && <span className="text-xs text-green-600 font-normal ml-1">{t('workOrder.form.autoFilled')}</span>}
                          </FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedFacility || autoFilledFields.has('building')}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={!selectedFacility ? t('workOrder.form.selectFacilityFirst') : t('workOrder.form.selectBuilding')} /></SelectTrigger></FormControl>
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
                          <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.department')}</FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={t('workOrder.form.selectDepartment')} /></SelectTrigger></FormControl>
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
                            {t('workOrder.form.asset')} {autoFilledFields.has('asset') && <span className="text-xs text-green-600 font-normal ml-1">{t('workOrder.form.autoFilled')}</span>}
                          </FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedFacility || autoFilledFields.has('asset')}>
                            <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={!selectedFacility ? t('workOrder.form.selectFacilityFirst') : t('workOrder.form.selectAsset')} /></SelectTrigger></FormControl>
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
                <h2 className="text-lg font-semibold text-green-800">{t('workOrder.form.sectionCostSchedule')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={workorderForm.control} name="cost" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.cost')}</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder={t('workOrder.form.costPlaceholder')} {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={workorderForm.control} name="currency" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {t('workOrder.form.currency')} {autoFilledFields.has('currency') && <span className="text-xs text-green-600 font-normal ml-1">{t('workOrder.form.autoFilled')}</span>}
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={autoFilledFields.has('currency')}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={t('workOrder.form.selectCurrency')} /></SelectTrigger></FormControl>
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
                    <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.expectedStartDate')}<span className="text-red-500 ml-1">*</span></FormLabel>
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
                  <h2 className="text-lg font-semibold text-green-800">{t('workOrder.form.sectionApproval')}</h2>
                  {openSections.wrApproval ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
                </button>
                {openSections.wrApproval && (
                  <div className="p-6 space-y-6 bg-white">
                    <p className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      {t('workOrder.form.approvalChainHintPpm')}
                    </p>

                    {/* Step 1: Reviewers */}
                    <FormField control={workorderForm.control} name="reviewers" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          {t('workOrder.form.step1Reviewer')}<span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <div className="border rounded-lg p-4 bg-gray-50">
                          {(Array.isArray(reviewers) && reviewers.length === 0) ? (
                            <p className="text-sm text-gray-500">{t('workOrder.form.noReviewers')}</p>
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
                          {t('workOrder.form.step2Approver')}{selectedReviewers?.length > 0 ? <span className="text-red-500 ml-1">*</span> : null}
                        </FormLabel>
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedReviewers?.length}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder={!selectedReviewers?.length ? t('workOrder.form.selectReviewerFirst') : t('workOrder.form.selectApprover')} />
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
                <h2 className="text-lg font-semibold text-green-800">{t('workOrder.form.sectionWorkOrderDetails')}</h2>
                {openSections.conditional ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
              </button>
              {openSections.conditional && (
                <div className="p-6 space-y-6 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={workorderForm.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.category')}</FormLabel>
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                          <FormControl><SelectTrigger className="h-10 border-gray-300"><SelectValue placeholder={t('workOrder.form.selectCategory')} /></SelectTrigger></FormControl>
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
                        <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.subcategory')}</FormLabel>
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedCategory}>
                          <FormControl><SelectTrigger className="h-10 border-gray-300"><SelectValue placeholder={!selectedCategory ? t('workOrder.form.selectCategoryFirst') : t('workOrder.form.selectSubcategory')} /></SelectTrigger></FormControl>
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
                        <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.facility')}</FormLabel>
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                          <FormControl><SelectTrigger className="h-10 border-gray-300"><SelectValue placeholder={t('workOrder.form.selectFacility')} /></SelectTrigger></FormControl>
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
                        <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.building')}</FormLabel>
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedFacility}>
                          <FormControl><SelectTrigger className="h-10 border-gray-300"><SelectValue placeholder={!selectedFacility ? t('workOrder.form.selectFacilityFirst') : t('workOrder.form.selectBuilding')} /></SelectTrigger></FormControl>
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
                        <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.department')}</FormLabel>
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                          <FormControl><SelectTrigger className="h-10 border-gray-300"><SelectValue placeholder={t('workOrder.form.selectDepartment')} /></SelectTrigger></FormControl>
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
                        <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.asset')}</FormLabel>
                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedFacility}>
                          <FormControl><SelectTrigger className="h-10 border-gray-300"><SelectValue placeholder={!selectedFacility ? t('workOrder.form.selectFacilityFirst') : t('workOrder.form.selectAsset')} /></SelectTrigger></FormControl>
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
                      <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.description')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('workOrder.form.descriptionPlaceholder')} {...field} className="min-h-[120px] resize-y border-gray-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={workorderForm.control} name="cost" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.cost')}</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={t('workOrder.form.costPlaceholder')} {...field} className="h-10 border-gray-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={workorderForm.control} name="currency" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.currency')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-10 border-gray-300"><SelectValue placeholder={t('workOrder.form.selectCurrency')} /></SelectTrigger></FormControl>
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
                      <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.expectedStartDate')}<span className="text-red-500 ml-1">*</span></FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="h-10 border-gray-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={workorderForm.control} name="priority" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.priority')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10 border-gray-300"><SelectValue placeholder={t('workOrder.form.selectPriority')} /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Low">{t('workOrder.priority.low')}</SelectItem>
                          <SelectItem value="Medium">{t('workOrder.priority.medium')}</SelectItem>
                          <SelectItem value="High">{t('workOrder.priority.high')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={workorderForm.control} name="invoice_no" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.invoiceNoLabel')}</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder={t('workOrder.form.invoiceNoPlaceholder')} {...field} className="h-10 border-gray-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">
                      {t('workOrder.form.invoiceDocument')}<span className="text-red-500 ml-1">*</span>
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
                      <FormLabel className="text-sm font-medium text-gray-700">{t('workOrder.form.reviewers')}<span className="text-red-500 ml-1">*</span></FormLabel>
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
                            <div className="col-span-full text-center py-4 text-gray-500">{t('workOrder.form.noReviewers')}</div>
                          )}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={workorderForm.control} name="approver" render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`text-sm font-medium ${!selectedReviewers?.length ? 'text-gray-400' : 'text-gray-700'}`}>
                        {t('workOrder.form.selectApproverLabel')}{selectedReviewers?.length > 0 ? <span className="text-red-500 ml-1">*</span> : null}
                      </FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedReviewers?.length}>
                        <FormControl>
                          <SelectTrigger className="h-10 border-gray-300">
                            <SelectValue placeholder={!selectedReviewers?.length ? t('workOrder.form.selectReviewerFirst') : t('workOrder.form.selectApprover')} />
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
            <Button type="button" variant="outline" onClick={handleCancel} className="px-6">{t('workOrder.form.cancel')}</Button>
            <Button
              type="submit"
              disabled={createWorkorderMutation.isPending || updateWorkorderMutation.isPending}
              className="px-6 bg-green-600 hover:bg-green-700"
            >
              {(createWorkorderMutation.isPending || updateWorkorderMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? t('workOrder.form.update') : t('workOrder.form.createNew')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default WorkorderForm;
