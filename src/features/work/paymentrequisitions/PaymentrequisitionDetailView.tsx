import { useParams, useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  ArrowLeft, 
  Edit, 
  Loader2,
  Calendar,
  DollarSign,
  Building,
  FileText,
  CreditCard,
  Clock,
  User,
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  BriefcaseBusiness,
  Landmark,
  Tag,
  Clipboard,
  Hash,
  MessageSquare,
  Package,
  FileSpreadsheet,
  Banknote,
  BadgePercent
} from 'lucide-react';
import { usePaymentrequisitionQuery } from '@/hooks/paymentrequisition/usePaymentrequisitionQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { PermissionGuard } from '@/components/PermissionGuard';

const PaymentRequisitionDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    data: paymentRequisition,
    isLoading,
    isError,
    error
  } = usePaymentrequisitionQuery(id);

  const handleBack = () => {
    navigate('/work/payment-requisitions');
  };

  const handleEdit = (id: string) => {
    navigate(`/dashboard/work/payment-requisitions/edit/${id}`);
  };

  // Generate status badge with appropriate styling
  const StatusBadge = ({ status }: { status: string }) => {
    let variant = "default";
    let icon = null;
    
    switch(status.toLowerCase()) {
      case "active":
        variant = "success";
        icon = <CheckCircle2 className="h-3 w-3 mr-1" />;
        break;
      case "inactive":
        variant = "outline";
        icon = <XCircle className="h-3 w-3 mr-1" />;
        break;
      case "pending":
        variant = "warning";
        icon = <AlertTriangle className="h-3 w-3 mr-1" />;
        break;
      case "approved":
        variant = "success";
        icon = <CheckCircle2 className="h-3 w-3 mr-1" />;
        break;
      case "request":
        variant = "secondary";
        icon = <ClipboardList className="h-3 w-3 mr-1" />;
        break;
      default:
        variant = "default";
        icon = <CheckCircle2 className="h-3 w-3 mr-1" />;
    }
    
    return (
      <Badge variant={variant as any} className="flex items-center gap-1">
        {icon}
        {status}
      </Badge>
    );
  };

  // Format currency with symbol
  const formatCurrency = (amount: string, currency: string) => {
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'NGN': '₦'
    };
    
    const symbol = symbols[currency] || currency;
    return `${symbol}${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return dateString || 'N/A';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">Loading payment requisition details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading payment requisition details</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Payment Requisitions
        </Button>
      </div>
    );
  }

  // Not found state
  if (!paymentRequisition) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment requisition not found</AlertTitle>
          <AlertDescription>
            The requested payment requisition could not be found.
          </AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Payment Requisitions
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
            <h1 className="text-2xl font-bold tracking-tight">Payment Requisition</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Hash className="h-3.5 w-3.5" />
              {paymentRequisition.requisition_number}
              <span className="h-1 w-1 rounded-full bg-muted-foreground inline-block"></span>
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(paymentRequisition.requisition_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={paymentRequisition.approval_status} />
          <PermissionGuard feature='requisition' permission='edit'>
          <Button onClick={() => handleEdit(id)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Requisition
          </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Payment Items ({paymentRequisition.items.length})</TabsTrigger>
          <TabsTrigger value="workorders">Work Orders ({paymentRequisition.work_orders.length})</TabsTrigger>
          <TabsTrigger value="approvals">Approvals ({paymentRequisition.request_to.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">Expected Payment</span>
                    <span className="text-2xl font-bold mt-1">
                      {formatCurrency(paymentRequisition.expected_payment_amount, paymentRequisition.pay_to_detail.currency)}
                    </span>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Due on {formatDate(paymentRequisition.expected_payment_date)}</p>
              </CardContent>
            </Card>

            <Card className="bg-secondary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">Withholding Tax</span>
                    <span className="text-2xl font-bold mt-1">
                      {formatCurrency(paymentRequisition.withholding_tax, paymentRequisition.pay_to_detail.currency)}
                    </span>
                  </div>
                  <div className="h-12 w-12 bg-secondary/10 rounded-full flex items-center justify-center">
                    <BadgePercent className="h-6 w-6 text-secondary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Tax deduction from payment</p>
              </CardContent>
            </Card>

            <Card className="bg-muted">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <span className="text-xl font-bold mt-1 flex items-center">
                      <StatusBadge status={paymentRequisition.status} />
                      <span className="ml-2">•</span>
                      <StatusBadge status={paymentRequisition.approval_status} />
                    </span>
                  </div>
                  <div className="h-12 w-12 bg-background rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-foreground" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Created on {formatDate(paymentRequisition.created_at)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payee Information */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <BriefcaseBusiness className="h-5 w-5 mr-2 text-primary" />
                  Pay To
                </CardTitle>
                <CardDescription>Details of payment recipient</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{paymentRequisition.pay_to_detail.name}</span>
                    <Badge>{paymentRequisition.pay_to_detail.type}</Badge>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Contact</span>
                      <span className="text-sm">{paymentRequisition.pay_to_detail.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Phone</span>
                      <span className="text-sm">{paymentRequisition.pay_to_detail.phone}</span>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Landmark className="h-4 w-4 mr-1 text-muted-foreground" />
                      Bank Details
                    </h4>
                    <div className="grid grid-cols-1 gap-2 bg-muted/20 p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Bank</span>
                        <span className="text-sm font-medium">{paymentRequisition.pay_to_detail.bank}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Account Name</span>
                        <span className="text-sm font-medium">{paymentRequisition.pay_to_detail.account_name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Account Number</span>
                        <span className="text-sm font-medium">{paymentRequisition.pay_to_detail.account_number}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Currency</span>
                        <span className="text-sm font-medium">{paymentRequisition.pay_to_detail.currency}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Request Details */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <FileSpreadsheet className="h-5 w-5 mr-2 text-primary" />
                  Requisition Details
                </CardTitle>
                <CardDescription>Payment and requisition information</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">Requisition #</h4>
                      <p className="text-sm font-medium">{paymentRequisition.requisition_number}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">Date Created</h4>
                      <p className="text-sm font-medium">{formatDate(paymentRequisition.requisition_date)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">Payment Due</h4>
                      <p className="text-sm font-medium">{formatDate(paymentRequisition.expected_payment_date)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">Requires Retirement</h4>
                      <p className="text-sm font-medium">{paymentRequisition.retirement ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2">Remarks</h4>
                    <div className="bg-muted/20 p-3 rounded-md">
                      <p className="text-sm">{paymentRequisition.remark}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Comments</h4>
                    <div className="bg-muted/20 p-3 rounded-md">
                      <p className="text-sm">{paymentRequisition.comment}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Requesters Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 mr-2 text-primary" />
                Request Recipients
              </CardTitle>
              <CardDescription>Users who received this payment request</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentRequisition.request_to_detail.map((user) => (
                  <Card key={user.id} className="bg-muted/20">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
                          <AvatarFallback>{user.first_name.charAt(0)}{user.last_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.first_name} {user.last_name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {user.roles}
                            </Badge>
                            <StatusBadge status={user.status} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Items Tab */}
        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="h-5 w-5 mr-2 text-primary" />
                Payment Items ({paymentRequisition.items.length})
              </CardTitle>
              <CardDescription>Items included in this payment requisition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentRequisition.items_detail.map((item) => (
                  <Card key={item.id} className="bg-muted/10">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-medium">{item.item_name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Tag className="h-3 w-3" />
                            Work Order: #{item.work_order}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="text-xl font-bold">
                            {formatCurrency(item.amount, paymentRequisition.pay_to_detail.currency)}
                          </p>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Description</p>
                        <p className="text-sm">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-end">
              <div className="space-y-2 w-full max-w-xs">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Subtotal:</span>
                  <span className="text-sm">
                    {formatCurrency(
                      paymentRequisition.items_detail.reduce((sum, item) => sum + parseFloat(item.amount), 0).toString(),
                      paymentRequisition.pay_to_detail.currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Withholding Tax:</span>
                  <span className="text-sm">
                    {formatCurrency(paymentRequisition.withholding_tax, paymentRequisition.pay_to_detail.currency)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-base font-medium">Total Payment:</span>
                  <span className="text-base font-bold">
                    {formatCurrency(paymentRequisition.expected_payment_amount, paymentRequisition.pay_to_detail.currency)}
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Work Orders Tab */}
        <TabsContent value="workorders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardList className="h-5 w-5 mr-2 text-primary" />
                Associated Work Orders ({paymentRequisition.work_orders.length})
              </CardTitle>
              <CardDescription>Work orders linked to this payment requisition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentRequisition.work_orders_detail.map((workOrder) => (
                  <Card key={workOrder.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/20 pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{workOrder.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Hash className="h-3 w-3" />
                            {workOrder.work_order_number}
                            <span className="h-1 w-1 rounded-full bg-muted-foreground inline-block"></span>
                            <Tag className="h-3 w-3" />
                            {workOrder.type}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <StatusBadge status={workOrder.status} />
                          <Badge variant={
                            workOrder.priority === "High" ? "destructive" : 
                            workOrder.priority === "Medium" ? "secondary" : "default"
                          }>
                            {workOrder.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Description</h4>
                          <p className="text-sm">{workOrder.description}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Facility</p>
                            <p className="text-sm font-medium">{workOrder.facility_detail.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Department</p>
                            <p className="text-sm font-medium">{workOrder.department_detail.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Apartment</p>
                            <p className="text-sm font-medium">{workOrder.apartment_detail.no} - {workOrder.apartment_detail.type}</p>
                          </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Category</p>
                            <p className="text-sm font-medium">{workOrder.category_detail.title}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Subcategory</p>
                            <p className="text-sm font-medium">{workOrder.subcategory_detail.title}</p>
                          </div>
                        </div>
                        {workOrder.asset_detail && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="text-sm font-medium mb-2 flex items-center">
                                <Package className="h-4 w-4 mr-1 text-muted-foreground" />
                                Asset Information
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-muted/20 p-3 rounded-md">
                                <div>
                                  <p className="text-xs text-muted-foreground">Asset</p>
                                  <p className="text-sm font-medium">{workOrder.asset_detail.model} ({workOrder.asset_detail.type})</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Serial Number</p>
                                  <p className="text-sm font-medium">{workOrder.asset_detail.serial_number}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Status</p>
                                  <p className="text-sm font-medium">{workOrder.asset_detail.status}</p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                        {workOrder.remark && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="text-sm font-medium mb-1">Remarks</h4>
                              <p className="text-sm">{workOrder.remark}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t py-3 flex justify-between bg-muted/10">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {workOrder.item_cost ? formatCurrency(workOrder.item_cost, workOrder.currency) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{workOrder.expected_start_date ? formatDate(workOrder.expected_start_date) : 'No start date'}</span>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
                Approval Status
              </CardTitle>
              <CardDescription>Current approval status is <Badge>{paymentRequisition.approval_status}</Badge></CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className={
                paymentRequisition.approval_status === "approve" ? "bg-green-50 border-green-200 text-green-800" :
                paymentRequisition.approval_status === "request" ? "bg-yellow-50 border-yellow-200 text-yellow-800" :
                "bg-yellow-50 border-yellow-200 text-yellow-800"
              }>
                <AlertTitle className="flex items-center gap-2">
                  {paymentRequisition.approval_status === "approve" ? 
                    <CheckCircle2 className="h-4 w-4" /> : 
                    <AlertCircle className="h-4 w-4" />
                  }
                  {paymentRequisition.approval_status === "approve" ? 
                    "This payment requisition has been approved" : 
                    "This payment requisition is awaiting approval"
                  }
                </AlertTitle>
                <AlertDescription>
                  {paymentRequisition.comment}
                </AlertDescription>
              </Alert>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Approval Recipients</h3>
                <div className="space-y-4">
                  {paymentRequisition.request_to_detail.map((user) => (
                    <div key={user.id} className="flex items-start p-4 border rounded-md bg-muted/10">
                      <Avatar className="mr-3">
                        <AvatarImage src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
                        <AvatarFallback>{user.first_name.charAt(0)}{user.last_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{user.first_name} {user.last_name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <StatusBadge status={user.status} />
                        </div>
                        <div className="mt-2">
                          <Badge variant="outline" className="mr-2">{user.roles}</Badge>
                          {user.team_lead && <Badge variant="secondary">Team Lead</Badge>}
                        </div>
                        {user.approval_limit && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Approval limit: {formatCurrency(user.approval_limit, paymentRequisition.pay_to_detail.currency)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t flex justify-between py-4">
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex gap-2">
                {/* {paymentRequisition.approval_status !== "approve" && (
                  <Button variant="default" className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </Button>
                )} */}
                <Button variant="outline" onClick={() => handleEdit(id)} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Payment Requisitions
        </Button>
        {/* <Button onClick={handleEdit} className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Requisition
        </Button> */}
      </div>
    </div>
  );
};

export default PaymentRequisitionDetailView;