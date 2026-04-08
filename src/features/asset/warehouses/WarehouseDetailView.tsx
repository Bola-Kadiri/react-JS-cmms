import { useParams, useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  ArrowLeft, 
  Edit, 
  MapPin, 
  Package, 
  Server, 
  Tag,
  Loader2,
  Building2,
  Hash,
  FileText,
  Shield,
  Building
} from 'lucide-react';
import { useWarehouseQuery } from '@/hooks/warehouse/useWarehouseQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { PermissionGuard } from '@/components/PermissionGuard';

const WarehouseDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    data: warehouse,
    isLoading,
    isError,
    error
  } = useWarehouseQuery(id);

  const handleBack = () => {
    navigate('/dashboard/asset/warehouses');
  };

  const handleEdit = () => {
    navigate(`/dashboard/asset/warehouses/edit/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">Loading warehouse details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading warehouse details</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Warehouses
        </Button>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warehouse not found</AlertTitle>
          <AlertDescription>
            The requested warehouse could not be found.
          </AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Warehouses
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              {warehouse.name}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Tag className="h-3.5 w-3.5" />
              {warehouse.code} • ID: {warehouse.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={warehouse.is_active ? "default" : "outline"} className="text-sm">
            {warehouse.is_active ? 'Active' : 'Inactive'}
          </Badge>
          <PermissionGuard feature='asset_register' permission='edit'>
            <Button onClick={handleEdit} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Warehouse
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Warehouse Information
            </CardTitle>
            <CardDescription>
              Core details and specifications for this warehouse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3.5 w-3.5" />
                    Code
                  </p>
                  <p className="text-base font-mono bg-gray-100 px-2 py-1 rounded text-center max-w-fit mt-1">
                    {warehouse.code}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-lg font-semibold mt-1">{warehouse.name}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Package className="h-3.5 w-3.5" />
                    Capacity
                  </p>
                  <p className="text-xl font-bold text-primary mt-1">
                    {isNaN(Number(warehouse.capacity)) ? warehouse.capacity : Number(warehouse.capacity).toLocaleString()} units
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    Address
                  </p>
                  <p className="text-base mt-1">{warehouse.address}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" />
                    Status
                  </p>
                  <Badge 
                    variant={warehouse.is_active ? "default" : "outline"} 
                    className="mt-1"
                  >
                    {warehouse.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Server className="h-3.5 w-3.5" />
                    Warehouse ID
                  </p>
                  <p className="text-base font-mono mt-1">{warehouse.id}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-2">
                <FileText className="h-3.5 w-3.5" />
                Description
              </p>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-base leading-relaxed">
                  {warehouse.description || 'No description provided'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Facility Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Facility Information
            </CardTitle>
            <CardDescription>
              Associated facility details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {warehouse.facility_detail ? (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Facility Name</p>
                  <p className="text-lg font-semibold mt-1">{warehouse.facility_detail.name}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Facility Code</p>
                  <p className="text-base font-mono bg-gray-100 px-2 py-1 rounded text-center max-w-fit mt-1">
                    {warehouse.facility_detail.code}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <Badge variant="secondary" className="mt-1">
                    {warehouse.facility_detail.type}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {warehouse.facility_detail.address_gps || 'Location not specified'}
                  </p>
                </div>

                {warehouse.facility_detail.cluster_detail && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cluster</p>
                      <p className="text-base mt-1">{warehouse.facility_detail.cluster_detail.name}</p>
                      <p className="text-xs text-gray-500">Region ID: {warehouse.facility_detail.cluster_detail.region}</p>
                    </div>
                  </>
                )}

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Manager</p>
                  <p className="text-sm text-gray-600 mt-1">ID: {warehouse.facility_detail.manager}</p>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <Building className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-muted-foreground">Facility information not available</p>
                <p className="text-sm text-muted-foreground">Facility ID: {warehouse.facility}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Warehouse Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800">Total Capacity</p>
              <p className="text-2xl font-bold text-blue-800">
                {isNaN(Number(warehouse.capacity)) ? warehouse.capacity : Number(warehouse.capacity).toLocaleString()}
              </p>
              <p className="text-xs text-blue-600 mt-1">Units</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-800">Status</p>
              <p className="text-lg font-bold text-green-800">
                {warehouse.is_active ? 'Operational' : 'Inactive'}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {warehouse.is_active ? 'Ready for use' : 'Not operational'}
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-purple-800">Facility</p>
              <p className="text-lg font-bold text-purple-800">
                {warehouse.facility_detail?.name || 'N/A'}
              </p>
              <p className="text-xs text-purple-600 mt-1">Parent facility</p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm font-medium text-orange-800">Warehouse ID</p>
              <p className="text-lg font-bold text-orange-800 font-mono">{warehouse.id}</p>
              <p className="text-xs text-orange-600 mt-1">System identifier</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Back Button */}
      <div className="flex justify-center mt-6">
        <Button variant="outline" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Warehouses
        </Button>
      </div>
    </div>
  );
};

export default WarehouseDetailView;