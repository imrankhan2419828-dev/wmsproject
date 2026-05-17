import React, { useEffect, useState } from "react";
import paymentApi from "../../api/paymentApi";
import { FaMoneyBillWave, FaEdit, FaTrash, FaBuilding, FaCalendarAlt, FaWallet, FaChartLine, FaCreditCard, FaChevronDown, FaChevronUp, FaSearch, FaFilter, FaTimes, FaUser } from "react-icons/fa";
import { formatNumber } from "../../utils/numberFormatter";
import Select from "react-select";
import "./PaymentPage.css";

const PaymentList = ({ onEdit, onRefresh }) => {
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [expandedDetails, setExpandedDetails] = useState({});
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [totalPages, setTotalPages] = useState(1);

    // UI State
    const [showPaymentList, setShowPaymentList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Filter State
    const [filters, setFilters] = useState({
        voucherNumber: "",
        partyName: "",
        paymentType: "",
        fromDate: "",
        toDate: ""
    });

    // Date format: 16-Apr-2026
    const formatDateDisplay = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('en', { month: 'short' });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await paymentApi.getAll();
            let paymentsData = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                paymentsData = res.data.data;
            } else if (Array.isArray(res.data)) {
                paymentsData = res.data;
            }

            const formattedData = paymentsData.map(p => ({
                ...p,
                partyName: p.walkingParty || p.referenceName || "-",
                displayDate: p.paymentDate,
                netAmnt: p.amount || 0,
                voucherNumb: p.voucherNumb || `PAY-${p.paymentID}`,
                paymentTypeLabel: p.paymentType === "SUPPLIER" ? "Supplier" :
                    p.paymentType === "BANK" ? "Bank" :
                        p.paymentType === "EXPENSE" ? "Expense" : "Other"
            }));

            setPayments(formattedData);
            setFilteredPayments(formattedData);
            setTotalPages(Math.ceil(formattedData.length / itemsPerPage));
            setCurrentPage(1);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const applyFilters = () => {
        let filtered = [...payments];

        if (filters.voucherNumber) {
            const term = filters.voucherNumber.toLowerCase();
            filtered = filtered.filter(p =>
                (p.voucherNumb || "").toLowerCase().includes(term)
            );
        }

        if (filters.partyName) {
            const term = filters.partyName.toLowerCase();
            filtered = filtered.filter(p =>
                (p.partyName || "").toLowerCase().includes(term)
            );
        }

        if (filters.paymentType) {
            filtered = filtered.filter(p => p.paymentType === filters.paymentType);
        }

        if (filters.fromDate) {
            const fromDate = new Date(filters.fromDate);
            fromDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(p => {
                if (!p.paymentDate) return false;
                const pDate = new Date(p.paymentDate);
                pDate.setHours(0, 0, 0, 0);
                return pDate >= fromDate;
            });
        }

        if (filters.toDate) {
            const toDate = new Date(filters.toDate);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(p => {
                if (!p.paymentDate) return false;
                const pDate = new Date(p.paymentDate);
                pDate.setHours(0, 0, 0, 0);
                return pDate <= toDate;
            });
        }

        setFilteredPayments(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        setCurrentPage(1);
        setShowPaymentList(true);
    };

    const resetFilters = () => {
        setFilters({
            voucherNumber: "",
            partyName: "",
            paymentType: "",
            fromDate: "",
            toDate: ""
        });
        setFilteredPayments(payments);
        setTotalPages(Math.ceil(payments.length / itemsPerPage));
        setShowPaymentList(false);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleDelete = async (paymentId) => {
        if (!window.confirm("Are you sure you want to delete this payment?")) return;
        try {
            await paymentApi.delete(paymentId);
            fetchPayments();
            if (showPaymentList) applyFilters();
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const toggleExpand = async (paymentId) => {
        if (expandedId === paymentId) {
            setExpandedId(null);
        } else {
            try {
                const res = await paymentApi.getById(paymentId);
                const paymentData = res.data?.data || res.data;
                setExpandedDetails(prev => ({
                    ...prev,
                    [paymentId]: {
                        details: paymentData.details || [],
                        description: paymentData.description || ""
                    }
                }));
                setExpandedId(paymentId);
            } catch (err) {
                console.error("Failed to load details", err);
            }
        }
    };

    // Payment type options for dropdown
    const paymentTypeOptions = [
        { value: "SUPPLIER", label: "Supplier Payment" },
        { value: "BANK", label: "Bank Payment" },
        { value: "EXPENSE", label: "Expense Payment" },
        { value: "OTHER", label: "Other Payment" }
    ];

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);

    const totalStats = {
        total: payments.length,
        totalAmount: payments.reduce((sum, p) => sum + (p.netAmnt || 0), 0)
    };

    if (loading && payments.length === 0) {
        return (
            <div className="pm-loading">
                <div className="pm-loading-spinner"></div>
                <p>Loading payments...</p>
            </div>
        );
    }

    return (
        <div className="pm-list-container">
            {/* Filters Section */}
            <div className="pm-filters-section">
                <div className="pm-filters-header">
                    <button className="pm-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                        <FaFilter />
                        <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
                    </button>
                    {showPaymentList && (
                        <button className="pm-clear-filters" onClick={resetFilters}>
                            <FaTimes />
                            <span>Clear All</span>
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="pm-filters-grid">
                        <div className="pm-filter-group">
                            <label><FaWallet /> Voucher Number</label>
                            <input
                                type="text"
                                placeholder="Search by voucher number..."
                                value={filters.voucherNumber}
                                onChange={(e) => handleFilterChange('voucherNumber', e.target.value)}
                                className="pm-filter-input"
                            />
                        </div>

                        <div className="pm-filter-group">
                            <label><FaUser /> Party Name</label>
                            <input
                                type="text"
                                placeholder="Search by party name..."
                                value={filters.partyName}
                                onChange={(e) => handleFilterChange('partyName', e.target.value)}
                                className="pm-filter-input"
                            />
                        </div>

                        <div className="pm-filter-group">
                            <label>Payment Type</label>
                            <Select
                                options={paymentTypeOptions}
                                value={paymentTypeOptions.find(opt => opt.value === filters.paymentType)}
                                onChange={(selected) => handleFilterChange('paymentType', selected?.value)}
                                isClearable
                                isSearchable
                                placeholder="Select payment type"
                                className="pm-filter-select"
                                classNamePrefix="pm-react-select"
                            />
                        </div>

                        <div className="pm-filter-group">
                            <label><FaCalendarAlt /> From Date</label>
                            <input type="date" value={filters.fromDate} onChange={(e) => handleFilterChange('fromDate', e.target.value)} className="pm-filter-input" />
                        </div>

                        <div className="pm-filter-group">
                            <label><FaCalendarAlt /> To Date</label>
                            <input type="date" value={filters.toDate} onChange={(e) => handleFilterChange('toDate', e.target.value)} className="pm-filter-input" />
                        </div>
                    </div>
                )}

                <div className="pm-search-action">
                    <button className="pm-btn-search" onClick={applyFilters}>
                        <FaSearch /> Search Payments
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="pm-stats-grid">
                <div className="pm-stat-card">
                    <div className="pm-stat-icon"><FaWallet /></div>
                    <div className="pm-stat-info">
                        <span className="pm-stat-label">Total Payments</span>
                        <span className="pm-stat-value">{totalStats.total}</span>
                    </div>
                </div>
                <div className="pm-stat-card">
                    <div className="pm-stat-icon"><FaChartLine /></div>
                    <div className="pm-stat-info">
                        <span className="pm-stat-label">Total Amount</span>
                        <span className="pm-stat-value">{formatNumber(totalStats.totalAmount)}</span>
                    </div>
                </div>
            </div>

            {/* Initial State */}
            {!loading && !showPaymentList && payments.length > 0 && (
                <div className="pm-search-prompt">
                    <FaSearch className="pm-search-prompt-icon" />
                    <h3>Search Payments</h3>
                    <p>Use filters above to search and view payment records</p>
                    <button className="pm-btn-show-all" onClick={applyFilters}>Show All Payments</button>
                </div>
            )}

            {/* No Results */}
            {!loading && showPaymentList && filteredPayments.length === 0 && (
                <div className="pm-no-results">
                    <FaSearch className="pm-no-results-icon" />
                    <p>No payments found matching your criteria</p>
                    <button className="pm-btn-clear-filters" onClick={resetFilters}>Clear Filters</button>
                </div>
            )}

            {/* Payments Grid */}
            {!loading && showPaymentList && filteredPayments.length > 0 && (
                <>
                    <div className="pm-grid">
                        {currentPayments.map(p => (
                            <div key={p.paymentID} className={`pm-card ${expandedId === p.paymentID ? 'expanded' : ''}`}>
                                <div className="pm-card-header" onClick={() => toggleExpand(p.paymentID)}>
                                    <div className="pm-card-icon">
                                        <FaMoneyBillWave />
                                    </div>
                                    <div className="pm-card-title">
                                        <h3>Voucher: {p.voucherNumb}</h3>
                                        <div className="pm-card-meta">
                                            <span><FaCalendarAlt /> {formatDateDisplay(p.displayDate)}</span>
                                            <span><FaBuilding /> {p.partyName}</span>
                                            <span className="pm-type-badge">{p.paymentTypeLabel}</span>
                                        </div>
                                    </div>
                                    <div className="pm-card-actions" onClick={(e) => e.stopPropagation()}>
                                        <button className="pm-card-action-btn pm-edit-btn" onClick={() => onEdit(p)} title="Edit Payment">
                                            <FaEdit />
                                        </button>
                                        <button className="pm-card-action-btn pm-delete-btn" onClick={() => handleDelete(p.paymentID)} title="Delete Payment">
                                            <FaTrash />
                                        </button>
                                        <button className={`pm-card-action-btn pm-expand-btn ${expandedId === p.paymentID ? 'expanded' : ''}`}>
                                            {expandedId === p.paymentID ? <FaChevronUp /> : <FaChevronDown />}
                                        </button>
                                    </div>
                                </div>

                                <div className="pm-card-details">
                                    <div className="pm-detail-row">
                                        <div className="pm-detail-item">
                                            <FaWallet className="pm-detail-icon" />
                                            <div>
                                                <span className="pm-detail-label">Amount</span>
                                                <span className="pm-detail-value pm-total-amount">{formatNumber(p.netAmnt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedId === p.paymentID && expandedDetails[p.paymentID] && (
                                    <div className="pm-card-expanded">
                                        <div className="pm-expanded-header">
                                            <h4>Payment Details</h4>
                                        </div>

                                        {expandedDetails[p.paymentID].details && expandedDetails[p.paymentID].details.length > 0 && (
                                            <div className="pm-expanded-items">
                                                <table className="pm-expanded-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Payment Mode</th>
                                                            <th>Bank Account</th>
                                                            <th>Cheque No.</th>
                                                            <th>Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {expandedDetails[p.paymentID].details.map((detail, idx) => (
                                                            <tr key={idx}>
                                                                <td>{detail.paymentMode === "CASH" ? "💵 Cash" : detail.paymentMode === "BANK" ? "🏦 Bank Transfer" : "📝 Cheque"}</td>
                                                                <td>{detail.bankAccountName || "-"}</td>
                                                                <td>{detail.chequeNo || "-"}</td>
                                                                <td className="pm-amount-cell">{formatNumber(detail.amount)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="pm-total-row">
                                                            <td colSpan="3"><strong>Total</strong></td>
                                                            <td className="pm-total-amount"><strong>{formatNumber(p.netAmnt)}</strong></td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        )}

                                        {expandedDetails[p.paymentID].description && (
                                            <div className="pm-description-section">
                                                <h5>Remarks</h5>
                                                <p>{expandedDetails[p.paymentID].description}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {filteredPayments.length > 0 && totalPages > 1 && (
                        <div className="pm-pagination">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="pm-pagination-btn">Previous</button>
                            <span className="pm-page-info">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="pm-pagination-btn">Next</button>
                        </div>
                    )}
                </>
            )}

            {/* No Payments in Database */}
            {!loading && payments.length === 0 && !showPaymentList && (
                <div className="pm-no-payments">
                    <FaMoneyBillWave className="pm-no-data-icon" />
                    <p>No payments found</p>
                </div>
            )}
        </div>
    );
};

export default PaymentList;