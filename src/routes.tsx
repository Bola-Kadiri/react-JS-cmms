import { createBrowserRouter, RouteObject, Navigate } from "react-router-dom";
import { lazy, Suspense } from 'react';
// import DashboardLayout from "@/layouts/DashboardLayout";
// import Dashboard from "@/pages/dashboard";
// import WorkCalendar from "@/pages/work/calendar";
// import WorkRequests from "@/pages/work/requests";
// import WorkOrders from "@/pages/work/orders";
// import AssetRegister from "@/pages/asset/register";
// import InventoryRegister from "@/pages/asset/inventory-register";
// import ItemRequest from "@/pages/asset/item-request";
// import TransferForm from "@/pages/asset/transfer-form";
import MovementHistory from "@/pages/asset/movement-history";
import Reports from "@/pages/reports";
import Reference from "@/pages/reference";
import NotFound from "@/pages/NotFound";
import WorkCalendar from "@/pages/work-calendar";
// import UserManagement from "@/pages/reference/user-management";
// import UserForm from "@/pages/reference/user-management/UserForm";
import Login from "./pages/auth/Login";
import AlphaCMMSLanding from "./pages/AlphaCMMSLanding";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
// import ApartmentTypeManagementPage from "./pages/facility/apartment-types/ApartmentTypeManagementPage";
// import StoreManagementPage from "./pages/facility/stores/StoreManagementPage";
// import FacilityManagementPage from "./pages/facility/facilities/FacilityManagementPage";
// import ApartmentManagementPage from "./pages/facility/apartments/ApartmentManagementPage";
// import WarehouseManagementPage from "./pages/asset/warehouses/WarehouseManagementPage";
// import BankAccountManagementPage from "./pages/reference/bank-accounts/BankAccountManagementPage";
// import UnitMeasurementManagementPage from "./pages/reference/unit-measurement/UnitMeasurementManagementPage";
// import VendorManagementPage from "./pages/reference/vendors/VendorManagementPage";
// import DepartmentManagementPage from "./pages/reference/departments/DepartmentManagementPage";
// import ClientManagementPage from "./pages/reference/clients/ClientManagementPage";
// import ClientDetailView from "./features/clients/ClientDetailView";
// import ClientForm from "./features/clients/ClientForm";
// import WarehouseForm from "./features/asset/warehouses/WarehouseForm";
// import WarehouseDetailView from "./features/asset/warehouses/WarehouseDetailView";
// import BuildingManagementPage from "./pages/facility/buildings/BuildingManagementPage";
// import BuildingForm from "./features/facility/buildings/BuildingForm";
// import BuildingDetailView from "./features/facility/buildings/BuidlingDetailView";
// import LandlordManagementPage from "./pages/facility/landlords/LandlordManagementPage";
// import LandlordForm from "./features/facility/landlords/LandlordForm";
// import LandlordDetailView from "./features/facility/landlords/LandlordDetailView";
// import ItemManagementPage from "./pages/asset/items/ItemManagementPage";
// import ItemForm from "./features/asset/items/ItemForm";
// import ItemDetailView from "./features/asset/items/ItemDetailView";
// import CategoryManagementPage from "./pages/reference/categories/CategoryManagementPage";
// import CategoryForm from "./features/reference/categories/CategoryForm";
// import CategoryDetailView from "./features/reference/categories/CategoryDetailView";

// Lazy loaded components for better performance
const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'))
const Dashboard = lazy(() => import('@/pages/dashboard'));
const WorkRequests = lazy(() => import('@/pages/work/requests'))
const WorkOrders = lazy(() => import('@/pages/work/orders'));
const AssetRegister = lazy(() => import('@/pages/asset/register'));
const InventoryRegister = lazy(() => import('@/pages/asset/inventory-register'));
const ItemRequest = lazy(() => import('@/pages/asset/item-request'));
const ApartmentTypeManagementPage = lazy(() => import('@/pages/facility/apartment-types/ApartmentTypeManagementPage'))
// const FacilityManagementPage = lazy(() => import('@/pages/facility/facilities/FacilityManagementPage'))
const ApartmentForm = lazy(() => import('@/features/facility/apartments/ApartmentForm'))
const ApartmentDetailView = lazy(() => import('@/features/facility/apartments/ApartmentDetailView'))
const ApartmentManagementPage = lazy(() => import('@/pages/facility/apartments/ApartmentManagementPage'))
const UnitMeasurementManagementPage = lazy(() => import('@/pages/reference/unit-measurement/UnitMeasurementManagementPage'))
const ClientManagementPage = lazy(() => import('@/pages/reference/clients/ClientManagementPage'))
const ClientDetailView = lazy(() => import('@/features/reference/clients/ClientDetailView'))
const ClientForm = lazy(() => import('@/features/reference/clients/ClientForm'))
const WarehouseManagementPage = lazy(() => import('@/pages/asset/warehouses/WarehouseManagementPage'))
const WarehouseForm = lazy(() => import('@/features/asset/warehouses/WarehouseForm'))
const WarehouseDetailView = lazy(() => import('@/features/asset/warehouses/WarehouseDetailView'))
const BuildingForm = lazy(() => import('@/features/facility/buildings/BuildingForm'))
const BuildingDetailView = lazy(() => import('@/features/facility/buildings/BuidlingDetailView'))
const BuildingManagementPage = lazy(() => import('@/pages/facility/buildings/BuildingManagementPage'))
const LandlordForm = lazy(() => import('@/features/facility/landlords/LandlordForm'))
const LandlordDetailView = lazy(() => import('@/features/facility/landlords/LandlordDetailView'))
const LandlordManagementPage = lazy(() => import('@/pages/facility/landlords/LandlordManagementPage'))
const ItemForm = lazy(() => import('@/features/asset/items/ItemForm'))
const ItemDetailView = lazy(() => import('@/features/asset/items/ItemDetailView'))
const ItemManagementPage = lazy(() => import('@/pages/asset/items/ItemManagementPage'))
const CategoryForm = lazy(() => import('@/features/reference/categories/CategoryForm'))
const CategoryDetailView = lazy(() => import('@/features/reference/categories/CategoryDetailView'))
const CategoryManagementPage = lazy(() => import('@/pages/reference/categories/CategoryManagementPage'))
const SubcategoryForm = lazy(() => import('@/features/reference/subcategories/SubcategoryForm'))
const SubcategoryDetailView = lazy(() => import('@/features/reference/subcategories/SubcategoryDetailView'))
const SubcategoryManagementPage = lazy(() => import('@/pages/reference/subcategories/SubcategoryManagementPage'))
const AssetForm = lazy(() => import('@/features/asset/asset/AssetForm'))
const AssetDetailView = lazy(() => import('@/features/asset/asset/AssetDetailView'))
const AssetManagementPage = lazy(() => import('@/pages/asset/assets/AssetManagementPage'))
const InventoryForm = lazy(() => import('@/features/asset/inventory/InventoryForm'))
const InventoryDetailView = lazy(() => import('@/features/asset/inventory/InventoryDetailView'))
const InventoryManagementPage = lazy(() => import('@/pages/asset/inventories/InventoryManagementPage'))
const TransferForm = lazy(() => import('@/features/asset/transfer/TransferForm'))
const TransferDetailView = lazy(() => import('@/features/asset/transfer/TransferDetailView'))
const TransferManagementPage = lazy(() => import('@/pages/asset/transfers/TransferManagementPage'))
const PaymentcommentForm = lazy(() => import('@/features/work/paymentcomments/PaymentcommentForm'))
const PaymentcommentDetailView = lazy(() => import('@/features/work/paymentcomments/PaymentcommentDetailView'))
const PaymentcommentManagementPage = lazy(() => import('@/pages/work/paymentcomments/paymentcommentManagementPage'))
const PaymentitemForm = lazy(() => import('@/features/work/paymentitems/PaymentitemForm'))
const PaymentitemDetailView = lazy(() => import('@/features/work/paymentitems/PaymentitemDetailView'))
const PaymentitemManagementPage = lazy(() => import('@/pages/work/paymentitems/paymentitemManagementPage'))
const PaymentrequisitionForm = lazy(() => import('@/features/work/paymentrequisitions/PaymentrequisitionForm'))
const PaymentrequisitionDetailView = lazy(() => import('@/features/work/paymentrequisitions/PaymentrequisitionDetailView'))
const PaymentrequisitionManagementPage = lazy(() => import('@/pages/work/paymentrequisitions/paymentrequisitionManagementPage'))
const PpmForm = lazy(() => import('@/features/work/ppms/PpmForm'))
const PpmDetailView = lazy(() => import('@/features/work/ppms/PpmDetailView'))
const PpmManagementPage = lazy(() => import('@/pages/work/ppms/ppmManagementPage'))
const WorkorderForm = lazy(() => import('@/features/work/workorders/WorkorderForm'))
const WorkorderDetailView = lazy(() => import('@/features/work/workorders/WorkorderDetailView'))
const WorkorderManagementPage = lazy(() => import('@/pages/work/workorders/workorderManagementPage'))
const WorkrequestForm = lazy(() => import('@/features/work/workrequests/WorkrequestForm'))
const WorkrequestDetailView = lazy(() => import('@/features/work/workrequests/WorkrequestDetailView'))
const WorkrequestManagementPage = lazy(() => import('@/pages/work/workrequests/workrequestManagementPage'))
const WorkordercompletionForm = lazy(() => import('@/features/work/work-order-completions/WorkordercompletionForm'))
const WorkordercompletionDetailView = lazy(() => import('@/features/work/work-order-completions/WorkordercompletionDetailView'))
const WorkordercompletionManagementPage = lazy(() => import('@/pages/work/work-order-completions/WorkOrderCompletionManagementPage'))
const InvoiceitemForm = lazy(() => import('@/features/work/invoiceitems/InvoiceitemForm'))
const InvoiceitemDetailView = lazy(() => import('@/features/work/invoiceitems/InvoiceitemDetailView'))
const InvoiceitemManagementPage = lazy(() => import('@/pages/work/invoiceitems/InvoiceitemManagementPage'))
const PpmitemForm = lazy(() => import('@/features/work/ppmitems/PpmitemForm'))
const PpmitemDetailView = lazy(() => import('@/features/work/ppmitems/PpmitemDetailView'))
const PpmitemManagementPage = lazy(() => import('@/pages/work/ppmitems/ppmitemManagementPage'))
const UserForm = lazy(() => import('@/features/reference/users/UserForm'))
const UserDetailView = lazy(() => import('@/features/reference/users/UserDetailView'))
const UserManagementPage = lazy(() => import('@/pages/reference/users/userManagementPage'))
const PersonnelForm = lazy(() => import('@/features/reference/personnels/PersonnelForm'))
const PersonnelDetailView = lazy(() => import('@/features/reference/personnels/PersonnelDetailView'))
const PersonnelManagementPage = lazy(() => import('@/pages/reference/personnels/personnelManagementPage'))
const VendorForm = lazy(() => import('@/features/reference/vendors/VendorForm'))
const VendorDetailView = lazy(() => import('@/features/reference/vendors/VendorDetailView'))
const VendorManagementPage = lazy(() => import('@/pages/reference/vendors/VendorManagementPage'))
const DepartmentForm = lazy(() => import('@/features/reference/departments/DepartmentForm'))
const DepartmentDetailView = lazy(() => import('@/features/reference/departments/DepartmentDetailView'))
const DepartmentManagementPage = lazy(() => import('@/pages/reference/departments/DepartmentManagementPage'))
const BankaccountForm = lazy(() => import('@/features/reference/bankaccounts/BankaccountForm'))
const BankaccountDetailView = lazy(() => import('@/features/reference/bankaccounts/BankaccountDetailView'))
const BankaccountManagementPage = lazy(() => import('@/pages/reference/bankaccounts/bankaccountManagementPage'))
const UnitmeasurementForm = lazy(() => import('@/features/reference/unitmeasurements/UnitmeasurementForm'))
const UnitmeasurementDetailView = lazy(() => import('@/features/reference/unitmeasurements/UnitmeasurementDetailView'))
const UnitmeasurementManagementPage = lazy(() => import('@/pages/reference/unitmeasurements/unitmeasurementManagementPage'))
const StoreForm = lazy(() => import('@/features/asset/stores/StoreForm'))
const StoreDetailView = lazy(() => import('@/features/asset/stores/StoreDetailView'))
const StoreManagementPage = lazy(() => import('@/pages/asset/stores/StoreManagementPage'))
const ApartmenttypeForm = lazy(() => import('@/features/facility/apartmenttypes/ApartmenttypeForm'))
const ApartmenttypeDetailView = lazy(() => import('@/features/facility/apartmenttypes/ApartmenttypeDetailView'))
const ApartmenttypeManagementPage = lazy(() => import('@/pages/facility/apartment-types/ApartmentTypeManagementPage'))
const FacilityForm = lazy(() => import('@/features/facility/facilities/FacilityForm'))
const FacilityDetailView = lazy(() => import('@/features/facility/facilities/FacilityDetailView'))
const FacilityManagementPage = lazy(() => import('@/pages/facility/facilities/FacilityManagementPage'))
const PurchaseorderForm = lazy(() => import('@/features/procurement/purchaseorders/PurchaseorderForm'))
const PurchaseorderDetailView = lazy(() => import('@/features/procurement/purchaseorders/PurchaseorderDetailView'))
const PurchaseorderManagementPage = lazy(() => import('@/pages/procurement/purchaseorders/PurchaseorderManagementPage'))
const PorequisitionForm = lazy(() => import('@/features/procurement/porequisitions/PorequisitionForm'))
const PorequisitionDetailView = lazy(() => import('@/features/procurement/porequisitions/PorequisitionDetailView'))
const PorequisitionManagementPage = lazy(() => import('@/pages/procurement/porequisitions/PoRequisitionManagementPage'))
const RequestquotationForm = lazy(() => import('@/features/procurement/requestquotations/RequestquotationForm'))
const RequestquotationDetailView = lazy(() => import('@/features/procurement/requestquotations/RequestquotationDetailView'))
const RequestquotationManagementPage = lazy(() => import('@/pages/procurement/requestquotations/RequestquotationManagementPage'))
const GoodsreceivednoteForm = lazy(() => import('@/features/procurement/goodsreceivednotes/GoodsreceivednoteForm'))
const GoodsreceivednoteDetailView = lazy(() => import('@/features/procurement/goodsreceivednotes/GoodsreceivednoteDetailView'))
const GoodsreceivednoteManagementPage = lazy(() => import('@/pages/procurement/goodsreceivednotes/GoodsreceivednoteManagementPage'))
const VendorcontractForm = lazy(() => import('@/features/procurement/vendorcontracts/VendorcontractForm'))
const VendorcontractDetailView = lazy(() => import('@/features/procurement/vendorcontracts/VendorcontractDetailView'))
const VendorcontractManagementPage = lazy(() => import('@/pages/procurement/vendorcontracts/VendorcontractManagementPage'))
const PPMCalendarPage = lazy(() => import('@/pages/calendar/PPMCalendarPage'))
const PPMCalendarDetailView = lazy(() => import('@/features/calendar/PPMCalendarDetailView'))
const PPMEventCalendar = lazy(() => import('@/pages/calendar/CalendarEventPage'))
const RegionForm = lazy(() => import('@/features/facility/regions/RegionForm'))
const RegionDetailView = lazy(() => import('@/features/facility/regions/RegionDetailView'))
const RegionManagementPage = lazy(() => import('@/pages/facility/regions/RegionManagementPage'))
const ClusterForm = lazy(() => import('@/features/facility/clusters/ClusterForm'))
const ClusterDetailView = lazy(() => import('@/features/facility/clusters/ClusterDetailView'))
const ClusterManagementPage = lazy(() => import('@/pages/facility/clusters/ClusterManagementPage'))
const SubsystemForm = lazy(() => import('@/features/facility/subsystems/SubsystemForm'))
const SubsystemDetailView = lazy(() => import('@/features/facility/subsystems/SubsystemDetailView'))
const SubsystemManagementPage = lazy(() => import('@/pages/facility/subsystems/SubsystemManagementPage'))
const ZoneForm = lazy(() => import('@/features/facility/zones/ZoneForm'))
const ZoneDetailView = lazy(() => import('@/features/facility/zones/ZoneDetailView'))
const ZoneManagementPage = lazy(() => import('@/pages/facility/zones/ZoneManagementPage'))
const AssetCategoryForm = lazy(() => import('@/features/asset/assetcategory/AssetCategoryForm'))
const AssetCategoryDetailView = lazy(() => import('@/features/asset/assetcategory/AssetCategoryDetailView'))
const AssetCategoryManagementPage = lazy(() => import('@/pages/asset/asset-categories/AssetCategoryManagementPage'))
const AssetSubcategoryForm = lazy(() => import('@/features/asset/assetsubcategory/AssetSubcategoryForm'))
const AssetSubcategoryDetailView = lazy(() => import('@/features/asset/assetsubcategory/AssetSubcategoryDetailView'))
const AssetSubcategoryManagementPage = lazy(() => import('@/pages/asset/asset-subcategories/AssetSubcategoryManagementPage'))
const InventoryTypeForm = lazy(() => import('@/features/asset/inventorytype/InventoryTypeForm'))
const InventoryTypeDetailView = lazy(() => import('@/features/asset/inventorytype/InventoryTypeDetailView'))
const InventoryTypeManagementPage = lazy(() => import('@/pages/asset/inventory-types/InventoryTypeManagementPage'))
const ManufacturerManagementPage = lazy(() => import('@/pages/asset/manufacturers/ManufacturerManagementPage'))
const ModelManagementPage = lazy(() => import('@/pages/asset/models/ModelManagementPage'))
const InventoryReferenceManagementPage = lazy(() => import('@/pages/asset/inventory-reference/InventoryReferenceManagementPage'))
const ItemRequestForm = lazy(() => import('@/features/asset/itemrequest/ItemRequestForm'))
const ItemRequestDetailView = lazy(() => import('@/features/asset/itemrequest/ItemRequestDetailView'))
const ItemRequestManagementPage = lazy(() => import('@/pages/asset/item-requests/ItemRequestManagementPage'))
const LandingPage = lazy(() => import('./pages/LandingPage')); // Import new LandingPage

// Loading component for Suspense fallback
const LoadingComponent = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
  </div>
);

// Auth routes - accessible when not logged in
const authRoutes: RouteObject[] = [
  {
    path: '/', // Landing page at root
    element: <LandingPage />
  },
  {
    path: '/landing',
    element: <LandingPage /> // Keep /landing for backward compatibility if needed
  },
  {
    path: '/login',
    element: <Login />
  },
  // { // commented out register and forgot-password
  //   path: '/register',
  //   element: (
  //     <Suspense fallback={<LoadingComponent />}>
  //       <Register />
  //     </Suspense>
  //   )
  // },
  // { // commented out register and forgot-password
  //   path: '/forgot-password',
  //   element: (
  //     <Suspense fallback={<LoadingComponent />}>
  //       <ForgotPassword />
  //     </Suspense>
  //   )
  // }
];

// Protected routes - require authentication
const protectedRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />, // This component handles auth check
    children: [
      {
        path: '/unauthorized',
        element: <Unauthorized />
      },
      {
        path: '/dashboard', // Dashboard is now the primary authenticated route
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <DashboardLayout />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingComponent />}>
                <Dashboard />
              </Suspense>
            ) ,
          },
          {
            path: "calendar",
            children: [
              {
                path: 'ppm',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PPMCalendarPage />
                  </Suspense>
                )
              },
              {
                path: 'ppm/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PPMCalendarDetailView />
                  </Suspense>
                )
              },
              {
                path: 'events',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PPMEventCalendar />
                  </Suspense>
                )
              },
              {
                path: 'ppms',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PpmManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'ppms/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PpmForm />
                  </Suspense>
                )
              },
              {
                path: 'ppms/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PpmForm />
                  </Suspense>
                )
              },
              {
                path: 'ppms/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PpmDetailView />
                  </Suspense>
                )
              },
            ],
            // element: <WorkCalendar />,
          },
          {
            path: "work",
            children: [
              {
                path: 'requests',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <WorkrequestManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'requests/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <WorkrequestForm />
                  </Suspense>
                )
              },
              {
                path: 'requests/edit/:slug',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <WorkrequestForm />
                  </Suspense>
                )
              },
              {
                path: 'requests/view/:slug',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <WorkrequestDetailView />
                  </Suspense>
                )
              },
              {
                path: 'orders',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <WorkorderManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'orders/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <WorkorderForm />
                  </Suspense>
                )
              },
              {
                path: 'orders/edit/:slug',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <WorkorderForm />
                  </Suspense>
                )
              },
              {
                path: 'orders/view/:slug',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <WorkorderDetailView />
                  </Suspense>
                )
              },
              {
                path: 'payment-comments',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PaymentcommentManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'payment-comments/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PaymentcommentForm />
                  </Suspense>
                )
              },
              {
                path: 'payment-comments/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PaymentcommentForm />
                  </Suspense>
                )
              },
              {
                path: 'payment-comments/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PaymentcommentDetailView />
                  </Suspense>
                )
              },
              {
                path: 'payment-items',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PaymentitemManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'payment-items/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PaymentitemForm />
                  </Suspense>
                )
              },
              {
                path: 'payment-items/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PaymentitemForm />
                  </Suspense>
                )
              },
              {
                path: 'payment-items/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PaymentitemDetailView />
                  </Suspense>
                )
              },
              {
                path: 'payment-requisitions',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PaymentrequisitionManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'payment-requisitions/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PaymentrequisitionForm />
                  </Suspense>
                )
              },
              {
                path: 'payment-requisitions/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PaymentrequisitionForm />
                  </Suspense>
                )
              },
              {
                path: 'payment-requisitions/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PaymentrequisitionDetailView />
                  </Suspense>
                )
              },
              {
                path: 'work-order-completions',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <WorkordercompletionManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'work-order-completions/new',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <WorkordercompletionForm />
                  </Suspense>
                )
              },
              {
                path: 'work-order-completions/:id/edit',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <WorkordercompletionForm />
                  </Suspense>
                )
              },
              {
                path: 'work-order-completions/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <WorkordercompletionDetailView />
                  </Suspense>
                )
              },
              {
                path: 'invoice-items',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <InvoiceitemManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'invoice-items/new',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <InvoiceitemForm />
                  </Suspense>
                )
              },
              {
                path: 'invoice-items/:id/edit',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <InvoiceitemForm isEditMode={true} />
                  </Suspense>
                )
              },
              {
                path: 'invoice-items/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <InvoiceitemDetailView />
                  </Suspense>
                )
              },
              {
                path: 'ppm-items',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PpmitemManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'ppm-items/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PpmitemForm />
                  </Suspense>
                )
              },
              {
                path: 'ppm-items/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PpmitemForm />
                  </Suspense>
                )
              },
              {
                path: 'ppm-items/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PpmitemDetailView />
                  </Suspense>
                )
              },
            ],
          },
          {
            path: "procurement",
            children: [
              {
                path: 'purchase-order',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PurchaseorderManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'purchase-order/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PurchaseorderForm />
                  </Suspense>
                )
              },
              {
                path: 'purchase-order/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PurchaseorderForm />
                  </Suspense>
                )
              },
              {
                path: 'purchase-order/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PurchaseorderDetailView />
                  </Suspense>
                )
              },
              {
                path: 'po-requisition',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PorequisitionManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'po-requisition/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PorequisitionForm />
                  </Suspense>
                )
              },
              {
                path: 'po-requisition/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PorequisitionForm />
                  </Suspense>
                )
              },
              {
                path: 'po-requisition/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PorequisitionDetailView />
                  </Suspense>
                )
              },
              {
                path: 'request-quotation',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <RequestquotationManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'request-quotation/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <RequestquotationForm />
                  </Suspense>
                )
              },
              {
                path: 'request-quotation/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <RequestquotationForm />
                  </Suspense>
                )
              },
              {
                path: 'request-quotation/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <RequestquotationDetailView />
                  </Suspense>
                )
              },
              {
                path: 'goods-received-note',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <GoodsreceivednoteManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'goods-received-note/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <GoodsreceivednoteForm />
                  </Suspense>
                )
              },
              {
                path: 'goods-received-note/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <GoodsreceivednoteForm />
                  </Suspense>
                )
              },
              {
                path: 'goods-received-note/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <GoodsreceivednoteDetailView />
                  </Suspense>
                )
              },
              {
                path: 'vendor-contracts',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <VendorcontractManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'vendor-contracts/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <VendorcontractForm />
                  </Suspense>
                )
              },
              {
                path: 'vendor-contracts/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <VendorcontractForm />
                  </Suspense>
                )
              },
              {
                path: 'vendor-contracts/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <VendorcontractDetailView />
                  </Suspense>
                )
              },
            ],
          },
          {
            path: "asset",
            children: [
              {
                path: 'inventory-reference',
                children: [
                  {
                    path: 'asset-categories',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <AssetCategoryManagementPage />
                      </Suspense>
                    )
                  },
                  {
                    path: 'asset-categories/create',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <AssetCategoryForm />
                      </Suspense>
                    )
                  },
                  {
                    path: 'asset-categories/edit/:id',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <AssetCategoryForm />
                      </Suspense>
                    )
                  },
                  {
                    path: 'asset-categories/view/:id',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <AssetCategoryDetailView />
                      </Suspense>
                    )
                  },
                  {
                    path: 'asset-subcategories',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <AssetSubcategoryManagementPage />
                      </Suspense>
                    )
                  },
                  {
                    path: 'asset-subcategories/new',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <AssetSubcategoryForm />
                      </Suspense>
                    )
                  },
                  {
                    path: 'asset-subcategories/:id/edit',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <AssetSubcategoryForm isEditMode={true} />
                      </Suspense>
                    )
                  },
                  {
                    path: 'asset-subcategories/:id',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <AssetSubcategoryDetailView />
                      </Suspense>
                    )
                  },
                  {
                    path: 'inventory-types',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <InventoryTypeManagementPage />
                      </Suspense>
                    )
                  },
                  {
                    path: 'inventory-types/new',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <InventoryTypeForm />
                      </Suspense>
                    )
                  },
                  {
                    path: 'inventory-types/:id/edit',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <InventoryTypeForm isEditMode={true} />
                      </Suspense>
                    )
                  },
                  {
                    path: 'inventory-types/:id',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <InventoryTypeDetailView />
                      </Suspense>
                    )
                  },
                  {
                    path: 'manufacturers',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <ManufacturerManagementPage mode="list" />
                      </Suspense>
                    )
                  },
                  {
                    path: 'manufacturers/create',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <ManufacturerManagementPage mode="create" />
                      </Suspense>
                    )
                  },
                  {
                    path: 'manufacturers/:id/edit',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <ManufacturerManagementPage mode="edit" />
                      </Suspense>
                    )
                  },
                  {
                    path: 'manufacturers/:id',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <ManufacturerManagementPage mode="view" />
                      </Suspense>
                    )
                  },
                  {
                    path: 'models',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <ModelManagementPage mode="list" />
                      </Suspense>
                    )
                  },
                  {
                    path: 'models/create',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <ModelManagementPage mode="create" />
                      </Suspense>
                    )
                  },
                  {
                    path: 'models/:id/edit',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <ModelManagementPage mode="edit" />
                      </Suspense>
                    )
                  },
                  {
                    path: 'models/:id',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <ModelManagementPage mode="view" />
                      </Suspense>
                    )
                  },
                  {
                    path: 'inventory-references',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <InventoryReferenceManagementPage />
                      </Suspense>
                    )
                  },
                  {
                    path: 'inventory-references/create',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <InventoryReferenceManagementPage mode="create" />
                      </Suspense>
                    )
                  },
                  {
                    path: 'inventory-references/edit/:id',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <InventoryReferenceManagementPage mode="edit" />
                      </Suspense>
                    )
                  },
                  {
                    path: 'inventory-references/view/:id',
                    element: (
                      <Suspense fallback={<LoadingComponent />}>
                        <InventoryReferenceManagementPage mode="view" />
                      </Suspense>
                    )
                  },
                ]
              },
              {
                path: 'warehouses',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <WarehouseManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'warehouses/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <WarehouseForm />
                  </Suspense>
                )
              },
              {
                path: 'warehouses/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <WarehouseForm />
                  </Suspense>
                )
              },
              {
                path: 'warehouses/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <WarehouseDetailView />
                  </Suspense>
                )
              },
              {
                path: 'stores',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <StoreManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'stores/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <StoreForm />
                  </Suspense>
                )
              },
              {
                path: 'stores/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <StoreForm />
                  </Suspense>
                )
              },
              {
                path: 'stores/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <StoreDetailView />
                  </Suspense>
                )
              },
              {
                path: 'assets',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <AssetManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'assets/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <AssetForm />
                  </Suspense>
                )
              },
              {
                path: 'assets/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <AssetForm />
                  </Suspense>
                )
              },
              {
                path: 'assets/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <AssetDetailView />
                  </Suspense>
                )
              },
              {
                path: 'inventories',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <InventoryManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'inventories/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <InventoryForm />
                  </Suspense>
                )
              },
              {
                path: 'inventories/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <InventoryForm />
                  </Suspense>
                )
              },
              {
                path: 'inventories/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <InventoryDetailView />
                  </Suspense>
                )
              },
              {
                path: 'transfers',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <TransferManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'transfers/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <TransferForm />
                  </Suspense>
                )
              },
              {
                path: 'transfers/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <TransferForm />
                  </Suspense>
                )
              },
              {
                path: 'transfers/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <TransferDetailView />
                  </Suspense>
                )
              },
              {
                path: 'items',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ItemManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'items/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ItemForm />
                  </Suspense>
                )
              },
              {
                path: 'items/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ItemForm />
                  </Suspense>
                )
              },
              {
                path: 'items/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ItemDetailView />
                  </Suspense>
                )
              },
              {
                path: 'item-requests',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ItemRequestManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'item-requests/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ItemRequestForm />
                  </Suspense>
                )
              },
              {
                path: 'item-requests/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ItemRequestForm />
                  </Suspense>
                )
              },
              {
                path: 'item-requests/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ItemRequestDetailView />
                  </Suspense>
                )
              },
              {
                path: "request",
                element: <ItemRequest />,
              },
              {
                path: "transfer",
                element: <TransferForm />,
              },
              {
                path: "movement",
                element: <MovementHistory />,
              },
            ],
          },
          {
            path: "facility",
            children: [
              {
                path: 'list',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <FacilityManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'list/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <FacilityForm />
                  </Suspense>
                )
              },
              {
                path: 'list/edit/:code',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <FacilityForm />
                  </Suspense>
                )
              },
              {
                path: 'list/view/:code',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <FacilityDetailView />
                  </Suspense>
                )
              },
              {
                path: 'buildings',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <BuildingManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'buildings/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <BuildingForm />
                  </Suspense>
                )
              },
              {
                path: 'buildings/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <BuildingForm />
                  </Suspense>
                )
              },
              {
                path: 'buildings/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <BuildingDetailView />
                  </Suspense>
                )
              },
              {
                path: 'regions',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <RegionManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'regions/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <RegionForm />
                  </Suspense>
                )
              },
              {
                path: 'regions/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <RegionForm />
                  </Suspense>
                )
              },
              {
                path: 'regions/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <RegionDetailView />
                  </Suspense>
                )
              },
              {
                path: 'clusters',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ClusterManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'clusters/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ClusterForm />
                  </Suspense>
                )
              },
              {
                path: 'clusters/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ClusterForm />
                  </Suspense>
                )
              },
              {
                path: 'clusters/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ClusterDetailView />
                  </Suspense>
                )
              },
              {
                path: 'subsystems',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <SubsystemManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'subsystems/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <SubsystemForm />
                  </Suspense>
                )
              },
              {
                path: 'subsystems/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <SubsystemForm />
                  </Suspense>
                )
              },
              {
                path: 'subsystems/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <SubsystemDetailView />
                  </Suspense>
                )
              },
              {
                path: 'zones',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ZoneManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'zones/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ZoneForm />
                  </Suspense>
                )
              },
              {
                path: 'zones/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ZoneForm />
                  </Suspense>
                )
              },
              {
                path: 'zones/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ZoneDetailView />
                  </Suspense>
                )
              },
              {
                path: 'landlords',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <LandlordManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'landlords/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <LandlordForm />
                  </Suspense>
                )
              },
              {
                path: 'landlords/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <LandlordForm />
                  </Suspense>
                )
              },
              {
                path: 'landlords/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <LandlordDetailView />
                  </Suspense>
                )
              },
              {
                path: 'apartment-type',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ApartmenttypeManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'apartment-type/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ApartmenttypeForm />
                  </Suspense>
                )
              },
              {
                path: 'apartment-type/edit/:slug',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ApartmenttypeForm />
                  </Suspense>
                )
              },
              {
                path: 'apartment-type/view/:slug',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ApartmenttypeDetailView />
                  </Suspense>
                )
              },
              {
                path: 'apartments',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ApartmentManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'apartments/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ApartmentForm />
                  </Suspense>
                )
              },
              {
                path: 'apartments/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ApartmentForm />
                  </Suspense>
                )
              },
              {
                path: 'apartments/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ApartmentDetailView />
                  </Suspense>
                )
              },
            ]
          },
          {
            path: "reports",
            element: <Reports />,
          },
          {
            path: "accounts",
            children: [
              {
                path: 'users',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <UserManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'users/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <UserForm />
                  </Suspense>
                )
              },
              {
                path: 'users/edit/:slug',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <UserForm />
                  </Suspense>
                )
              },
              {
                path: 'users/view/:slug',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <UserDetailView />
                  </Suspense>
                )
              },
              {
                path: 'personnels',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PersonnelManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'personnels/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PersonnelForm />
                  </Suspense>
                )
              },
              {
                path: 'personnels/edit/:slug',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PersonnelForm />
                  </Suspense>
                )
              },
              {
                path: 'personnels/view/:slug',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <PersonnelDetailView />
                  </Suspense>
                )
              },
              {
                path: 'client',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ClientManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'client/view/:slug',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ClientDetailView />
                  </Suspense>
                )
              },
              {
                path: 'client/edit/:slug',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ClientForm />
                  </Suspense>
                )
              },
              {
                path: 'client/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <ClientForm />
                  </Suspense>
                )
              },
              {
                path: 'vendors',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <VendorManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'vendors/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <VendorForm />
                  </Suspense>
                )
              },
              {
                path: 'vendors/edit/:slug',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <VendorForm />
                  </Suspense>
                )
              },
              {
                path: 'vendors/view/:slug',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <VendorDetailView />
                  </Suspense>
                )
              },
              {
                path: 'departments',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <DepartmentManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'departments/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <DepartmentForm />
                  </Suspense>
                )
              },
              {
                path: 'departments/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <DepartmentForm />
                  </Suspense>
                )
              },
              {
                path: 'departments/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <DepartmentDetailView />
                  </Suspense>
                )
              },
              {
                path: 'categories',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <CategoryManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'categories/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <CategoryForm />
                  </Suspense>
                )
              },
              {
                path: 'categories/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <CategoryForm />
                  </Suspense>
                )
              },
              {
                path: 'categories/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <CategoryDetailView />
                  </Suspense>
                )
              },
              {
                path: 'subcategories',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <SubcategoryManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'subcategories/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <SubcategoryForm />
                  </Suspense>
                )
              },
              {
                path: 'subcategories/edit/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <SubcategoryForm />
                  </Suspense>
                )
              },
              {
                path: 'subcategories/view/:id',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <SubcategoryDetailView />
                  </Suspense>
                )
              },
              {
                path: 'bank-accounts',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <BankaccountManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'bank-accounts/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <BankaccountForm />
                  </Suspense>
                )
              },
              {
                path: 'bank-accounts/edit/:slug',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <BankaccountForm />
                  </Suspense>
                )
              },
              {
                path: 'bank-accounts/view/:slug',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <BankaccountDetailView />
                  </Suspense>
                )
              },
              {
                path: 'unit-measurements',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <UnitmeasurementManagementPage />
                  </Suspense>
                )
              },
              {
                path: 'unit-measurements/create',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <UnitmeasurementForm />
                  </Suspense>
                )
              },
              {
                path: 'unit-measurements/edit/:code',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <UnitmeasurementForm />
                  </Suspense>
                )
              },
              {
                path: 'unit-measurements/view/:code',
                element: (
                  <Suspense fallback={<LoadingComponent />}>
                    <UnitmeasurementDetailView />
                  </Suspense>
                )
              },
            ],
          },
        ],
      },
      // {
      //   path: '/profile',
      //   element: (
      //     <Suspense fallback={<LoadingComponent />}>
      //       <Profile />
      //     </Suspense>
      //   )
      // },
      // {
      //   path: '/settings',
      //   element: (
      //     <Suspense fallback={<LoadingComponent />}>
      //       <Settings />
      //     </Suspense>
      //   )
      // }
    ]
  }
];

// Redirect routes
const redirectRoutes: RouteObject[] = [
  {
    path: '/',
    // element: <Navigate to="/dashboard" replace />
    element: <Navigate to="/" replace />
  },
  {
    path: '*',
    // element: <Navigate to="/login" replace />
    element: <NotFound />
  }
];

// Define the routes configuration
// const routes: RouteObject[] = [
//   {
//     path: "/",
//     element: <DashboardLayout />,
//     children: [
//       {
//         index: true,
//         element: <Dashboard />,
//       },
//       {
//         path: "calendar",
//         element: <WorkCalendar />,
//       },
//       {
//         path: "work",
//         children: [
//           {
//             path: "requests",
//             element: <WorkRequests />,
//           },
//           {
//             path: "orders",
//             element: <WorkOrders />,
//           },
//         ],
//       },
//       {
//         path: "asset",
//         children: [
//           {
//             path: "register",
//             element: <AssetRegister />,
//           },
//           {
//             path: "inventory",
//             element: <InventoryRegister />,
//           },
//           {
//             path: "request",
//             element: <ItemRequest />,
//           },
//           {
//             path: "transfer",
//             element: <TransferForm />,
//           },
//           {
//             path: "movement",
//             element: <MovementHistory />,
//           },
//         ],
//       },
//       {
//         path: "reports",
//         element: <Reports />,
//       },
//       {
//         path: "accounts",
//         children: [
//           {
//             path: 'users',
//             element: <UserManagement />
//           },
//           {
//             path: 'users/create',
//             element: <UserForm />
//           },
//           {
//             path: 'users/edit/:id',
//             element: <UserForm />
//           }
//         ],
//       },
//     ],
//   },
//   {
//     path: "*",
//     element: <NotFound />,
//   },
//   {
//     path: "/login",
//     element: <Login />
//   }
// ];

// Create and export the router
// export const router = createBrowserRouter(routes);

// export default routes;

// Combine all routes
const routes: RouteObject[] = [
  ...authRoutes,
  ...protectedRoutes,
];

// export const router = createBrowserRouter(routes)

export default routes;