// src/features/facility/zones/ZoneForm.tsx
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Zone } from '@/types/zone';
import { useList } from '@/hooks/crud/useCrudOperations';
import { useZoneQuery, useCreateZone, useUpdateZone } from '@/hooks/zone/useZoneQueries';
import { Facility } from '@/types/facility';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const facilityEndpoint = 'facility/api/api/facilities/';

const ZoneForm = () => {
  const { t } = useTypedTranslation('facility');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Schema defined inside component so validation messages are translated
  const zoneSchema = z.object({
    code: z.string().min(1, t('zone.form.validation.codeRequired')),
    name: z.string().min(1, t('zone.form.validation.nameRequired')),
    facility: z.number().optional(),
  });

  type ZoneFormValues = z.infer<typeof zoneSchema>;

  // Zone form setup
  const zoneForm = useForm<ZoneFormValues>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      code: '',
      name: '',
      facility: undefined,
    }
  });

  // Fetch all facilities
  const { data: facilities = [] } = useList<Facility>('facilities', facilityEndpoint);

  // Fetch zone data for edit mode using our custom hook
  const {
    data: zoneData,
    isLoading: isLoadingZone,
    isError: isZoneError,
    error: zoneError
  } = useZoneQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createZoneMutation = useCreateZone();
  const updateZoneMutation = useUpdateZone(id);

  // Handle zone data loading
  useEffect(() => {
    if (zoneData && isEditMode) {
      zoneForm.reset({
        code: zoneData.code,
        name: zoneData.name,
        facility: zoneData.facility,
      });
    }
  }, [zoneData, isEditMode, zoneForm]);

  const onSubmitZone = (data: ZoneFormValues) => {
    if (isEditMode && id) {
      updateZoneMutation.mutate(
        { id, zone: data },
        { onSuccess: () => navigate('/dashboard/facility/zones') }
      );
    } else {
      createZoneMutation.mutate(
        data as Omit<Zone, 'id'>,
        { onSuccess: () => navigate('/dashboard/facility/zones') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/facility/zones');
  };

  if (isEditMode && isLoadingZone) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('zone.form.loading')}</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isZoneError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('zone.form.error')}</div>
        <p className="text-sm text-muted-foreground mb-4">
          {zoneError instanceof Error ? zoneError.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleCancel} variant="outline">
          {t('zone.form.backToZones')}
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
            {isEditMode ? t('zone.form.editTitle') : t('zone.form.createTitle')}
          </h1>
        </div>
      </div>

      <Form {...zoneForm}>
        <form onSubmit={zoneForm.handleSubmit(onSubmitZone)} className="space-y-6">
          <div className="space-y-4">
            {/* Zone Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-200 text-black rounded-t-md">
                <h2 className="text-lg font-medium">{t('zone.form.sectionTitle')}</h2>
                <Button variant="ghost" size="sm" className="h-8 text-white bg-gray-500 hover:bg-gray-600 hover:text-white px-3">
                  {t('zone.form.toggle')}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={zoneForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('zone.form.code')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('zone.form.codePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={zoneForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('zone.form.name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('zone.form.namePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={zoneForm.control}
                    name="facility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('zone.form.facilityOptional')}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('zone.form.facilityPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">{t('zone.form.noneOption')}</SelectItem>
                            {facilities.map(facility => (
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
                </div>
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
              {t('zone.form.cancel')}
            </Button>

            <Button
              type="submit"
              disabled={createZoneMutation.isPending || updateZoneMutation.isPending}
            >
              {(createZoneMutation.isPending || updateZoneMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? t('zone.form.update') : t('zone.form.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ZoneForm;
