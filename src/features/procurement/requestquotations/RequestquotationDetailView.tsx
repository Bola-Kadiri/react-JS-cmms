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
  FileText, 
  Package, 
  User, 
  Users, 
  CheckCircle2,
  FileBox,
  Paperclip
} from 'lucide-react';
import { useRequestquotationQuery } from '@/hooks/requestquotation/useRequestquotationQueries';
import { format } from 'date-fns';

const RequestquotationDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Using our custom hook to fetch request quotation data
  const {
    data: requestquotation,
    isLoading,
    isError,
    error
  } = useRequestquotationQuery(id);

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/procurement/request-quotation');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/dashboard/procurement/request-quotation/edit/${id}`);
  };

  // Format currency symbol
  const getCurrencySymbol = (currency: string) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'NGN': '₦',
      'GBP': '£'
    };
    return symbols[currency as keyof typeof symbols] || currency;
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

  // Format time
  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    try {
      // Parse time string (HH:MM format)
      const [hours, minutes] = timeString.split(':');
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes));
      return format(time, 'h:mm a');
    } catch (e) {
      return timeString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading request quotation details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Error loading request quotation details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Request Quotations
        </Button>
      </div>
    );
  }

  if (!requestquotation) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Request quotation not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Request Quotations
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
            <h1 className="text-2xl font-bold">
              RFQ #{requestquotation.id}: {requestquotation.title || requestquotation.title_en || 'Untitled'}
            </h1>
            <p className="text-muted-foreground text-sm">
              Type: {requestquotation.type || 'N/A'} • Currency: {requestquotation.currency || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <p className="text-sm text-muted-foreground">Created on {formatShortDate(requestquotation.created_at)}</p>
          </div>
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" /> Edit RFQ
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RFQ Information */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileBox className="h-5 w-5 text-primary" />
                  RFQ Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">RFQ ID</p>
                  <p className="text-md font-medium">#{requestquotation.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Title</p>
                  <p className="text-md">{requestquotation.title || requestquotation.title_en || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="text-md">{requestquotation.type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Currency</p>
                  <p className="text-lg font-semibold">{getCurrencySymbol(requestquotation.currency)} {requestquotation.currency}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-md">{formatShortDate(requestquotation.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-md">{formatShortDate(requestquotation.updated_at)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Requester</p>
                  <p className="text-lg font-semibold">
                    {requestquotation.requester_detail 
                      ? `${requestquotation.requester_detail.first_name} ${requestquotation.requester_detail.last_name}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Facility</p>
                  <p className="text-lg font-semibold">{requestquotation.facility_detail?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vendors Invited</p>
                  <p className="text-lg font-semibold">{requestquotation.vendors_detail?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Attachments</p>
                  <p className="text-lg font-semibold">{requestquotation.attachments_data?.length || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Facility Information */}
          {requestquotation.facility_detail && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Facility Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Facility Name</p>
                      <p className="text-lg font-medium">{requestquotation.facility_detail.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Address</p>
                      <p className="text-md">{requestquotation.facility_detail.address_gps || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                      <p className="text-md">{requestquotation.facility_detail.type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Code</p>
                      <Badge variant="outline">
                        {requestquotation.facility_detail.code || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Invited Vendors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requestquotation.vendors_detail && requestquotation.vendors_detail.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {requestquotation.vendors_detail.map((vendor) => (
                    <div key={vendor.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="space-y-3">
                        <div>
                          <p className="text-lg font-medium">{vendor.name}</p>
                          <p className="text-sm text-muted-foreground">{vendor.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Phone</p>
                          <p className="text-sm">{vendor.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Address</p>
                          <p className="text-sm">{vendor.address || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Registration Number</p>
                          <p className="text-sm">{vendor.registration_number || 'N/A'}</p>
                        </div>
                        <div>
                          <Badge variant="outline" className={vendor.status === 'Active' ? 
                            'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {vendor.status || 'N/A'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No vendors invited for this RFQ</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Terms and Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(requestquotation.terms || requestquotation.terms_en) ? (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">
                    {requestquotation.terms || requestquotation.terms_en}
                  </p>
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No terms and conditions specified for this RFQ</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-primary" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requestquotation.attachments_data && requestquotation.attachments_data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {requestquotation.attachments_data.map((attachment, index) => (
                    <div key={attachment.id || index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {attachment.file_url ? attachment.file_url.split('/').pop() : `Attachment ${index + 1}`}
                          </p>
                          <p className="text-xs text-muted-foreground">File attachment</p>
                        </div>
                      </div>
                      {attachment.file_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => window.open(attachment.file_url, '_blank')}
                        >
                          View File
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <Paperclip className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No attachments added to this RFQ</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RequestquotationDetailView;