import React, { useState, useEffect } from "react";
import purchaseReturnApi from "../../api/purchaseReturnApi";
import PurchaseReturnPopup from "./PurchaseReturnPopup";
import PrintSlip from "../../components/common/PrintSlip";
import { formatNumber } from "../../utils/numberUtils";
import { formatDate } from "../../utils/dateUtils";
import {
    FaExchangeAlt, FaPlus, FaEdit, FaTrash,
    FaFileInvoice, FaBuilding, FaCalendarAlt, FaBoxes,
    FaChevronDown, FaChevronUp, FaPrint
} from "react-icons/fa";
import { Button, useDialog } from "../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../components/features";
import "./PurchaseReturn.css";

export default function PurchaseReturnPage() {
    const [returns, setReturns] = useState([]);
    const [filteredReturns, setFilteredReturns] = useState([]);
    const [selectedReturn, setSelectedReturn] = useState(null);
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
        billNumber: "", supplierName: "", fromDate: "", toDate: ""
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { showConfirm, showSuccess, showError } = useDialog();

    const loadReturns = async () => {
        setLoading(true);
        try {
            const res = await purchaseReturnApi.getAll();
            let returnsData = res.data?.data || res.data || [];
            const processedData = returnsData.map(r => ({
                ...r,
                supplierName: r.supplierName || r.supplier || "Unknown",
                billNumb: r.billNumb || r.billNumber || r.returnBillNo || `RET-${r.returnID}`,
            }));
            const sortedData = [...processedData].sort((a, b) => new Date(b.tranDate) - new Date(a.tranDate));
            setReturns(sortedData);
            setFilteredReturns(sortedData);
        } catch (err) {
            console.error("Load error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadReturns(); }, []);

    // Apply all filters
    const applyFilters = () => {
        let filtered = [...returns];

        // Search term filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(r =>
                (r.billNumb || '').toLowerCase().includes(term) ||
                (r.supplierName || '').toLowerCase().includes(term)
            );
        }

        // Filters
        if (filters.billNumber) {
            filtered = filtered.filter(r =>
                (r.billNumb || '').toLowerCase().includes(filters.billNumber.toLowerCase())
            );
        }
        if (filters.supplierName) {
            filtered = filtered.filter(r =>
                (r.supplierName || '').toLowerCase().includes(filters.supplierName.toLowerCase())
            );
        }
        if (filters.fromDate) {
            filtered = filtered.filter(r => r.tranDate >= filters.fromDate);
        }
        if (filters.toDate) {
            filtered = filtered.filter(r => r.tranDate <= filters.toDate);
        }

        setFilteredReturns(filtered);
        setCurrentPage(1);
        setShowList(true);
    };

    // Reset all filters
    const resetFilters = () => {
        setFilters({ billNumber: "", supplierName: "", fromDate: "", toDate: "" });
        setSearchTerm("");
        setFilteredReturns(returns);
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
    const hasActiveFilters = filters.billNumber || filters.supplierName || filters.fromDate || filters.toDate;

    // CRUD Operations
    const handleAdd = () => {
        setSelectedReturn(null);
        setShowPopup(true);
    };

    const handleEdit = (item) => {
        setSelectedReturn(item);
        setShowPopup(true);
    };

    const handlePrint = (returnData) => {
        setPrintData({ module: 'purchasereturn', id: returnData.returnID });
    };

    const handleDelete = (id, billNumb) => {
        showConfirm(`Delete return "${billNumb}"?`, async () => {
            try {
                await purchaseReturnApi.delete(id);
                await loadReturns();
                if (showList) applyFilters();
                showSuccess(`"${billNumb}" deleted!`);
            } catch (err) {
                showError("Failed to delete return");
            }
        }, 'Delete Return');
    };

    const calculateTotal = (items) => items?.reduce((sum, i) => sum + (i.returnQty * i.purcRate), 0) || 0;

    // Pagination
    const displayReturns = filteredReturns;
    const totalPages = Math.ceil(displayReturns.length / itemsPerPage);
    const currentItems = displayReturns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const toggleExpand = (id) => setExpandedRow(expandedRow === id ? null : id);

    // Filter Components for SearchFilterBar
    const filterComponents = (
        <>
            <input
                type="text"
                placeholder="Bill Number"
                value={filters.billNumber}
                onChange={(e) => handleFilterChange('billNumber', e.target.value)}
                className="filter-input"
            />

            <input
                type="text"
                placeholder="Supplier Name"
                value={filters.supplierName}
                onChange={(e) => handleFilterChange('supplierName', e.target.value)}
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
        <div className="pr-cards-grid">
            {currentItems.map(r => {
                const totalAmount = calculateTotal(r.items);
                return (
                    <div key={r.returnID} className={`pr-card ${expandedRow === r.returnID ? 'expanded' : ''}`}>
                        <div className="pr-card-header" onClick={() => toggleExpand(r.returnID)}>
                            <FaExchangeAlt className="card-icon" />
                            <div className="card-info">
                                <h4>{r.billNumb}</h4>
                                <span><FaBuilding /> {r.supplierName}</span>
                            </div>
                            <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                                <button className="card-btn print" onClick={() => handlePrint(r)} title="Print Slip">
                                    <FaPrint />
                                </button>
                                <button className="card-btn expand">
                                    {expandedRow === r.returnID ? <FaChevronUp /> : <FaChevronDown />}
                                </button>
                                <button className="card-btn edit" onClick={() => handleEdit(r)}>
                                    <FaEdit />
                                </button>
                                <button className="card-btn delete" onClick={() => handleDelete(r.returnID, r.billNumb)}>
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                        <div className="pr-card-body">
                            <div className="info-row">
                                <FaCalendarAlt /> {formatDate(r.tranDate)}
                            </div>
                            <div className="info-row">
                                <FaFileInvoice /> Purchase: {r.purchaseTranNumb || '-'}
                            </div>
                            <div className="info-row">
                                <FaBoxes /> {r.items?.length || 0} items
                            </div>
                            <div className="info-row total">
                                Total: <strong>{formatNumber(totalAmount)}</strong>
                            </div>
                        </div>
                        {expandedRow === r.returnID && r.items?.length > 0 && (
                            <div className="pr-card-expanded">
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
                                        {r.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.itemName}</td>
                                                <td>{item.returnQty}</td>
                                                <td>{formatNumber(item.purcRate)}</td>
                                                <td>{formatNumber(item.returnQty * item.purcRate)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="pr-page-premium">
            <PageHeader
                title="Purchase Returns"
                icon={<FaExchangeAlt />}
                addButtonText="Add Return"
                onAdd={handleAdd}
            />

            {/* ✅ Centralized SearchFilterBar */}
            <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search by bill number or supplier..."
                onRefresh={loadReturns}
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
                displayReturns.length > 0 ? (
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
                        icon={<FaExchangeAlt />}
                        title="No returns found"
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
            {!loading && returns.length === 0 && (
                <EmptyState
                    icon={<FaExchangeAlt />}
                    title="No returns yet"
                    description="Get started by adding your first return"
                    action={
                        <Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>
                            Add Return
                        </Button>
                    }
                />
            )}

            {/* Modals */}
            {showPopup && (
                <PurchaseReturnPopup
                    editData={selectedReturn}
                    onClose={() => setShowPopup(false)}
                    onSaved={loadReturns}
                />
            )}

            {printData && (
                <PrintSlip {...printData} onClose={() => setPrintData(null)} />
            )}
        </div>
    );
}