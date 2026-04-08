// src/features/facility/subsystems/SubsystemDetailView.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  Settings2, 
  Building2, 
  Hash, 
  Calendar,
  Clock
} from 'lucide-react';
import { useSubsystemQuery } from '@/hooks/subsystem/useSubsystemQueries';

const SubsystemDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Using our custom hook instead of direct query
  const { 
    data: subsystem, 
    isLoading, 
    isError,
    error 
  } = useSubsystemQuery(id);

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/facility/subsystems');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/dashboard/facility/subsystems/edit/${id}`);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading subsystem details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading subsystem details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Subsystems
        </Button>
      </div>
    );
  }

  if (!subsystem) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Subsystem not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Subsystems
        </Button>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-800">Subsystem Details</h1>
              <p className="text-gray-600 mt-1">View subsystem information and settings</p>
            </div>
          </div>
          <Button 
            onClick={handleEdit} 
            className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Edit className="mr-2 h-4 w-4" /> Edit Subsystem
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Information Card */}
          <Card className="lg:col-span-2 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Settings2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-800">{subsystem.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">ID: {subsystem.id}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Subsystem Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-800">Subsystem Information</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Hash className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Subsystem ID</p>
                        <p className="text-lg font-semibold text-gray-800 mt-1">{subsystem.id}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Settings2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Subsystem Name</p>
                        <p className="text-lg font-semibold text-gray-800 mt-1">{subsystem.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Building Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-300 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-800">Associated Building</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {subsystem.building_detail && (
                      <>
                        <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">Building Name</p>
                            <p className="text-lg font-semibold text-blue-800 mt-1">{subsystem.building_detail.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Hash className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-purple-700 uppercase tracking-wide">Building Code</p>
                            <p className="text-lg font-semibold text-purple-800 mt-1">{subsystem.building_detail.code}</p>
                            <p className="text-xs text-purple-600 mt-1">Building ID: {subsystem.building_detail.id}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator className="my-8" />
              
              {/* Timestamps Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-orange-300 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-gray-800">Timestamps</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700 uppercase tracking-wide">Created At</p>
                      <p className="text-sm text-green-800 mt-1">{formatDate(subsystem.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-700 uppercase tracking-wide">Updated At</p>
                      <p className="text-sm text-orange-800 mt-1">{formatDate(subsystem.updated_at)}</p>
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
                  <Settings2 className="h-5 w-5 text-primary" />
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
                  <Edit className="mr-2 h-5 w-5" /> Edit Subsystem
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
                <p className="text-sm text-gray-500 mb-2">Subsystem Information</p>
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{subsystem.name}</p>
                  <p className="text-sm text-gray-600 mt-1">ID: {subsystem.id}</p>
                  {subsystem.building_detail && (
                    <Badge className="mt-2 bg-blue-100 text-blue-800 border-blue-200">
                      {subsystem.building_detail.name}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubsystemDetailView;