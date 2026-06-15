// src/features/asset/apartments/ApartmentForm.tsx
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
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Apartment } from '@/types/apartment';
import { Building } from '@/types/building';
import { Landlord } from '@/types/landlord';
import { useApartmentQuery, useCreateApartment, useUpdateApartment } from '@/hooks/apartment/useApartmentQueries';
import { useList } from '@/hooks/crud/useCrudOperations';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const buildingEndpoint = 'facility/api/api/buildings/';
const landlordEndpoint = 'facility/api/api/landlords/';

const ApartmentForm = () => {
  const { t } = useTypedTranslation('facility');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Form schema definition (inside component so t() is in scope)
  const apartmentSchema = z.object({
    no: z.string().min(1, t('apartment.form.validation.noRequired')),
    type: z.string().min(1, t('apartment.form.validation.typeRequired')),
    building: z.number().positive(t('apartment.form.validation.buildingRequired')),
    no_of_sqm: z.number().positive(t('apartment.form.validation.sqmPositive')),
    description: z.string().optional(),
    landlord: z.number().positive(t('apartment.form.validation.landlordRequired')),
    ownership_type: z.enum(["Freehold", "Leasehold", "Freehold (Leased Out)"]),
    service_power_charge_start_date: z.string(),
    address: z.string().min(1, t('apartment.form.validation.addressRequired')),
    bookable: z.boolean().default(false),
    common_area: z.boolean().default(false),
    available_for_lease: z.boolean().default(false),
    remit_lease_payment: z.boolean().default(false),
    status: z.enum(["Active", "Inactive"])
  });
  type ApartmentFormValues = z.infer<typeof apartmentSchema>;
  const isEditMode = !!id;
  
  // Apartment form setup
  const apartmentForm = useForm<ApartmentFormValues>({
    resolver: zodResolver(apartmentSchema),
    defaultValues: {
      no: '',
      type: '',
      building: undefined as unknown as number,
      no_of_sqm: undefined as unknown as number,
      description: '',
      landlord: undefined as unknown as number,
      ownership_type: 'Freehold',
      service_power_charge_start_date: new Date().toISOString().split('T')[0],
      address: '',
      bookable: false,
      common_area: false,
      available_for_lease: false,
      remit_lease_payment: false,
      status: 'Active'
    }
  });

  const { data: buildings = [] } = useList<Building>('buildings', buildingEndpoint);
  const { data: landlords = [] } = useList<Landlord>('landlords', landlordEndpoint);

  // Fetch apartment data for edit mode using our custom hook
  const { 
    data: apartmentData, 
    isLoading: isLoadingApartment, 
    isError: isApartmentError,
    error: apartmentError
  } = useApartmentQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createApartmentMutation = useCreateApartment();
  const updateApartmentMutation = useUpdateApartment(id);

  // Handle apartment data loading
  useEffect(() => {
    if (apartmentData && isEditMode) {
      // Reset the form with apartment data
      apartmentForm.reset({
        no: apartmentData.no,
        type: apartmentData.type,
        building: apartmentData.building,
        no_of_sqm: apartmentData.no_of_sqm,
        description: apartmentData.description,
        landlord: apartmentData.landlord,
        ownership_type: apartmentData.ownership_type,
        service_power_charge_start_date: apartmentData.service_power_charge_start_date,
        address: apartmentData.address,
        bookable: apartmentData.bookable,
        common_area: apartmentData.common_area,
        available_for_lease: apartmentData.available_for_lease,
        remit_lease_payment: apartmentData.remit_lease_payment,
        status: apartmentData.status
      });
    }
  }, [apartmentData, isEditMode, apartmentForm]);

  const onSubmitApartment = (data: ApartmentFormValues) => {
    if (isEditMode && id) {
      updateApartmentMutation.mutate(
        { id, apartment: data },
        { onSuccess: () => navigate('/facility/apartments') }
      );
    } else {
      createApartmentMutation.mutate(
        data as Omit<Apartment, 'id'>,
        { onSuccess: () => navigate('/facility/apartments') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/facility/apartments');
  };

  if (isEditMode && isLoadingApartment) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('apartment.form.loading')}</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isApartmentError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('apartment.form.error')}</div>
        <p className="text-sm text-muted-foreground mb-4">
          {apartmentError instanceof Error ? apartmentError.message : t('apartment.form.errorFallback')}
        </p>
        <Button onClick={handleCancel} variant="outline">
          {t('apartment.form.backToApartments')}
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
            {isEditMode ? t('apartment.form.editTitle') : t('apartment.form.createTitle')}
          </h1>
        </div>
      </div>

      <Form {...apartmentForm}>
        <form onSubmit={apartmentForm.handleSubmit(onSubmitApartment)} className="space-y-6">
          <div className="space-y-4">
            {/* Apartment Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-50 border-2 border-gray-100 text-black rounded-t-md">
                <h2 className="text-lg font-medium">{t('apartment.form.sectionTitle')}</h2>
              </CollapsibleTrigger>

              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={apartmentForm.control}
                    name="no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('apartment.form.no')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('apartment.form.noPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={apartmentForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('apartment.form.type')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('apartment.form.typePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={apartmentForm.control}
                    name="building"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('apartment.form.building')}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('apartment.form.buildingPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {buildings.map(building => (
                              <SelectItem key={building.id} value={String(building.id)}>
                                {building.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={apartmentForm.control}
                    name="no_of_sqm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('apartment.form.noOfSqm')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={t('apartment.form.noOfSqmPlaceholder')}
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={apartmentForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('apartment.form.address')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('apartment.form.addressPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={apartmentForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('apartment.form.description')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('apartment.form.descriptionPlaceholder')}
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
                    control={apartmentForm.control}
                    name="landlord"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('apartment.form.landlord')}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('apartment.form.landlordPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {landlords.map(landlord => (
                              <SelectItem key={landlord.id} value={String(landlord.id)}>
                                {landlord.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={apartmentForm.control}
                    name="ownership_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('apartment.form.ownershipType')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('apartment.form.ownershipTypePlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Freehold">{t('apartment.form.ownershipTypeOptions.freehold')}</SelectItem>
                            <SelectItem value="Leasehold">{t('apartment.form.ownershipTypeOptions.leasehold')}</SelectItem>
                            <SelectItem value="Freehold (Leased Out)">{t('apartment.form.ownershipTypeOptions.freeholdLeasedOut')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={apartmentForm.control}
                    name="service_power_charge_start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('apartment.form.servicePowerChargeStartDate')}</FormLabel>
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
                    control={apartmentForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('apartment.form.status')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('apartment.form.statusPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">{t('apartment.form.statusOptions.active')}</SelectItem>
                            <SelectItem value="Inactive">{t('apartment.form.statusOptions.inactive')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={apartmentForm.control}
                    name="bookable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t('apartment.form.bookable')}</FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={apartmentForm.control}
                    name="common_area"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t('apartment.form.commonArea')}</FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={apartmentForm.control}
                    name="available_for_lease"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t('apartment.form.availableForLease')}</FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={apartmentForm.control}
                    name="remit_lease_payment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t('apartment.form.remitLeasePayment')}</FormLabel>
                        </div>
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
              disabled={createApartmentMutation.isPending || updateApartmentMutation.isPending}
            >
              {(createApartmentMutation.isPending || updateApartmentMutation.isPending) && (
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

export default ApartmentForm;