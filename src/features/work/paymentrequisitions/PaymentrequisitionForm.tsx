// src/features/work/paymentrequisitions/PaymentrequisitionForm.tsx
import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Paymentrequisition } from '@/types/paymentrequisition';
import { usePaymentrequisitionQuery, useCreatePaymentrequisition, useUpdatePaymentrequisition } from '@/hooks/paymentrequisition/usePaymentrequisitionQueries';
import { Checkbox } from '@/components/ui/checkbox';
import { useList } from '@/hooks/crud/useCrudOperations';
import { Vendor } from '@/types/vendor';
import { User } from '@/types/user';
import { Workorder } from '@/types/workorder';
import { Paymentitem } from '@/types/paymentitem';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const endpoint1 = 'accounts/api/vendors/';
const endpoint2 = 'accounts/api/users/';
const endpoint3 = 'work/api/work-orders/';
const endpoint4 = 'work/api/payment-items/';

const PaymentrequisitionForm = () => {
  const { t } = useTypedTranslation('work');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const paymentrequisitionSchema = z.object({
    requisition_date: z.string().min(1, t('paymentRequisition.form.validation.requisitionDateRequired')),
    pay_to: z.number().int().positive(t('paymentRequisition.form.validation.payToRequired')),
    status: z.enum(['Active', 'Inactive']),
    expected_payment_date: z.string().min(1, t('paymentRequisition.form.validation.expectedPaymentDateRequired')),
    retirement: z.boolean(),
    remark: z.string().optional(),
    approval_status: z.enum(['request', 'approve']),
    comment: z.string().optional(),
    withholding_tax: z.string().optional(),
    expected_payment_amount: z.string().min(1, t('paymentRequisition.form.validation.expectedPaymentAmountRequired')),
    owner: z.number().int().positive(t('paymentRequisition.form.validation.ownerRequired')),
    reviewer: z.number({ required_error: t('paymentRequisition.form.validation.reviewerRequired') }).int().positive(t('paymentRequisition.form.validation.reviewerRequired')),
    work_orders: z.array(z.number().int()).min(1, t('paymentRequisition.form.validation.workOrderRequired')),
    request_to: z.array(z.number().int()).min(1, t('paymentRequisition.form.validation.requestToRequired')),
    items: z.array(z.number().int())
  });

  type PaymentrequisitionFormValues = z.infer<typeof paymentrequisitionSchema>;

  const paymentrequisitionForm = useForm<PaymentrequisitionFormValues>({
    resolver: zodResolver(paymentrequisitionSchema),
    defaultValues: {
      requisition_date: '',
      pay_to: undefined as unknown as number,
      status: 'Active',
      expected_payment_date: '',
      retirement: false,
      remark: '',
      approval_status: 'request',
      comment: '',
      withholding_tax: '',
      expected_payment_amount: '',
      owner: undefined as unknown as number,
      reviewer: undefined as unknown as number,
      work_orders: [],
      request_to: [],
      items: []
    }
  });

  const { data: vendors = [] } = useList<Vendor>('vendors', endpoint1);
  const { data: users = [] } = useList<User>('users', endpoint2);
  const { data: workOrders = [] } = useList<Workorder>('workorders', endpoint3);
  const { data: paymentItems = [] } = useList<Paymentitem>('paymentitems', endpoint4);

  // Only fully approved work orders can be attached to a payment requisition
  const approvedWorkOrders = useMemo(() => workOrders.filter(wo => wo.approval_status === 'Approved'), [workOrders]);

  // Role-filtered user lists
  const reviewers = useMemo(() => users.filter(u => u.roles === 'REVIEWER'), [users]);
  const approvers = useMemo(() => users.filter(u => u.roles === 'APPROVER'), [users]);

  // Watch at component level — stable subscriptions, no stale closures
  const selectedWorkOrders = paymentrequisitionForm.watch('work_orders') ?? [];
  const selectedReviewer = paymentrequisitionForm.watch('reviewer');
  const selectedPersons = paymentrequisitionForm.watch('request_to') ?? [];

  const setReviewer = useCallback((uid: number) => {
    const current = paymentrequisitionForm.getValues('reviewer');
    // Single selection: clicking the already-selected card deselects it
    paymentrequisitionForm.setValue(
      'reviewer',
      current === uid ? (undefined as unknown as number) : uid,
      { shouldValidate: true }
    );
  }, [paymentrequisitionForm]);

  const toggleWorkOrder = useCallback((wid: number) => {
    const current = paymentrequisitionForm.getValues('work_orders') ?? [];
    paymentrequisitionForm.setValue(
      'work_orders',
      current.includes(wid) ? current.filter(id => id !== wid) : [...current, wid],
      { shouldValidate: true }
    );
  }, [paymentrequisitionForm]);

  const togglePerson = useCallback((pid: number) => {
    const current = paymentrequisitionForm.getValues('request_to') ?? [];
    paymentrequisitionForm.setValue(
      'request_to',
      current.includes(pid) ? current.filter(id => id !== pid) : [...current, pid],
      { shouldValidate: true }
    );
  }, [paymentrequisitionForm]);

  const {
    data: paymentrequisitionData,
    isLoading: isLoadingPaymentrequisition,
    isError: isPaymentrequisitionError,
    error: paymentrequisitionError
  } = usePaymentrequisitionQuery(isEditMode ? id : undefined);

  const createPaymentrequisitionMutation = useCreatePaymentrequisition();
  const updatePaymentrequisitionMutation = useUpdatePaymentrequisition(id);

  useEffect(() => {
    if (paymentrequisitionData && isEditMode) {
      paymentrequisitionForm.reset({
        requisition_date: paymentrequisitionData.requisition_date,
        pay_to: paymentrequisitionData.pay_to,
        status: paymentrequisitionData.status,
        expected_payment_date: paymentrequisitionData.expected_payment_date,
        retirement: paymentrequisitionData.retirement,
        remark: paymentrequisitionData.remark,
        approval_status: paymentrequisitionData.approval_status,
        comment: paymentrequisitionData.comment,
        withholding_tax: paymentrequisitionData.withholding_tax,
        expected_payment_amount: paymentrequisitionData.expected_payment_amount,
        owner: paymentrequisitionData.owner,
        reviewer: paymentrequisitionData.reviewer ?? (undefined as unknown as number),
        work_orders: paymentrequisitionData.work_orders,
        request_to: paymentrequisitionData.request_to,
        items: paymentrequisitionData.items
      });
    }
  }, [paymentrequisitionData, isEditMode, paymentrequisitionForm]);

  const onSubmitPaymentrequisition = (data: PaymentrequisitionFormValues) => {
    if (isEditMode && id) {
      updatePaymentrequisitionMutation.mutate(
        { id, paymentrequisition: data },
        { onSuccess: () => navigate('/dashboard/work/payment-requisitions') }
      );
    } else {
      createPaymentrequisitionMutation.mutate(
        data as Omit<Paymentrequisition, 'id'>,
        { onSuccess: () => navigate('/dashboard/work/payment-requisitions') }
      );
    }
  };

  const handleCancel = () => navigate('/dashboard/work/payment-requisitions');

  if (isEditMode && isLoadingPaymentrequisition) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('paymentRequisition.form.loading')}</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isPaymentrequisitionError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('paymentRequisition.form.errorLoading')}</div>
        <p className="text-sm text-muted-foreground mb-4">
          {paymentrequisitionError instanceof Error
            ? paymentrequisitionError.message
            : t('paymentRequisition.form.errorFallback')}
        </p>
        <Button onClick={handleCancel} variant="outline">
          {t('paymentRequisition.form.backToList')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? t('paymentRequisition.form.editTitle') : t('paymentRequisition.form.createTitle')}
          </h1>
        </div>
      </div>

      <Form {...paymentrequisitionForm}>
        <form onSubmit={paymentrequisitionForm.handleSubmit(onSubmitPaymentrequisition)} className="space-y-6">
          <div className="space-y-4">
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger asChild>
                <div className="flex justify-between items-center w-full p-3 bg-gray-50 border-2 border-gray-100 text-black rounded-t-md cursor-pointer">
                  <h2 className="text-lg font-medium">{t('paymentRequisition.form.sectionTitle')}</h2>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={paymentrequisitionForm.control}
                    name="requisition_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('paymentRequisition.form.requisitionDate')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={paymentrequisitionForm.control}
                    name="expected_payment_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('paymentRequisition.form.expectedPaymentDate')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={paymentrequisitionForm.control}
                    name="pay_to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('paymentRequisition.form.payTo')}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('paymentRequisition.form.selectVendor')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vendors.map((option) => (
                              <SelectItem key={option.id} value={option.id.toString()}>
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={paymentrequisitionForm.control}
                    name="owner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('paymentRequisition.form.owner')}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('paymentRequisition.form.selectOwner')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users.map((option) => (
                              <SelectItem key={option.id} value={option.id.toString()}>
                                {option.first_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={paymentrequisitionForm.control}
                    name="expected_payment_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('paymentRequisition.form.expectedPaymentAmount')}</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={t('paymentRequisition.form.enterAmount')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={paymentrequisitionForm.control}
                    name="withholding_tax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('paymentRequisition.form.withholdingTax')}</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={t('paymentRequisition.form.enterTaxAmount')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={paymentrequisitionForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('paymentRequisition.form.status')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('paymentRequisition.form.selectStatus')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">{t('paymentRequisition.form.statusOptions.active')}</SelectItem>
                            <SelectItem value="Inactive">{t('paymentRequisition.form.statusOptions.inactive')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={paymentrequisitionForm.control}
                    name="approval_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('paymentRequisition.form.approvalStatus')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('paymentRequisition.form.selectApprovalStatus')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="request">{t('paymentRequisition.form.approvalStatusOptions.request')}</SelectItem>
                            <SelectItem value="approve">{t('paymentRequisition.form.approvalStatusOptions.approve')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={paymentrequisitionForm.control}
                  name="retirement"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">{t('paymentRequisition.form.retirement')}</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentrequisitionForm.control}
                  name="remark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('paymentRequisition.form.remark')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('paymentRequisition.form.enterRemarks')}
                          {...field}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentrequisitionForm.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('paymentRequisition.form.comment')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('paymentRequisition.form.enterComments')}
                          {...field}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentrequisitionForm.control}
                  name="work_orders"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        {t('paymentRequisition.form.workOrders')}
                        <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <p className="text-xs text-muted-foreground mb-2">
                        {t('paymentRequisition.form.workOrdersHint')}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                        {approvedWorkOrders.length === 0 ? (
                          <p className="text-sm text-muted-foreground col-span-2 py-2">
                            {t('paymentRequisition.form.noWorkOrders')}
                          </p>
                        ) : approvedWorkOrders.map((wo) => {
                          const checked = selectedWorkOrders.includes(wo.id);
                          return (
                            <div
                              key={wo.id}
                              role="checkbox"
                              aria-checked={checked}
                              tabIndex={0}
                              onClick={() => toggleWorkOrder(wo.id)}
                              onKeyDown={e => { if (e.key === ' ') { e.preventDefault(); toggleWorkOrder(wo.id); } }}
                              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer select-none transition-colors ${
                                checked ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className={`h-4 w-4 shrink-0 mt-0.5 rounded-sm border-2 flex items-center justify-center transition-colors ${
                                checked ? 'bg-primary border-primary' : 'border-gray-300 bg-white'
                              }`}>
                                {checked && <span className="text-white text-[10px] leading-none font-bold">✓</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-tight">{wo.title}</p>
                                <p className="text-xs text-muted-foreground font-mono mt-0.5">{wo.work_order_number}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {wo.facility_detail?.name && (
                                    <span className="text-xs text-muted-foreground">{wo.facility_detail.name}</span>
                                  )}
                                  <span className="text-xs px-1.5 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                                    {wo.approval_status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Step 1 of approval flow: Reviewer */}
                <FormField
                  control={paymentrequisitionForm.control}
                  name="reviewer"
                  render={() => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">1</span>
                        <FormLabel className="mb-0">{t('paymentRequisition.form.reviewer')}<span className="text-red-500 ml-1">*</span></FormLabel>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{t('paymentRequisition.form.reviewerHint')}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                        {reviewers.length === 0 ? (
                          <p className="text-sm text-muted-foreground col-span-2 py-2">{t('paymentRequisition.form.noReviewers')}</p>
                        ) : reviewers.map((person) => {
                          const checked = selectedReviewer === person.id;
                          const fullName = [person.first_name, person.last_name].filter(Boolean).join(' ');
                          return (
                            <div
                              key={person.id}
                              role="radio"
                              aria-checked={checked}
                              tabIndex={0}
                              onClick={() => setReviewer(person.id)}
                              onKeyDown={e => { if (e.key === ' ') { e.preventDefault(); setReviewer(person.id); } }}
                              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer select-none transition-colors ${
                                checked ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className={`h-4 w-4 shrink-0 mt-0.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                checked ? 'border-primary' : 'border-gray-300 bg-white'
                              }`}>
                                {checked && <div className="h-2 w-2 rounded-full bg-primary" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-tight">{fullName || person.email}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{person.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs px-1.5 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">{person.roles}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Divider with arrow showing flow direction */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs font-medium px-2">↓ {t('paymentRequisition.form.flowArrow')}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Step 2 of approval flow: Approver */}
                <FormField
                  control={paymentrequisitionForm.control}
                  name="request_to"
                  render={() => (
                    <FormItem>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">2</span>
                        <FormLabel className="mb-0">{t('paymentRequisition.form.requestTo')}<span className="text-red-500 ml-1">*</span></FormLabel>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {t('paymentRequisition.form.approversHint')}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                        {approvers.length === 0 ? (
                          <p className="text-sm text-muted-foreground col-span-2 py-2">
                            {t('paymentRequisition.form.noApprovers')}
                          </p>
                        ) : approvers.map((person) => {
                          const checked = selectedPersons.includes(person.id);
                          const fullName = [person.first_name, person.last_name].filter(Boolean).join(' ');
                          return (
                            <div
                              key={person.id}
                              role="checkbox"
                              aria-checked={checked}
                              tabIndex={0}
                              onClick={() => togglePerson(person.id)}
                              onKeyDown={e => { if (e.key === ' ') { e.preventDefault(); togglePerson(person.id); } }}
                              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer select-none transition-colors ${
                                checked ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className={`h-4 w-4 shrink-0 mt-0.5 rounded-sm border-2 flex items-center justify-center transition-colors ${
                                checked ? 'bg-primary border-primary' : 'border-gray-300 bg-white'
                              }`}>
                                {checked && <span className="text-white text-[10px] leading-none font-bold">✓</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-tight">{fullName || person.email}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{person.email}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-xs px-1.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                                    {person.roles}
                                  </span>
                                  {person.approval_limit != null && (
                                    <span className="text-xs text-muted-foreground">
                                      Limit: {Number(person.approval_limit).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentrequisitionForm.control}
                  name="items"
                  render={() => (
                    <FormItem>
                      <FormLabel>{t('paymentRequisition.form.items')}</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {paymentItems.map((item) => {
                          const itemId = item.id;
                          const selectedItems = paymentrequisitionForm.watch('items');
                          return (
                            <label key={item.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                value={itemId}
                                checked={selectedItems.includes(itemId)}
                                onChange={(e) => {
                                  const newValue = Number(e.target.value);
                                  if (e.target.checked) {
                                    paymentrequisitionForm.setValue('items', [...selectedItems, newValue]);
                                  } else {
                                    paymentrequisitionForm.setValue(
                                      'items',
                                      selectedItems.filter((iid) => iid !== newValue)
                                    );
                                  }
                                }}
                              />
                              <span>{item.item_name}</span>
                            </label>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t('paymentRequisition.form.cancel')}
            </Button>

            <Button
              type="submit"
              disabled={createPaymentrequisitionMutation.isPending || updatePaymentrequisitionMutation.isPending}
            >
              {(createPaymentrequisitionMutation.isPending || updatePaymentrequisitionMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? t('paymentRequisition.form.update') : t('paymentRequisition.form.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PaymentrequisitionForm;
