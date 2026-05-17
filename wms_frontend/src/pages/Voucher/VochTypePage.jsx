import React, { useEffect, useState } from "react";
import vochTypeApi from "../../api/vochTypeApi";
import VochTypePopup from "./VochTypePopup";
import {
    FaBook, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle
} from "react-icons/fa";
import { Button, useDialog } from "../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../components/features";
import "./VochTypePage.css";

export default function VochTypePage() {
    const [voucherTypes, setVoucherTypes] = useState([]);
    const [filteredTypes, setFilteredTypes] = useState([]);
    const [selected, setSelected] = useState(null);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    // SearchFilterBar States
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filters State
    const [filterStatus, setFilterStatus] = useState("");

    const { showConfirm, showSuccess, showError } = useDialog();

    const load = async () => {
        setLoading(true);
        try {
            const res = await vochTypeApi.getAll();
            let data = res.data?.data || res.data || [];
            setVoucherTypes(Array.isArray(data) ? data : []);
            setFilteredTypes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error loading voucher types:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // Apply all filters
    const applyFilters = () => {
        let filtered = [...voucherTypes];

        // Search term filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(v =>
                (v.vochName || '').toLowerCase().includes(term) ||
                (v.typeAbbr || '').toLowerCase().includes(term) ||
                (v.vochType || '').toLowerCase().includes(term)
            );
        }

        // Status filter
        if (filterStatus === 'active') {
            filtered = filtered.filter(v => !v.inActive);
        }
        if (filterStatus === 'inactive') {
            filtered = filtered.filter(v => v.inActive);
        }

        setFilteredTypes(filtered);
        setShowList(true);
    };

    // Reset all filters
    const resetFilters = () => {
        setFilterStatus("");
        setSearchTerm("");
        setFilteredTypes(voucherTypes);
        setShowList(false);
        setShowFilters(false);
    };

    // Handle filter change
    const handleFilterChange = (value) => {
        setFilterStatus(value);
    };

    // Apply filter from filter panel
    const handleApplyFilters = () => {
        applyFilters();
        setShowFilters(false);
    };

    // Check if any filter is active
    const hasActiveFilters = filterStatus !== "";

    // CRUD Operations
    const handleAdd = () => {
        setSelected(null);
        setShow(true);
    };

    const handleEdit = (item) => {
        setSelected(item);
        setShow(true);
    };

    const handleDelete = async (id, name) => {
        showConfirm(`Delete voucher type "${name}"?`, async () => {
            try {
                await vochTypeApi.delete(id);
                await load();
                if (showList) applyFilters();
                showSuccess(`"${name}" deleted!`);
            } catch (err) {
                showError("Failed to delete voucher type");
            }
        }, 'Delete Voucher Type');
    };

    // Filter Components for SearchFilterBar
    const filterComponents = (
        <>
            <select
                value={filterStatus}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="filter-select"
            >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>

            <div className="filter-buttons">
                <Button variant="primary" size="sm" onClick={handleApplyFilters}>
                    Apply Filters
                </Button>
            </div>
        </>
    );

    // Render Card View
    const renderCardView = () => (
        <div className="vochtype-cards-grid">
            {filteredTypes.map(item => (
                <div key={item.vochTypeID} className="vochtype-card">
                    <div className="vochtype-card-header">
                        <FaBook className="card-icon" />
                        <div className="card-info">
                            <h4>{item.vochName}</h4>
                            <div className="card-badges">
                                <span className="badge abbr">{item.typeAbbr}</span>
                                <span className="badge code">{item.vochType}</span>
                            </div>
                        </div>
                        <div className="card-actions">
                            <button className="card-btn edit" onClick={() => handleEdit(item)}>
                                <FaEdit />
                            </button>
                            <button className="card-btn delete" onClick={() => handleDelete(item.vochTypeID, item.vochName)}>
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                    <div className="vochtype-card-body">
                        {item.vochDesc && <div className="info-row">{item.vochDesc}</div>}
                        <div className="info-row">
                            <span className={`status-badge ${item.inActive ? 'inactive' : 'active'}`}>
                                {item.inActive ?
                                    <><FaTimesCircle /> Inactive</> :
                                    <><FaCheckCircle /> Active</>
                                }
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="vochtype-page-premium">
            <PageHeader
                title="Voucher Type Management"
                icon={<FaBook />}
                addButtonText="Add Voucher Type"
                onAdd={handleAdd}
            />

            {/* ✅ Centralized SearchFilterBar */}
            <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search by name, code or abbreviation..."
                onRefresh={load}
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
                    <p>Loading voucher types...</p>
                </div>
            )}

            {/* List View */}
            {!loading && showList && (
                filteredTypes.length > 0 ? (
                    renderCardView()
                ) : (
                    <EmptyState
                        icon={<FaBook />}
                        title="No voucher types found"
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
            {!loading && voucherTypes.length === 0 && !showList && (
                <EmptyState
                    icon={<FaBook />}
                    title="No voucher types yet"
                    description="Get started by adding your first voucher type"
                    action={
                        <Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>
                            Add Voucher Type
                        </Button>
                    }
                />
            )}

            {/* Modal */}
            {show && (
                <VochTypePopup
                    data={selected}
                    onClose={() => setShow(false)}
                    onSaved={load}
                />
            )}
        </div>
    );
}