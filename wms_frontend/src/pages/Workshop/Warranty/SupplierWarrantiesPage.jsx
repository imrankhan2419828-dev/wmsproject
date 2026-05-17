import React, { useEffect, useState } from "react";
import warrantyApi from "../../../api/warrantyApi";
import { getSuppliers } from "../../../api/coaApi";
import itemApi from "../../../api/itemApi";
import { FaShieldAlt, FaPlus, FaEdit, FaTrash, FaBuilding, FaBoxes, FaCalendarAlt } from "react-icons/fa";
import { Button, useDialog } from "../../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../../components/features";
import "./Warranty.css";

export default function SupplierWarrantiesPage() {
    const [warranties, setWarranties] = useState([]);
    const [filteredWarranties, setFilteredWarranties] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [items, setItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedWarranty, setSelectedWarranty] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({ supplierId: "", itemId: "" });
    const [form, setForm] = useState({ supplierWarrantyID: 0, supplierID: "", itemID: "", warrantyPeriod: "", warrantyType: "STANDARD", terms: "", isActive: true });
    const { showConfirm, showSuccess, showError } = useDialog();

    const loadWarranties = async () => {
        setLoading(true);
        try {
            const res = await warrantyApi.getAllSupplierWarranties();
            setWarranties(res.data?.data || res.data || []);
            setFilteredWarranties(res.data?.data || res.data || []);
        } catch (error) { showError("Failed to load warranties"); }
        finally { setLoading(false); }
    };

    const loadSuppliers = async () => {
        try {
            const res = await getSuppliers();
            setSuppliers(res.data?.data || res.data || []);
        } catch (error) { console.error("Error loading suppliers:", error); }
    };

    const loadItems = async () => {
        try {
            const res = await itemApi.getAll();
            setItems(res.data?.data || res.data || []);
        } catch (error) { console.error("Error loading items:", error); }
    };

    useEffect(() => { loadWarranties(); loadSuppliers(); loadItems(); }, []);

    const applyFilters = () => {
        let filtered = [...warranties];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(w =>
                w.supplierName?.toLowerCase().includes(term) ||
                w.itemName?.toLowerCase().includes(term)
            );
        }
        if (filters.supplierId) filtered = filtered.filter(w => w.supplierID === parseInt(filters.supplierId));
        if (filters.itemId) filtered = filtered.filter(w => w.itemID === parseInt(filters.itemId));
        setFilteredWarranties(filtered);
        setShowList(true);
    };

    const resetFilters = () => {
        setFilters({ supplierId: "", itemId: "" });
        setSearchTerm("");
        setFilteredWarranties(warranties);
        setShowList(false);
        setShowFilters(false);
    };

    const filterComponents = (
        <>
            <select value={filters.supplierId} onChange={(e) => setFilters(prev => ({ ...prev, supplierId: e.target.value }))} className="filter-select">
                <option value="">All Suppliers</option>
                {suppliers.map(s => <option key={s.acctID} value={s.acctID}>{s.acctName}</option>)}
            </select>
            <select value={filters.itemId} onChange={(e) => setFilters(prev => ({ ...prev, itemId: e.target.value }))} className="filter-select">
                <option value="">All Items</option>
                {items.map(i => <option key={i.itemID} value={i.itemID}>{i.itemName}</option>)}
            </select>
            <div className="filter-buttons"><Button variant="primary" size="sm" onClick={applyFilters}>Apply Filters</Button></div>
        </>
    );

    const renderCardView = () => (
        <div className="supplier-warranty-cards-grid">
            {filteredWarranties.map(w => {
                const supplier = suppliers.find(s => s.acctID === w.supplierID);
                const item = items.find(i => i.itemID === w.itemID);
                return (
                    <div key={w.supplierWarrantyID} className="supplier-warranty-card">
                        <div className="card-header"><FaBuilding className="card-icon" /><div className="card-info"><h4>{supplier?.acctName || 'Unknown'}</h4><span><FaBoxes /> {item?.itemName || 'Unknown'}</span></div><span className={`status-badge ${w.isActive ? 'active' : 'inactive'}`}>{w.isActive ? 'Active' : 'Inactive'}</span></div>
                        <div className="card-body"><div className="info-row"><FaCalendarAlt /> Warranty: {w.warrantyPeriod} days</div><div className="info-row">Type: {w.warrantyType}</div>{w.terms && <div className="terms-section"><strong>Terms:</strong><p>{w.terms}</p></div>}</div>
                        <div className="card-footer"><button className="card-btn edit" onClick={() => { setSelectedWarranty(w); setForm({ supplierWarrantyID: w.supplierWarrantyID, supplierID: w.supplierID?.toString(), itemID: w.itemID?.toString(), warrantyPeriod: w.warrantyPeriod, warrantyType: w.warrantyType, terms: w.terms || "", isActive: w.isActive }); setShowModal(true); }}><FaEdit /> Edit</button><button className="card-btn delete" onClick={() => showConfirm(`Delete warranty for ${supplier?.acctName}?`, async () => { await warrantyApi.deleteSupplierWarranty(w.supplierWarrantyID); loadWarranties(); showSuccess("Deleted"); }, "Delete")}><FaTrash /> Delete</button></div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="warranty-page-premium">
            <PageHeader title="Supplier Warranties" icon={<FaShieldAlt />} addButtonText="Add Warranty" onAdd={() => { setSelectedWarranty(null); setForm({ supplierWarrantyID: 0, supplierID: "", itemID: "", warrantyPeriod: "", warrantyType: "STANDARD", terms: "", isActive: true }); setShowModal(true); }} />
            <SearchFilterBar searchValue={searchTerm} onSearchChange={setSearchTerm} searchPlaceholder="Search by supplier or item..." onRefresh={loadWarranties} showList={showList} onToggleList={() => setShowList(!showList)} onToggleFilters={() => setShowFilters(!showFilters)} showFilters={showFilters} hasActiveFilters={filters.supplierId || filters.itemId} onClearFilters={resetFilters} onSearchSubmit={applyFilters} loading={loading} filterComponents={filterComponents} />
            {loading && (<div className="loading-container"><div className="spinner"></div><p>Loading warranties...</p></div>)}
            {!loading && showList && (filteredWarranties.length > 0 ? renderCardView() : <EmptyState icon={<FaShieldAlt />} title="No warranties found" description="Try adjusting your filters" action={<Button variant="primary" onClick={resetFilters}>Clear Filters</Button>} />)}
            {!loading && warranties.length === 0 && !showList && (<EmptyState icon={<FaShieldAlt />} title="No warranties yet" description="Add supplier warranty terms" action={<Button variant="primary" onClick={() => { setSelectedWarranty(null); setForm({ supplierWarrantyID: 0, supplierID: "", itemID: "", warrantyPeriod: "", warrantyType: "STANDARD", terms: "", isActive: true }); setShowModal(true); }} icon={<FaPlus />}>Add Warranty</Button>} />)}
            {showModal && (<div className="modal-overlay" onClick={() => setShowModal(false)}><div className="modal-content warranty-modal" onClick={e => e.stopPropagation()}><div className="modal-header"><h3>{selectedWarranty ? "Edit Supplier Warranty" : "New Supplier Warranty"}</h3><button className="modal-close" onClick={() => setShowModal(false)}>&times;</button></div><form onSubmit={(e) => { e.preventDefault(); (async () => { if (!form.supplierID || !form.itemID || !form.warrantyPeriod) { showError("Please fill all required fields"); return; } setLoading(true); try { const payload = { supplierID: parseInt(form.supplierID), itemID: parseInt(form.itemID), warrantyPeriod: parseInt(form.warrantyPeriod), warrantyType: form.warrantyType, terms: form.terms, isActive: form.isActive }; if (selectedWarranty) await warrantyApi.updateSupplierWarranty(selectedWarranty.supplierWarrantyID, payload); else await warrantyApi.createSupplierWarranty(payload); showSuccess(selectedWarranty ? "Updated" : "Created"); loadWarranties(); setShowModal(false); } catch (err) { showError("Failed to save"); } finally { setLoading(false); } })(); }}><div className="modal-body"><div className="form-group"><label>Supplier *</label><select name="supplierID" value={form.supplierID} onChange={(e) => setForm(prev => ({ ...prev, supplierID: e.target.value }))} required><option value="">Select Supplier</option>{suppliers.map(s => <option key={s.acctID} value={s.acctID}>{s.acctName}</option>)}</select></div><div className="form-group"><label>Item *</label><select name="itemID" value={form.itemID} onChange={(e) => setForm(prev => ({ ...prev, itemID: e.target.value }))} required><option value="">Select Item</option>{items.map(i => <option key={i.itemID} value={i.itemID}>{i.itemName}</option>)}</select></div><div className="form-row-2"><div className="form-group"><label>Warranty Period (days) *</label><input type="number" name="warrantyPeriod" value={form.warrantyPeriod} onChange={(e) => setForm(prev => ({ ...prev, warrantyPeriod: e.target.value }))} min="1" required /></div><div className="form-group"><label>Warranty Type</label><select name="warrantyType" value={form.warrantyType} onChange={(e) => setForm(prev => ({ ...prev, warrantyType: e.target.value }))}><option value="STANDARD">Standard</option><option value="EXTENDED">Extended</option><option value="FULL">Full</option></select></div></div><div className="form-group"><label>Terms & Conditions</label><textarea name="terms" value={form.terms} onChange={(e) => setForm(prev => ({ ...prev, terms: e.target.value }))} rows="4" placeholder="Enter warranty terms and conditions..." /></div><div className="checkbox-group"><label><input type="checkbox" name="isActive" checked={form.isActive} onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))} /> Active</label></div></div><div className="modal-footer"><button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn-primary" disabled={loading}>{loading ? "Saving..." : (selectedWarranty ? "Update" : "Create")}</button></div></form></div></div>)}
        </div>
    );
}