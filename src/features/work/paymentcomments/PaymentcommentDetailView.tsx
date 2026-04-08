import { useParams, useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  ArrowLeft, 
  Edit, 
  MapPin, 
  Package, 
  Server, 
  Tag,
  // Toggle,
  Loader2,
  Building2
} from 'lucide-react';
import { usePaymentcommentQuery } from '@/hooks/paymentcomment/usePaymentCommentQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { PermissionGuard } from '@/components/PermissionGuard';

const PaymentcommentDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    data: paymentcomment,
    isLoading,
    isError,
    error
  } = usePaymentcommentQuery(id);

  const handleBack = () => {
    navigate('/work/payment-comments');
  };

  const handleEdit = () => {
    navigate(`/dashboard/work/payment-comments/edit/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">Loading paymentcomment details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading paymentcomment details</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Paymentcomments
        </Button>
      </div>
    );
  }

  if (!paymentcomment) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Paymentcomment not found</AlertTitle>
          <AlertDescription>
            The requested paymentcomment could not be found.
          </AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Paymentcomments
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={handleBack} variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Paymentcomment Details</h1>
        </div>
        <PermissionGuard feature='requisition' permission='edit'>
        <Button onClick={handleEdit} className="gap-2 md:self-end">
          <Edit className="h-4 w-4" />
          Edit Paymentcomment
        </Button>
        </PermissionGuard>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                {/* {paymentcomment.title} */}
              </CardTitle>
              <CardDescription className="mt-1 flex items-center gap-2">
                <Tag className="h-3.5 w-3.5" />
                {/* {paymentcomment.code} */}
              </CardDescription>
            </div>
            {/* <Badge variant={paymentcomment.is_active ? "default" : "outline"} className="self-start md:self-auto">
              {paymentcomment.is_active ? 'Active' : 'Inactive'}
            </Badge> */}
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                {/* <p className="text-base">{paymentcomment.description || 'Not provided'}</p> */}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Location</h3>
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  {/* <p className="text-base">{paymentcomment.location || 'Not specified'}</p> */}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Capacity</h3>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {/* <p className="text-base">{paymentcomment.capacity.toLocaleString()} units</p> */}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Paymentcomment ID</h3>
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  <p className="text-base">{paymentcomment.id}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t bg-muted/20 py-4">
          <div className="flex items-center gap-2">
            {/* <Toggle className="h-4 w-4" /> */}
            <span className="text-sm font-medium">
              {/* Status: {paymentcomment.is_active ? 'Active' : 'Inactive'} */}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleBack}>
            Back to Paymentcomments
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentcommentDetailView;