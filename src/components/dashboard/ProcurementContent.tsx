import { 
    DollarSign, 
    ShoppingCart, 
    Clock, 
    CheckCircle, 
    AlertCircle, 
    FileText 
  } from "lucide-react";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
  import DashboardCard from "@/components/dashboard/DashboardCard";
  
  const ProcurementContent = () => {
    return (
      <div className="space-y-6">
        {/* <h1 className="text-2xl font-bold tracking-tight">Procurement Dashboard</h1> */}
        
        <div className="grid gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">PROCUREMENT OVERVIEW:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard
                title="Purchase"
                subtitle="Requests"
                value="56"
                icon={<ShoppingCart className="h-8 w-8 text-blue-500" />}
                className="bg-blue-50"
              />
              
              <DashboardCard
                title="Purchase"
                subtitle="Orders"
                value="42"
                icon={<FileText className="h-8 w-8 text-green-500" />}
                className="bg-green-50"
              />
              
              <DashboardCard
                title="Pending"
                subtitle="Approval"
                value="18"
                icon={<Clock className="h-8 w-8 text-amber-500" />}
                className="bg-amber-50"
              />
              
              <DashboardCard
                title="Monthly"
                subtitle="Spending"
                value="$45.2K"
                icon={<DollarSign className="h-8 w-8 text-purple-500" />}
                className="bg-purple-50"
              />
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">PROCUREMENT ALERTS:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard
                title="Over"
                subtitle="Budget"
                value="7"
                icon={<AlertCircle className="h-8 w-8 text-red-500" />}
                className="bg-red-50"
              />
              
              <DashboardCard
                title="Urgent"
                subtitle="Requests"
                value="9"
                icon={<AlertCircle className="h-8 w-8 text-red-500" />}
                className="bg-red-50"
              />
              
              <DashboardCard
                title="Delayed"
                subtitle="Deliveries"
                value="12"
                icon={<Clock className="h-8 w-8 text-amber-500" />}
                className="bg-amber-50"
              />
              
              <DashboardCard
                title="Contract"
                subtitle="Renewals"
                value="5"
                icon={<FileText className="h-8 w-8 text-blue-500" />}
                className="bg-blue-50"
              />
            </div>
          </div>
        </div>
  
        <Tabs defaultValue="purchaseRequests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="purchaseRequests">PURCHASE REQUESTS</TabsTrigger>
            <TabsTrigger value="purchaseOrders">PURCHASE ORDERS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="purchaseRequests" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DashboardCard
                title="New"
                value="23"
                icon={<FileText className="h-8 w-8 text-blue-500" />}
                className="bg-white shadow-sm"
              />
              
              <DashboardCard
                title="In Review"
                value="15"
                icon={<Clock className="h-8 w-8 text-amber-500" />}
                className="bg-white shadow-sm"
              />
              
              <DashboardCard
                title="Approved"
                value="12"
                icon={<CheckCircle className="h-8 w-8 text-green-500" />}
                className="bg-white shadow-sm"
              />
              
              <DashboardCard
                title="Rejected"
                value="6"
                icon={<AlertCircle className="h-8 w-8 text-red-500" />}
                className="bg-white shadow-sm"
              />
              
              <DashboardCard
                title="Converting to PO"
                value="8"
                icon={<FileText className="h-8 w-8 text-purple-500" />}
                className="bg-white shadow-sm"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="purchaseOrders" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DashboardCard
                title="Draft"
                value="14"
                icon={<FileText className="h-8 w-8 text-gray-500" />}
                className="bg-white shadow-sm"
              />
              
              <DashboardCard
                title="Sent"
                value="18"
                icon={<CheckCircle className="h-8 w-8 text-green-500" />}
                className="bg-white shadow-sm"
              />
              
              <DashboardCard
                title="Partially Received"
                value="7"
                icon={<ShoppingCart className="h-8 w-8 text-amber-500" />}
                className="bg-white shadow-sm"
              />
              
              <DashboardCard
                title="Fully Received"
                value="10"
                icon={<CheckCircle className="h-8 w-8 text-blue-500" />}
                className="bg-white shadow-sm"
              />
              
              <DashboardCard
                title="Cancelled"
                value="3"
                icon={<AlertCircle className="h-8 w-8 text-red-500" />}
                className="bg-white shadow-sm"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  export default ProcurementContent;