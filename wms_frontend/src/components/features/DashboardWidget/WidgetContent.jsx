// src/components/features/DashboardWidget/WidgetContent.jsx
import React from 'react';
import { formatAmount, formatNumber } from '../../../utils/numberUtils';
import './WidgetContent.css';

const WidgetContent = ({ widgetId, data, isLoading, expanded = false }) => {
    if (isLoading) {
        return (
            <div className="widget-loading">
                <div className="widget-spinner"></div>
                <span>Loading...</span>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="widget-error">
                <span>⚠️</span>
                <span>No data available</span>
            </div>
        );
    }

    // Render different widget types based on widgetId
    switch (widgetId) {
        // ========== Financial Stat Cards ==========
        case 'purchaseSummary':
            return (
                <div className="widget-stat-card">
                    <div className="stat-row">
                        <span className="stat-label">Total Purchase</span>
                        <span className="stat-value">{formatAmount(data.totalAmount)}</span>
                    </div>
                    <div className="stat-row-small">
                        <span>Cash: {formatAmount(data.cashAmount)}</span>
                        <span>Credit: {formatAmount(data.creditAmount)}</span>
                    </div>
                    <div className="stat-row-small">
                        <span>Invoices: {data.totalCount}</span>
                        <span>Cash: {data.cashCount} | Credit: {data.creditCount}</span>
                    </div>
                </div>
            );

        case 'saleSummary':
            return (
                <div className="widget-stat-card">
                    <div className="stat-row">
                        <span className="stat-label">Total Sale</span>
                        <span className="stat-value">{formatAmount(data.totalAmount)}</span>
                    </div>
                    <div className="stat-row-small">
                        <span>Cash: {formatAmount(data.cashAmount)}</span>
                        <span>Credit: {formatAmount(data.creditAmount)}</span>
                    </div>
                    <div className="stat-row-small">
                        <span>Invoices: {data.totalCount}</span>
                        <span>Cash: {data.cashCount} | Credit: {data.creditCount}</span>
                    </div>
                </div>
            );

        case 'paymentSummary':
            return (
                <div className="widget-stat-card">
                    <div className="stat-row">
                        <span className="stat-label">Total Payments</span>
                        <span className="stat-value">{formatAmount(data.totalAmount)}</span>
                    </div>
                    <div className="stat-row-small">
                        <span>Cash: {formatAmount(data.cashAmount)}</span>
                        <span>Cheque: {formatAmount(data.chequeAmount)}</span>
                    </div>
                    <div className="stat-row-small">
                        <span>Supplier: {formatAmount(data.supplierAmount)}</span>
                        <span>Bank: {formatAmount(data.bankAmount)}</span>
                        <span>Expense: {formatAmount(data.expenseAmount)}</span>
                    </div>
                </div>
            );

        case 'receivingSummary':
            return (
                <div className="widget-stat-card">
                    <div className="stat-row">
                        <span className="stat-label">Total Receivings</span>
                        <span className="stat-value">{formatAmount(data.totalAmount)}</span>
                    </div>
                    <div className="stat-row-small">
                        <span>Cash: {formatAmount(data.cashAmount)}</span>
                        <span>Cheque: {formatAmount(data.chequeAmount)}</span>
                    </div>
                    <div className="stat-row-small">
                        <span>Transactions: {data.totalCount}</span>
                    </div>
                </div>
            );

        // ========== Workshop Stat Cards ==========
        case 'jobCardSummary':
            return (
                <div className="widget-stat-card">
                    <div className="stat-row">
                        <span className="stat-label">Job Cards</span>
                        <span className="stat-value">{data.total}</span>
                    </div>
                    <div className="stat-row-small">
                        <span>Pending: {data.pending}</span>
                        <span>In Progress: {data.inProgress}</span>
                    </div>
                    <div className="stat-row-small">
                        <span>Completed: {data.completed}</span>
                        <span>Delivered: {data.delivered}</span>
                    </div>
                </div>
            );

        case 'bookingSummary':
            return (
                <div className="widget-stat-card">
                    <div className="stat-row">
                        <span className="stat-label">Bookings</span>
                        <span className="stat-value">{data.total}</span>
                    </div>
                    <div className="stat-row-small">
                        <span>Pending: {data.pending}</span>
                        <span>Confirmed: {data.confirmed}</span>
                    </div>
                    <div className="stat-row-small">
                        <span>In Progress: {data.inProgress}</span>
                        <span>Completed: {data.completed}</span>
                    </div>
                </div>
            );

        case 'technicianWorkload':
            return (
                <div className="widget-list">
                    {data.slice(0, expanded ? data.length : 5).map((tech, idx) => (
                        <div key={idx} className="list-item">
                            <div className="list-item-info">
                                <span className="list-item-title">{tech.technicianName}</span>
                                <span className="list-item-sub">Active Jobs: {tech.activeJobs}/{tech.dailyCapacity}</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${tech.workloadPercentage}%` }}></div>
                            </div>
                        </div>
                    ))}
                    {!expanded && data.length > 5 && (
                        <div className="list-more">+{data.length - 5} more technicians</div>
                    )}
                </div>
            );

        default:
            return (
                <div className="widget-default">
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            );
    }
};

export default WidgetContent;