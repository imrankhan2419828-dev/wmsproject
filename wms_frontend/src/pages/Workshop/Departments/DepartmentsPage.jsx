import React, { useEffect, useState } from "react";
import departmentApi from "../../../api/departmentApi";
import DepartmentModal from "./DepartmentModal";
import { Link } from "react-router-dom";
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { Button, useDialog } from "../../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../../components/features";
import "./Departments.css";

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dashboard, setDashboard] = useState(null);
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({ status: "" });
    const { showConfirm, showSuccess, showError } = useDialog();

    const loadDepartments = async () => {
        setLoading(true);
        try {
            const res = await departmentApi.getAll();
            let data = res.data?.data || res.data || [];
            setDepartments(data);
            setFilteredDepartments(data);
        } catch (error) {
            showError(error.response?.data?.message || "Failed to load departments");
        } finally {
            setLoading(false);
        }
    };

    const loadDashboard = async () => {
        try {
            const res = await departmentApi.getDashboard();
            setDashboard(res.data?.data || res.data);
        } catch (error) {
            console.error("Error loading dashboard:", error);
        }
    };

    useEffect(() => { loadDepartments(); loadDashboard(); }, []);

    const applyFilters = () => {
        let filtered = [...departments];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(d =>
                d.departmentName?.toLowerCase().includes(term) ||
                d.departmentCode?.toLowerCase().includes(term)
            );
        }
        if (filters.status === "active") filtered = filtered.filter(d => d.isActive);
        if (filters.status === "inactive") filtered = filtered.filter(d => !d.isActive);
        setFilteredDepartments(filtered);
        setShowList(true);
    };

    const resetFilters = () => {
        setFilters({ status: "" });
        setSearchTerm("");
        setFilteredDepartments(departments);
        setShowList(false);
        setShowFilters(false);
    };

    const handleToggleStatus = async (id, currentStatus) => {
        showConfirm(`${currentStatus ? 'Deactivate' : 'Activate'} this department?`, async () => {
            try {
                await departmentApi.toggleStatus(id, !currentStatus);
                showSuccess(`Department ${!currentStatus ? 'activated' : 'deactivated'}`);
                loadDepartments(); loadDashboard();
            } catch (error) { showError("Failed to toggle status"); }
        }, "Toggle Status");
    };

    const handleDelete = async (id, name) => {
        showConfirm(`Delete department "${name}"?`, async () => {
            try {
                await departmentApi.delete(id);
                showSuccess("Department deleted");
                loadDepartments(); loadDashboard();
            } catch (error) { showError("Failed to delete department"); }
        }, "Delete Department");
    };

    const filterComponents = (
        <>
            <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))} className="filter-select">
                <option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
            <div className="filter-buttons"><Button variant="primary" size="sm" onClick={applyFilters}>Apply Filters</Button></div>
        </>
    );

    const renderCardView = () => (
        <div className="dept-cards-grid">
            {filteredDepartments.map(d => (
                <div key={d.departmentID} className="dept-card">
                    <div className="dept-card-header">
                        <FaBuilding className="card-icon" />
                        <div className="card-info">
                            <h4>{d.departmentCode} - {d.departmentName}</h4>
                            <span>{d.location || 'No Location'}</span>
                        </div>
                        <span className={`status-badge ${d.isActive ? 'active' : 'inactive'}`}>{d.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="dept-card-body">
                        <div className="info-row">{d.description || 'No description'}</div>
                        <div className="dept-stats">
                            <div className="stat"><span className="stat-value">{d.technicianCount || 0}</span><span className="stat-label">Techs</span></div>
                            <div className="stat"><span className="stat-value">{d.activeJobs || 0}</span><span className="stat-label">Active Jobs</span></div>
                            <div className="stat"><span className="stat-value">{d.completedJobs || 0}</span><span className="stat-label">Completed</span></div>
                        </div>
                    </div>
                    <div className="dept-card-footer">
                        <Link to={`/department-details/${d.departmentID}`} className="btn-link"><FaEye /> Details</Link>
                        <div className="card-actions">
                            <button className="card-btn edit" onClick={() => { setSelectedDepartment(d); setShowModal(true); }}><FaEdit /></button>
                            <button className="card-btn toggle" onClick={() => handleToggleStatus(d.departmentID, d.isActive)}>{d.isActive ? <FaToggleOn /> : <FaToggleOff />}</button>
                            <button className="card-btn delete" onClick={() => handleDelete(d.departmentID, d.departmentName)}><FaTrash /></button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="dept-page-premium">
            <PageHeader title="Department Management" icon={<FaBuilding />} addButtonText="New Department" onAdd={() => { setSelectedDepartment(null); setShowModal(true); }} />
            {dashboard && (<div className="dashboard-stats">{['totalDepartments', 'activeJobs', 'availableTechnicians'].map(key => (<div key={key} className="stat-card"><span className="stat-value">{dashboard[key] || 0}</span><span className="stat-label">{key.replace(/([A-Z])/g, ' $1').trim()}</span></div>))}</div>)}
            <SearchFilterBar searchValue={searchTerm} onSearchChange={setSearchTerm} searchPlaceholder="Search by name or code..." onRefresh={loadDepartments} showList={showList} onToggleList={() => setShowList(!showList)} onToggleFilters={() => setShowFilters(!showFilters)} showFilters={showFilters} hasActiveFilters={!!filters.status} onClearFilters={resetFilters} onSearchSubmit={applyFilters} loading={loading} filterComponents={filterComponents} />
            {loading && (<div className="loading-container"><div className="spinner"></div><p>Loading departments...</p></div>)}
            {!loading && showList && (filteredDepartments.length > 0 ? renderCardView() : <EmptyState icon={<FaBuilding />} title="No departments found" description="Try adjusting your filters" action={<Button variant="primary" onClick={resetFilters}>Clear Filters</Button>} />)}
            {!loading && departments.length === 0 && !showList && (<EmptyState icon={<FaBuilding />} title="No departments yet" description="Create your first department" action={<Button variant="primary" onClick={() => { setSelectedDepartment(null); setShowModal(true); }} icon={<FaPlus />}>New Department</Button>} />)}
            {showModal && <DepartmentModal department={selectedDepartment} onClose={() => { setShowModal(false); setSelectedDepartment(null); }} onSaved={() => { loadDepartments(); loadDashboard(); setShowModal(false); setSelectedDepartment(null); }} />}
        </div>
    );
}