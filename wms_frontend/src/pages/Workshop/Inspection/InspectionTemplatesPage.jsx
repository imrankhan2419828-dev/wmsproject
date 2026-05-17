import React, { useEffect, useState } from "react";
import inspectionApi from "../../../api/inspectionApi";
import InspectionTemplateModal from "./InspectionTemplateModal";
import InspectionItemsPage from "./InspectionItemsPage";
import { FaClipboardList, FaPlus, FaEdit, FaTrash, FaList, FaEye } from "react-icons/fa";
import { Button, useDialog } from "../../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../../components/features";
import "./Inspection.css";

export default function InspectionTemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [filteredTemplates, setFilteredTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showItems, setShowItems] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);

    // SearchFilterBar States
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filters State
    const [filters, setFilters] = useState({
        category: "", status: ""
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { showConfirm, showSuccess, showError } = useDialog();

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const res = await inspectionApi.getTemplates();
            let data = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                data = res.data.data;
            } else if (Array.isArray(res.data)) {
                data = res.data;
            }
            setTemplates(data);
            setFilteredTemplates(data);
        } catch (error) {
            console.error("Error loading templates:", error);
            showError(error.response?.data?.message || "Failed to load templates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    const applyFilters = () => {
        let filtered = [...templates];

        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(t =>
                (t.templateCode || '').toLowerCase().includes(term) ||
                (t.templateName || '').toLowerCase().includes(term) ||
                (t.description || '').toLowerCase().includes(term)
            );
        }

        if (filters.category) {
            filtered = filtered.filter(t => t.category === filters.category);
        }
        if (filters.status === "active") {
            filtered = filtered.filter(t => t.isActive);
        } else if (filters.status === "inactive") {
            filtered = filtered.filter(t => !t.isActive);
        }

        setFilteredTemplates(filtered);
        setCurrentPage(1);
        setShowList(true);
    };

    const resetFilters = () => {
        setFilters({ category: "", status: "" });
        setSearchTerm("");
        setFilteredTemplates(templates);
        setCurrentPage(1);
        setShowList(false);
        setShowFilters(false);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleApplyFilters = () => {
        applyFilters();
        setShowFilters(false);
    };

    const hasActiveFilters = filters.category || filters.status;

    const handleAdd = () => {
        setSelectedTemplate(null);
        setShowModal(true);
    };

    const handleEdit = (template) => {
        setSelectedTemplate(template);
        setShowModal(true);
    };

    const handleManageItems = (template) => {
        setSelectedTemplate(template);
        setShowItems(true);
    };

    const handleDelete = async (id, name) => {
        showConfirm(`Delete template "${name}"?`, async () => {
            try {
                await inspectionApi.deleteTemplate(id);
                showSuccess("Template deleted successfully");
                loadTemplates();
            } catch (error) {
                showError(error.response?.data?.message || "Failed to delete template");
            }
        }, "Delete Template");
    };

    const getCategoryLabel = (category) => {
        const categories = {
            'PRE_JOB': 'Pre-Job',
            'POST_JOB': 'Post-Job',
            'PERIODIC': 'Periodic',
            'SAFETY': 'Safety'
        };
        return categories[category] || category;
    };

    const categoryOptions = [
        { value: "PRE_JOB", label: "Pre-Job" },
        { value: "POST_JOB", label: "Post-Job" },
        { value: "PERIODIC", label: "Periodic" },
        { value: "SAFETY", label: "Safety" }
    ];

    const filterComponents = (
        <>
            <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="filter-select">
                <option value="">All Categories</option>
                {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="filter-select">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
            <div className="filter-buttons">
                <Button variant="primary" size="sm" onClick={handleApplyFilters}>Apply Filters</Button>
            </div>
        </>
    );

    const displayTemplates = filteredTemplates;
    const totalPages = Math.ceil(displayTemplates.length / itemsPerPage);
    const currentItems = displayTemplates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const toggleExpand = (id) => setExpandedRow(expandedRow === id ? null : id);

    const renderCardView = () => (
        <div className="inspection-cards-grid">
            {currentItems.map(t => (
                <div key={t.templateID} className={`inspection-card ${expandedRow === t.templateID ? 'expanded' : ''}`}>
                    <div className="inspection-card-header" onClick={() => toggleExpand(t.templateID)}>
                        <FaClipboardList className="card-icon" />
                        <div className="card-info">
                            <h4>{t.templateCode} - {t.templateName}</h4>
                            <span>{getCategoryLabel(t.category)}</span>
                        </div>
                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                            <span className={`status-badge ${t.isActive ? 'active' : 'inactive'}`}>
                                {t.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <button className="card-btn items" onClick={() => handleManageItems(t)} title="Manage Items"><FaList /></button>
                            <button className="card-btn edit" onClick={() => handleEdit(t)} title="Edit"><FaEdit /></button>
                            <button className="card-btn delete" onClick={() => handleDelete(t.templateID, t.templateName)} title="Delete"><FaTrash /></button>
                            <button className="card-btn expand">{expandedRow === t.templateID ? <FaChevronUp /> : <FaChevronDown />}</button>
                        </div>
                    </div>
                    <div className="inspection-card-body">
                        <div className="info-row">Description: {t.description || '-'}</div>
                        <div className="info-row">Items: {t.items?.length || 0} inspection items</div>
                    </div>
                    {expandedRow === t.templateID && t.items?.length > 0 && (
                        <div className="inspection-card-expanded">
                            <table className="expanded-table">
                                <thead><tr><th>Item Code</th><th>Item Name</th><th>Type</th><th>Required</th></tr></thead>
                                <tbody>
                                    {t.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.itemCode}</td>
                                            <td>{item.itemName}</td>
                                            <td>{item.itemType || 'Checkbox'}</td>
                                            <td>{item.isRequired ? 'Yes' : 'No'}</td>
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

    const FaChevronDown = () => <span>▼</span>;
    const FaChevronUp = () => <span>▲</span>;

    return (
        <div className="inspection-page-premium">
            <PageHeader title="Inspection Templates" icon={<FaClipboardList />} addButtonText="New Template" onAdd={handleAdd} />

            <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search by code, name or description..."
                onRefresh={loadTemplates}
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

            {loading && (<div className="loading-container"><div className="spinner"></div><p>Loading templates...</p></div>)}

            {!loading && showList && (
                displayTemplates.length > 0 ? (
                    <>
                        {renderCardView()}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</button>
                                <span>Page {currentPage} of {totalPages}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyState icon={<FaClipboardList />} title="No templates found" description="Try adjusting your filters" action={<Button variant="primary" onClick={resetFilters}>Clear Filters</Button>} />
                )
            )}

            {!loading && templates.length === 0 && !showList && (
                <EmptyState icon={<FaClipboardList />} title="No templates yet" description="Get started by creating your first inspection template" action={<Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>New Template</Button>} />
            )}

            {showModal && (
                <InspectionTemplateModal
                    template={selectedTemplate}
                    onClose={() => { setShowModal(false); setSelectedTemplate(null); }}
                    onSaved={() => { loadTemplates(); setShowModal(false); setSelectedTemplate(null); }}
                />
            )}

            {showItems && selectedTemplate && (
                <InspectionItemsPage
                    template={selectedTemplate}
                    onClose={() => { setShowItems(false); setSelectedTemplate(null); }}
                />
            )}
        </div>
    );
}