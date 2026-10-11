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
import { ArrowLeft, Loader2, ChevronDown, ChevronUp, AlertTriangle, X, FileText } from 'lucide-react';
import {
  useWorkrequestQuery,
  useCreateWorkrequest,
  useUpdateWorkrequest,
  useBuildingsByFacilityQuery,
  useZonesByFacilityQuery,
  useSubsystemsByZoneQuery,
  useAssetsBySubsystemQuery,
  useReviewersQuery,
  useApproversQuery,
} from '@/hooks/workrequest/useWorkrequestQueries';
import { useCategoriesQuery } from '@/hooks/category/useCategoryQueries';
import { useVendorsQuery } from '@/hooks/vendor/useVendorQueries';
import { useFacilitiesQuery } from '@/hooks/facility/useFacilityQueries';
import { useDepartmentsQuery } from '@/hooks/department/useDepartmentQueries';
import { toast } from '@/components/ui/use-toast';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const WorkrequestForm = () => {
  const { t } = useTypedTranslation('work');

  const workrequestSchema = z.object({
    type: z.enum(['Work', 'Procument']),
    category: z.number().nullable().refine((val) => val !== null && val > 0, {
      message: t('workRequest.form.validation.categoryRequired'),
    }),
    subcategory: z.number().nullable().refine((val) => val !== null && val > 0, {
      message: t('workRequest.form.validation.subcategoryRequired'),
    }),
    facility: z.number().nullable().refine((val) => val !== null && val > 0, {
      message: t('workRequest.form.validation.facilityRequired'),
    }),
    zone: z.number().nullable().refine((val) => val !== null && val > 0, {
      message: t('workRequest.form.validation.zoneRequired'),
    }),
    building: z.number().nullable().optional(),
    subsystem: z.number().nullable().refine((val) => val !== null && val > 0, {
      message: t('workRequest.form.validation.subsystemRequired'),
    }),
    department: z.number().nullable().optional(),
    asset: z.number().nullable().refine((val) => val !== null && val > 0, {
      message: t('workRequest.form.validation.assetRequired'),
    }),
    description: z.string().min(1, t('workRequest.form.validation.descriptionRequired')),
    require_mobilization_fee: z.boolean(),
    require_quotation: z.boolean(),
    payment_requisition: z.boolean(),
    follow_up_notes: z.string().optional(),
    invoice_no: z.string().optional(),
    vendor: z.number().nullable().optional(),
    // Nobody is routed at creation any more — Procurement & Store claims
    // the request themselves once they price it, and the Requester adds
    // Reviewer + Approver afterward, via this same Edit form, once the
    // request reaches CP Approved. Kept optional here; that later
    // requirement is enforced in onSubmit, where the current
    // approval_status is known.
    request_to: z.array(z.number()).optional().default([]),
    reviewers: z.array(z.number()).optional().default([]),
    approver: z.number().nullable().optional(),
    priority: z.enum(['Low', 'Medium', 'High']),
    cost: z.coerce.number().min(0).optional().default(0),
    currency: z.enum(['USD', 'EUR', 'NGN']),
  });

  type WorkrequestFormValues = z.infer<typeof workrequestSchema>;

  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEditMode = !!slug;

  const vendorInvoiceRef = useRef<HTMLInputElement>(null);
  const [vendorInvoiceFiles, setVendorInvoiceFiles] = useState<File[]>([]);

  const [openSections, setOpenSections] = useState({
    basic: true,
    details: true,
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
      zone: null,
      building: null,
      subsystem: null,
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
  const selectedZone = form.watch('zone');
  const selectedSubsystem = form.watch('subsystem');
  const selectedCategory = form.watch('category');

  const { data: categoriesData = { results: [] } } = useCategoriesQuery();
  const { data: facilitiesData = { results: [] } } = useFacilitiesQuery();
  const { data: departmentsData = { results: [] } } = useDepartmentsQuery();
  const { data: vendorsData = { results: [] } } = useVendorsQuery();
  const { data: reviewers = [] } = useReviewersQuery();
  const { data: approvers = [] } = useApproversQuery();

  const selectedCategoryData = categoriesData.results.find((cat) => cat.id === selectedCategory);
  const availableSubcategories = selectedCategoryData?.subcategories || [];

  const { data: buildingsDataRaw } = useBuildingsByFacilityQuery(selectedFacility || undefined);
  const { data: zonesDataRaw } = useZonesByFacilityQuery(selectedFacility || undefined);
  const { data: subsystemsDataRaw } = useSubsystemsByZoneQuery(selectedZone || undefined);
  const { data: assetsDataRaw } = useAssetsBySubsystemQuery(selectedSubsystem || undefined);

  const buildingsData = buildingsDataRaw
    ? Array.isArray(buildingsDataRaw) ? buildingsDataRaw : (buildingsDataRaw as any)?.results || []
    : [];
  const zonesData = zonesDataRaw
    ? Array.isArray(zonesDataRaw) ? zonesDataRaw : (zonesDataRaw as any)?.results || []
    : [];
  const subsystemsData = subsystemsDataRaw
    ? Array.isArray(subsystemsDataRaw) ? subsystemsDataRaw : (subsystemsDataRaw as any)?.results || []
    : [];
  const assetsData = assetsDataRaw
    ? Array.isArray(assetsDataRaw) ? assetsDataRaw : (assetsDataRaw as any)?.results || []
    : [];

  const { data: workrequestData, isLoading, isError, error } = useWorkrequestQuery(isEditMode ? slug : undefined);

  // Procurement & Store has priced it and there's still no Reviewer/Approver
  // on record — this Edit is the Requester's chance to add them.
  const needsRouting = isEditMode && workrequestData && workrequestData.approval_status !== 'Pending Review';

  // Category and component always come from the chosen asset, so they can
  // never disagree with it (the backend rejects a mismatch). Locked only when
  // creating, and only if the asset actually has that value recorded.
  // In edit mode, the cascading facility → zone → subsystem → asset queries
  // above take a few round trips to resolve, so assetsData can still be
  // empty on first paint even though the request already has an asset —
  // fall back to the asset_detail the record itself carries so this
  // doesn't depend on that chain finishing first.
  const selectedAsset = form.watch('asset');
  const selectedAssetObj =
    assetsData.find((a: any) => a.id === selectedAsset) ||
    (isEditMode && workrequestData?.asset === selectedAsset ? workrequestData?.asset_detail : undefined);
  const categoryLocked = !isEditMode && !!selectedAssetObj?.category;
  const subcategoryLocked = !isEditMode && !!selectedAssetObj?.subcategory;

  // Label by name — categories created by CSV import have no description, so
  // labelling by description showed them as blank options.
  const categoryOptions: { id: number; label: string }[] = categoriesData.results.map((c) => ({
    id: c.id,
    label: c.name || c.description,
  }));
  if (selectedAssetObj?.category && !categoryOptions.some((o) => o.id === selectedAssetObj.category)) {
    categoryOptions.push({
      id: selectedAssetObj.category,
      label: selectedAssetObj.category_detail?.name || String(selectedAssetObj.category),
    });
  }
  // Direct fallback from the request's own category_detail — doesn't depend
  // on the asset chain (selectedAssetObj above) having resolved first.
  if (
    isEditMode && workrequestData?.category && workrequestData.category_detail &&
    !categoryOptions.some((o) => o.id === workrequestData.category)
  ) {
    categoryOptions.push({ id: workrequestData.category, label: workrequestData.category_detail.name });
  }
  const subcategoryOptions: { id: number; label: string }[] = availableSubcategories.map((s) => ({
    id: s.id,
    label: s.name,
  }));
  if (
    selectedAssetObj?.subcategory &&
    selectedAssetObj.category === selectedCategory &&
    !subcategoryOptions.some((o) => o.id === selectedAssetObj.subcategory)
  ) {
    subcategoryOptions.push({
      id: selectedAssetObj.subcategory,
      label: selectedAssetObj.subcategory_detail?.name || String(selectedAssetObj.subcategory),
    });
  }
  if (
    isEditMode && workrequestData?.subcategory && workrequestData.subcategory_detail &&
    !subcategoryOptions.some((o) => o.id === workrequestData.subcategory)
  ) {
    subcategoryOptions.push({ id: workrequestData.subcategory, label: workrequestData.subcategory_detail.title });
  }

  // Same fallback for zone/subsystem/asset themselves — otherwise their own
  // dropdowns show blank in edit mode until each link in that cascading
  // chain has finished loading.
  const zoneOptions: { id: number; label: string }[] = zonesData.map((z: any) => ({ id: z.id, label: z.name }));
  if (
    isEditMode && workrequestData?.zone && workrequestData.zone_detail &&
    !zoneOptions.some((o) => o.id === workrequestData.zone)
  ) {
    zoneOptions.push({ id: workrequestData.zone, label: workrequestData.zone_detail.name });
  }
  const subsystemOptions: { id: number; label: string }[] = subsystemsData.map((s: any) => ({ id: s.id, label: s.name }));
  if (
    isEditMode && workrequestData?.subsystem && workrequestData.subsystem_detail &&
    !subsystemOptions.some((o) => o.id === workrequestData.subsystem)
  ) {
    subsystemOptions.push({ id: workrequestData.subsystem, label: workrequestData.subsystem_detail.name });
  }
  const assetOptions: { id: number; label: string }[] = assetsData.map((a: any) => ({ id: a.id, label: a.asset_name }));
  if (
    isEditMode && workrequestData?.asset && workrequestData.asset_detail &&
    !assetOptions.some((o) => o.id === workrequestData.asset)
  ) {
    assetOptions.push({ id: workrequestData.asset, label: workrequestData.asset_detail.asset_name });
  }

  const createMutation = useCreateWorkrequest();
  const updateMutation = useUpdateWorkrequest(slug);

  const isLocked = isEditMode && workrequestData?.is_locked === true;

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    if (selectedCategory && !isEditMode && !selectedAsset) {
      const current = form.getValues('subcategory');
      if (!availableSubcategories.some((s) => s.id === current)) {
        form.setValue('subcategory', null);
      }
    }
  }, [selectedCategory, availableSubcategories, form, isEditMode, selectedAsset]);

  useEffect(() => {
    if (workrequestData && isEditMode) {
      form.reset({
        type: (workrequestData.type as 'Work' | 'Procument') || 'Work',
        category: workrequestData.category,
        subcategory: workrequestData.subcategory,
        facility: workrequestData.facility,
        zone: workrequestData.zone,
        building: workrequestData.building,
        subsystem: workrequestData.subsystem,
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
    if (selectedFacility && !isEditMode) {
      form.setValue('zone', null);
      form.setValue('building', null);
      form.setValue('subsystem', null);
      form.setValue('asset', null);
    }
  }, [selectedFacility, form, isEditMode]);

  useEffect(() => {
    if (selectedZone && !isEditMode) {
      form.setValue('subsystem', null);
      form.setValue('asset', null);
    }
  }, [selectedZone, form, isEditMode]);

  useEffect(() => {
    if (selectedSubsystem && !isEditMode) {
      form.setValue('asset', null);
    }
  }, [selectedSubsystem, form, isEditMode]);

  const FK_FIELDS = ['category', 'subcategory', 'facility', 'zone', 'building', 'subsystem', 'department', 'asset', 'vendor', 'approver'];

  const buildFormData = (data: WorkrequestFormValues): FormData => {
    const fd = new FormData();
    if (vendorInvoiceFiles.length > 0) {
      fd.append('vendor_invoice', vendorInvoiceFiles[0]);
      vendorInvoiceFiles.slice(1).forEach((f) => fd.append('resources', f));
    }
    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (FK_FIELDS.includes(key) && value === 0) return;
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
    const detailsFields = ['facility', 'zone', 'building', 'subsystem', 'department', 'asset'];
    const invoiceFields = ['vendor', 'invoice_no'];
    const approvalFields = ['payment_requisition', 'approver', 'reviewers', 'request_to'];
    setOpenSections((prev) => ({
      basic: prev.basic || basicFields.some((f) => f in errors),
      details: prev.details || detailsFields.some((f) => f in errors),
      invoice: prev.invoice || invoiceFields.some((f) => f in errors),
      approval: prev.approval || approvalFields.some((f) => f in errors),
      additional: prev.additional,
    }));
    const invalidFields = Object.keys(errors);
    toast({
      title: 'Please fill in all required fields',
      description: invalidFields.length > 0
        ? `Missing or invalid: ${invalidFields.join(', ')}.`
        : 'Some required fields are missing or invalid. Please review the highlighted sections.',
      variant: 'destructive',
    });
  };

  const onSubmit = (data: WorkrequestFormValues) => {
    if (!isEditMode && vendorInvoiceFiles.length === 0) {
      toast({ title: t('workRequest.form.toast.errorTitle'), description: t('workRequest.form.toast.invoiceRequired'), variant: 'destructive' });
      return;
    }

    if (needsRouting) {
      let hasError = false;
      if (data.reviewers.length === 0) {
        form.setError('reviewers', { message: t('workRequest.form.validation.reviewerRequired') });
        hasError = true;
      }
      if (!data.approver) {
        form.setError('approver', { message: t('workRequest.form.validation.approverRequired') });
        hasError = true;
      }
      if (hasError) {
        onInvalid();
        return;
      }
    }

    const formData = buildFormData(data);

    const onError = (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        Object.values(error?.response?.data || {}).flat().join(' ') ||
        t('workRequest.form.toast.submitError');
      toast({ title: t('workRequest.form.toast.errorTitle'), description: String(message), variant: 'destructive' });
    };

    if (isEditMode && slug) {
      updateMutation.mutate(
        { slug, formData },
        {
          onSuccess: () => {
            toast({
              title: 'Work Request Updated',
              description: 'Your changes have been saved and submitted for review.',
            });
            navigate('/dashboard');
          },
          onError,
        },
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
          <p className="text-sm text-muted-foreground">{t('workRequest.form.loadingRequest')}</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isError) {
    return (
      <div className="container mx-auto py-8 flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('workRequest.form.errorLoading')}</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : t('workRequest.form.errorFallback')}
        </p>
        <Button onClick={handleCancel} variant="outline">{t('workRequest.form.backToRequests')}</Button>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="container mx-auto py-8 flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <div className="text-amber-700 text-xl font-semibold">{t('workRequest.form.requestLocked')}</div>
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
          {t('workRequest.form.lockedDescription')}
        </p>
        <Button onClick={() => navigate(`/dashboard/work/requests/${slug}`)} variant="outline">
          {t('workRequest.form.viewRequest')}
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
            {isEditMode ? t('workRequest.form.editTitle') : t('workRequest.form.createNewTitle')}
          </h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">

          {/* Once Procurement & Store has priced this request, the Requester's
              only job here is adding Reviewer + Approver — everything else
              is shown for context but locked. A native <fieldset disabled>
              cascades to every nested input/select/textarea/button without
              having to touch each field individually. */}
          <fieldset disabled={!!needsRouting} className="space-y-6 disabled:opacity-75">

          {/* Location & Asset Details */}
          <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
            <button type="button" className="flex justify-between items-center w-full p-6 bg-green-50 border-b border-green-100 text-left hover:bg-green-100 transition-colors" onClick={() => toggleSection('details')}>
              <h2 className="text-lg font-semibold text-green-800">{t('workRequest.form.sectionLocation')}</h2>
              {openSections.details ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
            </button>
            {(openSections.details || needsRouting) && (
              <div className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="facility" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">{t('workRequest.form.facility')}<span className="text-red-500 ml-1">*</span></FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={t('workRequest.form.selectFacility')} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {facilitiesData.results.map((f) => (
                            <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                          ))}
                          {isEditMode && workrequestData?.facility && workrequestData.facility_detail &&
                            !facilitiesData.results.some((f) => String(f.id) === String(workrequestData.facility)) && (
                            <SelectItem value={String(workrequestData.facility)}>{workrequestData.facility_detail.name}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="zone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">{t('workRequest.form.zone')}<span className="text-red-500 ml-1">*</span></FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedFacility}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={!selectedFacility ? t('workRequest.form.selectFacilityFirst') : t('workRequest.form.selectZone')} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {zoneOptions.map((z) => (
                            <SelectItem key={z.id} value={String(z.id)}>{z.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="subsystem" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">{t('workRequest.form.subsystem')}<span className="text-red-500 ml-1">*</span></FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedZone}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={!selectedZone ? t('workRequest.form.selectZoneFirst') : t('workRequest.form.selectSubsystem')} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {subsystemOptions.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="building" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">{t('workRequest.form.building')}</FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedFacility}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={!selectedFacility ? t('workRequest.form.selectFacilityFirst') : t('workRequest.form.selectBuilding')} /></SelectTrigger></FormControl>
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
                      <FormLabel className="text-sm font-medium text-gray-700">{t('workRequest.form.department')}</FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={t('workRequest.form.selectDepartment')} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {departmentsData.results.map((d) => (
                            <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                          ))}
                          {isEditMode && workrequestData?.department && workrequestData.department_detail &&
                            !departmentsData.results.some((d) => String(d.id) === String(workrequestData.department)) && (
                            <SelectItem value={String(workrequestData.department)}>{workrequestData.department_detail.name}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="asset" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">{t('workRequest.form.asset')}<span className="text-red-500 ml-1">*</span></FormLabel>
                      <Select
                        onValueChange={(v) => {
                          const id = Number(v);
                          field.onChange(id);
                          const picked = assetsData.find((a: any) => a.id === id);
                          if (picked?.category) {
                            form.setValue('category', picked.category, { shouldValidate: true });
                            form.setValue('subcategory', picked.subcategory ?? null, { shouldValidate: true });
                          }
                        }}
                        value={field.value?.toString()}
                        disabled={!selectedSubsystem}
                      >
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={!selectedSubsystem ? t('workRequest.form.selectAssetFirst') : t('workRequest.form.selectAsset')} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {assetOptions.map((a) => (
                            <SelectItem key={a.id} value={String(a.id)}>{a.label}</SelectItem>
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

          {/* Basic Information */}
          <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
            <button type="button" className="flex justify-between items-center w-full p-6 bg-green-50 border-b border-green-100 text-left hover:bg-green-100 transition-colors" onClick={() => toggleSection('basic')}>
              <h2 className="text-lg font-semibold text-green-800">{t('workRequest.form.sectionBasic')}</h2>
              {openSections.basic ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
            </button>
            {(openSections.basic || needsRouting) && (
              <div className="p-6 space-y-6 bg-white">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">{t('workRequest.form.type')}<span className="text-red-500 ml-1">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={t('workRequest.form.selectType')} /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Work">{t('workRequest.types.work')}</SelectItem>
                        <SelectItem value="Procument">{t('workRequest.types.procurement')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">{t('workRequest.form.category')}<span className="text-red-500 ml-1">*</span></FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={categoryLocked}>
                        <FormControl><SelectTrigger className="h-10 text-black"><SelectValue placeholder={t('workRequest.form.selectCategory')} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {categoryOptions.map((o) => (
                            <SelectItem key={o.id} value={String(o.id)}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="subcategory" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">{t('workRequest.form.subcategory')}<span className="text-red-500 ml-1">*</span></FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()} disabled={!selectedCategory || subcategoryLocked}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={!selectedCategory ? t('workRequest.form.selectCategoryFirst') : t('workRequest.form.selectSubcategory')} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {subcategoryOptions.map((o) => (
                            <SelectItem key={o.id} value={String(o.id)}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                {(categoryLocked || subcategoryLocked) && (
                  <p className="text-xs text-gray-500 -mt-3">{t('workRequest.form.categoryAutoFilled')}</p>
                )}

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">{t('workRequest.form.description')}<span className="text-red-500 ml-1">*</span></FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('workRequest.form.descriptionPlaceholder')} {...field} className="min-h-[120px] resize-y" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="priority" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">{t('workRequest.form.priority')}<span className="text-red-500 ml-1">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={t('workRequest.form.selectPriority')} /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Low">{t('workRequest.form.priorityOptions.low')}</SelectItem>
                          <SelectItem value="Medium">{t('workRequest.form.priorityOptions.medium')}</SelectItem>
                          <SelectItem value="High">{t('workRequest.form.priorityOptions.high')}</SelectItem>
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
              <h2 className="text-lg font-semibold text-green-800">{t('workRequest.form.sectionInvoice')}</h2>
              {openSections.invoice ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
            </button>
            {(openSections.invoice || needsRouting) && (
              <div className="p-6 space-y-6 bg-white">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    {t('workRequest.form.vendorInvoice')}{!isEditMode && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <Input
                    ref={vendorInvoiceRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={(e) => {
                      const newFile = e.target.files?.[0];
                      if (newFile) {
                        setVendorInvoiceFiles((prev) => [...prev, newFile]);
                      }
                      if (vendorInvoiceRef.current) vendorInvoiceRef.current.value = '';
                    }}
                    className="h-10"
                  />
                  {isEditMode && workrequestData?.vendor_invoice && (
                    <div className="mt-2">
                      {/\.(png|jpe?g|gif|webp)$/i.test(workrequestData.vendor_invoice) ? (
                        <a href={workrequestData.vendor_invoice} target="_blank" rel="noopener noreferrer" className="block">
                          <img
                            src={workrequestData.vendor_invoice}
                            alt={t('workRequest.form.viewUploadedInvoice')}
                            className="max-h-48 rounded-lg border border-gray-200 object-contain"
                          />
                        </a>
                      ) : (
                        <a
                          href={workrequestData.vendor_invoice}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-green-600 underline"
                        >
                          <FileText className="h-4 w-4" /> {t('workRequest.form.viewUploadedInvoice')}
                        </a>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{t('workRequest.form.replaceInvoice')}</p>
                    </div>
                  )}
                  {!isEditMode && vendorInvoiceFiles.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">{t('workRequest.form.uploadInvoiceHint')}</p>
                  )}

                  {/* Queued files list */}
                  {vendorInvoiceFiles.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {vendorInvoiceFiles.map((file, idx) => (
                        <li key={idx} className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">{file.name}</span>
                            {idx === 0 && (
                              <span className="text-xs bg-green-100 text-green-700 border border-green-200 rounded px-1.5 py-0.5 flex-shrink-0">Primary</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setVendorInvoiceFiles((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="vendor" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">{t('workRequest.form.vendorOnInvoice')}<span className="text-red-500 ml-1">*</span></FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder={t('workRequest.form.selectVendor')} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {vendorsData.results.map((v: any) => (
                            <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                          ))}
                          {isEditMode && workrequestData?.vendor && workrequestData.vendor_detail &&
                            !vendorsData.results.some((v: any) => String(v.id) === String(workrequestData.vendor)) && (
                            <SelectItem value={String(workrequestData.vendor)}>{workrequestData.vendor_detail.name}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="invoice_no" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">{t('workRequest.form.invoiceNumber')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('workRequest.form.invoicePlaceholder')} {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            )}
          </div>

          </fieldset>

          {/* Approval Chain */}
          <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
            <button type="button" className="flex justify-between items-center w-full p-6 bg-green-50 border-b border-green-100 text-left hover:bg-green-100 transition-colors" onClick={() => toggleSection('approval')}>
              <h2 className="text-lg font-semibold text-green-800">{t('workRequest.form.sectionApproval')}</h2>
              {openSections.approval ? <ChevronUp className="h-5 w-5 text-green-600" /> : <ChevronDown className="h-5 w-5 text-green-600" />}
            </button>
            {openSections.approval && (
              <div className="p-6 space-y-6 bg-white">
                {!needsRouting ? (
                  <p className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    {isEditMode
                      ? t('workRequest.form.approvalChainWaitingInfo')
                      : t('workRequest.form.approvalChainInfo')}
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      {t('workRequest.form.approvalChainRoutingInfo')}
                    </p>

                    {/* Reviewer */}
                    <FormField control={form.control} name="reviewers" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          {t('workRequest.form.step2Label')}<span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <div className="border rounded-lg p-4 bg-gray-50">
                          {reviewers.length === 0 ? (
                            <p className="text-sm text-gray-500">{t('workRequest.form.noReviewers')}</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {reviewers.map((reviewer) => (
                                <div key={reviewer.id} className="flex items-start space-x-3 p-3 bg-white rounded-md shadow-sm border">
                                  <Checkbox
                                    id={`reviewer-${reviewer.id}`}
                                    checked={field.value.includes(reviewer.id)}
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

                    {/* Approver */}
                    <FormField control={form.control} name="approver" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          {t('workRequest.form.step3Label')}<span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(Number(v))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder={t('workRequest.form.selectApprover')} />
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
                  </>
                )}
              </div>
            )}
          </div>


          <div className="flex justify-end gap-3 pt-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <Button type="button" variant="outline" onClick={handleCancel} className="px-6">{t('workRequest.form.cancel')}</Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-6 bg-green-600 hover:bg-green-700"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? t('workRequest.form.saveChanges') : t('workRequest.form.submitRequest')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default WorkrequestForm;
