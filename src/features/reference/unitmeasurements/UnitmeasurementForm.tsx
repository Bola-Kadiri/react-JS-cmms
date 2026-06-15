// src/features/asset/unitmeasurements/UnitmeasurementForm.tsx
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
import { Unitmeasurement } from '@/types/unitmeasurement';
import { useUnitmeasurementQuery, useCreateUnitmeasurement, useUpdateUnitmeasurement } from '@/hooks/unitmeasurement/useUnitmeasurementQueries';
import { toast } from '@/components/ui/use-toast';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

// Form schema definition — no t() calls so can stay at module level
const unitmeasurementSchema = z.object({
  code: z.string(),
  description: z.string().optional().default(""),
  symbol: z.string(),
  type: z.enum(['Area', 'Packing', 'Piece', 'Time', 'Volume', 'Weight', 'Other']),
  status: z.enum(['Active', 'Inactive']),
});

type UnitmeasurementFormValues = z.infer<typeof unitmeasurementSchema>;

const UnitmeasurementForm = () => {
  const { t } = useTypedTranslation('accounts');
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const isEditMode = !!code;

  // Collapsible section states
  const [openSections, setOpenSections] = useState({
    basic: true,
    additional: false
  });

  // Unitmeasurement form setup
  const unitmeasurementForm = useForm<UnitmeasurementFormValues>({
    resolver: zodResolver(unitmeasurementSchema),
    defaultValues: {
      code: '',
      description: '',
      symbol: '',
      type: 'Other',
      status: 'Active',
    }
  });

  // Fetch unitmeasurement data for edit mode using our custom hook
  const {
    data: unitmeasurementData,
    isLoading: isLoadingUnitmeasurement,
    isError: isUnitmeasurementError,
    error: unitmeasurementError
  } = useUnitmeasurementQuery(isEditMode ? code : undefined);

  // Use our custom mutation hooks
  const createUnitmeasurementMutation = useCreateUnitmeasurement();
  const updateUnitmeasurementMutation = useUpdateUnitmeasurement(code);

  // Toggle section visibility
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle unitmeasurement data loading
  useEffect(() => {
    if (unitmeasurementData && isEditMode) {
      // Reset the form with unitmeasurement data
      unitmeasurementForm.reset({
        code: unitmeasurementData.code,
        description: unitmeasurementData.description || '',
        symbol: unitmeasurementData.symbol,
        type: unitmeasurementData.type,
        status: unitmeasurementData.status
      });
    }
  }, [unitmeasurementData, isEditMode, unitmeasurementForm]);

  const onSubmitUnitmeasurement = async (data: UnitmeasurementFormValues) => {
    try {
      if (isEditMode && code) {
        updateUnitmeasurementMutation.mutate(
          { code, unitmeasurement: data },
          { onSuccess: () => navigate('/dashboard/accounts/unit-measurements') }
        );
      } else {
        createUnitmeasurementMutation.mutate(
          data as unknown as Omit<Unitmeasurement, 'id'>,
          { onSuccess: () => navigate('/dashboard/accounts/unit-measurements') }
        );
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: t('unitMeasurement.form.toast.errorTitle'),
        description: t('unitMeasurement.form.toast.submitError'),
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/accounts/unit-measurements');
  };

  if (isEditMode && isLoadingUnitmeasurement) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{t('unitMeasurement.form.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEditMode && isUnitmeasurementError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-500 text-xl">{t('unitMeasurement.form.error')}</div>
          <p className="text-sm text-muted-foreground mb-4">
            {unitmeasurementError instanceof Error ? unitmeasurementError.message : t('unitMeasurement.form.unknownError')}
          </p>
          <Button onClick={handleCancel} variant="outline">
            {t('unitMeasurement.form.backToList')}
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
            aria-label={t('common:actions.back')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? t('unitMeasurement.form.editTitle') : t('unitMeasurement.form.createPageTitle')}
          </h1>
        </div>
      </div>

      <Form {...unitmeasurementForm}>
        <form onSubmit={unitmeasurementForm.handleSubmit(onSubmitUnitmeasurement)} className="space-y-6">
          {/* First Collapsible: Basic Information */}
          <div className="rounded-md border overflow-hidden">
            <button
              type="button"
              className="flex justify-between items-center w-full p-4 bg-gray-50 text-left"
              onClick={() => toggleSection('basic')}
            >
              <h2 className="text-lg font-medium">{t('unitMeasurement.form.sections.basic')}</h2>
              {openSections.basic ?
                <ChevronUp className="h-5 w-5 text-gray-500" /> :
                <ChevronDown className="h-5 w-5 text-gray-500" />
              }
            </button>

            {openSections.basic && (
              <div className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={unitmeasurementForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('unitMeasurement.form.fields.code')}<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('unitMeasurement.form.placeholders.code')}
                            {...field}
                            disabled={isEditMode} // Code cannot be changed in edit mode
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={unitmeasurementForm.control}
                    name="symbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('unitMeasurement.form.fields.symbol')}<span className="text-red-500 ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('unitMeasurement.form.placeholders.symbol')}
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
                    control={unitmeasurementForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('unitMeasurement.form.fields.type')}<span className="text-red-500 ml-1">*</span></FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('unitMeasurement.form.placeholders.selectType')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Area">{t('unitMeasurement.types.area')}</SelectItem>
                            <SelectItem value="Packing">{t('unitMeasurement.types.packing')}</SelectItem>
                            <SelectItem value="Piece">{t('unitMeasurement.types.piece')}</SelectItem>
                            <SelectItem value="Time">{t('unitMeasurement.types.time')}</SelectItem>
                            <SelectItem value="Volume">{t('unitMeasurement.types.volume')}</SelectItem>
                            <SelectItem value="Weight">{t('unitMeasurement.types.weight')}</SelectItem>
                            <SelectItem value="Other">{t('unitMeasurement.types.other')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={unitmeasurementForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('unitMeasurement.form.fields.status')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('unitMeasurement.form.placeholders.selectStatus')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">{t('unitMeasurement.status.active')}</SelectItem>
                            <SelectItem value="Inactive">{t('unitMeasurement.status.inactive')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={unitmeasurementForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('unitMeasurement.form.fields.description')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('unitMeasurement.form.placeholders.description')}
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

          {/* Additional Information Collapsible — commented out in original, preserved */}
          {/* <div className="rounded-md border overflow-hidden">
            ...
          </div> */}

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
              disabled={createUnitmeasurementMutation.isPending || updateUnitmeasurementMutation.isPending}
            >
              {(createUnitmeasurementMutation.isPending || updateUnitmeasurementMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? t('unitMeasurement.form.update') : t('unitMeasurement.form.create')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default UnitmeasurementForm;
