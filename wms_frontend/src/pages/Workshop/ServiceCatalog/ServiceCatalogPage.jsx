import React, { useEffect, useState } from "react";
import serviceCatalogApi from "../../../api/serviceCatalogApi";
import ServiceCatalogModal from "./ServiceCatalogModal";
import { FaWrench, FaPlus, FaEdit, FaTrash, FaClock, FaDollarSign, FaTag } from "react-icons/fa";
import { Button, useDialog } from "../../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../../components/features";
import "./ServiceCatalog.css";

export default function ServiceCatalogPage() {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);

    // SearchFilterBar States
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filters State
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        category: "", requiresParts: "", status: ""
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { showConfirm, showSuccess, showError } = useDialog();

    const loadServices = async () => {
        setLoading(true);
        try {
            const res = await serviceCatalogApi.getAll();
            let servicesData = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                servicesData = res.data.data;
            } else if (Array.isArray(res.data)) {
                servicesData = res.data;
            }
            setServices(servicesData);
            setFilteredServices(servicesData);

            // Extract unique categories for filter
            const uniqueCategories = [...new Set(servicesData.map(s => s.category).filter(c => c))];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error("Error loading services:", error);
            showError(error.response?.data?.message || "Failed to load services");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadServices();
    }, []);

    // Apply all filters
    const applyFilters = () => {
        let filtered = [...services];

        // Search term filter
        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(s =>
                (s.serviceCode || '').toLowerCase().includes(term) ||
                (s.serviceName || '').toLowerCase().includes(term) ||
                (s.category || '').toLowerCase().includes(term)
            );
        }

        // Category filter
        if (filters.category) {
            filtered = filtered.filter(s => s.category === filters.category);
        }

        // Requires Parts filter
        if (filters.requiresParts === "yes") {
            filtered = filtered.filter(s => s.requiresParts === true);
        } else if (filters.requiresParts === "no") {
            filtered = filtered.filter(s => s.requiresParts !== true);
        }

        // Status filter
        if (filters.status === "active") {
            filtered = filtered.filter(s => !s.inActive);
        } else if (filters.status === "inactive") {
            filtered = filtered.filter(s => s.inActive === true);
        }

        setFilteredServices(filtered);
        setCurrentPage(1);
        setShowList(true);
    };

    // Reset all filters
    const resetFilters = () => {
        setFilters({ category: "", requiresParts: "", status: "" });
        setSearchTerm("");
        setFilteredServices(services);
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
    const hasActiveFilters = filters.category || filters.requiresParts || filters.status;

    // CRUD Operations
    const handleAdd = () => {
        setSelectedService(null);
        setShowModal(true);
    };

    const handleEdit = (service) => {
        setSelectedService(service);
        setShowModal(true);
    };

    const handleDelete = async (id, serviceCode) => {
        showConfirm(`Delete service "${serviceCode}"?`, async () => {
            try {
                await serviceCatalogApi.delete(id);
                await loadServices();
                showSuccess(`Service "${serviceCode}" deleted successfully`);
            } catch (error) {
                console.error("Delete error:", error);
                showError(error.response?.data?.message || "Failed to delete service");
            }
        }, 'Delete Service');
    };

    // Pagination
    const displayServices = filteredServices;
    const totalPages = Math.ceil(displayServices.length / itemsPerPage);
    const currentItems = displayServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const toggleExpand = (id) => setExpandedRow(expandedRow === id ? null : id);

    // Filter Components for SearchFilterBar
    const filterComponents = (
        <>
            <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
            >
                <option value="">All Categories</option>
                {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>

            <select
                value={filters.requiresParts}
                onChange={(e) => handleFilterChange('requiresParts', e.target.value)}
                className="filter-select"
            >
                <option value="">All (Parts)</option>
                <option value="yes">Requires Parts</option>
                <option value="no">No Parts Required</option>
            </select>

            <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
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
        <div className="service-cards-grid">
            {currentItems.map(s => (
                <div key={s.serviceID} className={`service-card ${expandedRow === s.serviceID ? 'expanded' : ''}`}>
                    <div className="service-card-header" onClick={() => toggleExpand(s.serviceID)}>
                        <FaWrench className="card-icon" />
                        <div className="card-info">
                            <h4>{s.serviceCode} - {s.serviceName}</h4>
                            <span><FaTag /> {s.category || 'Uncategorized'}</span>
                        </div>
                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                            <button className="card-btn edit" onClick={() => handleEdit(s)}>
                                <FaEdit />
                            </button>
                            <button className="card-btn delete" onClick={() => handleDelete(s.serviceID, s.serviceCode)}>
                                <FaTrash />
                            </button>
                            <button className="card-btn expand">
                                {expandedRow === s.serviceID ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                        </div>
                    </div>
                    <div className="service-card-body">
                        <div className="info-row">
                            <FaDollarSign /> Labor Rate: Rs. {s.defaultLaborRate?.toFixed(2) || '0.00'}
                        </div>
                        <div className="info-row">
                            <FaClock /> Est. Time: {s.estimatedTime || '-'} minutes
                        </div>
                        <div className="info-row">
                            <FaTag /> Warranty: {s.warrantyPeriod || '-'} days
                        </div>
                        <div className="info-row">
                            <span className={`status-badge ${s.inActive ? 'inactive' : 'active'}`}>
                                {s.inActive ? 'Inactive' : 'Active'}
                            </span>
                            {s.requiresParts && <span className="parts-badge">Requires Parts</span>}
                        </div>
                    </div>
                    {expandedRow === s.serviceID && (
                        <div className="service-card-expanded">
                            <table className="expanded-table">
                                <tbody>
                                    <tr><th>Description:</th><td>{s.description || '-'}</td></tr>
                                    <tr><th>Requires Parts:</th><td>{s.requiresParts ? 'Yes' : 'No'}</td></tr>
                                    {s.suggestedParts?.length > 0 && (
                                        <tr>
                                            <th>Suggested Parts:</th>
                                            <td>{s.suggestedParts.join(', ')}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    // Import missing icons
    const FaChevronDown = () => <span>▼</span>;
    const FaChevronUp = () => <span>▲</span>;

    return (
        <div className="service-page-premium">
            <PageHeader
                title="Service Catalog"
                icon={<FaWrench />}
                addButtonText="Add Service"
                onAdd={handleAdd}
            />

            <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search by code, name or category..."
                onRefresh={loadServices}
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

            {loading && (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading services...</p>
                </div>
            )}

            {!loading && showList && (
                displayServices.length > 0 ? (
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
                    <EmptyState
                        icon={<FaWrench />}
                        title="No services found"
                        description="Try adjusting your filters"
                        action={<Button variant="primary" onClick={resetFilters}>Clear Filters</Button>}
                    />
                )
            )}

            {!loading && services.length === 0 && !showList && (
                <EmptyState
                    icon={<FaWrench />}
                    title="No services yet"
                    description="Get started by adding your first service"
                    action={<Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>Add Service</Button>}
                />
            )}

            {showModal && (
                <ServiceCatalogModal
                    service={selectedService}
                    onClose={() => setShowModal(false)}
                    onSaved={() => {
                        loadServices();
                        setShowModal(false);
                    }}
                />
            )}
        </div>
    );
}