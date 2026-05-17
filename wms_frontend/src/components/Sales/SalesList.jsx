import React, { useEffect, useState } from "react";
import salesApi from "../../api/salesApi";
import { FaEdit, FaTrash, FaBuilding, FaCalendarAlt, FaBoxes, FaShoppingCart, FaUser, FaFileInvoice, FaChevronDown, FaChevronUp, FaSearch, FaFilter, FaTimes, FaWarehouse } from "react-icons/fa";
import { formatNumber } from "../../utils/numberFormatter";
import Select from "react-select";
import "./Sales.css";

const SalesList = ({ reload, onEdit, onDeleted }) => {
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [totalPages, setTotalPages] = useState(1);

    const [showSalesList, setShowSalesList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        invoiceNumber: "",
        customerName: "",
        fromDate: "",
        toDate: "",
        saleType: ""
    });

    const formatDateDisplay = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('en', { month: 'short' });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const loadSales = async () => {
        setLoading(true);
        try {
            const res = await salesApi.getAll();
            let salesData = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                salesData = res.data.data;
            } else if (Array.isArray(res.data)) {
                salesData = res.data;
            }

            const formattedData = salesData.map(sale => ({
                ...sale,
                netAmnt: sale.totlAmnt || sale.netAmnt || 0,
                totalQuantity: sale.totalQuantity || sale.totlQnty || 0,
                itemCount: sale.items?.length || sale.itemCount || 0,
                customerName: sale.walkingCustomer || sale.custName || sale.customerName || "Cash Customer",
                billNumb: sale.billNumb || sale.invoiceNo || `INV-${sale.tranNumb}`,
                tranType: sale.tranMode === "Credit" ? "Credit" : "Cash",
                items: sale.items || []
            }));

            setSales(formattedData);
            setFilteredSales(formattedData);
            setTotalPages(Math.ceil(formattedData.length / itemsPerPage));
            setCurrentPage(1);
        } catch (err) {
            console.error("Error loading sales list:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSales();
    }, [reload]);

    const applyFilters = () => {
        let filtered = [...sales];

        if (filters.invoiceNumber) {
            const term = filters.invoiceNumber.toLowerCase();
            filtered = filtered.filter(s =>
                (s.billNumb || "").toLowerCase().includes(term)
            );
        }

        if (filters.customerName) {
            const term = filters.customerName.toLowerCase();
            filtered = filtered.filter(s =>
                (s.customerName || "").toLowerCase().includes(term)
            );
        }

        if (filters.saleType) {
            filtered = filtered.filter(s => s.tranType === filters.saleType);
        }

        if (filters.fromDate) {
            const fromDate = new Date(filters.fromDate);
            fromDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(s => {
                if (!s.tranDate) return false;
                const sDate = new Date(s.tranDate);
                sDate.setHours(0, 0, 0, 0);
                return sDate >= fromDate;
            });
        }

        if (filters.toDate) {
            const toDate = new Date(filters.toDate);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(s => {
                if (!s.tranDate) return false;
                const sDate = new Date(s.tranDate);
                sDate.setHours(0, 0, 0, 0);
                return sDate <= toDate;
            });
        }

        setFilteredSales(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        setCurrentPage(1);
        setShowSalesList(true);
    };

    const resetFilters = () => {
        setFilters({
            invoiceNumber: "",
            customerName: "",
            fromDate: "",
            toDate: "",
            saleType: ""
        });
        setFilteredSales(sales);
        setTotalPages(Math.ceil(sales.length / itemsPerPage));
        setShowSalesList(false);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleDelete = async (tranNumb) => {
        if (!window.confirm("Are you sure you want to delete this sale?")) return;
        try {
            await salesApi.delete(tranNumb);
            onDeleted();
            if (showSalesList) applyFilters();
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const saleTypeOptions = [
        { value: "Cash", label: "Cash" },
        { value: "Credit", label: "Credit" }
    ];

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSales = filteredSales.slice(indexOfFirstItem, indexOfLastItem);

    const totalStats = {
        total: sales.length,
        totalAmount: sales.reduce((sum, s) => sum + (s.netAmnt || 0), 0)
    };

    if (loading && sales.length === 0) {
        return (
            <div className="sales-loading">
                <div className="loading-spinner"></div>
                <p>Loading sales...</p>
            </div>
        );
    }

    return (
        <div className="sales-list-container">
            {/* Filters Section */}
            <div className="sales-filters-section">
                <div className="sales-filters-header">
                    <button className="sales-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                        <FaFilter />
                        <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
                    </button>
                    {showSalesList && (
                        <button className="sales-clear-filters" onClick={resetFilters}>
                            <FaTimes />
                            <span>Clear All</span>
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="sales-filters-grid">
                        <div className="sales-filter-group">
                            <label><FaFileInvoice /> Invoice Number</label>
                            <input
                                type="text"
                                placeholder="Search by invoice number..."
                                value={filters.invoiceNumber}
                                onChange={(e) => handleFilterChange('invoiceNumber', e.target.value)}
                                className="sales-filter-input"
                            />
                        </div>

                        <div className="sales-filter-group">
                            <label><FaUser /> Customer Name</label>
                            <input
                                type="text"
                                placeholder="Search by customer name..."
                                value={filters.customerName}
                                onChange={(e) => handleFilterChange('customerName', e.target.value)}
                                className="sales-filter-input"
                            />
                        </div>

                        <div className="sales-filter-group">
                            <label>Sale Type</label>
                            <Select
                                options={saleTypeOptions}
                                value={saleTypeOptions.find(opt => opt.value === filters.saleType)}
                                onChange={(selected) => handleFilterChange('saleType', selected?.value)}
                                isClearable
                                isSearchable
                                placeholder="Select sale type"
                                className="sales-filter-select"
                                classNamePrefix="sales-react-select"
                            />
                        </div>

                        <div className="sales-filter-group">
                            <label><FaCalendarAlt /> From Date</label>
                            <input type="date" value={filters.fromDate} onChange={(e) => handleFilterChange('fromDate', e.target.value)} className="sales-filter-input" />
                        </div>

                        <div className="sales-filter-group">
                            <label><FaCalendarAlt /> To Date</label>
                            <input type="date" value={filters.toDate} onChange={(e) => handleFilterChange('toDate', e.target.value)} className="sales-filter-input" />
                        </div>
                    </div>
                )}

                <div className="sales-search-action">
                    <button className="sales-btn-search" onClick={applyFilters}>
                        <FaSearch /> Search Sales
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="sales-stats-grid">
                <div className="sales-stat-card">
                    <div className="sales-stat-icon"><FaShoppingCart /></div>
                    <div className="sales-stat-info">
                        <span className="sales-stat-label">Total Sales</span>
                        <span className="sales-stat-value">{totalStats.total}</span>
                    </div>
                </div>
                <div className="sales-stat-card">
                    <div className="sales-stat-icon"><FaBoxes /></div>
                    <div className="sales-stat-info">
                        <span className="sales-stat-label">Total Amount</span>
                        <span className="sales-stat-value">{formatNumber(totalStats.totalAmount)}</span>
                    </div>
                </div>
            </div>

            {/* Initial State */}
            {!loading && !showSalesList && sales.length > 0 && (
                <div className="sales-search-prompt">
                    <FaSearch className="sales-search-prompt-icon" />
                    <h3>Search Sales</h3>
                    <p>Use filters above to search and view sales records</p>
                    <button className="sales-btn-show-all" onClick={applyFilters}>Show All Sales</button>
                </div>
            )}

            {/* No Results */}
            {!loading && showSalesList && filteredSales.length === 0 && (
                <div className="sales-no-results">
                    <FaSearch className="sales-no-results-icon" />
                    <p>No sales found matching your criteria</p>
                    <button className="sales-btn-clear-filters" onClick={resetFilters}>Clear Filters</button>
                </div>
            )}

            {/* Sales Grid */}
            {!loading && showSalesList && filteredSales.length > 0 && (
                <>
                    <div className="sales-grid">
                        {currentSales.map(sale => (
                            <div key={sale.tranNumb} className={`sale-card ${expandedId === sale.tranNumb ? 'expanded' : ''}`}>
                                <div className="sale-card-header" onClick={() => toggleExpand(sale.tranNumb)}>
                                    <div className="sale-card-icon">
                                        <FaShoppingCart />
                                    </div>
                                    <div className="sale-card-title">
                                        <h3>Invoice: {sale.billNumb}</h3>
                                        <div className="sale-card-meta">
                                            <span><FaCalendarAlt /> {formatDateDisplay(sale.tranDate)}</span>
                                            <span><FaUser /> {sale.customerName}</span>
                                            <span className={`sale-type-badge ${sale.tranType?.toLowerCase()}`}>
                                                {sale.tranType === "Credit" ? "Credit" : "Cash"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="sale-card-actions" onClick={(e) => e.stopPropagation()}>
                                        <button className="sale-card-action-btn sale-edit-btn" onClick={() => onEdit(sale.tranNumb)} title="Edit Sale">
                                            <FaEdit />
                                        </button>
                                        <button className="sale-card-action-btn sale-delete-btn" onClick={() => handleDelete(sale.tranNumb)} title="Delete Sale">
                                            <FaTrash />
                                        </button>
                                        <button className={`sale-card-action-btn sale-expand-btn ${expandedId === sale.tranNumb ? 'expanded' : ''}`}>
                                            {expandedId === sale.tranNumb ? <FaChevronUp /> : <FaChevronDown />}
                                        </button>
                                    </div>
                                </div>

                                <div className="sale-card-details">
                                    <div className="sale-detail-row">
                                        <div className="sale-detail-item">
                                            <FaBoxes className="sale-detail-icon" />
                                            <div>
                                                <span className="sale-detail-label">Items</span>
                                                <span className="sale-detail-value">{sale.itemCount || 0} items</span>
                                            </div>
                                        </div>
                                        <div className="sale-detail-item">
                                            <FaBoxes className="sale-detail-icon" />
                                            <div>
                                                <span className="sale-detail-label">Total Quantity</span>
                                                <span className="sale-detail-value">{formatNumber(sale.totalQuantity || 0, 0)} units</span>
                                            </div>
                                        </div>
                                        <div className="sale-detail-item">
                                            <FaShoppingCart className="sale-detail-icon" />
                                            <div>
                                                <span className="sale-detail-label">Total Amount</span>
                                                <span className="sale-detail-value sale-total-amount">{formatNumber(sale.netAmnt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {sale.tranDesc && (
                                        <div className="sale-detail-row">
                                            <div className="sale-detail-item full-width">
                                                <span className="sale-detail-label">Remarks</span>
                                                <span className="sale-detail-value">{sale.tranDesc}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Expanded Items - FIXED */}
                                {expandedId === sale.tranNumb && sale.items && sale.items.length > 0 && (
                                    <div className="sale-card-expanded">
                                        <div className="sale-expanded-header">
                                            <h4>Sale Items Details</h4>
                                        </div>
                                        <div className="sale-expanded-items">
                                            <table className="sale-expanded-table">
                                                <thead>
                                                    <tr>
                                                        <th>Item Name</th>
                                                        <th>Model</th>
                                                        <th>Quantity</th>
                                                        <th>Rate</th>
                                                        <th>Amount</th>
                                                        <th>Godown</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sale.items.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td>{item.itemName || '-'}</td>
                                                            <td>{item.modlNumb || '-'}</td>
                                                            <td>{formatNumber(item.quantity || item.saleQnty || 0, 0)}</td>
                                                            <td>{formatNumber(item.rate || item.saleRate || 0)}</td>
                                                            <td className="sale-amount-cell">{formatNumber((item.quantity || item.saleQnty || 0) * (item.rate || item.saleRate || 0))}</td>
                                                            <td>{item.godownName || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="sale-total-row">
                                                        <td colSpan="2"><strong>Total</strong></td>
                                                        <td><strong>{formatNumber(sale.totalQuantity || 0, 0)}</strong></td>
                                                        <td></td>
                                                        <td className="sale-total-amount"><strong>{formatNumber(sale.netAmnt)}</strong></td>
                                                        <td></td>
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
                    {filteredSales.length > 0 && totalPages > 1 && (
                        <div className="sales-pagination">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="sales-pagination-btn">Previous</button>
                            <span className="sales-page-info">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="sales-pagination-btn">Next</button>
                        </div>
                    )}
                </>
            )}

            {/* No Sales in Database */}
            {!loading && sales.length === 0 && !showSalesList && (
                <div className="sales-no-sales">
                    <FaShoppingCart className="sales-no-data-icon" />
                    <p>No sales found</p>
                </div>
            )}
        </div>
    );
};

export default SalesList;