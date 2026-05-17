// src/context/DashboardContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AuthContext from './AuthContext';
import dashboardApi from '../api/dashboardApi';
import purchaseApi from '../api/purchaseApi';
import salesApi from '../api/salesApi';
import jobCardApi from '../api/jobCardApi';
import technicianApi from '../api/technicianApi';
import stockApi from '../api/stockApi';

const DashboardContext = createContext();

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) throw new Error('useDashboard must be used within DashboardProvider');
    return context;
};

// ============ WIDGET REGISTRY ============
export const WIDGET_REGISTRY = {
    // Financial Widgets
    totalRevenue: {
        id: 'totalRevenue', name: 'Total Revenue', icon: '💰', module: 'financial',
        size: { w: 3, h: 1 }, category: 'stat',
        api: async (branchId) => {
            const res = await salesApi.getSummary(branchId);
            return { value: res.data?.data?.totalAmount || 0 };
        }
    },
    totalPurchases: {
        id: 'totalPurchases', name: 'Total Purchases', icon: '🛒', module: 'financial',
        size: { w: 3, h: 1 }, category: 'stat',
        api: async (branchId) => {
            const res = await purchaseApi.getSummary(branchId);
            return { value: res.data?.data?.totalAmount || 0 };
        }
    },
    cashBalance: {
        id: 'cashBalance', name: 'Cash Balance', icon: '💵', module: 'financial',
        size: { w: 3, h: 1 }, category: 'stat',
        api: async (branchId) => {
            const res = await dashboardApi.getCashBalance(branchId);
            return { balance: res.data?.data?.balance || 0 };
        }
    },
    salesOverview: {
        id: 'salesOverview', name: 'Sales Overview', icon: '📈', module: 'financial',
        size: { w: 6, h: 2 }, category: 'chart',
        api: async (branchId) => {
            const res = await salesApi.getChartData(branchId);
            return res.data?.data || [];
        }
    },
    recentTransactions: {
        id: 'recentTransactions', name: 'Recent Transactions', icon: '📝', module: 'financial',
        size: { w: 6, h: 2 }, category: 'list',
        api: async (branchId) => {
            const res = await dashboardApi.getRecentTransactions(branchId);
            return res.data?.data || [];
        }
    },

    // Workshop Widgets
    activeJobs: {
        id: 'activeJobs', name: 'Active Jobs', icon: '🔧', module: 'workshop',
        size: { w: 3, h: 1 }, category: 'stat',
        api: async (branchId) => {
            const res = await jobCardApi.getCountByStatus('PENDING,IN_PROGRESS', branchId);
            return { count: res.data?.data?.count || 0 };
        }
    },
    completedJobs: {
        id: 'completedJobs', name: 'Completed Jobs', icon: '✅', module: 'workshop',
        size: { w: 3, h: 1 }, category: 'stat',
        api: async (branchId) => {
            const res = await jobCardApi.getCountByStatus('COMPLETED', branchId);
            return { count: res.data?.data?.count || 0 };
        }
    },
    technicianWorkload: {
        id: 'technicianWorkload', name: 'Technician Workload', icon: '👨‍🔧', module: 'workshop',
        size: { w: 6, h: 2 }, category: 'list',
        api: async (branchId) => {
            const res = await technicianApi.getWorkload(branchId);
            return res.data?.data || [];
        }
    },
    jobCardStatus: {
        id: 'jobCardStatus', name: 'Job Card Status', icon: '📊', module: 'workshop',
        size: { w: 6, h: 2 }, category: 'chart',
        api: async (branchId) => {
            const res = await jobCardApi.getStatusDistribution(branchId);
            return res.data?.data || [];
        }
    },
    lowStockAlerts: {
        id: 'lowStockAlerts', name: 'Low Stock Alerts', icon: '⚠️', module: 'workshop',
        size: { w: 6, h: 2 }, category: 'list',
        api: async (branchId) => {
            const res = await stockApi.getLowStockAlerts(branchId);
            return res.data?.data || [];
        }
    },

    // Team Widgets
    staffPerformance: {
        id: 'staffPerformance', name: 'Staff Performance', icon: '⭐', module: 'team',
        size: { w: 6, h: 2 }, category: 'list',
        api: async (branchId) => {
            const res = await dashboardApi.getStaffPerformance(branchId);
            return res.data?.data || [];
        }
    },

    // System Widgets
    systemHealth: {
        id: 'systemHealth', name: 'System Health', icon: '🖥️', module: 'system',
        size: { w: 6, h: 1 }, category: 'stat',
        api: async () => {
            return {
                services: [
                    { name: 'API Server', status: 'online' },
                    { name: 'Database', status: 'online' }
                ]
            };
        }
    },
};

// Default layouts per role
WIDGET_REGISTRY.DEFAULT_LAYOUTS = {
    superadmin: [
        { i: 'totalRevenue', x: 0, y: 0, w: 3, h: 1 },
        { i: 'totalPurchases', x: 3, y: 0, w: 3, h: 1 },
        { i: 'cashBalance', x: 6, y: 0, w: 3, h: 1 },
        { i: 'activeJobs', x: 9, y: 0, w: 3, h: 1 },
        { i: 'salesOverview', x: 0, y: 1, w: 6, h: 2 },
        { i: 'jobCardStatus', x: 6, y: 1, w: 6, h: 2 },
        { i: 'recentTransactions', x: 0, y: 3, w: 6, h: 2 },
        { i: 'technicianWorkload', x: 6, y: 3, w: 6, h: 2 },
    ],
    admin: [
        { i: 'totalRevenue', x: 0, y: 0, w: 3, h: 1 },
        { i: 'totalPurchases', x: 3, y: 0, w: 3, h: 1 },
        { i: 'cashBalance', x: 6, y: 0, w: 3, h: 1 },
        { i: 'activeJobs', x: 9, y: 0, w: 3, h: 1 },
        { i: 'salesOverview', x: 0, y: 1, w: 12, h: 2 },
        { i: 'lowStockAlerts', x: 0, y: 3, w: 6, h: 2 },
        { i: 'technicianWorkload', x: 6, y: 3, w: 6, h: 2 },
    ],
    manager: [
        { i: 'activeJobs', x: 0, y: 0, w: 4, h: 1 },
        { i: 'completedJobs', x: 4, y: 0, w: 4, h: 1 },
        { i: 'technicianWorkload', x: 8, y: 0, w: 4, h: 1 },
        { i: 'jobCardStatus', x: 0, y: 1, w: 12, h: 2 },
        { i: 'staffPerformance', x: 0, y: 3, w: 12, h: 2 },
    ],
    accountant: [
        { i: 'totalRevenue', x: 0, y: 0, w: 4, h: 1 },
        { i: 'totalPurchases', x: 4, y: 0, w: 4, h: 1 },
        { i: 'cashBalance', x: 8, y: 0, w: 4, h: 1 },
        { i: 'recentTransactions', x: 0, y: 1, w: 12, h: 2 },
    ],
    salesperson: [
        { i: 'totalRevenue', x: 0, y: 0, w: 6, h: 1 },
        { i: 'salesOverview', x: 0, y: 1, w: 12, h: 2 },
    ],
    purchaseofficer: [
        { i: 'totalPurchases', x: 0, y: 0, w: 6, h: 1 },
        { i: 'lowStockAlerts', x: 0, y: 1, w: 12, h: 2 },
    ],
};

const getStorageKey = (userId, branchId) => `dashboard_layout_${userId}_${branchId}`;

export const DashboardProvider = ({ children }) => {
    const { state: authState } = useContext(AuthContext);
    const [widgetData, setWidgetData] = useState({});
    const [layout, setLayout] = useState([]);
    const [availableWidgets, setAvailableWidgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeModule, setActiveModule] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    const role = authState.user?.roleName?.toLowerCase() || 'admin';
    const userId = authState.user?.userID || 'default';
    const branchId = authState.selectedBranch || 'all';

    // Get available widgets
    useEffect(() => {
        let widgets = Object.values(WIDGET_REGISTRY).filter(w => w.id);
        if (activeModule !== 'all') {
            widgets = widgets.filter(w => w.module === activeModule);
        }
        setAvailableWidgets(widgets);
    }, [activeModule]);

    // Load layout from localStorage or default
    useEffect(() => {
        const loadLayout = () => {
            const storageKey = getStorageKey(userId, branchId);
            const savedLayout = localStorage.getItem(storageKey);
            if (savedLayout) {
                try {
                    setLayout(JSON.parse(savedLayout));
                } catch (e) {
                    setLayout(WIDGET_REGISTRY.DEFAULT_LAYOUTS[role] || []);
                }
            } else {
                setLayout(WIDGET_REGISTRY.DEFAULT_LAYOUTS[role] || []);
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

    // Fetch widget data from API
    const fetchWidgetData = useCallback(async (widgetId, currentBranchId) => {
        const widget = WIDGET_REGISTRY[widgetId];
        if (!widget || !widget.api) return;

        try {
            const actualBranchId = currentBranchId !== 'all' ? currentBranchId : null;
            const data = await widget.api(actualBranchId);
            setWidgetData(prev => ({ ...prev, [widgetId]: data }));
        } catch (error) {
            console.error(`Error fetching widget ${widgetId}:`, error);
            setWidgetData(prev => ({ ...prev, [widgetId]: null }));
        }
    }, []);

    // Fetch all widget data
    const fetchAllWidgetData = useCallback(async (customBranchId = null) => {
        const currentBranch = customBranchId !== undefined ? customBranchId : branchId;
        setLoading(true);

        try {
            const widgetIds = layout.map(item => item.i);
            const promises = widgetIds.map(id => fetchWidgetData(id, currentBranch));
            await Promise.all(promises);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [layout, branchId, fetchWidgetData]);

    // Refresh all widget data
    const refreshWidgetData = useCallback(async () => {
        setRefreshing(true);
        await fetchAllWidgetData();
        setRefreshing(false);
    }, [fetchAllWidgetData]);

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
        fetchWidgetData(widgetId, branchId);
    };

    const removeWidget = (widgetId) => {
        const newLayout = layout.filter(item => item.i !== widgetId);
        saveLayout(newLayout);
        setWidgetData(prev => { const newData = { ...prev }; delete newData[widgetId]; return newData; });
    };

    const refreshWidget = (widgetId) => {
        fetchWidgetData(widgetId, branchId);
    };

    const value = {
        widgetData,
        layout,
        availableWidgets,
        loading,
        refreshing,
        isEditing,
        setIsEditing,
        activeModule,
        setActiveModule,
        saveLayout,
        addWidget,
        removeWidget,
        refreshWidget,
        refreshWidgetData,
        fetchAllWidgetData,
        WIDGET_REGISTRY
    };

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
};