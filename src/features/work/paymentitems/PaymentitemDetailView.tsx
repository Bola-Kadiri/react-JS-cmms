import { useParams, useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  ArrowLeft, 
  Edit, 
  Loader2,
  DollarSign,
  Receipt,
  FileText,
  ClipboardList,
  Tag,
  Info,
  CalendarClock,
  FileBarChart,
  ExternalLink
} from 'lucide-react';
import { usePaymentitemQuery } from '@/hooks/paymentitem/usePaymentitemQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { PermissionGuard } from '@/components/PermissionGuard';

const PaymentItemDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    data: paymentItem,
    isLoading,
    isError,
    error
  } = usePaymentitemQuery(id);

  const handleBack = () => {
    navigate('/work/payment-items');
  };

  const handleEdit = (id: string) => {
    navigate(`/dashboard/work/payment-items/edit/${id}`);
  };

  const handleViewWorkorder = (workorderId: string) => {
    navigate(`/dashboard/work/orders/view/${workorderId}`);
  };

  // Format currency
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(parseFloat(amount));
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">Loading payment item details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading payment item details</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Payment Items
        </Button>
      </div>
    );
  }

  if (!paymentItem) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment item not found</AlertTitle>
          <AlertDescription>
            The requested payment item could not be found.
          </AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Payment Items
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={handleBack} variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payment Item Details</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Tag className="h-3.5 w-3.5" />
              ID: {paymentItem.id}
            </p>
          </div>
        </div>
        <PermissionGuard feature='requisition' permission='edit'>
        <Button onClick={handleEdit} className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Payment Item
        </Button>
        </PermissionGuard>
      </div>

      {/* Main Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary/5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                {paymentItem.item_name}
              </CardTitle>
              <CardDescription className="mt-1 flex items-center gap-2">
                <ClipboardList className="h-3.5 w-3.5" />
                Connected to Work Order #{paymentItem.work_order}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-2xl font-bold flex items-center">
                <DollarSign className="h-5 w-5 text-primary mr-1" />
                {formatCurrency(paymentItem.amount).replace('$', '')}
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Description Section */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Description
              </h3>
              <div className="bg-muted/20 p-4 rounded-md">
                <p className="text-base">{paymentItem.description || 'No description provided'}</p>
              </div>
            </div>
            
            <Separator />
            
            {/* Work Order Section */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                <ClipboardList className="h-4 w-4 mr-2" />
                Linked Work Order
              </h3>
              <Card className="bg-muted/10">
                <CardContent className="pt-4 pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Work Order #{paymentItem.work_order}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        This payment item is linked to the work order above
                      </p>
                    </div>
                    {/* <Button variant="outline" size="sm" onClick={handleViewWorkOrder} className="gap-1">
                      <ExternalLink className="h-3.5 w-3.5" />
                      View
                    </Button> */}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Separator />
            
            {/* Financial Summary */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                <FileBarChart className="h-4 w-4 mr-2" />
                Financial Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-green-50">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-xl font-bold">{formatCurrency(paymentItem.amount)}</p>
                      </div>
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-50">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Item ID</p>
                        <p className="text-xl font-bold">#{paymentItem.id}</p>
                      </div>
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Tag className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t bg-muted/10 py-4">
          {/* <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              This payment item is part of the financial records
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleBack} className="gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
            <Button variant="default" size="sm" onClick={handleEdit} className="gap-1">
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>
          </div> */}
        </CardFooter>
      </Card>

      {/* Additional Information Card */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <CalendarClock className="h-5 w-5 mr-2 text-primary" />
            Related Information
          </CardTitle>
          <CardDescription>Additional context about this payment item</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-amber-50 rounded-md">
              <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium">Work Order Association</p>
                <p className="text-sm text-muted-foreground">This payment item is associated with Work Order #{paymentItem.work_order}</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-blue-50 rounded-md">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Financial Impact</p>
                <p className="text-sm text-muted-foreground">This payment contributes {formatCurrency(paymentItem.amount)} to the total work order cost</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t">
          <Button variant="outline" className="w-full gap-2" onClick={handleViewWorkOrder}>
            <ClipboardList className="h-4 w-4" />
            View Associated Work Order
          </Button>
        </CardFooter>
      </Card> */}

      {/* Footer Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Payment Items
        </Button>
        {/* <Button onClick={handleEdit} className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Payment Item
        </Button> */}
      </div>
    </div>
  );
};

export default PaymentItemDetailView;