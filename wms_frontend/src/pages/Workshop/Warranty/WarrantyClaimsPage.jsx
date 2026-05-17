import React, { useEffect, useState } from "react";
import warrantyApi from "../../../api/warrantyApi";
import WarrantyClaimModal from "./WarrantyClaimModal";
import WarrantyClaimDetails from "./WarrantyClaimDetails";
import { FaShieldAlt, FaPlus, FaEye, FaEdit, FaTrash, FaFileInvoice, FaUser, FaCalendarAlt } from "react-icons/fa";
import { Button, useDialog } from "../../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../../components/features";
import "./Warranty.css";

const STATUS_CONFIG = {
    OPEN: { class: "open", label: "Open", icon: "🟡" },
    SUBMITTED: { class: "submitted", label: "Submitted", icon: "📤" },
    APPROVED: { class: "approved", label: "Approved", icon: "✅" },
    REJECTED: { class: "rejected", label: "Rejected", icon: "❌" },
    PAID: { class: "paid", label: "Paid", icon: "💰" },
    CLOSED: { class: "closed", label: "Closed", icon: "🔒" }
};

const PRIORITY_CONFIG = {
    NORMAL: { class: "normal", label: "Normal" },
    HIGH: { class: "high", label: "High" },
    URGENT: { class: "urgent", label: "Urgent" }
};

export default function WarrantyClaimsPage() {
    const [claims, setClaims] = useState([]);
    const [filteredClaims, setFilteredClaims] = useState([]);
    const [summary, setSummary] = useState(null);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({ status: "", fromDate: "", toDate: "" });
    const { showConfirm, showSuccess, showError } = useDialog();

    const loadClaims = async () => {
        setLoading(true);
        try {
            const res = await warrantyApi.getAll(filters.status, filters.fromDate, filters.toDate);
            let data = res.data?.data || res.data || [];
            setClaims(data);
            setFilteredClaims(data);
        } catch (error) {
            showError(error.response?.data?.message || "Failed to load claims");
        } finally {
            setLoading(false);
        }
    };

    const loadSummary = async () => {
        try {
            const res = await warrantyApi.getSummary(filters.fromDate, filters.toDate);
            setSummary(res.data?.data || res.data);
        } catch (error) {
            console.error("Error loading summary:", error);
        }
    };

    useEffect(() => { loadClaims(); loadSummary(); }, [filters.status, filters.fromDate, filters.toDate]);

    const applyFilters = () => {
        let filtered = [...claims];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(c =>
                c.claimNo?.toLowerCase().includes(term) ||
                c.customerName?.toLowerCase().includes(term) ||
                c.jobCardNo?.toLowerCase().includes(term)
            );
        }
        setFilteredClaims(filtered);
        setShowList(true);
    };

    const resetFilters = () => {
        setFilters({ status: "", fromDate: "", toDate: "" });
        setSearchTerm("");
        setFilteredClaims(claims);
        setShowList(false);
        setShowFilters(false);
    };

    const handleStatusUpdate = async (id, status, data = {}) => {
        try {
            await warrantyApi.updateStatus(id, { status, ...data });
            showSuccess(`Claim status updated to ${status}`);
            loadClaims(); loadSummary();
        } catch (error) { showError("Failed to update status"); }
    };

    const getStatusBadge = (status) => {
        const config = STATUS_CONFIG[status] || { class: "open", label: status };
        return <span className={`warranty-status-badge ${config.class}`}>{config.icon} {config.label}</span>;
    };

    const getPriorityBadge = (priority) => {
        const config = PRIORITY_CONFIG[priority] || { class: "normal", label: priority };
        return <span className={`priority-badge ${config.class}`}>{config.label}</span>;
    };

    const filterComponents = (
        <>
            <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))} className="filter-select">
                <option value="">All Status</option>
                {Object.entries(STATUS_CONFIG).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
            </select>
            <input type="date" value={filters.fromDate} onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))} className="filter-input" placeholder="From Date" />
            <input type="date" value={filters.toDate} onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))} className="filter-input" placeholder="To Date" />
            <div className="filter-buttons"><Button variant="primary" size="sm" onClick={applyFilters}>Apply Filters</Button></div>
        </>
    );

    const renderCardView = () => (
        <div className="warranty-cards-grid">
            {filteredClaims.map(c => (
                <div key={c.claimID} className="warranty-card">
                    <div className="warranty-card-header">
                        <FaShieldAlt className="card-icon" />
                        <div className="card-info">
                            <h4>{c.claimNo}</h4>
                            <span><FaUser /> {c.customerName} | <FaFileInvoice /> {c.jobCardNo}</span>
                        </div>
                        <div className="card-badges">
                            {getStatusBadge(c.status)}
                            {getPriorityBadge(c.priority)}
                        </div>
                    </div>
                    <div className="warranty-card-body">
                        <div className="info-row">Type: {c.claimType}</div>
                        <div className="info-row"><FaCalendarAlt /> {new Date(c.claimDate).toLocaleDateString()}</div>
                        <div className="info-row amount">Claim: Rs. {c.claimAmount?.toFixed(2)} | Approved: Rs. {c.approvedAmount?.toFixed(2) || '0.00'}</div>
                        <div className="info-row days-left">Days Left: {c.daysRemaining > 0 ? `${c.daysRemaining} days` : 'Expired'}</div>
                    </div>
                    <div className="warranty-card-footer">
                        <button className="card-btn view" onClick={() => { setSelectedClaim(c); setShowDetails(true); }}><FaEye /> Details</button>
                        <button className="card-btn edit" onClick={() => { setSelectedClaim(c); setShowModal(true); }}><FaEdit /> Edit</button>
                        {c.status === 'OPEN' && <button className="card-btn submit" onClick={() => handleStatusUpdate(c.claimID, 'SUBMITTED')}>📤 Submit</button>}
                        {c.status === 'APPROVED' && <button className="card-btn pay" onClick={() => handleStatusUpdate(c.claimID, 'PAID')}>💰 Pay</button>}
                        <button className="card-btn delete" onClick={() => showConfirm(`Delete claim ${c.claimNo}?`, async () => { await warrantyApi.delete(c.claimID); loadClaims(); loadSummary(); showSuccess("Claim deleted"); }, "Delete")}><FaTrash /></button>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="warranty-page-premium">
            <PageHeader title="Warranty Claims" icon={<FaShieldAlt />} addButtonText="New Claim" onAdd={() => { setSelectedClaim(null); setShowModal(true); }} />
            {summary && (<div className="warranty-summary-grid"><div className="summary-card"><span className="value">{summary.totalClaims}</span><span className="label">Total Claims</span></div><div className="summary-card"><span className="value">{summary.openClaims}</span><span className="label">Open</span></div><div className="summary-card"><span className="value">{summary.approvedClaims}</span><span className="label">Approved</span></div><div className="summary-card"><span className="value">Rs. {summary.totalClaimAmount?.toFixed(2)}</span><span className="label">Claim Amount</span></div><div className="summary-card"><span className="value">Rs. {summary.totalApprovedAmount?.toFixed(2)}</span><span className="label">Approved Amount</span></div></div>)}
            <SearchFilterBar searchValue={searchTerm} onSearchChange={setSearchTerm} searchPlaceholder="Search by claim #, customer or job card..." onRefresh={loadClaims} showList={showList} onToggleList={() => setShowList(!showList)} onToggleFilters={() => setShowFilters(!showFilters)} showFilters={showFilters} hasActiveFilters={filters.status || filters.fromDate || filters.toDate} onClearFilters={resetFilters} onSearchSubmit={applyFilters} loading={loading} filterComponents={filterComponents} />
            {loading && (<div className="loading-container"><div className="spinner"></div><p>Loading claims...</p></div>)}
            {!loading && showList && (filteredClaims.length > 0 ? renderCardView() : <EmptyState icon={<FaShieldAlt />} title="No claims found" description="Try adjusting your filters" action={<Button variant="primary" onClick={resetFilters}>Clear Filters</Button>} />)}
            {!loading && claims.length === 0 && !showList && (<EmptyState icon={<FaShieldAlt />} title="No claims yet" description="Create your first warranty claim" action={<Button variant="primary" onClick={() => { setSelectedClaim(null); setShowModal(true); }} icon={<FaPlus />}>New Claim</Button>} />)}
            {showModal && <WarrantyClaimModal claim={selectedClaim} onClose={() => { setShowModal(false); setSelectedClaim(null); }} onSaved={() => { loadClaims(); loadSummary(); setShowModal(false); setSelectedClaim(null); }} />}
            {showDetails && selectedClaim && <WarrantyClaimDetails claimId={selectedClaim.claimID} onClose={() => { setShowDetails(false); setSelectedClaim(null); }} onStatusUpdate={(status, data) => handleStatusUpdate(selectedClaim.claimID, status, data)} />}
        </div>
    );
}