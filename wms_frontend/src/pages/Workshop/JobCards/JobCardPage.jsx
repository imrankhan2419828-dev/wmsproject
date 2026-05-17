import React, { useEffect, useState } from "react";
import jobCardApi from "../../../api/jobCardApi";
import JobCardModal from "./JobCardModal";
import JobCardDetails from "./JobCardDetails";
import { FaClipboardList, FaPlus, FaEye, FaEdit, FaTrash, FaPlay, FaCheckDouble, FaCheckCircle, FaTruck, FaTimes } from "react-icons/fa";
import { Button, useDialog } from "../../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../../components/features";
import "./JobCard.css";

const ChevronDown = () => <span>▼</span>;
const ChevronUp = () => <span>▲</span>;

export default function JobCardPage() {
    const [jobCards, setJobCards] = useState([]);
    const [filteredJobCards, setFilteredJobCards] = useState([]);
    const [selectedJobCard, setSelectedJobCard] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);

    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [filters, setFilters] = useState({
        status: "", fromDate: "", toDate: ""
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { showConfirm, showSuccess, showError } = useDialog();

    const loadJobCards = async () => {
        setLoading(true);
        try {
            const res = await jobCardApi.getAll();
            let jobCardsData = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                jobCardsData = res.data.data;
            } else if (Array.isArray(res.data)) {
                jobCardsData = res.data;
            }
            setJobCards(jobCardsData);
            setFilteredJobCards(jobCardsData);
        } catch (error) {
            console.error("Error loading job cards:", error);
            showError(error.response?.data?.message || "Failed to load job cards");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobCards();
    }, []);

    const applyFilters = () => {
        let filtered = [...jobCards];

        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(j =>
                (j.jobCardNo || '').toLowerCase().includes(term) ||
                (j.vehicleRegNo || '').toLowerCase().includes(term) ||
                (j.customerName || '').toLowerCase().includes(term)
            );
        }

        if (filters.status) {
            filtered = filtered.filter(j => j.status === filters.status);
        }
        if (filters.fromDate) {
            filtered = filtered.filter(j => j.receivedDate >= filters.fromDate);
        }
        if (filters.toDate) {
            filtered = filtered.filter(j => j.receivedDate <= filters.toDate);
        }

        setFilteredJobCards(filtered);
        setCurrentPage(1);
        setShowList(true);
    };

    const resetFilters = () => {
        setFilters({ status: "", fromDate: "", toDate: "" });
        setSearchTerm("");
        setFilteredJobCards(jobCards);
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

    const hasActiveFilters = filters.status || filters.fromDate || filters.toDate;

    const handleAdd = () => {
        setSelectedJobCard(null);
        setShowModal(true);
    };

    // ✅ FIXED: Fetch complete data including services and parts
    const handleEdit = async (jobCard) => {
        setLoading(true);
        try {
            const res = await jobCardApi.getById(jobCard.jobCardID);
            const fullJobCard = res.data?.data || res.data;
            console.log("Full job card for edit:", fullJobCard);
            console.log("Services:", fullJobCard.services);
            console.log("Parts:", fullJobCard.parts);
            setSelectedJobCard(fullJobCard);
            setShowModal(true);
        } catch (error) {
            console.error("Error loading job card details:", error);
            showError("Failed to load job card details");
        } finally {
            setLoading(false);
        }
    };

    // ✅ FIXED: Fetch complete data including services and parts
    const handleView = async (jobCard) => {
        setLoading(true);
        try {
            const res = await jobCardApi.getById(jobCard.jobCardID);
            const fullJobCard = res.data?.data || res.data;
            console.log("Full job card for view:", fullJobCard);
            console.log("Services:", fullJobCard.services);
            console.log("Parts:", fullJobCard.parts);
            setSelectedJobCard(fullJobCard);
            setShowDetails(true);
        } catch (error) {
            console.error("Error loading job card details:", error);
            showError("Failed to load job card details");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, jobCardNo) => {
        showConfirm(`Delete job card "${jobCardNo}"?`, async () => {
            try {
                await jobCardApi.delete(id);
                await loadJobCards();
                showSuccess(`Job card "${jobCardNo}" deleted successfully`);
            } catch (error) {
                showError(error.response?.data?.message || "Failed to delete job card");
            }
        }, 'Delete Job Card');
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const payload = { status };
            if (status === "COMPLETED") {
                payload.completedDate = new Date().toISOString();
            } else if (status === "DELIVERED") {
                payload.deliveredDate = new Date().toISOString();
            }
            await jobCardApi.updateStatus(id, payload);
            await loadJobCards();
            showSuccess(`Status updated to ${status}`);
            if (showDetails) setShowDetails(false);
        } catch (error) {
            showError(error.response?.data?.message || "Failed to update status");
        }
    };

    const displayJobCards = filteredJobCards;
    const totalPages = Math.ceil(displayJobCards.length / itemsPerPage);
    const currentItems = displayJobCards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const toggleExpand = (id) => setExpandedRow(expandedRow === id ? null : id);

    const getStatusBadge = (status) => {
        const statusConfig = {
            PENDING: { class: "pending", label: "Pending" },
            IN_PROGRESS: { class: "in-progress", label: "In Progress" },
            QC: { class: "qc", label: "Quality Check" },
            COMPLETED: { class: "completed", label: "Completed" },
            DELIVERED: { class: "delivered", label: "Delivered" },
            CANCELLED: { class: "cancelled", label: "Cancelled" }
        };
        const config = statusConfig[status] || { class: "pending", label: status };
        return <span className={`jobcard-status-badge ${config.class}`}>{config.label}</span>;
    };

    const filterComponents = (
        <>
            <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="filter-select">
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="QC">Quality Check</option>
                <option value="COMPLETED">Completed</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
            </select>
            <input type="date" value={filters.fromDate} onChange={(e) => handleFilterChange('fromDate', e.target.value)} className="filter-input" placeholder="From Date" />
            <input type="date" value={filters.toDate} onChange={(e) => handleFilterChange('toDate', e.target.value)} className="filter-input" placeholder="To Date" />
            <div className="filter-buttons">
                <Button variant="primary" size="sm" onClick={handleApplyFilters}>Apply Filters</Button>
            </div>
        </>
    );

    const renderCardView = () => (
        <div className="jobcard-cards-grid">
            {currentItems.map(j => (
                <div key={j.jobCardID} className={`jobcard-card ${expandedRow === j.jobCardID ? 'expanded' : ''}`}>
                    <div className="jobcard-card-header" onClick={() => toggleExpand(j.jobCardID)}>
                        <FaClipboardList className="card-icon" />
                        <div className="card-info">
                            <h4>{j.jobCardNo}</h4>
                            <span>{j.vehicleRegNo} - {j.customerName}</span>
                        </div>
                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                            {getStatusBadge(j.status)}
                            <button className="card-btn view" onClick={() => handleView(j)} title="View Details"><FaEye /></button>
                            <button className="card-btn edit" onClick={() => handleEdit(j)} title="Edit"><FaEdit /></button>
                            <button className="card-btn delete" onClick={() => handleDelete(j.jobCardID, j.jobCardNo)} title="Delete"><FaTrash /></button>
                            <button className="card-btn expand">{expandedRow === j.jobCardID ? <ChevronUp /> : <ChevronDown />}</button>
                        </div>
                    </div>
                    <div className="jobcard-card-body">
                        <div className="info-row">Received: {new Date(j.receivedDate).toLocaleDateString()}</div>
                        <div className="info-row">Services: {j.services?.length || 0} | Parts: {j.parts?.length || 0}</div>
                        <div className="info-row total">Total: Rs. {j.grandTotal?.toFixed(2)}</div>
                    </div>
                    {expandedRow === j.jobCardID && (
                        <div className="jobcard-card-expanded">
                            <div className="status-actions">
                                {j.status === "PENDING" && <button className="status-btn start" onClick={() => handleStatusUpdate(j.jobCardID, "IN_PROGRESS")}><FaPlay /> Start Job</button>}
                                {j.status === "IN_PROGRESS" && <button className="status-btn qc" onClick={() => handleStatusUpdate(j.jobCardID, "QC")}><FaCheckDouble /> Send to QC</button>}
                                {j.status === "QC" && <button className="status-btn complete" onClick={() => handleStatusUpdate(j.jobCardID, "COMPLETED")}><FaCheckCircle /> Complete</button>}
                                {j.status === "COMPLETED" && <button className="status-btn deliver" onClick={() => handleStatusUpdate(j.jobCardID, "DELIVERED")}><FaTruck /> Deliver</button>}
                                {j.status === "PENDING" && <button className="status-btn cancel" onClick={() => handleStatusUpdate(j.jobCardID, "CANCELLED")}><FaTimes /> Cancel</button>}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="jobcard-page-premium">
            <PageHeader title="Job Cards" icon={<FaClipboardList />} addButtonText="New Job Card" onAdd={handleAdd} />
            <SearchFilterBar
                searchValue={searchTerm} onSearchChange={setSearchTerm}
                searchPlaceholder="Search by job card #, vehicle or customer..."
                onRefresh={loadJobCards} showList={showList} onToggleList={() => setShowList(!showList)}
                showListText="Show List" hideListText="Hide List"
                onToggleFilters={() => setShowFilters(!showFilters)} showFilters={showFilters}
                hasActiveFilters={hasActiveFilters} onClearFilters={resetFilters}
                onSearchSubmit={applyFilters} loading={loading}
                filterComponents={filterComponents}
            />
            {loading && (<div className="loading-container"><div className="spinner"></div><p>Loading job cards...</p></div>)}
            {!loading && showList && (displayJobCards.length > 0 ? (
                <>
                    {renderCardView()}
                    {totalPages > 1 && (<div className="pagination"><button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</button><span>Page {currentPage} of {totalPages}</span><button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</button></div>)}
                </>
            ) : (<EmptyState icon={<FaClipboardList />} title="No job cards found" description="Try adjusting your filters" action={<Button variant="primary" onClick={resetFilters}>Clear Filters</Button>} />))}
            {!loading && jobCards.length === 0 && !showList && (<EmptyState icon={<FaClipboardList />} title="No job cards yet" description="Get started by creating a new job card" action={<Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>New Job Card</Button>} />)}
            {showModal && <JobCardModal jobCard={selectedJobCard} onClose={() => setShowModal(false)} onSaved={() => { loadJobCards(); setShowModal(false); }} />}
            {showDetails && selectedJobCard && <JobCardDetails jobCard={selectedJobCard} onClose={() => setShowDetails(false)} onStatusUpdate={(status) => handleStatusUpdate(selectedJobCard.jobCardID, status)} />}
        </div>
    );
}