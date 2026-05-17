import React, { useEffect, useState } from "react";
import technicianTimeLogApi from "../../../api/technicianTimeLogApi";
import technicianApi from "../../../api/technicianApi";
import TechnicianTimeLogModal from "./TechnicianTimeLogModal";
import TechnicianWorkloadDashboard from "./TechnicianWorkloadDashboard";
import TechnicianEngagementDashboard from "./TechnicianEngagementDashboard";
import { FaClock, FaPlay, FaStop, FaCoffee, FaEdit, FaTrash, FaSync, FaChartLine, FaUser } from "react-icons/fa";
import { Button, useDialog } from "../../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../../components/features";
import "./TechnicianTimeLog.css";

export default function TechnicianTimeLogPage() {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showModal, setShowModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('logs');

    // SearchFilterBar States
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filters State
    const [filters, setFilters] = useState({
        status: "", technicianId: ""
    });

    const { showConfirm, showSuccess, showError } = useDialog();

    const loadLogs = async () => {
        setLoading(true);
        try {
            const res = await technicianTimeLogApi.getAll(selectedDate);
            let logsData = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                logsData = res.data.data;
            } else if (Array.isArray(res.data)) {
                logsData = res.data;
            }
            setLogs(logsData);
            setFilteredLogs(logsData);
        } catch (error) {
            console.error("Error loading time logs:", error);
            showError(error.response?.data?.message || "Failed to load time logs");
        } finally {
            setLoading(false);
        }
    };

    const loadTechnicians = async () => {
        try {
            const res = await technicianApi.getAll();
            let techData = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                techData = res.data.data;
            } else if (Array.isArray(res.data)) {
                techData = res.data;
            }
            setTechnicians(techData);
        } catch (error) {
            console.error("Error loading technicians:", error);
        }
    };

    useEffect(() => {
        loadLogs();
        loadTechnicians();
    }, [selectedDate]);

    // Apply filters
    const applyFilters = () => {
        let filtered = [...logs];

        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(l =>
                (l.technicianName || '').toLowerCase().includes(term) ||
                (l.jobCardNo || '').toLowerCase().includes(term)
            );
        }

        if (filters.status) {
            filtered = filtered.filter(l => l.status === filters.status);
        }

        if (filters.technicianId) {
            filtered = filtered.filter(l => l.technicianID === parseInt(filters.technicianId));
        }

        setFilteredLogs(filtered);
        setShowList(true);
    };

    const resetFilters = () => {
        setFilters({ status: "", technicianId: "" });
        setSearchTerm("");
        setFilteredLogs(logs);
        setShowList(false);
        setShowFilters(false);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleApplyFilters = () => {
        applyFilters();
        setShowFilters(false);
    };

    const hasActiveFilters = filters.status || filters.technicianId;

    const handleClockIn = async (technicianId, jobServiceId, jobCardId) => {
        try {
            const data = {
                technicianID: technicianId,
                jobServiceID: jobServiceId || null,
                jobCardID: jobCardId || null,
                clockInTime: new Date().toISOString(),
                status: "ACTIVE"
            };
            await technicianTimeLogApi.clockIn(data);
            showSuccess("Technician clocked in successfully");
            loadLogs();
        } catch (error) {
            console.error("Clock in error:", error);
            showError(error.response?.data?.message || "Failed to clock in");
        }
    };

    const handleClockOut = async (logId) => {
        showConfirm("Clock out this technician?", async () => {
            try {
                await technicianTimeLogApi.clockOut(logId);
                showSuccess("Technician clocked out successfully");
                loadLogs();
            } catch (error) {
                showError(error.response?.data?.message || "Failed to clock out");
            }
        }, "Clock Out");
    };

    const handleStartBreak = async (logId) => {
        try {
            await technicianTimeLogApi.startBreak(logId);
            showSuccess("Break started");
            loadLogs();
        } catch (error) {
            showError(error.response?.data?.message || "Failed to start break");
        }
    };

    const handleEndBreak = async (logId) => {
        try {
            await technicianTimeLogApi.endBreak(logId);
            showSuccess("Break ended");
            loadLogs();
        } catch (error) {
            showError(error.response?.data?.message || "Failed to end break");
        }
    };

    const handleEdit = (log) => {
        setSelectedLog(log);
        setShowModal(true);
    };

    const handleDelete = async (id, technicianName) => {
        showConfirm(`Delete time log for ${technicianName}?`, async () => {
            try {
                await technicianTimeLogApi.delete(id);
                showSuccess("Time log deleted successfully");
                loadLogs();
            } catch (error) {
                showError(error.response?.data?.message || "Failed to delete time log");
            }
        }, "Delete Time Log");
    };

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDuration = (minutes) => {
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    // Filter components
    const technicianOptions = technicians.map(t => ({ value: t.technicianID?.toString(), label: t.fullName }));

    const filterComponents = (
        <>
            <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
            >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="BREAK">On Break</option>
                <option value="COMPLETED">Completed</option>
            </select>
            <select
                value={filters.technicianId}
                onChange={(e) => handleFilterChange('technicianId', e.target.value)}
                className="filter-select"
            >
                <option value="">All Technicians</option>
                {technicians.map(t => (
                    <option key={t.technicianID} value={t.technicianID}>{t.fullName}</option>
                ))}
            </select>
            <div className="filter-buttons">
                <Button variant="primary" size="sm" onClick={handleApplyFilters}>Apply Filters</Button>
            </div>
        </>
    );

    const getStatusBadge = (status) => {
        const statusConfig = {
            ACTIVE: { class: "active", label: "Active" },
            BREAK: { class: "break", label: "On Break" },
            COMPLETED: { class: "completed", label: "Completed" }
        };
        const config = statusConfig[status] || { class: "pending", label: status };
        return <span className={`timelog-status-badge ${config.class}`}>{config.label}</span>;
    };

    // Render Card View
    const renderCardView = () => (
        <div className="timelog-cards-grid">
            {filteredLogs.map(log => (
                <div key={log.timeLogID} className="timelog-card">
                    <div className="timelog-card-header">
                        <FaClock className="card-icon" />
                        <div className="card-info">
                            <h4>{log.technicianName}</h4>
                            <span>{log.jobCardNo || 'No Job Assigned'}</span>
                        </div>
                        <div className="card-actions">
                            {log.status === 'ACTIVE' && (
                                <>
                                    <button className="card-btn break" onClick={() => handleStartBreak(log.timeLogID)} title="Start Break">☕</button>
                                    <button className="card-btn clockout" onClick={() => handleClockOut(log.timeLogID)} title="Clock Out">⏱️</button>
                                </>
                            )}
                            {log.status === 'BREAK' && (
                                <button className="card-btn break-end" onClick={() => handleEndBreak(log.timeLogID)} title="End Break">↩️</button>
                            )}
                            <button className="card-btn edit" onClick={() => handleEdit(log)} title="Edit">✏️</button>
                            <button className="card-btn delete" onClick={() => handleDelete(log.timeLogID, log.technicianName)} title="Delete">🗑️</button>
                        </div>
                    </div>
                    <div className="timelog-card-body">
                        <div className="info-row">Clock In: {formatTime(log.clockInTime)}</div>
                        <div className="info-row">Clock Out: {formatTime(log.clockOutTime)}</div>
                        <div className="info-row">Work Time: {formatDuration(log.totalWorkMinutes)}</div>
                        <div className="info-row">Break: {formatDuration(log.totalBreakMinutes)}</div>
                        <div className="info-row status">{getStatusBadge(log.status)}</div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="timelog-page-premium">
            <PageHeader
                title="Technician Time Tracking"
                icon={<FaClock />}
                addButtonText="Manual Entry"
                onAdd={() => { setSelectedLog(null); setShowModal(true); }}
            />

            {/* Date Picker and Tabs */}
            <div className="timelog-header-row">
                <div className="date-picker-wrapper">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="date-input"
                    />
                </div>
                <div className="timelog-tabs">
                    <button className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
                        <FaClock /> Time Logs
                    </button>
                    <button className={`tab-btn ${activeTab === 'workload' ? 'active' : ''}`} onClick={() => setActiveTab('workload')}>
                        <FaChartLine /> Workload Dashboard
                    </button>
                    <button className={`tab-btn ${activeTab === 'engagement' ? 'active' : ''}`} onClick={() => setActiveTab('engagement')}>
                        <FaUser /> Engagement Status
                    </button>
                </div>
            </div>

            {/* Workload Dashboard Tab */}
            {activeTab === 'workload' && (
                <TechnicianWorkloadDashboard date={selectedDate} />
            )}

            {/* Engagement Dashboard Tab */}
            {activeTab === 'engagement' && (
                <TechnicianEngagementDashboard />
            )}

            {/* Time Logs Tab */}
            {activeTab === 'logs' && (
                <>
                    <SearchFilterBar
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        searchPlaceholder="Search by technician name or job card..."
                        onRefresh={loadLogs}
                        showList={showList}
                        onToggleList={() => setShowList(!showList)}
                        showListText="Show List"
                        hideListText="Hide List"
                        onToggleFilters={() => setShowFilters(!showFilters)}
                        showFilters={showFilters}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={resetFilters}
                        onSearchSubmit={applyFilters}
                        loading={loading}
                        filterComponents={filterComponents}
                    />

                    {loading && (
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p>Loading time logs...</p>
                        </div>
                    )}

                    {!loading && showList && (
                        filteredLogs.length > 0 ? (
                            <>
                                {renderCardView()}
                            </>
                        ) : (
                            <EmptyState
                                icon={<FaClock />}
                                title="No time logs found"
                                description="Try adjusting your filters"
                                action={<Button variant="primary" onClick={resetFilters}>Clear Filters</Button>}
                            />
                        )
                    )}

                    {!loading && logs.length === 0 && !showList && (
                        <EmptyState
                            icon={<FaClock />}
                            title="No time logs yet"
                            description="Get started by clocking in a technician"
                            action={
                                <Button variant="primary" onClick={() => { setSelectedLog(null); setShowModal(true); }} icon={<FaPlay />}>
                                    Manual Entry
                                </Button>
                            }
                        />
                    )}
                </>
            )}

            {showModal && (
                <TechnicianTimeLogModal
                    log={selectedLog}
                    technicians={technicians}
                    onClose={() => { setShowModal(false); setSelectedLog(null); }}
                    onSaved={() => { loadLogs(); setShowModal(false); setSelectedLog(null); }}
                />
            )}
        </div>
    );
}