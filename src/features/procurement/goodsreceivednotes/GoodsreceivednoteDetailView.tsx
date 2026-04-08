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
  Package, 
  User, 
  Building,
  Receipt,
  Truck
} from 'lucide-react';
import { useGoodsreceivednoteQuery } from '@/hooks/goodsreceivednote/useGoodsreceivednoteQueries';
import { format } from 'date-fns';

const GoodsreceivednoteDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Using our custom hook to fetch GRN data
  const {
    data: goodsreceivednote,
    isLoading,
    isError,
    error
  } = useGoodsreceivednoteQuery(id);

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/procurement/goods-received-note');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/dashboard/procurement/goods-received-note/edit/${id}`);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-gray-600">Loading GRN details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Error loading GRN details</div>
        <p className="text-sm text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to GRNs
        </Button>
      </div>
    );
  }

  if (!goodsreceivednote) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">GRN not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to GRNs
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
            <h1 className="text-2xl font-bold text-gray-900">Goods Received Note Details</h1>
            <p className="text-sm text-gray-500 mt-1">
              GRN Number: {goodsreceivednote.grn_number}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleEdit}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit GRN
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* GRN Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600" />
                GRN Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">GRN Number</label>
                  <p className="text-base text-gray-900 mt-1">{goodsreceivednote.grn_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Receipt</label>
                  <div className="flex items-center gap-2 mt-1">
                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                    <p className="text-base text-gray-900">{formatDate(goodsreceivednote.date_of_receipt)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Delivery Note Number</label>
                  <p className="text-base text-gray-900 mt-1">{goodsreceivednote.delivery_note_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Invoice Number</label>
                  <p className="text-base text-gray-900 mt-1">{goodsreceivednote.invoice_number}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Review Status</label>
                  <div className="mt-1">
                    <Badge 
                      variant="outline" 
                      className={
                        goodsreceivednote.review_status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                          : goodsreceivednote.review_status === 'Approved'
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                      }
                    >
                      {goodsreceivednote.review_status || 'N/A'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Is Reviewed</label>
                  <p className="text-base text-gray-900 mt-1">{goodsreceivednote.is_reviewed ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {goodsreceivednote.reviewed_at && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Reviewed At</label>
                  <p className="text-base text-gray-900 mt-1">{formatDate(goodsreceivednote.reviewed_at)}</p>
                </div>
              )}

              {goodsreceivednote.review_comment && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Review Comment</label>
                  <p className="text-base text-gray-900 mt-1">{goodsreceivednote.review_comment}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Purchase Order Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-600" />
                Purchase Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium text-gray-500">Purchase Order</label>
                <p className="text-base text-gray-900 mt-1">
                  PO #{goodsreceivednote.purchase_order} 
                  {goodsreceivednote.purchase_order_detail?.type && ` - ${goodsreceivednote.purchase_order_detail.type}`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Related Information */}
        <div className="space-y-6">
          {/* Vendor Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-600" />
                Vendor Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium text-gray-500">Vendor</label>
                <p className="text-base text-gray-900 mt-1">
                  {goodsreceivednote.vendor_detail?.name || `Vendor #${goodsreceivednote.vendor}`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Facility Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-emerald-600" />
                Facility Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium text-gray-500">Facility</label>
                <p className="text-base text-gray-900 mt-1">
                  {goodsreceivednote.facility_detail?.name || `Facility #${goodsreceivednote.facility}`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Received By Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" />
                Personnel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Received By</label>
                <p className="text-base text-gray-900 mt-1">
                  {goodsreceivednote.received_by_detail
                    ? `${goodsreceivednote.received_by_detail.first_name} ${goodsreceivednote.received_by_detail.last_name}`
                    : 'N/A'}
                </p>
                {goodsreceivednote.received_by_detail?.email && (
                  <p className="text-sm text-gray-500 mt-1">{goodsreceivednote.received_by_detail.email}</p>
                )}
              </div>

              {goodsreceivednote.confirmed_by_detail && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Confirmed By</label>
                  <p className="text-base text-gray-900 mt-1">
                    {`${goodsreceivednote.confirmed_by_detail.first_name} ${goodsreceivednote.confirmed_by_detail.last_name}`}
                  </p>
                  {goodsreceivednote.confirmed_by_detail.email && (
                    <p className="text-sm text-gray-500 mt-1">{goodsreceivednote.confirmed_by_detail.email}</p>
                  )}
                  {goodsreceivednote.confirmed_at && (
                    <p className="text-xs text-gray-500 mt-1">Confirmed on {formatDate(goodsreceivednote.confirmed_at)}</p>
                  )}
                </div>
              )}
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
              {goodsreceivednote.created_at && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(goodsreceivednote.created_at)}</p>
                </div>
              )}
              {goodsreceivednote.updated_at && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(goodsreceivednote.updated_at)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GoodsreceivednoteDetailView;

