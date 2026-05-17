import React, { useEffect, useState } from "react";
import notificationApi from "../../../api/notificationApi";
import NotificationTemplateModal from "./NotificationTemplateModal";
import { FaEnvelope, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Button, useDialog } from "../../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../../components/features";
import "./Notifications.css";

export default function NotificationTemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [filteredTemplates, setFilteredTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);

    // SearchFilterBar States
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filters State
    const [filters, setFilters] = useState({
        notificationType: "", sentVia: "", status: ""
    });

    const { showConfirm, showSuccess, showError } = useDialog();

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const res = await notificationApi.getTemplates();
            let data = res.data?.data || res.data || [];
            setTemplates(data);
            setFilteredTemplates(data);
        } catch (error) {
            showError(error.response?.data?.message || "Failed to load templates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadTemplates(); }, []);

    const applyFilters = () => {
        let filtered = [...templates];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(t =>
                t.templateCode?.toLowerCase().includes(term) ||
                t.templateName?.toLowerCase().includes(term)
            );
        }
        if (filters.notificationType) filtered = filtered.filter(t => t.notificationType === filters.notificationType);
        if (filters.sentVia) filtered = filtered.filter(t => t.sentVia === filters.sentVia);
        if (filters.status === "active") filtered = filtered.filter(t => t.isActive);
        if (filters.status === "inactive") filtered = filtered.filter(t => !t.isActive);
        setFilteredTemplates(filtered);
        setShowList(true);
    };

    const resetFilters = () => {
        setFilters({ notificationType: "", sentVia: "", status: "" });
        setSearchTerm("");
        setFilteredTemplates(templates);
        setShowList(false);
        setShowFilters(false);
    };

    const handleFilterChange = (field, value) => setFilters(prev => ({ ...prev, [field]: value }));
    const handleApplyFilters = () => { applyFilters(); setShowFilters(false); };
    const hasActiveFilters = filters.notificationType || filters.sentVia || filters.status;

    const handleAdd = () => { setSelectedTemplate(null); setShowModal(true); };
    const handleEdit = (template) => { setSelectedTemplate(template); setShowModal(true); };
    const handleDelete = async (id, name) => {
        showConfirm(`Delete template "${name}"?`, async () => {
            try {
                await notificationApi.deleteTemplate(id);
                showSuccess("Template deleted successfully");
                loadTemplates();
            } catch (error) {
                showError(error.response?.data?.message || "Failed to delete template");
            }
        }, "Delete Template");
    };

    const filterComponents = (
        <>
            <select value={filters.notificationType} onChange={(e) => handleFilterChange('notificationType', e.target.value)} className="filter-select">
                <option value="">All Types</option>
                {['JOB_CREATED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'REMINDER', 'ESTIMATE', 'INVOICE'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filters.sentVia} onChange={(e) => handleFilterChange('sentVia', e.target.value)} className="filter-select">
                <option value="">All Channels</option>
                <option value="SMS">SMS</option><option value="EMAIL">Email</option><option value="WHATSAPP">WhatsApp</option><option value="BOTH">Both</option>
            </select>
            <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="filter-select">
                <option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
            <div className="filter-buttons"><Button variant="primary" size="sm" onClick={handleApplyFilters}>Apply Filters</Button></div>
        </>
    );

    const renderCardView = () => (
        <div className="notification-cards-grid">
            {filteredTemplates.map(t => (
                <div key={t.templateID} className={`notification-card ${expandedRow === t.templateID ? 'expanded' : ''}`}>
                    <div className="notification-card-header" onClick={() => setExpandedRow(expandedRow === t.templateID ? null : t.templateID)}>
                        <FaEnvelope className="card-icon" />
                        <div className="card-info">
                            <h4>{t.templateCode} - {t.templateName}</h4>
                            <span>{t.notificationType} | {t.sentVia}</span>
                        </div>
                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                            <span className={`status-badge ${t.isActive ? 'active' : 'inactive'}`}>{t.isActive ? 'Active' : 'Inactive'}</span>
                            <button className="card-btn edit" onClick={() => handleEdit(t)}><FaEdit /></button>
                            <button className="card-btn delete" onClick={() => handleDelete(t.templateID, t.templateName)}><FaTrash /></button>
                            <button className="card-btn expand">{expandedRow === t.templateID ? <FaChevronUp /> : <FaChevronDown />}</button>
                        </div>
                    </div>
                    {expandedRow === t.templateID && (
                        <div className="notification-card-expanded">
                            <div className="detail-row"><strong>Subject:</strong> {t.subjectTemplate || '-'}</div>
                            <div className="detail-row"><strong>Content:</strong> <div className="content-preview">{t.bodyTemplate}</div></div>
                            <div className="detail-row"><strong>Placeholders:</strong> {t.placeholders || '-'}</div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    const FaChevronDown = () => <span>▼</span>;
    const FaChevronUp = () => <span>▲</span>;

    return (
        <div className="notification-page-premium">
            <PageHeader title="Notification Templates" icon={<FaEnvelope />} addButtonText="New Template" onAdd={handleAdd} />
            <SearchFilterBar searchValue={searchTerm} onSearchChange={setSearchTerm} searchPlaceholder="Search by code or name..." onRefresh={loadTemplates} showList={showList} onToggleList={() => setShowList(!showList)} onToggleFilters={() => setShowFilters(!showFilters)} showFilters={showFilters} hasActiveFilters={hasActiveFilters} onClearFilters={resetFilters} onSearchSubmit={applyFilters} loading={loading} filterComponents={filterComponents} />
            {loading && (<div className="loading-container"><div className="spinner"></div><p>Loading templates...</p></div>)}
            {!loading && showList && (filteredTemplates.length > 0 ? renderCardView() : <EmptyState icon={<FaEnvelope />} title="No templates found" description="Try adjusting your filters" action={<Button variant="primary" onClick={resetFilters}>Clear Filters</Button>} />)}
            {!loading && templates.length === 0 && !showList && (<EmptyState icon={<FaEnvelope />} title="No templates yet" description="Create your first notification template" action={<Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>New Template</Button>} />)}
            {showModal && <NotificationTemplateModal template={selectedTemplate} onClose={() => { setShowModal(false); setSelectedTemplate(null); }} onSaved={() => { loadTemplates(); setShowModal(false); setSelectedTemplate(null); }} />}
        </div>
    );
}