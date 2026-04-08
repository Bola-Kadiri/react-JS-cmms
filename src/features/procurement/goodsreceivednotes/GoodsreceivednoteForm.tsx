// src/features/procurement/goodsreceivednotes/GoodsreceivednoteForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useGoodsreceivednoteQuery, useCreateGoodsreceivednote, useUpdateGoodsreceivednote } from '@/hooks/goodsreceivednote/useGoodsreceivednoteQueries';
import { usePurchaseordersQuery } from '@/hooks/purchaseorder/usePurchaseorderQueries';
import { useVendorsQuery } from '@/hooks/vendor/useVendorQueries';
import { useFacilitiesQuery } from '@/hooks/facility/useFacilityQueries';
import { useUsersQuery } from '@/hooks/user/useUserQueries';

// Form schema definition
const goodsreceivednoteSchema = z.object({
  date_of_receipt: z.string().min(1, "Date of receipt is required"),
  purchase_order: z.number({ required_error: "Purchase order is required" }),
  vendor: z.number({ required_error: "Vendor is required" }),
  delivery_note_number: z.string().min(1, "Delivery note number is required"),
  invoice_number: z.string().min(1, "Invoice number is required"),
  facility: z.number({ required_error: "Facility is required" }),
  received_by: z.number({ required_error: "Received by is required" }),
});

type GoodsreceivednoteFormValues = z.infer<typeof goodsreceivednoteSchema>;

const GoodsreceivednoteForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Goodsreceivednote form setup
  const goodsreceivednoteForm = useForm<GoodsreceivednoteFormValues>({
    resolver: zodResolver(goodsreceivednoteSchema),
    defaultValues: {
      date_of_receipt: new Date().toISOString().split('T')[0],
      purchase_order: undefined as unknown as number,
      vendor: undefined as unknown as number,
      delivery_note_number: '',
      invoice_number: '',
      facility: undefined as unknown as number,
      received_by: undefined as unknown as number,
    }
  });

  // Data fetching hooks
  const { data: purchaseordersResponse } = usePurchaseordersQuery();
  const purchaseorders = purchaseordersResponse?.results || [];
  
  const { data: vendorsResponse } = useVendorsQuery();
  const vendors = vendorsResponse?.results || [];
  
  const { data: facilitiesResponse } = useFacilitiesQuery();
  const facilities = facilitiesResponse?.results || [];
  
  const { data: usersResponse } = useUsersQuery();
  const users = usersResponse?.results || [];

  // Fetch goodsreceivednote data for edit mode
  const { 
    data: goodsreceivednoteData, 
    isLoading: isLoadingGoodsreceivednote, 
    isError: isGoodsreceivednoteError,
    error: goodsreceivednoteError
  } = useGoodsreceivednoteQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createGoodsreceivednote = useCreateGoodsreceivednote();
  const updateGoodsreceivednote = useUpdateGoodsreceivednote(id);

  // Handle goodsreceivednote data loading
  useEffect(() => {
    if (goodsreceivednoteData && isEditMode) {
      goodsreceivednoteForm.reset({
        date_of_receipt: goodsreceivednoteData.date_of_receipt || new Date().toISOString().split('T')[0],
        purchase_order: goodsreceivednoteData.purchase_order,
        vendor: goodsreceivednoteData.vendor,
        delivery_note_number: goodsreceivednoteData.delivery_note_number || '',
        invoice_number: goodsreceivednoteData.invoice_number || '',
        facility: goodsreceivednoteData.facility,
        received_by: goodsreceivednoteData.received_by,
      });
    }
  }, [goodsreceivednoteData, isEditMode, goodsreceivednoteForm]);

  // Handle error state
  useEffect(() => {
    if (isGoodsreceivednoteError && isEditMode) {
      console.error('Error loading goods received note:', goodsreceivednoteError);
    }
  }, [isGoodsreceivednoteError, goodsreceivednoteError, isEditMode]);

  // Form submission handler
  const onSubmit = async (values: GoodsreceivednoteFormValues) => {
    try {
      if (isEditMode) {
        await updateGoodsreceivednote.mutateAsync({
          id: id as string,
          goodsreceivednote: values
        });
        navigate(`/dashboard/procurement/goods-received-note/view/${id}`);
      } else {
        const result = await createGoodsreceivednote.mutateAsync(values);
        navigate(`/dashboard/procurement/goods-received-note/view/${result.id}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/procurement/goods-received-note');
  };

  if (isEditMode && isLoadingGoodsreceivednote) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="hover:bg-emerald-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Goods Received Note' : 'Create Goods Received Note'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEditMode ? 'Update GRN information' : 'Enter GRN details'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <Form {...goodsreceivednoteForm}>
          <form onSubmit={goodsreceivednoteForm.handleSubmit(onSubmit)} className="space-y-6">
            {/* Date of Receipt */}
            <FormField
              control={goodsreceivednoteForm.control}
              name="date_of_receipt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Date of Receipt *</FormLabel>
                  <FormControl>
                    <Input 
                      type="date"
                      {...field}
                      className="border-gray-300 focus:border-emerald-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Purchase Order and Vendor Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Purchase Order */}
              <FormField
                control={goodsreceivednoteForm.control}
                name="purchase_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Purchase Order *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select purchase order" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {purchaseorders.map((po) => (
                          <SelectItem key={po.id} value={po.id.toString()}>
                            PO #{po.id} - {po.type || 'N/A'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Vendor */}
              <FormField
                control={goodsreceivednoteForm.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Vendor *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id.toString()}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Delivery Note and Invoice Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Delivery Note Number */}
              <FormField
                control={goodsreceivednoteForm.control}
                name="delivery_note_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Delivery Note Number *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., DN-001" 
                        {...field}
                        className="border-gray-300 focus:border-emerald-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Invoice Number */}
              <FormField
                control={goodsreceivednoteForm.control}
                name="invoice_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Invoice Number *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., INV-001" 
                        {...field}
                        className="border-gray-300 focus:border-emerald-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Facility and Received By Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Facility */}
              <FormField
                control={goodsreceivednoteForm.control}
                name="facility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Facility *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select facility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {facilities.map((facility) => (
                          <SelectItem key={facility.id} value={facility.id.toString()}>
                            {facility.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Received By */}
              <FormField
                control={goodsreceivednoteForm.control}
                name="received_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Received By *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select receiver" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.email || `${user.first_name} ${user.last_name}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createGoodsreceivednote.isPending || updateGoodsreceivednote.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {(createGoodsreceivednote.isPending || updateGoodsreceivednote.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? 'Update' : 'Create'} GRN
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default GoodsreceivednoteForm;

