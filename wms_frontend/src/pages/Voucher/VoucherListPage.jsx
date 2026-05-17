import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import voucherApi from "../../api/voucherApi";
import vochTypeApi from "../../api/vochTypeApi";
import ManualJournalPopup from "./ManualJournalPopup";
import {
    FaList, FaPlus, FaEye, FaPrint, FaCheckCircle,
    FaCalendarAlt, FaFileInvoice, FaTrash
} from "react-icons/fa";
import { Button, useDialog } from "../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../components/features";
import "./VoucherListPage.css";

export default function VoucherListPage() {
    const navigate = useNavigate();
    const [vouchers, setVouchers] = useState([]);
    const [filteredVouchers, setFilteredVouchers] = useState([]);
    const [voucherTypes, setVoucherTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showManualJournal, setShowManualJournal] = useState(false);

    // SearchFilterBar States
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filters State
    const [filters, setFilters] = useState({
        vochType: "", fromDate: "", toDate: "", status: ""
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const { showConfirm, showSuccess, showError } = useDialog();

    const loadVoucherTypes = async () => {
        try {
            const res = await vochTypeApi.getAll();
            let data = res.data?.data || res.data || [];
            setVoucherTypes(Array.isArray(data) ? data.filter(x => !x.inActive) : []);
        } catch (err) {
            console.error("Error loading voucher types:", err);
        }
    };

    const loadVouchers = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.vochType) params.vochType = filters.vochType;
            if (filters.fromDate) params.fromDate = filters.fromDate;
            if (filters.toDate) params.toDate = filters.toDate;
            const res = await voucherApi.getAll(params);
            let data = res.data?.data || res.data || [];
            setVouchers(Array.isArray(data) ? data : []);
            setFilteredVouchers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error loading vouchers:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVoucherTypes();
        loadVouchers();
    }, []);

    // Apply all filters
    const applyFilters = () => {
        let filtered = [...vouchers];

        // Search term filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(v =>
                (v.vochNumb || '').toString().includes(term) ||
                (v.tranDesc || '').toLowerCase().includes(term)
            );
        }

        // Filters
        if (filters.vochType) {
            filtered = filtered.filter(v => v.vochType === filters.vochType);
        }
        if (filters.fromDate) {
            filtered = filtered.filter(v => v.tranDate >= filters.fromDate);
        }
        if (filters.toDate) {
            filtered = filtered.filter(v => v.tranDate <= filters.toDate);
        }
        if (filters.status === 'posted') {
            filtered = filtered.filter(v => v.isPosted);
        }
        if (filters.status === 'pending') {
            filtered = filtered.filter(v => !v.isPosted);
        }

        setFilteredVouchers(filtered);
        setCurrentPage(1);
        setShowList(true);
    };

    // Reset all filters
    const resetFilters = () => {
        setFilters({ vochType: "", fromDate: "", toDate: "", status: "" });
        setSearchTerm("");
        setFilteredVouchers(vouchers);
        setShowList(false);
        setShowFilters(false);
    };

    // Handle filter change
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    // Apply filter from filter panel
    const handleApplyFilters = () => {
        applyFilters();
        setShowFilters(false);
    };

    // Check if any filter is active
    const hasActiveFilters = filters.vochType || filters.fromDate ||
        filters.toDate || filters.status;

    // CRUD Operations
    const handleView = (id) => navigate(`/voucher-detail/${id}`);

    const handlePrint = async (id) => {
        try {
            const response = await voucherApi.printVoucher(id);
            const blob = new Blob([response.data], { type: 'text/html' });
            window.open(window.URL.createObjectURL(blob), '_blank');
        } catch (err) {
            console.error("Print error:", err);
        }
    };

    const handlePost = async (id, voucherNo) => {
        showConfirm(`Post voucher #${voucherNo} to ledger?`, async () => {
            try {
                await voucherApi.postToLedger(id);
                await loadVouchers();
                if (showList) applyFilters();
                showSuccess(`Voucher #${voucherNo} posted!`);
            } catch (err) {
                showError("Failed to post voucher");
            }
        }, 'Post Voucher');
    };

    const handleDelete = async (id, voucherNo) => {
        showConfirm(`Delete voucher #${voucherNo}? This cannot be undone.`, async () => {
            try {
                await voucherApi.deleteVoucher(id);
                await loadVouchers();
                if (showList) applyFilters();
                showSuccess(`Voucher #${voucherNo} deleted!`);
            } catch (err) {
                showError("Failed to delete voucher");
            }
        }, 'Delete Voucher');
    };

    const getVoucherTypeName = (vochType) =>
        voucherTypes.find(x => x.vochType === vochType)?.vochName || vochType;

    // Pagination
    const displayVouchers = filteredVouchers;
    const totalPages = Math.ceil(displayVouchers.length / itemsPerPage);
    const currentItems = displayVouchers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Filter Components for SearchFilterBar
    const filterComponents = (
        <>
            <select
                value={filters.vochType}
                onChange={(e) => handleFilterChange('vochType', e.target.value)}
                className="filter-select"
            >
                <option value="">All Types</option>
                {voucherTypes.map(vt => (
                    <option key={vt.vochType} value={vt.vochType}>
                        {vt.vochName}
                    </option>
                ))}
            </select>

            <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
            >
                <option value="">All Status</option>
                <option value="posted">Posted</option>
                <option value="pending">Pending</option>
            </select>

            <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                className="filter-input"
                placeholder="From Date"
            />

            <input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                className="filter-input"
                placeholder="To Date"
            />

            <div className="filter-buttons">
                <Button variant="primary" size="sm" onClick={handleApplyFilters}>
                    Apply Filters
                </Button>
            </div>
        </>
    );

    // Render Card View
    const renderCardView = () => (
        <div className="voucher-cards-grid">
            {currentItems.map(v => (
                <div key={v.acctTranID} className="voucher-card">
                    <div className="voucher-card-header">
                        <FaFileInvoice className="card-icon" />
                        <div className="card-info">
                            <h4>Voucher #{v.vochNumb}</h4>
                            <span>
                                <FaCalendarAlt /> {new Date(v.tranDate).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="card-actions">
                            <button className="card-btn view" onClick={() => handleView(v.acctTranID)}>
                                <FaEye />
                            </button>
                            <button className="card-btn print" onClick={() => handlePrint(v.acctTranID)}>
                                <FaPrint />
                            </button>
                            {!v.isPosted && (
                                <button className="card-btn post" onClick={() => handlePost(v.acctTranID, v.vochNumb)}>
                                    <FaCheckCircle />
                                </button>
                            )}
                            <button className="card-btn delete" onClick={() => handleDelete(v.acctTranID, v.vochNumb)}>
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                    <div className="voucher-card-body">
                        <div className="info-row">
                            <span>Type:</span>
                            <span className="voucher-type">{getVoucherTypeName(v.vochType)}</span>
                        </div>
                        <div className="info-row">
                            <span>Status:</span>
                            <span className={`status-badge ${v.isPosted ? 'posted' : 'pending'}`}>
                                {v.isPosted ? 'Posted' : 'Pending'}
                            </span>
                        </div>
                        {v.tranDesc && (
                            <div className="info-row description">
                                {v.tranDesc}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="voucher-page-premium">
            <PageHeader
                title="Voucher Management"
                icon={<FaList />}
                addButtonText="Manual Journal"
                onAdd={() => setShowManualJournal(true)}
            />

            {/* ✅ Centralized SearchFilterBar */}
            <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search by voucher # or description..."
                onRefresh={loadVouchers}
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

            {/* Loading State */}
            {loading && (
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            )}

            {/* List View */}
            {!loading && showList && (
                displayVouchers.length > 0 ? (
                    <>
                        {renderCardView()}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <span>Page {currentPage} of {totalPages}</span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyState
                        icon={<FaList />}
                        title="No vouchers found"
                        description="Try adjusting your filters"
                        action={
                            <Button variant="primary" onClick={resetFilters}>
                                Clear Filters
                            </Button>
                        }
                    />
                )
            )}

            {/* Empty State - No Data */}
            {!loading && vouchers.length === 0 && !showList && (
                <EmptyState
                    icon={<FaList />}
                    title="No vouchers yet"
                    description="Get started by creating a manual journal"
                    action={
                        <Button variant="primary" onClick={() => setShowManualJournal(true)} icon={<FaPlus />}>
                            Manual Journal
                        </Button>
                    }
                />
            )}

            {/* Modal */}
            {showManualJournal && (
                <ManualJournalPopup
                    voucherTypes={voucherTypes}
                    onClose={() => setShowManualJournal(false)}
                    onSaved={loadVouchers}
                />
            )}
        </div>
    );
}