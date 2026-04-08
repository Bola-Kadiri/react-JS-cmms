// src/features/facility/apartments/ApartmentDetailView.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  Building2, 
  Home, 
  User, 
  CalendarRange, 
  MapPin, 
  SquareStack, 
  Info,
  KeyRound,
  Check,
  X,
  Calendar
} from 'lucide-react';
import { useApartmentQuery } from '@/hooks/apartment/useApartmentQueries';
import { format } from 'date-fns';

const ApartmentDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Using our custom hook instead of direct query
  const { 
    data: apartment,
    isLoading,
    isError,
    error
  } = useApartmentQuery(id);

  // Handle back button click
  const handleBack = () => {
    navigate('/facility/apartments');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/facility/apartments/edit/${id}`);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to determine status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
      case 'Inactive':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Helper function to determine ownership type badge color
  const getOwnershipBadge = (type: string) => {
    switch (type) {
      case 'Freehold':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{type}</Badge>;
      case 'Leasehold':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">{type}</Badge>;
      case 'Freehold (Leased Out)':
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">{type}</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Helper function for boolean indicators
  const BooleanIndicator = ({ value, label }: { value: boolean; label: string }) => (
    <div className="flex items-center gap-2">
      {value ? (
        <Check className="h-5 w-5 text-green-500" />
      ) : (
        <X className="h-5 w-5 text-red-500" />
      )}
      <span className={value ? "text-green-700" : "text-red-700"}>{label}</span>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading apartment details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading apartment details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Apartments
        </Button>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Apartment not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Apartments
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Home className="h-6 w-6 text-primary" />
              Apartment {apartment.no}
            </h1>
            <p className="text-muted-foreground">{apartment.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(apartment.status)}
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" /> Edit
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  Building
                </div>
                <p className="text-lg font-medium">
                  {apartment.building_detail?.name || `Building #${apartment.building}`}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <KeyRound className="h-4 w-4" />
                  Ownership Type
                </div>
                <div>{getOwnershipBadge(apartment.ownership_type)}</div>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Landlord
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-medium">
                    {apartment.landlord_detail?.name || `Landlord #${apartment.landlord}`}
                  </p>
                  {apartment.landlord_detail?.email && (
                    <p className="text-sm text-muted-foreground">
                      {apartment.landlord_detail.email}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <SquareStack className="h-4 w-4" />
                  Size
                </div>
                <p className="text-lg font-medium">{apartment.no_of_sqm} sqm</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Address
              </div>
              <p className="text-lg">{apartment.address}</p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Service/Power Charge Start Date
              </div>
              <p className="text-lg">{formatDate(apartment.service_power_charge_start_date)}</p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                Description
              </div>
              <p className="text-base">{apartment.description || 'No description provided'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Status Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-primary" />
              Status Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <BooleanIndicator value={apartment.bookable} label="Bookable" />
              <BooleanIndicator value={apartment.common_area} label="Common Area" />
              <BooleanIndicator value={apartment.available_for_lease} label="Available for Lease" />
              <BooleanIndicator value={apartment.remit_lease_payment} label="Remit Lease Payment" />
            </div>
            
            <Separator />
            
            <div className="pt-2">
              <div className="rounded-md bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Building Code</p>
                    <p className="text-sm text-muted-foreground">{apartment.building_detail?.code || 'N/A'}</p>
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

export default ApartmentDetailView;