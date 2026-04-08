import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  AlertTriangle, 
  ClipboardCheck,
  Tag,
  Info,
  Scale,
  CalendarDays,
  CheckCircle2, 
  XCircle
} from 'lucide-react';
import { useUnitmeasurementQuery } from '@/hooks/unitmeasurement/useUnitmeasurementQueries';
import { format } from 'date-fns';
import { PermissionGuard } from '@/components/PermissionGuard';

const UnitmeasurementDetailView = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  // Using our custom hook instead of direct query
  const {
    data: unitmeasurement,
    isLoading,
    isError,
    error
  } = useUnitmeasurementQuery(code);

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/accounts/unit-measurements');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/dashboard/accounts/unit-measurements/edit/${code}`);
  };

  // Get type badge styles
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Area':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">{type}</Badge>;
      case 'Packing':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">{type}</Badge>;
      case 'Piece':
        return <Badge variant="outline" className="bg-pink-100 text-pink-800 hover:bg-pink-100">{type}</Badge>;
      case 'Time':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{type}</Badge>;
      case 'Volume':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">{type}</Badge>;
      case 'Weight':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">{type}</Badge>;
      case 'Other':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">{type}</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Get status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
      case 'Inactive':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get date formatted
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading unit measurement details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Error loading unit measurement details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Unit Measurements
        </Button>
      </div>
    );
  }

  if (!unitmeasurement) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Unit measurement not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Unit Measurements
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
          <div>
            <h1 className="text-2xl font-bold">Unit Measurement: {unitmeasurement.code}</h1>
            {/* {unitmeasurement.created_at && (
              <p className="text-muted-foreground text-sm">Created on {formatDate(unitmeasurement.created_at)}</p>
            )} */}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getStatusBadge(unitmeasurement.status)}
            {getTypeBadge(unitmeasurement.type)}
          </div>
          <PermissionGuard feature='reference' permission='edit'>
          <Button onClick={handleEdit} className="bg-green-600 hover:bg-green-700">
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          </PermissionGuard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" /> 
              Unit Measurement Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Code</p>
                    <p className="text-lg font-semibold">{unitmeasurement.code}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Symbol</p>
                    <p className="text-lg font-semibold">{unitmeasurement.symbol}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <div className="mt-1">{getTypeBadge(unitmeasurement.type)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(unitmeasurement.status)}</div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-gray-700 whitespace-pre-line">{unitmeasurement.description || 'No description provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Usage Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Symbol representation with styling based on type */}
            <div className="flex justify-center">
              <div className={`
                flex items-center justify-center rounded-full h-24 w-24 
                ${unitmeasurement.type === 'Weight' ? 'bg-green-50' : 
                  unitmeasurement.type === 'Area' ? 'bg-green-50' : 
                  unitmeasurement.type === 'Volume' ? 'bg-indigo-50' : 
                  unitmeasurement.type === 'Time' ? 'bg-yellow-50' : 
                  unitmeasurement.type === 'Piece' ? 'bg-pink-50' : 
                  unitmeasurement.type === 'Packing' ? 'bg-purple-50' : 'bg-gray-50'}`
              }>
                {unitmeasurement.type === 'Weight' && <Scale className="h-10 w-10 text-green-600" />}
                {unitmeasurement.type === 'Area' && <Tag className="h-10 w-10 text-green-600" />}
                {unitmeasurement.type === 'Volume' && <Tag className="h-10 w-10 text-indigo-600" />}
                {unitmeasurement.type === 'Time' && <CalendarDays className="h-10 w-10 text-yellow-600" />}
                {(unitmeasurement.type === 'Piece' || unitmeasurement.type === 'Packing' || unitmeasurement.type === 'Other') && 
                  <Tag className="h-10 w-10 text-gray-600" />}
              </div>
            </div>

            <Separator />
            
            {/* Unit presentation */}
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Symbol</p>
              <div className="text-3xl font-bold font-mono">{unitmeasurement.symbol}</div>
            </div>
            
            <Separator />
            
            {/* Status indicator */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Availability</p>
              <div className="flex items-center justify-center p-3 rounded-md bg-gray-50">
                {unitmeasurement.status === 'Active' ? (
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm">Available for use</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="text-sm">Not available for use</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Example usage */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Example Usage</p>
              <div className="p-3 rounded-md bg-gray-50 font-mono text-sm">
                100 {unitmeasurement.symbol}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Related information */}
      {/* {unitmeasurement.updated_at && (
        <div className="mt-6 text-sm text-muted-foreground">
          Last updated: {formatDate(unitmeasurement.updated_at)}
        </div>
      )} */}
    </div>
  );
};

export default UnitmeasurementDetailView;