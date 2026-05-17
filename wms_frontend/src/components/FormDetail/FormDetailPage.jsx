import React, { useEffect, useState } from "react";
import formDetailApi from "../../api/formDetailApi";
import FormDetailPopup from "./FormDetailPopup";
import {
    FaList, FaPlus, FaEdit, FaTrash, FaSearch,
    FaTimes, FaFilter, FaSync, FaEye, FaEyeSlash,
    FaChevronDown, FaChevronUp
} from "react-icons/fa";
import { Button, useDialog } from "../../components/common";
import { PageHeader, EmptyState } from "../../components/features";
import "./FormDetail.css";

export default function FormDetailPage() {
    const [forms, setForms] = useState([]);
    const [filteredForms, setFilteredForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [viewMode, setViewMode] = useState(() => window.innerWidth < 768 ? 'card' : 'table');
    const [expandedRow, setExpandedRow] = useState(null);

    const { showConfirm, showSuccess, showError } = useDialog();

    useEffect(() => {
        const handleResize = () => setViewMode(window.innerWidth < 768 ? 'card' : 'table');
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadForms = async () => {
        setLoading(true);
        try {
            const res = await formDetailApi.getAll();
            let data = res.data?.data || res.data || [];
            setForms(Array.isArray(data) ? data : []);
            setFilteredForms(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error loading forms:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadForms();
    }, []);

    const applyFilters = () => {
        let filtered = [...forms];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(f =>
                (f.formName || '').toLowerCase().includes(term) ||
                (f.formTitle || '').toLowerCase().includes(term) ||
                (f.menuTitle || '').toLowerCase().includes(term)
            );
        }
        if (filterCategory) {
            filtered = filtered.filter(f => f.menuCategory === filterCategory);
        }
        setFilteredForms(filtered);
        setShowList(true);
    };

    const resetFilters = () => {
        setFilterCategory("");
        setSearchTerm("");
        setFilteredForms(forms);
        setShowList(false);
        setShowFilters(false);
    };

    const handleAdd = () => { setSelectedForm(null); setShowPopup(true); };
    const handleEdit = (form) => { setSelectedForm(form); setShowPopup(true); };

    const handleDelete = async (id, name) => {
        showConfirm(`Delete form "${name}"?`, async () => {
            try {
                await formDetailApi.delete(id);
                await loadForms();
                if (showList) applyFilters();
                showSuccess(`"${name}" deleted!`);
            } catch (err) { showError("Failed to delete form"); }
        }, 'Delete Form');
    };

    const toggleExpand = (id) => setExpandedRow(expandedRow === id ? null : id);

    const categories = [...new Set(forms.map(f => f.menuCategory).filter(Boolean))];
    const hasActiveFilters = filterCategory;

    // ✅ DESKTOP: TABLE VIEW
    const renderTableView = () => (
        <div className="form-table-wrapper">
            <table className="form-table">
                <thead>
                    <tr>
                        <th>Form Name</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Parent</th>
                        <th>Order</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredForms.map(f => (
                        <tr key={f.formID}>
                            <td><strong>{f.formName}</strong></td>
                            <td>{f.formTitle || '-'}</td>
                            <td>{f.menuCategory || '-'}</td>
                            <td>{f.parentPage || '-'}</td>
                            <td>{f.menuOrder || f.formOrder || '-'}</td>
                            <td className="actions-cell">
                                <button className="action-btn edit" onClick={() => handleEdit(f)}><FaEdit /></button>
                                <button className="action-btn delete" onClick={() => handleDelete(f.formID, f.formName)}><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // ✅ MOBILE: CARD VIEW
    const renderCardView = () => (
        <div className="form-cards-grid">
            {filteredForms.map(f => (
                <div key={f.formID} className={`form-card ${expandedRow === f.formID ? 'expanded' : ''}`}>
                    <div className="form-card-header" onClick={() => toggleExpand(f.formID)}>
                        <FaList className="card-icon" />
                        <div className="card-info">
                            <h4>{f.formName}</h4>
                            <span>{f.menuTitle || f.formTitle || '-'}</span>
                        </div>
                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                            <button className="card-btn expand">{expandedRow === f.formID ? <FaChevronUp /> : <FaChevronDown />}</button>
                            <button className="card-btn edit" onClick={() => handleEdit(f)}><FaEdit /></button>
                            <button className="card-btn delete" onClick={() => handleDelete(f.formID, f.formName)}><FaTrash /></button>
                        </div>
                    </div>
                    <div className="form-card-body">
                        <div className="info-row"><span>Category:</span> {f.menuCategory || '-'}</div>
                        <div className="info-row"><span>Parent:</span> {f.parentPage || 'Root'}</div>
                        <div className="info-row"><span>Order:</span> {f.menuOrder || f.formOrder || '-'}</div>
                        <div className="info-row"><span>Icon:</span> {f.menuIcon || '📄'}</div>
                    </div>
                    {expandedRow === f.formID && (
                        <div className="form-card-expanded">
                            <div className="expanded-item"><strong>Form Title:</strong> {f.formTitle || '-'}</div>
                            <div className="expanded-item"><strong>Menu Sub Title:</strong> {f.menuSubTitle || '-'}</div>
                            <div className="expanded-item"><strong>Web Page:</strong> {f.isWebPage ? 'Yes' : 'No'}</div>
                            <div className="expanded-item"><strong>Category Order:</strong> {f.categoryOrder || '-'}</div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="form-page-premium">
            <PageHeader
                title="Form/Menu Management"
                subtitle="Manage application forms and menu items"
                icon={<FaList />}
                addButtonText="Add New Form"
                onAdd={handleAdd}
            />

            <div className="search-action-bar">
                <div className="search-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name or title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                        className="search-input"
                    />
                </div>
                <div className="action-group">
                    <Button variant="outline" size="sm" onClick={loadForms} loading={loading} icon={<FaSync />}>Refresh</Button>
                    <Button variant={showList ? 'primary' : 'outline'} size="sm" onClick={() => setShowList(!showList)} icon={showList ? <FaEyeSlash /> : <FaEye />}>{showList ? 'Hide' : 'Show'}</Button>
                    <Button variant={showFilters ? 'primary' : 'outline'} size="sm" onClick={() => setShowFilters(!showFilters)} icon={<FaFilter />}>Filters</Button>
                    {hasActiveFilters && <Button variant="outline" size="sm" onClick={resetFilters} icon={<FaTimes />}>Clear</Button>}
                    <Button variant="primary" size="sm" onClick={applyFilters} icon={<FaSearch />}>Search</Button>
                </div>
            </div>

            {showFilters && (
                <div className="filters-panel">
                    <div className="filters-grid-1">
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
                            <option value="">All Categories</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
            )}

            {loading && (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading forms...</p>
                </div>
            )}

            {!loading && showList && (
                filteredForms.length > 0 ? (
                    viewMode === 'table' ? renderTableView() : renderCardView()
                ) : (
                    <EmptyState
                        icon={<FaList />}
                        title="No forms found"
                        description="Try adjusting your filters"
                        action={<Button variant="primary" onClick={resetFilters}>Clear Filters</Button>}
                    />
                )
            )}

            {!loading && forms.length === 0 && !showList && (
                <EmptyState
                    icon={<FaList />}
                    title="No forms yet"
                    description="Get started by adding your first form"
                    action={<Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>Add Form</Button>}
                />
            )}

            {showPopup && (
                <FormDetailPopup
                    form={selectedForm}
                    onClose={() => setShowPopup(false)}
                    onSaved={loadForms}
                />
            )}
        </div>
    );
}