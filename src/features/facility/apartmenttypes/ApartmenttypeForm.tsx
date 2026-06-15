// src/features/facility/apartmenttypes/ApartmenttypeForm.tsx
import { useState, useEffect } from 'react';
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
import { Apartmenttype } from '@/types/apartmenttype';
import { useApartmenttypeQuery, useCreateApartmenttype, useUpdateApartmenttype } from '@/hooks/apartmenttype/useApartmenttypeQueries';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const ApartmenttypeForm = () => {
  const { t } = useTypedTranslation('facility');
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Form schema definition (inside component so t() is in scope)
  const apartmenttypeSchema = z.object({
    name: z.string().min(1, t('apartmentType.form.validation.nameRequired')),
    status: z.enum(['Active', 'Inactive'], {
      required_error: t('apartmentType.form.validation.statusRequired'),
    }),
  });
  type ApartmenttypeFormValues = z.infer<typeof apartmenttypeSchema>;
  const isEditMode = !!slug;
  
  // Apartmenttype form setup
  const apartmenttypeForm = useForm<ApartmenttypeFormValues>({
    resolver: zodResolver(apartmenttypeSchema),
    defaultValues: {
      name: '',
      status: 'Active',
    }
  });

  // Fetch apartmenttype data for edit mode using our custom hook
  const { 
    data: apartmenttypeData, 
    isLoading: isLoadingApartmenttype, 
    isError: isApartmenttypeError,
    error: apartmenttypeError
  } = useApartmenttypeQuery(isEditMode ? slug : undefined);

  // Use our custom mutation hooks
  const createApartmenttypeMutation = useCreateApartmenttype();
  const updateApartmenttypeMutation = useUpdateApartmenttype(slug);

  // Handle apartmenttype data loading
  useEffect(() => {
    if (apartmenttypeData && isEditMode) {
      // Reset the form with apartmenttype data
      apartmenttypeForm.reset({
        name: apartmenttypeData.name,
        status: apartmenttypeData.status as 'Active' | 'Inactive',
      });
    }
  }, [apartmenttypeData, isEditMode, apartmenttypeForm]);

  const onSubmitApartmenttype = (data: ApartmenttypeFormValues) => {
    if (isEditMode && slug) {
      updateApartmenttypeMutation.mutate(
        { slug, apartmenttype: data },
        { onSuccess: () => navigate('/facility/apartment-type') }
      );
    } else {
      createApartmenttypeMutation.mutate(
        data as Omit<Apartmenttype, 'id'>,
        { onSuccess: () => navigate('/facility/apartment-type') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/facility/apartment-type');
  };

  if (isEditMode && isLoadingApartmenttype) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('apartmentType.form.loading')}</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isApartmenttypeError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('apartmentType.form.error')}</div>
        <p className="text-sm text-muted-foreground mb-4">
          {apartmenttypeError instanceof Error ? apartmenttypeError.message : t('apartmentType.form.errorFallback')}
        </p>
        <Button onClick={handleCancel} variant="outline">
          {t('apartmentType.form.backToApartmentTypes')}
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
            {isEditMode ? t('apartmentType.form.editTitle') : t('apartmentType.form.createTitle')}
          </h1>
        </div>
      </div>

      <Form {...apartmenttypeForm}>
        <form onSubmit={apartmenttypeForm.handleSubmit(onSubmitApartmenttype)} className="space-y-6">
          <div className="space-y-4">
            {/* Apartmenttype Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-50 border-2 border-gray-100 text-black rounded-t-md">
                <h2 className="text-lg font-medium">{t('apartmentType.form.sectionTitle')}</h2>
              </CollapsibleTrigger>

              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid gap-4">
                  <FormField
                    control={apartmenttypeForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('apartmentType.form.name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('apartmentType.form.namePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={apartmenttypeForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('apartmentType.form.status')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('apartmentType.form.statusPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">{t('apartmentType.form.statusOptions.active')}</SelectItem>
                            <SelectItem value="Inactive">{t('apartmentType.form.statusOptions.inactive')}</SelectItem>
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
              {t('common:actions.cancel')}
            </Button>

            <Button
              type="submit"
              disabled={createApartmenttypeMutation.isPending || updateApartmenttypeMutation.isPending}
            >
              {(createApartmenttypeMutation.isPending || updateApartmenttypeMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? t('common:actions.update') : t('common:actions.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ApartmenttypeForm;