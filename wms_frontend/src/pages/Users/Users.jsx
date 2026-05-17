import React, { useEffect, useState, useContext } from "react";
import axiosClient from "../../api/axiosClient";
import UserPopup from "./UserModal";
import AuthContext from "../../context/AuthContext";
import {
    FaUsers, FaPlus, FaEdit, FaTrash, FaUserShield, FaUserCircle,
    FaCheckCircle, FaTimesCircle, FaBuilding, FaSearch,
    FaTimes, FaFilter, FaSync, FaEye, FaEyeSlash
} from "react-icons/fa";
import { Button, useDialog } from "../../components/common";
import { PageHeader, EmptyState } from "../../components/features";
import "./users.css";

export default function UserPage() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({ role: "", status: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { state } = useContext(AuthContext);
    const { showConfirm, showSuccess, showError } = useDialog();
    const isSuperAdmin = state.user?.roleName?.toLowerCase() === "superadmin";

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get("/SystemUser");
            let data = res.data?.data || res.data || [];
            setUsers(Array.isArray(data) ? data : []);
            setFilteredUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Load error:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadRoles = async () => {
        try {
            const res = await axiosClient.get("/SystemUser/roles");
            let data = res.data?.data || res.data || [];
            setRoles(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Roles error:", err);
        }
    };

    useEffect(() => { loadUsers(); loadRoles(); }, []);

    const applyFilters = () => {
        let filtered = [...users];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(u => (u.userFullName || '').toLowerCase().includes(term) || (u.userName || '').toLowerCase().includes(term));
        }
        if (filters.role) filtered = filtered.filter(u => u.roleID === parseInt(filters.role));
        if (filters.status === 'active') filtered = filtered.filter(u => !u.inActive);
        if (filters.status === 'inactive') filtered = filtered.filter(u => u.inActive);
        setFilteredUsers(filtered);
        setCurrentPage(1);
        setShowList(true);
    };

    const resetFilters = () => {
        setFilters({ role: "", status: "" });
        setSearchTerm("");
        setFilteredUsers(users);
        setCurrentPage(1);
        setShowList(false);
        setShowFilters(false);
    };

    const handleAdd = () => { setSelectedUser(null); setShowPopup(true); };
    const handleEdit = (user) => { setSelectedUser(user); setShowPopup(true); };

    const handleDelete = (id, name) => {
        showConfirm(`Delete user "${name}"?`, async () => {
            try {
                await axiosClient.delete(`/SystemUser/${id}`);
                await loadUsers();
                if (showList) applyFilters();
                showSuccess(`"${name}" deleted!`);
            } catch (err) { showError("Failed to delete user"); }
        }, 'Delete User');
    };

    const hasActiveFilters = filters.role || filters.status;
    const displayUsers = filteredUsers;
    const totalPages = Math.ceil(displayUsers.length / itemsPerPage);
    const currentItems = displayUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const renderCardView = () => (
        <div className="user-cards-grid">
            {currentItems.map(u => (
                <div key={u.userID} className="user-card">
                    <div className="user-card-header">
                        <FaUserCircle className="card-icon" />
                        <div className="card-info">
                            <h4>{u.userFullName}</h4>
                            <span>@{u.userName}</span>
                        </div>
                        <div className="card-actions">
                            <button className="card-btn edit" onClick={() => handleEdit(u)}><FaEdit /></button>
                            <button className="card-btn delete" onClick={() => handleDelete(u.userID, u.userFullName)} disabled={u.userID === state.user?.userID}><FaTrash /></button>
                        </div>
                    </div>
                    <div className="user-card-body">
                        <div className="info-row"><FaUserShield /> {u.roleName || 'N/A'}</div>
                        <div className="info-row"><FaBuilding /> {u.branchName || state.user?.branchName || 'Head Office'}</div>
                        <div className="info-row"><span className={`status-badge ${u.inActive ? 'inactive' : 'active'}`}>{u.inActive ? <><FaTimesCircle /> Inactive</> : <><FaCheckCircle /> Active</>}</span></div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="user-page-premium">
            <PageHeader title="User Management" subtitle={`Manage users for ${state.user?.branchName || "Head Office"}`} icon={<FaUsers />} addButtonText="Add User" onAdd={handleAdd} />

            <div className="search-action-bar">
                <div className="search-wrapper"><FaSearch className="search-icon" /><input type="text" placeholder="Search by name or username..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && applyFilters()} className="search-input" /></div>
                <div className="action-group">
                    <Button variant="outline" size="sm" onClick={loadUsers} loading={loading} icon={<FaSync />}>Refresh</Button>
                    <Button variant={showList ? 'primary' : 'outline'} size="sm" onClick={() => setShowList(!showList)} icon={showList ? <FaEyeSlash /> : <FaEye />}>{showList ? 'Hide' : 'Show'}</Button>
                    <Button variant={showFilters ? 'primary' : 'outline'} size="sm" onClick={() => setShowFilters(!showFilters)} icon={<FaFilter />}>Filters</Button>
                    {hasActiveFilters && <Button variant="outline" size="sm" onClick={resetFilters} icon={<FaTimes />}>Clear</Button>}
                    <Button variant="primary" size="sm" onClick={applyFilters} icon={<FaSearch />}>Search</Button>
                </div>
            </div>

            {showFilters && (
                <div className="filters-panel">
                    <div className="filters-grid-2">
                        <select value={filters.role} onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))} className="filter-select">
                            <option value="">All Roles</option>
                            {roles.map(r => <option key={r.roleID} value={r.roleID}>{r.roleName}</option>)}
                        </select>
                        <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))} className="filter-select">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            )}

            {loading && <div className="loading-container"><div className="spinner"></div></div>}

            {!loading && showList && (
                displayUsers.length > 0 ? (
                    <>
                        {renderCardView()}
                        {totalPages > 1 && (<div className="pagination"><button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</button><span>Page {currentPage} of {totalPages}</span><button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</button></div>)}
                    </>
                ) : (<EmptyState icon={<FaUsers />} title="No users found" description="Try adjusting your filters" action={<Button variant="primary" onClick={resetFilters}>Clear Filters</Button>} />)
            )}

            {!loading && users.length === 0 && (<EmptyState icon={<FaUsers />} title="No users yet" description="Get started by adding your first user" action={<Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>Add User</Button>} />)}

            {showPopup && <UserPopup user={selectedUser} roles={roles} onClose={() => setShowPopup(false)} onSaved={loadUsers} />}
        </div>
    );
}