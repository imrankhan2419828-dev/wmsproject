// src/components/features/DashboardWidget/DynamicWidgetBuilder.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../../common';
import axiosClient from '../../../api/axiosClient';
import {
    FaChartLine, FaChartBar, FaChartPie, FaList, FaTable,
    FaShoppingCart, FaMoneyBillWave, FaCreditCard, FaExchangeAlt,
    FaClipboardList, FaCalendarAlt, FaWrench, FaArrowRight,
    FaCheck, FaDatabase, FaEye, FaChartArea, FaCog
} from 'react-icons/fa';
import './DynamicWidgetBuilder.css';

// ==================== MODULES CONFIGURATION ====================
const MODULES = {
    purchase: {
        name: 'Purchase',
        icon: <FaShoppingCart />,
        color: '#3b82f6',
        api: '/Dashboard/financial/purchase-summary',
        metrics: {
            summary: ['totalAmount', 'cashAmount', 'creditAmount'],
            today: ['totalAmount', 'cashAmount', 'creditAmount']
        }
    },
    purchaseReturn: {
        name: 'Purchase Return',
        icon: <FaExchangeAlt />,
        color: '#ef4444',
        api: '/Dashboard/financial/purchase-return-summary',
        metrics: {
            summary: ['totalAmount'],
            today: ['totalAmount']
        }
    },
    sale: {
        name: 'Sale',
        icon: <FaMoneyBillWave />,
        color: '#10b981',
        api: '/Dashboard/financial/sale-summary',
        metrics: {
            summary: ['totalAmount', 'cashAmount', 'creditAmount'],
            today: ['totalAmount', 'cashAmount', 'creditAmount']
        }
    },
    saleReturn: {
        name: 'Sale Return',
        icon: <FaExchangeAlt />,
        color: '#f59e0b',
        api: '/Dashboard/financial/sale-return-summary',
        metrics: {
            summary: ['totalAmount'],
            today: ['totalAmount']
        }
    },
    payment: {
        name: 'Payment',
        icon: <FaCreditCard />,
        color: '#8b5cf6',
        api: '/Dashboard/financial/payment-summary',
        metrics: {
            summary: ['totalAmount', 'cashAmount', 'chequeAmount'],
            today: ['totalAmount', 'cashAmount', 'chequeAmount']
        }
    },
    receiving: {
        name: 'Receiving',
        icon: <FaMoneyBillWave />,
        color: '#06b6d4',
        api: '/Dashboard/financial/receiving-summary',
        metrics: {
            summary: ['totalAmount', 'cashAmount', 'chequeAmount'],
            today: ['totalAmount', 'cashAmount', 'chequeAmount']
        }
    },
    jobcard: {
        name: 'Job Cards',
        icon: <FaClipboardList />,
        color: '#ec4899',
        api: '/Dashboard/workshop/jobcard-summary',
        metrics: {
            summary: ['totalCount', 'pending', 'inProgress', 'completed'],
            today: ['totalCount', 'pending', 'inProgress', 'completed']
        }
    },
    booking: {
        name: 'Bookings',
        icon: <FaCalendarAlt />,
        color: '#14b8a6',
        api: '/Dashboard/workshop/booking-summary',
        metrics: {
            summary: ['totalCount', 'pending', 'confirmed'],
            today: ['totalCount', 'pending', 'confirmed']
        }
    }
};

// ==================== WIDGET TYPES ====================
const WIDGET_TYPES = [
    {
        value: 'summary-card',
        label: 'Summary Card',
        icon: <FaChartLine />,
        description: 'Show overall + today\'s summary'
    },
    {
        value: 'stats-card',
        label: 'Stats Card',
        icon: <FaDatabase />,
        description: 'Show key metrics only'
    },
    {
        value: 'list',
        label: 'Recent List',
        icon: <FaList />,
        description: 'Show recent transactions'
    },
    {
        value: 'bar-chart',
        label: 'Bar Chart',
        icon: <FaChartBar />,
        description: 'Monthly trends comparison'
    },
    {
        value: 'pie-chart',
        label: 'Pie Chart',
        icon: <FaChartPie />,
        description: 'Distribution (Cash vs Credit)'
    }
];

// ==================== HELPER FUNCTIONS ====================
const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'Rs. 0';
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount);
};

const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return num.toLocaleString();
};

const formatLabel = (key) => {
    const labels = {
        totalAmount: 'Total', cashAmount: 'Cash', creditAmount: 'Credit',
        chequeAmount: 'Cheque', totalCount: 'Total', pending: 'Pending',
        inProgress: 'In Progress', completed: 'Completed', confirmed: 'Confirmed'
    };
    return labels[key] || key;
};

// ==================== WIDGET RENDERERS ====================

// 1. SUMMARY CARD - Overall + Today's data
const SummaryCard = ({ data, module, color }) => {
    const summary = data?.summary || {};
    const today = data?.today || {};
    const moduleConfig = MODULES[module];
    const metrics = moduleConfig?.metrics.summary || [];
    const todayMetrics = moduleConfig?.metrics.today || [];

    const formatValue = (key, value) => {
        if (key.includes('Amount') || key.includes('total')) return formatCurrency(value);
        return formatNumber(value);
    };

    return (
        <div className="preview-widget summary-card-widget" style={{ borderTopColor: color }}>
            <div className="widget-header">
                <span className="widget-icon" style={{ color }}>{moduleConfig?.icon}</span>
                <span className="widget-title">{moduleConfig?.name} Summary</span>
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
                {todayMetrics.length > 0 && (
                    <div className="summary-section">
                        <div className="section-title">Today's</div>
                        <div className="metrics-grid">
                            {todayMetrics.map(metric => (
                                <div key={metric} className="metric-item">
                                    <div className="metric-value">{formatValue(metric, today[metric])}</div>
                                    <div className="metric-label">{formatLabel(metric)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// 2. STATS CARD - Only KPIs (no today's data)
const StatsCard = ({ data, module, color }) => {
    const summary = data?.summary || {};
    const moduleConfig = MODULES[module];
    const metrics = moduleConfig?.metrics.summary || [];

    const formatValue = (key, value) => {
        if (key.includes('Amount') || key.includes('total')) return formatCurrency(value);
        return formatNumber(value);
    };

    return (
        <div className="preview-widget stats-card-widget" style={{ borderTopColor: color }}>
            <div className="widget-header">
                <span className="widget-icon" style={{ color }}>{moduleConfig?.icon}</span>
                <span className="widget-title">{moduleConfig?.name} Stats</span>
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

// 3. RECENT LIST - Show recent transactions
const RecentList = ({ data, module, color }) => {
    const recent = data?.recent || [];
    const moduleConfig = MODULES[module];

    return (
        <div className="preview-widget list-widget" style={{ borderTopColor: color }}>
            <div className="widget-header">
                <span className="widget-icon" style={{ color }}>{moduleConfig?.icon}</span>
                <span className="widget-title">Recent {moduleConfig?.name}</span>
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

// 4. BAR CHART - Monthly trends
const BarChart = ({ data, module, color }) => {
    const trends = data?.monthlyTrends || [];
    const moduleConfig = MODULES[module];
    const maxAmount = Math.max(...trends.map(t => t.amount), 1);

    return (
        <div className="preview-widget chart-widget" style={{ borderTopColor: color }}>
            <div className="widget-header">
                <span className="widget-icon" style={{ color }}>{moduleConfig?.icon}</span>
                <span className="widget-title">{moduleConfig?.name} Trends</span>
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

// 5. PIE CHART - Cash vs Credit distribution
const PieChart = ({ data, module, color }) => {
    const summary = data?.summary || {};
    const moduleConfig = MODULES[module];

    // Get cash vs credit data (works for both Amount and Count metrics)
    const getDistributionData = () => {
        if (summary.cashAmount !== undefined && summary.creditAmount !== undefined) {
            return {
                cash: summary.cashAmount || 0,
                credit: summary.creditAmount || 0,
                type: 'amount'
            };
        }
        if (summary.cashCount !== undefined && summary.creditCount !== undefined) {
            return {
                cash: summary.cashCount || 0,
                credit: summary.creditCount || 0,
                type: 'count'
            };
        }
        return { cash: 0, credit: 0, type: 'amount' };
    };

    const dist = getDistributionData();
    const total = dist.cash + dist.credit;
    const cashPercent = total > 0 ? (dist.cash / total) * 100 : 0;
    const creditPercent = total > 0 ? (dist.credit / total) * 100 : 0;

    const formatDistributionValue = (value) => {
        if (dist.type === 'amount') return formatCurrency(value);
        return formatNumber(value);
    };

    return (
        <div className="preview-widget pie-widget" style={{ borderTopColor: color }}>
            <div className="widget-header">
                <span className="widget-icon" style={{ color }}>{moduleConfig?.icon}</span>
                <span className="widget-title">{moduleConfig?.name} Distribution</span>
            </div>
            <div className="widget-body">
                {total === 0 ? (
                    <div className="no-data">No distribution data available</div>
                ) : (
                    <div className="pie-container">
                        <div className="pie-legend">
                            <div className="legend-item">
                                <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
                                <span className="legend-label">Cash</span>
                                <span className="legend-value">{formatDistributionValue(dist.cash)}</span>
                                <span className="legend-percent">({cashPercent.toFixed(1)}%)</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
                                <span className="legend-label">Credit</span>
                                <span className="legend-value">{formatDistributionValue(dist.credit)}</span>
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

// Get widget component by type
const getWidgetComponent = (type) => {
    switch (type) {
        case 'summary-card': return SummaryCard;
        case 'stats-card': return StatsCard;
        case 'list': return RecentList;
        case 'bar-chart': return BarChart;
        case 'pie-chart': return PieChart;
        default: return SummaryCard;
    }
};

// ==================== MAIN BUILDER COMPONENT ====================
export default function DynamicWidgetBuilder({ onClose, onSave }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [widgetConfig, setWidgetConfig] = useState({
        id: `widget_${Date.now()}`,
        name: '',
        module: '',
        type: 'summary-card',
        color: '#3b82f6'
    });

    useEffect(() => {
        if (widgetConfig.module) {
            fetchPreviewData();
        }
    }, [widgetConfig.module]);

    const fetchPreviewData = async () => {
        const module = MODULES[widgetConfig.module];
        if (!module) return;

        setLoading(true);
        try {
            const response = await axiosClient.get(module.api);
            setPreviewData(response.data?.data);
        } catch (error) {
            console.error('Error fetching preview:', error);
            setPreviewData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (!widgetConfig.name || !widgetConfig.module || !widgetConfig.type) {
            alert('Please complete all fields');
            return;
        }

        const newWidget = {
            id: widgetConfig.id,
            name: widgetConfig.name,
            type: widgetConfig.type,
            module: widgetConfig.module,
            config: { ...widgetConfig },
            icon: MODULES[widgetConfig.module]?.icon,
            isDynamic: true,
            createdAt: new Date().toISOString()
        };

        onSave(newWidget);
    };

    const canProceed = () => {
        if (step === 1) return widgetConfig.name && widgetConfig.type;
        if (step === 2) return widgetConfig.module;
        return true;
    };

    const WidgetPreview = getWidgetComponent(widgetConfig.type);

    const modalFooter = (
        <div className="builder-footer">
            {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}>← Back</Button>}
            <div style={{ flex: 1 }} />
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            {step < 3 ? (
                <Button variant="primary" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                    Next <FaArrowRight />
                </Button>
            ) : (
                <Button variant="success" onClick={handleSave}>
                    <FaCheck /> Create Widget
                </Button>
            )}
        </div>
    );

    return (
        <Modal isOpen={true} onClose={onClose} title="✨ Create Dynamic Widget" size="xl" footer={modalFooter}>
            <div className="dynamic-widget-builder">
                {/* Step 1: Widget Type & Name */}
                {step === 1 && (
                    <div className="builder-step">
                        <h3>Widget Name</h3>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., Sales Dashboard, Purchase Summary"
                            value={widgetConfig.name}
                            onChange={(e) => setWidgetConfig({ ...widgetConfig, name: e.target.value })}
                            autoFocus
                        />

                        <h3 style={{ marginTop: 24 }}>Select Widget Type</h3>
                        <div className="widget-types-grid">
                            {WIDGET_TYPES.map(type => (
                                <div
                                    key={type.value}
                                    className={`type-card ${widgetConfig.type === type.value ? 'selected' : ''}`}
                                    onClick={() => setWidgetConfig({ ...widgetConfig, type: type.value })}
                                >
                                    <div className="type-icon" style={{ color: widgetConfig.type === type.value ? widgetConfig.color : '#6b7280' }}>
                                        {type.icon}
                                    </div>
                                    <div className="type-name">{type.label}</div>
                                    <div className="type-desc">{type.description}</div>
                                </div>
                            ))}
                        </div>

                        <h3 style={{ marginTop: 24 }}>Theme Color</h3>
                        <div className="color-options">
                            {['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'].map(c => (
                                <div
                                    key={c}
                                    className={`color-option ${widgetConfig.color === c ? 'selected' : ''}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setWidgetConfig({ ...widgetConfig, color: c })}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Select Module */}
                {step === 2 && (
                    <div className="builder-step">
                        <h3>Select Data Source</h3>
                        <div className="modules-grid">
                            {Object.entries(MODULES).map(([key, module]) => (
                                <div
                                    key={key}
                                    className={`module-card ${widgetConfig.module === key ? 'selected' : ''}`}
                                    onClick={() => setWidgetConfig({ ...widgetConfig, module: key, color: module.color })}
                                >
                                    <div className="module-icon" style={{ backgroundColor: `${module.color}15`, color: module.color }}>
                                        {module.icon}
                                    </div>
                                    <div className="module-name">{module.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Preview & Create */}
                {step === 3 && (
                    <div className="builder-step">
                        <h3>Preview Your Widget</h3>
                        <div className="preview-container">
                            {loading ? (
                                <div className="preview-loading">Loading preview data...</div>
                            ) : previewData ? (
                                <WidgetPreview
                                    data={previewData}
                                    module={widgetConfig.module}
                                    color={widgetConfig.color}
                                />
                            ) : (
                                <div className="preview-error">No data available for preview</div>
                            )}
                        </div>
                        <div className="preview-info">
                            <div className="info-row">
                                <span className="info-label">Module:</span>
                                <span className="info-value">{MODULES[widgetConfig.module]?.name}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Type:</span>
                                <span className="info-value">{WIDGET_TYPES.find(t => t.value === widgetConfig.type)?.label}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}