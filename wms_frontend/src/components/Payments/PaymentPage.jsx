import React, { useState, useEffect } from "react";
import paymentApi from "../../api/paymentApi";
import PaymentPopup from "./PaymentPopup";
import PrintSlip from "../../components/common/PrintSlip";
import { formatNumber } from "../../utils/numberUtils";
import { formatDate } from "../../utils/dateUtils";
import {
    FaMoneyBillWave, FaPlus, FaEdit, FaTrash,
    FaWallet, FaCalendarAlt, FaBuilding, FaUser,
    FaChevronDown, FaChevronUp, FaPrint
} from "react-icons/fa";
import { Button, useDialog } from "../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../components/features";
import "./PaymentPage.css";

export default function PaymentPage() {
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
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
        voucherNumber: "", partyName: "", paymentType: "", fromDate: "", toDate: ""
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { showConfirm, showSuccess, showError } = useDialog();

    const loadPayments = async () => {
        setLoading(true);
        try {
            const res = await paymentApi.getAll();
            let paymentsData = res.data?.data || res.data || [];
            const formattedData = paymentsData.map(p => ({
                ...p,
                partyName: p.walkingParty || p.referenceName || "-",
                netAmnt: p.amount || 0,
                voucherNumb: p.voucherNumb || `PAY-${p.paymentID}`,
                paymentTypeLabel: p.paymentType === "SUPPLIER" ? "Supplier" :
                    p.paymentType === "BANK" ? "Bank" :
                        p.paymentType === "EXPENSE" ? "Expense" : "Other"
            }));
            const sortedData = [...formattedData].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
            setPayments(sortedData);
            setFilteredPayments(sortedData);
        } catch (err) {
            console.error("Load error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadPayments(); }, []);

    // Apply all filters
    const applyFilters = () => {
        let filtered = [...payments];

        // Search term filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                (p.voucherNumb || '').toLowerCase().includes(term) ||
                (p.partyName || '').toLowerCase().includes(term)
            );
        }

        // Filters
        if (filters.voucherNumber) {
            filtered = filtered.filter(p =>
                (p.voucherNumb || '').toLowerCase().includes(filters.voucherNumber.toLowerCase())
            );
        }
        if (filters.partyName) {
            filtered = filtered.filter(p =>
                (p.partyName || '').toLowerCase().includes(filters.partyName.toLowerCase())
            );
        }
        if (filters.paymentType) {
            filtered = filtered.filter(p => p.paymentType === filters.paymentType);
        }
        if (filters.fromDate) {
            filtered = filtered.filter(p => p.paymentDate >= filters.fromDate);
        }
        if (filters.toDate) {
            filtered = filtered.filter(p => p.paymentDate <= filters.toDate);
        }

        setFilteredPayments(filtered);
        setCurrentPage(1);
        setShowList(true);
    };

    // Reset all filters
    const resetFilters = () => {
        setFilters({ voucherNumber: "", partyName: "", paymentType: "", fromDate: "", toDate: "" });
        setSearchTerm("");
        setFilteredPayments(payments);
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
        filters.paymentType || filters.fromDate || filters.toDate;

    // CRUD Operations
    const handleAdd = () => {
        setSelectedPayment(null);
        setShowPopup(true);
    };

    const handleEdit = (payment) => {
        setSelectedPayment(payment);
        setShowPopup(true);
    };

    const handlePrint = (payment) => {
        setPrintData({ module: 'payment', id: payment.paymentID });
    };

    const handleDelete = (id, voucher) => {
        showConfirm(`Delete payment "${voucher}"?`, async () => {
            try {
                await paymentApi.delete(id);
                await loadPayments();
                if (showList) applyFilters();
                showSuccess(`"${voucher}" deleted!`);
            } catch (err) {
                showError("Failed to delete payment");
            }
        }, 'Delete Payment');
    };

    // Toggle expand with lazy loading
    const toggleExpand = async (paymentId) => {
        if (expandedRow === paymentId) {
            setExpandedRow(null);
        } else {
            try {
                const res = await paymentApi.getById(paymentId);
                const data = res.data?.data || res.data;
                setExpandedDetails(prev => ({
                    ...prev,
                    [paymentId]: {
                        details: data.details || [],
                        description: data.description || ""
                    }
                }));
                setExpandedRow(paymentId);
            } catch (err) {
                console.error("Failed to load details", err);
            }
        }
    };

    // Pagination
    const displayPayments = filteredPayments;
    const totalPages = Math.ceil(displayPayments.length / itemsPerPage);
    const currentItems = displayPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

            <select
                value={filters.paymentType}
                onChange={(e) => handleFilterChange('paymentType', e.target.value)}
                className="filter-select"
            >
                <option value="">All Types</option>
                <option value="SUPPLIER">Supplier</option>
                <option value="BANK">Bank</option>
                <option value="EXPENSE">Expense</option>
                <option value="OTHER">Other</option>
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
        <div className="pm-cards-grid">
            {currentItems.map(p => (
                <div key={p.paymentID} className={`pm-card ${expandedRow === p.paymentID ? 'expanded' : ''}`}>
                    <div className="pm-card-header" onClick={() => toggleExpand(p.paymentID)}>
                        <FaMoneyBillWave className="card-icon" />
                        <div className="card-info">
                            <h4>{p.voucherNumb}</h4>
                            <span><FaUser /> {p.partyName}</span>
                        </div>
                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                            <button className="card-btn print" onClick={() => handlePrint(p)} title="Print Slip">
                                <FaPrint />
                            </button>
                            <button className="card-btn expand">
                                {expandedRow === p.paymentID ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                            <button className="card-btn edit" onClick={() => handleEdit(p)}>
                                <FaEdit />
                            </button>
                            <button className="card-btn delete" onClick={() => handleDelete(p.paymentID, p.voucherNumb)}>
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                    <div className="pm-card-body">
                        <div className="info-row">
                            <FaCalendarAlt /> {formatDate(p.paymentDate)}
                        </div>
                        <div className="info-row">
                            <FaBuilding /> {p.paymentTypeLabel}
                        </div>
                        <div className="info-row total">
                            Amount: <strong>{formatNumber(p.netAmnt)}</strong>
                        </div>
                    </div>
                    {expandedRow === p.paymentID && expandedDetails[p.paymentID] && (
                        <div className="pm-card-expanded">
                            {expandedDetails[p.paymentID].details?.length > 0 && (
                                <table className="expanded-table">
                                    <thead>
                                        <tr>
                                            <th>Mode</th>
                                            <th>Bank</th>
                                            <th>Cheque</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expandedDetails[p.paymentID].details.map((d, idx) => (
                                            <tr key={idx}>
                                                <td>{d.paymentMode === "CASH" ? "Cash" :
                                                    d.paymentMode === "BANK" ? "Bank" : "Cheque"}</td>
                                                <td>{d.bankAccountName || "-"}</td>
                                                <td>{d.chequeNo || "-"}</td>
                                                <td>{formatNumber(d.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            {expandedDetails[p.paymentID].description && (
                                <div className="description">{expandedDetails[p.paymentID].description}</div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="pm-page-premium">
            <PageHeader
                title="Payment Management"
                icon={<FaMoneyBillWave />}
                addButtonText="New Payment"
                onAdd={handleAdd}
            />

            {/* ✅ Centralized SearchFilterBar */}
            <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search by voucher or party..."
                onRefresh={loadPayments}
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
                displayPayments.length > 0 ? (
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
                        title="No payments found"
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
            {!loading && payments.length === 0 && (
                <EmptyState
                    icon={<FaMoneyBillWave />}
                    title="No payments yet"
                    description="Get started by adding your first payment"
                    action={
                        <Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>
                            Add Payment
                        </Button>
                    }
                />
            )}

            {/* Modals */}
            {showPopup && (
                <PaymentPopup
                    payment={selectedPayment}
                    onClose={() => setShowPopup(false)}
                    onSaved={loadPayments}
                />
            )}

            {printData && (
                <PrintSlip {...printData} onClose={() => setPrintData(null)} />
            )}
        </div>
    );
}