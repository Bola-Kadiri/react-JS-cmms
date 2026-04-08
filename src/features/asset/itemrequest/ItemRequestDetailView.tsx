import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  Tag, 
  User,
  FileText,
  Package,
  Store,
  Calendar,
  Building,
  MapPin,
  MessageSquare,
  CheckCircle2,
  Clock,
  ShoppingCart,
  FileIcon,
  UserCheck,
  Package2
} from 'lucide-react';
import { useItemRequestQuery } from '@/hooks/itemrequest/useItemRequestQueries';
import { useFormatters } from '@/utils/formatters';

const ItemRequestDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatDate } = useFormatters();
  
  // Using our custom hook
  const { 
    data: itemRequest, 
    isLoading, 
    isError,
    error 
  } = useItemRequestQuery(id);

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/asset/item-requests');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/dashboard/asset/item-requests/edit/${id}`);
  };

  // Get type badge styling
  const getTypeBadge = (type: string) => {
    return type === 'for_use' 
      ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">For Use</Badge>
      : <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">For Store</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-muted-foreground">Loading item request details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-lg font-medium">Error loading item request details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Item Requests
        </Button>
      </div>
    );
  }

  if (!itemRequest) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-lg font-medium">Item request not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Item Requests
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Header Section */}
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
            <h1 className="text-2xl font-bold text-gray-900">
              {itemRequest.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Request #{itemRequest.id} • {getTypeBadge(itemRequest.type)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleEdit}
            className="bg-green-600 hover:bg-green-700"
          >
            <Edit className="mr-2 h-4 w-4" /> 
            Edit Request
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileIcon className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="people" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            People & Location
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Package2 className="h-4 w-4" />
            Items
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Details & Comments
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Tag className="h-5 w-5 text-green-600" /> 
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Request Name</p>
                    <p className="text-base font-semibold mt-1">{itemRequest.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Request Type</p>
                    <div className="mt-1">{getTypeBadge(itemRequest.type)}</div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Required Date</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <p className="text-base font-semibold">{formatDate(itemRequest.required_date)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Request From</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Store className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-base font-semibold">
                          {itemRequest.request_from_detail?.name || `Store ID: ${itemRequest.request_from}`}
                        </p>
                        {itemRequest.request_from_detail?.location && (
                          <p className="text-sm text-muted-foreground">{itemRequest.request_from_detail.location}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">Request ID</span>
                  </div>
                  <span className="text-lg font-bold text-green-700">#{itemRequest.id}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Total Items</span>
                  </div>
                  <span className="text-lg font-bold text-blue-700">{itemRequest.items?.length || 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium">Total Quantity</span>
                  </div>
                  <span className="text-lg font-bold text-purple-700">
                    {itemRequest.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Request Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Request Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700 mb-1">{itemRequest.name}</div>
                <div className="text-sm text-muted-foreground mb-3">
                  Required by {formatDate(itemRequest.required_date)}
                </div>
                {getTypeBadge(itemRequest.type)}
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Store:</span>
                  <span className="font-medium">
                    {itemRequest.request_from_detail?.name || `ID: ${itemRequest.request_from}`}
                  </span>
                </div>
                {(itemRequest.department_detail || itemRequest.department) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium">
                      {itemRequest.department_detail?.name || `ID: ${itemRequest.department}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Requester:</span>
                  <span className="font-medium">
                    {itemRequest.requested_by_detail 
                      ? `${itemRequest.requested_by_detail.first_name} ${itemRequest.requested_by_detail.last_name}`
                      : `ID: ${itemRequest.requested_by}`
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Approver:</span>
                  <span className="font-medium">
                    {itemRequest.approved_by_detail 
                      ? `${itemRequest.approved_by_detail.first_name} ${itemRequest.approved_by_detail.last_name}`
                      : `ID: ${itemRequest.approved_by}`
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* People & Location Tab */}
        <TabsContent value="people" className="space-y-6 mt-6">
          {/* People Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <User className="h-5 w-5 text-green-600" /> 
                People Involved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Requested By</p>
                  <div className="mt-1">
                    {itemRequest.requested_by_detail ? (
                      <>
                        <p className="text-base font-semibold">
                          {itemRequest.requested_by_detail.first_name} {itemRequest.requested_by_detail.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{itemRequest.requested_by_detail.email}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {itemRequest.requested_by_detail.roles}
                        </Badge>
                      </>
                    ) : (
                      <p className="text-base font-semibold">User ID: {itemRequest.requested_by}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved By</p>
                  <div className="mt-1">
                    {itemRequest.approved_by_detail ? (
                      <>
                        <p className="text-base font-semibold">
                          {itemRequest.approved_by_detail.first_name} {itemRequest.approved_by_detail.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{itemRequest.approved_by_detail.email}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {itemRequest.approved_by_detail.roles}
                        </Badge>
                      </>
                    ) : (
                      <p className="text-base font-semibold">User ID: {itemRequest.approved_by}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information Card - Only show if relevant */}
          {(itemRequest.department_detail || itemRequest.facility_detail || itemRequest.building_detail || itemRequest.department || itemRequest.facility || itemRequest.building) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <MapPin className="h-5 w-5 text-green-600" /> 
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(itemRequest.department_detail || itemRequest.department) && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Department</p>
                      <p className="text-base font-semibold mt-1">
                        {itemRequest.department_detail?.name || `Department ID: ${itemRequest.department}`}
                      </p>
                    </div>
                  )}
                  
                  {(itemRequest.facility_detail || itemRequest.facility) && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Facility</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Building className="h-4 w-4 text-green-600" />
                        <p className="text-base font-semibold">
                          {itemRequest.facility_detail?.name || `Facility ID: ${itemRequest.facility}`}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {(itemRequest.building_detail || itemRequest.building) && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Building</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Building className="h-4 w-4 text-green-600" />
                        <p className="text-base font-semibold">
                          {itemRequest.building_detail?.name || `Building ID: ${itemRequest.building}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-6 mt-6">
          {/* Requested Items Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Package className="h-5 w-5 text-green-600" /> 
                Requested Items ({itemRequest.items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {itemRequest.items?.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">Item {index + 1}</h4>
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-green-600" />
                        <Badge variant="outline" className="text-green-700 border-green-200">
                          Qty: {item.quantity}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Item ID</p>
                        <p className="text-sm mt-1 font-semibold">#{item.item_id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Category</p>
                        <p className="text-sm mt-1">Category ID: {item.category}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Subcategory</p>
                        <p className="text-sm mt-1">Subcategory ID: {item.subcategory}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Model</p>
                        <p className="text-sm mt-1">Model ID: {item.model}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Description</p>
                      <div className="bg-white rounded p-3 mt-1">
                        <p className="text-sm text-gray-700">{item.description}</p>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No items specified for this request.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details & Comments Tab */}
        <TabsContent value="comments" className="space-y-6 mt-6">
          {/* Description Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <FileText className="h-5 w-5 text-green-600" /> 
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{itemRequest.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Comments Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <MessageSquare className="h-5 w-5 text-green-600" /> 
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{itemRequest.comment}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ItemRequestDetailView; 