import React, { useEffect, useState, useContext } from "react";
import axiosClient from "../../api/axiosClient";
import AuthContext from "../../context/AuthContext";
import { Modal } from "../../components/common/Modal/Modal";
import { Input, Button, ReactSelect, useDialog } from "../../components/common";
import { FaUser, FaUserShield, FaBuilding } from "react-icons/fa";
import "./UserModal.css";

export default function UserPopup({ user, roles: propRoles, onClose, onSaved }) {
    const { state } = useContext(AuthContext);
    const [roles, setRoles] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { showSuccess, showError } = useDialog();

    const isSuperAdmin = state.user?.roleName?.toLowerCase() === "superadmin";
    const isEdit = !!user?.userID;

    const [form, setForm] = useState({
        userFullName: "", userName: "", password: "", userEmail: "",
        roleID: "", branchID: "", isAdmin: false, inActive: false
    });

    useEffect(() => {
        if (propRoles?.length) setRoles(propRoles);
        else loadRoles();
        if (isSuperAdmin) loadBranches();
    }, []);

    useEffect(() => {
        if (user && isEdit) {
            setForm({
                userFullName: user.userFullName || "", userName: user.userName || "",
                password: "", userEmail: user.userEmail || "",
                roleID: (user.roleID || user.roleId || "").toString(),
                branchID: (user.branchID || "").toString(),
                isAdmin: user.isAdmin || false, inActive: user.inActive || false
            });
        } else {
            setForm({ userFullName: "", userName: "", password: "", userEmail: "", roleID: "", branchID: "", isAdmin: false, inActive: false });
        }
    }, [user]);

    const loadRoles = async () => {
        try {
            const res = await axiosClient.get("/SystemUser/roles");
            setRoles(res.data?.data || res.data || []);
        } catch (err) { console.error("Roles error:", err); }
    };

    const loadBranches = async () => {
        try {
            const res = await axiosClient.get("/Branch");
            setBranches(res.data?.data || res.data || []);
        } catch (err) { console.error("Branches error:", err); }
    };

    const handleChange = (field, value) => { setForm(f => ({ ...f, [field]: value })); if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' })); };

    const validateForm = () => {
        const newErrors = {};
        if (!form.userFullName?.trim()) newErrors.userFullName = "Full name required";
        if (!form.userName?.trim()) newErrors.userName = "Username required";
        if (!isEdit && !form.password) newErrors.password = "Password required";
        if (!form.roleID) newErrors.roleID = "Role required";
        if (isSuperAdmin && !form.branchID) newErrors.branchID = "Branch required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const payload = {
                userFullName: form.userFullName, userName: form.userName,
                userEmail: form.userEmail || null, roleID: parseInt(form.roleID), isAdmin: form.isAdmin
            };
            if (isSuperAdmin && form.branchID) payload.branchID = parseInt(form.branchID);
            if (isEdit) {
                if (form.password) payload.password = form.password;
                payload.inActive = form.inActive;
                await axiosClient.put(`/SystemUser/${user.userID}`, payload);
            } else {
                payload.password = form.password;
                await axiosClient.post("/SystemUser", payload);
            }
            showSuccess(isEdit ? "User updated!" : "User created!");
            onSaved(); onClose();
        } catch (err) { showError(err.response?.data?.message || "Save failed"); }
        finally { setLoading(false); }
    };

    const roleOptions = roles.map(r => ({ value: r.roleID?.toString(), label: r.roleName }));
    const branchOptions = branches.map(b => ({ value: b.branchID?.toString(), label: b.branchName }));

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={<><FaUser /> {isEdit ? "Edit User" : "Add New User"}</>}
            size="auto"
            footer={
                <div className="popup-footer">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} loading={loading}>Save User</Button>
                </div>
            }
        >
            <div className="user-popup-container">
                {/* LINE 1: Full Name*, Username* (2 fields) */}
                {/* LINE 1: Full Name*, Username* (2 fields) */}
                <div className="form-row-2">
                    <div className="field-group">
                        <label>Full Name <span className="required">*</span></label>
                        <input
                            type="text"
                            value={form.userFullName}
                            onChange={(e) => handleChange('userFullName', e.target.value)}
                            className={`compact-input ${errors.userFullName ? 'error' : ''}`}
                            placeholder="Full name"
                            disabled={loading}
                            autoComplete="off"
                            name="userFullName"
                        />
                        {errors.userFullName && <small className="error-text">{errors.userFullName}</small>}
                    </div>
                    <div className="field-group">
                        <label>Username <span className="required">*</span></label>
                        <input
                            type="text"
                            value={form.userName}
                            onChange={(e) => handleChange('userName', e.target.value)}
                            className={`compact-input ${errors.userName ? 'error' : ''}`}
                            placeholder="Username"
                            disabled={loading}
                            autoComplete="off"
                            name="newUsername"
                        />
                        {errors.userName && <small className="error-text">{errors.userName}</small>}
                    </div>
                </div>

                {/* LINE 2: Password*, Email (2 fields) */}
                <div className="form-row-2">
                    <div className="field-group">
                        <label>{isEdit ? "New Password" : "Password"} {!isEdit && <span className="required">*</span>}</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            className={`compact-input ${errors.password ? 'error' : ''}`}
                            placeholder={isEdit ? "Leave blank" : "Password"}
                            disabled={loading}
                            autoComplete="new-password"
                            name="newPassword"
                        />
                        {errors.password && <small className="error-text">{errors.password}</small>}
                    </div>
                    <div className="field-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={form.userEmail}
                            onChange={(e) => handleChange('userEmail', e.target.value)}
                            className="compact-input"
                            placeholder="Email address"
                            disabled={loading}
                            autoComplete="off"
                            name="userEmail"
                        />
                    </div>
                </div>

                {/* LINE 3: Role*, Branch* (2 fields) */}
                <div className="form-row-2">
                    <div className="field-group">
                        <label>Role <span className="required">*</span></label>
                        <ReactSelect value={form.roleID} onChange={(e) => handleChange('roleID', e?.target?.value || e)} options={roleOptions} placeholder="Select role" disabled={loading} />
                        {errors.roleID && <small className="error-text">{errors.roleID}</small>}
                    </div>
                    {isSuperAdmin ? (
                        <div className="field-group">
                            <label>Branch <span className="required">*</span></label>
                            <ReactSelect value={form.branchID} onChange={(e) => handleChange('branchID', e?.target?.value || e)} options={branchOptions} placeholder="Select branch" disabled={loading} />
                            {errors.branchID && <small className="error-text">{errors.branchID}</small>}
                        </div>
                    ) : (
                        <div className="field-group">
                            <label>Branch</label>
                            <input type="text" value={state.user?.branchName || 'Head Office'} readOnly className="compact-input readonly" disabled />
                        </div>
                    )}
                </div>

                {/* LINE 4: Is Administrator + Inactive User (if edit) (2 fields or 1 field) */}
                <div className="form-row-2">
                    <div className="checkbox-field">
                        <label className="checkbox-label">
                            <input type="checkbox" checked={form.isAdmin} onChange={(e) => handleChange('isAdmin', e.target.checked)} disabled={loading} />
                            <span className="checkbox-custom"></span>
                            <span className="checkbox-text">Is Administrator</span>
                        </label>
                    </div>
                    {isEdit ? (
                        <div className="checkbox-field">
                            <label className="checkbox-label">
                                <input type="checkbox" checked={form.inActive} onChange={(e) => handleChange('inActive', e.target.checked)} disabled={loading} />
                                <span className="checkbox-custom"></span>
                                <span className="checkbox-text">Inactive User</span>
                            </label>
                        </div>
                    ) : (
                        <div></div> // Empty div to maintain 2-column layout
                    )}
                </div>
            </div>
        </Modal>
    );
}