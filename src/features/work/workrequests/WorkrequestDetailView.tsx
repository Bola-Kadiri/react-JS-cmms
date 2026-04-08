import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  AlertTriangle, 
  Clock, 
  CalendarDays, 
  Building, 
  Home, 
  Wrench, 
  FileText, 
  Banknote, 
  Tag, 
  User, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  XCircle,
  FileBox,
  MapPin,
  Settings,
  FileCheck,
  Package,
  CheckCircle
} from "lucide-react";
import { useWorkrequestQuery, useRejectWorkrequest } from '@/hooks/workrequest/useWorkrequestQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { PermissionGuard } from '@/components/PermissionGuard';
import { ApprovalForm } from './components/ApprovalForm'
import { ProcurementForm } from './components/ProcurementForm'
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import WorkrequestPrintView from './WorkrequestPrintView';

const WorkrequestDetailView = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [approvalFormOpen, setApprovalFormOpen] = useState(false);
  const [procurementFormOpen, setProcurementFormOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Using our custom hooks
  const { user } = useAuth();
  const isReviewer = (user?.role || '').toUpperCase() === 'REVIEWER';
  
  const {
    data: workrequest,
    isLoading,
    isError,
    error
  } = useWorkrequestQuery(slug);
  
  const rejectMutation = useRejectWorkrequest();

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/work/requests');
  };

  // Handle edit button click
  const handleEdit = (slug: string) => {
    navigate(`/dashboard/work/requests/edit/${slug}`);
  };

  // Handle approve button click
  const handleApprove = () => {
    setApprovalFormOpen(true);
  };

  // Handle procurement details button click
  const handleProcurementDetails = () => {
    setProcurementFormOpen(true);
  };

  // Handle reject button click
  const handleReject = () => {
    setRejectDialogOpen(true);
  };

  // Confirm rejection
  const confirmReject = () => {
    if (slug && rejectionReason.trim()) {
      rejectMutation.mutate(
        { slug, rejection_reason: rejectionReason },
        {
          onSuccess: () => {
            setRejectDialogOpen(false);
            setRejectionReason('');
          },
        }
      );
    }
  };

  // Get type badge styles
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Work':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 font-medium">{type}</Badge>;
      case 'Procurement':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200 font-medium">{type}</Badge>;
      default:
        return <Badge variant="outline" className="font-medium">{type}</Badge>;
    }
  };

  // Get priority badge styles  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200 font-medium">{priority}</Badge>;
      case 'Medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200 font-medium">{priority}</Badge>;
      case 'Low':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 font-medium">{priority}</Badge>;
      default:
        return <Badge variant="outline" className="font-medium">{priority}</Badge>;
    }
  };

  // Get approval status badge styles
  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 font-medium">{status}</Badge>;
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200 font-medium">{status}</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200 font-medium">{status}</Badge>;
      default:
        return <Badge variant="outline" className="font-medium">{status}</Badge>;
    }
  };

  // Format currency with symbol
  const formatCurrency = (cost: string, currency: string) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'NGN': '₦'
    };
    
    const symbol = symbols[currency as keyof typeof symbols] || '';
    return `${symbol}${cost}`;
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
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-muted-foreground">Loading work request details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Error loading work request details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Work Requests
        </Button>
      </div>
    );
  }

  if (!workrequest) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Work request not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Work Requests
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Work Request #{workrequest.work_request_number}</h1>
            <p className="text-gray-600 text-base mt-1">Created on {formatDate(workrequest.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-2">
              {getTypeBadge(workrequest.type)}
              {getPriorityBadge(workrequest.priority)}
              {getApprovalStatusBadge(workrequest.approval_status)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Print/Download Button */}
            <WorkrequestPrintView workrequest={workrequest} />
            {workrequest?.approval_status === 'Pending' && workrequest?.cost && (<PermissionGuard feature='work_request' permission='review'>
              <Button 
                onClick={handleApprove}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Approve Request
              </Button>
            </PermissionGuard>)}
            {workrequest?.approval_status === 'Pending' && workrequest?.cost && isReviewer && (
              <Button 
                onClick={handleReject}
                variant="destructive"
                className="px-6"
              >
                <XCircle className="mr-2 h-4 w-4" /> Reject Request
              </Button>
            )}
            {workrequest?.approval_status === 'Pending' && workrequest?.cost === null && (
              <PermissionGuard feature='work_request' permission='costing'>
              <Button 
                onClick={handleProcurementDetails}
                className="bg-green-600 hover:bg-green-700 text-white px-6"
              >
                <Package className="mr-2 h-4 w-4" /> Add Procurement Details
              </Button>
            </PermissionGuard>
            )}
            <PermissionGuard feature='work_request' permission='edit'>
              {workrequest?.approval_status === 'Pending' && (<Button onClick={() => handleEdit(workrequest.slug)} className="bg-green-600 hover:bg-green-700 text-white px-6">
                <Edit className="mr-2 h-4 w-4" /> Edit Request
              </Button>)}
            </PermissionGuard>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8 bg-green-50 border-green-200">
          <TabsTrigger value="overview" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Details</TabsTrigger>
          <TabsTrigger value="location" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Location & Asset</TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Financial</TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">People & Vendors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Description Card */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <FileText className="h-5 w-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                {workrequest.description || 'No description provided'}
              </p>
            </CardContent>
          </Card>

          {/* Quick Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Request Information */}
            <Card className="border-green-200 shadow-lg">
              <CardHeader className="pb-4 bg-green-50 border-b border-green-100">
                <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                  <FileBox className="h-5 w-5" />
                  Request Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Request Number</p>
                  <p className="text-lg font-semibold text-gray-900">{workrequest.work_request_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Type</p>
                  <div>{getTypeBadge(workrequest.type)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Priority</p>
                  <div>{getPriorityBadge(workrequest.priority)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Approval Status</p>
                  <div>{getApprovalStatusBadge(workrequest.approval_status)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Category Information */}
            <Card className="border-green-200 shadow-lg">
              <CardHeader className="pb-4 bg-green-50 border-b border-green-100">
                <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                  <Tag className="h-5 w-5" />
                  Category Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Category</p>
                  <p className="text-base font-medium text-gray-900">{workrequest.category_detail?.title || 'N/A'}</p>
                  {workrequest.category_detail?.code && (
                    <p className="text-sm text-gray-500">{workrequest.category_detail.code}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Subcategory</p>
                  <p className="text-base font-medium text-gray-900">{workrequest.subcategory_detail?.title || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Department</p>
                  <p className="text-base font-medium text-gray-900">{workrequest.department_detail?.name || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card className="border-green-200 shadow-lg">
              <CardHeader className="pb-4 bg-green-50 border-b border-green-100">
                <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                  <Banknote className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Cost</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(workrequest.cost, workrequest.currency)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Currency</p>
                  <p className="text-base font-medium text-gray-900">{workrequest.currency}</p>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CalendarDays className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="w-px h-12 bg-gray-300 mt-2"></div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Work Request Created</h3>
                    <time className="text-sm text-gray-500">
                      {formatDate(workrequest.created_at)}
                    </time>
                    <p className="mt-1 text-sm text-gray-700">{workrequest.type} work request was created</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="w-px h-12 bg-gray-300 mt-2"></div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Last Updated</h3>
                    <time className="text-sm text-gray-500">
                      {formatDate(workrequest.updated_at)}
                    </time>
                    <p className="mt-1 text-sm text-gray-700">Work request was last updated</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full 
                      ${workrequest.approval_status === 'Approved' ? 'bg-green-100' : 
                      workrequest.approval_status === 'Rejected' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                      {workrequest.approval_status === 'Approved' ? 
                        <CheckCircle2 className="h-5 w-5 text-green-600" /> : 
                        workrequest.approval_status === 'Rejected' ? 
                        <XCircle className="h-5 w-5 text-red-600" /> : 
                        <Clock className="h-5 w-5 text-yellow-600" />}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Approval Status</h3>
                    <div className="mt-1">
                      {getApprovalStatusBadge(workrequest.approval_status)}
                    </div>
                    <p className="mt-1 text-sm text-gray-700">
                      {workrequest.approval_status === 'Approved' ? 
                        'Work request has been approved' : 
                        workrequest.approval_status === 'Rejected' ? 
                        'Work request has been rejected' : 
                        'Work request is pending approval'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-8">
          {/* Request Options */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Settings className="h-5 w-5" />
                Request Options
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="flex flex-col items-center p-4 border rounded-lg bg-gray-50">
                  <div className={`p-3 rounded-full ${workrequest.require_mobilization_fee ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {workrequest.require_mobilization_fee ? 
                      <CheckCircle2 className="h-6 w-6 text-green-600" /> : 
                      <XCircle className="h-6 w-6 text-gray-400" />}
                  </div>
                  <p className="mt-2 text-sm font-medium text-center">Mobilization Fee</p>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-lg bg-gray-50">
                  <div className={`p-3 rounded-full ${workrequest.require_quotation ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {workrequest.require_quotation ? 
                      <CheckCircle2 className="h-6 w-6 text-green-600" /> : 
                      <XCircle className="h-6 w-6 text-gray-400" />}
                  </div>
                  <p className="mt-2 text-sm font-medium text-center">Quotation Required</p>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-lg bg-gray-50">
                  <div className={`p-3 rounded-full ${workrequest.payment_requisition ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {workrequest.payment_requisition ? 
                      <CheckCircle2 className="h-6 w-6 text-green-600" /> : 
                      <XCircle className="h-6 w-6 text-gray-400" />}
                  </div>
                  <p className="mt-2 text-sm font-medium text-center">Payment Requisition</p>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Follow-up Notes */}
          {workrequest.follow_up_notes && (
            <Card className="border-green-200 shadow-lg">
              <CardHeader className="bg-green-50 border-b border-green-100">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <FileCheck className="h-5 w-5" />
                  Follow-up Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">{workrequest.follow_up_notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="location" className="space-y-8">
          {/* Location Information */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <MapPin className="h-5 w-5" />
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Facility</p>
                    <p className="text-lg font-semibold text-gray-900">{workrequest.facility_detail?.name || 'N/A'}</p>
                    {workrequest.facility_detail?.code && (
                      <p className="text-sm text-gray-500">{workrequest.facility_detail.code}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Building</p>
                    <p className="text-lg font-semibold text-gray-900">Building ID: {workrequest.building || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Facility Type</p>
                    <p className="text-base text-gray-900">{workrequest.facility_detail?.type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Facility Code</p>
                    <p className="text-base text-gray-900">{workrequest.facility_detail?.code || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asset Information */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Package className="h-5 w-5" />
                Asset Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Asset Name</p>
                    <p className="text-lg font-semibold text-gray-900">{workrequest.asset_detail?.asset_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Asset Type</p>
                    <p className="text-base text-gray-900">{workrequest.asset_detail?.asset_type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Condition</p>
                    <p className="text-base text-gray-900">{workrequest.asset_detail?.condition || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Serial Number</p>
                    <p className="text-base text-gray-900">{workrequest.asset_detail?.serial_number || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Asset Tag</p>
                    <p className="text-base text-gray-900">{workrequest.asset_detail?.asset_tag || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Purchase Date</p>
                    <p className="text-base text-gray-900">{workrequest.asset_detail?.purchase_date ? 
                      formatDate(workrequest.asset_detail.purchase_date) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Purchased Amount</p>
                    <p className="text-base text-gray-900">{workrequest.asset_detail?.purchased_amount || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Lifespan</p>
                    <p className="text-base text-gray-900">{workrequest.asset_detail?.lifespan || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-8">
          {/* Financial Information */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Banknote className="h-5 w-5" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Cost</p>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(workrequest.cost, workrequest.currency)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Currency</p>
                    <p className="text-lg font-semibold text-gray-900">{workrequest.currency}</p>
                  </div>

                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg border">
                      <p className="text-sm font-medium text-gray-600 mb-2">Payment Requisition</p>
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${workrequest.payment_requisition ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {workrequest.payment_requisition ? 
                          <CheckCircle2 className="h-5 w-5 text-green-600" /> : 
                          <XCircle className="h-5 w-5 text-gray-400" />}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg border">
                      <p className="text-sm font-medium text-gray-600 mb-2">Mobilization Fee</p>
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${workrequest.require_mobilization_fee ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {workrequest.require_mobilization_fee ? 
                          <CheckCircle2 className="h-5 w-5 text-green-600" /> : 
                          <XCircle className="h-5 w-5 text-gray-400" />}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-8">
          {/* Vendor Information */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Briefcase className="h-5 w-5" />
                Vendor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Suggested Vendor</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {workrequest.suggested_vendor_detail?.name || 'No vendor selected'}
                    </p>
                    {workrequest.suggested_vendor_detail?.email && (
                      <p className="text-sm text-gray-500">{workrequest.suggested_vendor_detail.email}</p>
                    )}
                  </div>
                  {workrequest.suggested_vendor_detail?.phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Contact Phone</p>
                      <p className="text-base text-gray-900">{workrequest.suggested_vendor_detail.phone}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {workrequest.vendor_description && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Vendor Description</p>
                      <p className="text-base text-gray-900 whitespace-pre-line">{workrequest.vendor_description}</p>
                    </div>
                  )}
                  {workrequest.attach_po && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Purchase Order Attachment</p>
                      <p className="text-base text-gray-900">{workrequest.attach_po}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval & Review Information */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Approval & Review Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Approver</p>
                    {workrequest.approver_detail ? (
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={workrequest.approver_detail.avatar} alt={`${workrequest.approver_detail.first_name} ${workrequest.approver_detail.last_name}`} />
                          <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                            {`${workrequest.approver_detail.first_name.charAt(0)}${workrequest.approver_detail.last_name.charAt(0)}`}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{`${workrequest.approver_detail.first_name} ${workrequest.approver_detail.last_name}`}</p>
                          <p className="text-sm text-gray-600">{workrequest.approver_detail.email}</p>
                          <p className="text-sm text-gray-500">{workrequest.approver_detail.roles}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-base text-gray-500">No approver assigned</p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Reviewers</p>
                    {workrequest.reviewers_detail && workrequest.reviewers_detail.length > 0 ? (
                      <div className="space-y-3">
                        {workrequest.reviewers_detail.map((reviewer) => (
                          <div key={reviewer.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={reviewer.avatar} alt={`${reviewer.first_name} ${reviewer.last_name}`} />
                              <AvatarFallback className="bg-green-100 text-green-700 font-semibold text-sm">
                                {`${reviewer.first_name.charAt(0)}${reviewer.last_name.charAt(0)}`}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-base font-semibold text-gray-900">{`${reviewer.first_name} ${reviewer.last_name}`}</p>
                              <p className="text-sm text-gray-600">{reviewer.email}</p>
                              <p className="text-xs text-gray-500">{reviewer.roles}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-base text-gray-500">No reviewers assigned</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Requester Information */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <User className="h-5 w-5" />
                Requester Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={workrequest.requester_detail?.avatar} alt={`${workrequest.requester_detail?.first_name} ${workrequest.requester_detail?.last_name}`} />
                  <AvatarFallback className="bg-green-100 text-green-700 text-lg font-semibold">
                    {`${workrequest.requester_detail?.first_name.charAt(0)}${workrequest.requester_detail?.last_name.charAt(0)}`}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-gray-900">{`${workrequest.requester_detail?.first_name} ${workrequest.requester_detail?.last_name}`}</p>
                  <div className="text-base text-gray-600">{workrequest.requester_detail?.roles}</div>
                  <div className="text-base text-gray-600">{workrequest.requester_detail?.email}</div>
                  <div className="mt-3">
                    <Badge variant="outline" className={workrequest.requester_detail?.status === 'Active' ? 
                      'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                      {workrequest.requester_detail?.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned To */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Users className="h-5 w-5" />
                Assigned To
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {workrequest.request_to_detail?.map((user: any) => (
                  <div key={user.id} className="flex items-start gap-6 p-4 bg-gray-50 rounded-lg border">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
                      <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                        {`${user.first_name.charAt(0)}${user.last_name.charAt(0)}`}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-gray-900">{`${user.first_name} ${user.last_name}`}</p>
                      <div className="text-base text-gray-600">{user.roles}</div>
                      <div className="text-base text-gray-600">{user.email}</div>
                      <div className="mt-2">
                        <Badge variant="outline" className={user.status === 'Active' ? 
                          'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!workrequest.request_to_detail || workrequest.request_to_detail.length === 0) && (
                  <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No users assigned</p>
                    <p className="text-sm text-gray-500 mt-1">This work request has not been assigned to anyone yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Department Information */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Briefcase className="h-5 w-5" />
                Department Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Department Name</p>
                    <p className="text-lg font-semibold text-gray-900">{workrequest.department_detail?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Department ID</p>
                    <p className="text-base text-gray-900">{workrequest.department_detail?.id || 'N/A'}</p>
                  </div>
                </div>
                {/* <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
                    <p className="text-base text-gray-900">{workrequest.department_detail?.description || 'N/A'}</p>
                  </div>
                </div> */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Form Dialog */}
      <ApprovalForm
        isOpen={approvalFormOpen}
        onClose={() => setApprovalFormOpen(false)}
        workrequestSlug={workrequest.slug}
        workrequestNumber={workrequest.work_request_number}
      />

      {/* Procurement Form Dialog */}
      <ProcurementForm
        isOpen={procurementFormOpen}
        onClose={() => setProcurementFormOpen(false)}
        workrequestSlug={workrequest.slug}
        workrequestNumber={workrequest.work_request_number}
      />

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Work Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting work request #{workrequest.work_request_number}
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
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkrequestDetailView;