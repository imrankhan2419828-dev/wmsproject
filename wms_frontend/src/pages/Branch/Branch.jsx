import React, { useEffect, useState } from "react";
import branchApi from "../../api/branchApi";
import BranchModal from "./BranchModal";
import {
    FaBuilding, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle,
    FaMapMarkerAlt, FaPhone, FaUser, FaEnvelope, FaCity, FaSearch,
    FaTimes, FaFilter, FaSync, FaEye, FaEyeSlash
} from "react-icons/fa";
import { Button, useDialog } from "../../components/common";
import { PageHeader, EmptyState } from "../../components/features";
import "./branch.css";

export default function Branch() {
    const [branches, setBranches] = useState([]);
    const [filteredBranches, setFilteredBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const { showConfirm, showSuccess, showError } = useDialog();

    const loadBranches = async () => {
        setLoading(true);
        try {
            const res = await branchApi.getAll();
            let data = res.data?.data || res.data || [];
            const activeBranches = data.filter(b => !b.isDeleted);
            setBranches(activeBranches);
            setFilteredBranches(activeBranches);
        } catch (err) {
            console.error("Error loading branches:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBranches();
    }, []);

    const applyFilters = () => {
        let filtered = [...branches];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(b =>
                (b.branchName || '').toLowerCase().includes(term) ||
                (b.branchCity || '').toLowerCase().includes(term) ||
                (b.branchAbbr || '').toLowerCase().includes(term)
            );
        }
        if (filterStatus === 'active') filtered = filtered.filter(b => !b.inActive);
        if (filterStatus === 'inactive') filtered = filtered.filter(b => b.inActive);
        setFilteredBranches(filtered);
        setShowList(true);
    };

    const resetFilters = () => {
        setFilterStatus("");
        setSearchTerm("");
        setFilteredBranches(branches);
        setShowList(false);
        setShowFilters(false);
    };

    const handleAdd = () => { setSelectedBranch(null); setShowModal(true); };
    const handleEdit = (branch) => { setSelectedBranch(branch); setShowModal(true); };

    const handleDelete = async (id, name) => {
        showConfirm(`Delete branch "${name}"?`, async () => {
            try {
                await branchApi.delete(id);
                await loadBranches();
                if (showList) applyFilters();
                showSuccess(`"${name}" deleted!`);
            } catch (err) { showError("Failed to delete branch"); }
        }, 'Delete Branch');
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedBranch(null);
        loadBranches();
    };

    const hasActiveFilters = filterStatus;
    const currentBranches = showList ? filteredBranches : [];

    const renderCardView = () => (
        <div className="branch-cards-grid">
            {currentBranches.map(branch => (
                <div key={branch.branchID} className="branch-card">
                    <div className="branch-card-header">
                        <FaBuilding className="card-icon" />
                        <div className="card-info">
                            <h4>{branch.branchName}</h4>
                            {branch.branchAbbr && <span className="branch-code">{branch.branchAbbr}</span>}
                        </div>
                        <div className="card-actions">
                            <button className="card-btn edit" onClick={() => handleEdit(branch)}><FaEdit /></button>
                            <button className="card-btn delete" onClick={() => handleDelete(branch.branchID, branch.branchName)}><FaTrash /></button>
                        </div>
                    </div>
                    <div className="branch-card-body">
                        {branch.branchAddress && (
                            <div className="info-row"><FaMapMarkerAlt /> {branch.branchAddress}</div>
                        )}
                        {branch.branchCity && (
                            <div className="info-row"><FaCity /> {branch.branchCity}</div>
                        )}
                        {branch.branchPhone && (
                            <div className="info-row"><FaPhone /> {branch.branchPhone}</div>
                        )}
                        {branch.branchCooridnator && (
                            <div className="info-row"><FaUser /> {branch.branchCooridnator}</div>
                        )}
                        {branch.c_Email && (
                            <div className="info-row"><FaEnvelope /> {branch.c_Email}</div>
                        )}
                        <div className="info-row">
                            <span className={`status-badge ${branch.inActive ? 'inactive' : 'active'}`}>
                                {branch.inActive ? <><FaTimesCircle /> Inactive</> : <><FaCheckCircle /> Active</>}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="branch-page-premium">
            <PageHeader
                title="Branch Management"
                subtitle="Manage your business branches"
                icon={<FaBuilding />}
                addButtonText="Add Branch"
                onAdd={handleAdd}
            />

            <div className="search-action-bar">
                <div className="search-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, city or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                        className="search-input"
                    />
                </div>
                <div className="action-group">
                    <Button variant="outline" size="sm" onClick={loadBranches} loading={loading} icon={<FaSync />}>Refresh</Button>
                    <Button variant={showList ? 'primary' : 'outline'} size="sm" onClick={() => setShowList(!showList)} icon={showList ? <FaEyeSlash /> : <FaEye />}>{showList ? 'Hide' : 'Show'}</Button>
                    <Button variant={showFilters ? 'primary' : 'outline'} size="sm" onClick={() => setShowFilters(!showFilters)} icon={<FaFilter />}>Filters</Button>
                    {hasActiveFilters && <Button variant="outline" size="sm" onClick={resetFilters} icon={<FaTimes />}>Clear</Button>}
                    <Button variant="primary" size="sm" onClick={applyFilters} icon={<FaSearch />}>Search</Button>
                </div>
            </div>

            {showFilters && (
                <div className="filters-panel">
                    <div className="filters-grid-1">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            )}

            {loading && (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading branches...</p>
                </div>
            )}

            {!loading && showList && (
                currentBranches.length > 0 ? renderCardView() : (
                    <EmptyState
                        icon={<FaBuilding />}
                        title="No branches found"
                        description="Try adjusting your filters"
                        action={<Button variant="primary" onClick={resetFilters}>Clear Filters</Button>}
                    />
                )
            )}

            {!loading && branches.length === 0 && !showList && (
                <EmptyState
                    icon={<FaBuilding />}
                    title="No branches yet"
                    description="Get started by adding your first branch"
                    action={<Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>Add Branch</Button>}
                />
            )}

            {showModal && (
                <BranchModal
                    branch={selectedBranch}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
}