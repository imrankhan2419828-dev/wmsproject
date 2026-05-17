import React, { useEffect, useState } from "react";
import purchaseReturnApi from "../../api/purchaseReturnApi";
import { FaEdit, FaTrash, FaBuilding, FaCalendarAlt, FaBoxes, FaFileInvoice, FaExchangeAlt, FaChevronDown, FaChevronUp, FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import { formatNumber } from "../../utils/numberFormatter";
import Select from "react-select";
import "./PurchaseReturn.css";

const PurchaseReturnList = ({ onEdit, reload }) => {
    const [returns, setReturns] = useState([]);
    const [filteredReturns, setFilteredReturns] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [totalPages, setTotalPages] = useState(1);

    const [showPurchaseList, setShowPurchaseList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        billNumber: "",
        supplierName: "",
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

    const load = async () => {
        setLoading(true);
        try {
            const res = await purchaseReturnApi.getAll();
            let returnsData = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                returnsData = res.data.data;
            } else if (Array.isArray(res.data)) {
                returnsData = res.data;
            }

            const processedData = returnsData.map(r => ({
                ...r,
                supplierName: r.supplierName || r.supplier || "Unknown",
                billNumb: r.billNumb || r.billNumber || r.returnBillNo || `RET-${r.returnID}`,
                tranDate: r.tranDate
            }));

            setReturns(processedData);
            setFilteredReturns(processedData);
            setTotalPages(Math.ceil(processedData.length / itemsPerPage));
            setCurrentPage(1);
        } catch (error) {
            console.error("Load error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [reload]);

    const applyFilters = () => {
        let filtered = [...returns];

        if (filters.billNumber) {
            const term = filters.billNumber.toLowerCase();
            filtered = filtered.filter(r =>
                (r.billNumb || "").toLowerCase().includes(term)
            );
        }

        if (filters.supplierName) {
            const term = filters.supplierName.toLowerCase();
            filtered = filtered.filter(r =>
                (r.supplierName || "").toLowerCase().includes(term)
            );
        }

        if (filters.fromDate) {
            const fromDate = new Date(filters.fromDate);
            fromDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(r => {
                if (!r.tranDate) return false;
                const rDate = new Date(r.tranDate);
                rDate.setHours(0, 0, 0, 0);
                return rDate >= fromDate;
            });
        }

        if (filters.toDate) {
            const toDate = new Date(filters.toDate);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(r => {
                if (!r.tranDate) return false;
                const rDate = new Date(r.tranDate);
                rDate.setHours(0, 0, 0, 0);
                return rDate <= toDate;
            });
        }

        setFilteredReturns(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        setCurrentPage(1);
        setShowPurchaseList(true);
    };

    const resetFilters = () => {
        setFilters({
            billNumber: "",
            supplierName: "",
            fromDate: "",
            toDate: ""
        });
        setFilteredReturns(returns);
        setTotalPages(Math.ceil(returns.length / itemsPerPage));
        setShowPurchaseList(false);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this purchase return?")) return;
        try {
            await purchaseReturnApi.delete(id);
            load();
            if (showPurchaseList) applyFilters();
        } catch (error) {
            alert("Delete failed: " + error.message);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const calculateTotal = (items) => {
        return items.reduce((sum, item) => sum + (item.returnQty * item.purcRate), 0);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReturns = filteredReturns.slice(indexOfFirstItem, indexOfLastItem);

    const totalStats = {
        total: returns.length,
        totalAmount: returns.reduce((sum, r) => sum + calculateTotal(r.items || []), 0)
    };

    if (loading && returns.length === 0) {
        return (
            <div className="pr-loading">
                <div className="pr-loading-spinner"></div>
                <p>Loading purchase returns...</p>
            </div>
        );
    }

    return (
        <div className="pr-list-container">
            {/* Filters Section */}
            <div className="pr-filters-section">
                <div className="pr-filters-header">
                    <button className="pr-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                        <FaFilter />
                        <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
                    </button>
                    {showPurchaseList && (
                        <button className="pr-clear-filters" onClick={resetFilters}>
                            <FaTimes />
                            <span>Clear All</span>
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="pr-filters-grid">
                        <div className="pr-filter-group">
                            <label><FaFileInvoice /> Bill Number</label>
                            <input
                                type="text"
                                placeholder="Search by bill number..."
                                value={filters.billNumber}
                                onChange={(e) => handleFilterChange('billNumber', e.target.value)}
                                className="pr-filter-input"
                            />
                        </div>

                        <div className="pr-filter-group">
                            <label><FaBuilding /> Supplier Name</label>
                            <input
                                type="text"
                                placeholder="Search by supplier name..."
                                value={filters.supplierName}
                                onChange={(e) => handleFilterChange('supplierName', e.target.value)}
                                className="pr-filter-input"
                            />
                        </div>

                        <div className="pr-filter-group">
                            <label><FaCalendarAlt /> From Date</label>
                            <input type="date" value={filters.fromDate} onChange={(e) => handleFilterChange('fromDate', e.target.value)} className="pr-filter-input" />
                        </div>

                        <div className="pr-filter-group">
                            <label><FaCalendarAlt /> To Date</label>
                            <input type="date" value={filters.toDate} onChange={(e) => handleFilterChange('toDate', e.target.value)} className="pr-filter-input" />
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button className="pr-btn-search" onClick={applyFilters}>
                        <FaSearch /> Search Returns
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="pr-stats-grid">
                <div className="pr-stat-card">
                    <div className="pr-stat-icon"><FaExchangeAlt /></div>
                    <div className="pr-stat-info">
                        <span className="pr-stat-label">Total Returns</span>
                        <span className="pr-stat-value">{totalStats.total}</span>
                    </div>
                </div>
                <div className="pr-stat-card">
                    <div className="pr-stat-icon"><FaExchangeAlt /></div>
                    <div className="pr-stat-info">
                        <span className="pr-stat-label">Total Return Amount</span>
                        <span className="pr-stat-value">{formatNumber(totalStats.totalAmount)}</span>
                    </div>
                </div>
            </div>

            {/* Initial State */}
            {!loading && !showPurchaseList && returns.length > 0 && (
                <div className="pr-search-prompt">
                    <FaSearch className="pr-search-prompt-icon" />
                    <h3>Search Returns</h3>
                    <p>Use filters above to search and view return records</p>
                    <button className="pr-btn-show-all" onClick={applyFilters}>Show All Returns</button>
                </div>
            )}

            {/* No Results */}
            {!loading && showPurchaseList && filteredReturns.length === 0 && (
                <div className="pr-no-results">
                    <FaSearch className="pr-no-results-icon" />
                    <p>No returns found matching your criteria</p>
                    <button className="pr-btn-show-all" onClick={resetFilters}>Clear Filters</button>
                </div>
            )}

            {/* Returns Grid */}
            {!loading && showPurchaseList && filteredReturns.length > 0 && (
                <>
                    <div className="pr-returns-grid">
                        {currentReturns.map(r => {
                            const totalAmount = calculateTotal(r.items || []);
                            return (
                                <div key={r.returnID} className={`pr-return-card ${expandedId === r.returnID ? 'expanded' : ''}`}>
                                    <div className="pr-return-card-header" onClick={() => toggleExpand(r.returnID)}>
                                        <div className="pr-return-card-icon">
                                            <FaExchangeAlt />
                                        </div>
                                        <div className="pr-return-card-title">
                                            <h3>Return Bill: {r.billNumb}</h3>
                                            <div className="pr-card-meta">
                                                <span><FaCalendarAlt /> {formatDateDisplay(r.tranDate)}</span>
                                                <span><FaBuilding /> {r.supplierName}</span>
                                            </div>
                                        </div>
                                        <div className="pr-return-card-actions" onClick={(e) => e.stopPropagation()}>
                                            <button className="pr-card-action-btn pr-expand-btn" onClick={() => toggleExpand(r.returnID)} title="View Details">
                                                {expandedId === r.returnID ? <FaChevronUp /> : <FaChevronDown />}
                                            </button>
                                            <button className="pr-card-action-btn pr-edit-btn" onClick={() => onEdit(r)} title="Edit Return">
                                                <FaEdit />
                                            </button>
                                            <button className="pr-card-action-btn pr-delete-btn" onClick={() => handleDelete(r.returnID)} title="Delete Return">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pr-return-card-details">
                                        <div className="pr-detail-row">
                                            <div className="pr-detail-item">
                                                <FaFileInvoice className="pr-detail-icon" />
                                                <div>
                                                    <span className="pr-detail-label">Purchase Bill</span>
                                                    <span className="pr-detail-value">{r.purchaseTranNumb || '-'}</span>
                                                </div>
                                            </div>
                                            <div className="pr-detail-item">
                                                <FaBoxes className="pr-detail-icon" />
                                                <div>
                                                    <span className="pr-detail-label">Items Returned</span>
                                                    <span className="pr-detail-value">{r.items?.length || 0} items</span>
                                                </div>
                                            </div>
                                            <div className="pr-detail-item">
                                                <FaExchangeAlt className="pr-detail-icon" />
                                                <div>
                                                    <span className="pr-detail-label">Total Amount</span>
                                                    <span className="pr-detail-value pr-total-amount">{formatNumber(totalAmount)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {r.tranDesc && (
                                            <div className="pr-detail-row">
                                                <div className="pr-detail-item full-width">
                                                    <span className="pr-detail-label">Remarks</span>
                                                    <span className="pr-detail-value">{r.tranDesc}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Expanded Items - With Fixed Scroll */}
                                    {expandedId === r.returnID && r.items && r.items.length > 0 && (
                                        <div className="pr-return-card-expanded">
                                            <div className="pr-expanded-header">
                                                <h4>Return Items Details</h4>
                                            </div>
                                            <div className="pr-expanded-items">
                                                <table className="pr-expanded-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Item Name</th>
                                                            <th>Model</th>
                                                            <th>Return Qty</th>
                                                            <th>Rate</th>
                                                            <th>Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {r.items.map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td>{item.itemName || 'N/A'}</td>
                                                                <td>{item.modlNumb || '-'}</td>
                                                                <td>{item.returnQty}</td>
                                                                <td>{formatNumber(item.purcRate)}</td>
                                                                <td className="pr-amount-cell">{formatNumber(item.returnQty * item.purcRate)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="pr-total-row">
                                                            <td colSpan="3"><strong>Total</strong></td>
                                                            <td></td>
                                                            <td className="pr-total-amount"><strong>{formatNumber(totalAmount)}</strong></td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {filteredReturns.length > 0 && totalPages > 1 && (
                        <div className="pr-pagination">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="pr-pagination-btn">Previous</button>
                            <span className="pr-page-info">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="pr-pagination-btn">Next</button>
                        </div>
                    )}
                </>
            )}

            {/* No Returns in Database */}
            {!loading && returns.length === 0 && !showPurchaseList && (
                <div className="pr-no-returns">
                    <FaExchangeAlt className="pr-no-data-icon" />
                    <p>No purchase returns found</p>
                </div>
            )}
        </div>
    );
};

export default PurchaseReturnList;