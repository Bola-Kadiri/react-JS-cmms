// src/features/facility/zones/ZoneDetailView.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Loader2, Hash, Building2, Settings2 } from 'lucide-react';
import { useZoneQuery } from '@/hooks/zone/useZoneQueries';

const ZoneDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Using our custom hook instead of direct query
  const { 
    data: zone, 
    isLoading, 
    isError,
    error 
  } = useZoneQuery(id);

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/facility/zones');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/dashboard/facility/zones/edit/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading zone details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading zone details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Zones
        </Button>
      </div>
    );
  }

  if (!zone) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Zone not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Zones
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto py-8 px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleBack}
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Zone Details</h1>
          </div>
          <Button onClick={handleEdit} className="shadow-md hover:shadow-lg transition-shadow">
            <Edit className="mr-2 h-4 w-4" /> Edit Zone
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Zone Info Card */}
          <Card className="lg:col-span-3 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Settings2 className="h-6 w-6 text-primary" />
                </div>
                Zone Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Hash className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Code</p>
                      <p className="text-lg font-semibold text-gray-800">{zone.code}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Settings2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Name</p>
                      <p className="text-lg font-semibold text-gray-800">{zone.name}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Building2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Associated Facility</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {zone.facility_detail?.name || 'None'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <Button 
                    onClick={handleEdit} 
                    className="w-full justify-start gap-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Zone
                  </Button>
                  <Button 
                    onClick={handleBack} 
                    variant="outline" 
                    className="w-full justify-start gap-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Zones
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoneDetailView;