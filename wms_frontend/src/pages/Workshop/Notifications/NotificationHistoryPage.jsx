import React, { useEffect, useState } from "react";
import notificationApi from "../../../api/notificationApi";
import { FaHistory, FaEnvelope, FaPhone, FaWhatsapp } from "react-icons/fa";
import { Button, useDialog } from "../../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../../components/features";
import "./Notifications.css";

export default function NotificationHistoryPage() {
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({ status: "", fromDate: "", toDate: "" });
    const { showError } = useDialog();

    const loadHistory = async () => {
        setLoading(true);
        try {
            const res = await notificationApi.getAll(filters.status, filters.fromDate, filters.toDate);
            let data = res.data?.data || res.data || [];
            setNotifications(data);
            setFilteredNotifications(data);
        } catch (error) { showError("Failed to load history"); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadHistory(); }, [filters.status, filters.fromDate, filters.toDate]);

    const applyFilters = () => {
        let filtered = [...notifications];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(n => n.customerName?.toLowerCase().includes(term) || n.notificationNo?.toLowerCase().includes(term));
        }
        setFilteredNotifications(filtered); setShowList(true);
    };

    const resetFilters = () => { setFilters({ status: "", fromDate: "", toDate: "" }); setSearchTerm(""); setFilteredNotifications(notifications); setShowList(false); setShowFilters(false); };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return '⏳'; case 'SENT': return '📤'; case 'DELIVERED': return '✅'; case 'READ': return '👁️'; case 'FAILED': return '❌';
            default: return '📨';
        }
    };

    const filterComponents = (
        <>
            <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))} className="filter-select">
                <option value="">All Status</option>
                <option value="PENDING">Pending</option><option value="SENT">Sent</option><option value="DELIVERED">Delivered</option><option value="READ">Read</option><option value="FAILED">Failed</option>
            </select>
            <input type="date" value={filters.fromDate} onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))} className="filter-input" placeholder="From Date" />
            <input type="date" value={filters.toDate} onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))} className="filter-input" placeholder="To Date" />
            <div className="filter-buttons"><Button variant="primary" size="sm" onClick={applyFilters}>Apply Filters</Button></div>
        </>
    );

    const renderCardView = () => (
        <div className="history-cards-grid">
            {filteredNotifications.map(n => (
                <div key={n.notificationID} className={`history-card ${expandedId === n.notificationID ? 'expanded' : ''}`}>
                    <div className="history-card-header" onClick={() => setExpandedId(expandedId === n.notificationID ? null : n.notificationID)}>
                        <div className="history-icon">{getStatusIcon(n.status)}</div>
                        <div className="history-info">
                            <h4>{n.notificationNo} - {n.notificationType}</h4>
                            <span>{n.customerName} | {n.sentVia} | {new Date(n.sentDate).toLocaleString()}</span>
                        </div>
                        <span className={`history-status ${n.status?.toLowerCase()}`}>{n.status}</span>
                        <button className="expand-btn">{expandedId === n.notificationID ? '▲' : '▼'}</button>
                    </div>
                    {expandedId === n.notificationID && (
                        <div className="history-card-expanded">
                            <div className="detail-row"><strong>Recipient:</strong> {n.recipient}</div>
                            <div className="detail-row"><strong>Subject:</strong> {n.messageSubject || '-'}</div>
                            <div className="detail-row"><strong>Message:</strong> <div className="message-full">{n.messageContent}</div></div>
                            {n.errorMessage && <div className="detail-row error"><strong>Error:</strong> {n.errorMessage}</div>}
                            <div className="detail-row"><strong>Retry Count:</strong> {n.retryCount}</div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="notification-page-premium">
            <PageHeader title="Notification History" icon={<FaHistory />} />
            <SearchFilterBar searchValue={searchTerm} onSearchChange={setSearchTerm} searchPlaceholder="Search by customer or notification #..." onRefresh={loadHistory} showList={showList} onToggleList={() => setShowList(!showList)} onToggleFilters={() => setShowFilters(!showFilters)} showFilters={showFilters} hasActiveFilters={filters.status || filters.fromDate || filters.toDate} onClearFilters={resetFilters} onSearchSubmit={applyFilters} loading={loading} filterComponents={filterComponents} />
            {loading && (<div className="loading-container"><div className="spinner"></div><p>Loading history...</p></div>)}
            {!loading && showList && (filteredNotifications.length > 0 ? renderCardView() : <EmptyState icon={<FaHistory />} title="No notifications found" description="Try adjusting your filters" action={<Button variant="primary" onClick={resetFilters}>Clear Filters</Button>} />)}
        </div>
    );
}