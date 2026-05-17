//import Dashboard from "../pages/Dashboard/Dashboard";
//import Users from "../pages/Users/Users";
//import RolePermission from "../pages/RolePermission/RolePermission";
//import Branch from "../pages/Branch/Branch";
//import COAPage from "../pages/COA/COAPage";
//import CompanyPage from "../components/Company/CompanyPage";
//import CategoryPage from "../components/Category/CategoryPage";
//import SubcategoryPage from "../pages/Subcategory/SubcategoryPage"; // ✅ ADD THIS
//import ItemPage from "../components/Item/ItemPage";
//import PurchasePage from "../pages/purchase/PurchasePage";
//import PurchaseReturnPage from "../pages/purchaseReturn/PurchaseReturnPage";
//import SalesPage from "../components/Sales/SalesPage";
//import SalesReturnPage from "../components/SalesReturn/SalesReturnPage";
//import PaymentPage from "../components/Payments/PaymentPage";
//import ReceivingPage from "../components/Receiving/ReceivingPage";
//import PostdatedChequePage from "../components/PostdatedCheque/PostdatedChequePage";
//import PurchaseReportPage from "../modules/reports/purchase/PurchaseReportPage";
//import SupplierBalancingReportPage from "../modules/reports/supplierBalancing/SupplierBalancingReportPage";
//import PurchaseReturnReportPage from "../modules/reports/purchaseReturn/PurchaseReturnReportPage";
//import SalesReportPage from "../modules/reports/sales/SalesReportPage";
//import SalesReturnReportPage from "../modules/reports/salesReturn/SalesReturnReportPage";
//import StockPage from "../components/Stock/StockPage";
//import FormDetailPage from "../components/FormDetail/FormDetailPage";
//import VehiclePage from "../pages/Workshop/Vehicles/VehiclePage";
//import ServiceCatalogPage from "../pages/Workshop/ServiceCatalog/ServiceCatalogPage";
//import TechnicianPage from "../pages/Workshop/Technicians/TechnicianPage";
//import JobCardPage from "../pages/Workshop/JobCards/JobCardPage";
//import WorkshopDashboard from "../pages/Workshop/WorkshopDashboard";
//import BookingCalendar from "../pages/Workshop/Booking/BookingCalendar";
//import TechnicianTimeLogPage from "../pages/Workshop/TechnicianTimeLog/TechnicianTimeLogPage";
//import WorkshopSettingsPage from "../pages/Workshop/Settings/WorkshopSettingsPage";
//import PartsRequestPage from "../pages/Workshop/PartsRequest/PartsRequestPage";
//import InspectionTemplatesPage from "../pages/Workshop/Inspection/InspectionTemplatesPage";
//import JobInspectionPage from "../pages/Workshop/Inspection/JobInspectionPage";
//import NotificationsPage from "../pages/Workshop/Notifications/NotificationsPage";
//import NotificationTemplatesPage from "../pages/Workshop/Notifications/NotificationTemplatesPage";
//import CustomerPreferencesPage from "../pages/Workshop/Notifications/CustomerPreferencesPage";
//import NotificationHistoryPage from "../pages/Workshop/Notifications/NotificationHistoryPage";
//import DepartmentsPage from "../pages/Workshop/Departments/DepartmentsPage";
//import DepartmentDetailsPage from "../pages/Workshop/Departments/DepartmentDetailsPage";
//import DepartmentDashboard from "../pages/Workshop/Departments/DepartmentDashboard";
//import WarrantyClaimsPage from "../pages/Workshop/Warranty/WarrantyClaimsPage";
//import SupplierWarrantiesPage from "../pages/Workshop/Warranty/SupplierWarrantiesPage";
//import VochTypePage from "../pages/Voucher/VochTypePage";
//import VoucherListPage from "../pages/Voucher/VoucherListPage";
//import VoucherDetailPage from "../pages/Voucher/VoucherDetailPage";
//import ReportsDashboard from "../pages/Reports/ReportsDashboard";
//import GodownPage from "../pages/Godown/GodownPage";


//const componentMap = {
//    dashboard: Dashboard,
//    users: Users,
//    "role-permission": RolePermission,
//    branch: Branch,
//    coa: COAPage,
//    company: CompanyPage,
//    category: CategoryPage,
//    subcategory: SubcategoryPage,
//    item: ItemPage,
//    godown: GodownPage,
//    purchase: PurchasePage,
//    "purchase-return": PurchaseReturnPage,
//    sales: SalesPage,
//    "sales-return": SalesReturnPage,
//    payments: PaymentPage,
//    receiving: ReceivingPage,
//    "postdated-cheques": PostdatedChequePage,
//    "purchase-report": PurchaseReportPage,
//    "supplier-balancing": SupplierBalancingReportPage, // 👈 Yahan add karo
//    "purchase-return-report": PurchaseReturnReportPage,
//    "sales-report": SalesReportPage,
//    "sales-return-report": SalesReturnReportPage,
//    stock: StockPage,
//    "form-detail": FormDetailPage,
//    // Workshop Modules
//    "workshop-dashboard": WorkshopDashboard,
//    "vehicles": VehiclePage,
//    "service-catalog": ServiceCatalogPage,
//    "technicians": TechnicianPage,
//    "job-cards": JobCardPage,
//    "booking-diary": BookingCalendar,
//    "technician-time": TechnicianTimeLogPage,
//    "workshop-settings": WorkshopSettingsPage,
//    "parts-request": PartsRequestPage,
//    "inspection-templates": InspectionTemplatesPage,
//    "job-inspections": JobInspectionPage,
//    "notifications": NotificationsPage,
//    "notification-templates": NotificationTemplatesPage,
//    "customer-preferences": CustomerPreferencesPage,
//    "notification-history": NotificationHistoryPage,
//    "departments": DepartmentsPage,
//    "department-details": DepartmentDetailsPage,
//    "department-dashboard": DepartmentDashboard,
//    "warranty-claims": WarrantyClaimsPage,
//    "supplier-warranties": SupplierWarrantiesPage,
//    "vochtype": VochTypePage,
//    "vouchers": VoucherListPage,
//    "voucher-detail": VoucherDetailPage,
//    "reports-dashboard": ReportsDashboard,

//};

//export const buildRoutesFromMenus = (menus) => {
//    let routes = [];

//    const walk = (items) => {
//        if (!items || !Array.isArray(items)) return; // 🔹 SAFE CHECK
//        items.forEach(menu => {
//            if (menu.menuPath && componentMap[menu.menuPath]) {
//                routes.push({
//                    path: `/${menu.menuPath}`,
//                    element: componentMap[menu.menuPath],
//                });
//            }
//            if (menu.children?.length) {
//                walk(menu.children);
//            }
//        });
//    };

//    walk(menus);
//    return routes;
//};

import Dashboard from "../pages/Dashboard/DashboardPage";
import Users from "../pages/Users/Users";
import RolePermission from "../pages/RolePermission/RolePermission";
import Branch from "../pages/Branch/Branch";
import COAPage from "../pages/COA/COAPage";
import CompanyPage from "../components/Company/CompanyPage";
import CategoryPage from "../components/Category/CategoryPage";
import SubcategoryPage from "../pages/Subcategory/SubcategoryPage";
import ItemPage from "../components/Item/ItemPage";
import PurchasePage from "../pages/purchase/PurchasePage";
import PurchaseReturnPage from "../pages/purchaseReturn/PurchaseReturnPage";
import SalesPage from "../components/Sales/SalesPage";
import SalesReturnPage from "../components/SalesReturn/SalesReturnPage";
import PaymentPage from "../components/Payments/PaymentPage";
import ReceivingPage from "../components/Receiving/ReceivingPage";
import PostdatedChequePage from "../components/PostdatedCheque/PostdatedChequePage";
import PurchaseReportPage from "../modules/reports/purchase/PurchaseReportPage";
import SupplierBalancingReportPage from "../modules/reports/supplierBalancing/SupplierBalancingReportPage";
import PurchaseReturnReportPage from "../modules/reports/purchaseReturn/PurchaseReturnReportPage";
import SalesReportPage from "../modules/reports/sales/SalesReportPage";
import SalesReturnReportPage from "../modules/reports/salesReturn/SalesReturnReportPage";
import StockPage from "../components/Stock/StockPage";
import FormDetailPage from "../components/FormDetail/FormDetailPage";
import VehiclePage from "../pages/Workshop/Vehicles/VehiclePage";
import ServiceCatalogPage from "../pages/Workshop/ServiceCatalog/ServiceCatalogPage";
import TechnicianPage from "../pages/Workshop/Technicians/TechnicianPage";
import JobCardPage from "../pages/Workshop/JobCards/JobCardPage";
import WorkshopDashboard from "../pages/Workshop/WorkshopDashboard";
import BookingCalendar from "../pages/Workshop/Booking/BookingCalendar";
import TechnicianTimeLogPage from "../pages/Workshop/TechnicianTimeLog/TechnicianTimeLogPage";
import WorkshopSettingsPage from "../pages/Workshop/Settings/WorkshopSettingsPage";
import PartsRequestPage from "../pages/Workshop/PartsRequest/PartsRequestPage";
import InspectionTemplatesPage from "../pages/Workshop/Inspection/InspectionTemplatesPage";
import JobInspectionPage from "../pages/Workshop/Inspection/JobInspectionPage";
import NotificationsPage from "../pages/Workshop/Notifications/NotificationsPage";
import NotificationTemplatesPage from "../pages/Workshop/Notifications/NotificationTemplatesPage";
import CustomerPreferencesPage from "../pages/Workshop/Notifications/CustomerPreferencesPage";
import NotificationHistoryPage from "../pages/Workshop/Notifications/NotificationHistoryPage";
import DepartmentsPage from "../pages/Workshop/Departments/DepartmentsPage";
import DepartmentDetailsPage from "../pages/Workshop/Departments/DepartmentDetailsPage";
import DepartmentDashboard from "../pages/Workshop/Departments/DepartmentDashboard";
import WarrantyClaimsPage from "../pages/Workshop/Warranty/WarrantyClaimsPage";
import SupplierWarrantiesPage from "../pages/Workshop/Warranty/SupplierWarrantiesPage";
import VochTypePage from "../pages/Voucher/VochTypePage";
import VoucherListPage from "../pages/Voucher/VoucherListPage";
import VoucherDetailPage from "../pages/Voucher/VoucherDetailPage";
import ReportsDashboard from "../pages/Reports/ReportsDashboard";
import GodownPage from "../pages/Godown/GodownPage";

const componentMap = {
    dashboard: Dashboard,
    users: Users,
    "role-permission": RolePermission,
    branch: Branch,
    coa: COAPage,
    company: CompanyPage,
    category: CategoryPage,
    subcategory: SubcategoryPage,
    item: ItemPage,
    godown: GodownPage,
    purchase: PurchasePage,
    "purchase-return": PurchaseReturnPage,
    sales: SalesPage,
    "sales-return": SalesReturnPage,
    payments: PaymentPage,
    receiving: ReceivingPage,
    "postdated-cheques": PostdatedChequePage,
    "purchase-report": PurchaseReportPage,
    "supplier-balancing": SupplierBalancingReportPage,
    "purchase-return-report": PurchaseReturnReportPage,
    "sales-report": SalesReportPage,
    "sales-return-report": SalesReturnReportPage,
    stock: StockPage,
    "form-detail": FormDetailPage,
    "workshop-dashboard": WorkshopDashboard,
    "vehicles": VehiclePage,
    "service-catalog": ServiceCatalogPage,
    "technicians": TechnicianPage,
    "job-cards": JobCardPage,
    "booking-diary": BookingCalendar,
    "technician-time": TechnicianTimeLogPage,
    "workshop-settings": WorkshopSettingsPage,
    "parts-request": PartsRequestPage,
    "inspection-templates": InspectionTemplatesPage,
    "job-inspections": JobInspectionPage,
    "notifications": NotificationsPage,
    "notification-templates": NotificationTemplatesPage,
    "customer-preferences": CustomerPreferencesPage,
    "notification-history": NotificationHistoryPage,
    "departments": DepartmentsPage,
    "department-details": DepartmentDetailsPage,
    "department-dashboard": DepartmentDashboard,
    "warranty-claims": WarrantyClaimsPage,
    "supplier-warranties": SupplierWarrantiesPage,
    "vochtype": VochTypePage,
    "vouchers": VoucherListPage,
    "voucher-detail": VoucherDetailPage,
    "reports-dashboard": ReportsDashboard,
};

export const buildRoutesFromMenus = (menus) => {
    let routes = [];

    // ✅ Always include voucher-detail route even if not in menu
    const hasVoucherDetail = componentMap["voucher-detail"];
    if (hasVoucherDetail) {
        routes.push({
            path: "/voucher-detail/:id",
            element: componentMap["voucher-detail"],
        });
        console.log("✅ Voucher detail route added manually");
    }

    const walk = (items) => {
        if (!items || !Array.isArray(items)) return;
        items.forEach(menu => {
            if (menu.menuPath && componentMap[menu.menuPath]) {
                // Skip voucher-detail as it's already added with :id parameter
                if (menu.menuPath === 'voucher-detail') {
                    return; // Already added above
                }

                routes.push({
                    path: `/${menu.menuPath}`,
                    element: componentMap[menu.menuPath],
                });
            }
            if (menu.children?.length) {
                walk(menu.children);
            }
        });
    };

    walk(menus);

    console.log("🛣️ Generated routes:", routes.map(r => r.path));
    return routes;
};