import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  AlertTriangle, 
  Building, 
  Wrench, 
  Banknote, 
  Tag, 
  User, 
  Users, 
  Briefcase, 
  CheckCircle2,
  FileText,
  Download,
  Eye,
  File,
  Image as ImageIcon,
  Paperclip
} from 'lucide-react';
import { useWorkorderQuery, useApproveByApprover, useApproveByReviewer } from '@/hooks/workorder/useWorkorderQueries';
import { format } from 'date-fns';
import { PermissionGuard } from '@/components/PermissionGuard';
import { usePermissions } from '@/contexts/PermissionsContext';
import WorkorderPrintView from './WorkorderPrintView';

const WorkorderDetailView = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { userRole } = usePermissions();
  
  // Using our custom hook instead of direct query
  const {
    data: workorder,
    isLoading,
    isError,
    error
  } = useWorkorderQuery(slug);

  // Hooks for approve and review actions
  const approveByApproverMutation = useApproveByApprover(slug);
  const approveByReviewerMutation = useApproveByReviewer(slug);

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/work/orders');
  };

  // Handle edit button click
  const handleEdit = (slug: string) => {
    navigate(`/dashboard/work/orders/edit/${slug}`);
  };

  // Handle approve button click
  const handleApprove = () => {
    approveByApproverMutation.mutate();
  };

  // Handle review button click
  const handleReview = () => {
    approveByReviewerMutation.mutate();
  };

  // Get priority badge styles
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">{priority}</Badge>;
      case 'Medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{priority}</Badge>;
      case 'Low':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">{priority}</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Get type badge styles
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'FROM-PPM':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">From PPM</Badge>;
      case 'FROM-WORK-REQUEST':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">From Work Request</Badge>;
      case 'RAISE-PAYMENT':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Raise Payment</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Format currency
  const formatCurrency = (cost: string, currency: string) => {
    if (!cost) return 'N/A';
    const amount = parseFloat(cost);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-green-600">Loading work order details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Error loading work order details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Work Orders
        </Button>
      </div>
    );
  }

  if (!workorder) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Work order not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Work Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="border-green-200 hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4 text-green-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-green-800">Work Order #{workorder.work_order_number}</h1>
            <p className="text-green-600 text-sm">Created on {format(new Date(workorder.created_at), 'PPP')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {getTypeBadge(workorder.type)}
              {workorder.priority && getPriorityBadge(workorder.priority)}
            </div>
            {workorder.cost && workorder.currency && (
              <div className="text-right">
                <p className="text-lg font-semibold text-green-700">
                  {formatCurrency(workorder.cost, workorder.currency)}
                </p>
                <p className="text-xs text-green-500">Total Cost</p>
              </div>
            )}
          </div>
          
          {/* Review Button - Only visible to REVIEWER role */}
          {!workorder.is_reviewed && userRole === 'REVIEWER' && (
            <Button 
              onClick={handleReview}
              disabled={approveByReviewerMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {approveByReviewerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reviewing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Review
                </>
              )}
            </Button>
          )}
          
          {/* Approve Button - Only visible to APPROVER role */}
          {!workorder.is_approved && workorder.is_reviewed && userRole === 'APPROVER' && (
            <Button 
              onClick={handleApprove}
              disabled={approveByApproverMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {approveByApproverMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </>
              )}
            </Button>
          )}
          
          {/* Print/Download Button */}
          <WorkorderPrintView workorder={workorder} />
          
          <PermissionGuard feature='work_order' permission='edit'>
            <Button 
              onClick={() => handleEdit(workorder.slug)}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              <Edit className="mr-2 h-4 w-4" /> Edit Work Order
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 bg-green-50 border border-green-200">
          <TabsTrigger value="overview" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Details</TabsTrigger>
          <TabsTrigger value="location" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Location & Asset</TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Financial</TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Assignments</TabsTrigger>
          <TabsTrigger value="attachments" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Attachments {workorder.resources_data && workorder.resources_data.length > 0 && `(${workorder.resources_data.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Card */}
          <Card className="border-green-200 shadow-sm">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <FileText className="h-5 w-5" />
                Work Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Title</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {workorder.title || 'No title provided'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {workorder.description || 'No description provided'}
                    </p>
                  </div>
                  {workorder.expected_start_date && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Expected Start Date</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {format(new Date(workorder.expected_start_date), 'PPP')}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Work Order #</p>
                      <p className="text-base font-semibold text-green-700">#{workorder.work_order_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Type</p>
                      <div className="mt-1">{getTypeBadge(workorder.type)}</div>
                    </div>
                  </div>
                  {workorder.priority && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Priority</p>
                        <div className="mt-1">{getPriorityBadge(workorder.priority)}</div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <div className="mt-1">
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            {workorder.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source Information */}
            <Card className="border-green-200 shadow-sm">
              <CardHeader className="bg-green-50 border-b border-green-100">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Tag className="h-5 w-5" />
                  Source Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <div className="mt-1">{getTypeBadge(workorder.type)}</div>
                </div>
                {workorder.source_ppm && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Source PPM ID</p>
                    <p className="text-base font-medium text-gray-900">{workorder.source_ppm}</p>
                  </div>
                )}
                {workorder.source_work_request && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Source Work Request ID</p>
                    <p className="text-base font-medium text-gray-900">{workorder.source_work_request}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Information */}
            <Card className="border-green-200 shadow-sm">
              <CardHeader className="bg-green-50 border-b border-green-100">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Briefcase className="h-5 w-5" />
                  Category Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {workorder.category_detail && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Category</p>
                    <p className="text-base font-medium text-gray-900">{workorder.category_detail.name}</p>
                  </div>
                )}
                {workorder.subcategory_detail && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Subcategory</p>
                    <p className="text-base font-medium text-gray-900">{workorder.subcategory_detail.title}</p>
                  </div>
                )}
                {workorder.priority && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Priority</p>
                    <div className="mt-1">{getPriorityBadge(workorder.priority)}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Location & Asset Tab */}
        <TabsContent value="location" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Facility Information */}
            <Card className="border-green-200 shadow-sm">
              <CardHeader className="bg-green-50 border-b border-green-100">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Building className="h-5 w-5" />
                  Facility & Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {workorder.facility_detail ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Facility Name</p>
                      <p className="text-base font-medium text-gray-900">{workorder.facility_detail.name}</p>
                    </div>
                    {workorder.facility_detail.code && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Facility Code</p>
                        <p className="text-base font-medium text-gray-900">{workorder.facility_detail.code}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">No facility information available</p>
                )}
                {workorder.building_detail ? (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Building</p>
                    <p className="text-base font-medium text-gray-900">{workorder.building_detail.name}</p>
                  </div>
                ) : workorder.building ? (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Building ID</p>
                    <p className="text-base font-medium text-gray-900">{workorder.building}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Asset Information */}
            <Card className="border-green-200 shadow-sm">
              <CardHeader className="bg-green-50 border-b border-green-100">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Wrench className="h-5 w-5" />
                  Asset Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {workorder.asset_detail ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Asset Name</p>
                      <p className="text-base font-medium text-gray-900">{workorder.asset_detail.asset_name}</p>
                    </div>
                    {workorder.asset_detail.asset_type && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Asset Type</p>
                        <p className="text-base font-medium text-gray-900">{workorder.asset_detail.asset_type}</p>
                      </div>
                    )}
                  </>
                ) : workorder.asset ? (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Asset ID</p>
                    <p className="text-base font-medium text-gray-900">{workorder.asset}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No asset information available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <Card className="border-green-200 shadow-sm">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Banknote className="h-5 w-5" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workorder.cost && (
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-600">Total Cost</p>
                    <p className="text-2xl font-bold text-green-800">
                      {formatCurrency(workorder.cost, workorder.currency || 'USD')}
                    </p>
                  </div>
                )}
                {workorder.currency && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-600">Currency</p>
                    <p className="text-xl font-semibold text-blue-800">{workorder.currency}</p>
                  </div>
                )}
                <div className="space-y-4">
                  {workorder.require_quotation && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">Quotation Required</span>
                    </div>
                  )}
                  {workorder.payment_requisition && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">Payment Requisition Required</span>
                    </div>
                  )}
                  {workorder.wo_required && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">WO Required</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Information */}
            <Card className="border-green-200 shadow-sm">
              <CardHeader className="bg-green-50 border-b border-green-100">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Briefcase className="h-5 w-5" />
                  Department
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {workorder.department ? (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Department ID</p>
                    <p className="text-base font-medium text-gray-900">{workorder.department}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No department assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Assignee Information */}
            <Card className="border-green-200 shadow-sm">
              <CardHeader className="bg-green-50 border-b border-green-100">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <User className="h-5 w-5" />
                  Assignee
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {workorder.request_to_detail ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Assigned To</p>
                      <p className="text-base font-medium text-gray-900">
                        {workorder.request_to_detail.first_name} {workorder.request_to_detail.last_name}
                      </p>
                    </div>
                    {workorder.request_to_detail.email && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-base text-gray-700">{workorder.request_to_detail.email}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">No assignee specified</p>
                )}
                {workorder.requester_detail && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Requested By</p>
                      <p className="text-base font-medium text-gray-900">
                        {workorder.requester_detail.first_name} {workorder.requester_detail.last_name}
                      </p>
                    </div>
                    {workorder.requester_detail.email && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Requester Email</p>
                        <p className="text-base text-gray-700">{workorder.requester_detail.email}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reviewers Information */}
          <Card className="border-green-200 shadow-sm">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <User className="h-5 w-5" />
                Reviewers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {workorder.reviewers_detail && workorder.reviewers_detail.length > 0 ? (
                  workorder.reviewers_detail.map((reviewer) => (
                    <div key={reviewer.id} className="flex items-start gap-6 p-4 bg-gray-50 rounded-lg border">
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-gray-900">{`${reviewer.first_name} ${reviewer.last_name}`}</p>
                        <div className="text-base text-gray-600">{reviewer.email}</div>
                        {reviewer.roles && (
                          <div className="text-sm text-gray-500">{reviewer.roles}</div>
                        )}
                        <div className="mt-2">
                          <Badge variant="outline" className={reviewer.status === 'Active' ? 
                            'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                            {reviewer.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No reviewers assigned</p>
                    <p className="text-sm text-gray-500 mt-1">This work order has not been assigned to any reviewers yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attachments Tab */}
        <TabsContent value="attachments" className="space-y-6">
          <Card className="border-green-200 shadow-sm">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Paperclip className="h-5 w-5" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {workorder.resources_data && workorder.resources_data.length > 0 ? (
                <div className="space-y-4">
                  {workorder.resources_data.map((resource, index) => {
                    const fileName = resource.file.split('/').pop() || `attachment-${index + 1}`;
                    const fileExtension = fileName.split('.').pop()?.toLowerCase();
                    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension || '');
                    
                    return (
                      <div 
                        key={resource.object_id || index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          {isImage ? (
                            <ImageIcon className="h-8 w-8 text-blue-500" />
                          ) : (
                            <File className="h-8 w-8 text-gray-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {fileName}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="uppercase">{fileExtension || 'Unknown'} File</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(resource.file, '_blank', 'noopener,noreferrer')}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = resource.file;
                              link.download = fileName;
                              link.target = '_blank';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Paperclip className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium text-lg">No Attachments</p>
                  <p className="text-sm text-gray-500 mt-2">This work order has no attached files</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkorderDetailView;

