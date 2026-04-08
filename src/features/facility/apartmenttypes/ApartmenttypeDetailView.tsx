// src/features/facility/apartment-type/ApartmenttypeDetailView.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Loader2, Tag, Info, CheckCircle, XCircle } from 'lucide-react';
import { useApartmenttypeQuery } from '@/hooks/apartmenttype/useApartmenttypeQueries';

const ApartmenttypeDetailView = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Using our custom hook instead of direct query
  const { 
    data: apartmenttype,
    isLoading,
    isError,
    error
  } = useApartmenttypeQuery(slug);

  // Handle back button click
  const handleBack = () => {
    navigate('/facility/apartment-type');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/facility/apartment-type/edit/${slug}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading apartmenttype details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading apartmenttype details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Apartmenttypes
        </Button>
      </div>
    );
  }

  if (!apartmenttype) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Apartmenttype not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Apartmenttypes
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
            className="rounded-full shadow-sm hover:shadow transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Apartmenttype Details</h1>
        </div>
        <Button 
          onClick={handleEdit} 
          className="rounded-md shadow-sm hover:shadow-md transition-all"
        >
          <Edit className="mr-2 h-4 w-4" /> Edit Apartmenttype
        </Button>
      </div>
      
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50 border-b pb-8">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">ID: {apartmenttype.id}</span>
              </div>
              <Badge className={`${getBadgeVariant(apartmenttype.status)} px-3 py-1 rounded-full text-xs font-medium`}>
                {apartmenttype.status}
              </Badge>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800">{apartmenttype.name}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Slug:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">{apartmenttype.slug}</code>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="flex items-center justify-center p-8">
            {apartmenttype.status === 'Active' ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="rounded-full bg-green-50 p-4">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-800">
                    This apartmenttype is currently <span className="font-bold text-green-600">Active</span>
                  </p>
                  <p className="text-gray-500 mt-2">
                    Active apartmenttypes are available for use in the system
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="rounded-full bg-red-50 p-4">
                  <XCircle className="h-12 w-12 text-red-500" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-800">
                    This apartmenttype is currently <span className="font-bold text-red-600">Inactive</span>
                  </p>
                  <p className="text-gray-500 mt-2">
                    Inactive apartmenttypes are not available for use in the system
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="bg-gray-50 p-6 border-t">
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleBack} 
              className="rounded-md shadow-sm hover:shadow transition-all"
            >
              Back to Apartmenttypes
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ApartmenttypeDetailView;