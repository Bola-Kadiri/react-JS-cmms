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
  import { useTypedTranslation } from '@/hooks/useTypedTranslation';

  const ProcurementContent = () => {
    const { t } = useTypedTranslation('dashboard');
    return (
      <div className="space-y-6">
        {/* <h1 className="text-2xl font-bold tracking-tight">Procurement Dashboard</h1> */}

        <div className="grid gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">{t('headers.procurement.overview')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard
                title={t('cards.title.purchase')}
                subtitle={t('cards.subtitle.requests')}
                value="56"
                icon={<ShoppingCart className="h-8 w-8 text-blue-500" />}
                className="bg-blue-50"
              />

              <DashboardCard
                title={t('cards.title.purchase')}
                subtitle={t('cards.subtitle.orders')}
                value="42"
                icon={<FileText className="h-8 w-8 text-green-500" />}
                className="bg-green-50"
              />

              <DashboardCard
                title={t('cards.title.pending')}
                subtitle={t('cards.subtitle.approval')}
                value="18"
                icon={<Clock className="h-8 w-8 text-amber-500" />}
                className="bg-amber-50"
              />

              <DashboardCard
                title={t('cards.title.monthly')}
                subtitle={t('cards.subtitle.spending')}
                value="$45.2K"
                icon={<DollarSign className="h-8 w-8 text-purple-500" />}
                className="bg-purple-50"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">{t('headers.procurement.alerts')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard
                title={t('cards.title.over')}
                subtitle={t('cards.subtitle.budget')}
                value="7"
                icon={<AlertCircle className="h-8 w-8 text-red-500" />}
                className="bg-red-50"
              />

              <DashboardCard
                title={t('cards.title.urgent')}
                subtitle={t('cards.subtitle.requests')}
                value="9"
                icon={<AlertCircle className="h-8 w-8 text-red-500" />}
                className="bg-red-50"
              />

              <DashboardCard
                title={t('cards.title.delayed')}
                subtitle={t('cards.subtitle.deliveries')}
                value="12"
                icon={<Clock className="h-8 w-8 text-amber-500" />}
                className="bg-amber-50"
              />

              <DashboardCard
                title={t('cards.title.contract')}
                subtitle={t('cards.subtitle.renewals')}
                value="5"
                icon={<FileText className="h-8 w-8 text-blue-500" />}
                className="bg-blue-50"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="purchaseRequests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="purchaseRequests">{t('tabs.purchaseRequests')}</TabsTrigger>
            <TabsTrigger value="purchaseOrders">{t('tabs.purchaseOrders')}</TabsTrigger>
          </TabsList>

          <TabsContent value="purchaseRequests" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DashboardCard
                title={t('cards.title.new')}
                value="23"
                icon={<FileText className="h-8 w-8 text-blue-500" />}
                className="bg-white shadow-sm"
              />

              <DashboardCard
                title={t('cards.title.inReview')}
                value="15"
                icon={<Clock className="h-8 w-8 text-amber-500" />}
                className="bg-white shadow-sm"
              />

              <DashboardCard
                title={t('cards.title.approved')}
                value="12"
                icon={<CheckCircle className="h-8 w-8 text-green-500" />}
                className="bg-white shadow-sm"
              />

              <DashboardCard
                title={t('cards.title.rejected')}
                value="6"
                icon={<AlertCircle className="h-8 w-8 text-red-500" />}
                className="bg-white shadow-sm"
              />

              <DashboardCard
                title={t('cards.title.convertingToPO')}
                value="8"
                icon={<FileText className="h-8 w-8 text-purple-500" />}
                className="bg-white shadow-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="purchaseOrders" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DashboardCard
                title={t('cards.title.draft')}
                value="14"
                icon={<FileText className="h-8 w-8 text-gray-500" />}
                className="bg-white shadow-sm"
              />

              <DashboardCard
                title={t('cards.title.sent')}
                value="18"
                icon={<CheckCircle className="h-8 w-8 text-green-500" />}
                className="bg-white shadow-sm"
              />

              <DashboardCard
                title={t('cards.title.received.partially')}
                value="7"
                icon={<ShoppingCart className="h-8 w-8 text-amber-500" />}
                className="bg-white shadow-sm"
              />

              <DashboardCard
                title={t('cards.title.received.fully')}
                value="10"
                icon={<CheckCircle className="h-8 w-8 text-blue-500" />}
                className="bg-white shadow-sm"
              />

              <DashboardCard
                title={t('cards.title.cancelled')}
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
