import React, { useState, useEffect } from "react";
import salesReturnApi from "../../api/salesReturnApi";
import SalesReturnPopup from "./SalesReturnPopup";
import PrintSlip from "../../components/common/PrintSlip";
import { formatNumber } from "../../utils/numberUtils";
import { formatDate } from "../../utils/dateUtils";
import {
    FaUndo, FaPlus, FaEdit, FaTrash,
    FaFileInvoice, FaUser, FaCalendarAlt, FaBoxes,
    FaChevronDown, FaChevronUp, FaPrint
} from "react-icons/fa";
import { Button, useDialog } from "../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../components/features";
import "./SalesReturn.css";

export default function SalesReturnPage() {
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
        billNumber: "", customerName: "", fromDate: "", toDate: ""
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { showConfirm, showSuccess, showError } = useDialog();

    const loadReturns = async () => {
        setLoading(true);
        try {
            const res = await salesReturnApi.getAll();
            let returnsData = res.data?.data || res.data || [];
            const formattedData = returnsData.map(item => ({
                ...item,
                customerName: item.walkingCustomer || item.custName || "Cash Customer",
                billNumb: item.billNumb || `SR-${item.returnTranNumb}`,
                netAmnt: item.totlAmnt || 0,
                totalQuantity: item.totlQnty || 0,
                itemCount: item.items?.length || 0,
                items: item.items || []
            }));
            const sortedData = [...formattedData].sort((a, b) => new Date(b.tranDate) - new Date(a.tranDate));
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
                (r.customerName || '').toLowerCase().includes(term)
            );
        }

        // Filters
        if (filters.billNumber) {
            filtered = filtered.filter(r =>
                (r.billNumb || '').toLowerCase().includes(filters.billNumber.toLowerCase())
            );
        }
        if (filters.customerName) {
            filtered = filtered.filter(r =>
                (r.customerName || '').toLowerCase().includes(filters.customerName.toLowerCase())
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
        setFilters({ billNumber: "", customerName: "", fromDate: "", toDate: "" });
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
    const hasActiveFilters = filters.billNumber || filters.customerName ||
        filters.fromDate || filters.toDate;

    // CRUD Operations
    const handleAdd = () => {
        setSelectedReturn(null);
        setShowPopup(true);
    };

    const handleEdit = (item) => {
        setSelectedReturn(item.returnTranNumb);
        setShowPopup(true);
    };

    const handlePrint = (item) => {
        setPrintData({ module: 'salereturn', id: item.returnTranNumb });
    };

    const handleDelete = (id, billNumb) => {
        showConfirm(`Delete return "${billNumb}"?`, async () => {
            try {
                await salesReturnApi.delete(id);
                await loadReturns();
                if (showList) applyFilters();
                showSuccess(`"${billNumb}" deleted!`);
            } catch (err) {
                showError("Failed to delete return");
            }
        }, 'Delete Return');
    };

    // Toggle expand with lazy loading
    const toggleExpand = async (returnTranNumb) => {
        if (expandedRow === returnTranNumb) {
            setExpandedRow(null);
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
                setFilteredReturns(prev => prev.map(item =>
                    item.returnTranNumb === returnTranNumb
                        ? { ...item, items: returnData.items || [] }
                        : item
                ));
                setExpandedRow(returnTranNumb);
            } catch (err) {
                console.error("Failed to load items", err);
            }
        }
    };

    // Pagination
    const displayReturns = filteredReturns;
    const totalPages = Math.ceil(displayReturns.length / itemsPerPage);
    const currentItems = displayReturns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                placeholder="Customer Name"
                value={filters.customerName}
                onChange={(e) => handleFilterChange('customerName', e.target.value)}
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
        <div className="sr-cards-grid">
            {currentItems.map(r => (
                <div key={r.returnTranNumb} className={`sr-card ${expandedRow === r.returnTranNumb ? 'expanded' : ''}`}>
                    <div className="sr-card-header" onClick={() => toggleExpand(r.returnTranNumb)}>
                        <FaUndo className="card-icon" />
                        <div className="card-info">
                            <h4>{r.billNumb}</h4>
                            <span><FaUser /> {r.customerName}</span>
                        </div>
                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                            <button className="card-btn print" onClick={() => handlePrint(r)} title="Print Slip">
                                <FaPrint />
                            </button>
                            <button className="card-btn expand">
                                {expandedRow === r.returnTranNumb ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                            <button className="card-btn edit" onClick={() => handleEdit(r)}>
                                <FaEdit />
                            </button>
                            <button className="card-btn delete" onClick={() => handleDelete(r.returnTranNumb, r.billNumb)}>
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                    <div className="sr-card-body">
                        <div className="info-row">
                            <FaCalendarAlt /> {formatDate(r.tranDate)}
                        </div>
                        <div className="info-row">
                            <FaFileInvoice /> Sale: {r.saleTranNumb || '-'}
                        </div>
                        <div className="info-row">
                            <FaBoxes /> {r.itemCount} items | {formatNumber(r.totalQuantity, 0)} qty
                        </div>
                        <div className="info-row total">
                            Total: <strong>{formatNumber(r.netAmnt)}</strong>
                        </div>
                    </div>
                    {expandedRow === r.returnTranNumb && r.items?.length > 0 && (
                        <div className="sr-card-expanded">
                            <table className="expanded-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Sold</th>
                                        <th>Return</th>
                                        <th>Rate</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {r.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.itemName}</td>
                                            <td>{formatNumber(item.soldQnty || 0, 0)}</td>
                                            <td>{formatNumber(item.returnQnty || 0, 0)}</td>
                                            <td>{formatNumber(item.rate || 0)}</td>
                                            <td>{formatNumber((item.returnQnty || 0) * (item.rate || 0))}</td>
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
        <div className="sr-page-premium">
            <PageHeader
                title="Sale Return Management"
                icon={<FaUndo />}
                addButtonText="Add Sale Return"
                onAdd={handleAdd}
            />

            {/* ✅ Centralized SearchFilterBar */}
            <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search by bill or customer..."
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
                        icon={<FaUndo />}
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
                    icon={<FaUndo />}
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
                <SalesReturnPopup
                    tranNumb={selectedReturn}
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