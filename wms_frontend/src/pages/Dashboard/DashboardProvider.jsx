// src/pages/Dashboard/DashboardProvider.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AuthContext from '../../context/AuthContext';
import dashboardApi from '../../api/dashboardApi';

const DashboardContext = createContext();

// ✅ Named export for useDashboard hook
export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) throw new Error('useDashboard must be used within DashboardProvider');
    return context;
};

// ============ WIDGET REGISTRY (Module-wise) ============
export const WIDGET_REGISTRY = {
    // ========== Financial Widgets ==========
    totalRevenue: { id: 'totalRevenue', name: 'Total Revenue', icon: '💰', module: 'financial', size: { w: 3, h: 1 }, category: 'stat' },
    salesOverview: { id: 'salesOverview', name: 'Sales Overview', icon: '📈', module: 'financial', size: { w: 6, h: 2 }, category: 'chart' },
    purchaseOverview: { id: 'purchaseOverview', name: 'Purchase Overview', icon: '🛒', module: 'financial', size: { w: 6, h: 2 }, category: 'chart' },
    paymentSummary: { id: 'paymentSummary', name: 'Payment Summary', icon: '💳', module: 'financial', size: { w: 4, h: 1 }, category: 'stat' },
    receivingSummary: { id: 'receivingSummary', name: 'Receiving Summary', icon: '📥', module: 'financial', size: { w: 4, h: 1 }, category: 'stat' },
    cashBalance: { id: 'cashBalance', name: 'Cash Balance', icon: '💵', module: 'financial', size: { w: 4, h: 1 }, category: 'stat' },
    receivablesAging: { id: 'receivablesAging', name: 'Receivables Aging', icon: '📅', module: 'financial', size: { w: 6, h: 2 }, category: 'chart' },
    payablesAging: { id: 'payablesAging', name: 'Payables Aging', icon: '📆', module: 'financial', size: { w: 6, h: 2 }, category: 'chart' },
    recentTransactions: { id: 'recentTransactions', name: 'Recent Transactions', icon: '📝', module: 'financial', size: { w: 6, h: 2 }, category: 'list' },

    // ========== Workshop Widgets ==========
    activeJobs: { id: 'activeJobs', name: 'Active Jobs', icon: '🔧', module: 'workshop', size: { w: 3, h: 1 }, category: 'stat' },
    completedJobs: { id: 'completedJobs', name: 'Completed Jobs', icon: '✅', module: 'workshop', size: { w: 3, h: 1 }, category: 'stat' },
    jobCardStatus: { id: 'jobCardStatus', name: 'Job Card Status', icon: '📊', module: 'workshop', size: { w: 6, h: 2 }, category: 'chart' },
    technicianWorkload: { id: 'technicianWorkload', name: 'Technician Workload', icon: '👨‍🔧', module: 'workshop', size: { w: 6, h: 2 }, category: 'list' },
    lowStockAlerts: { id: 'lowStockAlerts', name: 'Low Stock Alerts', icon: '⚠️', module: 'workshop', size: { w: 6, h: 2 }, category: 'list' },
    pendingInspections: { id: 'pendingInspections', name: 'Pending Inspections', icon: '🔍', module: 'workshop', size: { w: 6, h: 2 }, category: 'list' },
    partsRequests: { id: 'partsRequests', name: 'Parts Requests', icon: '📦', module: 'workshop', size: { w: 6, h: 2 }, category: 'list' },

    // ========== User/Team Widgets ==========
    userActivity: { id: 'userActivity', name: 'User Activity', icon: '👥', module: 'team', size: { w: 6, h: 2 }, category: 'list' },
    staffPerformance: { id: 'staffPerformance', name: 'Staff Performance', icon: '⭐', module: 'team', size: { w: 6, h: 2 }, category: 'list' },
    departmentOverview: { id: 'departmentOverview', name: 'Department Overview', icon: '🏛️', module: 'team', size: { w: 6, h: 2 }, category: 'chart' },

    // ========== System Widgets ==========
    systemHealth: { id: 'systemHealth', name: 'System Health', icon: '🖥️', module: 'system', size: { w: 6, h: 1 }, category: 'stat' },
    pendingApprovals: { id: 'pendingApprovals', name: 'Pending Approvals', icon: '⏳', module: 'system', size: { w: 6, h: 2 }, category: 'list' },
};

// ============ ROLE-BASED DEFAULT LAYOUTS ============
export const DEFAULT_LAYOUTS = {
    superadmin: [
        { i: 'totalRevenue', x: 0, y: 0, w: 3, h: 1 },
        { i: 'activeJobs', x: 3, y: 0, w: 3, h: 1 },
        { i: 'cashBalance', x: 6, y: 0, w: 3, h: 1 },
        { i: 'systemHealth', x: 9, y: 0, w: 3, h: 1 },
        { i: 'salesOverview', x: 0, y: 1, w: 6, h: 2 },
        { i: 'jobCardStatus', x: 6, y: 1, w: 6, h: 2 },
        { i: 'recentTransactions', x: 0, y: 3, w: 6, h: 2 },
        { i: 'technicianWorkload', x: 6, y: 3, w: 6, h: 2 },
        { i: 'lowStockAlerts', x: 0, y: 5, w: 6, h: 2 },
        { i: 'userActivity', x: 6, y: 5, w: 6, h: 2 },
    ],
    admin: [
        { i: 'totalRevenue', x: 0, y: 0, w: 3, h: 1 },
        { i: 'activeJobs', x: 3, y: 0, w: 3, h: 1 },
        { i: 'cashBalance', x: 6, y: 0, w: 3, h: 1 },
        { i: 'paymentSummary', x: 9, y: 0, w: 3, h: 1 },
        { i: 'salesOverview', x: 0, y: 1, w: 6, h: 2 },
        { i: 'purchaseOverview', x: 6, y: 1, w: 6, h: 2 },
        { i: 'pendingApprovals', x: 0, y: 3, w: 6, h: 2 },
        { i: 'lowStockAlerts', x: 6, y: 3, w: 6, h: 2 },
    ],
    manager: [
        { i: 'activeJobs', x: 0, y: 0, w: 4, h: 1 },
        { i: 'completedJobs', x: 4, y: 0, w: 4, h: 1 },
        { i: 'technicianWorkload', x: 0, y: 1, w: 6, h: 2 },
        { i: 'pendingInspections', x: 6, y: 1, w: 6, h: 2 },
        { i: 'departmentOverview', x: 0, y: 3, w: 12, h: 2 },
    ],
    accountant: [
        { i: 'totalRevenue', x: 0, y: 0, w: 3, h: 1 },
        { i: 'cashBalance', x: 3, y: 0, w: 3, h: 1 },
        { i: 'paymentSummary', x: 6, y: 0, w: 3, h: 1 },
        { i: 'receivingSummary', x: 9, y: 0, w: 3, h: 1 },
        { i: 'receivablesAging', x: 0, y: 1, w: 6, h: 2 },
        { i: 'payablesAging', x: 6, y: 1, w: 6, h: 2 },
        { i: 'recentTransactions', x: 0, y: 3, w: 12, h: 2 },
    ],
    salesperson: [
        { i: 'totalRevenue', x: 0, y: 0, w: 6, h: 1 },
        { i: 'salesOverview', x: 0, y: 1, w: 12, h: 2 },
        { i: 'recentTransactions', x: 0, y: 3, w: 12, h: 2 },
    ],
    purchaseofficer: [
        { i: 'purchaseOverview', x: 0, y: 0, w: 12, h: 2 },
        { i: 'lowStockAlerts', x: 0, y: 2, w: 12, h: 2 },
        { i: 'partsRequests', x: 0, y: 4, w: 12, h: 2 },
    ],
};

// Storage keys per user and branch
const getStorageKey = (userId, branchId) => `dashboard_layout_${userId}_${branchId}`;

// ✅ Default export for DashboardProvider
export default function DashboardProvider({ children }) {
    const { state: authState } = useContext(AuthContext);
    const [widgetData, setWidgetData] = useState({});
    const [layout, setLayout] = useState([]);
    const [availableWidgets, setAvailableWidgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeModule, setActiveModule] = useState('all');

    const role = authState.user?.roleName?.toLowerCase() || 'admin';
    const userId = authState.user?.userID || 'default';
    const branchId = authState.selectedBranch || 'all';

    // Get available widgets based on role and module
    useEffect(() => {
        let widgets = Object.values(WIDGET_REGISTRY);
        if (activeModule !== 'all') {
            widgets = widgets.filter(w => w.module === activeModule);
        }
        setAvailableWidgets(widgets);
    }, [activeModule, role]);

    // Load layout from localStorage or use default
    useEffect(() => {
        const loadLayout = () => {
            const storageKey = getStorageKey(userId, branchId);
            const savedLayout = localStorage.getItem(storageKey);
            if (savedLayout) {
                try {
                    setLayout(JSON.parse(savedLayout));
                } catch (e) {
                    setLayout(DEFAULT_LAYOUTS[role] || DEFAULT_LAYOUTS.admin);
                }
            } else {
                setLayout(DEFAULT_LAYOUTS[role] || DEFAULT_LAYOUTS.admin);
            }
        };
        loadLayout();
    }, [role, userId, branchId]);

    // Save layout to localStorage
    const saveLayout = (newLayout) => {
        setLayout(newLayout);
        const storageKey = getStorageKey(userId, branchId);
        localStorage.setItem(storageKey, JSON.stringify(newLayout));
    };

    // Mock data for now - replace with actual API calls
    const getMockData = (widgetId) => {
        const mockData = {
            totalRevenue: { value: 2845000, change: 12.5 },
            activeJobs: { count: 23, change: -5 },
            cashBalance: { balance: 1250000 },
            systemHealth: {
                services: [
                    { name: 'API Server', status: 'online' },
                    { name: 'Database', status: 'online' }
                ]
            },
            salesOverview: [
                { date: 'Mon', sales: 450000 }, { date: 'Tue', sales: 520000 },
                { date: 'Wed', sales: 480000 }, { date: 'Thu', sales: 610000 },
                { date: 'Fri', sales: 750000 }, { date: 'Sat', sales: 890000 },
                { date: 'Sun', sales: 720000 }
            ],
            recentTransactions: [
                { description: 'Sale INV-001', amount: 125000, date: new Date(), type: 'credit' },
                { description: 'Purchase PO-001', amount: 45000, date: new Date(), type: 'debit' }
            ]
        };
        return mockData[widgetId] || { message: 'No data available' };
    };

    // Fetch widget data
    const fetchWidgetData = useCallback(async (widgetId) => {
        try {
            const mockData = getMockData(widgetId);
            setWidgetData(prev => ({ ...prev, [widgetId]: mockData }));
        } catch (error) {
            console.error(`Error fetching widget ${widgetId}:`, error);
            setWidgetData(prev => ({ ...prev, [widgetId]: null }));
        }
    }, []);

    // Fetch all widget data
    const fetchAllWidgetData = useCallback(async () => {
        setLoading(true);
        try {
            const widgetIds = layout.map(item => item.i);
            for (const widgetId of widgetIds) {
                await fetchWidgetData(widgetId);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [layout, fetchWidgetData]);

    useEffect(() => {
        if (layout.length > 0) {
            fetchAllWidgetData();
        }
    }, [layout, fetchAllWidgetData]);

    const addWidget = (widgetId) => {
        const widget = WIDGET_REGISTRY[widgetId];
        if (!widget) return;
        const newItem = { i: widgetId, x: 0, y: Infinity, w: widget.size.w, h: widget.size.h };
        const newLayout = [...layout, newItem];
        saveLayout(newLayout);
        fetchWidgetData(widgetId);
    };

    const removeWidget = (widgetId) => {
        const newLayout = layout.filter(item => item.i !== widgetId);
        saveLayout(newLayout);
        setWidgetData(prev => { const newData = { ...prev }; delete newData[widgetId]; return newData; });
    };

    const refreshWidget = (widgetId) => { fetchWidgetData(widgetId); };

    const value = {
        widgetData, layout, availableWidgets, loading, isEditing, setIsEditing,
        activeModule, setActiveModule, saveLayout, addWidget, removeWidget,
        refreshWidget, fetchAllWidgetData, WIDGET_REGISTRY
    };

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
}