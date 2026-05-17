import React, { useState } from "react";
import {
    FaDatabase, FaChartLine, FaBook, FaBoxes, FaWrench, FaEllipsisH,
    FaFileAlt, FaChartBar, FaBalanceScale, FaMoneyBillWave, FaUsers,
    FaTruck, FaUserClock, FaClipboardList, FaCalendarAlt, FaPrint,
    FaBars, FaTimes, FaChevronRight, FaShoppingCart, FaUndo, FaUniversity
} from "react-icons/fa";
import GeneralLedger from "./accounts/GeneralLedger";
import TrialBalance from "./accounts/TrialBalance";
import VoucherList from "./accounts/VoucherList";
import StockSummary from "./stock/StockSummary";
import "./ReportsDashboard.css";
import CustomerStatement from "./accounts/CustomerStatement";
import SupplierStatement from "./accounts/SupplierStatement";
import PurchaseReport from "./accounts/PurchaseReport";
import PurchaseReturnReport from "./accounts/PurchaseReturnReport";
import SaleReport from "./accounts/SaleReport";
import SaleReturnReport from "./accounts/SaleReturnReport";
import StockReport from "./accounts/StockReport";
import ProfitLoss from "./accounts/ProfitLoss";
import BankStatement from "./accounts/BankStatement";


export default function ReportsDashboard() {
    const [activeTab, setActiveTab] = useState("accounts");
    const [activeSubTab, setActiveSubTab] = useState("general-ledger");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Tab configuration with icons and labels
    const tabs = [
        { id: "accounts", name: "Accounts", icon: <FaBook />, available: true },
        { id: "financial", name: "Financial", icon: <FaChartLine />, available: false },
        { id: "stock", name: "Stock", icon: <FaBoxes />, available: true },
        { id: "workshop", name: "Workshop", icon: <FaWrench />, available: false },
        { id: "system", name: "System", icon: <FaDatabase />, available: false },
        
    ];

    // Sub-tabs configuration
    const subTabsConfig = {
        accounts: [
            { id: "general-ledger", name: "General Ledger", icon: <FaBook />, available: true },
            { id: "trial-balance", name: "Trial Balance", icon: <FaBalanceScale />, available: true },
            { id: "voucher-list", name: "Voucher List", icon: <FaFileAlt />, available: true },
            { id: "day-book", name: "Day Book", icon: <FaCalendarAlt />, available: false },
            { id: "customer-statement", name: "Customer Statement", icon: <FaUsers />, available: true },
            { id: "supplier-statement", name: "Supplier Statement", icon: <FaTruck />, available: true },
            { id: "purchase-report", name: "Purchase Report", icon: <FaShoppingCart />, available: true },
            { id: "purchase-return-report", name: "Purchase Return", icon: <FaUndo />, available: true },
            { id: "sale-report", name: "Sale Report", icon: <FaShoppingCart />, available: true },
            { id: "sale-return-report", name: "Sale Return", icon: <FaUndo />, available: true },
            { id: "stock-report", name: "Stock Report", icon: <FaBoxes />, available: true },
            { id: "profit-loss", name: "Profit & Loss", icon: <FaChartLine />, available: true },
            { id: "bank-statement", name: "Bank Statement", icon: <FaUniversity />, available: true },
        ],
        financial: [
            { id: "profit-loss", name: "Profit & Loss", icon: <FaChartLine />, available: false },
            { id: "balance-sheet", name: "Balance Sheet", icon: <FaBalanceScale />, available: false },
            { id: "cash-flow", name: "Cash Flow", icon: <FaMoneyBillWave />, available: false },
        ],
        stock: [
            { id: "stock-summary", name: "Stock Summary", icon: <FaBoxes />, available: true },
            { id: "stock-ledger", name: "Stock Ledger", icon: <FaClipboardList />, available: false },
            { id: "low-stock", name: "Low Stock Alert", icon: <FaChartBar />, available: false },
        ],
        workshop: [
            { id: "job-cards", name: "Job Cards", icon: <FaClipboardList />, available: false },
            { id: "service-report", name: "Service Report", icon: <FaWrench />, available: false },
        ],
        system: [
            { id: "user-log", name: "User Log", icon: <FaUsers />, available: false },
            { id: "activity-log", name: "Activity Log", icon: <FaFileAlt />, available: false },
        ],
    };

    // Get available tabs for bottom nav (mobile)
    const availableTabs = tabs.filter(t => t.available);

    // Render content based on active tab and sub-tab
    const renderContent = () => {
        if (activeTab === "accounts") {
            switch (activeSubTab) {
                case "general-ledger": return <GeneralLedger />;
                case "trial-balance": return <TrialBalance />;
                case "voucher-list": return <VoucherList />;
                case "customer-statement": return <CustomerStatement />;
                case "supplier-statement": return <SupplierStatement />;
                case "purchase-report": return <PurchaseReport />;
                case "purchase-return-report": return <PurchaseReturnReport />;
                case "sale-report": return <SaleReport />;
                case "sale-return-report": return <SaleReturnReport />;
                case "stock-report": return <StockReport />;
                case "profit-loss": return <ProfitLoss />;
                case "bank-statement": return <BankStatement />;
                default: return <ComingSoon title={getSubTabName()} />;
            }
        }
        if (activeTab === "stock") {
            switch (activeSubTab) {
                case "stock-summary": return <StockSummary />;
                default: return <ComingSoon title={getSubTabName()} />;
            }
        }
        return <ComingSoon title={getTabName()} />;
    };

    const getTabName = () => tabs.find(t => t.id === activeTab)?.name || "";
    const getSubTabName = () => subTabsConfig[activeTab]?.find(s => s.id === activeSubTab)?.name || "";

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        const firstAvailable = subTabsConfig[tabId]?.find(s => s.available);
        setActiveSubTab(firstAvailable?.id || "");
        setSidebarOpen(false);
    };

    const currentSubTabs = subTabsConfig[activeTab] || [];

    return (
        <div className="reports-dashboard-mobile">
            {/* Mobile Header */}
            <div className="rd-header">
                <button className="rd-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <FaTimes /> : <FaBars />}
                </button>
                <div className="rd-title">
                    <h2>📊 Reports</h2>
                    <span className="rd-breadcrumb">
                        {getTabName()} <FaChevronRight className="breadcrumb-arrow" /> {getSubTabName()}
                    </span>
                </div>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {sidebarOpen && (
                <div className="rd-sidebar-overlay" onClick={() => setSidebarOpen(false)}>
                    <div className="rd-sidebar" onClick={e => e.stopPropagation()}>
                        <div className="rd-sidebar-header">
                            <h3>Reports</h3>
                            <button onClick={() => setSidebarOpen(false)}><FaTimes /></button>
                        </div>
                        {tabs.map(tab => (
                            <div key={tab.id}>
                                <button
                                    className={`rd-sidebar-tab ${activeTab === tab.id ? 'active' : ''} ${!tab.available ? 'disabled' : ''}`}
                                    onClick={() => tab.available && handleTabChange(tab.id)}
                                >
                                    {tab.icon} {tab.name}
                                    {!tab.available && <span className="badge-soon">Soon</span>}
                                </button>
                                {activeTab === tab.id && currentSubTabs.map(sub => (
                                    <button
                                        key={sub.id}
                                        className={`rd-sidebar-sub ${activeSubTab === sub.id ? 'active' : ''} ${!sub.available ? 'disabled' : ''}`}
                                        onClick={() => sub.available && setActiveSubTab(sub.id)}
                                    >
                                        <FaChevronRight className="sub-arrow" /> {sub.name}
                                        {!sub.available && <span className="badge-soon">Soon</span>}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Desktop: Main Tabs */}
            <div className="rd-main-tabs desktop-only">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`rd-main-tab ${activeTab === tab.id ? 'active' : ''} ${!tab.available ? 'disabled' : ''}`}
                        onClick={() => tab.available && handleTabChange(tab.id)}
                    >
                        {tab.icon} <span>{tab.name}</span>
                        {!tab.available && <span className="badge-soon">Soon</span>}
                    </button>
                ))}
            </div>

            {/* Desktop: Sub Tabs */}
            <div className="rd-sub-tabs desktop-only">
                {currentSubTabs.map(sub => (
                    <button
                        key={sub.id}
                        className={`rd-sub-tab ${activeSubTab === sub.id ? 'active' : ''} ${!sub.available ? 'disabled' : ''}`}
                        onClick={() => sub.available && setActiveSubTab(sub.id)}
                    >
                        {sub.icon} <span>{sub.name}</span>
                        {!sub.available && <span className="badge-soon">Soon</span>}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="rd-content">
                {renderContent()}
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="rd-bottom-nav mobile-only">
                {availableTabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`rd-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        {tab.icon}
                        <span>{tab.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// Coming Soon Placeholder
function ComingSoon({ title }) {
    return (
        <div className="coming-soon-card">
            <div className="coming-soon-icon">🚧</div>
            <h3>{title || "Report"}</h3>
            <p>Coming Soon</p>
            <span className="coming-soon-badge">Under Development</span>
        </div>
    );
}