// src/features/facility/regions/RegionForm.tsx
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
import { Region } from '@/types/region';
import { useList } from '@/hooks/crud/useCrudOperations';
import { User } from '@/types/user';
import { useRegionQuery, useCreateRegion, useUpdateRegion } from '@/hooks/region/useRegionQueries';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const userEndpoint = 'accounts/api/users/';

const RegionForm = () => {
  const { t } = useTypedTranslation('facility');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Schema defined inside component so validation messages are translated
  const regionSchema = z.object({
    name: z.string().min(1, t('region.form.validation.nameRequired')),
    country: z.string().min(1, t('region.form.validation.countryRequired')),
    select_manager: z.number().min(1, t('region.form.validation.managerRequired')),
  });

  type RegionFormValues = z.infer<typeof regionSchema>;

  // Region form setup
  const regionForm = useForm<RegionFormValues>({
    resolver: zodResolver(regionSchema),
    defaultValues: {
      name: '',
      country: '',
      select_manager: 0,
    }
  });

  // Fetch all users
  const { data: users = [] } = useList<User>('users', userEndpoint);

  // Fetch region data for edit mode using our custom hook
  const {
    data: regionData,
    isLoading: isLoadingRegion,
    isError: isRegionError,
    error: regionError
  } = useRegionQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createRegionMutation = useCreateRegion();
  const updateRegionMutation = useUpdateRegion(id);

  // Handle region data loading
  useEffect(() => {
    if (regionData && isEditMode) {
      regionForm.reset({
        name: regionData.name,
        country: regionData.country,
        select_manager: regionData.select_manager,
      });
    }
  }, [regionData, isEditMode, regionForm]);

  const onSubmitRegion = (data: RegionFormValues) => {
    if (isEditMode && id) {
      updateRegionMutation.mutate(
        { id, region: data },
        { onSuccess: () => navigate('/dashboard/facility/regions') }
      );
    } else {
      createRegionMutation.mutate(
        data as Omit<Region, 'id'>,
        { onSuccess: () => navigate('/dashboard/facility/regions') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/facility/regions');
  };

  if (isEditMode && isLoadingRegion) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('region.form.loading')}</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isRegionError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('region.form.error')}</div>
        <p className="text-sm text-muted-foreground mb-4">
          {regionError instanceof Error ? regionError.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleCancel} variant="outline">
          {t('region.form.backToRegions')}
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
            {isEditMode ? t('region.form.editTitle') : t('region.form.createTitle')}
          </h1>
        </div>
      </div>

      <Form {...regionForm}>
        <form onSubmit={regionForm.handleSubmit(onSubmitRegion)} className="space-y-6">
          <div className="space-y-4">
            {/* Region Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-200 text-black rounded-t-md">
                <h2 className="text-lg font-medium">{t('region.form.sectionTitle')}</h2>
                <Button variant="ghost" size="sm" className="h-8 text-white bg-gray-500 hover:bg-gray-600 hover:text-white px-3">
                  {t('region.form.toggle')}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={regionForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('region.form.name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('region.form.namePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={regionForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('region.form.country')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('region.form.countryPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={regionForm.control}
                    name="select_manager"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('region.form.manager')}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('region.form.managerPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users.map(user => (
                              <SelectItem key={user.id} value={String(user.id)}>
                                {user.first_name} {user.last_name}
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
              {t('region.form.cancel')}
            </Button>

            <Button
              type="submit"
              disabled={createRegionMutation.isPending || updateRegionMutation.isPending}
            >
              {(createRegionMutation.isPending || updateRegionMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? t('region.form.update') : t('region.form.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RegionForm;
