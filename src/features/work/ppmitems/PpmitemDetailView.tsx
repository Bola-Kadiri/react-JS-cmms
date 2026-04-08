// src/features/work/ppmitems/PpmitemDetailView.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  AlertTriangle, 
  Package, 
  Calculator, 
  Hash,
  FileText
} from 'lucide-react';
import { usePPMItemQuery } from '@/hooks/ppmitem/usePpmitemQueries';
import { PermissionGuard } from '@/components/PermissionGuard';

const PpmitemDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Using our custom hook
  const {
    data: ppmitem,
    isLoading,
    isError,
    error
  } = usePPMItemQuery(id);

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/work/ppm-items');
  };

  // Handle edit button click
  const handleEdit = (id: number) => {
    navigate(`/dashboard/work/ppm-items/edit/${id}`);
  };

  // Format currency
  const formatCurrency = (price: string) => {
    if (!price) return 'N/A';
    const amount = parseFloat(price);
    if (isNaN(amount)) return price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate total price
  const calculateTotalPrice = (qty: number, unitPrice: string) => {
    const price = parseFloat(unitPrice);
    if (isNaN(price)) return 'N/A';
    return formatCurrency((qty * price).toString());
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-green-600">Loading PPM item details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">Error loading PPM item details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to PPM Items
        </Button>
      </div>
    );
  }

  if (!ppmitem) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="text-red-500 text-xl">PPM item not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to PPM Items
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
            <h1 className="text-2xl font-bold text-green-800">PPM Item #{ppmitem.id}</h1>
            <p className="text-green-600 text-sm">View PPM item details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-semibold text-green-700">
              {calculateTotalPrice(ppmitem.qty, ppmitem.unit_price)}
            </p>
            <p className="text-xs text-green-500">Total Value</p>
          </div>
          <PermissionGuard feature='ppm_item' permission='edit'>
            <Button 
              onClick={() => handleEdit(ppmitem.id)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Edit className="mr-2 h-4 w-4" /> Edit PPM Item
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information Card */}
        <Card className="border-green-200 shadow-sm">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Item ID</p>
              <p className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Hash className="h-4 w-4 text-green-600" />
                {ppmitem.id}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="text-base text-gray-900 leading-relaxed">
                {ppmitem.description}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Unit</p>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mt-1">
                <Package className="h-3 w-3 mr-1" />
                {ppmitem.unit}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Information Card */}
        <Card className="border-green-200 shadow-sm">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Calculator className="h-5 w-5" />
              Pricing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Quantity</p>
                <p className="text-2xl font-bold text-green-700">
                  {ppmitem.qty.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{ppmitem.unit}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Unit Price</p>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCurrency(ppmitem.unit_price)}
                </p>
                <p className="text-xs text-gray-500">per {ppmitem.unit}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-green-700">Total Price</p>
                  <p className="text-2xl font-bold text-green-800">
                    {calculateTotalPrice(ppmitem.qty, ppmitem.unit_price)}
                  </p>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {ppmitem.qty.toLocaleString()} {ppmitem.unit} × {formatCurrency(ppmitem.unit_price)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <Card className="mt-6 border-green-200 shadow-sm">
        <CardHeader className="bg-green-50 border-b border-green-100">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Package className="h-5 w-5" />
            Item Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Hash className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-600">Item ID</p>
              <p className="text-xl font-bold text-blue-800">{ppmitem.id}</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-600">Quantity</p>
              <p className="text-xl font-bold text-green-800">{ppmitem.qty.toLocaleString()}</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Calculator className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-purple-600">Unit Price</p>
              <p className="text-xl font-bold text-purple-800">{formatCurrency(ppmitem.unit_price)}</p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Calculator className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-orange-600">Total Value</p>
              <p className="text-xl font-bold text-orange-800">
                {calculateTotalPrice(ppmitem.qty, ppmitem.unit_price)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PpmitemDetailView;
