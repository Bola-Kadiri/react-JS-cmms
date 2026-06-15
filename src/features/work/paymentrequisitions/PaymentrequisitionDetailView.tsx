import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Edit,
  Loader2,
  Calendar,
  DollarSign,
  FileText,
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
  Hash,
  Package,
  FileSpreadsheet,
  BadgePercent
} from 'lucide-react';
import { usePaymentrequisitionQuery, useApprovePaymentrequisition } from '@/hooks/paymentrequisition/usePaymentrequisitionQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';
import { usePermissions } from '@/contexts/PermissionsContext';
import { useAuth } from '@/contexts/AuthContext';

const PaymentRequisitionDetailView = () => {
  const { t } = useTypedTranslation('work');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userRole } = usePermissions();
  const { user } = useAuth();

  const [showApproveDialog, setShowApproveDialog] = useState(false);

  const {
    data: paymentRequisition,
    isLoading,
    isError,
    error
  } = usePaymentrequisitionQuery(id);

  const approvePaymentrequisitionMutation = useApprovePaymentrequisition();

  const userId = Number(user?.id);
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER ADMIN';
  // Owner is the requester who created the requisition
  const isOwner = paymentRequisition?.owner === userId;
  // A person in request_to is the designated approver — but the requester (owner) must never approve their own
  const isAttachedApprover = (paymentRequisition?.request_to?.includes(userId) ?? false) && !isOwner;
  const canApprove = (isAttachedApprover || isAdmin) && paymentRequisition?.approval_status === 'request';

  const handleApprove = async () => {
    if (!id) return;
    try {
      await approvePaymentrequisitionMutation.mutateAsync(id);
      setShowApproveDialog(false);
    } catch {
      // error handled by mutation's onError toast
    }
  };

  const handleBack = () => navigate('/dashboard/work/payment-requisitions');
  const handleEdit = (editId: string) => navigate(`/dashboard/work/payment-requisitions/edit/${editId}`);

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':   return t('paymentRequisition.statusLabels.active');
      case 'inactive': return t('paymentRequisition.statusLabels.inactive');
      case 'request':  return t('paymentRequisition.approvalStatusLabels.request');
      case 'approve':  return t('paymentRequisition.approvalStatusLabels.approve');
      default:         return status;
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    let variant = 'default';
    let icon = null;

    switch (status.toLowerCase()) {
      case 'active':
        variant = 'success';
        icon = <CheckCircle2 className="h-3 w-3 mr-1" />;
        break;
      case 'inactive':
        variant = 'outline';
        icon = <XCircle className="h-3 w-3 mr-1" />;
        break;
      case 'pending':
        variant = 'warning';
        icon = <AlertTriangle className="h-3 w-3 mr-1" />;
        break;
      case 'approve':
        variant = 'success';
        icon = <CheckCircle2 className="h-3 w-3 mr-1" />;
        break;
      case 'request':
        variant = 'secondary';
        icon = <ClipboardList className="h-3 w-3 mr-1" />;
        break;
      default:
        variant = 'default';
        icon = <CheckCircle2 className="h-3 w-3 mr-1" />;
    }

    return (
      <Badge variant={variant as any} className="flex items-center gap-1">
        {icon}
        {getStatusLabel(status)}
      </Badge>
    );
  };

  const formatCurrency = (amount: string, currency: string) => {
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', NGN: '₦' };
    const symbol = symbols[currency] || currency;
    return `${symbol}${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return t('paymentRequisition.detail.workOrdersTab.na');
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString || t('paymentRequisition.detail.workOrdersTab.na');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">{t('paymentRequisition.detail.loading')}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('paymentRequisition.detail.error')}</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : t('paymentRequisition.detail.errorFallback')}
          </AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('paymentRequisition.detail.backToList')}
        </Button>
      </div>
    );
  }

  if (!paymentRequisition) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('paymentRequisition.detail.notFound')}</AlertTitle>
          <AlertDescription>{t('paymentRequisition.detail.notFoundDescription')}</AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('paymentRequisition.detail.backToList')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={handleBack} variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('paymentRequisition.detail.pageTitle')}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Hash className="h-3.5 w-3.5" />
              {paymentRequisition.requisition_number}
              <span className="h-1 w-1 rounded-full bg-muted-foreground inline-block" />
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(paymentRequisition.requisition_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={paymentRequisition.approval_status} />
          {canApprove && (
            <Button
              onClick={() => setShowApproveDialog(true)}
              className="gap-2 bg-green-600 hover:bg-green-700"
              disabled={approvePaymentrequisitionMutation.isPending}
            >
              {approvePaymentrequisitionMutation.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <CheckCircle2 className="h-4 w-4" />}
              {t('paymentRequisition.detail.approveButton')}
            </Button>
          )}
          <PermissionGuard feature='requisition' permission='edit'>
            <Button onClick={() => handleEdit(id!)} variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              {t('paymentRequisition.detail.editButton')}
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Pipeline stepper — visible to the owner (requester) and admins */}
      {(isOwner || isAdmin) && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-4">
            {t('paymentRequisition.detail.pipeline.title')}
          </p>
          <div className="flex items-start">
            {/* Step 1: Submitted — always complete */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-green-600 text-white">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="text-xs mt-1 text-center font-medium text-green-700">
                {t('paymentRequisition.detail.pipeline.submitted')}
              </span>
            </div>
            <div className="h-0.5 flex-1 mx-1 mt-4 bg-gray-200" />
            {/* Step 2: Under Review */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${paymentRequisition.approval_status === 'approve' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
                {paymentRequisition.approval_status === 'approve'
                  ? <CheckCircle2 className="h-4 w-4" />
                  : <Clock className="h-4 w-4" />}
              </div>
              <span className={`text-xs mt-1 text-center font-medium ${
                paymentRequisition.approval_status === 'approve' ? 'text-green-700' : 'text-blue-700'
              }`}>
                {t('paymentRequisition.detail.pipeline.underReview')}
              </span>
              {paymentRequisition.reviewer_detail && (
                <span className="text-[10px] text-muted-foreground text-center mt-0.5 leading-tight">
                  {paymentRequisition.reviewer_detail.first_name} {paymentRequisition.reviewer_detail.last_name}
                </span>
              )}
            </div>
            <div className={`h-0.5 flex-1 mx-1 mt-4 ${paymentRequisition.approval_status === 'approve' ? 'bg-green-400' : 'bg-gray-200'}`} />
            {/* Step 3: Pending Approval */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${paymentRequisition.approval_status === 'approve' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {paymentRequisition.approval_status === 'approve'
                  ? <CheckCircle2 className="h-4 w-4" />
                  : <Clock className="h-4 w-4" />}
              </div>
              <span className={`text-xs mt-1 text-center font-medium ${
                paymentRequisition.approval_status === 'approve' ? 'text-green-700' : 'text-gray-500'
              }`}>
                {t('paymentRequisition.detail.pipeline.pendingApproval')}
              </span>
              {paymentRequisition.request_to_detail?.length > 0 && (
                <span className="text-[10px] text-muted-foreground text-center mt-0.5 leading-tight">
                  {paymentRequisition.request_to_detail.map(u => u.first_name).join(', ')}
                </span>
              )}
            </div>
            <div className={`h-0.5 flex-1 mx-1 mt-4 ${paymentRequisition.approval_status === 'approve' ? 'bg-green-400' : 'bg-gray-200'}`} />
            {/* Step 4: Approved */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${paymentRequisition.approval_status === 'approve' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {paymentRequisition.approval_status === 'approve'
                  ? <CheckCircle2 className="h-4 w-4" />
                  : 4}
              </div>
              <span className={`text-xs mt-1 text-center font-medium
                ${paymentRequisition.approval_status === 'approve' ? 'text-green-700' : 'text-gray-500'}`}>
                {t('paymentRequisition.detail.pipeline.approved')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Approval status banners */}
      {paymentRequisition.approval_status === 'approve' && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-6 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-700 shrink-0" />
          <div>
            <p className="text-green-800 font-semibold text-sm">
              {t('paymentRequisition.detail.pipeline.approvedBannerTitle')}
            </p>
            <p className="text-green-700 text-xs mt-0.5">
              {t('paymentRequisition.detail.pipeline.approvedBannerDescription')}
            </p>
          </div>
        </div>
      )}
      {paymentRequisition.approval_status === 'request' && isOwner && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6 flex items-center gap-3">
          <Clock className="h-5 w-5 text-yellow-700 shrink-0" />
          <div>
            <p className="text-yellow-800 font-semibold text-sm">
              {t('paymentRequisition.detail.pipeline.pendingBannerTitle')}
            </p>
            <div className="text-yellow-700 text-xs mt-0.5 space-y-0.5">
              {paymentRequisition.reviewer_detail && (
                <p>
                  <span className="font-medium">{t('paymentRequisition.detail.pipeline.reviewerLabel')}:</span>{' '}
                  {paymentRequisition.reviewer_detail.first_name} {paymentRequisition.reviewer_detail.last_name}
                </p>
              )}
              <p>
                <span className="font-medium">{t('paymentRequisition.detail.pipeline.approverLabel')}:</span>{' '}
                {paymentRequisition.request_to_detail?.map(u => `${u.first_name} ${u.last_name}`).join(', ') ||
                  t('paymentRequisition.detail.pipeline.noApproversAssigned')}
              </p>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">{t('paymentRequisition.detail.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="items">
            {t('paymentRequisition.detail.tabs.items', { count: paymentRequisition.items.length })}
          </TabsTrigger>
          <TabsTrigger value="workorders">
            {t('paymentRequisition.detail.tabs.workOrders', { count: paymentRequisition.work_orders.length })}
          </TabsTrigger>
          <TabsTrigger value="approvals">
            {t('paymentRequisition.detail.tabs.approvals', { count: paymentRequisition.request_to.length })}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">
                      {t('paymentRequisition.detail.summary.expectedPayment')}
                    </span>
                    <span className="text-2xl font-bold mt-1">
                      {formatCurrency(paymentRequisition.expected_payment_amount, paymentRequisition.pay_to_detail.currency)}
                    </span>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('paymentRequisition.detail.summary.dueOn', { date: formatDate(paymentRequisition.expected_payment_date) })}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-secondary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">
                      {t('paymentRequisition.detail.summary.withholdingTax')}
                    </span>
                    <span className="text-2xl font-bold mt-1">
                      {formatCurrency(paymentRequisition.withholding_tax, paymentRequisition.pay_to_detail.currency)}
                    </span>
                  </div>
                  <div className="h-12 w-12 bg-secondary/10 rounded-full flex items-center justify-center">
                    <BadgePercent className="h-6 w-6 text-secondary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('paymentRequisition.detail.summary.taxDeduction')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-muted">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">
                      {t('paymentRequisition.detail.summary.status')}
                    </span>
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
                <p className="text-xs text-muted-foreground mt-2">
                  {t('paymentRequisition.detail.summary.createdOn', { date: formatDate(paymentRequisition.created_at) })}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payee */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <BriefcaseBusiness className="h-5 w-5 mr-2 text-primary" />
                  {t('paymentRequisition.detail.payee.title')}
                </CardTitle>
                <CardDescription>{t('paymentRequisition.detail.payee.description')}</CardDescription>
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
                      <span className="text-sm text-muted-foreground">{t('paymentRequisition.detail.payee.contact')}</span>
                      <span className="text-sm">{paymentRequisition.pay_to_detail.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t('paymentRequisition.detail.payee.phone')}</span>
                      <span className="text-sm">{paymentRequisition.pay_to_detail.phone}</span>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Landmark className="h-4 w-4 mr-1 text-muted-foreground" />
                      {t('paymentRequisition.detail.payee.bankDetails')}
                    </h4>
                    <div className="grid grid-cols-1 gap-2 bg-muted/20 p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{t('paymentRequisition.detail.payee.bank')}</span>
                        <span className="text-sm font-medium">{paymentRequisition.pay_to_detail.bank}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{t('paymentRequisition.detail.payee.accountName')}</span>
                        <span className="text-sm font-medium">{paymentRequisition.pay_to_detail.account_name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{t('paymentRequisition.detail.payee.accountNumber')}</span>
                        <span className="text-sm font-medium">{paymentRequisition.pay_to_detail.account_number}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{t('paymentRequisition.detail.payee.currency')}</span>
                        <span className="text-sm font-medium">{paymentRequisition.pay_to_detail.currency}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requisition Details */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <FileSpreadsheet className="h-5 w-5 mr-2 text-primary" />
                  {t('paymentRequisition.detail.requisitionInfo.title')}
                </CardTitle>
                <CardDescription>{t('paymentRequisition.detail.requisitionInfo.description')}</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">{t('paymentRequisition.detail.requisitionInfo.number')}</h4>
                      <p className="text-sm font-medium">{paymentRequisition.requisition_number}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">{t('paymentRequisition.detail.requisitionInfo.dateCreated')}</h4>
                      <p className="text-sm font-medium">{formatDate(paymentRequisition.requisition_date)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">{t('paymentRequisition.detail.requisitionInfo.paymentDue')}</h4>
                      <p className="text-sm font-medium">{formatDate(paymentRequisition.expected_payment_date)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">{t('paymentRequisition.detail.requisitionInfo.requiresRetirement')}</h4>
                      <p className="text-sm font-medium">
                        {paymentRequisition.retirement
                          ? t('paymentRequisition.detail.requisitionInfo.yes')
                          : t('paymentRequisition.detail.requisitionInfo.no')}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('paymentRequisition.detail.requisitionInfo.remarks')}</h4>
                    <div className="bg-muted/20 p-3 rounded-md">
                      <p className="text-sm">{paymentRequisition.remark}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('paymentRequisition.detail.requisitionInfo.comments')}</h4>
                    <div className="bg-muted/20 p-3 rounded-md">
                      <p className="text-sm">{paymentRequisition.comment}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Request Recipients */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 mr-2 text-primary" />
                {t('paymentRequisition.detail.recipients.title')}
              </CardTitle>
              <CardDescription>{t('paymentRequisition.detail.recipients.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentRequisition.request_to_detail.map((u) => (
                  <Card key={u.id} className="bg-muted/20">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={u.avatar} alt={`${u.first_name} ${u.last_name}`} />
                          <AvatarFallback>{u.first_name.charAt(0)}{u.last_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{u.first_name} {u.last_name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">{u.roles}</Badge>
                            <StatusBadge status={u.status} />
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
                {t('paymentRequisition.detail.itemsTab.title', { count: paymentRequisition.items.length })}
              </CardTitle>
              <CardDescription>{t('paymentRequisition.detail.itemsTab.description')}</CardDescription>
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
                            {t('paymentRequisition.detail.itemsTab.workOrderRef', { id: item.work_order })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{t('paymentRequisition.detail.itemsTab.amount')}</p>
                          <p className="text-xl font-bold">
                            {formatCurrency(item.amount, paymentRequisition.pay_to_detail.currency)}
                          </p>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{t('paymentRequisition.detail.itemsTab.itemDescription')}</p>
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
                  <span className="text-sm font-medium">{t('paymentRequisition.detail.itemsTab.subtotal')}</span>
                  <span className="text-sm">
                    {formatCurrency(
                      paymentRequisition.items_detail.reduce((sum, item) => sum + parseFloat(item.amount), 0).toString(),
                      paymentRequisition.pay_to_detail.currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{t('paymentRequisition.detail.itemsTab.withholdingTax')}</span>
                  <span className="text-sm">
                    {formatCurrency(paymentRequisition.withholding_tax, paymentRequisition.pay_to_detail.currency)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-base font-medium">{t('paymentRequisition.detail.itemsTab.totalPayment')}</span>
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
                {t('paymentRequisition.detail.workOrdersTab.title', { count: paymentRequisition.work_orders.length })}
              </CardTitle>
              <CardDescription>{t('paymentRequisition.detail.workOrdersTab.description')}</CardDescription>
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
                            <span className="h-1 w-1 rounded-full bg-muted-foreground inline-block" />
                            <Tag className="h-3 w-3" />
                            {workOrder.type}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <StatusBadge status={workOrder.status} />
                          <Badge variant={
                            workOrder.priority === 'High' ? 'destructive' :
                            workOrder.priority === 'Medium' ? 'secondary' : 'default'
                          }>
                            {workOrder.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">{t('paymentRequisition.detail.workOrdersTab.itemDescription')}</h4>
                          <p className="text-sm">{workOrder.description}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">{t('paymentRequisition.detail.workOrdersTab.facility')}</p>
                            <p className="text-sm font-medium">{workOrder.facility_detail.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{t('paymentRequisition.detail.workOrdersTab.building')}</p>
                            <p className="text-sm font-medium">{workOrder.building_detail?.name}</p>
                          </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">{t('paymentRequisition.detail.workOrdersTab.category')}</p>
                            <p className="text-sm font-medium">{workOrder.category_detail.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{t('paymentRequisition.detail.workOrdersTab.subcategory')}</p>
                            <p className="text-sm font-medium">{workOrder.subcategory_detail?.name ?? ''}</p>
                          </div>
                        </div>
                        {workOrder.asset_detail && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="text-sm font-medium mb-2 flex items-center">
                                <Package className="h-4 w-4 mr-1 text-muted-foreground" />
                                {t('paymentRequisition.detail.workOrdersTab.assetInfo')}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-muted/20 p-3 rounded-md">
                                <div>
                                  <p className="text-xs text-muted-foreground">{t('paymentRequisition.detail.workOrdersTab.asset')}</p>
                                  <p className="text-sm font-medium">{workOrder.asset_detail.asset_name} ({workOrder.asset_detail.asset_type})</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">{t('paymentRequisition.detail.workOrdersTab.serialNumber')}</p>
                                  <p className="text-sm font-medium">{workOrder.asset_detail.serial_number}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">{t('paymentRequisition.detail.workOrdersTab.status')}</p>
                                  <p className="text-sm font-medium">{workOrder.asset_detail.condition}</p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t py-3 flex justify-between bg-muted/10">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {workOrder.cost
                            ? formatCurrency(workOrder.cost, workOrder.currency)
                            : t('paymentRequisition.detail.workOrdersTab.na')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {workOrder.expected_start_date
                            ? formatDate(workOrder.expected_start_date)
                            : t('paymentRequisition.detail.workOrdersTab.noStartDate')}
                        </span>
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
                {t('paymentRequisition.detail.approvalsTab.title')}
              </CardTitle>
              <CardDescription>
                <Badge>{getStatusLabel(paymentRequisition.approval_status)}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className={
                paymentRequisition.approval_status === 'approve'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              }>
                <AlertTitle className="flex items-center gap-2">
                  {paymentRequisition.approval_status === 'approve'
                    ? <CheckCircle2 className="h-4 w-4" />
                    : <AlertCircle className="h-4 w-4" />}
                  {paymentRequisition.approval_status === 'approve'
                    ? t('paymentRequisition.detail.approvalsTab.approvedMessage')
                    : t('paymentRequisition.detail.approvalsTab.pendingMessage')}
                </AlertTitle>
                <AlertDescription>{paymentRequisition.comment}</AlertDescription>
              </Alert>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">{t('paymentRequisition.detail.approvalsTab.recipients')}</h3>
                <div className="space-y-4">
                  {paymentRequisition.request_to_detail.map((u) => (
                    <div key={u.id} className="flex items-start p-4 border rounded-md bg-muted/10">
                      <Avatar className="mr-3">
                        <AvatarImage src={u.avatar} alt={`${u.first_name} ${u.last_name}`} />
                        <AvatarFallback>{u.first_name.charAt(0)}{u.last_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{u.first_name} {u.last_name}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                          </div>
                          <StatusBadge status={u.status} />
                        </div>
                        <div className="mt-2">
                          <Badge variant="outline" className="mr-2">{u.roles}</Badge>
                          {u.team_lead && <Badge variant="secondary">Team Lead</Badge>}
                        </div>
                        {u.approval_limit && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {t('paymentRequisition.detail.approvalsTab.approvalLimit', {
                              amount: formatCurrency(u.approval_limit, paymentRequisition.pay_to_detail.currency)
                            })}
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
                {t('paymentRequisition.detail.back')}
              </Button>
              <div className="flex gap-2">
                <PermissionGuard feature='requisition' permission='edit'>
                  <Button variant="outline" onClick={() => handleEdit(id!)} className="gap-2">
                    <Edit className="h-4 w-4" />
                    {t('paymentRequisition.detail.edit')}
                  </Button>
                </PermissionGuard>
                {canApprove && (
                  <Button
                    onClick={() => setShowApproveDialog(true)}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                    disabled={approvePaymentrequisitionMutation.isPending}
                  >
                    {approvePaymentrequisitionMutation.isPending
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <CheckCircle2 className="h-4 w-4" />}
                    {t('paymentRequisition.detail.approveButton')}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('paymentRequisition.detail.backToList')}
        </Button>
      </div>

      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('paymentRequisition.detail.approveDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('paymentRequisition.detail.approveDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={approvePaymentrequisitionMutation.isPending}>
              {t('common:actions.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={approvePaymentrequisitionMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approvePaymentrequisitionMutation.isPending
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('paymentRequisition.detail.approveDialog.approving')}</>
                : t('paymentRequisition.detail.approveDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PaymentRequisitionDetailView;
