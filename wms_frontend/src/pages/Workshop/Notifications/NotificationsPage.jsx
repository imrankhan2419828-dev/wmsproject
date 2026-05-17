import React, { useEffect, useState } from "react";
import notificationApi from "../../../api/notificationApi";
import { FaBell, FaSync, FaEnvelope, FaPhone, FaWhatsapp } from "react-icons/fa";
import { Button, useDialog } from "../../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../../components/features";
import "./Notifications.css";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({ status: "", fromDate: "", toDate: "" });
    const { showConfirm, showSuccess, showError } = useDialog();

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await notificationApi.getAll(filters.status, filters.fromDate, filters.toDate);
            let data = res.data?.data || res.data || [];
            setNotifications(data);
            setFilteredNotifications(data);
        } catch (error) { showError(error.response?.data?.message || "Failed to load notifications"); }
        finally { setLoading(false); }
    };

    const loadStats = async () => {
        try {
            const res = await notificationApi.getStats(filters.fromDate, filters.toDate);
            setStats(res.data?.data || res.data);
        } catch (error) { console.error("Error loading stats:", error); }
    };

    useEffect(() => { loadNotifications(); loadStats(); }, [filters.status, filters.fromDate, filters.toDate]);

    const applyFilters = () => {
        let filtered = [...notifications];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(n => n.customerName?.toLowerCase().includes(term) || n.vehicleRegNo?.toLowerCase().includes(term));
        }
        setFilteredNotifications(filtered); setShowList(true);
    };

    const resetFilters = () => { setFilters({ status: "", fromDate: "", toDate: "" }); setSearchTerm(""); setFilteredNotifications(notifications); setShowList(false); setShowFilters(false); };

    const handleProcessPending = async () => {
        try { await notificationApi.processPending(); showSuccess("Pending notifications processed"); loadNotifications(); loadStats(); }
        catch (error) { showError("Failed to process"); }
    };

    const getChannelIcon = (channel) => {
        if (channel === 'SMS') return <FaPhone />;
        if (channel === 'EMAIL') return <FaEnvelope />;
        if (channel === 'WHATSAPP') return <FaWhatsapp />;
        return <FaBell />;
    };

    const getStatusBadge = (status) => {
        const config = { PENDING: 'pending', SENT: 'sent', DELIVERED: 'delivered', READ: 'read', FAILED: 'failed' };
        return <span className={`notif-status-badge ${config[status] || 'pending'}`}>{status}</span>;
    };

    const filterComponents = (
        <>
            <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))} className="filter-select">
                <option value="">All Status</option>
                <option value="PENDING">Pending</option><option value="SENT">Sent</option><option value="DELIVERED">Delivered</option><option value="FAILED">Failed</option>
            </select>
            <input type="date" value={filters.fromDate} onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))} className="filter-input" placeholder="From Date" />
            <input type="date" value={filters.toDate} onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))} className="filter-input" placeholder="To Date" />
            <div className="filter-buttons"><Button variant="primary" size="sm" onClick={applyFilters}>Apply Filters</Button></div>
        </>
    );

    const renderCardView = () => (
        <div className="notif-cards-grid">
            {filteredNotifications.map(n => (
                <div key={n.notificationID} className="notif-card">
                    <div className="notif-card-header">
                        <div className="notif-icon">{getChannelIcon(n.sentVia)}</div>
                        <div className="notif-info">
                            <h4>{n.notificationNo}</h4>
                            <span>{n.customerName} | {n.vehicleRegNo || 'No Vehicle'}</span>
                        </div>
                        {getStatusBadge(n.status)}
                    </div>
                    <div className="notif-card-body">
                        <div className="info-row"><strong>Type:</strong> {n.notificationType}</div>
                        <div className="info-row"><strong>Channel:</strong> {n.sentVia}</div>
                        <div className="info-row"><strong>Sent:</strong> {new Date(n.sentDate).toLocaleString()}</div>
                        <div className="info-row message-preview">{n.messageContent?.substring(0, 80)}...</div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="notification-page-premium">
            <PageHeader title="Customer Notifications" icon={<FaBell />} />
            <div className="header-actions-row"><Button variant="warning" onClick={handleProcessPending} icon={<FaSync />}>Process Pending</Button></div>
            {stats && (<div className="stats-cards">{['totalSent', 'pending', 'failed', 'delivered'].map(key => (<div key={key} className="stat-card"><span className="stat-value">{stats[key] || 0}</span><span className="stat-label">{key}</span></div>))}</div>)}
            <SearchFilterBar searchValue={searchTerm} onSearchChange={setSearchTerm} searchPlaceholder="Search by customer or vehicle..." onRefresh={loadNotifications} showList={showList} onToggleList={() => setShowList(!showList)} onToggleFilters={() => setShowFilters(!showFilters)} showFilters={showFilters} hasActiveFilters={filters.status || filters.fromDate || filters.toDate} onClearFilters={resetFilters} onSearchSubmit={applyFilters} loading={loading} filterComponents={filterComponents} />
            {loading && (<div className="loading-container"><div className="spinner"></div><p>Loading notifications...</p></div>)}
            {!loading && showList && (filteredNotifications.length > 0 ? renderCardView() : <EmptyState icon={<FaBell />} title="No notifications found" description="Try adjusting your filters" action={<Button variant="primary" onClick={resetFilters}>Clear Filters</Button>} />)}
        </div>
    );
}