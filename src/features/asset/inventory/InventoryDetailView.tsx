import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  Package, 
  Calendar, 
  Tag, 
  Hash, 
  DollarSign, 
  Layers, 
  MapPin, 
  Flag, 
  AlertTriangle,
  ShieldCheck,
  User,
  Bookmark,
  Building,
  Phone,
  Mail,
  CreditCard,
  TrendingUp,
  Settings
} from 'lucide-react';
import { useInventoryQuery } from '@/hooks/inventory/useInventoryQueries';
import { useInventoryTypesQuery } from '@/hooks/inventorytype/useInventoryTypeQueries';
import { useModels } from '@/hooks/model/useModelQueries';
import { useToast } from '@/components/ui/use-toast';
import { PermissionGuard } from '@/components/PermissionGuard';

const InventoryDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Using our custom hook instead of direct query
  const { 
    data: inventory, 
    isLoading, 
    isError,
    error 
  } = useInventoryQuery(id);

  // Fetch data for displaying names instead of IDs
  const { data: inventoryTypesResponse } = useInventoryTypesQuery();
  const { data: modelsResponse } = useModels();

  const inventoryTypes = inventoryTypesResponse?.results || [];
  const models = modelsResponse?.results || [];

  // Helper functions to get names from IDs
  const getTypeName = (typeId: number) => {
    const type = inventoryTypes.find(t => t.id === typeId);
    return type ? `${type.type} (${type.code})` : `Type ${typeId}`;
  };

  const getModelName = (modelId: number) => {
    const model = models.find(m => m.id === modelId);
    return model ? `${model.name} (${model.code})` : `Model ${modelId}`;
  };

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/asset/inventories');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/dashboard/asset/inventories/edit/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Low Stock':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'Discontinued':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    try {
      return format(parseISO(dateString), 'PPP'); // Format: 'April 29, 2025'
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (amount: string | number) => {
    if (!amount) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(Number(amount));
  };

  // Calculate stock level status
  const getStockLevelInfo = () => {
    if (!inventory) return null;
    
    const { quantity, reorder_level, minimum_stock, max_stock } = inventory;
    
    if (quantity <= minimum_stock) {
      return { level: 'Critical', color: 'text-red-600 bg-red-50', urgency: 'high' };
    } else if (quantity <= reorder_level) {
      return { level: 'Low', color: 'text-orange-600 bg-orange-50', urgency: 'medium' };
    } else if (quantity >= max_stock) {
      return { level: 'Overstock', color: 'text-blue-600 bg-blue-50', urgency: 'low' };
    } else {
      return { level: 'Normal', color: 'text-green-600 bg-green-50', urgency: 'none' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading inventory details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading inventory details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Inventories
        </Button>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Inventory not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Inventories
        </Button>
      </div>
    );
  }

  const stockInfo = getStockLevelInfo();

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {inventory ? getModelName(inventory.model) : 'Loading...'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {inventory ? getTypeName(inventory.type) : ''} • S/N: {inventory?.serial_number} • Tag: {inventory?.tag}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(inventory.status)}>
            {inventory.status}
          </Badge>
          {stockInfo && (
            <Badge className={stockInfo.color}>
              {stockInfo.level} Stock
            </Badge>
          )}
          <PermissionGuard feature='inventory_register' permission='edit'>
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" /> Edit Inventory
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Item Details</TabsTrigger>
          <TabsTrigger value="inventory">Stock & Levels</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="category">Category</TabsTrigger>
          <TabsTrigger value="vendor">Vendor</TabsTrigger>
          <TabsTrigger value="facility">Facility</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> 
                  Item Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                      <p className="text-lg font-semibold">{getTypeName(inventory.type)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Model</p>
                      <p className="text-lg font-semibold">{getModelName(inventory.model)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Part Number</p>
                      <p className="text-base font-mono bg-gray-100 px-2 py-1 rounded text-center max-w-fit">
                        {inventory.part_no}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tag</p>
                      <p className="text-base font-mono bg-gray-100 px-2 py-1 rounded text-center max-w-fit">
                        {inventory.tag}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                      <p className="text-base font-mono bg-gray-100 px-2 py-1 rounded text-center max-w-fit">
                        {inventory.serial_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Purchase Number</p>
                      <p className="text-base">{inventory.purchase_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Log Value</p>
                      <p className="text-base">{inventory.log_value || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(inventory.status)}>
                        {inventory.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {inventory.flags && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Flag className="h-3.5 w-3.5" /> Flags
                    </p>
                    <p className="text-base mt-1 p-3 bg-gray-50 rounded-md border">{inventory.flags}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Date Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> 
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Purchase Date</p>
                  <p className="text-base">{formatDate(inventory.purchase_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Manufacture Date</p>
                  <p className="text-base">{formatDate(inventory.manufacture_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expiry Date</p>
                  <div className="flex items-center gap-2">
                    <p className="text-base">{formatDate(inventory.expiry_date)}</p>
                    {inventory.expiry_date && new Date(inventory.expiry_date) < new Date() && (
                      <Badge className="bg-red-100 text-red-800">
                        Expired
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Warranty End Date</p>
                  <p className="text-base">{formatDate(inventory.warranty_end_date)}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-base">{formatDate(inventory.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-base">{formatDate(inventory.updated_at)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Stock Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" /> 
                  Current Stock Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-6 rounded-lg border ${stockInfo?.color || 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium">Current Quantity</p>
                      <p className="text-4xl font-bold">{inventory.quantity}</p>
                    </div>
                    <div className="text-right">
                      {stockInfo && (
                        <>
                          <Badge className={getStatusColor(inventory.status)}>
                            {inventory.status}
                          </Badge>
                          <p className="text-sm mt-2 font-medium">{stockInfo.level} Level</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {stockInfo?.urgency === 'high' && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Critical stock level - immediate restocking required</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stock Thresholds Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> 
                  Stock Thresholds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="text-sm font-medium text-red-800">Minimum Stock</span>
                    <span className="text-lg font-bold text-red-800">{inventory.minimum_stock}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <span className="text-sm font-medium text-orange-800">Reorder Level</span>
                    <span className="text-lg font-bold text-orange-800">{inventory.reorder_level}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm font-medium text-blue-800">Maximum Stock</span>
                    <span className="text-lg font-bold text-blue-800">{inventory.max_stock}</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-700">
                    <strong>Stock Management:</strong> Reorder when quantity reaches {inventory.reorder_level} units. 
                    Maintain between {inventory.minimum_stock} and {inventory.max_stock} units.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" /> 
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">Unit Price</p>
                  <p className="text-2xl font-bold text-green-800">{formatCurrency(inventory.unit_price)}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800">Current Quantity</p>
                  <p className="text-2xl font-bold text-blue-800">{inventory.quantity}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-purple-800">Total Value</p>
                  <p className="text-2xl font-bold text-purple-800">{formatCurrency(inventory.total_value)}</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Value Calculation</p>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-600">
                    {formatCurrency(inventory.unit_price)} × {inventory.quantity} units = {formatCurrency(inventory.total_value)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Category Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-primary" /> 
                  Asset Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {inventory.category_detail ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Category</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="font-medium">
                          {inventory.category_detail.code}
                        </Badge>
                        <p className="text-lg font-semibold">{inventory.category_detail.name}</p>
                      </div>
                      {inventory.category_detail.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {inventory.category_detail.description}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                      <p className="text-base mt-1">{inventory.category_detail.type}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Useful Life</p>
                      <p className="text-base mt-1">{inventory.category_detail.useful_life_year} years</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Category information not available</p>
                    <p className="text-sm text-muted-foreground">Category ID: {inventory.category}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Asset Subcategory Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" /> 
                  Asset Subcategory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {inventory.subcategory_detail ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Subcategory</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="font-medium">
                          {inventory.subcategory_detail.code}
                        </Badge>
                        <p className="text-lg font-semibold">{inventory.subcategory_detail.name}</p>
                      </div>
                      {inventory.subcategory_detail.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {inventory.subcategory_detail.description}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                      <p className="text-base mt-1">{inventory.subcategory_detail.type}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge className={`mt-1 ${inventory.subcategory_detail.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {inventory.subcategory_detail.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Parent Category</p>
                      <p className="text-base mt-1">
                        {inventory.category_detail?.name || `Category ID: ${inventory.subcategory_detail.asset_category}`}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Subcategory information not available</p>
                    <p className="text-sm text-muted-foreground">Subcategory ID: {inventory.subcategory}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" /> 
                Vendor Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inventory.vendor_detail ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Vendor</p>
                      <p className="text-xl font-semibold">{inventory.vendor_detail.name}</p>
                      <Badge variant="outline" className="mt-1">
                        {inventory.vendor_detail.type}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <p className="text-base">{inventory.vendor_detail.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <p className="text-base">{inventory.vendor_detail.email}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge className={`mt-1 ${
                        inventory.vendor_detail.status === 'Active' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                          : 'bg-red-100 text-red-800 hover:bg-red-100'
                      }`}>
                        {inventory.vendor_detail.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bank Information</p>
                      <div className="p-3 bg-gray-50 rounded-md border mt-2 space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">Account Name</p>
                          <p className="text-base">{inventory.vendor_detail.account_name}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">Bank Name</p>
                          <p className="text-base">{inventory.vendor_detail.bank}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">Account Number</p>
                          <p className="text-base font-mono">{inventory.vendor_detail.account_number}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">Currency</p>
                          <Badge variant="outline">{inventory.vendor_detail.currency}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Vendor information not available</p>
                  <p className="text-sm text-muted-foreground">Vendor ID: {inventory.vendor}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> 
                Facility Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inventory.facility_detail ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Facility</p>
                    <p className="text-xl font-semibold">{inventory.facility_detail.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{inventory.facility_detail.code}</Badge>
                      <Badge variant="secondary">{inventory.facility_detail.type}</Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="text-base">{inventory.facility_detail.address_gps || 'Location not specified'}</p>
                  </div>

                  {inventory.facility_detail.cluster_detail && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cluster Information</p>
                      <div className="p-3 bg-gray-50 rounded-md border mt-2">
                        <p className="font-medium">{inventory.facility_detail.cluster_detail.name}</p>
                        <p className="text-sm text-gray-600">Region ID: {inventory.facility_detail.cluster_detail.region}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Manager</p>
                    <p className="text-base">Manager ID: {inventory.facility_detail.manager}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Facility information not available</p>
                  <p className="text-sm text-muted-foreground">Facility ID: {inventory.facility}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryDetailView;