// src/features/transfer/transfers/TransferForm.tsx
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
import { ArrowLeft, Loader2, CalendarIcon } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Transfer } from '@/types/transfer';
import { useList } from '@/hooks/crud/useCrudOperations';
import { Item } from '@/types/item';
import { useAuth } from '@/contexts/AuthContext';
import { useTransferQuery, useCreateTransfer, useUpdateTransfer } from '@/hooks/transfer/useTransferQueries';
import { useStoresQuery } from '@/hooks/store/useStoreQueries';
import { useAssetCategoriesQuery } from '@/hooks/assetcategory/useAssetCategoryQueries';
import { useAssetSubcategoriesQuery } from '@/hooks/assetsubcategory/useAssetSubcategoryQueries';
import { useUsersQuery } from '@/hooks/user/useUserQueries';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const endpoint1 = 'asset_inventory/api/items/';

const TransferForm = () => {
  const { t } = useTypedTranslation('assets');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!id;

  const transferSchema = z.object({
    type: z.enum(['transfer', 'return']).default('transfer'),
    request_from: z.number().min(1, t('transfer.form.validation.requestFromRequired')),
    required_date: z.string().min(1, t('transfer.form.validation.requiredDateRequired')),
    requested_by: z.number().min(1, t('transfer.form.validation.requestedByRequired')),
    transfer_to: z.number().min(1, t('transfer.form.validation.transferToRequired')),
    category: z.number().min(1, t('transfer.form.validation.categoryRequired')),
    subcategory: z.number().min(1, t('transfer.form.validation.subcategoryRequired')),
    items: z.array(z.number()).min(1, t('transfer.form.validation.itemsRequired')),
    confirmation_required_from: z.array(z.number()).min(1, t('transfer.form.validation.confirmationRequired')),
  });

  type TransferFormValues = z.infer<typeof transferSchema>;

  // Transfer form setup
  const transferForm = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      type: 'transfer',
      request_from: 0,
      required_date: '',
      requested_by: 0,
      transfer_to: 0,
      category: 0,
      subcategory: 0,
      items: [],
      confirmation_required_from: [],
    }
  });

  // Watch category changes to filter subcategories
  const watchedCategory = transferForm.watch('category');

  // Fetch all required data
  const { data: items = [] } = useList<Item>('items', endpoint1);
  const { data: storesData } = useStoresQuery();
  const { data: assetCategoriesData } = useAssetCategoriesQuery();
  const { data: assetSubcategoriesData } = useAssetSubcategoriesQuery();
  const { data: usersData } = useUsersQuery();

  const stores = storesData?.results || [];
  const assetCategories = assetCategoriesData?.results || [];
  const allAssetSubcategories = assetSubcategoriesData?.results || [];
  const users = usersData?.results || [];

  // Filter subcategories based on selected category
  const filteredSubcategories = allAssetSubcategories.filter(
    sub => sub.asset_category === watchedCategory
  );

  // Fetch transfer data for edit mode
  const {
    data: transferData,
    isLoading: isLoadingTransfer,
    isError: isTransferError,
    error: transferError
  } = useTransferQuery(isEditMode ? id : undefined);

  const createTransferMutation = useCreateTransfer();
  const updateTransferMutation = useUpdateTransfer(id);

  // Set current user as requested_by when component loads
  useEffect(() => {
    if (user && user.id) {
      transferForm.setValue('requested_by', Number(user.id));
    }
  }, [user, transferForm]);

  // Reset subcategory when category changes
  useEffect(() => {
    if (watchedCategory) {
      transferForm.setValue('subcategory', 0);
    }
  }, [watchedCategory, transferForm]);

  // Handle transfer data loading
  useEffect(() => {
    if (transferData && isEditMode) {
      transferForm.reset({
        type: transferData.type,
        request_from: transferData.request_from,
        required_date: transferData.required_date,
        requested_by: transferData.requested_by,
        transfer_to: transferData.transfer_to,
        category: transferData.category,
        subcategory: transferData.subcategory,
        items: transferData.items,
        confirmation_required_from: transferData.confirmation_required_from,
      });
    }
  }, [transferData, isEditMode, transferForm]);

  const onSubmitTransfer = (data: TransferFormValues) => {
    console.log(data);
    if (isEditMode && id) {
      updateTransferMutation.mutate(
        { id, transfer: data },
        { onSuccess: () => navigate('/dashboard/asset/transfers') }
      );
    } else {
      createTransferMutation.mutate(
        data as Omit<Transfer, 'id'>,
        { onSuccess: () => navigate('/dashboard/asset/transfers') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/asset/transfers');
  };

  if (isEditMode && isLoadingTransfer) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('transfer.form.loading')}</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isTransferError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('transfer.form.error')}</div>
        <p className="text-sm text-muted-foreground mb-4">
          {transferError instanceof Error ? transferError.message : t('transfer.form.errorFallback')}
        </p>
        <Button onClick={handleCancel} variant="outline">
          {t('transfer.form.backToList')}
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
            {isEditMode ? t('transfer.form.editTitle') : t('transfer.form.createTitle')}
          </h1>
        </div>
      </div>

      <Form {...transferForm}>
        <form onSubmit={transferForm.handleSubmit(onSubmitTransfer)} className="space-y-6">
          <div className="space-y-4">
            {/* Transfer Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-50 text-black rounded-t-md">
                <h2 className="text-lg font-medium">{t('transfer.form.sections.transferDetails')}</h2>
              </CollapsibleTrigger>

              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <FormField
                    control={transferForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('transfer.form.fields.type')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('transfer.form.placeholders.selectType')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="transfer">{t('transfer.form.typeOptions.transfer')}</SelectItem>
                            <SelectItem value="return">{t('transfer.form.typeOptions.return')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={transferForm.control}
                    name="request_from"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('transfer.form.fields.requestFrom')}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('transfer.form.placeholders.selectSourceStore')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stores.map(store => (
                              <SelectItem key={store.id} value={String(store.id)}>
                                {store.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={transferForm.control}
                    name="transfer_to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('transfer.form.fields.transferTo')}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('transfer.form.placeholders.selectDestinationStore')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stores.map(store => (
                              <SelectItem key={store.id} value={String(store.id)}>
                                {store.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <FormField
                    control={transferForm.control}
                    name="requested_by"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('transfer.form.fields.requestedBy')}</FormLabel>
                        <FormControl>
                          <Input
                            value={user ? (user.name || user.email) : t('transfer.form.placeholders.currentUser')}
                            disabled
                            className="bg-gray-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={transferForm.control}
                    name="required_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{t('transfer.form.fields.requiredDate')}</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>{t('transfer.form.placeholders.pickDate')}</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                              disabled={(date) =>
                                date < new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={transferForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('transfer.form.fields.category')}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('transfer.form.placeholders.selectCategory')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {assetCategories.map(category => (
                              <SelectItem key={category.id} value={String(category.id)}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <FormField
                    control={transferForm.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('transfer.form.fields.subcategory')}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value ? String(field.value) : ""}
                          disabled={!watchedCategory}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={
                                !watchedCategory
                                  ? t('transfer.form.placeholders.selectCategoryFirst')
                                  : t('transfer.form.placeholders.selectSubcategory')
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredSubcategories.map(subcategory => (
                              <SelectItem key={subcategory.id} value={String(subcategory.id)}>
                                {subcategory.name}
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
                  control={transferForm.control}
                  name="items"
                  render={() => (
                    <FormItem>
                      <FormLabel>{t('transfer.form.fields.items')}</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto border rounded p-2">
                        {items.map((item) => {
                          const itemId = Number(item.id);
                          const selectedItems = transferForm.watch("items");

                          return (
                            <label key={item.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                              <input
                                type="checkbox"
                                value={itemId}
                                checked={selectedItems.includes(itemId)}
                                onChange={(e) => {
                                  const newValue = Number(e.target.value);
                                  if (e.target.checked) {
                                    transferForm.setValue("items", [...selectedItems, newValue]);
                                  } else {
                                    transferForm.setValue(
                                      "items",
                                      selectedItems.filter((id) => id !== newValue)
                                    );
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-sm">{item.name}</span>
                            </label>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={transferForm.control}
                  name="confirmation_required_from"
                  render={() => (
                    <FormItem>
                      <FormLabel>{t('transfer.form.fields.confirmationFrom')}</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded p-2">
                        {users.map((user) => {
                          const userId = Number(user.id);
                          const selectedUsers = transferForm.watch("confirmation_required_from");

                          return (
                            <label key={user.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                              <input
                                type="checkbox"
                                value={userId}
                                checked={selectedUsers.includes(userId)}
                                onChange={(e) => {
                                  const newValue = Number(e.target.value);
                                  if (e.target.checked) {
                                    transferForm.setValue("confirmation_required_from", [...selectedUsers, newValue]);
                                  } else {
                                    transferForm.setValue(
                                      "confirmation_required_from",
                                      selectedUsers.filter((id) => id !== newValue)
                                    );
                                  }
                                }}
                                className="rounded"
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{user.first_name} {user.last_name}</span>
                                <span className="text-xs text-gray-500">{user.roles}</span>
                              </div>
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

          {/* Form submit buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              {t('transfer.form.cancel')}
            </Button>

            <Button
              type="submit"
              disabled={createTransferMutation.isPending || updateTransferMutation.isPending}
            >
              {(createTransferMutation.isPending || updateTransferMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? t('transfer.form.update') : t('transfer.form.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TransferForm;
