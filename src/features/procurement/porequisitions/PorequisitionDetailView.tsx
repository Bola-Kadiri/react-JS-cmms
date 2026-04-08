import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  AlertTriangle, 
  CalendarDays, 
  FileText, 
  DollarSign, 
  Users, 
  Paperclip,
  Building2
} from 'lucide-react';
import { usePorequisitionQuery } from '@/hooks/porequisition/usePorequisitionQueries';
import { format } from 'date-fns';

const PorequisitionDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Using our custom hook to fetch PO requisition data
  const {
    data: porequisition,
    isLoading,
    isError,
    error
  } = usePorequisitionQuery(id);

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/procurement/po-requisition');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/dashboard/procurement/po-requisition/edit/${id}`);
  };

  // Format currency
  const formatCurrency = (amount: string) => {
    try {
      const numAmount = parseFloat(amount);
      return numAmount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      });
    } catch (e) {
      return amount;
    }
  };

  // Get date formatted
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get short date formatted
  const formatShortDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-gray-600">Loading PO requisition details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Error loading PO requisition details</div>
        <p className="text-sm text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to PO Requisitions
        </Button>
      </div>
    );
  }

  if (!porequisition) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">PO requisition not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to PO Requisitions
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="hover:bg-emerald-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PO Requisition Details</h1>
            <p className="text-sm text-gray-500 mt-1">
              Requisition ID: #{porequisition.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleEdit}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Requisition
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Requisition Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Requisition Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Title</label>
                  <p className="text-base text-gray-900 mt-1">{porequisition.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Invoice Number</label>
                  <p className="text-base text-gray-900 mt-1">{porequisition.invoice_number}</p>
                </div>
              </div>

              {porequisition.sage_reference_number && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Sage Reference Number</label>
                  <p className="text-base text-gray-900 mt-1">{porequisition.sage_reference_number}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-base text-gray-900 mt-1 whitespace-pre-line">{porequisition.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(porequisition.amount)}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Expected Delivery Date</label>
                  <div className="flex items-center gap-2 mt-1">
                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                    <p className="text-base text-gray-900">{formatDate(porequisition.expected_delivery_date)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachment Documents Card */}
          {porequisition.attachments_data && porequisition.attachments_data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="h-5 w-5 text-emerald-600" />
                  Attachment Documents ({porequisition.attachments_data.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {porequisition.attachments_data.map((attachment: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {typeof attachment === 'string' 
                              ? attachment.split('/').pop() 
                              : attachment.name || `Document ${index + 1}`}
                          </p>
                        </div>
                      </div>
                      {typeof attachment === 'string' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(attachment, '_blank')}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        >
                          View
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Related Information */}
        <div className="space-y-6">
          {/* Vendor Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
                Vendor Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Vendor Name</label>
                  <p className="text-base text-gray-900 mt-1">
                    {porequisition.vendor_detail?.name || `Vendor #${porequisition.vendor}`}
                  </p>
                </div>
                {porequisition.vendor_detail?.type && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <p className="text-sm text-gray-900 mt-1">{porequisition.vendor_detail.type}</p>
                  </div>
                )}
                {porequisition.vendor_detail?.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900 mt-1">{porequisition.vendor_detail.email}</p>
                  </div>
                )}
                {porequisition.vendor_detail?.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-sm text-gray-900 mt-1">{porequisition.vendor_detail.phone}</p>
                  </div>
                )}
                {porequisition.vendor_detail?.status && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-sm mt-1">
                      <Badge variant={porequisition.vendor_detail.status === 'Active' ? 'default' : 'secondary'}>
                        {porequisition.vendor_detail.status}
                      </Badge>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Review Status Card */}
          {porequisition.review_status && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Review Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-sm mt-1">
                      <Badge 
                        variant={
                          porequisition.review_status === 'Approved' ? 'default' : 
                          porequisition.review_status === 'Rejected' ? 'destructive' : 
                          'secondary'
                        }
                        className={
                          porequisition.review_status === 'Pending' ? 'bg-yellow-500 hover:bg-yellow-600' : ''
                        }
                      >
                        {porequisition.review_status}
                      </Badge>
                    </p>
                  </div>
                  {porequisition.reviewed_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Reviewed At</label>
                      <p className="text-sm text-gray-900 mt-1">{formatDate(porequisition.reviewed_at)}</p>
                    </div>
                  )}
                  {porequisition.review_comment && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Review Comment</label>
                      <p className="text-sm text-gray-900 mt-1 whitespace-pre-line">{porequisition.review_comment}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approver Information Card */}
          {porequisition.approver && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  Approver Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Approver</label>
                    <p className="text-base text-gray-900 mt-1">
                      {porequisition.approver_detail?.email || 
                       `${porequisition.approver_detail?.first_name} ${porequisition.approver_detail?.last_name}` ||
                       `User #${porequisition.approver}`}
                    </p>
                  </div>
                  {porequisition.approver_detail?.roles && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Role</label>
                      <p className="text-sm text-gray-900 mt-1">{porequisition.approver_detail.roles}</p>
                    </div>
                  )}
                  {porequisition.approver_detail?.status && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className="text-sm mt-1">
                        <Badge variant={porequisition.approver_detail.status === 'Active' ? 'default' : 'secondary'}>
                          {porequisition.approver_detail.status}
                        </Badge>
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-emerald-600" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {porequisition.created_at && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(porequisition.created_at)}</p>
                </div>
              )}
              {porequisition.updated_at && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(porequisition.updated_at)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PorequisitionDetailView;

