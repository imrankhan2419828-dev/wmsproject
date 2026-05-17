import React, { useEffect, useState } from "react";
import departmentApi from "../../../api/departmentApi";
import { Modal } from "../../../components/common/Modal/Modal";
import { Button, useDialog } from "../../../components/common";
import { FaBuilding } from "react-icons/fa";
import "./Departments.css";

export default function DepartmentModal({ department, onClose, onSaved }) {
    const isEdit = !!department?.departmentID;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { showSuccess, showError } = useDialog();

    const [form, setForm] = useState({
        departmentID: 0, departmentCode: "", departmentName: "", description: "",
        managerID: "", email: "", phone: "", location: "", isActive: true
    });

    useEffect(() => {
        if (department) {
            setForm({
                departmentID: department.departmentID || 0, departmentCode: department.departmentCode || "",
                departmentName: department.departmentName || "", description: department.description || "",
                managerID: department.managerID || "", email: department.email || "", phone: department.phone || "",
                location: department.location || "", isActive: department.isActive !== false
            });
        }
    }, [department]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
        if (error) setError("");
    };

    const validateForm = () => {
        if (!form.departmentCode.trim()) { setError("Department code is required"); return false; }
        if (!form.departmentName.trim()) { setError("Department name is required"); return false; }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true); setError("");
        try {
            if (isEdit) await departmentApi.update(form.departmentID, form);
            else await departmentApi.create(form);
            showSuccess(isEdit ? "Department updated" : "Department created");
            onSaved(); onClose();
        } catch (err) { showError(err.response?.data?.message || "Failed to save department"); }
        finally { setLoading(false); }
    };

    const modalFooter = (<div className="dept-modal-footer"><Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button><Button variant="primary" onClick={handleSubmit} loading={loading}>{isEdit ? "Update" : "Create"} Department</Button></div>);

    return (
        <Modal isOpen={true} onClose={onClose} title={<><FaBuilding /> {isEdit ? "Edit Department" : "New Department"}</>} size="md" footer={modalFooter}>
            <div className="dept-modal-container">
                <div className="form-row-2"><div className="form-group"><label>Department Code <span className="required">*</span></label><input type="text" name="departmentCode" value={form.departmentCode} onChange={handleChange} className="form-input" disabled={loading} /></div><div className="form-group"><label>Department Name <span className="required">*</span></label><input type="text" name="departmentName" value={form.departmentName} onChange={handleChange} className="form-input" disabled={loading} /></div></div>
                <div className="form-group"><label>Description</label><textarea name="description" value={form.description} onChange={handleChange} rows="2" className="form-textarea" placeholder="Department description..." disabled={loading} /></div>
                <div className="form-row-2"><div className="form-group"><label>Manager ID</label><input type="number" name="managerID" value={form.managerID} onChange={handleChange} className="form-input" placeholder="Employee ID" disabled={loading} /></div><div className="form-group"><label>Phone</label><input type="text" name="phone" value={form.phone} onChange={handleChange} className="form-input" placeholder="Phone number" disabled={loading} /></div></div>
                <div className="form-row-2"><div className="form-group"><label>Email</label><input type="email" name="email" value={form.email} onChange={handleChange} className="form-input" placeholder="department@workshop.com" disabled={loading} /></div><div className="form-group"><label>Location</label><input type="text" name="location" value={form.location} onChange={handleChange} className="form-input" placeholder="Building, Floor, Room" disabled={loading} /></div></div>
                <div className="checkbox-group"><label><input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} disabled={loading} /> Active</label></div>
            </div>
        </Modal>
    );
}