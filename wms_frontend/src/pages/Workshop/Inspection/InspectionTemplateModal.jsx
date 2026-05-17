import React, { useEffect, useState } from "react";
import inspectionApi from "../../../api/inspectionApi";
import { Modal } from "../../../components/common/Modal/Modal";
import { Button, useDialog } from "../../../components/common";
import { FaClipboardList } from "react-icons/fa";
import "./Inspection.css";

const CATEGORIES = [
    { value: 'PRE_JOB', label: 'Pre-Job' },
    { value: 'POST_JOB', label: 'Post-Job' },
    { value: 'PERIODIC', label: 'Periodic' },
    { value: 'SAFETY', label: 'Safety' }
];

export default function InspectionTemplateModal({ template, onClose, onSaved }) {
    const isEdit = !!template?.templateID;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { showSuccess, showError } = useDialog();

    const [form, setForm] = useState({
        templateID: 0,
        templateCode: "",
        templateName: "",
        category: "",
        description: "",
        isActive: true
    });

    useEffect(() => {
        if (template) {
            setForm({
                templateID: template.templateID || 0,
                templateCode: template.templateCode || "",
                templateName: template.templateName || "",
                category: template.category || "",
                description: template.description || "",
                isActive: template.isActive !== false
            });
        }
    }, [template]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
        if (error) setError("");
    };

    const validateForm = () => {
        if (!form.templateCode.trim()) { setError("Template code is required"); return false; }
        if (!form.templateName.trim()) { setError("Template name is required"); return false; }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);
        setError("");
        try {
            if (isEdit) {
                await inspectionApi.updateTemplate(form.templateID, form);
                showSuccess("Template updated successfully");
            } else {
                await inspectionApi.createTemplate(form);
                showSuccess("Template created successfully");
            }
            onSaved();
            onClose();
        } catch (err) {
            console.error("Save error:", err);
            showError(err.response?.data?.message || "Failed to save template");
        } finally { setLoading(false); }
    };

    const modalFooter = (
        <div className="inspection-modal-footer">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={loading}>{isEdit ? "Update" : "Create"} Template</Button>
        </div>
    );

    return (
        <Modal isOpen={true} onClose={onClose} title={<><FaClipboardList /> {isEdit ? "Edit Template" : "New Inspection Template"}</>} size="md" footer={modalFooter}>
            <div className="inspection-modal-container">
                <div className="form-group">
                    <label>Template Code <span className="required">*</span></label>
                    <input type="text" name="templateCode" value={form.templateCode} onChange={handleChange} placeholder="e.g., PRE-001" className="form-input" disabled={loading} />
                </div>

                <div className="form-group">
                    <label>Template Name <span className="required">*</span></label>
                    <input type="text" name="templateName" value={form.templateName} onChange={handleChange} placeholder="e.g., Pre-Job Vehicle Inspection" className="form-input" disabled={loading} />
                </div>

                <div className="form-group">
                    <label>Category</label>
                    <select name="category" value={form.category} onChange={handleChange} className="form-select" disabled={loading}>
                        <option value="">Select Category</option>
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows="3" className="form-textarea" placeholder="Template description..." disabled={loading} />
                </div>

                <div className="checkbox-group">
                    <label><input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} disabled={loading} /> Active</label>
                </div>
            </div>
        </Modal>
    );
}