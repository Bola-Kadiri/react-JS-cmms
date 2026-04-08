import { 
  Mail, 
  Clock, 
  AlertCircle, 
  FilePlus,
  FolderOpen,
  DollarSign,
  Wallet,
  Play,
  CheckCircle,
  FileText,
  UserCheck,
  CreditCard,
  Banknote,
  ClipboardList,
  ShoppingCart,
  Wrench
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { useDashboardQuery } from "@/hooks/dashboard/useDashboardQueries";
import { Skeleton } from "@/components/ui/skeleton";

// Icon mapping for different data types
const getIconForLabel = (label: string, section: string) => {
  const iconProps = "h-8 w-8";
  
  switch (section) {
    case 'escalated_to_me':
      switch (label.toLowerCase()) {
        case 'work request':
          return <FileText className={`${iconProps} text-blue-500`} />;
        case 'work order':
          return <ShoppingCart className={`${iconProps} text-green-500`} />;
        case 'payment request':
          return <Wallet className={`${iconProps} text-purple-500`} />;
        default:
          return <Mail className={`${iconProps} text-blue-500`} />;
      }
    
    case 'ppm_due':
      switch (label.toLowerCase()) {
        case 'almost due':
          return <Clock className={`${iconProps} text-amber-500`} />;
        case 'over due':
          return <AlertCircle className={`${iconProps} text-red-500`} />;
        case 'due today':
          return <Clock className={`${iconProps} text-orange-500`} />;
        default:
          return <Clock className={`${iconProps} text-amber-500`} />;
      }
    
    case 'work_request':
      switch (label.toLowerCase()) {
        case 'new':
          return <FilePlus className={`${iconProps} text-green-500`} />;
        case 'open':
          return <FolderOpen className={`${iconProps} text-blue-500`} />;
        case 'quotation':
          return <Wallet className={`${iconProps} text-purple-500`} />;
        case 'awaiting':
          return <Clock className={`${iconProps} text-amber-500`} />;
        default:
          return <FileText className={`${iconProps} text-gray-500`} />;
      }
    
    case 'work_order':
      switch (label.toLowerCase()) {
        case 'new':
          return <FilePlus className={`${iconProps} text-green-500`} />;
        case 'open':
          return <FolderOpen className={`${iconProps} text-blue-500`} />;
        case 'started':
          return <Play className={`${iconProps} text-green-600`} />;
        case 'over-due':
          return <AlertCircle className={`${iconProps} text-red-500`} />;
        case 'awaiting':
          return <Clock className={`${iconProps} text-amber-500`} />;
        case 'pending':
          return <ClipboardList className={`${iconProps} text-orange-500`} />;
        default:
          return <ShoppingCart className={`${iconProps} text-gray-500`} />;
      }
    
    case 'payment_requisition':
      switch (label.toLowerCase()) {
        case 'new payment':
          return <FilePlus className={`${iconProps} text-green-500`} />;
        case 'awaiting approval':
          return <UserCheck className={`${iconProps} text-amber-500`} />;
        case 'payment pending':
          return <Clock className={`${iconProps} text-orange-500`} />;
        case 'part paid':
          return <CreditCard className={`${iconProps} text-blue-500`} />;
        default:
          return <Banknote className={`${iconProps} text-purple-500`} />;
      }
    
    default:
      return <Mail className={`${iconProps} text-gray-500`} />;
  }
};

// Get background color for cards based on section and label
const getCardClassName = (label: string, section: string) => {
  switch (section) {
    case 'escalated_to_me':
      switch (label.toLowerCase()) {
        case 'work request':
          return "bg-blue-50";
        case 'work order':
          return "bg-green-50";
        case 'payment request':
          return "bg-purple-50";
        default:
          return "bg-blue-50";
      }
    
    case 'ppm_due':
      switch (label.toLowerCase()) {
        case 'almost due':
          return "bg-amber-50";
        case 'over due':
          return "bg-red-50";
        case 'due today':
          return "bg-orange-50";
        default:
          return "bg-amber-50";
      }
    
    default:
      return "bg-white shadow-sm";
  }
};

// Loading skeleton component
const DashboardCardSkeleton = () => (
  <div className="bg-white shadow-sm rounded-lg p-6">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <Skeleton className="h-6 w-24 mb-2" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="h-12 w-12 rounded-full" />
    </div>
  </div>
);

const WorkContent = () => {
  const { data, isLoading } = useDashboardQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">ESCALATED TO ME:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <DashboardCardSkeleton key={i} />
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">PPM DUE:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <DashboardCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

        <Tabs defaultValue="workRequest" className="space-y-4">
          <TabsList>
            <TabsTrigger value="workRequest">WORK REQUEST</TabsTrigger>
            <TabsTrigger value="workOrder">WORK ORDER</TabsTrigger>
            <TabsTrigger value="paymentRequisition">PAYMENT REQUISITION</TabsTrigger>
          </TabsList>
          
          <TabsContent value="workRequest" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(4)].map((_, i) => (
                <DashboardCardSkeleton key={i} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">ESCALATED TO ME:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.escalated_to_me?.map((item, index) => (
              <DashboardCard
                key={index}
                title={item.label}
                value={item.count.toString()}
                icon={getIconForLabel(item.label, 'escalated_to_me')}
                className={getCardClassName(item.label, 'escalated_to_me')}
              />
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">PPM DUE:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.ppm_due?.map((item, index) => (
              <DashboardCard
                key={index}
                title={item.label}
                value={item.count.toString()}
                icon={getIconForLabel(item.label, 'ppm_due')}
                className={getCardClassName(item.label, 'ppm_due')}
              />
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="workRequest" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workRequest">WORK REQUEST</TabsTrigger>
          <TabsTrigger value="workOrder">WORK ORDER</TabsTrigger>
          <TabsTrigger value="paymentRequisition">PAYMENT REQUISITION</TabsTrigger>
        </TabsList>
        
        <TabsContent value="workRequest" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.work_request?.map((item, index) => (
              <DashboardCard
                key={index}
                title={item.label}
                value={item.count.toString()}
                icon={getIconForLabel(item.label, 'work_request')}
                className={getCardClassName(item.label, 'work_request')}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="workOrder" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.work_order?.map((item, index) => (
              <DashboardCard
                key={index}
                title={item.label}
                value={item.count.toString()}
                icon={getIconForLabel(item.label, 'work_order')}
                className={getCardClassName(item.label, 'work_order')}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="paymentRequisition" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.payment_requisition?.map((item, index) => (
              <DashboardCard
                key={index}
                title={item.label}
                value={item.count.toString()}
                icon={getIconForLabel(item.label, 'payment_requisition')}
                className={getCardClassName(item.label, 'payment_requisition')}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkContent;