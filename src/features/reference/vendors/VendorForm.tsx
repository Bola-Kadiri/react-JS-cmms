// src/features/asset/vendors/VendorForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Vendor } from '@/types/vendor';
import { useVendorQuery, useCreateVendor, useUpdateVendor } from '@/hooks/vendor/useVendorQueries';
import { toast } from '@/components/ui/use-toast';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const VendorForm = () => {
  const { t } = useTypedTranslation('accounts');
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEditMode = !!slug;

  // Schema defined inside component so validation messages can use t()
  const vendorSchema = z.object({
    name: z.string().min(1, t('vendor.form.validation.nameRequired')),
    type: z.enum(['Individual', 'Company']),
    phone: z.string().min(1, t('vendor.form.validation.phoneRequired')),
    email: z.string().email(t('vendor.form.validation.invalidEmail')),
    account_name: z.string().min(1, t('vendor.form.validation.accountNameRequired')),
    bank: z.string().min(1, t('vendor.form.validation.bankRequired')),
    account_number: z.string().min(1, t('vendor.form.validation.accountNumberRequired')),
    currency: z.enum(['NGN', 'USD', 'EUR', 'GBP']),
    status: z.enum(['Active', 'Inactive']),
  });

  type VendorFormValues = z.infer<typeof vendorSchema>;

  const [openSections, setOpenSections] = useState({
    basic: true,
    banking: true
  });

  const vendorForm = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      type: 'Company',
      phone: '',
      email: '',
      account_name: '',
      bank: '',
      account_number: '',
      currency: 'NGN',
      status: 'Active'
    }
  });

  const {
    data: vendorData,
    isLoading: isLoadingVendor,
    isError: isVendorError,
    error: vendorError
  } = useVendorQuery(isEditMode ? slug : undefined);

  const createVendorMutation = useCreateVendor();
  const updateVendorMutation = useUpdateVendor(slug);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    if (vendorData && isEditMode) {
      vendorForm.reset({
        name: vendorData.name,
        type: vendorData.type,
        phone: vendorData.phone,
        email: vendorData.email,
        account_name: vendorData.account_name,
        bank: vendorData.bank,
        account_number: vendorData.account_number,
        currency: vendorData.currency,
        status: vendorData.status
      });
    }
  }, [vendorData, isEditMode, vendorForm]);

  const onSubmitVendor = async (data: VendorFormValues) => {
    try {
      if (isEditMode && slug) {
        updateVendorMutation.mutate(
          { slug, vendor: data },
          { onSuccess: () => navigate('/dashboard/accounts/vendors') }
        );
      } else {
        createVendorMutation.mutate(
          data as unknown as Omit<Vendor, 'id'>,
          { onSuccess: () => navigate('/dashboard/accounts/vendors') }
        );
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: t('vendor.form.toast.errorTitle'),
        description: t('vendor.form.toast.submitError'),
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => navigate('/dashboard/accounts/vendors');

  if (isEditMode && isLoadingVendor) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{t('vendor.form.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEditMode && isVendorError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-500 text-xl">{t('vendor.form.error')}</div>
          <p className="text-sm text-muted-foreground mb-4">
            {vendorError instanceof Error ? vendorError.message : t('vendor.form.unknownError')}
          </p>
          <Button onClick={handleCancel} variant="outline">
            {t('vendor.form.backToList')}
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
            {isEditMode ? t('vendor.form.editTitle') : t('vendor.form.createPageTitle')}
          </h1>
        </div>
      </div>

      <Form {...vendorForm}>
        <form onSubmit={vendorForm.handleSubmit(onSubmitVendor)} className="space-y-6">
          {/* Basic Information */}
          <div className="rounded-md border overflow-hidden">
            <button
              type="button"
              className="flex justify-between items-center w-full p-4 bg-gray-50 text-left"
              onClick={() => toggleSection('basic')}
            >
              <h2 className="text-lg font-medium">{t('vendor.form.sections.basic')}</h2>
              {openSections.basic ?
                <ChevronUp className="h-5 w-5 text-gray-500" /> :
                <ChevronDown className="h-5 w-5 text-gray-500" />
              }
            </button>

            {openSections.basic && (
              <div className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={vendorForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('vendor.form.fields.name')}<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('vendor.form.placeholders.name')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vendorForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('vendor.form.fields.type')}<span className="text-red-500 ml-1">*</span></FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('vendor.form.fields.selectType')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Individual">{t('vendor.types.individual')}</SelectItem>
                            <SelectItem value="Company">{t('vendor.types.company')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={vendorForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('vendor.form.fields.email')}<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('vendor.form.placeholders.email')}
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vendorForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('vendor.form.fields.phone')}<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('vendor.form.placeholders.phone')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={vendorForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('vendor.form.fields.status')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('vendor.form.fields.selectStatus')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">{t('vendor.status.active')}</SelectItem>
                          <SelectItem value="Inactive">{t('vendor.status.inactive')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          {/* Banking Information */}
          <div className="rounded-md border overflow-hidden">
            <button
              type="button"
              className="flex justify-between items-center w-full p-4 bg-gray-50 text-left"
              onClick={() => toggleSection('banking')}
            >
              <h2 className="text-lg font-medium">{t('vendor.form.sections.banking')}</h2>
              {openSections.banking ?
                <ChevronUp className="h-5 w-5 text-gray-500" /> :
                <ChevronDown className="h-5 w-5 text-gray-500" />
              }
            </button>

            {openSections.banking && (
              <div className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={vendorForm.control}
                    name="account_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('vendor.form.fields.accountName')}<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('vendor.form.placeholders.accountName')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vendorForm.control}
                    name="bank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('vendor.form.fields.bank')}<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('vendor.form.placeholders.bank')}
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
                    control={vendorForm.control}
                    name="account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('vendor.form.fields.accountNumber')}<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('vendor.form.placeholders.accountNumber')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={vendorForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('vendor.form.fields.currency')}<span className="text-red-500 ml-1">*</span></FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('vendor.form.fields.selectCurrency')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NGN">{t('vendor.form.currencies.ngn')}</SelectItem>
                            <SelectItem value="USD">{t('vendor.form.currencies.usd')}</SelectItem>
                            <SelectItem value="EUR">{t('vendor.form.currencies.eur')}</SelectItem>
                            <SelectItem value="GBP">{t('vendor.form.currencies.gbp')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              {t('common:actions.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={createVendorMutation.isPending || updateVendorMutation.isPending}
            >
              {(createVendorMutation.isPending || updateVendorMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? t('vendor.form.update') : t('vendor.form.create')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default VendorForm;
