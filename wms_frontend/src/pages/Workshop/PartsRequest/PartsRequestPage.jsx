import React, { useEffect, useState } from "react";
import partsRequestApi from "../../../api/partsRequestApi";
import PartsRequestModal from "./PartsRequestModal";
import LowStockAlert from "./LowStockAlert";
import { FaBoxes, FaPlus, FaEye, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaTruck, FaExclamationTriangle } from "react-icons/fa";
import { Button, useDialog } from "../../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../../components/features";
import "./PartsRequest.css";

const STATUS_CONFIG = {
    PENDING: { class: "pending", label: "Pending", icon: "⏳" },
    APPROVED: { class: "approved", label: "Approved", icon: "✅" },
    ORDERED: { class: "ordered", label: "Ordered", icon: "📦" },
    RECEIVED: { class: "received", label: "Received", icon: "📥" },
    CANCELLED: { class: "cancelled", label: "Cancelled", icon: "❌" }
};

const URGENCY_CONFIG = {
    NORMAL: { class: "normal", label: "Normal" },
    URGENT: { class: "urgent", label: "Urgent" },
    CRITICAL: { class: "critical", label: "Critical" }
};

export default function PartsRequestPage() {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showLowStock, setShowLowStock] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);

    // SearchFilterBar States
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filters State
    const [filters, setFilters] = useState({
        status: "", urgency: "", fromDate: "", toDate: ""
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { showConfirm, showSuccess, showError } = useDialog();

    const loadRequests = async () => {
        setLoading(true);
        try {
            const res = await partsRequestApi.getAll();
            let requestsData = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                requestsData = res.data.data;
            } else if (Array.isArray(res.data)) {
                requestsData = res.data;
            }
            setRequests(requestsData);
            setFilteredRequests(requestsData);
        } catch (error) {
            console.error("Error loading parts requests:", error);
            showError(error.response?.data?.message || "Failed to load parts requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const applyFilters = () => {
        let filtered = [...requests];

        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(r =>
                (r.requestNo || '').toLowerCase().includes(term) ||
                (r.jobCardNo || '').toLowerCase().includes(term) ||
                (r.itemName || '').toLowerCase().includes(term) ||
                (r.vehicleRegNo || '').toLowerCase().includes(term)
            );
        }

        if (filters.status) {
            filtered = filtered.filter(r => r.status === filters.status);
        }
        if (filters.urgency) {
            filtered = filtered.filter(r => r.urgency === filters.urgency);
        }
        if (filters.fromDate) {
            filtered = filtered.filter(r => r.requestDate >= filters.fromDate);
        }
        if (filters.toDate) {
            filtered = filtered.filter(r => r.requestDate <= filters.toDate);
        }

        setFilteredRequests(filtered);
        setCurrentPage(1);
        setShowList(true);
    };

    const resetFilters = () => {
        setFilters({ status: "", urgency: "", fromDate: "", toDate: "" });
        setSearchTerm("");
        setFilteredRequests(requests);
        setCurrentPage(1);
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

    const hasActiveFilters = filters.status || filters.urgency || filters.fromDate || filters.toDate;

    const handleAdd = () => {
        setSelectedRequest(null);
        setShowModal(true);
    };

    const handleEdit = (request) => {
        setSelectedRequest(request);
        setShowModal(true);
    };

    const handleApprove = async (id) => {
        const approvedQty = prompt("Enter approved quantity:");
        if (!approvedQty) return;

        try {
            await partsRequestApi.approve(id, { approvedQuantity: parseFloat(approvedQty) });
            showSuccess("Request approved successfully");
            loadRequests();
        } catch (error) {
            showError(error.response?.data?.message || "Failed to approve request");
        }
    };

    const handleReceive = async (id) => {
        const actualCost = prompt("Enter actual cost:");
        if (!actualCost) return;

        try {
            await partsRequestApi.receive(id, parseFloat(actualCost));
            showSuccess("Parts received successfully");
            loadRequests();
        } catch (error) {
            showError(error.response?.data?.message || "Failed to receive parts");
        }
    };

    const handleCancel = async (id) => {
        const reason = prompt("Enter cancellation reason:");
        if (!reason) return;

        try {
            await partsRequestApi.cancel(id, reason);
            showSuccess("Request cancelled successfully");
            loadRequests();
        } catch (error) {
            showError(error.response?.data?.message || "Failed to cancel request");
        }
    };

    const handleDelete = async (id, requestNo) => {
        showConfirm(`Delete request "${requestNo}"?`, async () => {
            try {
                await partsRequestApi.delete(id);
                showSuccess("Request deleted successfully");
                loadRequests();
            } catch (error) {
                showError(error.response?.data?.message || "Failed to delete request");
            }
        }, "Delete Request");
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-PK", {
            style: "currency",
            currency: "PKR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const displayRequests = filteredRequests;
    const totalPages = Math.ceil(displayRequests.length / itemsPerPage);
    const currentItems = displayRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const toggleExpand = (id) => setExpandedRow(expandedRow === id ? null : id);

    const statusOptions = Object.entries(STATUS_CONFIG).map(([key, val]) => ({ value: key, label: val.label }));
    const urgencyOptions = Object.entries(URGENCY_CONFIG).map(([key, val]) => ({ value: key, label: val.label }));

    const filterComponents = (
        <>
            <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="filter-select">
                <option value="">All Status</option>
                {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select value={filters.urgency} onChange={(e) => handleFilterChange('urgency', e.target.value)} className="filter-select">
                <option value="">All Urgency</option>
                {urgencyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <input type="date" value={filters.fromDate} onChange={(e) => handleFilterChange('fromDate', e.target.value)} className="filter-input" placeholder="From Date" />
            <input type="date" value={filters.toDate} onChange={(e) => handleFilterChange('toDate', e.target.value)} className="filter-input" placeholder="To Date" />
            <div className="filter-buttons"><Button variant="primary" size="sm" onClick={handleApplyFilters}>Apply Filters</Button></div>
        </>
    );

    const getStatusBadge = (status) => {
        const config = STATUS_CONFIG[status] || { class: "pending", label: status };
        return <span className={`parts-status-badge ${config.class}`}>{config.icon} {config.label}</span>;
    };

    const getUrgencyBadge = (urgency) => {
        const config = URGENCY_CONFIG[urgency] || { class: "normal", label: "Normal" };
        return <span className={`urgency-badge ${config.class}`}>{config.label}</span>;
    };

    const renderCardView = () => (
        <div className="parts-cards-grid">
            {currentItems.map(r => (
                <div key={r.requestID} className={`parts-card ${expandedRow === r.requestID ? 'expanded' : ''}`}>
                    <div className="parts-card-header" onClick={() => toggleExpand(r.requestID)}>
                        <FaBoxes className="card-icon" />
                        <div className="card-info">
                            <h4>{r.requestNo}</h4>
                            <span>{r.itemName} - Qty: {r.approvedQuantity || r.quantity}</span>
                        </div>
                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                            {getStatusBadge(r.status)}
                            {getUrgencyBadge(r.urgency)}
                            <button className="card-btn view" onClick={() => handleEdit(r)} title="View Details"><FaEye /></button>
                            {r.status === 'PENDING' && (
                                <>
                                    <button className="card-btn approve" onClick={() => handleApprove(r.requestID)} title="Approve">✅</button>
                                    <button className="card-btn cancel" onClick={() => handleCancel(r.requestID)} title="Cancel">❌</button>
                                </>
                            )}
                            {r.status === 'ORDERED' && (
                                <button className="card-btn receive" onClick={() => handleReceive(r.requestID)} title="Receive Parts">📦</button>
                            )}
                            {(r.status === 'PENDING' || r.status === 'CANCELLED') && (
                                <button className="card-btn delete" onClick={() => handleDelete(r.requestID, r.requestNo)} title="Delete"><FaTrash /></button>
                            )}
                            <button className="card-btn expand">{expandedRow === r.requestID ? <FaChevronUp /> : <FaChevronDown />}</button>
                        </div>
                    </div>
                    <div className="parts-card-body">
                        <div className="info-row">Job Card: {r.jobCardNo}</div>
                        <div className="info-row">Vehicle: {r.vehicleRegNo}</div>
                        <div className="info-row">Request Date: {new Date(r.requestDate).toLocaleDateString()}</div>
                        <div className="info-row">Required By: {r.requiredDate ? new Date(r.requiredDate).toLocaleDateString() : '-'}</div>
                        <div className="info-row total">Est. Cost: {formatCurrency(r.estimatedCost)}</div>
                    </div>
                    {expandedRow === r.requestID && (
                        <div className="parts-card-expanded">
                            <table className="expanded-table">
                                <tbody>
                                    <tr><th>Supplier:</th><td>{r.supplierName || '-'}</td></tr>
                                    <tr><th>Notes:</th><td>{r.notes || '-'}</td></tr>
                                    <tr><th>Days Pending:</th><td>{r.daysPending} days</td></tr>
                                    <tr><th>Approved Quantity:</th><td>{r.approvedQuantity || '-'}</td></tr>
                                    <tr><th>Actual Cost:</th><td>{formatCurrency(r.actualCost)}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    const FaChevronDown = () => <span>▼</span>;
    const FaChevronUp = () => <span>▲</span>;

    return (
        <div className="parts-page-premium">
            <PageHeader title="Parts Request Management" icon={<FaBoxes />} addButtonText="New Parts Request" onAdd={handleAdd} />

            <div className="header-actions-row">
                <Button variant="warning" onClick={() => setShowLowStock(true)} icon={<FaExclamationTriangle />}>Low Stock Alerts</Button>
            </div>

            <SearchFilterBar
                searchValue={searchTerm} onSearchChange={setSearchTerm}
                searchPlaceholder="Search by request #, job card, item or vehicle..."
                onRefresh={loadRequests} showList={showList} onToggleList={() => setShowList(!showList)}
                showListText="Show List" hideListText="Hide List"
                onToggleFilters={() => setShowFilters(!showFilters)} showFilters={showFilters}
                hasActiveFilters={hasActiveFilters} onClearFilters={resetFilters}
                onSearchSubmit={applyFilters} loading={loading}
                filterComponents={filterComponents}
            />

            {loading && (<div className="loading-container"><div className="spinner"></div><p>Loading parts requests...</p></div>)}

            {!loading && showList && (
                displayRequests.length > 0 ? (
                    <>
                        {renderCardView()}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</button>
                                <span>Page {currentPage} of {totalPages}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyState icon={<FaBoxes />} title="No parts requests found" description="Try adjusting your filters" action={<Button variant="primary" onClick={resetFilters}>Clear Filters</Button>} />
                )
            )}

            {!loading && requests.length === 0 && !showList && (
                <EmptyState icon={<FaBoxes />} title="No parts requests yet" description="Get started by creating a new parts request" action={<Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>New Parts Request</Button>} />
            )}

            {showModal && <PartsRequestModal request={selectedRequest} onClose={() => { setShowModal(false); setSelectedRequest(null); }} onSaved={() => { loadRequests(); setShowModal(false); setSelectedRequest(null); }} />}
            {showLowStock && <LowStockAlert onClose={() => setShowLowStock(false)} onCreateRequest={(item) => { setShowLowStock(false); setSelectedRequest({ itemID: item.itemID }); setShowModal(true); }} />}
        </div>
    );
}