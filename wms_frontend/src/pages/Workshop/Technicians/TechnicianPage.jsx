import React, { useEffect, useState } from "react";
import technicianApi from "../../../api/technicianApi";
import TechnicianModal from "./TechnicianModal";
import { FaUserCog, FaPlus, FaEdit, FaTrash, FaUser, FaIdCard, FaClock, FaDollarSign, FaCalendarAlt, FaWrench } from "react-icons/fa";
import { Button, useDialog } from "../../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../../components/features";
import "./Technician.css";

// Simple Chevron Icons
const ChevronDown = () => <span style={{ fontSize: '12px' }}>▼</span>;
const ChevronUp = () => <span style={{ fontSize: '12px' }}>▲</span>;

export default function TechnicianPage() {
    const [technicians, setTechnicians] = useState([]);
    const [filteredTechnicians, setFilteredTechnicians] = useState([]);
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);

    // SearchFilterBar States
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filters State
    const [filters, setFilters] = useState({
        specialization: "", status: ""
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { showConfirm, showSuccess, showError } = useDialog();

    const loadTechnicians = async () => {
        setLoading(true);
        try {
            const res = await technicianApi.getAll();
            let techniciansData = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                techniciansData = res.data.data;
            } else if (Array.isArray(res.data)) {
                techniciansData = res.data;
            }
            setTechnicians(techniciansData);
            setFilteredTechnicians(techniciansData);
        } catch (error) {
            console.error("Error loading technicians:", error);
            showError(error.response?.data?.message || "Failed to load technicians");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTechnicians();
    }, []);

    // Apply all filters
    const applyFilters = () => {
        let filtered = [...technicians];

        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(t =>
                (t.fullName || '').toLowerCase().includes(term) ||
                (t.employeeCode || '').toLowerCase().includes(term) ||
                (t.userName || '').toLowerCase().includes(term) ||
                (t.specialization || '').toLowerCase().includes(term)
            );
        }

        if (filters.specialization) {
            filtered = filtered.filter(t =>
                (t.specialization || '').toLowerCase().includes(filters.specialization.toLowerCase())
            );
        }

        if (filters.status === "active") {
            filtered = filtered.filter(t => !t.inActive);
        } else if (filters.status === "inactive") {
            filtered = filtered.filter(t => t.inActive === true);
        }

        setFilteredTechnicians(filtered);
        setCurrentPage(1);
        setShowList(true);
    };

    const resetFilters = () => {
        setFilters({ specialization: "", status: "" });
        setSearchTerm("");
        setFilteredTechnicians(technicians);
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

    const hasActiveFilters = filters.specialization || filters.status;

    const handleAdd = () => {
        setSelectedTechnician(null);
        setShowModal(true);
    };

    const handleEdit = (technician) => {
        setSelectedTechnician(technician);
        setShowModal(true);
    };

    const handleDelete = async (id, fullName) => {
        showConfirm(`Delete technician "${fullName}"?`, async () => {
            try {
                await technicianApi.delete(id);
                await loadTechnicians();
                showSuccess(`Technician "${fullName}" deleted successfully`);
            } catch (error) {
                console.error("Delete error:", error);
                showError(error.response?.data?.message || "Failed to delete technician");
            }
        }, 'Delete Technician');
    };

    const displayTechnicians = filteredTechnicians;
    const totalPages = Math.ceil(displayTechnicians.length / itemsPerPage);
    const currentItems = displayTechnicians.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const toggleExpand = (id) => setExpandedRow(expandedRow === id ? null : id);

    const specializations = [...new Set(technicians.map(t => t.specialization).filter(s => s))];

    const filterComponents = (
        <>
            <input
                type="text"
                placeholder="Specialization"
                value={filters.specialization}
                onChange={(e) => handleFilterChange('specialization', e.target.value)}
                className="filter-input"
                list="specialization-list"
            />
            <datalist id="specialization-list">
                {specializations.map(s => <option key={s} value={s}>{s}</option>)}
            </datalist>

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

    const getWorkloadStatus = (workload, capacity) => {
        const percentage = (workload / capacity) * 100;
        if (percentage >= 80) return "high";
        if (percentage >= 50) return "medium";
        return "low";
    };

    const renderCardView = () => (
        <div className="technician-cards-grid">
            {currentItems.map(t => (
                <div key={t.technicianID} className={`technician-card ${expandedRow === t.technicianID ? 'expanded' : ''}`}>
                    <div className="technician-card-header" onClick={() => toggleExpand(t.technicianID)}>
                        <FaUserCog className="card-icon" />
                        <div className="card-info">
                            <h4>{t.fullName}</h4>
                            <span><FaIdCard /> {t.employeeCode || 'No Code'}</span>
                        </div>
                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                            <button className="card-btn edit" onClick={() => handleEdit(t)}>
                                <FaEdit />
                            </button>
                            <button className="card-btn delete" onClick={() => handleDelete(t.technicianID, t.fullName)}>
                                <FaTrash />
                            </button>
                            <button className="card-btn expand">
                                {expandedRow === t.technicianID ? <ChevronUp /> : <ChevronDown />}
                            </button>
                        </div>
                    </div>
                    <div className="technician-card-body">
                        <div className="info-row">
                            <FaWrench /> {t.specialization || 'General'}
                        </div>
                        <div className="info-row">
                            <FaCalendarAlt /> {t.experienceYears || 0} years exp.
                        </div>
                        <div className="info-row">
                            <FaDollarSign /> Rs. {t.hourlyRate?.toFixed(2) || '0.00'}/hr
                        </div>
                        <div className="info-row">
                            <div className={`workload-badge ${getWorkloadStatus(t.currentWorkload || 0, t.dailyCapacity || 8)}`}>
                                Workload: {t.currentWorkload || 0}/{t.dailyCapacity || 8}
                            </div>
                            <div className={`status-badge ${t.inActive ? 'inactive' : 'active'}`}>
                                {t.inActive ? 'Inactive' : 'Active'}
                            </div>
                        </div>
                    </div>
                    {expandedRow === t.technicianID && (
                        <div className="technician-card-expanded">
                            <table className="expanded-table">
                                <tbody>
                                    <tr>
                                        <th>User Name:</th>
                                        <td>{t.userName || '-'}</td>
                                    </tr>
                                    <tr>
                                        <th>Certification:</th>
                                        <td>{t.certification || '-'}</td>
                                    </tr>
                                    <tr>
                                        <th>Daily Capacity:</th>
                                        <td>{t.dailyCapacity || 8} jobs/day</td>
                                    </tr>
                                    {t.remarks && (
                                        <tr>
                                            <th>Remarks:</th>
                                            <td>{t.remarks}</td>
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

    return (
        <div className="technician-page-premium">
            <PageHeader
                title="Technician Management"
                icon={<FaUserCog />}
                addButtonText="Add Technician"
                onAdd={handleAdd}
            />

            <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search by name, employee code, specialization..."
                onRefresh={loadTechnicians}
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
                    <p>Loading technicians...</p>
                </div>
            )}

            {!loading && showList && (
                displayTechnicians.length > 0 ? (
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
                        icon={<FaUserCog />}
                        title="No technicians found"
                        description="Try adjusting your filters"
                        action={<Button variant="primary" onClick={resetFilters}>Clear Filters</Button>}
                    />
                )
            )}

            {!loading && technicians.length === 0 && !showList && (
                <EmptyState
                    icon={<FaUserCog />}
                    title="No technicians yet"
                    description="Get started by adding your first technician"
                    action={<Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>Add Technician</Button>}
                />
            )}

            {showModal && (
                <TechnicianModal
                    technician={selectedTechnician}
                    onClose={() => setShowModal(false)}
                    onSaved={() => {
                        loadTechnicians();
                        setShowModal(false);
                    }}
                />
            )}
        </div>
    );
}