// src/features/asset/assets/AssetForm.tsx
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
import { Asset } from '@/types/asset';
import { useList } from '@/hooks/crud/useCrudOperations';
import { useAssetCategoriesQuery } from '@/hooks/assetcategory/useAssetCategoryQueries';
import { useAssetSubcategoriesQuery } from '@/hooks/assetsubcategory/useAssetSubcategoryQueries';
import { useAssetQuery, useCreateAsset, useUpdateAsset } from '@/hooks/asset/useAssetQueries';
import { Facility } from '@/types/facility';
import { Zone } from '@/types/zone';
import { Building } from '@/types/building';
import { Subsystem } from '@/types/subsystem';
import { User } from '@/types/user';
import { AssetCategory } from '@/types/assetcategory';
import { AssetSubcategory } from '@/types/assetsubcategory';

// API endpoints
const endpoint2 = 'facility/api/api/facilities/';
const endpoint3 = 'facility/api/api/zones/';
const endpoint4 = 'facility/api/api/buildings/';
const endpoint5 = 'facility/api/api/subsystems/';
const endpoint6 = 'accounts/api/users/';

// Form schema definition matching the Asset interface
const assetSchema = z.object({
  asset_name: z.string().min(1, 'Asset name is required'),
  asset_type: z.enum(['Asset', 'Consumable']).default('Asset'),
  condition: z.enum(['Used', 'Brand New']).default('Brand New'),
  purchase_date: z.string().min(1, 'Purchase date is required'),
  purchased_amount: z.string().min(1, 'Purchased amount is required'),
  serial_number: z.string().optional(),
  asset_tag: z.string().min(1, 'Asset tag is required'),
  lifespan: z.string().optional(),
  oem_warranty: z.string().optional(),
  owner: z.number().min(1, 'Owner is required'),
  facility: z.number().min(1, 'Facility is required'),
  zone: z.number().min(1, 'Zone is required'),
  building: z.number().min(1, 'Building is required'),
  subsystem: z.number().min(1, 'Subsystem is required'),
  category: z.number().min(1, 'Category is required'),
  subcategory: z.number().min(1, 'Subcategory is required'),
});

type AssetFormValues = z.infer<typeof assetSchema>;

const AssetForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // State for filtered subcategories
  const [filteredSubcategories, setFilteredSubcategories] = useState<AssetSubcategory[]>([]);
  
  // State for filtered facility hierarchy
  const [filteredZones, setFilteredZones] = useState<Zone[]>([]);
  const [filteredBuildings, setFilteredBuildings] = useState<Building[]>([]);
  const [filteredSubsystems, setFilteredSubsystems] = useState<Subsystem[]>([]);
  
  // Asset form setup
  const assetForm = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      asset_name: '',
      asset_type: 'Asset',
      condition: 'Brand New',
      purchase_date: '',
      purchased_amount: '',
      serial_number: '',
      asset_tag: '',
      lifespan: '',
      oem_warranty: '',
      owner: 0,
      facility: 0,
      zone: 0,
      building: 0,
      subsystem: 0,
      category: 0,
      subcategory: 0,
    }
  });

  // Fetch data for dropdowns using the correct hooks
  const { data: assetCategoriesResponse } = useAssetCategoriesQuery();
  const { data: assetSubcategoriesResponse } = useAssetSubcategoriesQuery();
  const { data: facilities = [] } = useList<Facility>('facilities', endpoint2);
  const { data: zones = [] } = useList<Zone>('zones', endpoint3);
  const { data: buildings = [] } = useList<Building>('buildings', endpoint4);
  const { data: subsystems = [] } = useList<Subsystem>('subsystems', endpoint5);
  const { data: users = [] } = useList<User>('users', endpoint6);

  const assetCategories = assetCategoriesResponse?.results || [];
  const assetSubcategories = assetSubcategoriesResponse?.results || [];
  
  // Fetch asset data for edit mode using our custom hook
  const { 
    data: assetData, 
    isLoading: isLoadingAsset, 
    isError: isAssetError,
    error: assetError
  } = useAssetQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createAssetMutation = useCreateAsset();
  const updateAssetMutation = useUpdateAsset(id);

  // Watch form changes for cascading dropdowns
  const selectedCategory = assetForm.watch('category');
  const selectedFacility = assetForm.watch('facility');
  const selectedZone = assetForm.watch('zone');
  const selectedBuilding = assetForm.watch('building');

  // Update subcategories when category changes
  useEffect(() => {
    if (selectedCategory && assetSubcategories.length > 0) {
      // Filter subcategories by the selected asset category
      const filtered = assetSubcategories.filter(sub => sub.asset_category === selectedCategory);
      setFilteredSubcategories(filtered);
      // Reset subcategory selection when category changes
      assetForm.setValue('subcategory', 0);
    } else {
      setFilteredSubcategories([]);
    }
  }, [selectedCategory, assetSubcategories, assetForm]);

  // Update zones when facility changes
  useEffect(() => {
    if (selectedFacility && zones.length > 0) {
      // Filter zones by the selected facility
      const filtered = zones.filter(zone => zone.facility === selectedFacility);
      setFilteredZones(filtered);
      // Reset zone, building, and subsystem selections when facility changes
      assetForm.setValue('zone', 0);
      assetForm.setValue('building', 0);
      assetForm.setValue('subsystem', 0);
    } else {
      setFilteredZones([]);
    }
  }, [selectedFacility, zones, assetForm]);

  // Update buildings when zone changes
  useEffect(() => {
    if (selectedZone && buildings.length > 0) {
      // Filter buildings by the selected zone
      const filtered = buildings.filter(building => building.zone === selectedZone);
      setFilteredBuildings(filtered);
      // Reset building and subsystem selections when zone changes
      assetForm.setValue('building', 0);
      assetForm.setValue('subsystem', 0);
    } else {
      setFilteredBuildings([]);
    }
  }, [selectedZone, buildings, assetForm]);

  // Update subsystems when building changes
  useEffect(() => {
    if (selectedBuilding && subsystems.length > 0) {
      // Filter subsystems by the selected building
      const filtered = subsystems.filter(subsystem => subsystem.building === selectedBuilding);
      setFilteredSubsystems(filtered);
      // Reset subsystem selection when building changes
      assetForm.setValue('subsystem', 0);
    } else {
      setFilteredSubsystems([]);
    }
  }, [selectedBuilding, subsystems, assetForm]);

  // Handle asset data loading
  useEffect(() => {
    if (assetData && isEditMode) {
      // Reset the form with asset data
      assetForm.reset({
        asset_name: assetData.asset_name,
        asset_type: assetData.asset_type,
        condition: assetData.condition,
        purchase_date: assetData.purchase_date,
        purchased_amount: assetData.purchased_amount,
        serial_number: assetData.serial_number || '',
        asset_tag: assetData.asset_tag,
        lifespan: assetData.lifespan || '',
        oem_warranty: assetData.oem_warranty || '',
        owner: assetData.owner,
        facility: assetData.facility,
        zone: assetData.zone,
        building: assetData.building,
        subsystem: assetData.subsystem,
        category: assetData.category,
        subcategory: assetData.subcategory,
      });
    }
  }, [assetData, isEditMode, assetForm]);

  const onSubmitAsset = (data: AssetFormValues) => {
    if (isEditMode && id) {
      updateAssetMutation.mutate(
        { id, asset: data },
        { onSuccess: () => navigate('/dashboard/asset/assets') }
      );
    } else {
      createAssetMutation.mutate(
        data as Omit<Asset, 'id'>,
        { onSuccess: () => navigate('/dashboard/asset/assets') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/asset/assets');
  };

  if (isEditMode && isLoadingAsset) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading asset details...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isAssetError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading asset details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {assetError instanceof Error ? assetError.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleCancel} variant="outline">
          Back to Assets
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
            {isEditMode ? 'Edit Asset' : 'Create New Asset'}
          </h1>
        </div>
      </div>

      <Form {...assetForm}>
        <form onSubmit={assetForm.handleSubmit(onSubmitAsset)} className="space-y-6">
          {/* Location Information Section */}
          <Collapsible defaultOpen={true} className="w-full">
            <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-gray-800">Location Information</h2>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="border border-t-0 rounded-b-lg p-6 space-y-6 bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField
                  control={assetForm.control}
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

                <FormField
                  control={assetForm.control}
                  name="zone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Zone *</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))} 
                        value={String(field.value)}
                        disabled={filteredZones.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              filteredZones.length === 0 
                                ? "Select a facility first" 
                                : "Select zone"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredZones.map(zone => (
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
                  control={assetForm.control}
                  name="building"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Building *</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))} 
                        value={String(field.value)}
                        disabled={filteredBuildings.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              filteredBuildings.length === 0 
                                ? "Select a zone first" 
                                : "Select building"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredBuildings.map(building => (
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
                  control={assetForm.control}
                  name="subsystem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Subsystem *</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))} 
                        value={String(field.value)}
                        disabled={filteredSubsystems.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              filteredSubsystems.length === 0 
                                ? "Select a building first" 
                                : "Select subsystem"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredSubsystems.map(subsystem => (
                            <SelectItem key={subsystem.id} value={String(subsystem.id)}>
                              {subsystem.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Hierarchy Information Display */}
              <div className="space-y-3">
                {filteredZones.length === 0 && selectedFacility > 0 && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                    No zones available for the selected facility.
                  </div>
                )}
                
                {filteredBuildings.length === 0 && selectedZone > 0 && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                    No buildings available for the selected zone.
                  </div>
                )}
                
                {filteredSubsystems.length === 0 && selectedBuilding > 0 && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                    No subsystems available for the selected building.
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Category Information Section */}
          <Collapsible defaultOpen={true} className="w-full">
            <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-gray-800">Category Information</h2>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="border border-t-0 rounded-b-lg p-6 space-y-6 bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={assetForm.control}
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
                  control={assetForm.control}
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
              </div>
              
              {filteredSubcategories.length === 0 && selectedCategory > 0 && (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                  No asset subcategories available for the selected category.
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Basic Information Section */}
          <Collapsible defaultOpen={true} className="w-full">
            <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="border border-t-0 rounded-b-lg p-6 space-y-6 bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={assetForm.control}
                  name="asset_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Asset Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter asset name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={assetForm.control}
                  name="asset_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Asset Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select asset type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Asset">Asset</SelectItem>
                          <SelectItem value="Consumable">Consumable</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={assetForm.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Condition *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Used">Used</SelectItem>
                          <SelectItem value="Brand New">Brand New</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={assetForm.control}
                  name="asset_tag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Asset Tag *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter asset tag" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={assetForm.control}
                  name="serial_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Serial Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter serial number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={assetForm.control}
                  name="owner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Register By *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select registrar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map(user => (
                            <SelectItem key={user.id} value={String(user.id)}>
                              <div className="flex flex-col">
                                <span className="font-medium">{user.first_name} {user.last_name}</span>
                                <span className="text-xs text-muted-foreground">{user.roles}</span>
                              </div>
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

          {/* Procurement Information Section */}
          <Collapsible defaultOpen={true} className="w-full">
            <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-gray-800">Procurement Information</h2>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="border border-t-0 rounded-b-lg p-6 space-y-6 bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={assetForm.control}
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
                  control={assetForm.control}
                  name="purchased_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Purchased Amount *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Enter amount" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={assetForm.control}
                  name="lifespan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Lifespan</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter lifespan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <FormField
                  control={assetForm.control}
                  name="oem_warranty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">OEM Warranty</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter OEM warranty details" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
              disabled={createAssetMutation.isPending || updateAssetMutation.isPending}
              className="px-8"
            >
              {(createAssetMutation.isPending || updateAssetMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Update Asset' : 'Create Asset'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AssetForm;