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
  User, 
  Users, 
  Paperclip,
  Building2
} from 'lucide-react';
import { useVendorContractQuery } from '@/hooks/vendorcontract/useVendorcontractQueries';
import { format } from 'date-fns';
import { PermissionGuard } from '@/components/PermissionGuard';

const VendorcontractDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Using our custom hook to fetch vendor contract data
  const {
    data: vendorcontract,
    isLoading,
    isError,
    error
  } = useVendorContractQuery(id);

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/procurement/vendor-contracts');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/dashboard/procurement/vendor-contracts/edit/${id}`);
  };

  // Get contract type badge styles
  const getContractTypeBadge = (type: string) => {
    switch (type) {
      case 'Service':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">{type}</Badge>;
      case 'Purchase':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">{type}</Badge>;
      case 'Lease':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">{type}</Badge>;
      case 'NDA':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">{type}</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
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

  // Calculate contract duration
  const getContractDuration = () => {
    if (!vendorcontract?.start_date || !vendorcontract?.end_date) return 'N/A';
    try {
      const start = new Date(vendorcontract.start_date);
      const end = new Date(vendorcontract.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
      if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? 's' : ''}`;
      }
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
    } catch (e) {
      return 'N/A';
    }
  };

  // Check if contract is active
  const isContractActive = () => {
    if (!vendorcontract?.start_date || !vendorcontract?.end_date) return false;
    const now = new Date();
    const start = new Date(vendorcontract.start_date);
    const end = new Date(vendorcontract.end_date);
    return now >= start && now <= end;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-gray-600">Loading vendor contract details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Error loading vendor contract details</div>
        <p className="text-sm text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Vendor Contracts
        </Button>
      </div>
    );
  }

  if (!vendorcontract) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Vendor contract not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Vendor Contracts
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
            <h1 className="text-2xl font-bold text-gray-900">Vendor Contract Details</h1>
            <p className="text-sm text-gray-500 mt-1">
              Contract ID: #{vendorcontract.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isContractActive() && (
            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
              Active
            </Badge>
          )}
          <PermissionGuard feature='vendor_contract' permission='edit'>
            <Button
              onClick={handleEdit}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Contract
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contract Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Contract Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Contract Title</label>
                  <p className="text-base text-gray-900 mt-1">{vendorcontract.contract_title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contract Type</label>
                  <div className="mt-1">{getContractTypeBadge(vendorcontract.contract_type)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Start Date</label>
                  <div className="flex items-center gap-2 mt-1">
                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                    <p className="text-base text-gray-900">{formatDate(vendorcontract.start_date)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">End Date</label>
                  <div className="flex items-center gap-2 mt-1">
                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                    <p className="text-base text-gray-900">{formatDate(vendorcontract.end_date)}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Contract Duration</label>
                <p className="text-base text-gray-900 mt-1">{getContractDuration()}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Proposed Value</label>
                <div className="flex items-center gap-2 mt-1">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(vendorcontract.proposed_value)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachment Documents Card */}
          {vendorcontract.attachments_data && vendorcontract.attachments_data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="h-5 w-5 text-emerald-600" />
                  Attachment Documents ({vendorcontract.attachments_data.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {vendorcontract.attachments_data.map((agreement: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {typeof agreement === 'string' 
                              ? agreement.split('/').pop() 
                              : agreement.name || `Document ${index + 1}`}
                          </p>
                        </div>
                      </div>
                      {typeof agreement === 'string' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(agreement, '_blank')}
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
                    {vendorcontract.vendor_detail?.name || `Vendor #${vendorcontract.vendor}`}
                  </p>
                </div>
                {vendorcontract.vendor_detail?.type && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <p className="text-sm text-gray-900 mt-1">{vendorcontract.vendor_detail.type}</p>
                  </div>
                )}
                {vendorcontract.vendor_detail?.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900 mt-1">{vendorcontract.vendor_detail.email}</p>
                  </div>
                )}
                {vendorcontract.vendor_detail?.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-sm text-gray-900 mt-1">{vendorcontract.vendor_detail.phone}</p>
                  </div>
                )}
                {vendorcontract.vendor_detail?.status && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-sm mt-1">
                      <Badge variant={vendorcontract.vendor_detail.status === 'Active' ? 'default' : 'secondary'}>
                        {vendorcontract.vendor_detail.status}
                      </Badge>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Review Status Card */}
          {vendorcontract.review_status && (
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
                          vendorcontract.review_status === 'Approved' ? 'default' : 
                          vendorcontract.review_status === 'Rejected' ? 'destructive' : 
                          'secondary'
                        }
                        className={
                          vendorcontract.review_status === 'Pending' ? 'bg-yellow-500 hover:bg-yellow-600' : ''
                        }
                      >
                        {vendorcontract.review_status}
                      </Badge>
                    </p>
                  </div>
                  {vendorcontract.reviewed_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Reviewed At</label>
                      <p className="text-sm text-gray-900 mt-1">{formatDate(vendorcontract.reviewed_at)}</p>
                    </div>
                  )}
                  {vendorcontract.review_comment && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Review Comment</label>
                      <p className="text-sm text-gray-900 mt-1 whitespace-pre-line">{vendorcontract.review_comment}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviewer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                Reviewer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Reviewer</label>
                  <p className="text-base text-gray-900 mt-1">
                    {vendorcontract.reviewer_detail?.email || 
                     `${vendorcontract.reviewer_detail?.first_name} ${vendorcontract.reviewer_detail?.last_name}` ||
                     `User #${vendorcontract.reviewer}`}
                  </p>
                </div>
                {vendorcontract.reviewer_detail?.roles && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Role</label>
                    <p className="text-sm text-gray-900 mt-1">{vendorcontract.reviewer_detail.roles}</p>
                  </div>
                )}
                {vendorcontract.reviewer_detail?.status && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-sm mt-1">
                      <Badge variant={vendorcontract.reviewer_detail.status === 'Active' ? 'default' : 'secondary'}>
                        {vendorcontract.reviewer_detail.status}
                      </Badge>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timestamps Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-emerald-600" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vendorcontract.created_at && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(vendorcontract.created_at)}</p>
                </div>
              )}
              {vendorcontract.updated_at && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(vendorcontract.updated_at)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VendorcontractDetailView;

