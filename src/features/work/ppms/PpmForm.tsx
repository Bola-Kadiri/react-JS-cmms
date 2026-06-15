// src/features/asset/ppms/PpmForm.tsx
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Loader2, Plus, Trash2, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Asset } from '@/types/asset';
import { Facility } from '@/types/facility';
import { Building } from '@/types/building';
import { usePpmQuery, useCreatePpm, useUpdatePpm, usePpmApproversQuery } from '@/hooks/ppm/usePpmQueries';
import { useList } from '@/hooks/crud/useCrudOperations';
import { useCategoriesQuery } from '@/hooks/category/useCategoryQueries';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const assetEndpoint = 'asset_inventory/api/assets/'
const facilityEndpoint = 'facility/api/api/facilities/'
const buildingEndpoint = 'facility/api/api/buildings/'

const PpmForm = () => {
  const { t } = useTypedTranslation('work');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [sectionOpen, setSectionOpen] = useState(true);

  // Schema defined inside component so validation messages use translated strings
  const ppmSchema = z.object({
    status: z.enum(['Active', 'Inactive']),
    description: z.string().min(1, t('ppm.form.validation.descriptionRequired')),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    frequency: z.number().positive(),
    frequency_unit: z.enum(['Hours', 'Days', 'Weeks', 'Months']),
    notify_before_due: z.number().positive().optional(),
    notify_unit: z.enum(['Hours', 'Days', 'Weeks', 'Months']),
    send_reminder_every: z.number().positive().optional(),
    reminder_unit: z.enum(['Hours', 'Days', 'Weeks', 'Months']),
    currency: z.enum(['NGN', 'USD', 'EUR']),
    auto_create_work_order: z.boolean(),
    create_work_order_as_approved: z.boolean(),
    activities_safety_tips: z.string(),
    approver: z.number().positive().optional(),
    category: z.number().positive(t('ppm.form.validation.categoryRequired')),
    subcategory: z.number().positive().optional(),
    assets: z.array(z.string()),
    facilities: z.array(z.string()),
    buildings: z.array(z.string()),
    items: z.array(z.object({
      description: z.string().min(1, t('ppm.form.validation.descriptionRequired')),
      qty: z.number().positive(t('ppm.form.validation.quantityPositive')),
      unit_price: z.string().min(1, t('ppm.form.validation.unitPriceRequired')),
      unit: z.string().min(1, t('ppm.form.validation.unitRequired'))
    }))
  });

  type PpmFormValues = z.infer<typeof ppmSchema>;

  // Ppm form setup
  const ppmForm = useForm<PpmFormValues>({
    resolver: zodResolver(ppmSchema),
    defaultValues: {
      status: 'Active',
      description: '',
      start_date: '',
      end_date: '',
      frequency: 1,
      frequency_unit: 'Days',
      notify_before_due: undefined,
      notify_unit: 'Days',
      send_reminder_every: undefined,
      reminder_unit: 'Days',
      currency: 'NGN',
      auto_create_work_order: false,
      create_work_order_as_approved: false,
      activities_safety_tips: '',
      approver: undefined as unknown as number,
      category: undefined as unknown as number,
      subcategory: undefined as unknown as number,
      assets: [],
      facilities: [],
      buildings: [],
      items: []
    }
  });

  const { data: categoriesResponse } = useCategoriesQuery();
  const categories = categoriesResponse?.results || [];
  const { data: assets = [] } = useList<Asset>('assets', assetEndpoint);
  const { data: facilities = [] } = useList<Facility>('facilities', facilityEndpoint);
  const { data: buildings = [] } = useList<Building>('buildings', buildingEndpoint);
  const { data: approvers = [] } = usePpmApproversQuery();

  // Watch the selected category to filter subcategories
  const selectedCategory = ppmForm.watch('category');

  // Get subcategories from the selected category
  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
  const availableSubcategories = selectedCategoryData?.subcategories || [];

  // Reset subcategory when category changes
  useEffect(() => {
    if (selectedCategory) {
      const currentSubcategory = ppmForm.getValues('subcategory');
      const isValidSubcategory = availableSubcategories.some(subcat => subcat.id === currentSubcategory);
      if (!isValidSubcategory) {
        ppmForm.setValue('subcategory', undefined as unknown as number);
      }
    }
  }, [selectedCategory, availableSubcategories, ppmForm]);

  // Fetch ppm data for edit mode using our custom hook
  const {
    data: ppmData,
    isLoading: isLoadingPpm,
    isError: isPpmError,
    error: ppmError
  } = usePpmQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createPpmMutation = useCreatePpm();
  const updatePpmMutation = useUpdatePpm(id);

  // Handle ppm data loading
  useEffect(() => {
    if (ppmData && isEditMode) {
      ppmForm.reset({
        status: ppmData.status,
        description: ppmData.description,
        frequency: ppmData.frequency,
        frequency_unit: ppmData.frequency_unit,
        notify_before_due: ppmData.notify_before_due ?? undefined,
        notify_unit: ppmData.notify_unit,
        send_reminder_every: ppmData.send_reminder_every ?? undefined,
        reminder_unit: ppmData.reminder_unit,
        currency: ppmData.currency,
        auto_create_work_order: ppmData.auto_create_work_order,
        create_work_order_as_approved: ppmData.create_work_order_as_approved,
        activities_safety_tips: ppmData.activities_safety_tips,
        approver: ppmData.approver ?? undefined,
        category: ppmData.category,
        subcategory: ppmData.subcategory ?? undefined,
        assets: ppmData.assets.map(String),
        facilities: ppmData.facilities.map(String),
        buildings: (ppmData.buildings || []).map(String),
        items: ppmData.items_detail?.map(item => ({
          description: item.description,
          qty: item.qty,
          unit_price: item.unit_price,
          unit: item.unit
        })) || []
      });
    }
  }, [ppmData, isEditMode, ppmForm]);

  const onSubmitPpm = (data: PpmFormValues) => {
    const { start_date, end_date, buildings, items, notify_before_due, send_reminder_every, approver, ...rest } = data;
    const payload: Record<string, any> = {
      ...rest,
      assets: data.assets.map(Number),
      facilities: data.facilities.map(Number),
      buildings: data.buildings.map(Number),
      approver: approver ?? null,
    };
    if (notify_before_due !== undefined) payload.notify_before_due = notify_before_due;
    if (send_reminder_every !== undefined) payload.send_reminder_every = send_reminder_every;
    if (isEditMode && id) {
      updatePpmMutation.mutate(
        { id, ppm: payload as any },
        { onSuccess: () => navigate('/dashboard/calendar/ppms') }
      );
    } else {
      createPpmMutation.mutate(
        payload as any,
        { onSuccess: () => navigate('/dashboard/calendar/ppms') }
      );
    }
  };

  const onInvalidPpm = (errors: Record<string, any>) => {
    setSectionOpen(true);
    const failingFields = Object.keys(errors).join(', ');
    console.error('PPM form validation errors:', errors);
    toast.error(t('ppm.form.validationError', { fields: failingFields }));
  };

  const handleCancel = () => {
    navigate('/dashboard/calendar/ppms');
  };

  // Helper functions for managing items array
  const addItem = () => {
    const currentItems = ppmForm.getValues('items');
    const newIndex = currentItems.length;
    ppmForm.setValue('items', [...currentItems, {
      description: '',
      qty: 1,
      unit_price: '',
      unit: ''
    }]);
    setExpandedItems([...expandedItems, newIndex]);
  };

  const removeItem = (index: number) => {
    const currentItems = ppmForm.getValues('items');
    ppmForm.setValue('items', currentItems.filter((_, i) => i !== index));
    setExpandedItems(expandedItems.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  const toggleItemExpansion = (index: number) => {
    setExpandedItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const isItemExpanded = (index: number) => expandedItems.includes(index);

  const isItemComplete = (item: any) => {
    return item.description && item.qty > 0 && item.unit_price && item.unit;
  };

  const getItemSummary = (item: any) => {
    if (!item.description) return t('ppm.form.untitledItem');
    const parts = [item.description];
    if (item.qty && item.unit_price && item.unit) {
      parts.push(`${item.qty} ${item.unit} @ ₦${item.unit_price}`);
    }
    return parts.join(' • ');
  };

  if (isEditMode && isLoadingPpm) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('ppm.form.loadingDetails')}</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isPpmError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('ppm.form.errorLoading')}</div>
        <p className="text-sm text-muted-foreground mb-4">
          {ppmError instanceof Error ? ppmError.message : t('ppm.form.errorFallback')}
        </p>
        <Button onClick={handleCancel} variant="outline">
          {t('ppm.form.backToPpms')}
        </Button>
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
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? t('ppm.form.editTitle') : t('ppm.form.createTitle')}
          </h1>
        </div>
      </div>

      <Form {...ppmForm}>
        <form onSubmit={ppmForm.handleSubmit(onSubmitPpm, onInvalidPpm)} className="space-y-6">
          <div className="space-y-4">
            {/* PPM Details Section */}
            <Collapsible open={sectionOpen} onOpenChange={setSectionOpen} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-50 border-2 border-gray-100 text-black rounded-t-md">
                <h2 className="text-lg font-medium">{t('ppm.form.sectionTitle')}</h2>
              </CollapsibleTrigger>

              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={ppmForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('ppm.form.status')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('ppm.form.selectStatus')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">{t('ppm.form.statusOptions.active')}</SelectItem>
                            <SelectItem value="Inactive">{t('ppm.form.statusOptions.inactive')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ppmForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('ppm.form.currency')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('ppm.form.selectCurrency')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NGN">{t('ppm.form.currencyOptions.ngn')}</SelectItem>
                            <SelectItem value="USD">{t('ppm.form.currencyOptions.usd')}</SelectItem>
                            <SelectItem value="EUR">{t('ppm.form.currencyOptions.eur')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={ppmForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('ppm.form.description')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('ppm.form.descriptionPlaceholder')}
                          {...field}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={ppmForm.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('ppm.form.startDate')}</FormLabel>
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
                    control={ppmForm.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('ppm.form.endDate')}</FormLabel>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={ppmForm.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('ppm.form.frequency')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={t('ppm.form.frequencyPlaceholder')}
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ppmForm.control}
                    name="frequency_unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('ppm.form.frequencyUnit')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('ppm.form.selectUnit')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Hours">{t('ppm.form.frequencyOptions.hours')}</SelectItem>
                            <SelectItem value="Days">{t('ppm.form.frequencyOptions.days')}</SelectItem>
                            <SelectItem value="Weeks">{t('ppm.form.frequencyOptions.weeks')}</SelectItem>
                            <SelectItem value="Months">{t('ppm.form.frequencyOptions.months')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={ppmForm.control}
                    name="notify_before_due"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('ppm.form.notifyBeforeDue')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={t('ppm.form.notifyBeforeDuePlaceholder')}
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ppmForm.control}
                    name="notify_unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('ppm.form.notifyUnit')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('ppm.form.selectUnit')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Hours">{t('ppm.form.frequencyOptions.hours')}</SelectItem>
                            <SelectItem value="Days">{t('ppm.form.frequencyOptions.days')}</SelectItem>
                            <SelectItem value="Weeks">{t('ppm.form.frequencyOptions.weeks')}</SelectItem>
                            <SelectItem value="Months">{t('ppm.form.frequencyOptions.months')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={ppmForm.control}
                    name="send_reminder_every"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('ppm.form.sendReminderEvery')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={t('ppm.form.sendReminderPlaceholder')}
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ppmForm.control}
                    name="reminder_unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('ppm.form.reminderUnit')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('ppm.form.selectUnit')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Hours">{t('ppm.form.frequencyOptions.hours')}</SelectItem>
                            <SelectItem value="Days">{t('ppm.form.frequencyOptions.days')}</SelectItem>
                            <SelectItem value="Weeks">{t('ppm.form.frequencyOptions.weeks')}</SelectItem>
                            <SelectItem value="Months">{t('ppm.form.frequencyOptions.months')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={ppmForm.control}
                    name="auto_create_work_order"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t('ppm.form.autoCreateWorkOrder')}</FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ppmForm.control}
                    name="create_work_order_as_approved"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t('ppm.form.createWorkOrderAsApproved')}</FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={ppmForm.control}
                  name="activities_safety_tips"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('ppm.form.activitiesSafetyTips')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('ppm.form.activitiesSafetyTipsPlaceholder')}
                          {...field}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ppmForm.control}
                  name="approver"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('ppm.form.assignApprover')}</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === 'none' ? undefined : Number(value))}
                        value={field.value?.toString() ?? 'none'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('ppm.form.selectApprover')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">{t('ppm.form.noApprover')}</SelectItem>
                          {(approvers as { id: number; name: string; email?: string }[]).map(user => (
                            <SelectItem key={user.id} value={String(user.id)}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* <FormField owner field commented out in original */ }

                  <FormField
                    control={ppmForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('ppm.form.category')}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('ppm.form.selectWorkCategory')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={String(category.id) || "0"}>
                                {category.name || category.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ppmForm.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('ppm.form.subcategory')}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                          disabled={!selectedCategory}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={selectedCategory ? t('ppm.form.selectWorkSubcategory') : t('ppm.form.selectWorkCategoryFirst')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableSubcategories.map(subcat => (
                              <SelectItem key={subcat.id} value={String(subcat.id) || "0"}>
                                {subcat.name}
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
                  control={ppmForm.control}
                  name="facilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('ppm.form.facility')}</FormLabel>
                      <div className="border rounded-md p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                          {facilities.map((facility) => {
                            const facilityId = String(facility.id);
                            const selectedFacilities = ppmForm.watch("facilities");

                            return (
                              <label key={facility.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                                <input
                                  type="checkbox"
                                  value={facilityId}
                                  checked={selectedFacilities.includes(facilityId)}
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    if (e.target.checked) {
                                      ppmForm.setValue("facilities", [...selectedFacilities, newValue]);
                                    } else {
                                      ppmForm.setValue(
                                        "facilities",
                                        selectedFacilities.filter((id) => id !== newValue)
                                      );
                                    }
                                  }}
                                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm">{facility.name}</span>
                              </label>
                            );
                          })}
                        </div>
                        {facilities.length === 0 && (
                          <p className="text-gray-500 text-sm text-center py-4">{t('ppm.form.noFacilities')}</p>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ppmForm.control}
                  name="buildings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('ppm.form.sectionsBuildings')}</FormLabel>
                      <div className="border rounded-md p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                          {buildings.map((building) => {
                            const buildingId = String(building.id);
                            const selectedBuildings = ppmForm.watch("buildings");

                            return (
                              <label key={building.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                                <input
                                  type="checkbox"
                                  value={buildingId}
                                  checked={selectedBuildings.includes(buildingId)}
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    if (e.target.checked) {
                                      ppmForm.setValue("buildings", [...selectedBuildings, newValue]);
                                    } else {
                                      ppmForm.setValue(
                                        "buildings",
                                        selectedBuildings.filter((id) => id !== newValue)
                                      );
                                    }
                                  }}
                                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm">{building.name}</span>
                              </label>
                            );
                          })}
                        </div>
                        {buildings.length === 0 && (
                          <p className="text-gray-500 text-sm text-center py-4">{t('ppm.form.noBuildings')}</p>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ppmForm.control}
                  name="assets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('ppm.form.asset')}</FormLabel>
                      <div className="border rounded-md p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                          {assets.map((asset) => {
                            const assetId = String(asset.id);
                            const selectedAssets = ppmForm.watch("assets");

                            return (
                              <label key={asset.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                                <input
                                  type="checkbox"
                                  value={assetId}
                                  checked={selectedAssets.includes(assetId)}
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    if (e.target.checked) {
                                      ppmForm.setValue("assets", [...selectedAssets, newValue]);
                                    } else {
                                      ppmForm.setValue(
                                        "assets",
                                        selectedAssets.filter((id) => id !== newValue)
                                      );
                                    }
                                  }}
                                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm">{asset.asset_name}</span>
                              </label>
                            );
                          })}
                        </div>
                        {assets.length === 0 && (
                          <p className="text-gray-500 text-sm text-center py-4">{t('ppm.form.noAssets')}</p>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ppmForm.control}
                  name="items"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between mb-4">
                        <FormLabel className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          {t('ppm.form.ppmItemsLabel', { count: field.value.length })}
                        </FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addItem}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          {t('ppm.form.addItem')}
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {field.value.map((item, index) => (
                          <Collapsible
                            key={index}
                            open={isItemExpanded(index)}
                            onOpenChange={() => toggleItemExpansion(index)}
                          >
                            <div className="border rounded-lg bg-white shadow-sm group">
                              {/* Collapsed View - Summary */}
                              <CollapsibleTrigger className="w-full">
                                <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                  <div className="flex items-center gap-3 text-left">
                                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                      isItemComplete(item)
                                        ? 'bg-green-500'
                                        : 'bg-yellow-400'
                                    }`} />

                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-gray-900 truncate">
                                        {t('ppm.form.itemLabel', { number: index + 1 })}
                                      </div>
                                      <div className="text-sm text-gray-600 truncate">
                                        {getItemSummary(item)}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {item.qty && item.unit_price && (
                                      <div className="text-right text-sm">
                                        <div className="font-medium text-green-600">
                                          ₦{(parseFloat(item.unit_price) * item.qty).toFixed(2)}
                                        </div>
                                        <div className="text-xs text-gray-500">{t('ppm.form.totalLabel')}</div>
                                      </div>
                                    )}

                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeItem(index);
                                      }}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 opacity-60 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>

                                    {isItemExpanded(index) ? (
                                      <ChevronUp className="h-4 w-4 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 text-gray-400" />
                                    )}
                                  </div>
                                </div>
                              </CollapsibleTrigger>

                              {/* Expanded View - Full Form */}
                              <CollapsibleContent>
                                <div className="border-t bg-slate-50 p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-sm font-medium text-gray-700">{t('ppm.form.descriptionField')}</label>
                                      <Input
                                        placeholder={t('ppm.form.enterItemDescription')}
                                        value={item.description}
                                        onChange={(e) => {
                                          const updatedItems = [...field.value];
                                          updatedItems[index] = { ...updatedItems[index], description: e.target.value };
                                          ppmForm.setValue('items', updatedItems);
                                        }}
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-sm font-medium text-gray-700">{t('ppm.form.unitField')}</label>
                                      <Input
                                        placeholder={t('ppm.form.enterUnit')}
                                        value={item.unit}
                                        onChange={(e) => {
                                          const updatedItems = [...field.value];
                                          updatedItems[index] = { ...updatedItems[index], unit: e.target.value };
                                          ppmForm.setValue('items', updatedItems);
                                        }}
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-sm font-medium text-gray-700">{t('ppm.form.quantityField')}</label>
                                      <Input
                                        type="number"
                                        placeholder={t('ppm.form.enterQuantity')}
                                        min="1"
                                        value={item.qty || ''}
                                        onChange={(e) => {
                                          const updatedItems = [...field.value];
                                          updatedItems[index] = { ...updatedItems[index], qty: Number(e.target.value) || 1 };
                                          ppmForm.setValue('items', updatedItems);
                                        }}
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-sm font-medium text-gray-700">{t('ppm.form.unitPriceField')}</label>
                                      <Input
                                        placeholder={t('ppm.form.enterUnitPrice')}
                                        value={item.unit_price}
                                        onChange={(e) => {
                                          const updatedItems = [...field.value];
                                          updatedItems[index] = { ...updatedItems[index], unit_price: e.target.value };
                                          ppmForm.setValue('items', updatedItems);
                                        }}
                                      />
                                    </div>
                                  </div>

                                  {item.qty && item.unit_price && (
                                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-green-800 font-medium">{t('ppm.form.totalCost')}</span>
                                        <span className="text-green-900 font-bold">
                                          ₦{(parseFloat(item.unit_price) * item.qty).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        ))}

                        {field.value.length === 0 && (
                          <div className="text-center text-muted-foreground py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-medium mb-2">{t('ppm.form.noItemsTitle')}</p>
                            <p className="text-sm">{t('ppm.form.noItemsHint')}</p>
                          </div>
                        )}

                        {/* Summary Footer */}
                        {field.value.length > 0 && (
                          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                <span className="font-medium text-blue-900">
                                  {t('ppm.form.itemsAdded', { count: field.value.length })}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-blue-700">{t('ppm.form.estimatedTotal')}</div>
                                <div className="text-lg font-bold text-blue-900">
                                  ₦{field.value.reduce((total, item) => {
                                    const itemTotal = item.qty && item.unit_price ?
                                      parseFloat(item.unit_price) * item.qty : 0;
                                    return total + itemTotal;
                                  }, 0).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Form submit buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              {t('ppm.form.cancel')}
            </Button>

            <Button
              type="submit"
              disabled={createPpmMutation.isPending || updatePpmMutation.isPending}
            >
              {(createPpmMutation.isPending || updatePpmMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? t('ppm.form.update') : t('ppm.form.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PpmForm;
