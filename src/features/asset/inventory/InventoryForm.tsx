// src/features/inventory/inventories/InventoryForm.tsx
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Inventory } from '@/types/inventory';
import { useAssetCategoriesQuery } from '@/hooks/assetcategory/useAssetCategoryQueries';
import { useAssetSubcategoriesQuery } from '@/hooks/assetsubcategory/useAssetSubcategoryQueries';
import { useVendorsQuery } from '@/hooks/vendor/useVendorQueries';
import { useFacilitiesQuery } from '@/hooks/facility/useFacilityQueries';
import { useInventoryTypesQuery } from '@/hooks/inventorytype/useInventoryTypeQueries';
import { useModels } from '@/hooks/model/useModelQueries';
import { useInventoryQuery, useCreateInventory, useUpdateInventory } from '@/hooks/inventory/useInventoryQueries';
import { AssetSubcategory } from '@/types/assetsubcategory';
import { Model } from '@/types/model';

// Form schema definition matching the Inventory interface
const inventorySchema = z.object({
  type: z.number().min(1, 'Type is required'),
  category: z.number().min(1, 'Category is required'),
  subcategory: z.number().min(1, 'Subcategory is required'),
  model: z.number().min(1, 'Model is required'),
  part_no: z.string().min(1, 'Part number is required'),
  tag: z.string().min(1, 'Tag is required'),
  serial_number: z.string().min(1, 'Serial number is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.string().min(1, 'Unit price is required'),
  log_value: z.string().optional(),
  vendor: z.number().min(1, 'Vendor is required'),
  purchase_number: z.string().min(1, 'Purchase number is required'),
  purchase_date: z.string().min(1, 'Purchase date is required'),
  manufacture_date: z.string().optional(),
  expiry_date: z.string().optional(),
  warranty_end_date: z.string().optional(),
  facility: z.number().min(1, 'Facility is required'),
  reorder_level: z.number().min(0, 'Reorder level must be 0 or greater'),
  minimum_stock: z.number().min(0, 'Minimum stock must be 0 or greater'),
  max_stock: z.number().min(0, 'Maximum stock must be 0 or greater'),
  flags: z.string().optional(),
  status: z.enum(['Available', 'Low Stock', 'Out of Stock', 'Discontinued']).default('Available'),
  total_value: z.string().optional(),
});

type InventoryFormValues = z.infer<typeof inventorySchema>;

const InventoryForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // State for filtered subcategories
  const [filteredSubcategories, setFilteredSubcategories] = useState<AssetSubcategory[]>([]);

  // Inventory form setup
  const inventoryForm = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      type: 0,
      category: 0,
      subcategory: 0,
      model: 0,
      part_no: '',
      tag: '',
      serial_number: '',
      quantity: 1,
      unit_price: '',
      log_value: '',
      vendor: 0,
      purchase_number: '',
      purchase_date: '',
      manufacture_date: '',
      expiry_date: '',
      warranty_end_date: '',
      facility: 0,
      reorder_level: 0,
      minimum_stock: 0,
      max_stock: 0,
      flags: '',
      status: 'Available',
      total_value: '',
    }
  });

  // Fetch data for dropdowns
  const { data: inventoryTypesResponse } = useInventoryTypesQuery();
  const { data: modelsResponse } = useModels();
  const { data: assetCategoriesResponse } = useAssetCategoriesQuery();
  const { data: assetSubcategoriesResponse } = useAssetSubcategoriesQuery();
  const { data: vendorsResponse } = useVendorsQuery();
  const { data: facilitiesResponse } = useFacilitiesQuery();

  const inventoryTypes = inventoryTypesResponse?.results || [];
  const models = modelsResponse?.results || [];
  const assetCategories = assetCategoriesResponse?.results || [];
  const assetSubcategories = assetSubcategoriesResponse?.results || [];
  const vendors = vendorsResponse?.results || [];
  const facilities = facilitiesResponse?.results || [];

  // Fetch inventory data for edit mode using our custom hook
  const { 
    data: inventoryData, 
    isLoading: isLoadingInventory, 
    isError: isInventoryError,
    error: inventoryError
  } = useInventoryQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createInventoryMutation = useCreateInventory();
  const updateInventoryMutation = useUpdateInventory(id);

  // Watch category changes to update subcategories
  const selectedCategory = inventoryForm.watch('category');
  const selectedQuantity = inventoryForm.watch('quantity');
  const selectedUnitPrice = inventoryForm.watch('unit_price');

  // Update subcategories when category changes
  useEffect(() => {
    if (selectedCategory && assetSubcategories.length > 0) {
      // Filter subcategories by the selected asset category
      const filtered = assetSubcategories.filter(sub => sub.asset_category === selectedCategory);
      setFilteredSubcategories(filtered);
      // Reset subcategory selection when category changes
      inventoryForm.setValue('subcategory', 0);
    } else {
      setFilteredSubcategories([]);
    }
  }, [selectedCategory, assetSubcategories, inventoryForm]);

  // Calculate total value when quantity or unit price changes
  useEffect(() => {
    if (selectedQuantity && selectedUnitPrice) {
      const total = (selectedQuantity * parseFloat(selectedUnitPrice || '0')).toFixed(2);
      inventoryForm.setValue('total_value', total);
    }
  }, [selectedQuantity, selectedUnitPrice, inventoryForm]);

  // Handle inventory data loading
  useEffect(() => {
    if (inventoryData && isEditMode) {
      // Reset the form with inventory data
      inventoryForm.reset({
        type: inventoryData.type,
        category: inventoryData.category,
        subcategory: inventoryData.subcategory,
        model: inventoryData.model,
        part_no: inventoryData.part_no,
        tag: inventoryData.tag,
        serial_number: inventoryData.serial_number,
        quantity: inventoryData.quantity,
        unit_price: inventoryData.unit_price,
        log_value: inventoryData.log_value,
        vendor: inventoryData.vendor,
        purchase_number: inventoryData.purchase_number,
        purchase_date: inventoryData.purchase_date,
        manufacture_date: inventoryData.manufacture_date,
        expiry_date: inventoryData.expiry_date,
        warranty_end_date: inventoryData.warranty_end_date,
        facility: inventoryData.facility,
        reorder_level: inventoryData.reorder_level,
        minimum_stock: inventoryData.minimum_stock,
        max_stock: inventoryData.max_stock,
        flags: inventoryData.flags,
        status: inventoryData.status,
        total_value: inventoryData.total_value,
      });
    }
  }, [inventoryData, isEditMode, inventoryForm]);

  const onSubmitInventory = (data: InventoryFormValues) => {
    if (isEditMode && id) {
      updateInventoryMutation.mutate(
        { id, inventory: data as Partial<Inventory> },
        { onSuccess: () => navigate('/dashboard/asset/inventories') }
      );
    } else {
      // For creation, we need to include the current timestamp and detail fields will be populated by the API
      const inventoryPayload = {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Omit<Inventory, 'id'>;
      
      createInventoryMutation.mutate(
        inventoryPayload,
        { onSuccess: () => navigate('/dashboard/asset/inventories') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/asset/inventories');
  };

  if (isEditMode && isLoadingInventory) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading inventory details...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isInventoryError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading inventory details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {inventoryError instanceof Error ? inventoryError.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleCancel} variant="outline">
          Back to Inventories
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">
            {isEditMode ? 'Edit Inventory' : 'Create New Inventory'}
          </h1>
        </div>
      </div>

      <Form {...inventoryForm}>
        <form onSubmit={inventoryForm.handleSubmit(onSubmitInventory)} className="space-y-6">
          {/* Basic Information Section */}
          <Collapsible defaultOpen={true} className="w-full">
            <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="border border-t-0 rounded-b-lg p-6 space-y-6 bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField
                  control={inventoryForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Type *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select inventory type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {inventoryTypes.map(type => (
                            <SelectItem key={type.id} value={String(type.id)}>
                              {type.type} ({type.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={inventoryForm.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Model *</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))} 
                        value={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {models.map(model => (
                            <SelectItem key={model.id} value={String(model.id)}>
                              {model.name} ({model.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={inventoryForm.control}
                  name="part_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Part Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter part number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={inventoryForm.control}
                  name="tag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Tag *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter tag" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={inventoryForm.control}
                  name="serial_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Serial Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter serial number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={inventoryForm.control}
                  name="purchase_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Purchase Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter purchase number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={inventoryForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Available">Available</SelectItem>
                          <SelectItem value="Low Stock">Low Stock</SelectItem>
                          <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                          <SelectItem value="Discontinued">Discontinued</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Category and Vendor Section */}
          <Collapsible defaultOpen={true} className="w-full">
            <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-gray-800">Category & Vendor Information</h2>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="border border-t-0 rounded-b-lg p-6 space-y-6 bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={inventoryForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Asset Category *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select asset category" />
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

                <FormField
                  control={inventoryForm.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Asset Subcategory *</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))} 
                        value={String(field.value)}
                        disabled={filteredSubcategories.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              filteredSubcategories.length === 0 
                                ? "Select an asset category first" 
                                : "Select asset subcategory"
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

                <FormField
                  control={inventoryForm.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Vendor *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendors.map(vendor => (
                            <SelectItem key={vendor.id} value={String(vendor.id)}>
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

              <FormField
                control={inventoryForm.control}
                name="facility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Facility *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select facility" />
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

              {filteredSubcategories.length === 0 && selectedCategory > 0 && (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                  No asset subcategories available for the selected category.
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Financial Information Section */}
          <Collapsible defaultOpen={true} className="w-full">
            <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-gray-800">Financial & Quantity Information</h2>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="border border-t-0 rounded-b-lg p-6 space-y-6 bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField
                  control={inventoryForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Quantity *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter quantity" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={inventoryForm.control}
                  name="unit_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Unit Price *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Enter unit price" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={inventoryForm.control}
                  name="total_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Total Value</FormLabel>
                      <FormControl>
                        <Input placeholder="Auto-calculated" {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={inventoryForm.control}
                  name="log_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Log Value</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter log value" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={inventoryForm.control}
                  name="reorder_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Reorder Level</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter reorder level" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={inventoryForm.control}
                  name="minimum_stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Minimum Stock</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter minimum stock" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={inventoryForm.control}
                  name="max_stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Maximum Stock</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter maximum stock" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Date Information Section */}
          <Collapsible defaultOpen={true} className="w-full">
            <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-gray-800">Date Information</h2>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="border border-t-0 rounded-b-lg p-6 space-y-6 bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField
                  control={inventoryForm.control}
                  name="purchase_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Purchase Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={inventoryForm.control}
                  name="manufacture_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Manufacture Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={inventoryForm.control}
                  name="expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={inventoryForm.control}
                  name="warranty_end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Warranty End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={inventoryForm.control}
                name="flags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Flags</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter any flags or notes"
                        {...field}
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CollapsibleContent>
          </Collapsible>
          
          {/* Form submit buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              className="px-8"
            >
              Cancel
            </Button>
            
            <Button 
              type="submit"
              disabled={createInventoryMutation.isPending || updateInventoryMutation.isPending}
              className="px-8"
            >
              {(createInventoryMutation.isPending || updateInventoryMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Update Inventory' : 'Create Inventory'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default InventoryForm;
