import React, { useEffect, useState } from "react";
import purchaseApi from "../../api/purchaseApi";
import companyApi from "../../api/companyApi";
import categoryApi from "../../api/categoryApi";
import subcategoryApi from "../../api/subcategoryApi";
import itemApi from "../../api/itemApi";
import godownApi from "../../api/godownApi";
import PurchasePopup from "./PurchasePopup";
import PrintSlip from "../../components/common/PrintSlip";
import { formatNumber } from "../../utils/numberUtils";
import {
    FaShoppingCart, FaPlus, FaEdit, FaTrash,
    FaFileInvoice, FaBuilding, FaCalendarAlt, FaBoxes,
    FaChevronDown, FaChevronUp, FaPrint
} from "react-icons/fa";
import { Button, useDialog } from "../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../components/features";
import "./PurchasePage.css";

// Item cache
const ITEM_CACHE = {};
const FAILED_REQUESTS = {};

export default function PurchasePage() {
    const [purchases, setPurchases] = useState([]);
    const [filteredPurchases, setFilteredPurchases] = useState([]);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);
    const [printData, setPrintData] = useState(null);

    // SearchFilterBar States
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Dropdown Data
    const [companies, setCompanies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [items, setItems] = useState([]);
    const [godowns, setGodowns] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    // Filters State
    const [filters, setFilters] = useState({
        supplierId: "", companyId: "", categoryId: "", subcategoryId: "",
        itemId: "", godownId: "", fromDate: "", toDate: "", tranType: ""
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { showConfirm, showSuccess, showError } = useDialog();

    const formatDateDisplay = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('en', { month: 'short' });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Load dropdown data
    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const [companiesRes, categoriesRes, itemsRes, godownsRes, suppliersRes] = await Promise.all([
                    companyApi.getAll(), categoryApi.getAll(), itemApi.getAll(),
                    godownApi.getAll(), purchaseApi.getSuppliers()
                ]);
                setCompanies(companiesRes.data?.data || companiesRes.data || []);
                setCategories(categoriesRes.data?.data || categoriesRes.data || []);
                setItems(itemsRes.data?.data || itemsRes.data || []);
                setGodowns(godownsRes.data?.data || godownsRes.data || []);
                setSuppliers(suppliersRes.data?.data || suppliersRes.data || []);
            } catch (err) {
                console.error("Error loading dropdowns:", err);
            }
        };
        loadDropdowns();
    }, []);

    // Load subcategories when category changes
    useEffect(() => {
        if (filters.categoryId) {
            const loadSubcats = async () => {
                try {
                    const res = await subcategoryApi.getByCategory(filters.categoryId);
                    setSubcategories(res.data?.data || res.data || []);
                } catch (err) {
                    setSubcategories([]);
                }
            };
            loadSubcats();
        } else {
            setSubcategories([]);
        }
    }, [filters.categoryId]);

    const getItemDetails = async (itemId) => {
        if (ITEM_CACHE[itemId]) return ITEM_CACHE[itemId];
        if (FAILED_REQUESTS[itemId]) {
            return { itemID: itemId, itemName: `Item ${itemId}`, compID: null, catgID: null, subcatID: null, godownID: null };
        }
        try {
            const res = await itemApi.getById(itemId);
            const itemData = res.data?.data || res.data;
            ITEM_CACHE[itemId] = itemData;
            return itemData;
        } catch (err) {
            FAILED_REQUESTS[itemId] = true;
            return { itemID: itemId, itemName: `Item ${itemId}`, compID: null, catgID: null, subcatID: null, godownID: null };
        }
    };

    const loadPurchases = async () => {
        setLoading(true);
        try {
            const res = await purchaseApi.getAll();
            let purchasesData = res.data?.data || res.data || [];
            const enrichedPurchases = [];

            for (const purchase of purchasesData) {
                let calculatedTotal = 0, totalQuantity = 0;
                const enrichedItems = [];

                if (purchase.items?.length) {
                    for (const item of purchase.items) {
                        const qty = item.purcQnty || item.quantity || 0;
                        const rate = item.purcRate || item.rate || 0;
                        calculatedTotal += qty * rate;
                        totalQuantity += qty;
                        const itemDetails = await getItemDetails(item.itemID);
                        enrichedItems.push({
                            ...item,
                            compID: itemDetails?.compID,
                            catgID: itemDetails?.catgID,
                            subcatID: itemDetails?.subcatID,
                            godownID: item.godownID || itemDetails?.godownID,
                        });
                    }
                }

                enrichedPurchases.push({
                    ...purchase,
                    items: enrichedItems,
                    netAmnt: purchase.netAmnt || calculatedTotal,
                    totalQuantity: purchase.totalQuantity || totalQuantity,
                    itemCount: purchase.items?.length || 0,
                    supplierName: purchase.supplierName || (purchase.isWalkingCustomer ? "Walking Customer" : "Unknown")
                });
            }

            const sortedData = [...enrichedPurchases].sort((a, b) => new Date(b.tranDate) - new Date(a.tranDate));
            setPurchases(sortedData);
            setFilteredPurchases(sortedData);
        } catch (err) {
            console.error("Failed to load purchases:", err);
            showError("Failed to load purchases");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPurchases();
    }, []);

    // Apply all filters
    const applyFilters = () => {
        let filtered = [...purchases];

        // Search term filter
        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(p => {
                const billMatch = (p.billNumb || '').toLowerCase().includes(term);
                const supplierMatch = (p.supplierName || '').toLowerCase().includes(term);
                return billMatch || supplierMatch;
            });
        }

        // Basic filters
        if (filters.supplierId) filtered = filtered.filter(p => p.suppID === parseInt(filters.supplierId));
        if (filters.tranType) filtered = filtered.filter(p => p.tranType === filters.tranType);
        if (filters.fromDate) filtered = filtered.filter(p => p.tranDate >= filters.fromDate);
        if (filters.toDate) filtered = filtered.filter(p => p.tranDate <= filters.toDate);

        // Advanced item filters
        if (filters.companyId || filters.categoryId || filters.subcategoryId || filters.itemId || filters.godownId) {
            filtered = filtered.filter(purchase => {
                if (!purchase.items?.length) return false;
                return purchase.items.some(item => {
                    if (filters.companyId && item.compID !== parseInt(filters.companyId)) return false;
                    if (filters.categoryId && item.catgID !== parseInt(filters.categoryId)) return false;
                    if (filters.subcategoryId && item.subcatID !== parseInt(filters.subcategoryId)) return false;
                    if (filters.itemId && item.itemID !== parseInt(filters.itemId)) return false;
                    if (filters.godownId && item.godownID !== parseInt(filters.godownId)) return false;
                    return true;
                });
            });
        }

        setFilteredPurchases(filtered);
        setCurrentPage(1);
        setShowList(true);
    };

    // Reset all filters
    const resetFilters = () => {
        setFilters({
            supplierId: "", companyId: "", categoryId: "", subcategoryId: "",
            itemId: "", godownId: "", fromDate: "", toDate: "", tranType: ""
        });
        setSearchTerm("");
        setFilteredPurchases(purchases);
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
    const hasActiveFilters = filters.supplierId || filters.companyId || filters.categoryId ||
        filters.subcategoryId || filters.itemId || filters.godownId ||
        filters.fromDate || filters.toDate || filters.tranType;

    // CRUD Operations
    const handleAdd = () => {
        setSelectedPurchase(null);
        setShowPopup(true);
    };

    const handleEdit = (purchase) => {
        setSelectedPurchase({ tranNumb: purchase.tranNumb });
        setShowPopup(true);
    };

    const handleDelete = (tranNumb, billNumb) => {
        showConfirm(`Delete purchase "${billNumb}"?`, async () => {
            try {
                await purchaseApi.delete(tranNumb);
                await loadPurchases();
                showSuccess(`"${billNumb}" deleted!`);
            } catch (err) {
                showError("Failed to delete purchase");
            }
        }, 'Delete Purchase');
    };

    const handlePrint = (purchase) => {
        setPrintData({ module: 'purchase', id: purchase.tranNumb });
    };

    // Pagination
    const displayPurchases = filteredPurchases;
    const totalPages = Math.ceil(displayPurchases.length / itemsPerPage);
    const currentItems = displayPurchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const toggleExpand = (tranNumb) => setExpandedRow(expandedRow === tranNumb ? null : tranNumb);

    // Filter Components for SearchFilterBar
    const filterComponents = (
        <>
            <select
                value={filters.supplierId}
                onChange={(e) => handleFilterChange('supplierId', e.target.value)}
                className="filter-select"
            >
                <option value="">All Suppliers</option>
                {suppliers.map(s => (
                    <option key={s.acctID} value={s.acctID}>
                        {s.acctName || `${s.acctCode} - ${s.acctName}`}
                    </option>
                ))}
            </select>

            <select
                value={filters.companyId}
                onChange={(e) => handleFilterChange('companyId', e.target.value)}
                className="filter-select"
            >
                <option value="">All Companies</option>
                {companies.map(c => (
                    <option key={c.compID} value={c.compID}>{c.compName}</option>
                ))}
            </select>

            <select
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                className="filter-select"
            >
                <option value="">All Categories</option>
                {categories.map(c => (
                    <option key={c.catgID} value={c.catgID}>{c.catgName}</option>
                ))}
            </select>

            <select
                value={filters.subcategoryId}
                onChange={(e) => handleFilterChange('subcategoryId', e.target.value)}
                className="filter-select"
                disabled={!filters.categoryId}
            >
                <option value="">All Subcategories</option>
                {subcategories.map(s => (
                    <option key={s.subcatID} value={s.subcatID}>{s.subcatName}</option>
                ))}
            </select>

            <select
                value={filters.itemId}
                onChange={(e) => handleFilterChange('itemId', e.target.value)}
                className="filter-select"
            >
                <option value="">All Items</option>
                {items.map(i => (
                    <option key={i.itemID} value={i.itemID}>{i.itemName}</option>
                ))}
            </select>

            <select
                value={filters.godownId}
                onChange={(e) => handleFilterChange('godownId', e.target.value)}
                className="filter-select"
            >
                <option value="">All Godowns</option>
                {godowns.map(g => (
                    <option key={g.godnID} value={g.godnID}>{g.godnName}</option>
                ))}
            </select>

            <select
                value={filters.tranType}
                onChange={(e) => handleFilterChange('tranType', e.target.value)}
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
        <div className="purchase-cards-grid">
            {currentItems.map(p => (
                <div key={p.tranNumb} className={`purchase-card ${expandedRow === p.tranNumb ? 'expanded' : ''}`}>
                    <div className="purchase-card-header" onClick={() => toggleExpand(p.tranNumb)}>
                        <FaFileInvoice className="card-icon" />
                        <div className="card-info">
                            <h4>{p.billNumb}</h4>
                            <span className={`type-badge ${p.tranType?.toLowerCase()}`}>
                                {p.tranType || 'Cash'}
                            </span>
                        </div>
                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                            <button className="card-btn print" onClick={() => handlePrint(p)} title="Print Slip">
                                <FaPrint />
                            </button>
                            <button className="card-btn edit" onClick={() => handleEdit(p)}>
                                <FaEdit />
                            </button>
                            <button className="card-btn delete" onClick={() => handleDelete(p.tranNumb, p.billNumb)}>
                                <FaTrash />
                            </button>
                            <button className="card-btn expand">
                                {expandedRow === p.tranNumb ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                        </div>
                    </div>
                    <div className="purchase-card-body">
                        <div className="info-row">
                            <FaCalendarAlt /> {formatDateDisplay(p.tranDate)}
                        </div>
                        <div className="info-row">
                            <FaBuilding /> {p.supplierName}
                        </div>
                        <div className="info-row">
                            <FaBoxes /> {p.itemCount} items | {formatNumber(p.totalQuantity, 0)} qty
                        </div>
                        <div className="info-row total">
                            Total: <strong>{formatNumber(p.netAmnt)}</strong>
                        </div>
                    </div>
                    {expandedRow === p.tranNumb && p.items?.length > 0 && (
                        <div className="purchase-card-expanded">
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
                                    {p.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.itemName}</td>
                                            <td>{formatNumber(item.purcQnty || item.quantity, 0)}</td>
                                            <td>{formatNumber(item.purcRate || item.rate)}</td>
                                            <td>{formatNumber((item.purcQnty || item.quantity) * (item.purcRate || item.rate))}</td>
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
        <div className="purchase-page-premium">
            <PageHeader
                title="Purchase Management"
                
                icon={<FaShoppingCart />}
                addButtonText="Add Purchase"
                onAdd={handleAdd}
            />

            {/* ✅ Centralized SearchFilterBar */}
            <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search by bill number or supplier..."
                onRefresh={loadPurchases}
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
                    <p>Loading purchases...</p>
                </div>
            )}

            {/* List View */}
            {!loading && showList && (
                displayPurchases.length > 0 ? (
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
                        title="No purchases found"
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
            {!loading && purchases.length === 0 && (
                <EmptyState
                    icon={<FaShoppingCart />}
                    title="No purchases yet"
                    description="Get started by adding your first purchase"
                    action={
                        <Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>
                            Add Purchase
                        </Button>
                    }
                />
            )}

            {/* Modals */}
            {showPopup && (
                <PurchasePopup
                    purchase={selectedPurchase}
                    onClose={() => setShowPopup(false)}
                    onSaved={loadPurchases}
                />
            )}

            {printData && (
                <PrintSlip {...printData} onClose={() => setPrintData(null)} />
            )}
        </div>
    );
}