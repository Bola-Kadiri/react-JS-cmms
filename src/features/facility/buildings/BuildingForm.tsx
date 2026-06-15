// src/features/facility/buildings/BuildingForm.tsx
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
import { Building } from '@/types/building';
import { useList } from '@/hooks/crud/useCrudOperations';
import { useBuildingQuery, useBuildingZonesByFacilityQuery, useCreateBuilding, useUpdateBuilding } from '@/hooks/building/useBuildingQueries';
import { Facility } from '@/types/facility';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const facilityEndpoint = 'facility/api/api/facilities/';

const BuildingForm = () => {
  const { t } = useTypedTranslation('facility');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Schema defined inside component so validation messages are translated
  const buildingSchema = z.object({
    code: z.string().min(1, t('building.form.validation.codeRequired')),
    name: z.string().min(1, t('building.form.validation.nameRequired')),
    facility: z.number().min(1, t('building.form.validation.facilityRequired')),
    zone: z.number().min(1, t('building.form.validation.zoneRequired')),
    status: z.enum(['Active', 'Inactive']).default('Active'),
  });

  type BuildingFormValues = z.infer<typeof buildingSchema>;

  // Building form setup
  const buildingForm = useForm<BuildingFormValues>({
    resolver: zodResolver(buildingSchema),
    defaultValues: {
      code: '',
      name: '',
      facility: 0,
      zone: 0,
      status: 'Active',
    }
  });

  // Watch facility changes to fetch zones
  const selectedFacility = buildingForm.watch('facility');

  const { data: facilities = [] } = useList<Facility>('facilities', facilityEndpoint);

  // Fetch zones based on selected facility
  const {
    data: zones = [],
    isLoading: isLoadingZones
  } = useBuildingZonesByFacilityQuery(selectedFacility ? String(selectedFacility) : undefined);

  // Fetch building data for edit mode using our custom hook
  const {
    data: buildingData,
    isLoading: isLoadingBuilding,
    isError: isBuildingError,
    error: buildingError
  } = useBuildingQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createBuildingMutation = useCreateBuilding();
  const updateBuildingMutation = useUpdateBuilding(id);

  // Handle building data loading
  useEffect(() => {
    if (buildingData && isEditMode) {
      buildingForm.reset({
        code: buildingData.code,
        name: buildingData.name,
        facility: buildingData.facility,
        zone: buildingData.zone,
        status: buildingData.status,
      });
    }
  }, [buildingData, isEditMode, buildingForm]);

  // Reset zone when facility changes
  useEffect(() => {
    if (selectedFacility && !isEditMode) {
      buildingForm.setValue('zone', 0);
    }
  }, [selectedFacility, isEditMode, buildingForm]);

  const onSubmitBuilding = (data: BuildingFormValues) => {
    if (isEditMode && id) {
      updateBuildingMutation.mutate(
        { id, building: data },
        { onSuccess: () => navigate('/dashboard/facility/buildings') }
      );
    } else {
      createBuildingMutation.mutate(
        data as Omit<Building, 'id'>,
        { onSuccess: () => navigate('/dashboard/facility/buildings') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/facility/buildings');
  };

  if (isEditMode && isLoadingBuilding) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('building.form.loading')}</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isBuildingError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('building.form.error')}</div>
        <p className="text-sm text-muted-foreground mb-4">
          {buildingError instanceof Error ? buildingError.message : t('building.detail.errorFallback')}
        </p>
        <Button onClick={handleCancel} variant="outline">
          {t('building.form.backToBuildings')}
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
            {isEditMode ? t('building.form.editTitle') : t('building.form.createTitle')}
          </h1>
        </div>
      </div>

      <Form {...buildingForm}>
        <form onSubmit={buildingForm.handleSubmit(onSubmitBuilding)} className="space-y-6">
          <div className="space-y-4">
            {/* Building Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-200 text-black rounded-t-md">
                <h2 className="text-lg font-medium">{t('building.form.sectionTitle')}</h2>
                <Button variant="ghost" size="sm" className="h-8 text-white bg-gray-500 hover:bg-gray-600 hover:text-white px-3">
                  {t('building.form.toggle')}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={buildingForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('building.form.code')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('building.form.codePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={buildingForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('building.form.name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('building.form.namePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={buildingForm.control}
                    name="facility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('building.form.facility')}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('building.form.facilityPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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

                  <FormField
                    control={buildingForm.control}
                    name="zone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('building.form.zone')}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value ? String(field.value) : ""}
                          disabled={!selectedFacility || isLoadingZones}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={
                                !selectedFacility
                                  ? t('building.form.zonePlaceholderFirst')
                                  : isLoadingZones
                                    ? t('building.form.zonePlaceholderLoading')
                                    : t('building.form.zonePlaceholder')
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {zones.map(zone => (
                              <SelectItem key={zone.id} value={String(zone.id)}>
                                {zone.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={buildingForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('building.form.status')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('building.form.statusPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">{t('building.form.statusOptions.active')}</SelectItem>
                            <SelectItem value="Inactive">{t('building.form.statusOptions.inactive')}</SelectItem>
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
              {t('building.form.cancel')}
            </Button>

            <Button
              type="submit"
              disabled={createBuildingMutation.isPending || updateBuildingMutation.isPending}
            >
              {(createBuildingMutation.isPending || updateBuildingMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? t('building.form.update') : t('building.form.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BuildingForm;
