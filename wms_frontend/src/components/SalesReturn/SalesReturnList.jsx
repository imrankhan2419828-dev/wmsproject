import React, { useEffect, useState } from "react";
import salesReturnApi from "../../api/salesReturnApi";
import { FaUndo, FaEdit, FaTrash, FaBuilding, FaCalendarAlt, FaBoxes, FaUser, FaFileInvoice, FaChevronDown, FaChevronUp, FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import { formatNumber } from "../../utils/numberFormatter";
import Select from "react-select";
import "./SalesReturn.css";

const SalesReturnList = ({ onEdit }) => {
    const [returns, setReturns] = useState([]);
    const [filteredReturns, setFilteredReturns] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [totalPages, setTotalPages] = useState(1);

    // UI State
    const [showReturnList, setShowReturnList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Filter State
    const [filters, setFilters] = useState({
        billNumber: "",
        customerName: "",
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

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await salesReturnApi.getAll();
            let returnsData = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                returnsData = res.data.data;
            } else if (Array.isArray(res.data)) {
                returnsData = res.data;
            }

            const formattedData = returnsData.map(item => ({
                ...item,
                customerName: item.walkingCustomer || item.custName || "Cash Customer",
                billNumb: item.billNumb || `SR-${item.returnTranNumb}`,
                netAmnt: item.totlAmnt || 0,
                totalQuantity: item.totlQnty || 0,
                itemCount: item.items?.length || 0,
                items: item.items || []
            }));

            setReturns(formattedData);
            setFilteredReturns(formattedData);
            setTotalPages(Math.ceil(formattedData.length / itemsPerPage));
            setCurrentPage(1);
        } catch (err) {
            console.error("Load error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const applyFilters = () => {
        let filtered = [...returns];

        if (filters.billNumber) {
            const term = filters.billNumber.toLowerCase();
            filtered = filtered.filter(r =>
                (r.billNumb || "").toLowerCase().includes(term)
            );
        }

        if (filters.customerName) {
            const term = filters.customerName.toLowerCase();
            filtered = filtered.filter(r =>
                (r.customerName || "").toLowerCase().includes(term)
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
        setShowReturnList(true);
    };

    const resetFilters = () => {
        setFilters({
            billNumber: "",
            customerName: "",
            fromDate: "",
            toDate: ""
        });
        setFilteredReturns(returns);
        setTotalPages(Math.ceil(returns.length / itemsPerPage));
        setShowReturnList(false);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleDelete = async (returnTranNumb) => {
        if (!window.confirm("Delete this sale return?")) return;
        try {
            await salesReturnApi.delete(returnTranNumb);
            loadData();
            if (showReturnList) applyFilters();
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const toggleExpand = async (returnTranNumb) => {
        if (expandedId === returnTranNumb) {
            setExpandedId(null);
        } else {
            try {
                const res = await salesReturnApi.getByReturnTranNumb(returnTranNumb);
                let returnData = res.data?.data || res.data;
                const updatedReturns = returns.map(item =>
                    item.returnTranNumb === returnTranNumb
                        ? { ...item, items: returnData.items || [] }
                        : item
                );
                setReturns(updatedReturns);
                setFilteredReturns(updatedReturns);
                setExpandedId(returnTranNumb);
            } catch (err) {
                console.error("Failed to load items", err);
            }
        }
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReturns = filteredReturns.slice(indexOfFirstItem, indexOfLastItem);

    const totalStats = {
        total: returns.length,
        totalAmount: returns.reduce((sum, r) => sum + (r.netAmnt || 0), 0)
    };

    if (loading && returns.length === 0) {
        return (
            <div className="sr-loading">
                <div className="sr-loading-spinner"></div>
                <p>Loading sale returns...</p>
            </div>
        );
    }

    return (
        <div className="sr-list-container">
            {/* Filters Section */}
            <div className="sr-filters-section">
                <div className="sr-filters-header">
                    <button className="sr-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                        <FaFilter />
                        <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
                    </button>
                    {showReturnList && (
                        <button className="sr-clear-filters" onClick={resetFilters}>
                            <FaTimes />
                            <span>Clear All</span>
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="sr-filters-grid">
                        <div className="sr-filter-group">
                            <label><FaFileInvoice /> Bill Number</label>
                            <input
                                type="text"
                                placeholder="Search by bill number..."
                                value={filters.billNumber}
                                onChange={(e) => handleFilterChange('billNumber', e.target.value)}
                                className="sr-filter-input"
                            />
                        </div>

                        <div className="sr-filter-group">
                            <label><FaUser /> Customer Name</label>
                            <input
                                type="text"
                                placeholder="Search by customer name..."
                                value={filters.customerName}
                                onChange={(e) => handleFilterChange('customerName', e.target.value)}
                                className="sr-filter-input"
                            />
                        </div>

                        <div className="sr-filter-group">
                            <label><FaCalendarAlt /> From Date</label>
                            <input type="date" value={filters.fromDate} onChange={(e) => handleFilterChange('fromDate', e.target.value)} className="sr-filter-input" />
                        </div>

                        <div className="sr-filter-group">
                            <label><FaCalendarAlt /> To Date</label>
                            <input type="date" value={filters.toDate} onChange={(e) => handleFilterChange('toDate', e.target.value)} className="sr-filter-input" />
                        </div>
                    </div>
                )}

                <div className="sr-search-action">
                    <button className="sr-btn-search" onClick={applyFilters}>
                        <FaSearch /> Search Returns
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="sr-stats-grid">
                <div className="sr-stat-card">
                    <div className="sr-stat-icon"><FaUndo /></div>
                    <div className="sr-stat-info">
                        <span className="sr-stat-label">Total Returns</span>
                        <span className="sr-stat-value">{totalStats.total}</span>
                    </div>
                </div>
                <div className="sr-stat-card">
                    <div className="sr-stat-icon"><FaBoxes /></div>
                    <div className="sr-stat-info">
                        <span className="sr-stat-label">Total Return Amount</span>
                        <span className="sr-stat-value">{formatNumber(totalStats.totalAmount)}</span>
                    </div>
                </div>
            </div>

            {/* Initial State */}
            {!loading && !showReturnList && returns.length > 0 && (
                <div className="sr-search-prompt">
                    <FaSearch className="sr-search-prompt-icon" />
                    <h3>Search Returns</h3>
                    <p>Use filters above to search and view return records</p>
                    <button className="sr-btn-show-all" onClick={applyFilters}>Show All Returns</button>
                </div>
            )}

            {/* No Results */}
            {!loading && showReturnList && filteredReturns.length === 0 && (
                <div className="sr-no-results">
                    <FaSearch className="sr-no-results-icon" />
                    <p>No returns found matching your criteria</p>
                    <button className="sr-btn-clear-filters" onClick={resetFilters}>Clear Filters</button>
                </div>
            )}

            {/* Returns Grid */}
            {!loading && showReturnList && filteredReturns.length > 0 && (
                <>
                    <div className="sr-grid">
                        {currentReturns.map(sr => (
                            <div key={sr.returnTranNumb} className={`sr-card ${expandedId === sr.returnTranNumb ? 'expanded' : ''}`}>
                                <div className="sr-card-header" onClick={() => toggleExpand(sr.returnTranNumb)}>
                                    <div className="sr-card-icon">
                                        <FaUndo />
                                    </div>
                                    <div className="sr-card-title">
                                        <h3>Return Bill: {sr.billNumb}</h3>
                                        <div className="sr-card-meta">
                                            <span><FaCalendarAlt /> {formatDateDisplay(sr.tranDate)}</span>
                                            <span><FaUser /> {sr.customerName}</span>
                                        </div>
                                    </div>
                                    <div className="sr-card-actions" onClick={(e) => e.stopPropagation()}>
                                        <button className="sr-card-action-btn sr-edit-btn" onClick={() => onEdit(sr.returnTranNumb)} title="Edit Return">
                                            <FaEdit />
                                        </button>
                                        <button className="sr-card-action-btn sr-delete-btn" onClick={() => handleDelete(sr.returnTranNumb)} title="Delete Return">
                                            <FaTrash />
                                        </button>
                                        <button className={`sr-card-action-btn sr-expand-btn ${expandedId === sr.returnTranNumb ? 'expanded' : ''}`}>
                                            {expandedId === sr.returnTranNumb ? <FaChevronUp /> : <FaChevronDown />}
                                        </button>
                                    </div>
                                </div>

                                <div className="sr-card-details">
                                    <div className="sr-detail-row">
                                        <div className="sr-detail-item">
                                            <FaFileInvoice className="sr-detail-icon" />
                                            <div>
                                                <span className="sr-detail-label">Sale Bill</span>
                                                <span className="sr-detail-value">{sr.saleTranNumb}</span>
                                            </div>
                                        </div>
                                        <div className="sr-detail-item">
                                            <FaBoxes className="sr-detail-icon" />
                                            <div>
                                                <span className="sr-detail-label">Items Returned</span>
                                                <span className="sr-detail-value">{sr.itemCount || 0} items</span>
                                            </div>
                                        </div>
                                        <div className="sr-detail-item">
                                            <FaBoxes className="sr-detail-icon" />
                                            <div>
                                                <span className="sr-detail-label">Total Quantity</span>
                                                <span className="sr-detail-value">{formatNumber(sr.totalQuantity || 0, 0)} units</span>
                                            </div>
                                        </div>
                                        <div className="sr-detail-item">
                                            <FaUndo className="sr-detail-icon" />
                                            <div>
                                                <span className="sr-detail-label">Total Amount</span>
                                                <span className="sr-detail-value sr-total-amount">{formatNumber(sr.netAmnt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Items */}
                                {expandedId === sr.returnTranNumb && sr.items && sr.items.length > 0 && (
                                    <div className="sr-card-expanded">
                                        <div className="sr-expanded-header">
                                            <h4>Return Items Details</h4>
                                        </div>
                                        <div className="sr-expanded-items">
                                            <table className="sr-expanded-table">
                                                <thead>
                                                    <tr>
                                                        <th>Item Name</th>
                                                        <th>Model</th>
                                                        <th>Sold Qty</th>
                                                        <th>Return Qty</th>
                                                        <th>Rate</th>
                                                        <th>Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sr.items.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td>{item.itemName || '-'}</td>
                                                            <td>{item.modlNumb || '-'}</td>
                                                            <td>{formatNumber(item.soldQnty || 0, 0)}</td>
                                                            <td>{formatNumber(item.returnQnty || 0, 0)}</td>
                                                            <td>{formatNumber(item.rate || 0)}</td>
                                                            <td className="sr-amount-cell">{formatNumber((item.returnQnty || 0) * (item.rate || 0))}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="sr-total-row">
                                                        <td colSpan="4"><strong>Total</strong></td>
                                                        <td><strong>{formatNumber(sr.totalQuantity || 0, 0)}</strong></td>
                                                        <td className="sr-total-amount"><strong>{formatNumber(sr.netAmnt)}</strong></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {filteredReturns.length > 0 && totalPages > 1 && (
                        <div className="sr-pagination">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="sr-pagination-btn">Previous</button>
                            <span className="sr-page-info">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="sr-pagination-btn">Next</button>
                        </div>
                    )}
                </>
            )}

            {/* No Returns in Database */}
            {!loading && returns.length === 0 && !showReturnList && (
                <div className="sr-no-returns">
                    <FaUndo className="sr-no-data-icon" />
                    <p>No sale returns found</p>
                </div>
            )}
        </div>
    );
};

export default SalesReturnList;