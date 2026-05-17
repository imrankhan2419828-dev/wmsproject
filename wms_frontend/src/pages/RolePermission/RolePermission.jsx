import React, { useEffect, useState, useContext } from "react";
import permissionApi from "../../api/permissionApi";
import axiosClient from "../../api/axiosClient";
import AuthContext from "../../context/AuthContext";
import RolePermissionModal from "./RolePermissionModal";
import {
    FaShieldAlt, FaPlus, FaEdit, FaTrash, FaDatabase, FaUserShield,
    FaEye, FaSearch, FaTimes, FaFilter, FaSync, FaEyeSlash
} from "react-icons/fa";
import { Button, useDialog } from "../../components/common";
import { PageHeader, EmptyState } from "../../components/features";
import "./rolePermission.css";

export default function RolePermission() {
    const [roles, setRoles] = useState([]);
    const [permissionList, setPermissionList] = useState([]);
    const [filteredPermissions, setFilteredPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const { state } = useContext(AuthContext);
    const { showConfirm, showSuccess, showError } = useDialog();

    const isSuperAdmin = state.user?.roleName?.toLowerCase() === "superadmin";

    useEffect(() => {
        if (isSuperAdmin) {
            loadRoles();
            loadPermissionList();
        }
    }, [isSuperAdmin]);

    const loadRoles = async () => {
        try {
            const res = await axiosClient.get("/SystemUser/roles");
            let data = res.data?.data || res.data || [];
            setRoles(Array.isArray(data) ? data : []);
        } catch (err) { console.error("Roles error:", err); }
    };

    const loadPermissionList = async () => {
        setLoading(true);
        try {
            const res = await permissionApi.getAll();
            let data = res.data?.data || res.data || [];
            setPermissionList(Array.isArray(data) ? data : []);
            setFilteredPermissions(Array.isArray(data) ? data : []);
        } catch (err) { console.error("Permissions error:", err); }
        finally { setLoading(false); }
    };

    const applyFilters = () => {
        let filtered = [...permissionList];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                (p.roleName || '').toLowerCase().includes(term) ||
                (p.menuName || p.formName || '').toLowerCase().includes(term)
            );
        }
        if (filterRole) filtered = filtered.filter(p => p.roleID === parseInt(filterRole));
        setFilteredPermissions(filtered);
        setShowList(true);
    };

    const resetFilters = () => {
        setFilterRole("");
        setSearchTerm("");
        setFilteredPermissions(permissionList);
        setShowList(false);
        setShowFilters(false);
    };

    const handleAdd = () => { setSelectedRole(null); setShowModal(true); };
    const handleEdit = (roleId) => { setSelectedRole(roleId); setShowModal(true); };

    const handleDelete = async (roleId, roleName) => {
        showConfirm(`Delete all permissions for "${roleName}"?`, async () => {
            try {
                await permissionApi.deleteRolePermissions(roleId, state.user?.branchID || 1);
                await loadPermissionList();
                if (showList) applyFilters();
                showSuccess(`Permissions for "${roleName}" deleted!`);
            } catch (err) { showError("Failed to delete permissions"); }
        }, 'Delete Permissions');
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedRole(null);
        loadPermissionList();
    };

    const permissionsByRole = filteredPermissions.reduce((acc, perm) => {
        if (!acc[perm.roleID]) {
            acc[perm.roleID] = { roleID: perm.roleID, roleName: perm.roleName, permissions: [] };
        }
        acc[perm.roleID].permissions.push(perm);
        return acc;
    }, {});

    const hasActiveFilters = filterRole;

    if (!isSuperAdmin) {
        return (
            <div className="access-denied">
                <FaShieldAlt className="denied-icon" />
                <h2>Access Denied</h2>
                <p>This module is only available for Super Administrators.</p>
            </div>
        );
    }

    const renderCardView = () => (
        <div className="perm-cards-grid">
            {Object.values(permissionsByRole).map(item => (
                <div key={item.roleID} className="perm-card">
                    <div className="perm-card-header">
                        <FaShieldAlt className="card-icon" />
                        <div className="card-info">
                            <h4>{item.roleName}</h4>
                            <span><FaDatabase /> {item.permissions.length} permissions</span>
                        </div>
                        <div className="card-actions">
                            <button className="card-btn edit" onClick={() => handleEdit(item.roleID)}><FaEdit /></button>
                            <button className="card-btn delete" onClick={() => handleDelete(item.roleID, item.roleName)}><FaTrash /></button>
                        </div>
                    </div>
                    <div className="perm-card-body">
                        {item.permissions.slice(0, 5).map((p, i) => (
                            <div key={i} className="perm-item">
                                <span>{p.menuName || p.formName || "Menu"}</span>
                                <div className="perm-badges">
                                    {p.canView && <span className="badge view"><FaEye /></span>}
                                    {p.canAdd && <span className="badge add"><FaPlus /></span>}
                                    {p.canEdit && <span className="badge edit"><FaEdit /></span>}
                                    {p.canDelete && <span className="badge delete"><FaTrash /></span>}
                                </div>
                            </div>
                        ))}
                        {item.permissions.length > 5 && (
                            <div className="perm-more">+{item.permissions.length - 5} more</div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="perm-page-premium">
            <PageHeader
                title="Role Permission Management"
                subtitle="Configure permissions for each role"
                icon={<FaUserShield />}
                addButtonText="Add Permissions"
                onAdd={handleAdd}
            />

            <div className="search-action-bar">
                <div className="search-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by role or menu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                        className="search-input"
                    />
                </div>
                <div className="action-group">
                    <Button variant="outline" size="sm" onClick={loadPermissionList} loading={loading} icon={<FaSync />}>Refresh</Button>
                    <Button variant={showList ? 'primary' : 'outline'} size="sm" onClick={() => setShowList(!showList)} icon={showList ? <FaEyeSlash /> : <FaEye />}>{showList ? 'Hide' : 'Show'}</Button>
                    <Button variant={showFilters ? 'primary' : 'outline'} size="sm" onClick={() => setShowFilters(!showFilters)} icon={<FaFilter />}>Filters</Button>
                    {hasActiveFilters && <Button variant="outline" size="sm" onClick={resetFilters} icon={<FaTimes />}>Clear</Button>}
                    <Button variant="primary" size="sm" onClick={applyFilters} icon={<FaSearch />}>Search</Button>
                </div>
            </div>

            {showFilters && (
                <div className="filters-panel">
                    <div className="filters-grid-1">
                        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="filter-select">
                            <option value="">All Roles</option>
                            {roles.map(r => <option key={r.roleID} value={r.roleID}>{r.roleName}</option>)}
                        </select>
                    </div>
                </div>
            )}

            {loading && (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading permissions...</p>
                </div>
            )}

            {!loading && showList && (
                Object.keys(permissionsByRole).length > 0 ? (
                    renderCardView()
                ) : (
                    <EmptyState
                        icon={<FaShieldAlt />}
                        title="No permissions found"
                        description="Try adjusting your filters"
                        action={<Button variant="primary" onClick={resetFilters}>Clear Filters</Button>}
                    />
                )
            )}

            {!loading && permissionList.length === 0 && !showList && (
                <EmptyState
                    icon={<FaShieldAlt />}
                    title="No permissions yet"
                    description="Get started by adding permissions"
                    action={<Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>Add Permissions</Button>}
                />
            )}

            {showModal && (
                <RolePermissionModal
                    roleId={selectedRole}
                    onClose={handleModalClose}
                    onSaved={handleModalClose}
                />
            )}
        </div>
    );
}