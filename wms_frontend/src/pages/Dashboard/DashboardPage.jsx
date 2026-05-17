import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../../context/AuthContext';
import dashboardApi from '../../api/dashboardApi';
import {
    FaWallet, FaChartLine, FaWrench, FaChevronUp, FaChevronDown,
    FaEdit, FaSave, FaTimes, FaPlus, FaShoppingCart, FaMoneyBillWave,
    FaCreditCard, FaExchangeAlt, FaClipboardList, FaCalendarAlt,
    FaUsers, FaTachometerAlt, FaChartBar, FaChartPie, FaList, FaTable, FaPlusCircle, FaCog
} from 'react-icons/fa';
import { Button, useDialog } from '../../components/common';
import { PageHeader } from '../../components/features';
import DynamicWidgetBuilder from '../../components/features/DashboardWidget/DynamicWidgetBuilder';
import './Dashboard.css';

// Helper functions
const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'Rs. 0';
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount);
};

const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return num.toLocaleString();
};

// Widget Components
const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="stat-card" style={{ borderLeftColor: color }}>
        <div className="stat-card-icon" style={{ backgroundColor: `${color}15`, color }}>{icon}</div>
        <div className="stat-card-content">
            <div className="stat-card-value">{value}</div>
            <div className="stat-card-title">{title}</div>
            {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
        </div>
    </div>
);

const SummaryCard = ({ title, data, todayData, color }) => (
    <div className="summary-card">
        <div className="summary-card-header" style={{ borderBottomColor: color }}>
            <span className="summary-icon" style={{ color }}>{title === 'Purchase' ? <FaShoppingCart /> : title === 'Sale' ? <FaMoneyBillWave /> : <FaCreditCard />}</span>
            <span className="summary-title">{title}</span>
        </div>
        <div className="summary-card-body">
            <div className="summary-section">
                <div className="summary-section-title">Overall</div>
                <div className="summary-stats">
                    <div className="summary-stat">
                        <div className="stat-number">{formatCurrency(data?.totalAmount)}</div>
                        <div className="stat-label">Total</div>
                    </div>
                    <div className="summary-stat">
                        <div className="stat-number">{formatCurrency(data?.cashAmount)}</div>
                        <div className="stat-label">Cash</div>
                    </div>
                    <div className="summary-stat">
                        <div className="stat-number">{formatCurrency(data?.creditAmount)}</div>
                        <div className="stat-label">Credit</div>
                    </div>
                </div>
            </div>
            {todayData && (
                <div className="summary-section">
                    <div className="summary-section-title">Today's</div>
                    <div className="summary-stats">
                        <div className="summary-stat">
                            <div className="stat-number">{formatCurrency(todayData?.totalAmount)}</div>
                            <div className="stat-label">Total</div>
                        </div>
                        <div className="summary-stat">
                            <div className="stat-number">{formatCurrency(todayData?.cashAmount)}</div>
                            <div className="stat-label">Cash</div>
                        </div>
                        <div className="summary-stat">
                            <div className="stat-number">{formatCurrency(todayData?.creditAmount)}</div>
                            <div className="stat-label">Credit</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
);

const RecentList = ({ title, items, color }) => (
    <div className="recent-list-card">
        <div className="recent-header" style={{ borderBottomColor: color }}>
            <span>📋 Recent {title}</span>
        </div>
        <div className="recent-list">
            {items?.slice(0, 5).map((item, idx) => (
                <div key={idx} className="recent-item">
                    <span className="recent-voucher">{item.voucherNo}</span>
                    <span className="recent-party">{item.partyName}</span>
                    <span className="recent-amount">{formatCurrency(item.amount)}</span>
                </div>
            ))}
            {(!items || items.length === 0) && <div className="no-data">No recent transactions</div>}
        </div>
    </div>
);

const JobCardWidget = ({ data, todayData }) => (
    <div className="jobcard-widget">
        <div className="widget-header">
            <FaClipboardList /> Job Cards
        </div>
        <div className="widget-stats">
            <div className="stat-item">
                <div className="stat-value">{data?.totalCount || 0}</div>
                <div className="stat-label">Total</div>
            </div>
            <div className="stat-item">
                <div className="stat-value pending">{data?.pending || 0}</div>
                <div className="stat-label">Pending</div>
            </div>
            <div className="stat-item">
                <div className="stat-value progress">{data?.inProgress || 0}</div>
                <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-item">
                <div className="stat-value completed">{data?.completed || 0}</div>
                <div className="stat-label">Completed</div>
            </div>
        </div>
        {todayData && (
            <div className="today-stats">
                <div className="today-label">Today's: {todayData.totalCount || 0} jobs</div>
            </div>
        )}
    </div>
);

const BookingWidget = ({ data, todayData }) => (
    <div className="booking-widget">
        <div className="widget-header">
            <FaCalendarAlt /> Bookings
        </div>
        <div className="widget-stats">
            <div className="stat-item">
                <div className="stat-value">{data?.totalCount || 0}</div>
                <div className="stat-label">Total</div>
            </div>
            <div className="stat-item">
                <div className="stat-value pending">{data?.pending || 0}</div>
                <div className="stat-label">Pending</div>
            </div>
            <div className="stat-item">
                <div className="stat-value confirmed">{data?.confirmed || 0}</div>
                <div className="stat-label">Confirmed</div>
            </div>
        </div>
        {todayData && (
            <div className="today-stats">
                <div className="today-label">Today's: {todayData.totalCount || 0} bookings</div>
            </div>
        )}
    </div>
);

// ==================== DYNAMIC WIDGET COMPONENTS ====================

// 1. SUMMARY CARD COMPONENT
const DynamicSummaryCard = ({ data, module, color, onRemove, isEditing }) => {
    const summary = data?.summary || {};
    const today = data?.today || {};

    const getMetrics = () => {
        switch (module) {
            case 'purchase':
            case 'sale':
                return ['totalAmount', 'cashAmount', 'creditAmount'];
            case 'payment':
            case 'receiving':
                return ['totalAmount', 'cashAmount', 'chequeAmount'];
            case 'jobcard':
                return ['totalCount', 'pending', 'inProgress', 'completed'];
            case 'booking':
                return ['totalCount', 'pending', 'confirmed'];
            default:
                return ['totalAmount', 'cashAmount', 'creditAmount'];
        }
    };

    const formatValue = (key, value) => {
        if (key === 'totalAmount' || key === 'cashAmount' || key === 'creditAmount' || key === 'chequeAmount') {
            return formatCurrency(value);
        }
        return formatNumber(value);
    };

    const formatLabel = (key) => {
        const labels = {
            totalAmount: 'Total', cashAmount: 'Cash', creditAmount: 'Credit',
            chequeAmount: 'Cheque', totalCount: 'Total', pending: 'Pending',
            inProgress: 'In Progress', completed: 'Completed', confirmed: 'Confirmed'
        };
        return labels[key] || key;
    };

    const metrics = getMetrics();

    return (
        <div className="dynamic-widget summary-card-widget" style={{ borderTopColor: color }}>
            {isEditing && <button className="widget-remove-btn" onClick={onRemove}>×</button>}
            <div className="widget-header">
                <span className="widget-title">{module?.charAt(0).toUpperCase() + module?.slice(1)} Summary</span>
            </div>
            <div className="widget-body">
                <div className="summary-section">
                    <div className="section-title">Overall</div>
                    <div className="metrics-grid">
                        {metrics.map(metric => (
                            <div key={metric} className="metric-item">
                                <div className="metric-value">{formatValue(metric, summary[metric])}</div>
                                <div className="metric-label">{formatLabel(metric)}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="summary-section">
                    <div className="section-title">Today's</div>
                    <div className="metrics-grid">
                        {metrics.map(metric => (
                            <div key={metric} className="metric-item">
                                <div className="metric-value">{formatValue(metric, today[metric])}</div>
                                <div className="metric-label">{formatLabel(metric)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 2. STATS CARD COMPONENT (Only KPIs)
const DynamicStatsCard = ({ data, module, color, onRemove, isEditing }) => {
    const summary = data?.summary || {};

    const getMetrics = () => {
        switch (module) {
            case 'purchase':
            case 'sale':
                return ['totalAmount', 'cashAmount', 'creditAmount'];
            case 'payment':
            case 'receiving':
                return ['totalAmount', 'cashAmount', 'chequeAmount'];
            case 'jobcard':
                return ['totalCount', 'pending', 'inProgress', 'completed'];
            case 'booking':
                return ['totalCount', 'pending', 'confirmed'];
            default:
                return ['totalAmount', 'cashAmount', 'creditAmount'];
        }
    };

    const formatValue = (key, value) => {
        if (key === 'totalAmount' || key === 'cashAmount' || key === 'creditAmount' || key === 'chequeAmount') {
            return formatCurrency(value);
        }
        return formatNumber(value);
    };

    const formatLabel = (key) => {
        const labels = {
            totalAmount: 'Total', cashAmount: 'Cash', creditAmount: 'Credit',
            chequeAmount: 'Cheque', totalCount: 'Total', pending: 'Pending',
            inProgress: 'In Progress', completed: 'Completed', confirmed: 'Confirmed'
        };
        return labels[key] || key;
    };

    const metrics = getMetrics();

    return (
        <div className="dynamic-widget stats-card-widget" style={{ borderTopColor: color }}>
            {isEditing && <button className="widget-remove-btn" onClick={onRemove}>×</button>}
            <div className="widget-header">
                <span className="widget-title">{module?.charAt(0).toUpperCase() + module?.slice(1)} Stats</span>
            </div>
            <div className="widget-body">
                <div className="stats-grid">
                    {metrics.map(metric => (
                        <div key={metric} className="stat-item">
                            <div className="stat-value">{formatValue(metric, summary[metric])}</div>
                            <div className="stat-label">{formatLabel(metric)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// 3. RECENT LIST COMPONENT
const DynamicRecentList = ({ data, module, color, onRemove, isEditing }) => {
    const recent = data?.recent || [];

    return (
        <div className="dynamic-widget list-widget" style={{ borderTopColor: color }}>
            {isEditing && <button className="widget-remove-btn" onClick={onRemove}>×</button>}
            <div className="widget-header">
                <span className="widget-title">Recent {module?.charAt(0).toUpperCase() + module?.slice(1)}</span>
            </div>
            <div className="widget-body">
                {recent.length === 0 ? (
                    <div className="no-data">No recent transactions</div>
                ) : (
                    recent.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="list-item">
                            <div className="list-voucher">{item.voucherNo}</div>
                            <div className="list-party">{item.partyName}</div>
                            <div className="list-amount">{formatCurrency(item.amount)}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// 4. BAR CHART COMPONENT
const DynamicBarChart = ({ data, module, color, onRemove, isEditing }) => {
    const trends = data?.monthlyTrends || [];
    const maxAmount = Math.max(...trends.map(t => t.amount), 1);

    return (
        <div className="dynamic-widget chart-widget" style={{ borderTopColor: color }}>
            {isEditing && <button className="widget-remove-btn" onClick={onRemove}>×</button>}
            <div className="widget-header">
                <span className="widget-title">{module?.charAt(0).toUpperCase() + module?.slice(1)} Trends</span>
            </div>
            <div className="widget-body">
                {trends.length === 0 ? (
                    <div className="no-data">No trend data available</div>
                ) : (
                    <div className="bar-chart-container">
                        {trends.map((trend, idx) => (
                            <div key={idx} className="bar-item">
                                <div className="bar-label">{trend.period}</div>
                                <div className="bar-wrapper">
                                    <div className="bar-fill" style={{ width: `${(trend.amount / maxAmount) * 100}%`, backgroundColor: color }}></div>
                                    <div className="bar-value">{formatCurrency(trend.amount)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// 5. PIE CHART COMPONENT - FIXED
const DynamicPieChart = ({ data, module, color, onRemove, isEditing }) => {
    const summary = data?.summary || {};

    // Get cash vs credit data
    const getDistributionData = () => {
        if (summary.cashAmount !== undefined && summary.creditAmount !== undefined) {
            return {
                cash: summary.cashAmount || 0,
                credit: summary.creditAmount || 0,
                type: 'amount'
            };
        }
        return { cash: 0, credit: 0, type: 'amount' };
    };

    const dist = getDistributionData();
    const total = dist.cash + dist.credit;
    const cashPercent = total > 0 ? (dist.cash / total) * 100 : 0;
    const creditPercent = total > 0 ? (dist.credit / total) * 100 : 0;

    const formatValue = (value) => {
        if (dist.type === 'amount') return formatCurrency(value);
        return formatNumber(value);
    };

    return (
        <div className="dynamic-widget pie-widget" style={{ borderTopColor: color }}>
            {isEditing && <button className="widget-remove-btn" onClick={onRemove}>×</button>}
            <div className="widget-header">
                <span className="widget-title">{module?.charAt(0).toUpperCase() + module?.slice(1)} Distribution</span>
            </div>
            <div className="widget-body">
                {total === 0 ? (
                    <div className="no-data">No distribution data available (No Cash/Credit transactions)</div>
                ) : (
                    <div className="pie-container">
                        <div className="pie-legend">
                            <div className="legend-item">
                                <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
                                <span className="legend-label">Cash</span>
                                <span className="legend-value">{formatValue(dist.cash)}</span>
                                <span className="legend-percent">({cashPercent.toFixed(1)}%)</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
                                <span className="legend-label">Credit</span>
                                <span className="legend-value">{formatValue(dist.credit)}</span>
                                <span className="legend-percent">({creditPercent.toFixed(1)}%)</span>
                            </div>
                        </div>
                        <div className="pie-visual">
                            <div className="pie-segment" style={{
                                background: `conic-gradient(#10b981 0deg ${cashPercent * 3.6}deg, #f59e0b ${cashPercent * 3.6}deg 360deg)`
                            }}></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ==================== GET WIDGET COMPONENT - FIXED with all types ====================
const getWidgetComponent = (type) => {
    switch (type) {
        case 'summary-card':
            return DynamicSummaryCard;
        case 'stats-card':
            return DynamicStatsCard;
        case 'list':
            return DynamicRecentList;
        case 'bar-chart':
            return DynamicBarChart;
        case 'pie-chart':
            return DynamicPieChart;
        default:
            return DynamicSummaryCard;
    }
};

// Module API mapping
const MODULES_API = {
    purchase: { api: 'getPurchaseSummary' },
    sale: { api: 'getSaleSummary' },
    payment: { api: 'getPaymentSummary' },
    receiving: { api: 'getReceivingSummary' },
    jobcard: { api: 'getJobCardSummary' },
    booking: { api: 'getBookingSummary' }
};

export default function DashboardPage() {
    const { state: authState } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        purchase: null, sale: null, payment: null, receiving: null,
        jobCard: null, booking: null, technician: null
    });
    const [error, setError] = useState(null);

    // Section collapse states - default all collapsed (false)
    const [sections, setSections] = useState({
        financial: false,
        workshop: false,
        recent: false,
        trends: false,
        technician: false,
        custom: false
    });

    // Dynamic widgets states
    const [showDynamicBuilder, setShowDynamicBuilder] = useState(false);
    const [dynamicWidgets, setDynamicWidgets] = useState({});
    const [dynamicWidgetData, setDynamicWidgetData] = useState({});

    const { showSuccess, showError } = useDialog();

    // Load section states from localStorage
    useEffect(() => {
        const savedSections = localStorage.getItem('dashboard_sections_state');
        if (savedSections) {
            try {
                const parsed = JSON.parse(savedSections);
                setSections(prev => ({ ...prev, ...parsed }));
            } catch (e) { }
        }
    }, []);

    // Save section state to localStorage
    const toggleSection = (section) => {
        setSections(prev => {
            const newState = { ...prev, [section]: !prev[section] };
            localStorage.setItem('dashboard_sections_state', JSON.stringify(newState));
            return newState;
        });
    };

    // Load dynamic widgets from localStorage
    useEffect(() => {
        const savedDynamic = localStorage.getItem('dashboard_dynamic_widgets');
        if (savedDynamic) {
            try { setDynamicWidgets(JSON.parse(savedDynamic)); } catch (e) { }
        }
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Load dashboard data
    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            setError(null);
            try {
                const branch = authState.selectedBranch;

                const [purchase, sale, payment, receiving, jobCard, booking, technician] = await Promise.all([
                    dashboardApi.getPurchaseSummary(branch),
                    dashboardApi.getSaleSummary(branch),
                    dashboardApi.getPaymentSummary(branch),
                    dashboardApi.getReceivingSummary(branch),
                    dashboardApi.getJobCardSummary(branch),
                    dashboardApi.getBookingSummary(branch),
                    dashboardApi.getTechnicianWorkload(branch)
                ]);

                setDashboardData({
                    purchase: purchase.data?.data,
                    sale: sale.data?.data,
                    payment: payment.data?.data,
                    receiving: receiving.data?.data,
                    jobCard: jobCard.data?.data,
                    booking: booking.data?.data,
                    technician: technician.data?.data
                });
            } catch (err) {
                console.error('Dashboard loading error:', err);
                setError('Failed to load dashboard data');
                showError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, [authState.selectedBranch, showError]);

    // Fetch data for dynamic widgets
    useEffect(() => {
        const fetchDynamicData = async () => {
            const widgets = Object.values(dynamicWidgets);
            if (widgets.length === 0) return;

            const newData = {};
            for (const widget of widgets) {
                const moduleConfig = MODULES_API[widget.module];
                if (moduleConfig && dashboardApi[moduleConfig.api]) {
                    try {
                        const response = await dashboardApi[moduleConfig.api](authState.selectedBranch);
                        newData[widget.id] = response.data?.data;
                    } catch (e) {
                        console.error('Error fetching dynamic widget data:', e);
                    }
                }
            }
            setDynamicWidgetData(newData);
        };

        fetchDynamicData();
    }, [dynamicWidgets, authState.selectedBranch]);

    const addDynamicWidget = (widget) => {
        const newDynamicWidgets = { ...dynamicWidgets, [widget.id]: widget };
        setDynamicWidgets(newDynamicWidgets);
        localStorage.setItem('dashboard_dynamic_widgets', JSON.stringify(newDynamicWidgets));
        setShowDynamicBuilder(false);
        showSuccess(`${widget.name} added to dashboard`);

        if (!sections.custom) {
            toggleSection('custom');
        }
    };

    const removeDynamicWidget = (widgetId) => {
        const newDynamicWidgets = { ...dynamicWidgets };
        delete newDynamicWidgets[widgetId];
        setDynamicWidgets(newDynamicWidgets);
        localStorage.setItem('dashboard_dynamic_widgets', JSON.stringify(newDynamicWidgets));
        showSuccess('Widget removed');
    };

    const renderDynamicWidget = (widget) => {
        const WidgetComponent = getWidgetComponent(widget.type);
        return (
            <WidgetComponent
                key={widget.id}
                data={dynamicWidgetData[widget.id]}
                module={widget.module}
                color={widget.config?.color || '#3b82f6'}
                onRemove={() => removeDynamicWidget(widget.id)}
                isEditing={isEditing}
            />
        );
    };

    const userName = authState.user?.fullName || authState.user?.username || 'User';
    const shortName = userName.split(' ')[0];

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <p>{error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <PageHeader
                
                actions={
                    <div className="header-actions">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditing(!isEditing)}
                            icon={isEditing ? <FaSave /> : <FaEdit />}
                        >
                            {isEditing ? 'Done' : 'Customize'}
                        </Button>
                        <Button
                            variant="info"
                            onClick={() => setShowDynamicBuilder(true)}
                            icon={<FaPlusCircle />}
                        >
                            Add Widget
                        </Button>
                    </div>
                }
            />

            {/* Dynamic Widget Builder Modal */}
            {showDynamicBuilder && (
                <DynamicWidgetBuilder
                    onClose={() => setShowDynamicBuilder(false)}
                    onSave={addDynamicWidget}
                />
            )}

            {/* Financial Section - Collapsible */}
            <div className="dashboard-section">
                <div className="section-header collapsible" onClick={() => toggleSection('financial')}>
                    <div className="section-header-left">
                        <FaWallet className="section-icon" />
                        <h2>Financial Overview</h2>
                    </div>
                    <button className="section-toggle">
                        {sections.financial ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                </div>
                {sections.financial && (
                    <div className="dashboard-grid">
                        <SummaryCard title="Purchase" data={dashboardData.purchase?.summary} todayData={dashboardData.purchase?.today} color="#3b82f6" />
                        <SummaryCard title="Sale" data={dashboardData.sale?.summary} todayData={dashboardData.sale?.today} color="#10b981" />
                        <SummaryCard title="Payment" data={dashboardData.payment?.summary} todayData={dashboardData.payment?.today} color="#8b5cf6" />
                        <SummaryCard title="Receiving" data={dashboardData.receiving?.summary} todayData={dashboardData.receiving?.today} color="#06b6d4" />
                    </div>
                )}
            </div>

            {/* Workshop Section - Collapsible */}
            <div className="dashboard-section">
                <div className="section-header collapsible" onClick={() => toggleSection('workshop')}>
                    <div className="section-header-left">
                        <FaWrench className="section-icon" />
                        <h2>Workshop Overview</h2>
                    </div>
                    <button className="section-toggle">
                        {sections.workshop ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                </div>
                {sections.workshop && (
                    <div className="dashboard-grid">
                        <JobCardWidget data={dashboardData.jobCard?.summary} todayData={dashboardData.jobCard?.today} />
                        <BookingWidget data={dashboardData.booking?.summary} todayData={dashboardData.booking?.today} />
                    </div>
                )}
            </div>

            {/* Recent Transactions Section - Collapsible */}
            <div className="dashboard-section">
                <div className="section-header collapsible" onClick={() => toggleSection('recent')}>
                    <div className="section-header-left">
                        <FaList className="section-icon" />
                        <h2>Recent Activity</h2>
                    </div>
                    <button className="section-toggle">
                        {sections.recent ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                </div>
                {sections.recent && (
                    <div className="dashboard-grid two-columns">
                        <RecentList title="Purchases" items={dashboardData.purchase?.recent} color="#3b82f6" />
                        <RecentList title="Sales" items={dashboardData.sale?.recent} color="#10b981" />
                    </div>
                )}
            </div>

            {/* Monthly Trends Section - Collapsible */}
            {(dashboardData.purchase?.monthlyTrends?.length > 0 || dashboardData.sale?.monthlyTrends?.length > 0) && (
                <div className="dashboard-section">
                    <div className="section-header collapsible" onClick={() => toggleSection('trends')}>
                        <div className="section-header-left">
                            <FaChartBar className="section-icon" />
                            <h2>Monthly Trends</h2>
                        </div>
                        <button className="section-toggle">
                            {sections.trends ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                    </div>
                    {sections.trends && (
                        <div className="trends-container">
                            <div className="trend-chart">
                                <h4>Purchase Trends</h4>
                                <div className="bar-chart">
                                    {dashboardData.purchase?.monthlyTrends?.map((trend, idx) => (
                                        <div key={idx} className="bar-item">
                                            <div className="bar-label">{trend.period}</div>
                                            <div className="bar-container">
                                                <div className="bar" style={{ width: `${Math.min(100, (trend.amount / 1000000) * 100)}%`, backgroundColor: '#3b82f6' }}></div>
                                                <div className="bar-value">{formatCurrency(trend.amount)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="trend-chart">
                                <h4>Sale Trends</h4>
                                <div className="bar-chart">
                                    {dashboardData.sale?.monthlyTrends?.map((trend, idx) => (
                                        <div key={idx} className="bar-item">
                                            <div className="bar-label">{trend.period}</div>
                                            <div className="bar-container">
                                                <div className="bar" style={{ width: `${Math.min(100, (trend.amount / 1000000) * 100)}%`, backgroundColor: '#10b981' }}></div>
                                                <div className="bar-value">{formatCurrency(trend.amount)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Technician Workload Section - Collapsible */}
            {dashboardData.technician && dashboardData.technician.length > 0 && (
                <div className="dashboard-section">
                    <div className="section-header collapsible" onClick={() => toggleSection('technician')}>
                        <div className="section-header-left">
                            <FaUsers className="section-icon" />
                            <h2>Technician Workload</h2>
                        </div>
                        <button className="section-toggle">
                            {sections.technician ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                    </div>
                    {sections.technician && (
                        <div className="technician-grid">
                            {dashboardData.technician?.slice(0, 6).map((tech, idx) => (
                                <div key={idx} className="technician-card">
                                    <div className="tech-name">{tech.technicianName}</div>
                                    <div className="tech-stats">
                                        <span>Active Jobs: {tech.activeJobs}</span>
                                        <span>Capacity: {tech.dailyCapacity}/day</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${tech.workloadPercentage}%`, backgroundColor: tech.workloadPercentage > 80 ? '#ef4444' : tech.workloadPercentage > 50 ? '#f59e0b' : '#10b981' }}></div>
                                    </div>
                                    <div className="workload-percent">{tech.workloadPercentage}% Workload</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Custom Widgets Section - Collapsible */}
            {Object.keys(dynamicWidgets).length > 0 && (
                <div className="dashboard-section">
                    <div className="section-header collapsible" onClick={() => toggleSection('custom')}>
                        <div className="section-header-left">
                            <FaCog className="section-icon" />
                            <h2>Custom Widgets</h2>
                            {isEditing && <span className="edit-badge">Edit Mode</span>}
                        </div>
                        <button className="section-toggle">
                            {sections.custom ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                    </div>
                    {sections.custom && (
                        <div className="dashboard-grid">
                            {Object.values(dynamicWidgets).map(widget => renderDynamicWidget(widget))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}