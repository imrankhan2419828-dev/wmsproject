import React, { useState, useEffect } from "react";
import salesApi from "../../api/salesApi";
import SalesPopup from "./SalesPopup";
import PrintSlip from "../../components/common/PrintSlip";
import { formatNumber } from "../../utils/numberUtils";
import { formatDate } from "../../utils/dateUtils";
import {
    FaShoppingCart, FaPlus, FaEdit, FaTrash,
    FaFileInvoice, FaUser, FaCalendarAlt, FaBoxes,
    FaChevronDown, FaChevronUp, FaPrint
} from "react-icons/fa";
import { Button, useDialog } from "../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../components/features";
import "./Sales.css";

export default function SalesPage() {
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [selectedSale, setSelectedSale] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);
    const [printData, setPrintData] = useState(null);

    // SearchFilterBar States
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filters State
    const [filters, setFilters] = useState({
        invoiceNumber: "", customerName: "", fromDate: "", toDate: "", saleType: ""
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { showConfirm, showSuccess, showError } = useDialog();

    const loadSales = async () => {
        setLoading(true);
        try {
            const res = await salesApi.getAll();
            let salesData = res.data?.data || res.data || [];
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
            const sortedData = [...formattedData].sort((a, b) => new Date(b.tranDate) - new Date(a.tranDate));
            setSales(sortedData);
            setFilteredSales(sortedData);
        } catch (err) {
            console.error("Load error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadSales(); }, []);

    // Apply all filters
    const applyFilters = () => {
        let filtered = [...sales];

        // Search term filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(s =>
                (s.billNumb || '').toLowerCase().includes(term) ||
                (s.customerName || '').toLowerCase().includes(term)
            );
        }

        // Filters
        if (filters.invoiceNumber) {
            filtered = filtered.filter(s =>
                (s.billNumb || '').toLowerCase().includes(filters.invoiceNumber.toLowerCase())
            );
        }
        if (filters.customerName) {
            filtered = filtered.filter(s =>
                (s.customerName || '').toLowerCase().includes(filters.customerName.toLowerCase())
            );
        }
        if (filters.saleType) {
            filtered = filtered.filter(s => s.tranType === filters.saleType);
        }
        if (filters.fromDate) {
            filtered = filtered.filter(s => s.tranDate >= filters.fromDate);
        }
        if (filters.toDate) {
            filtered = filtered.filter(s => s.tranDate <= filters.toDate);
        }

        setFilteredSales(filtered);
        setCurrentPage(1);
        setShowList(true);
    };

    // Reset all filters
    const resetFilters = () => {
        setFilters({ invoiceNumber: "", customerName: "", fromDate: "", toDate: "", saleType: "" });
        setSearchTerm("");
        setFilteredSales(sales);
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
    const hasActiveFilters = filters.invoiceNumber || filters.customerName ||
        filters.fromDate || filters.toDate || filters.saleType;

    // CRUD Operations
    const handleAdd = () => {
        setSelectedSale(null);
        setShowPopup(true);
    };

    const handleEdit = (sale) => {
        setSelectedSale(sale.tranNumb);
        setShowPopup(true);
    };

    const handlePrint = (sale) => {
        setPrintData({ module: 'sale', id: sale.tranNumb });
    };

    const handleDelete = (tranNumb, billNumb) => {
        showConfirm(`Delete sale "${billNumb}"?`, async () => {
            try {
                await salesApi.delete(tranNumb);
                await loadSales();
                if (showList) applyFilters();
                showSuccess(`"${billNumb}" deleted!`);
            } catch (err) {
                showError("Failed to delete sale");
            }
        }, 'Delete Sale');
    };

    // Pagination
    const displaySales = filteredSales;
    const totalPages = Math.ceil(displaySales.length / itemsPerPage);
    const currentItems = displaySales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const toggleExpand = (id) => setExpandedRow(expandedRow === id ? null : id);

    // Filter Components for SearchFilterBar
    const filterComponents = (
        <>
            <input
                type="text"
                placeholder="Invoice Number"
                value={filters.invoiceNumber}
                onChange={(e) => handleFilterChange('invoiceNumber', e.target.value)}
                className="filter-input"
            />

            <input
                type="text"
                placeholder="Customer Name"
                value={filters.customerName}
                onChange={(e) => handleFilterChange('customerName', e.target.value)}
                className="filter-input"
            />

            <select
                value={filters.saleType}
                onChange={(e) => handleFilterChange('saleType', e.target.value)}
                className="filter-select"
            >
                <option value="">All Types</option>
                <option value="Cash">Cash</option>
                <option value="Credit">Credit</option>
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
        <div className="sales-cards-grid">
            {currentItems.map(s => (
                <div key={s.tranNumb} className={`sales-card ${expandedRow === s.tranNumb ? 'expanded' : ''}`}>
                    <div className="sales-card-header" onClick={() => toggleExpand(s.tranNumb)}>
                        <FaShoppingCart className="card-icon" />
                        <div className="card-info">
                            <h4>{s.billNumb}</h4>
                            <span><FaUser /> {s.customerName}</span>
                        </div>
                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                            <button className="card-btn print" onClick={() => handlePrint(s)} title="Print Slip">
                                <FaPrint />
                            </button>
                            <button className="card-btn expand">
                                {expandedRow === s.tranNumb ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                            <button className="card-btn edit" onClick={() => handleEdit(s)}>
                                <FaEdit />
                            </button>
                            <button className="card-btn delete" onClick={() => handleDelete(s.tranNumb, s.billNumb)}>
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                    <div className="sales-card-body">
                        <div className="info-row">
                            <FaCalendarAlt /> {formatDate(s.tranDate)}
                        </div>
                        <div className="info-row">
                            <FaBoxes /> {s.itemCount} items | {formatNumber(s.totalQuantity, 0)} qty
                        </div>
                        <div className="info-row total">
                            Total: <strong>{formatNumber(s.netAmnt)}</strong>
                        </div>
                    </div>
                    {expandedRow === s.tranNumb && s.items?.length > 0 && (
                        <div className="sales-card-expanded">
                            <table className="expanded-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Qty</th>
                                        <th>Rate</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {s.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.itemName}</td>
                                            <td>{item.quantity || item.saleQnty || 0}</td>
                                            <td>{formatNumber(item.rate || item.saleRate || 0)}</td>
                                            <td>{formatNumber((item.quantity || item.saleQnty || 0) * (item.rate || item.saleRate || 0))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="sales-page-premium">
            <PageHeader
                title="Sales Management"
                icon={<FaShoppingCart />}
                addButtonText="New Sale"
                onAdd={handleAdd}
            />

            {/* ✅ Centralized SearchFilterBar */}
            <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search by invoice or customer..."
                onRefresh={loadSales}
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
                displaySales.length > 0 ? (
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
                        icon={<FaShoppingCart />}
                        title="No sales found"
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
            {!loading && sales.length === 0 && (
                <EmptyState
                    icon={<FaShoppingCart />}
                    title="No sales yet"
                    description="Get started by adding your first sale"
                    action={
                        <Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>
                            Add Sale
                        </Button>
                    }
                />
            )}

            {/* Modals */}
            {showPopup && (
                <SalesPopup
                    tranNumb={selectedSale}
                    onClose={() => setShowPopup(false)}
                    onSaved={loadSales}
                />
            )}

            {printData && (
                <PrintSlip {...printData} onClose={() => setPrintData(null)} />
            )}
        </div>
    );
}