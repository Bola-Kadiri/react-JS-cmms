import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import Header, { ActiveTab } from "@/components/dashboard/Header";
import { SidebarProvider } from "@/components/ui/sidebar";
import Dashboard from "@/pages/dashboard/index";

const preloadCommonPages = () => {
  // Silently preload the most-visited page chunks in the background
  // so the first sidebar click feels instant instead of waiting for the download
  setTimeout(() => {
    import('@/pages/work/workrequests/workrequestManagementPage').catch(() => {});
    import('@/pages/work/workorders/workorderManagementPage').catch(() => {});
    import('@/pages/work/work-order-completions/WorkOrderCompletionManagementPage').catch(() => {});
    import('@/pages/work/ppms/ppmManagementPage').catch(() => {});
    import('@/pages/facility/facilities/FacilityManagementPage').catch(() => {});
  }, 2000); // 2s delay so it doesn't compete with the initial dashboard render
};

const DashboardLayout = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>("WORK");
    const {pathname} = useLocation()

    useEffect(() => {
      preloadCommonPages();
    }, []);
  
    const renderTabContent = () => {
      // Render specific tab content if on the main /dashboard path, otherwise render nested routes via Outlet
      const isMainDashboard = pathname === "/dashboard";
      
      if (!isMainDashboard) {
        return <Outlet />;
      }
  
      // Render our new comprehensive Dashboard component for the main dashboard route
      return <Dashboard />;
    };
  
    // Check if we're on the main dashboard to conditionally render different headers
    const isMainDashboard = pathname === "/dashboard";
  
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gray-100">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Only pass tab props when not on main dashboard since Dashboard component handles its own navigation */}
          {!isMainDashboard ? (
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />
          ) : (
            <Header activeTab="WORK" setActiveTab={() => {}} />
          )}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;