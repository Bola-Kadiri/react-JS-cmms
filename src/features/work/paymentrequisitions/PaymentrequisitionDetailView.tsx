import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Edit,
  Loader2,
  Calendar,
  CalendarDays,
  Banknote,
  FileText,
  FileBox,
  Clock,
  Briefcase,
  ClipboardList,
  CheckCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Landmark,
  Hash,
  Lock
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { usePaymentrequisitionQuery, useClosePaymentrequisition } from '@/hooks/paymentrequisition/usePaymentrequisitionQueries';
import { PaymentrequisitionApprovalForm, PaymentrequisitionApprovalAction } from './PaymentrequisitionApprovalForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';
import { usePermissions } from '@/contexts/PermissionsContext';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentRequisitionDetailViewProps {
  // Lets this same component render nested inside another entity's page
  // (e.g. a WCC's "Payment Requisition" accordion section) instead of only
  // as its own routed page. When omitted, falls back to the route param —
  // the standalone page keeps working exactly as before.
  idProp?: string;
  embedded?: boolean;
}

const PaymentRequisitionDetailView = ({ idProp, embedded = false }: PaymentRequisitionDetailViewProps = {}) => {
  const { t } = useTypedTranslation('work');
  const { id: idParam } = useParams<{ id: string }>();
  const id = idProp ?? idParam;
  const navigate = useNavigate();
  const { userRole } = usePermissions();
  const { user } = useAuth();

  // Single dialog, three modes — mirrors WorkorderApprovalForm's action-driven pattern.
  const [activeAction, setActiveAction] = useState<PaymentrequisitionApprovalAction | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const {
    data: paymentRequisition,
    isLoading,
    isError,
    error
  } = usePaymentrequisitionQuery(id);
  const closeMutation = useClosePaymentrequisition(id);

  const userId = Number(user?.id);
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER ADMIN';
  const isFinance = userRole === 'FINANCE';
  // Owner is the requester who created the requisition
  const isOwner = paymentRequisition?.owner === userId;
  // A person in request_to is the designated approver — but the requester (owner) must never approve their own
  const isAttachedApprover = (paymentRequisition?.request_to?.includes(userId) ?? false) && !isOwner;
  const isDisbursed = paymentRequisition?.is_disbursed ?? false;
  const canApprove = (isAttachedApprover || isAdmin) && paymentRequisition?.approval_status === 'request' && !isDisbursed;
  const canReject = (isAttachedApprover || isAdmin) && paymentRequisition?.approval_status === 'request' && !isDisbursed;
  const canDisburse = (isFinance || isAdmin) && paymentRequisition?.approval_status === 'approve' && !isDisbursed;
  // The Requester's own final step — only once Finance has already disbursed.
  const isClosed = paymentRequisition?.is_closed ?? false;
  const canClose = (isOwner || isAdmin) && isDisbursed && !isClosed;

  const handleBack = () => navigate('/dashboard/work/payment-requisitions');
  const handleEdit = (editId: string) => navigate(`/dashboard/work/payment-requisitions/edit/${editId}`);

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':   return t('paymentRequisition.statusLabels.active');
      case 'inactive': return t('paymentRequisition.statusLabels.inactive');
      case 'request':  return t('paymentRequisition.approvalStatusLabels.request');
      case 'approve':  return t('paymentRequisition.approvalStatusLabels.approve');
      case 'reject':   return t('paymentRequisition.approvalStatusLabels.reject', { defaultValue: 'Rejected' } as any);
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
      case 'reject':
        variant = 'destructive';
        icon = <XCircle className="h-3 w-3 mr-1" />;
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
    <div className={embedded ? 'space-y-6' : 'container mx-auto p-6 space-y-6'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          {!embedded && (
            <Button onClick={handleBack} variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
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
          {isDisbursed && (
            <Badge variant="outline" className="flex items-center gap-1 border-green-300 text-green-700 bg-green-50">
              <Lock className="h-3 w-3" />
              {t('paymentRequisition.detail.pipeline.disbursedBadge')}
            </Badge>
          )}
          {isClosed && (
            <Badge variant="outline" className="flex items-center gap-1 border-green-300 text-green-700 bg-green-50">
              <CheckCircle2 className="h-3 w-3" />
              Closed
            </Badge>
          )}
          {canClose && (
            <Button
              onClick={() => setShowCloseConfirm(true)}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Close
            </Button>
          )}
          {canDisburse && (
            <Button
              onClick={() => setActiveAction('disburse')}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Landmark className="h-4 w-4" />
              {t('paymentRequisition.detail.disburseButton')}
            </Button>
          )}
          {canApprove && (
            <Button
              onClick={() => setActiveAction('approve')}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              {t('paymentRequisition.detail.approveButton')}
            </Button>
          )}
          {canReject && (
            <Button
              onClick={() => setActiveAction('reject')}
              variant="destructive"
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              {t('paymentRequisition.detail.rejectButton')}
            </Button>
          )}
          <PermissionGuard feature='requisition' permission='edit'>
            <Button
              onClick={() => handleEdit(id!)}
              variant="outline"
              className="gap-2"
              disabled={isDisbursed}
              title={isDisbursed ? t('paymentRequisition.detail.pipeline.lockedTooltip') : undefined}
            >
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
                ${paymentRequisition.approval_status === 'approve' ? 'bg-green-600 text-white' : 'bg-green-400 text-white'}`}>
                {paymentRequisition.approval_status === 'approve'
                  ? <CheckCircle2 className="h-4 w-4" />
                  : <Clock className="h-4 w-4" />}
              </div>
              <span className={`text-xs mt-1 text-center font-medium ${
                paymentRequisition.approval_status === 'approve' ? 'text-green-700' : 'text-green-600'
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
      {isDisbursed && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-6 flex items-center gap-3">
          <Lock className="h-5 w-5 text-green-700 shrink-0" />
          <div>
            <p className="text-green-800 font-semibold text-sm">{t('paymentRequisition.detail.pipeline.disbursedBannerTitle')}</p>
            <p className="text-green-700 text-xs mt-0.5">
              {paymentRequisition.disbursed_by_detail
                ? t('paymentRequisition.detail.pipeline.disbursedByReleased', {
                    name: `${paymentRequisition.disbursed_by_detail.first_name} ${paymentRequisition.disbursed_by_detail.last_name}`,
                  })
                : t('paymentRequisition.detail.pipeline.disbursedNotPaid')}
              {paymentRequisition.disbursed_at
                ? t('paymentRequisition.detail.pipeline.disbursedOn', { date: formatDate(paymentRequisition.disbursed_at) })
                : ''}
              . {t('paymentRequisition.detail.pipeline.disbursedLockNotice')}
            </p>
          </div>
        </div>
      )}
      {paymentRequisition.approval_status === 'reject' && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6 flex items-center gap-3">
          <XCircle className="h-5 w-5 text-red-700 shrink-0" />
          <div>
            <p className="text-red-800 font-semibold text-sm">{t('paymentRequisition.detail.pipeline.rejectedBannerTitle')}</p>
            {paymentRequisition.comment && (
              <p className="text-red-700 text-xs mt-0.5">{paymentRequisition.comment}</p>
            )}
          </div>
        </div>
      )}
      {!isDisbursed && paymentRequisition.approval_status === 'approve' && (
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

      <Accordion type="multiple" defaultValue={['detail']} className="w-full space-y-3">
        {/* ── Detail ─────────────────────────────────────────────────── */}
        <AccordionItem value="detail" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold">
              <FileText className="h-5 w-5" />Detail (1)
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Remark</p>
              <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-4 border">
                {paymentRequisition.remark || 'No remark provided'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">About</p>
                <div className="space-y-3">
                  <div><p className="text-sm text-gray-500">Requisition Number</p><p className="font-mono font-semibold text-gray-900">{paymentRequisition.requisition_number}</p></div>
                  <div><p className="text-sm text-gray-500">Approval Status</p><StatusBadge status={paymentRequisition.approval_status} /></div>
                  <div><p className="text-sm text-gray-500">Requisition Date</p><p className="font-medium text-gray-900">{formatDate(paymentRequisition.requisition_date)}</p></div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Payment</p>
                <div className="space-y-3">
                  <div><p className="text-sm text-gray-500">Expected Amount</p><p className="font-semibold text-gray-900">{formatCurrency(paymentRequisition.expected_payment_amount, paymentRequisition.pay_to_detail?.currency)}</p></div>
                  <div><p className="text-sm text-gray-500">Expected Payment Date</p><p className="font-medium text-gray-900">{formatDate(paymentRequisition.expected_payment_date)}</p></div>
                  <div><p className="text-sm text-gray-500">Withholding Tax</p><p className="font-medium text-gray-900">{formatCurrency(paymentRequisition.withholding_tax, paymentRequisition.pay_to_detail?.currency)}</p></div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Status</p>
                <div className="space-y-3">
                  <div><p className="text-sm text-gray-500">Disbursed</p>{isDisbursed ? <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">Yes — {formatDate(paymentRequisition.disbursed_at || '')}</Badge> : <p className="text-sm text-gray-400">Not yet</p>}</div>
                  <div><p className="text-sm text-gray-500">Closed</p>{isClosed ? <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">Yes — {formatDate(paymentRequisition.closed_at || '')}</Badge> : <p className="text-sm text-gray-400">Not yet</p>}</div>
                  <div><p className="text-sm text-gray-500">Requires Retirement</p><p className="font-medium text-gray-900">{paymentRequisition.retirement ? 'Yes' : 'No'}</p></div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── Resource ───────────────────────────────────────────────── */}
        {/* Who this payment is made to — the vendor, personnel, or owner. */}
        <AccordionItem value="resource" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold">
              <Briefcase className="h-5 w-5" />Resource ({paymentRequisition.pay_to_detail || paymentRequisition.payee_personnel_detail || paymentRequisition.payee_owner_detail ? 1 : 0})
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {paymentRequisition.pay_to_detail ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{paymentRequisition.pay_to_detail.name}</p>
                  <Badge variant="outline">{paymentRequisition.pay_to_detail.type}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-500">Email</p><p className="font-medium text-gray-900">{paymentRequisition.pay_to_detail.email}</p></div>
                  <div><p className="text-gray-500">Phone</p><p className="font-medium text-gray-900">{paymentRequisition.pay_to_detail.phone}</p></div>
                </div>
                <div className="bg-gray-50 border rounded-lg p-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-500">Bank</p><p className="font-medium text-gray-900">{paymentRequisition.pay_to_detail.bank}</p></div>
                  <div><p className="text-gray-500">Account Name</p><p className="font-medium text-gray-900">{paymentRequisition.pay_to_detail.account_name}</p></div>
                  <div><p className="text-gray-500">Account Number</p><p className="font-medium text-gray-900">{paymentRequisition.pay_to_detail.account_number}</p></div>
                  <div><p className="text-gray-500">Currency</p><p className="font-medium text-gray-900">{paymentRequisition.pay_to_detail.currency}</p></div>
                </div>
              </div>
            ) : paymentRequisition.payee_personnel_detail ? (
              <div><p className="font-semibold text-gray-900">{paymentRequisition.payee_personnel_detail.first_name} {paymentRequisition.payee_personnel_detail.last_name}</p><p className="text-sm text-gray-500">{paymentRequisition.payee_personnel_detail.email}</p></div>
            ) : paymentRequisition.payee_owner_detail ? (
              <div><p className="font-semibold text-gray-900">{paymentRequisition.payee_owner_detail.first_name} {paymentRequisition.payee_owner_detail.last_name}</p><p className="text-sm text-gray-500">{paymentRequisition.payee_owner_detail.email}</p></div>
            ) : (
              <p className="text-sm text-gray-400">No payee selected yet.</p>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* ── Approval ───────────────────────────────────────────────── */}
        <AccordionItem value="approval" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold">
              <CheckCircle className="h-5 w-5" />Approval ({paymentRequisition.approval_status === 'request' ? 0 : 1})
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2">
            {paymentRequisition.approval_status === 'request' ? (
              <p className="text-sm text-gray-400">No approvals yet.</p>
            ) : (
              <div className="p-3 rounded-lg bg-gray-50 border">
                <StatusBadge status={paymentRequisition.approval_status} />
                {paymentRequisition.comment && <p className="text-sm text-gray-600 mt-2">{paymentRequisition.comment}</p>}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Approver(s)</p>
              {paymentRequisition.request_to_detail && paymentRequisition.request_to_detail.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {paymentRequisition.request_to_detail.map((u) => (
                    <div key={u.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 border">
                      <Avatar className="h-8 w-8"><AvatarImage src={u.avatar} /><AvatarFallback className="text-xs bg-green-100 text-green-700 font-semibold">{`${(u.first_name || '').charAt(0)}${(u.last_name || '').charAt(0)}`}</AvatarFallback></Avatar>
                      <div className="min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">{u.first_name} {u.last_name}</p><p className="text-xs text-gray-500 truncate">{u.email}</p></div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-400">Not assigned</p>}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── Quotation ──────────────────────────────────────────────── */}
        {/* This requisition's own priced line items. */}
        <AccordionItem value="quotation" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold">
              <Banknote className="h-5 w-5" />Quotation ({paymentRequisition.items_detail?.length ?? 0})
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2">
            {paymentRequisition.items_detail && paymentRequisition.items_detail.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-2 pr-4">Item</th>
                        <th className="pb-2 pr-4">Description</th>
                        <th className="pb-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentRequisition.items_detail.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-2 pr-4">{item.item_name}</td>
                          <td className="py-2 pr-4 text-gray-500">{item.description}</td>
                          <td className="py-2">{formatCurrency(item.amount, paymentRequisition.pay_to_detail?.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap justify-end gap-6 pt-4 border-t text-sm">
                  <div><span className="text-gray-500">Withholding Tax: </span><span className="font-semibold">{formatCurrency(paymentRequisition.withholding_tax, paymentRequisition.pay_to_detail?.currency)}</span></div>
                  <div><span className="text-gray-500">Total: </span><span className="font-semibold text-green-700">{formatCurrency(paymentRequisition.expected_payment_amount, paymentRequisition.pay_to_detail?.currency)}</span></div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">No line items added yet.</p>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* ── Comments ───────────────────────────────────────────────── */}
        <AccordionItem value="comments" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold"><FileText className="h-5 w-5" />Comments (0)</span>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <p className="text-sm text-gray-400">No comments on this requisition yet.</p>
          </AccordionContent>
        </AccordionItem>

        {/* ── File attachments ──────────────────────────────────────── */}
        <AccordionItem value="attachments" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold">
              <FileBox className="h-5 w-5" />File attachments ({paymentRequisition.attachment_data?.length ?? 0})
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            {paymentRequisition.attachment_data && paymentRequisition.attachment_data.length > 0 ? (
              <div className="space-y-2">
                {paymentRequisition.attachment_data.map((a, i) => (
                  <a
                    key={i}
                    href={a.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-700 underline font-medium p-2 rounded-lg hover:bg-green-50"
                  >
                    <FileText className="h-4 w-4" /> {a.file.split('/').pop()}
                  </a>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400">No files attached.</p>}
          </AccordionContent>
        </AccordionItem>

        {/* ── History ────────────────────────────────────────────────── */}
        <AccordionItem value="history" className="border border-green-200 rounded-lg shadow-sm bg-white px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 text-green-800 font-semibold">
              <CalendarDays className="h-5 w-5" />History (3)
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
                  <div className="w-px h-12 bg-gray-300 mt-2" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Raised</h3>
                  <time className="text-sm text-gray-500">{formatDate(paymentRequisition.created_at)}</time>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100"><Clock className="h-5 w-5 text-green-600" /></div>
                  <div className="w-px h-12 bg-gray-300 mt-2" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Last Updated</h3>
                  <time className="text-sm text-gray-500">{formatDate(paymentRequisition.updated_at)}</time>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isClosed ? 'bg-green-100' : paymentRequisition.approval_status === 'reject' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    {isClosed
                      ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                      : paymentRequisition.approval_status === 'reject' ? <XCircle className="h-5 w-5 text-red-600" />
                      : <Clock className="h-5 w-5 text-yellow-600" />}
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Current Status</h3>
                  <div className="mt-1"><StatusBadge status={paymentRequisition.approval_status} /></div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {!embedded && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('paymentRequisition.detail.backToList')}
          </Button>
        </div>
      )}

      {activeAction && (
        <PaymentrequisitionApprovalForm
          isOpen={!!activeAction}
          onClose={() => setActiveAction(null)}
          requisitionId={id!}
          requisitionNumber={paymentRequisition.requisition_number}
          action={activeAction}
          amount={paymentRequisition.expected_payment_amount}
          currency={paymentRequisition.pay_to_detail.currency}
        />
      )}

      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Payment Requisition {paymentRequisition.requisition_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This confirms the payment has been received and archives the record. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => closeMutation.mutate(undefined, { onSuccess: () => setShowCloseConfirm(false) })}
              disabled={closeMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {closeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PaymentRequisitionDetailView;
