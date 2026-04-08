// src/features/facility/facilities/FacilityDetailView.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  MapPin, 
  Building2, 
  Tag, 
  Hash,
  User2,
  Map
} from 'lucide-react';
import { useFacilityQuery } from '@/hooks/facility/useFacilityQueries';
import { Separator } from '@/components/ui/separator';

const FacilityDetailView = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  // Using our custom hook instead of direct query
  const { 
    data: facility,
    isLoading,
    isError,
    error
  } = useFacilityQuery(code);

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/facility/list');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/dashboard/facility/list/edit/${code}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading facility details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading facility details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Facilities
        </Button>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Facility not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Facilities
        </Button>
      </div>
    );
  }

  // Determine badge color based on type
  const getTypeBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case 'commercial':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'residential':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'industrial':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handleBack}
              className="rounded-full shadow-sm hover:shadow-md transition-all duration-200 border-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Facility Details</h1>
              <p className="text-gray-600 mt-1">View facility information and details</p>
            </div>
          </div>
          {/* <Button 
            onClick={handleEdit} 
            className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Edit className="mr-2 h-4 w-4" /> Edit Facility
          </Button> */}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Information Card */}
          <Card className="lg:col-span-2 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-gray-800">{facility.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Hash className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">{facility.code}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`${getTypeBadgeVariant(facility.type)} px-4 py-2 rounded-full text-sm font-semibold border`}>
                    {facility.type}
                  </Badge>
                </div>
                
                {facility.address_gps && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm">{facility.address_gps}</span>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Facility Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-800">Facility Information</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Hash className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Facility ID</p>
                        <p className="text-lg font-semibold text-gray-800 mt-1">{facility.id}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Tag className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Facility Code</p>
                        <p className="text-lg font-semibold text-gray-800 mt-1">{facility.code}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Building2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Facility Type</p>
                        <p className="text-lg font-semibold text-gray-800 mt-1">{facility.type}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Location & Management */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-300 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-800">Location & Management</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {facility.address_gps && (
                      <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Map className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">GPS Address</p>
                          <p className="text-sm text-blue-800 mt-1 leading-relaxed">{facility.address_gps}</p>
                        </div>
                      </div>
                    )}

                    {facility.cluster_detail && (
                      <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Building2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-purple-700 uppercase tracking-wide">Cluster</p>
                          <p className="text-lg font-semibold text-purple-800 mt-1">{facility.cluster_detail.name}</p>
                          <p className="text-xs text-purple-600 mt-1">ID: {facility.cluster_detail.id}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <User2 className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-orange-700 uppercase tracking-wide">Manager</p>
                        <p className="text-lg font-semibold text-orange-800 mt-1">Manager ID: {facility.manager}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Actions Card */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-fit">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <div className="p-1 bg-primary/10 rounded">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                <Button 
                  onClick={handleEdit} 
                  className="w-full bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  size="lg"
                >
                  <Edit className="mr-2 h-5 w-5" /> Edit Facility
                </Button>
                
                <Button 
                  onClick={handleBack} 
                  variant="outline" 
                  className="w-full border-2 hover:bg-gray-50 transition-all duration-200"
                  size="lg"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back to List
                </Button>
              </div>
              
              <Separator className="my-6" />
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Facility Information</p>
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{facility.name}</p>
                  <p className="text-sm text-gray-600 mt-1">ID: {facility.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FacilityDetailView;