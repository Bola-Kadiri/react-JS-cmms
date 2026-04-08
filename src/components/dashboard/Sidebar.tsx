import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  Package,
  Database,
  FileText,
  ArrowRightLeft,
  History,
  BarChart2,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from "@/components/ui/sidebar";
import { useTypedTranslation } from "@/hooks/useTypedTranslation";

const Sidebar = () => {
  const location = useLocation();
  const { t } = useTypedTranslation('sidebar');
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    calendar: location.pathname.includes('/dashboard/calendar'),
    work: location.pathname.includes('/dashboard/work'),
    asset: location.pathname.includes('/dashboard/asset'),
    'inventory-reference': location.pathname.includes('/dashboard/asset/inventory-reference'),
    procurement: location.pathname.includes('/dashboard/procurement'),
    facility: location.pathname.includes('/dashboard/facility'),
    reports: location.pathname.includes('/dashboard/reports'),
    accounts: location.pathname.includes('/dashboard/accounts'),
  });

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const isActive = (path: string) => location.pathname === path;
  const isMenuActive = (path: string) => location.pathname.includes(path);

  return (
    <SidebarComponent className="bg-emerald-800 text-white border-r-0">
      <SidebarHeader className="pt-4 pb-2 mb-8">
        <Link to="/dashboard" className="flex items-center gap-2 px-2">
          <div className="flex items-center justify-center w-8 h-8 bg-white rounded-md">
            <span className="text-emerald-800 font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-bold">{t('appName')}</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="pb-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={isActive('/dashboard')} 
              tooltip={t('dashboard')}
              asChild
            >
              <Link to="/dashboard">
                <LayoutDashboard className="mr-2" />
                <span>{t('dashboard')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Facility Menu */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={isMenuActive('/dashboard/facility')}
              tooltip={t('facility.title')}
              onClick={() => toggleMenu('facility')}
            >
              <Briefcase className="mr-2" />
              <span>{t('facility.title')}</span>
              {openMenus.facility ? (
                <ChevronDown className="ml-auto h-4 w-4" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </SidebarMenuButton>
            
            {openMenus.facility && (
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/facility/regions')}
                    asChild
                  >
                    <Link to="/dashboard/facility/regions">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('facility.regions')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/facility/clusters')}
                    asChild
                  >
                    <Link to="/dashboard/facility/clusters">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('facility.clusters')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/facility/list')}
                    asChild
                  >
                    <Link to="/dashboard/facility/list">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('facility.list')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/facility/zones')}
                    asChild
                  >
                    <Link to="/dashboard/facility/zones">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('facility.zones')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/facility/buildings')}
                    asChild
                  >
                    <Link to="/dashboard/facility/buildings">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('facility.buildings')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/facility/subsystems')}
                    asChild
                  >
                    <Link to="/dashboard/facility/subsystems">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('facility.subsystems')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/asset/assets')}
                    asChild
                  >
                    <Link to="/dashboard/asset/assets">
                      <Database className="mr-2 h-4 w-4" />
                      <span>{t('asset.assetRegister')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                {/* <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/facility/landlords')}
                    asChild
                  >
                    <Link to="/dashboard/facility/landlords">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('facility.landlords')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem> */}
                {/* <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/facility/apartment-type')}
                    asChild
                  >
                    <Link to="/dashboard/facility/apartment-type">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('facility.apartmentType')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem> */}
                {/* <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/facility/apartments')}
                    asChild
                  >
                    <Link to="/dashboard/facility/apartments">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('facility.apartments')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem> */}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>

          {/* Calendar Menu */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={isMenuActive('/dashboard/calendar')}
              tooltip={t('calendar.title')}
              onClick={() => toggleMenu('calendar')}
            >
              <Calendar className="mr-2" />
              <span>{t('calendar.title')}</span>
              {openMenus.calendar ? (
                <ChevronDown className="ml-auto h-4 w-4" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </SidebarMenuButton>
            
            {openMenus.calendar && (
              <SidebarMenuSub>
                {/* <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/calendar/ppm')}
                    asChild
                  >
                    <Link to="/dashboard/calendar/ppm">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>{t('calendar.ppmCalendar')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem> */}
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/calendar/events')}
                    asChild
                  >
                    <Link to="/dashboard/calendar/events">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>{t('calendar.eventCalendar')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/calendar/ppms')}
                    asChild
                  >
                    <Link to="/dashboard/calendar/ppms">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('calendar.ppm')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                {/* <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/work/ppm-items')}
                    asChild
                  >
                    <Link to="/dashboard/work/ppm-items">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>PPM Items</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem> */}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>

          {/* Work Menu */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={isMenuActive('/dashboard/work')}
              tooltip={t('work.title')}
              onClick={() => toggleMenu('work')}
            >
              <Briefcase className="mr-2" />
              <span>{t('work.title')}</span>
              {openMenus.work ? (
                <ChevronDown className="ml-auto h-4 w-4" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </SidebarMenuButton>
            
            {openMenus.work && (
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/work/requests')}
                    asChild
                  >
                    <Link to="/dashboard/work/requests">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('work.requests')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/work/orders')}
                    asChild
                  >
                    <Link to="/dashboard/work/orders">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('work.orders')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/work/work-order-completions')}
                    asChild
                  >
                    <Link to="/dashboard/work/work-order-completions">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('work.workOrderCompletions')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/work/invoice-items')}
                    asChild
                  >
                    <Link to="/dashboard/work/invoice-items">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('work.invoiceItems')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                {/* <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/work/payment-comments')}
                    asChild
                  >
                    <Link to="/dashboard/work/payment-comments">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('work.paymentComments')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem> */}
                {/* <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/work/payment-items')}
                    asChild
                  >
                    <Link to="/dashboard/work/payment-items">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('work.paymentItems')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem> */}
                {/* <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/work/payment-requisitions')}
                    asChild
                  >
                    <Link to="/dashboard/work/payment-requisitions">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('work.paymentRequisitions')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem> */}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>

          {/* Asset Menu */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={isMenuActive('/dashboard/asset')}
              tooltip={t('asset.title')}
              onClick={() => toggleMenu('asset')}
            >
              <Package className="mr-2" />
              <span>{t('asset.title')}</span>
              {openMenus.asset ? (
                <ChevronDown className="ml-auto h-4 w-4" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </SidebarMenuButton>
            
            {openMenus.asset && (
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/asset/warehouses')}
                    asChild
                  >
                    <Link to="/dashboard/asset/warehouses">
                      <Database className="mr-2 h-4 w-4" />
                      <span>{t('asset.warehouses')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/asset/stores')}
                    asChild
                  >
                    <Link to="/dashboard/asset/stores">
                      <Package className="mr-2 h-4 w-4" />
                      <span>{t('facility.stores')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/asset/inventories')}
                    asChild
                  >
                    <Link to="/dashboard/asset/inventories">
                      <Package className="mr-2 h-4 w-4" />
                      <span>{t('asset.inventoryRegister')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/asset/items')}
                    asChild
                  >
                    <Link to="/dashboard/asset/items">
                      <Package className="mr-2 h-4 w-4" />
                      <span>{t('asset.items')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/asset/item-requests')}
                    asChild
                  >
                    <Link to="/dashboard/asset/item-requests">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('asset.itemRequest')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/asset/transfers')}
                    asChild
                  >
                    <Link to="/dashboard/asset/transfers">
                      <ArrowRightLeft className="mr-2 h-4 w-4" />
                      <span>{t('asset.transferForm')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/asset/movement')}
                    asChild
                  >
                    <Link to="/dashboard/asset/movement">
                      <History className="mr-2 h-4 w-4" />
                      <span>{t('asset.movementHistory')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isMenuActive('/dashboard/asset/inventory-reference')}
                    tooltip="Inventory Reference"
                    onClick={() => toggleMenu('inventory-reference')}
                  >
                    <Database className="mr-2" />
                    <span>{t('asset.materialsReference.title')}</span>
                    {openMenus['inventory-reference'] ? (
                      <ChevronDown className="ml-auto h-4 w-4" />
                    ) : (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </SidebarMenuSubButton>
                  
                  {openMenus['inventory-reference'] && (
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          isActive={isActive('/dashboard/asset/inventory-reference/asset-categories')}
                          asChild
                        >
                          <Link to="/dashboard/asset/inventory-reference/asset-categories">
                            <FileText className="mr-2 h-4 w-4" />
                            <span>{t('asset.materialsReference.assetCategory')}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          isActive={isActive('/dashboard/asset/inventory-reference/asset-subcategories')}
                          asChild
                        >
                          <Link to="/dashboard/asset/inventory-reference/asset-subcategories">
                            <FileText className="mr-2 h-4 w-4" />
                            <span>{t('asset.materialsReference.assetSubcategory')}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          isActive={isActive('/dashboard/asset/inventory-reference/inventory-types')}
                          asChild
                        >
                          <Link to="/dashboard/asset/inventory-reference/inventory-types">
                            <Package className="mr-2 h-4 w-4" />
                            <span>{t('asset.materialsReference.inventoryType')}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          isActive={isActive('/dashboard/asset/inventory-reference/models')}
                          asChild
                        >
                          <Link to="/dashboard/asset/inventory-reference/models">
                            <Package className="mr-2 h-4 w-4" />
                            <span>{t('asset.materialsReference.model')}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          isActive={isActive('/dashboard/asset/inventory-reference/manufacturers')}
                          asChild
                        >
                          <Link to="/dashboard/asset/inventory-reference/manufacturers">
                            <FileText className="mr-2 h-4 w-4" />
                            <span>{t('asset.materialsReference.manufacturer')}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          isActive={isActive('/dashboard/asset/inventory-reference/inventory-references')}
                          asChild
                        >
                          <Link to="/dashboard/asset/inventory-reference/inventory-references">
                            <Database className="mr-2 h-4 w-4" />
                            <span>{t('asset.materialsReference.inventoryReference')}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  )}
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>

          {/* Procurement Menu */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={isMenuActive('/dashboard/procurement')}
              tooltip={t('procurement.title')}
              onClick={() => toggleMenu('procurement')}
            >
              <Package className="mr-2" />
              <span>{t('procurement.title')}</span>
              {openMenus.procurement ? (
                <ChevronDown className="ml-auto h-4 w-4" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </SidebarMenuButton>
            
            {openMenus.procurement && (
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/procurement/purchase-order')}
                    asChild
                  >
                    <Link to="/dashboard/procurement/purchase-order">
                    <FileText className="mr-2 h-4 w-4" />
                      <span>{t('procurement.purchaseOrders')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/procurement/po-requisition')}
                    asChild
                  >
                    <Link to="/dashboard/procurement/po-requisition">
                    <FileText className="mr-2 h-4 w-4" />
                      <span>{t('procurement.poRequisition')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/procurement/request-quotation')}
                    asChild
                  >
                    <Link to="/dashboard/procurement/request-quotation">
                    <FileText className="mr-2 h-4 w-4" />
                      <span>{t('procurement.requestQuotation')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/procurement/goods-received-note')}
                    asChild
                  >
                    <Link to="/dashboard/procurement/goods-received-note">
                    <FileText className="mr-2 h-4 w-4" />
                      <span>{t('procurement.goodsReceivedNote')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/procurement/vendor-contracts')}
                    asChild
                  >
                    <Link to="/dashboard/procurement/vendor-contracts">
                    <FileText className="mr-2 h-4 w-4" />
                      <span>{t('procurement.vendorContracts')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>

          {/* Reports Menu */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={isMenuActive('/dashboard/reports')}
              tooltip={t('reports.title')}
              onClick={() => toggleMenu('reports')}
            >
              <BarChart2 className="mr-2" />
              <span>{t('reports.title')}</span>
              {openMenus.reports ? (
                <ChevronDown className="ml-auto h-4 w-4" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </SidebarMenuButton>
            
            {openMenus.reports && (
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/reports/schedule')}
                    asChild
                  >
                    <Link to="/dashboard/reports/schedule">
                    <Users className="mr-2 h-4 w-4" />
                      <span>{t('reports.scheduled')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/reports/user-facility')}
                    asChild
                  >
                    <Link to="/dashboard/reports/user-facility">
                      <Database className="mr-2 h-4 w-4" />
                      <span>{t('reports.userFacility')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/reports/user-audit')}
                    asChild
                  >
                    <Link to="/dashboard/reports/user-audit">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('reports.userAudit')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/reports/usage')}
                    asChild
                  >
                    <Link to="/dashboard/reports/usage">
                      <ArrowRightLeft className="mr-2 h-4 w-4" />
                      <span>{t('reports.usage')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>

          {/* Reference/Accounts Menu */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={isMenuActive('/dashboard/accounts')}
              tooltip={t('reference.title')}
              onClick={() => toggleMenu('accounts')}
            >
              <BookOpen className="mr-2" />
              <span>{t('reference.title')}</span>
              {openMenus.accounts ? (
                <ChevronDown className="ml-auto h-4 w-4" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </SidebarMenuButton>
            
            {openMenus.accounts && (
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/accounts/users')}
                    asChild
                  >
                    <Link to="/dashboard/accounts/users">
                    <Users className="mr-2 h-4 w-4" />
                      <span>{t('reference.userManagement')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/accounts/personnels')}
                    asChild
                  >
                    <Link to="/dashboard/accounts/personnels">
                      <Database className="mr-2 h-4 w-4" />
                      <span>{t('reference.personnel')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/accounts/vendors')}
                    asChild
                  >
                    <Link to="/dashboard/accounts/vendors">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('reference.vendor')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/accounts/client')}
                    asChild
                  >
                    <Link to="/dashboard/accounts/client">
                      <ArrowRightLeft className="mr-2 h-4 w-4" />
                      <span>{t('reference.client')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/accounts/categories')}
                    asChild
                  >
                    <Link to="/dashboard/accounts/categories">
                      <History className="mr-2 h-4 w-4" />
                      <span>{t('reference.category')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/accounts/subcategories')}
                    asChild
                  >
                    <Link to="/dashboard/accounts/subcategories">
                      <History className="mr-2 h-4 w-4" />
                      <span>{t('reference.subcategory')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/accounts/departments')}
                    asChild
                  >
                    <Link to="/dashboard/accounts/departments">
                      <History className="mr-2 h-4 w-4" />
                      <span>{t('reference.department')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/accounts/bank-accounts')}
                    asChild
                  >
                    <Link to="/dashboard/accounts/bank-accounts">
                      <History className="mr-2 h-4 w-4" />
                      <span>{t('reference.bankAccount')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton 
                    isActive={isActive('/dashboard/accounts/unit-measurements')}
                    asChild
                  >
                    <Link to="/dashboard/accounts/unit-measurements">
                      <History className="mr-2 h-4 w-4" />
                      <span>{t('reference.unitOfMeasurement')}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </SidebarComponent>
  );
};

export default Sidebar;