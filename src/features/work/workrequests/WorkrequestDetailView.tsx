import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Edit, Loader2, AlertTriangle, Clock, CalendarDays, FileText,
  Banknote, Tag, User, Users, Briefcase, CheckCircle2, XCircle, FileBox,
  MapPin, Settings, FileCheck, Package, CheckCircle, RefreshCw, ShieldCheck,
} from 'lucide-react';
import {
  useWorkrequestQuery,
  useResubmitWorkrequest,
} from '@/hooks/workrequest/useWorkrequestQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { PermissionGuard } from '@/components/PermissionGuard';
import { ApprovalForm, ApprovalAction } from './components/ApprovalForm';
import { ProcurementForm, CpAction } from './components/ProcurementForm';
import { useAuth } from '@/contexts/AuthContext';
import WorkrequestPrintView from './WorkrequestPrintView';
import { REJECTED_STATUSES } from '@/types/workrequest';

const PIPELINE_STEPS = [
  { label: 'Pending Review', status: 'Pending Review' },
  { label: 'CP Approved', status: 'CP Approved' },
  { label: 'Reviewed', status: 'Reviewed' },
  { label: 'Fully Approved', status: 'Fully Approved' },
];

const WorkrequestDetailView = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [approvalAction, setApprovalAction] = useState<ApprovalAction | null>(null);
  const [procurementAction, setProcurementAction] = useState<CpAction | null>(null);

  const userRole = (user?.role || '').toUpperCase();
  const isAdmin = ['SUPER ADMIN', 'ADMIN'].includes(userRole);
  const isProcurement = userRole === 'PROCUREMENT AND STORE';
  const isReviewer = userRole === 'REVIEWER';
  const isApprover = userRole === 'APPROVER';

  const { data: workrequest, isLoading, isError, error } = useWorkrequestQuery(slug);
  const resubmitMutation = useResubmitWorkrequest();

  const isOwner = !!(user && workrequest && workrequest.requester === (user as any).id);
  const isRejected = workrequest ? REJECTED_STATUSES.includes(workrequest.approval_status) : false;

  const handleBack = () => navigate('/dashboard/work/requests');
  const handleEdit = (s: string) => navigate(`/dashboard/work/requests/edit/${s}`);
  const handleResubmit = () => { if (slug) resubmitMutation.mutate(slug); };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      'Pending Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'CP Approved': 'bg-blue-100 text-blue-800 border-blue-200',
      'Reviewed': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Fully Approved': 'bg-green-100 text-green-800 border-green-200',
      'Rejected – Vendor Changed': 'bg-red-100 text-red-800 border-red-200',
      'Reviewer Rejected': 'bg-red-100 text-red-800 border-red-200',
      'Approver Rejected': 'bg-red-100 text-red-800 border-red-200',
    };
    return (
      <Badge variant="outline" className={`${map[status] || 'bg-gray-100 text-gray-800 border-gray-200'} font-medium`}>
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      Work: 'bg-blue-100 text-blue-800 border-blue-200',
      Procument: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return <Badge variant="outline" className={`${styles[type] || ''} font-medium`}>{type}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      High: 'bg-red-100 text-red-800 border-red-200',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Low: 'bg-green-100 text-green-800 border-green-200',
    };
    return <Badge variant="outline" className={`${styles[priority] || ''} font-medium`}>{priority}</Badge>;
  };

  const formatCurrency = (cost: string, currency: string) => {
    const symbols: Record<string, string> = { USD: '$', EUR: '€', NGN: '₦' };
    return `${symbols[currency] || ''}${cost}`;
  };

  const formatDate = (dateString: string) => {
    try { return format(new Date(dateString), 'PPP p'); } catch { return 'N/A'; }
  };

  const getPipelineStep = (currentStatus: string): number => {
    const order = ['Pending Review', 'CP Approved', 'Reviewed', 'Fully Approved'];
    const idx = order.indexOf(currentStatus);
    return idx >= 0 ? idx : 0;
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <p className="text-sm text-muted-foreground">Loading work request...</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <AlertTriangle className="h-12 w-12 text-red-500" />
      <div className="text-red-500 text-xl">Error loading work request</div>
      <p className="text-sm text-muted-foreground mb-4">{error instanceof Error ? error.message : 'Unknown error'}</p>
      <Button onClick={handleBack} variant="outline">Back to Work Requests</Button>
    </div>
  );

  if (!workrequest) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <AlertTriangle className="h-12 w-12 text-red-500" />
      <div className="text-red-500 text-xl">Work request not found</div>
      <Button onClick={handleBack} variant="outline">Back to Work Requests</Button>
    </div>
  );

  const currentStep = getPipelineStep(workrequest.approval_status);

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleBack} className="border-green-200 text-green-700 hover:bg-green-50">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Work Request {workrequest.work_request_number}</h1>
            <p className="text-gray-600 text-base mt-1">Created {formatDate(workrequest.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex items-center gap-2">
            {getTypeBadge(workrequest.type)}
            {getPriorityBadge(workrequest.priority)}
            {getStatusBadge(workrequest.approval_status)}
          </div>

          <WorkrequestPrintView workrequest={workrequest} />

          {/* Procurement & Store actions — Pending Review */}
          {workrequest.approval_status === 'Pending Review' && (isProcurement || isAdmin) && (
            <>
              <Button onClick={() => setProcurementAction('cp-approve')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Package className="mr-2 h-4 w-4" /> Approve & Generate PO
              </Button>
              <Button onClick={() => setProcurementAction('cp-reject')} variant="destructive">
                <XCircle className="mr-2 h-4 w-4" /> Reject — Vendor Issue
              </Button>
            </>
          )}

          {/* Reviewer actions — CP Approved */}
          {workrequest.approval_status === 'CP Approved' && (isReviewer || isAdmin) && (
            <>
              <Button onClick={() => setApprovalAction('reviewer-approve')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <CheckCircle className="mr-2 h-4 w-4" /> Approve
              </Button>
              <Button onClick={() => setApprovalAction('reviewer-reject')} variant="destructive">
                <XCircle className="mr-2 h-4 w-4" /> Reject
              </Button>
            </>
          )}

          {/* Approver actions — Reviewed */}
          {workrequest.approval_status === 'Reviewed' && (isApprover || isAdmin) && (
            <>
              <Button onClick={() => setApprovalAction('final-approve')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <ShieldCheck className="mr-2 h-4 w-4" /> Final Approval
              </Button>
              <Button onClick={() => setApprovalAction('final-reject')} variant="destructive">
                <XCircle className="mr-2 h-4 w-4" /> Reject
              </Button>
            </>
          )}

          {/* Requester: edit + resubmit after any rejection */}
          {isRejected && !workrequest.is_locked && (isOwner || isAdmin) && (
            <>
              <PermissionGuard feature="work_request" permission="edit">
                <Button onClick={() => handleEdit(workrequest.slug)} className="bg-green-600 hover:bg-green-700 text-white">
                  <Edit className="mr-2 h-4 w-4" /> Edit & Correct
                </Button>
              </PermissionGuard>
              <Button
                onClick={handleResubmit}
                disabled={resubmitMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {resubmitMutation.isPending
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <RefreshCw className="mr-2 h-4 w-4" />
                }
                Resubmit
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Pipeline stepper — visible to Requester (owner) and Admin only */}
      {(isOwner || isAdmin) && <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          {PIPELINE_STEPS.map((step, idx) => {
            const isActive = workrequest.approval_status === step.status;
            const isPast = !isRejected && currentStep > idx;
            const isFullyApproved = workrequest.approval_status === 'Fully Approved';
            return (
              <div key={step.status} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${isFullyApproved || isPast ? 'bg-green-600 text-white' :
                      isActive ? 'bg-blue-600 text-white' :
                      isRejected && currentStep <= idx ? 'bg-red-100 text-red-400' :
                      'bg-gray-200 text-gray-500'}`}>
                    {(isFullyApproved && idx < 4) || isPast ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                  </div>
                  <span className={`text-xs mt-1 text-center font-medium
                    ${isActive ? 'text-blue-700' : isPast || isFullyApproved ? 'text-green-700' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </div>
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 ${isPast || isFullyApproved ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
        {isRejected && (
          <p className="text-xs text-red-600 text-center mt-2 font-medium">
            Pipeline paused — {workrequest.approval_status}
          </p>
        )}
      </div>}

      {/* Rejection banner */}
      {isRejected && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-5 w-5 text-red-600" />
            <h3 className="text-red-800 font-semibold text-base">{workrequest.approval_status}</h3>
          </div>
          {workrequest.cp_reason && (
            <div className="mb-2">
              <span className="text-sm font-medium text-red-700">Procurement & Store reason: </span>
              <span className="text-sm text-red-900">{workrequest.cp_reason}</span>
            </div>
          )}
          {workrequest.po_vendor_detail && (
            <div className="mb-2">
              <span className="text-sm font-medium text-red-700">Suggested alternative vendor: </span>
              <span className="text-sm text-red-900">{workrequest.po_vendor_detail.name}</span>
            </div>
          )}
          {workrequest.reviewer_reason && (
            <div className="mb-2">
              <span className="text-sm font-medium text-red-700">Reviewer reason: </span>
              <span className="text-sm text-red-900">{workrequest.reviewer_reason}</span>
            </div>
          )}
          {workrequest.approver_reason && (
            <div className="mb-2">
              <span className="text-sm font-medium text-red-700">Approver reason: </span>
              <span className="text-sm text-red-900">{workrequest.approver_reason}</span>
            </div>
          )}
          {!workrequest.is_locked && (isOwner || isAdmin) && (
            <p className="text-sm text-red-700 mt-3 font-medium">
              Correct the issue above, then click "Edit & Correct" → "Resubmit" to restart the pipeline.
            </p>
          )}
        </div>
      )}

      {/* Fully approved banner */}
      {workrequest.approval_status === 'Fully Approved' && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-green-700" />
            <h3 className="text-green-800 font-semibold text-base">Committed to Ledger — Fully Approved</h3>
          </div>
          {workrequest.digital_signature && (
            <p className="text-sm text-green-900 mb-1">
              <span className="font-medium">Signed by:</span> {workrequest.digital_signature}
            </p>
          )}
          {workrequest.fully_approved_at && (
            <p className="text-sm text-green-900">
              <span className="font-medium">Approved at:</span> {formatDate(workrequest.fully_approved_at)}
            </p>
          )}
        </div>
      )}

      {/* Three-way audit panel for Reviewer */}
      {workrequest.approval_status === 'CP Approved' && (isReviewer || isAdmin) && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5 mb-6">
          <h3 className="text-indigo-800 font-semibold text-base mb-4 flex items-center gap-2">
            <FileCheck className="h-5 w-5" /> Three-Way Audit Checklist
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-indigo-100 rounded-lg p-4">
              <p className="text-xs font-semibold text-indigo-600 uppercase mb-2">1. Original Request</p>
              <p className="text-sm font-medium text-gray-900">{workrequest.description || 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1">Vendor: {workrequest.vendor_detail?.name || 'N/A'}</p>
            </div>
            <div className="bg-white border border-indigo-100 rounded-lg p-4">
              <p className="text-xs font-semibold text-indigo-600 uppercase mb-2">2. Purchase Order</p>
              {workrequest.po_number ? (
                <>
                  <p className="text-sm font-medium text-gray-900 font-mono">{workrequest.po_number}</p>
                  <p className="text-xs text-gray-500 mt-1">PO Vendor: {workrequest.po_vendor_detail?.name || workrequest.vendor_detail?.name || 'N/A'}</p>
                  {workrequest.po_document && (
                    <a
                      href={workrequest.po_document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-700 underline font-medium mt-2"
                    >
                      <FileText className="h-3 w-3" /> View PO Document
                    </a>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400">No PO uploaded yet</p>
              )}
            </div>
            <div className="bg-white border border-indigo-100 rounded-lg p-4">
              <p className="text-xs font-semibold text-indigo-600 uppercase mb-2">3. Vendor Invoice</p>
              {workrequest.vendor_invoice ? (
                <a
                  href={workrequest.vendor_invoice}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-700 underline font-medium"
                >
                  View Invoice Document
                </a>
              ) : (
                <p className="text-sm text-gray-400">No invoice uploaded</p>
              )}
              {workrequest.invoice_no && (
                <p className="text-xs text-gray-500 mt-1">Invoice No: {workrequest.invoice_no}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-indigo-600 mt-4">
            Verify all three match before approving. If there is a discrepancy, reject with a specific reason.
          </p>
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8 bg-green-50 border-green-200">
          <TabsTrigger value="overview" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="location" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Location & Asset</TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Financial</TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">People & Vendors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800"><FileText className="h-5 w-5" />Description</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                {workrequest.description || 'No description provided'}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-green-200 shadow-lg">
              <CardHeader className="pb-4 bg-green-50 border-b border-green-100">
                <CardTitle className="text-lg flex items-center gap-2 text-green-800"><FileBox className="h-5 w-5" />Request Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Request Number</p>
                  <p className="text-lg font-semibold text-gray-900 font-mono">{workrequest.work_request_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Type</p>
                  {getTypeBadge(workrequest.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Priority</p>
                  {getPriorityBadge(workrequest.priority)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Approval Status</p>
                  {getStatusBadge(workrequest.approval_status)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 shadow-lg">
              <CardHeader className="pb-4 bg-green-50 border-b border-green-100">
                <CardTitle className="text-lg flex items-center gap-2 text-green-800"><Tag className="h-5 w-5" />Category</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Category</p>
                  <p className="text-base font-medium text-gray-900">{workrequest.category_detail?.description || workrequest.category_detail?.name || 'N/A'}</p>
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

            <Card className="border-green-200 shadow-lg">
              <CardHeader className="pb-4 bg-green-50 border-b border-green-100">
                <CardTitle className="text-lg flex items-center gap-2 text-green-800"><Banknote className="h-5 w-5" />Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {workrequest.po_number && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">PO Number</p>
                    <p className="text-base font-semibold text-gray-900 font-mono">{workrequest.po_number}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800"><CalendarDays className="h-5 w-5" />Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="w-px h-12 bg-gray-300 mt-2" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Submitted</h3>
                    <time className="text-sm text-gray-500">{formatDate(workrequest.created_at)}</time>
                    <p className="mt-1 text-sm text-gray-700">{workrequest.type} work request submitted by requester</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="w-px h-12 bg-gray-300 mt-2" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Last Updated</h3>
                    <time className="text-sm text-gray-500">{formatDate(workrequest.updated_at)}</time>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      workrequest.approval_status === 'Fully Approved' ? 'bg-green-100' :
                      isRejected ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {workrequest.approval_status === 'Fully Approved'
                        ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                        : isRejected ? <XCircle className="h-5 w-5 text-red-600" />
                        : <Clock className="h-5 w-5 text-yellow-600" />}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Current Status</h3>
                    <div className="mt-1">{getStatusBadge(workrequest.approval_status)}</div>
                    {workrequest.fully_approved_at && (
                      <p className="mt-1 text-sm text-gray-500">Approved: {formatDate(workrequest.fully_approved_at)}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="location" className="space-y-8">
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800"><MapPin className="h-5 w-5" />Location Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Facility</p>
                    <p className="text-lg font-semibold text-gray-900">{workrequest.facility_detail?.name || 'N/A'}</p>
                    {workrequest.facility_detail?.code && <p className="text-sm text-gray-500">{workrequest.facility_detail.code}</p>}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Building ID</p>
                    <p className="text-lg font-semibold text-gray-900">{workrequest.building || 'N/A'}</p>
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

          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800"><Package className="h-5 w-5" />Asset Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div><p className="text-sm font-medium text-gray-600 mb-1">Asset Name</p><p className="text-lg font-semibold text-gray-900">{workrequest.asset_detail?.asset_name || 'N/A'}</p></div>
                  <div><p className="text-sm font-medium text-gray-600 mb-1">Asset Type</p><p className="text-base text-gray-900">{workrequest.asset_detail?.asset_type || 'N/A'}</p></div>
                  <div><p className="text-sm font-medium text-gray-600 mb-1">Condition</p><p className="text-base text-gray-900">{workrequest.asset_detail?.condition || 'N/A'}</p></div>
                </div>
                <div className="space-y-4">
                  <div><p className="text-sm font-medium text-gray-600 mb-1">Serial Number</p><p className="text-base text-gray-900">{workrequest.asset_detail?.serial_number || 'N/A'}</p></div>
                  <div><p className="text-sm font-medium text-gray-600 mb-1">Asset Tag</p><p className="text-base text-gray-900">{workrequest.asset_detail?.asset_tag || 'N/A'}</p></div>
                  <div><p className="text-sm font-medium text-gray-600 mb-1">Purchase Date</p><p className="text-base text-gray-900">{workrequest.asset_detail?.purchase_date ? formatDate(workrequest.asset_detail.purchase_date) : 'N/A'}</p></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-8">
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800"><Banknote className="h-5 w-5" />Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {workrequest.invoice_no && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Invoice Number</p>
                      <p className="text-base font-semibold text-gray-900">{workrequest.invoice_no}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {workrequest.po_number && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-semibold text-blue-700 mb-2 uppercase">Purchase Order</p>
                      <p className="text-lg font-bold text-gray-900 font-mono">{workrequest.po_number}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Vendor: {workrequest.po_vendor_detail?.name || workrequest.vendor_detail?.name || 'N/A'}
                      </p>
                      {workrequest.po_document && (
                        <a
                          href={workrequest.po_document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-700 underline font-medium mt-2"
                        >
                          <FileText className="h-4 w-4" /> View PO Document
                        </a>
                      )}
                    </div>
                  )}
                  {workrequest.vendor_invoice && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Vendor Invoice</p>
                      <a href={workrequest.vendor_invoice} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-green-700 underline font-medium">
                        <FileText className="h-4 w-4" /> View Invoice Document
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-8">
          {/* Vendor Information */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800"><Briefcase className="h-5 w-5" />Vendor Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Original Vendor (from Invoice)</p>
                    <p className="text-lg font-semibold text-gray-900">{workrequest.vendor_detail?.name || 'No vendor selected'}</p>
                    {workrequest.vendor_detail?.email && <p className="text-sm text-gray-500">{workrequest.vendor_detail.email}</p>}
                  </div>
                </div>
                {workrequest.po_vendor_detail && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">PO Vendor (from Procurement)</p>
                      <p className="text-lg font-semibold text-gray-900">{workrequest.po_vendor_detail.name}</p>
                      {workrequest.po_vendor_detail.email && <p className="text-sm text-gray-500">{workrequest.po_vendor_detail.email}</p>}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Approval Chain */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800"><CheckCircle className="h-5 w-5" />Approval Chain</CardTitle>
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
                              <AvatarImage src={reviewer.avatar} />
                              <AvatarFallback className="bg-green-100 text-green-700 font-semibold text-sm">
                                {`${reviewer.first_name.charAt(0)}${reviewer.last_name.charAt(0)}`}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-base font-semibold text-gray-900">{`${reviewer.first_name} ${reviewer.last_name}`}</p>
                              <p className="text-sm text-gray-600">{reviewer.email}</p>
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

          {/* Requester */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800"><User className="h-5 w-5" />Requester</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={workrequest.requester_detail?.avatar} />
                  <AvatarFallback className="bg-green-100 text-green-700 text-lg font-semibold">
                    {`${workrequest.requester_detail?.first_name?.charAt(0) || ''}${workrequest.requester_detail?.last_name?.charAt(0) || ''}`}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-gray-900">{`${workrequest.requester_detail?.first_name} ${workrequest.requester_detail?.last_name}`}</p>
                  <p className="text-base text-gray-600">{workrequest.requester_detail?.email}</p>
                  <Badge variant="outline" className={workrequest.requester_detail?.status === 'Active'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-gray-100 text-gray-800 border-gray-200'}>
                    {workrequest.requester_detail?.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Procurement */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800"><Users className="h-5 w-5" />Procurement & Store Assigned</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {workrequest.request_to_detail?.map((u: any) => (
                  <div key={u.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={u.avatar} />
                      <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                        {`${u.first_name.charAt(0)}${u.last_name.charAt(0)}`}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-base font-semibold text-gray-900">{`${u.first_name} ${u.last_name}`}</p>
                      <p className="text-sm text-gray-600">{u.email}</p>
                    </div>
                  </div>
                ))}
                {(!workrequest.request_to_detail || workrequest.request_to_detail.length === 0) && (
                  <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No procurement users assigned</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role-specific action dialogs */}
      {approvalAction && (
        <ApprovalForm
          isOpen={!!approvalAction}
          onClose={() => setApprovalAction(null)}
          workrequestSlug={workrequest.slug}
          workrequestNumber={workrequest.work_request_number}
          action={approvalAction}
        />
      )}

      {procurementAction && (
        <ProcurementForm
          isOpen={!!procurementAction}
          onClose={() => setProcurementAction(null)}
          workrequestSlug={workrequest.slug}
          workrequestNumber={workrequest.work_request_number}
          action={procurementAction}
        />
      )}
    </div>
  );
};

export default WorkrequestDetailView;
