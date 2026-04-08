import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  AlertTriangle, 
  Building, 
  Users
} from 'lucide-react';
import { useDepartmentQuery } from '@/hooks/department/useDepartmentQueries';
import { PermissionGuard } from '@/components/PermissionGuard';

const DepartmentDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Using our custom hook instead of direct query
  const {
    data: department,
    isLoading,
    isError,
    error
  } = useDepartmentQuery(id);

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/accounts/departments');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/dashboard/accounts/departments/edit/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading department details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Error loading department details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Departments
        </Button>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Department not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Departments
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="h-10 w-10 rounded-full shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{department.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">Department ID: {department.id}</p>
          </div>
        </div>
        <PermissionGuard feature='reference' permission='edit'>
          <Button onClick={handleEdit} className="rounded-full shadow-sm">
            <Edit className="mr-2 h-4 w-4" /> Edit Department
          </Button>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Main Department Info Card */}
        <Card className="overflow-hidden border-none shadow-lg">
          <div className="bg-gradient-to-r from-primary to-green-600 p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-white text-2xl font-bold">{department.name}</h2>
                  <p className="text-green-100 mt-1 flex items-center gap-2">
                    <Building className="h-4 w-4" /> Department
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <CardContent className="pt-8 pb-6 px-6">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                  <Building className="h-5 w-5 text-primary" />
                  Department Information
                </h3>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Department Name</p>
                      <p className="text-lg font-semibold text-gray-900">{department.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Department ID</p>
                      <p className="text-lg font-semibold text-gray-900">{department.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DepartmentDetailView;