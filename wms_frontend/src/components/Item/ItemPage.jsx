import React, { useEffect, useState } from "react";
import itemApi from "../../api/itemApi";
import companyApi from "../../api/companyApi";
import categoryApi from "../../api/categoryApi";
import subcategoryApi from "../../api/subcategoryApi";
import ItemPopup from "./ItemPopup";
import { FaBoxes, FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { Button, useDialog, ReactSelect } from "../../components/common";
import { PageHeader, SearchFilterBar, EmptyState } from "../../components/features";
import { formatNumber } from "../../utils/numberUtils";
import "./Item.css";

export default function ItemPage() {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showList, setShowList] = useState(false);
    const [viewMode, setViewMode] = useState(() => window.innerWidth < 768 ? 'card' : 'table');

    const [companies, setCompanies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [filters, setFilters] = useState({
        companyId: "", categoryId: "", subcategoryId: "", modelNumber: "", barcode: ""
    });

    const { showConfirm, showSuccess, showError } = useDialog();

    const loadItems = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await itemApi.getAll();
            let data = res.data?.data || res.data || [];
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            setError("Failed to load items");
        } finally {
            setLoading(false);
        }
    };

    const loadDropdowns = async () => {
        try {
            const [companiesRes, categoriesRes] = await Promise.all([companyApi.getAll(), categoryApi.getAll()]);
            setCompanies(companiesRes.data?.data || companiesRes.data || []);
            setCategories(categoriesRes.data?.data || categoriesRes.data || []);
        } catch (err) { console.error("Error loading dropdowns:", err); }
    };

    const loadSubcategories = async (categoryId) => {
        if (!categoryId) { setSubcategories([]); return; }
        try {
            const res = await subcategoryApi.getByCategory(categoryId);
            setSubcategories(res.data?.data || res.data || []);
        } catch (err) { setSubcategories([]); }
    };

    useEffect(() => { loadItems(); loadDropdowns(); }, []);
    useEffect(() => {
        const handleResize = () => setViewMode(window.innerWidth < 768 ? 'card' : 'table');
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    useEffect(() => { loadSubcategories(filters.categoryId); }, [filters.categoryId]);

    const getFilteredItems = () => {
        let filtered = items;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item => item.itemName?.toLowerCase().includes(term));
        }
        if (filters.companyId) filtered = filtered.filter(item => item.compID === parseInt(filters.companyId));
        if (filters.categoryId) filtered = filtered.filter(item => item.catgID === parseInt(filters.categoryId));
        if (filters.subcategoryId) filtered = filtered.filter(item => item.subcatID === parseInt(filters.subcategoryId));
        if (filters.modelNumber) {
            const model = filters.modelNumber.toLowerCase();
            filtered = filtered.filter(item => item.modlNumb?.toLowerCase().includes(model));
        }
        if (filters.barcode) {
            const barcode = filters.barcode.toLowerCase();
            filtered = filtered.filter(item => item.barCode?.toLowerCase().includes(barcode));
        }
        return filtered;
    };

    const displayItems = getFilteredItems();
    const handleAdd = () => { setSelectedItem(null); setShowPopup(true); };
    const handleEdit = (item) => { setSelectedItem(item); setShowPopup(true); };
    const handleDelete = (id, name) => {
        showConfirm(`Delete "${name}"?`, async () => {
            try { await itemApi.delete(id); await loadItems(); showSuccess(`"${name}" deleted!`); }
            catch (err) { showError("Failed to delete item"); }
        }, 'Delete Item');
    };

    const handleClearFilters = () => {
        setFilters({ companyId: "", categoryId: "", subcategoryId: "", modelNumber: "", barcode: "" });
        setSearchTerm("");
    };

    const companyOptions = companies.map(c => ({ value: c.compID?.toString(), label: c.compName }));
    const categoryOptions = categories.map(c => ({ value: c.catgID?.toString(), label: c.catgName }));
    const subcategoryOptions = subcategories.map(s => ({ value: s.subcatID?.toString(), label: s.subcatName }));
    const hasActiveFilters = filters.companyId || filters.categoryId || filters.subcategoryId || filters.modelNumber || filters.barcode;

    // Filter components for SearchFilterBar
    const filterComponents = [
        <div key="company" style={{ minWidth: '200px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Company</label>
            <ReactSelect
                value={filters.companyId}
                onChange={(e) => setFilters(prev => ({ ...prev, companyId: e.target.value }))}
                options={companyOptions}
                placeholder="All Companies"
                isClearable
            />
        </div>,
        <div key="category" style={{ minWidth: '200px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Category</label>
            <ReactSelect
                value={filters.categoryId}
                onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value, subcategoryId: "" }))}
                options={categoryOptions}
                placeholder="All Categories"
                isClearable
            />
        </div>,
        <div key="subcategory" style={{ minWidth: '200px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Subcategory</label>
            <ReactSelect
                value={filters.subcategoryId}
                onChange={(e) => setFilters(prev => ({ ...prev, subcategoryId: e.target.value }))}
                options={subcategoryOptions}
                placeholder="All Subcategories"
                isClearable
                isDisabled={!filters.categoryId}
            />
        </div>,
        <div key="model" style={{ minWidth: '200px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Model Number</label>
            <input
                type="text"
                placeholder="Enter model number"
                value={filters.modelNumber}
                onChange={(e) => setFilters(prev => ({ ...prev, modelNumber: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
            />
        </div>,
        <div key="barcode" style={{ minWidth: '200px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Barcode</label>
            <input
                type="text"
                placeholder="Enter barcode"
                value={filters.barcode}
                onChange={(e) => setFilters(prev => ({ ...prev, barcode: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
            />
        </div>
    ];

    const renderTableView = () => (
        <div className="item-table-wrapper">
            <table className="item-table">
                <thead><tr><th>Item Name</th><th>Model</th><th>Purchase Rate</th><th>Sale Rate</th><th>Actions</th></tr></thead>
                <tbody>
                    {displayItems.map(item => (
                        <tr key={item.itemID}>
                            <td><div className="item-name-cell"><FaBoxes className="item-icon" /> {item.itemName}</div></td>
                            <td>{item.modlNumb || '-'}</td>
                            <td>{formatNumber(item.purcRate)}</td>
                            <td>{formatNumber(item.saleRate)}</td>
                            <td>
                                <button className="action-btn edit" onClick={() => handleEdit(item)}><FaEdit /></button>
                                <button className="action-btn delete" onClick={() => handleDelete(item.itemID, item.itemName)}><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderCardView = () => (
        <div className="item-cards-grid">
            {displayItems.map(item => (
                <div key={item.itemID} className="item-card">
                    <div className="item-card-header">
                        <FaBoxes className="card-icon" />
                        <div className="card-info"><h4>{item.itemName}</h4><span>{item.modlNumb || 'No Model'}</span></div>
                        <div className="card-actions">
                            <button className="card-btn edit" onClick={() => handleEdit(item)}><FaEdit /></button>
                            <button className="card-btn delete" onClick={() => handleDelete(item.itemID, item.itemName)}><FaTrash /></button>
                        </div>
                    </div>
                    <div className="item-card-body">
                        <div className="price-row"><span>Purchase:</span> <strong>{formatNumber(item.purcRate)}</strong></div>
                        <div className="price-row"><span>Sale:</span> <strong>{formatNumber(item.saleRate)}</strong></div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="item-page-premium">
            <PageHeader
                title="Item Management"
                
                icon={<FaBoxes />}
                addButtonText="Add Item"
                onAdd={handleAdd}
            />

            {/* SearchFilterBar with ACTUAL filters */}
            <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search items by name..."
                onRefresh={loadItems}
                showList={showList}
                onToggleList={() => setShowList(!showList)}
                loading={loading}
                filters={filterComponents}
            />

            {/* Clear Filters Button */}
            {hasActiveFilters && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="outline" size="sm" onClick={handleClearFilters} icon={<FaTimes />}>
                        Clear All Filters
                    </Button>
                </div>
            )}

            {error && <div className="error-alert">⚠ {error}</div>}
            {loading && <div className="loading-container"><div className="spinner"></div></div>}

            {!loading && showList && (
                displayItems.length > 0 ? (
                    viewMode === 'table' ? renderTableView() : renderCardView()
                ) : (
                    <EmptyState
                        icon={<FaBoxes />}
                        title="No items found"
                        description={searchTerm || hasActiveFilters ? 'Try adjusting your filters' : 'Add your first item'}
                        action={!searchTerm && !hasActiveFilters && (
                            <Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>Add Item</Button>
                        )}
                    />
                )
            )}

            {showPopup && (
                <ItemPopup
                    item={selectedItem}
                    onClose={() => setShowPopup(false)}
                    onSaved={loadItems}
                />
            )}
        </div>
    );
}