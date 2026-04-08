import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, Plus, Trash2, Package } from 'lucide-react';
import { ItemRequest, ItemRequestItem } from '@/types/itemrequest';
import { useItemRequestQuery, useCreateItemRequest, useUpdateItemRequest } from '@/hooks/itemrequest/useItemRequestQueries';
import { useStoresQuery } from '@/hooks/store/useStoreQueries';
import { useAssetCategoriesQuery } from '@/hooks/assetcategory/useAssetCategoryQueries';
import { useAssetSubcategoriesQuery } from '@/hooks/assetsubcategory/useAssetSubcategoryQueries';
import { useUsersQuery } from '@/hooks/user/useUserQueries';
import { useDepartmentsQuery } from '@/hooks/department/useDepartmentQueries';
import { useFacilitiesQuery } from '@/hooks/facility/useFacilityQueries';
import { useBuildingsQuery } from '@/hooks/building/useBuildingQueries';
import { useModels } from '@/hooks/model/useModelQueries';
import { useItemsQuery } from '@/hooks/item/useItemQueries';
import { useAuth } from '@/contexts/AuthContext';
import { ItemRequestCreatePayload } from '@/services/itemRequestApi';

// Form schema definition
const itemRequestItemSchema = z.object({
  item_id: z.number().min(1, 'Item is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  description: z.string().min(1, 'Description is required'),
  category: z.number().min(1, 'Category is required'),
  subcategory: z.number().min(1, 'Subcategory is required'),
  model: z.number().min(1, 'Model is required'),
});

const itemRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  request_from: z.number().min(1, 'Request from is required'),
  requested_by: z.number().min(1, 'Requested by is required'),
  required_date: z.string().min(1, 'Required date is required'),
  department: z.number().optional(),
  type: z.enum(['for_use', 'for_store'], { required_error: 'Type is required' }),
  facility: z.number().optional(),
  building: z.number().optional(),
  approved_by: z.number().min(1, 'Approved by is required'),
  description: z.string().min(1, 'Description is required'),
  comment: z.string().min(1, 'Comment is required'),
  items: z.array(itemRequestItemSchema).min(1, 'At least one item is required'),
});

type ItemRequestFormValues = z.infer<typeof itemRequestSchema>;

const ItemRequestForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!id;
  
  const [selectedFacility, setSelectedFacility] = useState<number | undefined>();
  
  // Form setup
  const form = useForm<ItemRequestFormValues>({
    resolver: zodResolver(itemRequestSchema),
    defaultValues: {
      name: '',
      request_from: 0,
      requested_by: Number(user?.id) || 0,
      required_date: '',
      department: undefined,
      type: 'for_use',
      facility: undefined,
      building: undefined,
      approved_by: 0,
      description: '',
      comment: '',
      items: [{ item_id: 0, quantity: 1, description: '', category: 0, subcategory: 0, model: 0 }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  });

  const watchType = form.watch('type');
  const watchSelectedCategory = form.watch('items');

  // Fetch data for dropdowns
  const { data: storesData, isLoading: isLoadingStores } = useStoresQuery();
  const { data: usersData, isLoading: isLoadingUsers } = useUsersQuery();
  const { data: departmentsData, isLoading: isLoadingDepartments } = useDepartmentsQuery();
  const { data: facilitiesData, isLoading: isLoadingFacilities } = useFacilitiesQuery();
  const { data: buildingsData, isLoading: isLoadingBuildings } = useBuildingsQuery();
  const { data: assetCategoriesData, isLoading: isLoadingAssetCategories } = useAssetCategoriesQuery();
  const { data: assetSubcategoriesData, isLoading: isLoadingAssetSubcategories } = useAssetSubcategoriesQuery();
  const { data: modelsData, isLoading: isLoadingModels } = useModels();
  const { data: itemsData, isLoading: isLoadingItems } = useItemsQuery();

  // Fetch item request data for edit mode
  const { 
    data: itemRequestData, 
    isLoading: isLoadingItemRequest, 
    isError: isItemRequestError,
    error: itemRequestError
  } = useItemRequestQuery(isEditMode ? id : undefined);

  // Mutation hooks
  const createItemRequestMutation = useCreateItemRequest();
  const updateItemRequestMutation = useUpdateItemRequest(id);

  // Handle item request data loading for edit mode
  useEffect(() => {
    if (itemRequestData && isEditMode) {
      form.reset({
        name: itemRequestData.name,
        request_from: itemRequestData.request_from,
        requested_by: itemRequestData.requested_by,
        required_date: itemRequestData.required_date,
        department: itemRequestData.department,
        type: itemRequestData.type,
        facility: itemRequestData.facility,
        building: itemRequestData.building,
        approved_by: itemRequestData.approved_by,
        description: itemRequestData.description,
        comment: itemRequestData.comment,
        items: itemRequestData.items || [{ item_id: 0, quantity: 1, description: '', category: 0, subcategory: 0, model: 0 }],
      });
      setSelectedFacility(itemRequestData.facility);
    }
  }, [itemRequestData, isEditMode, form]);

  // Filter buildings based on selected facility
  const filteredBuildings = buildingsData?.results?.filter(building => 
    selectedFacility ? building.facility === selectedFacility : true
  ) || [];

  const onSubmit = (data: ItemRequestFormValues) => {
    // Ensure all required fields are properly typed and present
    const formattedData: ItemRequestCreatePayload = {
      name: data.name,
      description: data.description,
      request_from: data.request_from,
      required_date: data.required_date,
      requested_by: Number(user?.id) || data.requested_by,
      department: data.department,
      type: data.type,
      facility: data.facility,
      building: data.building,
      comment: data.comment,
      approved_by: data.approved_by,
      items: data.items.map(item => ({
        item_id: item.item_id,
        quantity: item.quantity,
        description: item.description,
        category: item.category,
        subcategory: item.subcategory,
        model: item.model
      }))
    };
    
    if (isEditMode && id) {
      updateItemRequestMutation.mutate(
        { id, itemRequest: formattedData },
        { onSuccess: () => navigate('/dashboard/asset/item-requests') }
      );
    } else {
      createItemRequestMutation.mutate(
        formattedData,
        { onSuccess: () => navigate('/dashboard/asset/item-requests') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/asset/item-requests');
  };

  const addItem = () => {
    append({ item_id: 0, quantity: 1, description: '', category: 0, subcategory: 0, model: 0 });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Get filtered subcategories for a specific item
  const getFilteredSubcategories = (categoryId: number) => {
    return assetSubcategoriesData?.results?.filter(subcategory => 
      subcategory.asset_category === categoryId
    ) || [];
  };

  if (isEditMode && isLoadingItemRequest) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-muted-foreground">Loading item request details...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isItemRequestError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-lg font-medium">Error loading item request details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {itemRequestError instanceof Error ? itemRequestError.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleCancel} variant="outline">
          Back to Item Requests
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Item Request' : 'Create Item Request'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditMode ? 'Update item request information' : 'Fill in the details to create a new item request'}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter request name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Request From */}
                <FormField
                  control={form.control}
                  name="request_from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Request From *</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value ? String(field.value) : ''}
                          onValueChange={(value) => field.onChange(Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select store" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingStores ? (
                              <SelectItem value="loading" disabled>Loading stores...</SelectItem>
                            ) : (
                              storesData?.results?.map((store) => (
                                <SelectItem key={store.id} value={String(store.id)}>
                                  {store.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Requested By */}
                <FormField
                  control={form.control}
                  name="requested_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Requested By *</FormLabel>
                      <FormControl>
                        <Input 
                          value={user ? `${user.name || user.email} (${user.email})` : ''}
                          disabled
                          className="bg-gray-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Required Date */}
                <FormField
                  control={form.control}
                  name="required_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Required Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Department - Always shown */}
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Department</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value ? String(field.value) : ''}
                          onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingDepartments ? (
                              <SelectItem value="loading" disabled>Loading departments...</SelectItem>
                            ) : (
                              departmentsData?.results?.map((dept) => (
                                <SelectItem key={dept.id} value={String(dept.id)}>
                                  {dept.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Type *</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="for_use">For Use</SelectItem>
                            <SelectItem value="for_store">For Store</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Facility - Only for "for_use" */}
                {watchType === 'for_use' && (
                  <FormField
                    control={form.control}
                    name="facility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Facility</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value ? String(field.value) : ''}
                            onValueChange={(value) => {
                              const facilityId = value ? Number(value) : undefined;
                              field.onChange(facilityId);
                              setSelectedFacility(facilityId);
                              form.setValue('building', undefined);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select facility" />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingFacilities ? (
                                <SelectItem value="loading" disabled>Loading facilities...</SelectItem>
                              ) : (
                                facilitiesData?.results?.map((facility) => (
                                  <SelectItem key={facility.id} value={String(facility.id)}>
                                    {facility.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Building - Only for "for_use" and when facility is selected */}
                {watchType === 'for_use' && selectedFacility && (
                  <FormField
                    control={form.control}
                    name="building"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Building</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value ? String(field.value) : ''}
                            onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select building" />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingBuildings ? (
                                <SelectItem value="loading" disabled>Loading buildings...</SelectItem>
                              ) : (
                                filteredBuildings.map((building) => (
                                  <SelectItem key={building.id} value={String(building.id)}>
                                    {building.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Approved By */}
                <FormField
                  control={form.control}
                  name="approved_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Approved By *</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value ? String(field.value) : ''}
                          onValueChange={(value) => field.onChange(Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select approver" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingUsers ? (
                              <SelectItem value="loading" disabled>Loading users...</SelectItem>
                            ) : (
                              usersData?.results?.map((user) => (
                                <SelectItem key={user.id} value={String(user.id)}>
                                  <div>
                                    <div className="font-medium">{user.first_name} {user.last_name}</div>
                                    <div className="text-xs text-muted-foreground">{user.roles}</div>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter request description" 
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Comment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Additional Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Comment *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter additional comments or special instructions" 
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Items Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  Requested Items
                </CardTitle>
                <Button 
                  type="button" 
                  onClick={addItem}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-900">Item {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Item */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.item_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Item *</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value ? String(field.value) : ''}
                              onValueChange={(value) => field.onChange(Number(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select item" />
                              </SelectTrigger>
                              <SelectContent>
                                {isLoadingItems ? (
                                  <SelectItem value="loading" disabled>Loading items...</SelectItem>
                                ) : (
                                  itemsData?.results?.map((item) => (
                                    <SelectItem key={item.id} value={String(item.id)}>
                                      {item.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Quantity */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Quantity *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              placeholder="1" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Category */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.category`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Category *</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value ? String(field.value) : ''}
                              onValueChange={(value) => {
                                field.onChange(Number(value));
                                form.setValue(`items.${index}.subcategory`, 0);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {isLoadingAssetCategories ? (
                                  <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                                ) : (
                                  assetCategoriesData?.results?.map((category) => (
                                    <SelectItem key={category.id} value={String(category.id)}>
                                      {category.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Subcategory */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.subcategory`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Subcategory *</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value ? String(field.value) : ''}
                              onValueChange={(value) => field.onChange(Number(value))}
                              disabled={!watchSelectedCategory[index]?.category}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select subcategory" />
                              </SelectTrigger>
                              <SelectContent>
                                {isLoadingAssetSubcategories ? (
                                  <SelectItem value="loading" disabled>Loading subcategories...</SelectItem>
                                ) : (
                                  getFilteredSubcategories(watchSelectedCategory[index]?.category || 0).map((subcategory) => (
                                    <SelectItem key={subcategory.id} value={String(subcategory.id)}>
                                      {subcategory.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Model */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.model`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Model *</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value ? String(field.value) : ''}
                              onValueChange={(value) => field.onChange(Number(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select model" />
                              </SelectTrigger>
                              <SelectContent>
                                {isLoadingModels ? (
                                  <SelectItem value="loading" disabled>Loading models...</SelectItem>
                                ) : (
                                  modelsData?.results?.map((model) => (
                                    <SelectItem key={model.id} value={String(model.id)}>
                                      {model.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Item Description */}
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Item Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the specific item requirements" 
                              rows={2}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={
                    createItemRequestMutation.isPending || 
                    updateItemRequestMutation.isPending
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  {createItemRequestMutation.isPending || updateItemRequestMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    isEditMode ? 'Update Request' : 'Create Request'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default ItemRequestForm; 