// src/features/asset/stores/StoreDetailView.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Loader2, MapPin, Tag, Info, Building, Warehouse, Package, Calendar } from 'lucide-react';
import { useStoreQuery } from '@/hooks/store/useStoreQueries';
import { useFormatters } from '@/utils/formatters';

const StoreDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatDate } = useFormatters();
  
  // Using our custom hook instead of direct query
  const { 
    data: store,
    isLoading,
    isError,
    error
  } = useStoreQuery(id);

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/asset/stores');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/asset/stores/edit/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading store details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading store details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Stores
        </Button>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Store not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Stores
        </Button>
      </div>
    );
  }

  // Determine badge color based on status
  const getBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Store Details</h1>
        </div>
        <Button onClick={handleEdit} className="rounded-md">
          <Edit className="mr-2 h-4 w-4" /> Edit Store
        </Button>
      </div>
      
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b pb-8">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">{store.code}</span>
              </div>
              <Badge className={`${getBadgeVariant(store.status)} px-3 py-1 rounded-full text-xs font-medium`}>
                {store.status}
              </Badge>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800">{store.name}</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="facility">Facility</TabsTrigger>
              <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-50 p-2">
                      <Info className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Store ID</p>
                      <p className="text-lg font-medium text-gray-800">{store.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-50 p-2">
                      <Tag className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Code</p>
                      <p className="text-lg font-medium text-gray-800">{store.code}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-50 p-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-lg font-medium text-gray-800">{store.location || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-green-50 p-2">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Capacity</p>
                      <p className="text-lg font-medium text-gray-800">{store.capacity.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-purple-50 p-2">
                      <Info className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <Badge className={`${getBadgeVariant(store.status)} px-2 py-1 rounded-full text-xs font-medium`}>
                        {store.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="facility" className="p-6">
              {store.facility_detail ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Building className="h-5 w-5 text-blue-600" />
                    <h3 className="text-xl font-semibold">Facility Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Facility Name</p>
                      <p className="text-lg font-medium text-gray-800">{store.facility_detail.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Facility Code</p>
                      <p className="text-lg font-medium text-gray-800">{store.facility_detail.code}</p>
                    </div>
                    
                    {store.facility_detail.address_gps && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Address/GPS</p>
                        <p className="text-lg font-medium text-gray-800">{store.facility_detail.address_gps}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Type</p>
                      <p className="text-lg font-medium text-gray-800">{store.facility_detail.type}</p>
                    </div>
                    
                    {store.facility_detail.cluster_detail && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-500">Cluster</p>
                        <p className="text-lg font-medium text-gray-800">{store.facility_detail.cluster_detail.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No facility details available</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="warehouse" className="p-6">
              {store.warehouse_detail ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Warehouse className="h-5 w-5 text-green-600" />
                    <h3 className="text-xl font-semibold">Warehouse Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Warehouse Name</p>
                      <p className="text-lg font-medium text-gray-800">{store.warehouse_detail.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Warehouse Code</p>
                      <p className="text-lg font-medium text-gray-800">{store.warehouse_detail.code}</p>
                    </div>
                    
                    {store.warehouse_detail.capacity && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Warehouse Capacity</p>
                        <p className="text-lg font-medium text-gray-800">
                          {isNaN(Number(store.warehouse_detail.capacity)) 
                            ? store.warehouse_detail.capacity 
                            : Number(store.warehouse_detail.capacity).toLocaleString()}
                        </p>
                      </div>
                    )}
                    
                    {store.warehouse_detail.address && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        <p className="text-lg font-medium text-gray-800">{store.warehouse_detail.address}</p>
                      </div>
                    )}
                    
                    {store.warehouse_detail.description && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-500">Description</p>
                        <p className="text-lg font-medium text-gray-800">{store.warehouse_detail.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Warehouse className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No warehouse details available</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <h3 className="text-xl font-semibold">Timeline</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-green-50 p-2">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created</p>
                      <p className="text-lg font-medium text-gray-800">
                        {formatDate(store.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-50 p-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Last Updated</p>
                      <p className="text-lg font-medium text-gray-800">
                        {formatDate(store.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="bg-gray-50 p-6 border-t">
          <div className="w-full flex justify-between items-center">
            <p className="text-sm text-gray-500">Store ID: {store.id}</p>
            <Button variant="outline" onClick={handleBack} className="rounded-md">
              Back to Stores
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StoreDetailView;