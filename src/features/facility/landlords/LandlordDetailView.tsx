// src/features/facility/landlords/LandlordDetailView.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { useLandlordQuery } from '@/hooks/landlord/useLandlordQueries';

const LandlordDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Using our custom hook instead of direct query
  const { 
    data: landlord, 
    isLoading, 
    isError,
    error 
  } = useLandlordQuery(id);

  // Handle back button click
  const handleBack = () => {
    navigate('/facility/landlords');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/facility/landlords/edit/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading landlord details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading landlord details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Landlords
        </Button>
      </div>
    );
  }

  if (!landlord) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Landlord not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Landlords
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Landlord Details</h1>
        </div>
        <Button onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" /> Edit Landlord
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Landlord Info Card */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Landlord Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-lg">{landlord.name}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    landlord.status === 'Active' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {landlord.status}
                  </span>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{landlord.email}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-lg">{landlord.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <p className="text-lg whitespace-pre-line">{landlord.address || 'No address provided'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LandlordDetailView;