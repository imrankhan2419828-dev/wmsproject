import React, { useEffect, useState, useContext } from "react";
import permissionApi from "../../api/permissionApi";
import menuApi from "../../api/menuApi";
import axiosClient from "../../api/axiosClient";
import AuthContext from "../../context/AuthContext";
import { Modal } from "../../components/common/Modal/Modal";
import { Button, ReactSelect, useDialog } from "../../components/common";
import { FaShieldAlt, FaEye, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "./RolePermissionModal.css";

export default function RolePermissionModal({ roleId, onClose, onSaved }) {
    const [roles, setRoles] = useState([]);
    const [forms, setForms] = useState([]);
    const [selectedRole, setSelectedRole] = useState(roleId || "");
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(false);
    const { state } = useContext(AuthContext);
    const { showSuccess, showError } = useDialog();

    const isSuperAdmin = state.user?.roleName?.toLowerCase() === "superadmin";

    useEffect(() => {
        loadRoles();
        loadForms();
    }, []);

    useEffect(() => {
        if (roleId && isSuperAdmin) loadPermissions(roleId);
    }, [roleId, isSuperAdmin]);

    if (!isSuperAdmin) {
        setTimeout(() => { showError("Access denied"); onClose(); }, 100);
        return null;
    }

    const loadRoles = async () => {
        try {
            const res = await axiosClient.get("/SystemUser/roles");
            setRoles(res.data?.data || res.data || []);
        } catch (err) { console.error("Roles error:", err); }
    };

    const loadForms = async () => {
        try {
            const res = await menuApi.getAll();
            setForms(res.data?.data || res.data || []);
        } catch (err) { console.error("Forms error:", err); }
    };

    const loadPermissions = async (rId) => {
        setLoading(true);
        try {
            const res = await permissionApi.getRolePermissions(rId);
            let data = res.data?.data || res.data || [];
            const permMap = {};
            data.forEach(p => { permMap[p.menuID] = { canView: p.canView || false, canAdd: p.canAdd || false, canEdit: p.canEdit || false, canDelete: p.canDelete || false }; });
            setPermissions(permMap);
        } catch (err) { console.error("Permissions error:", err); }
        finally { setLoading(false); }
    };

    const togglePermission = (formId, field) => {
        setPermissions(prev => ({ ...prev, [formId]: { ...prev[formId], [field]: !prev[formId]?.[field] } }));
    };

    const handleSave = async () => {
        if (!selectedRole) { showError("Please select a role"); return; }
        setLoading(true);
        try {
            const permissionsList = forms.map(f => ({ menuID: f.formID, canView: permissions[f.formID]?.canView || false, canAdd: permissions[f.formID]?.canAdd || false, canEdit: permissions[f.formID]?.canEdit || false, canDelete: permissions[f.formID]?.canDelete || false }));
            await permissionApi.saveBulkPermissions({ roleID: parseInt(selectedRole), branchID: state.user?.branchID || 1, permissions: permissionsList });
            showSuccess("Permissions saved!");
            onSaved(); onClose();
        } catch (err) { showError(err.response?.data?.message || "Save failed"); }
        finally { setLoading(false); }
    };

    const roleOptions = roles.map(r => ({ value: r.roleID?.toString(), label: r.roleName }));

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={<><FaShieldAlt /> {roleId ? "Edit Permissions" : "Add Permissions"}</>}
            size="xl"
            footer={
                <div className="popup-footer">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} loading={loading}>Save Permissions</Button>
                </div>
            }
        >
            <div className="perm-popup-container">
                {!roleId && (
                    <div className="field-group">
                        <label>Select Role <span className="required">*</span></label>
                        <ReactSelect
                            value={selectedRole}
                            onChange={(e) => { setSelectedRole(e?.target?.value || e); if (e?.target?.value) loadPermissions(e.target.value); }}
                            options={roleOptions}
                            placeholder="Select role"
                            disabled={loading}
                        />
                    </div>
                )}

                {selectedRole && (
                    <div className="perm-table-wrapper">
                        {loading ? (
                            <div className="loading-container"><div className="spinner"></div></div>
                        ) : (
                            <table className="perm-table">
                                <thead>
                                    <tr>
                                        <th>Menu / Form</th>
                                        <th><FaEye /> View</th>
                                        <th><FaPlus /> Add</th>
                                        <th><FaEdit /> Edit</th>
                                        <th><FaTrash /> Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {forms.length > 0 ? forms.map(f => (
                                        <tr key={f.formID}>
                                            <td>{f.formTitle || f.formName || 'Unnamed'}</td>
                                            <td className="checkbox-cell"><input type="checkbox" checked={permissions[f.formID]?.canView || false} onChange={() => togglePermission(f.formID, "canView")} disabled={loading} /></td>
                                            <td className="checkbox-cell"><input type="checkbox" checked={permissions[f.formID]?.canAdd || false} onChange={() => togglePermission(f.formID, "canAdd")} disabled={loading} /></td>
                                            <td className="checkbox-cell"><input type="checkbox" checked={permissions[f.formID]?.canEdit || false} onChange={() => togglePermission(f.formID, "canEdit")} disabled={loading} /></td>
                                            <td className="checkbox-cell"><input type="checkbox" checked={permissions[f.formID]?.canDelete || false} onChange={() => togglePermission(f.formID, "canDelete")} disabled={loading} /></td>
                                        </tr>
                                    )) : <tr><td colSpan="5" className="empty-state">No forms found</td></tr>}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {!selectedRole && <div className="info-message">Please select a role to configure permissions.</div>}
            </div>
        </Modal>
    );
}