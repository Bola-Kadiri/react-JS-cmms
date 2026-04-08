import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  ArrowLeft, 
  Edit, 
  Clock, 
  Calendar, 
  Bell, 
  Repeat, 
  Briefcase,
  Building,
  Home,
  DollarSign,
  CircleAlert,
  Package,
  Workflow,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Wrench,
  Clipboard,
  MessageSquareWarning,
  Settings,
  FileText,
  Tag,
  Check,
  X
} from 'lucide-react';
import { usePpmQuery, useReviewPpm, useRejectPpm } from '@/hooks/ppm/usePpmQueries';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { useState } from 'react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const PpmDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const { user } = useAuth();
  const isReviewer = (user?.role || '').toUpperCase() === 'REVIEWER';
  
  const {
    data: ppm,
    isLoading,
    isError,
    error
  } = usePpmQuery(id);

  const reviewPpmMutation = useReviewPpm(id);
  const rejectPpmMutation = useRejectPpm();

  const handleBack = () => {
    navigate('/dashboard/calendar/ppms');
  };

  const handleEdit = () => {
    navigate(`/dashboard/calendar/ppms/edit/${id}`);
  };

  const handleReview = (action: 'approve' | 'reject') => {
    setReviewAction(action);
    setReviewDialogOpen(true);
  };

  const confirmReview = () => {
    if (id) {
      reviewPpmMutation.mutate(
        { id, review_action: reviewAction },
        {
          onSuccess: () => {
            setReviewDialogOpen(false);
          }
        }
      );
    }
  };

  const handleRejectWithReason = () => {
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (id && rejectionReason.trim()) {
      rejectPpmMutation.mutate(
        { id, rejection_reason: rejectionReason },
        {
          onSuccess: () => {
            setRejectDialogOpen(false);
            setRejectionReason('');
          },
        }
      );
    }
  };

  // Status badge renderer
  const StatusBadge = ({ status }: { status: string }) => {
    let color = "";
    let icon = null;
    
    switch(status) {
      case "Active":
        color = "bg-green-100 text-green-800";
        icon = <CheckCircle2 className="h-3 w-3 mr-1" />;
        break;
      case "Inactive":
        color = "bg-gray-100 text-gray-800";
        icon = <XCircle className="h-3 w-3 mr-1" />;
        break;
      case "Under Maintenance":
        color = "bg-yellow-100 text-yellow-800";
        icon = <AlertCircle className="h-3 w-3 mr-1" />;
        break;
      case "Disposed":
        color = "bg-red-100 text-red-800";
        icon = <AlertCircle className="h-3 w-3 mr-1" />;
        break;
      case "In Use":
        color = "bg-green-100 text-green-800";
        icon = <Info className="h-3 w-3 mr-1" />;
        break;
      case "Available":
        color = "bg-teal-100 text-teal-800";
        icon = <CheckCircle2 className="h-3 w-3 mr-1" />;
        break;
      default:
        color = "bg-green-100 text-green-800";
        icon = <Info className="h-3 w-3 mr-1" />;
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {icon}
        {status}
      </span>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading PPM details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading PPM details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to PPMs
        </Button>
      </div>
    );
  }

  // Not found state
  if (!ppm) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">PPM not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to PPMs
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
            <h1 className="text-2xl font-bold">PPM Details</h1>
            <p className="text-sm text-muted-foreground">
              ID: {ppm.id} • Created: {new Date(ppm.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={ppm.status} />
          {ppm?.review_status === 'Pending' && (
            <PermissionGuard feature='ppm_setting' permission='review'>
              <Button 
                onClick={() => handleReview('approve')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" /> Approve
              </Button>
              <Button 
                onClick={() => handleReview('reject')}
                variant="destructive"
              >
                <X className="mr-2 h-4 w-4" /> Reject
              </Button>
            </PermissionGuard>
          )}
          {ppm?.review_status === 'Pending' && isReviewer && (
            <Button 
              onClick={handleRejectWithReason}
              variant="destructive"
            >
              <X className="mr-2 h-4 w-4" /> Reject with Reason
            </Button>
          )}
          <PermissionGuard feature='ppm_setting' permission='edit'>
          <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" /> Edit PPM
            </Button>
          </PermissionGuard>
        </div>
      </div>
      
      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">Assets ({ppm?.assets?.length || 0})</TabsTrigger>
          <TabsTrigger value="facilities">Facilities ({ppm?.facilities?.length || 0})</TabsTrigger>
          <TabsTrigger value="apartments">Buildings ({ppm?.buildings?.length || 0})</TabsTrigger>
          <TabsTrigger value="payments">PPM Items ({ppm?.items_detail?.length || 0})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Clipboard className="h-5 w-5 mr-2 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p>{ppm.description || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    {ppm.start_date ? new Date(ppm.start_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">End Date</p>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    {ppm.end_date ? new Date(ppm.end_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Currency</p>
                  <p className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                    {ppm.currency}
                  </p>
                </div>
                {/* <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="flex items-center font-medium text-lg">
                    <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                    {ppm.currency} {ppm.total_amount || '0.00'}
                  </p>
                </div> */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Auto Create Work Order</p>
                  <p>{ppm.auto_create_work_order ? 'Yes' : 'No'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Create Work Order As Approved</p>
                  <p>{ppm.create_work_order_as_approved ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Work Order Information Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Workflow className="h-5 w-5 mr-2 text-primary" />
                Work Order Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Create Work Order Now</p>
                  <p className="flex items-center">
                    <CheckCircle2 className={`h-4 w-4 mr-1 ${ppm.create_work_order_now ? 'text-green-500' : 'text-gray-400'}`} />
                    {ppm.create_work_order_now ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Work Order Priority</p>
                  <Badge 
                    variant="outline" 
                    className={
                      ppm.work_order_priority === 'High' 
                        ? 'bg-red-50 text-red-700 hover:bg-red-50'
                        : ppm.work_order_priority === 'Medium'
                        ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-50'
                        : 'bg-green-50 text-green-700 hover:bg-green-50'
                    }
                  >
                    {ppm.work_order_priority}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Work Order Approved</p>
                  <p className="flex items-center">
                    <CheckCircle2 className={`h-4 w-4 mr-1 ${ppm.work_order_approved ? 'text-green-500' : 'text-gray-400'}`} />
                    {ppm.work_order_approved ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Review Information Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Review Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Review Status</p>
                  <Badge 
                    variant="outline" 
                    className={
                      ppm.review_status === 'Reviewed' 
                        ? 'bg-green-50 text-green-700 hover:bg-green-50'
                        : ppm.review_status === 'Pending'
                        ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-50'
                        : 'bg-red-50 text-red-700 hover:bg-red-50'
                    }
                  >
                    {ppm.review_status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Reviewed By</p>
                  <p>User #{ppm.reviewer}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Reviewed At</p>
                  <p className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    {ppm.reviewed_at ? new Date(ppm.reviewed_at).toLocaleDateString() : 'Not reviewed'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Schedule Info Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Schedule Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Frequency</p>
                  <p className="flex items-center">
                    <Repeat className="h-4 w-4 mr-1 text-muted-foreground" />
                    {ppm.frequency} {ppm.frequency_unit}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Notification Before Due</p>
                  <p className="flex items-center">
                    <Bell className="h-4 w-4 mr-1 text-muted-foreground" />
                    {ppm.notify_before_due} {ppm.notify_unit}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Reminder Frequency</p>
                  <p className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    Every {ppm.send_reminder_every} {ppm.reminder_unit}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Category Info Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Tag className="h-5 w-5 mr-2 text-primary" />
                Category Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <Briefcase className="h-4 w-4 mr-1 text-muted-foreground" />
                    Category
                  </h3>
                  <Card className="bg-slate-50">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Title</span>
                          <span>{ppm.category_detail?.title || 'Not available'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Code</span>
                          <span>{ppm.category_detail?.code || 'Not available'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Status</span>
                          <StatusBadge status={ppm.category_detail?.status || 'Unknown'} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Problem Type</span>
                          <span>{ppm.category_detail?.problem_type || 'Not specified'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <MessageSquareWarning className="h-4 w-4 mr-1 text-muted-foreground" />
                    Subcategory
                  </h3>
                  <Card className="bg-slate-50">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Title</span>
                          <span>{ppm.subcategory_detail?.title || 'Not available'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Description</span>
                          <span>{ppm.subcategory_detail?.description || 'Not available'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Status</span>
                          <StatusBadge status={ppm.subcategory_detail?.status || 'Unknown'} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Exclude Costing Limit</span>
                          <span>{ppm.subcategory_detail?.exclude_costing_limit ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Safety Information */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <CircleAlert className="h-5 w-5 mr-2 text-primary" />
                Safety Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm">{ppm.activities_safety_tips || 'No safety tips provided'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                Assets ({ppm?.assets?.length || 0})
              </CardTitle>
              <CardDescription>Assets linked to this PPM</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {ppm?.assets_detail?.map((asset) => (
                  <Card key={asset.id} className="bg-slate-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{asset.asset_name} - {asset.serial_number || 'No Serial'}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Asset Tag</p>
                              <p className="font-medium">{asset.asset_tag}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Serial Number</p>
                              <p className="font-medium">{asset.serial_number || 'Not available'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Asset Type</p>
                              <p className="font-medium">{asset.asset_type}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Condition</p>
                              <p className="font-medium">{asset.condition}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Purchased Amount</p>
                          <p className="text-xl font-bold">${asset.purchased_amount}</p>
                          <p className="text-xs text-muted-foreground">Purchase Date: {new Date(asset.purchase_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Purchase Date</p>
                            <p className="text-sm">{new Date(asset.purchase_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Lifespan</p>
                            <p className="text-sm">{asset.lifespan || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">OEM Warranty</p>
                            <p className="text-sm">{asset.oem_warranty || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Category</p>
                            <p className="text-sm">{asset.category_detail?.title || 'Not available'}</p>
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
        
        {/* Facilities Tab */}
        <TabsContent value="facilities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-primary" />
                Facilities ({ppm?.facilities?.length || 0})
              </CardTitle>
              <CardDescription>Facilities linked to this PPM</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ppm?.facilities_detail?.map((facility) => (
                  <Card key={facility.id} className="bg-slate-50">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium">{facility.name}</h3>
                          <p className="text-sm text-muted-foreground">Code: {facility.code}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Type</p>
                          <p className="text-sm">{facility.type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Manager ID</p>
                          <p className="text-sm">{facility.manager}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs text-muted-foreground mb-2">GPS Address</p>
                        <p className="text-sm">{facility.address_gps || 'Not provided'}</p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div>
                          <p className="text-xs text-muted-foreground">Cluster</p>
                          <p className="text-sm">{facility.cluster_detail?.name || 'Not available'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Buildings Tab */}
        <TabsContent value="apartments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="h-5 w-5 mr-2 text-primary" />
                Buildings ({ppm?.buildings?.length || 0})
              </CardTitle>
              <CardDescription>Buildings linked to this PPM</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center text-muted-foreground py-8">
                  <p>Building details would be displayed here when available.</p>
                  <p className="text-sm">({ppm?.buildings?.length || 0} buildings selected)</p>
                      </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* PPM Items Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                PPM Items ({ppm?.items_detail?.length || 0})
              </CardTitle>
              <CardDescription>PPM items associated with this PPM</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ppm?.items_detail?.map((item) => (
                  <Card key={item.id} className="bg-slate-50">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-medium">{item.description}</h3>
                          <p className="text-sm text-muted-foreground">Item ID: {item.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Price</p>
                          <p className="text-xl font-bold text-green-600">₦{item.total_price}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                          <p className="text-sm font-medium">{item.qty}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Unit Price</p>
                          <p className="text-sm font-medium">₦{item.unit_price}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Unit</p>
                          <p className="text-sm font-medium">{item.unit}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!ppm?.items_detail || ppm?.items_detail?.length === 0) && (
                  <div className="text-center text-muted-foreground py-8">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No PPM items found</p>
                    <p className="text-sm">PPM items will be displayed here when available.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Confirmation Dialog */}
      <AlertDialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {reviewAction === 'approve' ? 'Approve PPM' : 'Reject PPM'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {reviewAction} this PPM? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmReview}
              disabled={reviewPpmMutation.isPending}
              className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {reviewPpmMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {reviewAction === 'approve' ? 'Approving...' : 'Rejecting...'}
                </>
              ) : (
                <>
                  {reviewAction === 'approve' ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <X className="mr-2 h-4 w-4" />
                  )}
                  {reviewAction === 'approve' ? 'Approve' : 'Reject'}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog with Reason */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject PPM</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting PPM ID: {ppm.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection_reason">Rejection Reason <span className="text-red-500">*</span></Label>
              <Textarea
                id="rejection_reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={!rejectionReason.trim() || rejectPpmMutation.isPending}
            >
              {rejectPpmMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Reject PPM
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PpmDetailView;