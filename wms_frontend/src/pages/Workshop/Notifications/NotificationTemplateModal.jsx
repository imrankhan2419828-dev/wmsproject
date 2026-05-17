import React, { useEffect, useState } from "react";
import notificationApi from "../../../api/notificationApi";
import { Modal } from "../../../components/common/Modal/Modal";
import { Button, useDialog } from "../../../components/common";
import { FaEnvelope } from "react-icons/fa";
import "./Notifications.css";

const NOTIFICATION_TYPES = ['JOB_CREATED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'REMINDER', 'ESTIMATE', 'INVOICE'];
const SENT_VIA_OPTIONS = [
    { value: 'SMS', label: 'SMS Only' }, { value: 'EMAIL', label: 'Email Only' },
    { value: 'WHATSAPP', label: 'WhatsApp Only' }, { value: 'BOTH', label: 'SMS & WhatsApp' }
];

export default function NotificationTemplateModal({ template, onClose, onSaved }) {
    const isEdit = !!template?.templateID;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { showSuccess, showError } = useDialog();

    const [form, setForm] = useState({
        templateID: 0, templateCode: "", templateName: "", notificationType: "JOB_CREATED",
        subjectTemplate: "", bodyTemplate: "", placeholders: "", sentVia: "BOTH", isActive: true
    });

    useEffect(() => {
        if (template) {
            setForm({
                templateID: template.templateID || 0, templateCode: template.templateCode || "",
                templateName: template.templateName || "", notificationType: template.notificationType || "JOB_CREATED",
                subjectTemplate: template.subjectTemplate || "", bodyTemplate: template.bodyTemplate || "",
                placeholders: template.placeholders || "", sentVia: template.sentVia || "BOTH", isActive: template.isActive !== false
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
        if (!form.bodyTemplate.trim()) { setError("Body template is required"); return false; }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true); setError("");
        try {
            if (isEdit) await notificationApi.updateTemplate(form.templateID, form);
            else await notificationApi.createTemplate(form);
            showSuccess(isEdit ? "Template updated" : "Template created");
            onSaved(); onClose();
        } catch (err) { showError(err.response?.data?.message || "Failed to save template"); }
        finally { setLoading(false); }
    };

    const modalFooter = (
        <div className="notification-modal-footer">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={loading}>{isEdit ? "Update" : "Create"} Template</Button>
        </div>
    );

    return (
        <Modal isOpen={true} onClose={onClose} title={<><FaEnvelope /> {isEdit ? "Edit Template" : "New Notification Template"}</>} size="lg" footer={modalFooter}>
            <div className="notification-modal-container">
                <div className="form-row-2">
                    <div className="form-group"><label>Template Code <span className="required">*</span></label><input type="text" name="templateCode" value={form.templateCode} onChange={handleChange} className="form-input" disabled={loading} /></div>
                    <div className="form-group"><label>Template Name <span className="required">*</span></label><input type="text" name="templateName" value={form.templateName} onChange={handleChange} className="form-input" disabled={loading} /></div>
                </div>
                <div className="form-row-2">
                    <div className="form-group"><label>Notification Type</label><select name="notificationType" value={form.notificationType} onChange={handleChange} className="form-select" disabled={loading}>{NOTIFICATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                    <div className="form-group"><label>Send Via</label><select name="sentVia" value={form.sentVia} onChange={handleChange} className="form-select" disabled={loading}>{SENT_VIA_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
                </div>
                <div className="form-group"><label>Subject Template (for email)</label><input type="text" name="subjectTemplate" value={form.subjectTemplate} onChange={handleChange} className="form-input" placeholder="e.g., Your vehicle is ready for pickup" disabled={loading} /></div>
                <div className="form-group"><label>Body Template <span className="required">*</span></label><textarea name="bodyTemplate" value={form.bodyTemplate} onChange={handleChange} rows="6" className="form-textarea" placeholder="Dear {CustomerName}, your vehicle {VehicleRegNo} is ready..." disabled={loading} /></div>
                <div className="form-group"><label>Placeholders (comma separated)</label><input type="text" name="placeholders" value={form.placeholders} onChange={handleChange} className="form-input" placeholder="CustomerName,VehicleRegNo,JobCardNo" disabled={loading} /><small>Available: {form.placeholders || 'None'}</small></div>
                <div className="checkbox-group"><label><input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} disabled={loading} /> Active</label></div>
            </div>
        </Modal>
    );
}