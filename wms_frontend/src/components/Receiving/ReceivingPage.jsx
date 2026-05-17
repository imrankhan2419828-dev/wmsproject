import React, { useEffect, useState } from "react";
import receivingApi from "../../api/receivingApi";
import ReceivingPopup from "./ReceivingPopup";
import PrintSlip from "../../components/common/PrintSlip";
import { formatNumber } from "../../utils/numberUtils";
import { formatDate } from "../../utils/dateUtils";
import {
    FaMoneyBillWave, FaPlus, FaEdit, FaTrash,
    FaBuilding, FaCalendarAlt, FaChevronDown, FaChevronUp, FaPrint
} from "react-icons/fa";
import { Button, useDialog } from "../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../components/features";
import "./ReceivingPage.css";

export default function ReceivingPage() {
    const [receivings, setReceivings] = useState([]);
    const [filteredReceivings, setFilteredReceivings] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);
    const [expandedDetails, setExpandedDetails] = useState({});
    const [printData, setPrintData] = useState(null);

    // SearchFilterBar States
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filters State
    const [filters, setFilters] = useState({
        voucherNumber: "", partyName: "", fromDate: "", toDate: ""
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { showConfirm, showSuccess, showError } = useDialog();

    const loadReceivings = async () => {
        setLoading(true);
        try {
            const res = await receivingApi.getAll();
            let data = res.data?.data || res.data || [];
            const formatted = data.map(r => ({
                ...r,
                displayParty: r.walkingCustomer || r.partyName || r.accountName || "-",
                netAmnt: r.totalAmount || 0,
                voucherNumb: r.voucherNumb || `REC-${r.id}`
            }));
            const sorted = [...formatted].sort((a, b) => new Date(b.receiveDate) - new Date(a.receiveDate));
            setReceivings(sorted);
            setFilteredReceivings(sorted);
        } catch (err) {
            console.error("Load error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadReceivings(); }, []);

    // Apply all filters
    const applyFilters = () => {
        let filtered = [...receivings];

        // Search term filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(r =>
                (r.voucherNumb || '').toLowerCase().includes(term) ||
                (r.displayParty || '').toLowerCase().includes(term)
            );
        }

        // Filters
        if (filters.voucherNumber) {
            filtered = filtered.filter(r =>
                (r.voucherNumb || '').toLowerCase().includes(filters.voucherNumber.toLowerCase())
            );
        }
        if (filters.partyName) {
            filtered = filtered.filter(r =>
                (r.displayParty || '').toLowerCase().includes(filters.partyName.toLowerCase())
            );
        }
        if (filters.fromDate) {
            filtered = filtered.filter(r => r.receiveDate >= filters.fromDate);
        }
        if (filters.toDate) {
            filtered = filtered.filter(r => r.receiveDate <= filters.toDate);
        }

        setFilteredReceivings(filtered);
        setCurrentPage(1);
        setShowList(true);
    };

    // Reset all filters
    const resetFilters = () => {
        setFilters({ voucherNumber: "", partyName: "", fromDate: "", toDate: "" });
        setSearchTerm("");
        setFilteredReceivings(receivings);
        setCurrentPage(1);
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
    const hasActiveFilters = filters.voucherNumber || filters.partyName ||
        filters.fromDate || filters.toDate;

    // CRUD Operations
    const handleAdd = () => {
        setSelectedId(null);
        setShowPopup(true);
    };

    const handleEdit = (id) => {
        setSelectedId(id);
        setShowPopup(true);
    };

    const handlePrint = (item) => {
        setPrintData({ module: 'receiving', id: item.id });
    };

    const handleDelete = (id, voucher) => {
        showConfirm(`Delete receipt "${voucher}"?`, async () => {
            try {
                await receivingApi.delete(id);
                await loadReceivings();
                if (showList) applyFilters();
                showSuccess(`"${voucher}" deleted!`);
            } catch (err) {
                showError("Failed to delete");
            }
        }, 'Delete Receipt');
    };

    // Toggle expand with lazy loading
    const toggleExpand = async (id) => {
        if (expandedRow === id) {
            setExpandedRow(null);
        } else {
            try {
                const res = await receivingApi.getById(id);
                const data = res.data?.data || res.data;
                setExpandedDetails(prev => ({
                    ...prev,
                    [id]: {
                        cashList: data.cashList || [],
                        chequeList: data.chequeList || [],
                        remarks: data.remarks || ""
                    }
                }));
                setExpandedRow(id);
            } catch (err) {
                console.error("Failed to load details", err);
            }
        }
    };

    // Pagination
    const displayReceivings = filteredReceivings;
    const totalPages = Math.ceil(displayReceivings.length / itemsPerPage);
    const currentItems = displayReceivings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Filter Components for SearchFilterBar
    const filterComponents = (
        <>
            <input
                type="text"
                placeholder="Voucher Number"
                value={filters.voucherNumber}
                onChange={(e) => handleFilterChange('voucherNumber', e.target.value)}
                className="filter-input"
            />

            <input
                type="text"
                placeholder="Party Name"
                value={filters.partyName}
                onChange={(e) => handleFilterChange('partyName', e.target.value)}
                className="filter-input"
            />

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
        <div className="rec-cards-grid">
            {currentItems.map(r => (
                <div key={r.id} className={`rec-card ${expandedRow === r.id ? 'expanded' : ''}`}>
                    <div className="rec-card-header" onClick={() => toggleExpand(r.id)}>
                        <FaMoneyBillWave className="card-icon" />
                        <div className="card-info">
                            <h4>{r.voucherNumb}</h4>
                            <span><FaBuilding /> {r.displayParty}</span>
                        </div>
                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                            <button className="card-btn print" onClick={() => handlePrint(r)} title="Print Slip">
                                <FaPrint />
                            </button>
                            <button className="card-btn expand">
                                {expandedRow === r.id ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                            <button className="card-btn edit" onClick={() => handleEdit(r.id)}>
                                <FaEdit />
                            </button>
                            <button className="card-btn delete" onClick={() => handleDelete(r.id, r.voucherNumb)}>
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                    <div className="rec-card-body">
                        <div className="info-row">
                            <FaCalendarAlt /> {formatDate(r.receiveDate)}
                        </div>
                        <div className="info-row">
                            Cash: {formatNumber(r.totalCash || 0)} | Cheque: {formatNumber(r.totalCheque || 0)}
                        </div>
                        <div className="info-row total">
                            Total: <strong>{formatNumber(r.netAmnt)}</strong>
                        </div>
                    </div>
                    {expandedRow === r.id && expandedDetails[r.id] && (
                        <div className="rec-card-expanded">
                            {expandedDetails[r.id].cashList?.length > 0 && (
                                <table className="expanded-table">
                                    <thead>
                                        <tr>
                                            <th>Cash</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expandedDetails[r.id].cashList.map((c, i) => (
                                            <tr key={i}>
                                                <td>Entry #{i + 1}</td>
                                                <td>{formatNumber(c.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {expandedDetails[r.id].chequeList?.length > 0 && (
                                <table className="expanded-table">
                                    <thead>
                                        <tr>
                                            <th>Bank</th>
                                            <th>Cheque No.</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expandedDetails[r.id].chequeList.map((c, i) => (
                                            <tr key={i}>
                                                <td>{c.bankName}</td>
                                                <td>{c.chequeNumber}</td>
                                                <td>{formatNumber(c.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {expandedDetails[r.id].remarks && (
                                <div className="description">{expandedDetails[r.id].remarks}</div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="rec-page-premium">
            <PageHeader
                title="Receipt Management"
                icon={<FaMoneyBillWave />}
                addButtonText="New Receipt"
                onAdd={handleAdd}
            />

            {/* ✅ Centralized SearchFilterBar */}
            <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search by voucher or party..."
                onRefresh={loadReceivings}
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
                displayReceivings.length > 0 ? (
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
                        icon={<FaMoneyBillWave />}
                        title="No receipts found"
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
            {!loading && receivings.length === 0 && (
                <EmptyState
                    icon={<FaMoneyBillWave />}
                    title="No receipts yet"
                    description="Get started by adding your first receipt"
                    action={
                        <Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>
                            Add Receipt
                        </Button>
                    }
                />
            )}

            {/* Modals */}
            {showPopup && (
                <ReceivingPopup
                    editId={selectedId}
                    onClose={() => setShowPopup(false)}
                    onSaved={loadReceivings}
                />
            )}

            {printData && (
                <PrintSlip {...printData} onClose={() => setPrintData(null)} />
            )}
        </div>
    );
}