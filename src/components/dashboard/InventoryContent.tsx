import { 
    Package, 
    ShoppingCart, 
    Truck, 
    AlertCircle, 
    BarChart, 
    Clock 
  } from "lucide-react";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
  import DashboardCard from "@/components/dashboard/DashboardCard";
  
  const InventoryContent = () => {
    return (
      <div className="space-y-6">
        {/* <h1 className="text-2xl font-bold tracking-tight">Inventory Dashboard</h1> */}
        
        <div className="grid gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">INVENTORY OVERVIEW:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard
                title="Total"
                subtitle="Items"
                value="1,245"
                icon={<Package className="h-8 w-8 text-blue-500" />}
                className="bg-blue-50"
              />
              
              <DashboardCard
                title="Low"
                subtitle="Stock"
                value="28"
                icon={<AlertCircle className="h-8 w-8 text-red-500" />}
                className="bg-red-50"
              />
              
              <DashboardCard
                title="Items on"
                subtitle="Order"
                value="124"
                icon={<ShoppingCart className="h-8 w-8 text-green-500" />}
                className="bg-green-50"
              />
              
              <DashboardCard
                title="Pending"
                subtitle="Delivery"
                value="56"
                icon={<Truck className="h-8 w-8 text-purple-500" />}
                className="bg-purple-50"
              />
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">INVENTORY ALERTS:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard
                title="Expiring"
                subtitle="Soon"
                value="32"
                icon={<Clock className="h-8 w-8 text-amber-500" />}
                className="bg-amber-50"
              />
              
              <DashboardCard
                title="Damaged"
                subtitle="Items"
                value="8"
                icon={<AlertCircle className="h-8 w-8 text-red-500" />}
                className="bg-red-50"
              />
              
              <DashboardCard
                title="Overstock"
                subtitle="Items"
                value="17"
                icon={<BarChart className="h-8 w-8 text-indigo-500" />}
                className="bg-indigo-50"
              />
              
              <DashboardCard
                title="Pending"
                subtitle="Return"
                value="12"
                icon={<Truck className="h-8 w-8 text-orange-500" />}
                className="bg-orange-50"
              />
            </div>
          </div>
        </div>
  
        <Tabs defaultValue="stockLevel" className="space-y-4">
          <TabsList>
            <TabsTrigger value="stockLevel">STOCK LEVELS</TabsTrigger>
            <TabsTrigger value="transactions">TRANSACTIONS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stockLevel" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DashboardCard
                title="Electronics"
                value="245"
                icon={<Package className="h-8 w-8 text-blue-500" />}
                className="bg-white shadow-sm"
              />
              
              <DashboardCard
                title="Furniture"
                value="189"
                icon={<Package className="h-8 w-8 text-green-500" />}
                className="bg-white shadow-sm"
              />
              
              <DashboardCard
                title="Office Supplies"
                value="367"
                icon={<Package className="h-8 w-8 text-purple-500" />}
                className="bg-white shadow-sm"
              />
              
              <DashboardCard
                title="Maintenance"
                value="213"
                icon={<Package className="h-8 w-8 text-amber-500" />}
                className="bg-white shadow-sm"
              />
              
              <DashboardCard
                title="Safety Equipment"
                value="98"
                icon={<Package className="h-8 w-8 text-red-500" />}
                className="bg-white shadow-sm"
              />
              
              <DashboardCard
                title="Misc"
                value="133"
                icon={<Package className="h-8 w-8 text-indigo-500" />}
                className="bg-white shadow-sm"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DashboardCard
                title="Received Today"
                value="12"
                icon={<Truck className="h-8 w-8 text-green-500" />}
                className="bg-white shadow-sm"
              />
              
              <DashboardCard
                title="Issued Today"
                value="28"
                icon={<ShoppingCart className="h-8 w-8 text-blue-500" />}
                className="bg-white shadow-sm"
              />
              
              <DashboardCard
                title="Pending Transfer"
                value="7"
                icon={<Truck className="h-8 w-8 text-amber-500" />}
                className="bg-white shadow-sm"
              />
              
              <DashboardCard
                title="Returns"
                value="4"
                icon={<Truck className="h-8 w-8 text-red-500" />}
                className="bg-white shadow-sm"
              />
              
              <DashboardCard
                title="Adjustments"
                value="9"
                icon={<BarChart className="h-8 w-8 text-purple-500" />}
                className="bg-white shadow-sm"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  export default InventoryContent;