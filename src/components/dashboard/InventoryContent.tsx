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
  import { useTypedTranslation } from '@/hooks/useTypedTranslation';

  const InventoryContent = () => {
    const { t } = useTypedTranslation('dashboard');
    return (
      <div className="space-y-6">
        {/* <h1 className="text-2xl font-bold tracking-tight">Inventory Dashboard</h1> */}

        <div className="grid gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">{t('headers.inventory.overview')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard
                title={t('cards.title.total')}
                subtitle={t('cards.subtitle.items')}
                value="1,245"
                icon={<Package className="h-8 w-8 text-blue-500" />}
                className="bg-blue-50"
              />

              <DashboardCard
                title={t('cards.title.low')}
                subtitle={t('cards.subtitle.stock')}
                value="28"
                icon={<AlertCircle className="h-8 w-8 text-red-500" />}
                className="bg-red-50"
              />

              <DashboardCard
                title={t('cards.title.itemsOn')}
                subtitle={t('cards.subtitle.order')}
                value="124"
                icon={<ShoppingCart className="h-8 w-8 text-green-500" />}
                className="bg-green-50"
              />

              <DashboardCard
                title={t('cards.title.pending')}
                subtitle={t('cards.subtitle.delivery')}
                value="56"
                icon={<Truck className="h-8 w-8 text-purple-500" />}
                className="bg-purple-50"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">{t('headers.inventory.alerts')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard
                title={t('cards.title.expiring')}
                subtitle={t('cards.subtitle.soon')}
                value="32"
                icon={<Clock className="h-8 w-8 text-amber-500" />}
                className="bg-amber-50"
              />

              <DashboardCard
                title={t('cards.title.damaged')}
                subtitle={t('cards.subtitle.items')}
                value="8"
                icon={<AlertCircle className="h-8 w-8 text-red-500" />}
                className="bg-red-50"
              />

              <DashboardCard
                title={t('cards.title.overstock')}
                subtitle={t('cards.subtitle.items')}
                value="17"
                icon={<BarChart className="h-8 w-8 text-indigo-500" />}
                className="bg-indigo-50"
              />

              <DashboardCard
                title={t('cards.title.pending')}
                subtitle={t('cards.subtitle.return')}
                value="12"
                icon={<Truck className="h-8 w-8 text-orange-500" />}
                className="bg-orange-50"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="stockLevel" className="space-y-4">
          <TabsList>
            <TabsTrigger value="stockLevel">{t('tabs.stockLevel')}</TabsTrigger>
            <TabsTrigger value="transactions">{t('tabs.transactions')}</TabsTrigger>
          </TabsList>

          <TabsContent value="stockLevel" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DashboardCard
                title={t('cards.title.electronics')}
                value="245"
                icon={<Package className="h-8 w-8 text-blue-500" />}
                className="bg-white shadow-sm"
              />

              <DashboardCard
                title={t('cards.title.furniture')}
                value="189"
                icon={<Package className="h-8 w-8 text-green-500" />}
                className="bg-white shadow-sm"
              />

              <DashboardCard
                title={t('cards.title.officeSupplies')}
                value="367"
                icon={<Package className="h-8 w-8 text-purple-500" />}
                className="bg-white shadow-sm"
              />

              <DashboardCard
                title={t('cards.title.maintenance')}
                value="213"
                icon={<Package className="h-8 w-8 text-amber-500" />}
                className="bg-white shadow-sm"
              />

              <DashboardCard
                title={t('cards.title.safetyEquipment')}
                value="98"
                icon={<Package className="h-8 w-8 text-red-500" />}
                className="bg-white shadow-sm"
              />

              <DashboardCard
                title={t('cards.title.misc')}
                value="133"
                icon={<Package className="h-8 w-8 text-indigo-500" />}
                className="bg-white shadow-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DashboardCard
                title={t('cards.title.receivedToday')}
                value="12"
                icon={<Truck className="h-8 w-8 text-green-500" />}
                className="bg-white shadow-sm"
              />

              <DashboardCard
                title={t('cards.title.issuedToday')}
                value="28"
                icon={<ShoppingCart className="h-8 w-8 text-blue-500" />}
                className="bg-white shadow-sm"
              />

              <DashboardCard
                title={t('cards.title.pendingTransfer')}
                value="7"
                icon={<Truck className="h-8 w-8 text-amber-500" />}
                className="bg-white shadow-sm"
              />

              <DashboardCard
                title={t('cards.title.returns')}
                value="4"
                icon={<Truck className="h-8 w-8 text-red-500" />}
                className="bg-white shadow-sm"
              />

              <DashboardCard
                title={t('cards.title.adjustments')}
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
