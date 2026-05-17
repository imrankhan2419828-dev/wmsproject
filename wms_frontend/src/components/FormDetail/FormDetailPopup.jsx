import React, { useState, useEffect } from "react";
import formDetailApi from "../../api/formDetailApi";
import { Modal } from "../../components/common/Modal/Modal";
import { Input, Button, ReactSelect, useDialog } from "../../components/common";
import { FaList } from "react-icons/fa";
import "./FormDetailPopup.css";

export default function FormDetailPopup({ form, onClose, onSaved }) {
    const [formData, setFormData] = useState({
        formID: 0, formName: "", formTitle: "", formCategory: "",
        categoryOrder: "", formOrder: "", menuTitle: "", menuSubTitle: "",
        menuOrder: "", isWebPage: true, parentPage: "", menuIcon: "", menuCategory: ""
    });
    const [parentForms, setParentForms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { showSuccess, showError } = useDialog();
    const isEdit = !!form?.formID;

    useEffect(() => {
        const loadParentForms = async () => {
            try {
                const res = await formDetailApi.getAll();
                let data = res.data?.data || res.data || [];
                setParentForms(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error loading parent forms:", err);
            }
        };
        loadParentForms();

        if (form) {
            setFormData({
                formID: form.formID || 0, formName: form.formName || "",
                formTitle: form.formTitle || "", formCategory: form.formCategory || "",
                categoryOrder: form.categoryOrder || "", formOrder: form.formOrder || "",
                menuTitle: form.menuTitle || "", menuSubTitle: form.menuSubTitle || "",
                menuOrder: form.menuOrder || "", isWebPage: form.isWebPage !== false,
                parentPage: form.parentPage || "", menuIcon: form.menuIcon || "",
                menuCategory: form.menuCategory || ""
            });
        }
    }, [form]);

    const handleChange = (field, value) => {
        setFormData(f => ({ ...f, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.formName?.trim()) newErrors.formName = "Form name required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const payload = {
                formName: formData.formName, formTitle: formData.formTitle || null,
                formCategory: formData.formCategory || null,
                categoryOrder: formData.categoryOrder ? parseInt(formData.categoryOrder) : null,
                formOrder: formData.formOrder ? parseInt(formData.formOrder) : null,
                menuTitle: formData.menuTitle || null, menuSubTitle: formData.menuSubTitle || null,
                menuOrder: formData.menuOrder ? parseInt(formData.menuOrder) : null,
                isWebPage: formData.isWebPage,
                parentPage: formData.parentPage ? parseInt(formData.parentPage) : null,
                menuIcon: formData.menuIcon || null, menuCategory: formData.menuCategory || null
            };
            if (isEdit) await formDetailApi.update(formData.formID, payload);
            else await formDetailApi.create(payload);
            showSuccess(isEdit ? "Form updated!" : "Form created!");
            onSaved(); onClose();
        } catch (err) {
            showError(err.response?.data?.message || "Save failed");
        } finally {
            setLoading(false);
        }
    };

    const parentOptions = parentForms.map(p => ({ value: p.formID?.toString(), label: p.menuTitle || p.formName }));

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={<><FaList /> {isEdit ? "Edit Form" : "Add New Form"}</>}
            size="auto"
            footer={
                <div className="popup-footer">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} loading={loading}>Save Form</Button>
                </div>
            }
        >
            <div className="form-popup-container">
                {/* LINE 1: Form Name*, Form Title (2 fields) */}
                <div className="form-row-2">
                    <div className="field-group">
                        <label>Form Name <span className="required">*</span></label>
                        <input type="text" value={formData.formName} onChange={(e) => handleChange('formName', e.target.value)} className={`compact-input ${errors.formName ? 'error' : ''}`} placeholder="e.g., dashboard" disabled={loading} />
                        {errors.formName && <small className="error-text">{errors.formName}</small>}
                    </div>
                    <div className="field-group">
                        <label>Form Title</label>
                        <input type="text" value={formData.formTitle} onChange={(e) => handleChange('formTitle', e.target.value)} className="compact-input" placeholder="e.g., Dashboard" disabled={loading} />
                    </div>
                </div>

                {/* LINE 2: Menu Title, Menu Category (2 fields) */}
                <div className="form-row-2">
                    <div className="field-group">
                        <label>Menu Title</label>
                        <input type="text" value={formData.menuTitle} onChange={(e) => handleChange('menuTitle', e.target.value)} className="compact-input" placeholder="Display name" disabled={loading} />
                    </div>
                    <div className="field-group">
                        <label>Menu Category</label>
                        <input type="text" value={formData.menuCategory} onChange={(e) => handleChange('menuCategory', e.target.value)} className="compact-input" placeholder="e.g., Main" disabled={loading} />
                    </div>
                </div>

                {/* LINE 3: Parent Form, Menu Order (2 fields) */}
                <div className="form-row-2">
                    <div className="field-group">
                        <label>Parent Form</label>
                        <ReactSelect value={formData.parentPage} onChange={(e) => handleChange('parentPage', e?.target?.value || e)} options={parentOptions} placeholder="No Parent (Root)" isClearable disabled={loading} />
                    </div>
                    <div className="field-group">
                        <label>Menu Order</label>
                        <input type="number" value={formData.menuOrder} onChange={(e) => handleChange('menuOrder', e.target.value)} className="compact-input" placeholder="Display order" disabled={loading} />
                    </div>
                </div>

                {/* LINE 4: Form Order, Menu Icon (2 fields) */}
                <div className="form-row-2">
                    <div className="field-group">
                        <label>Form Order</label>
                        <input type="number" value={formData.formOrder} onChange={(e) => handleChange('formOrder', e.target.value)} className="compact-input" placeholder="Form order" disabled={loading} />
                    </div>
                    <div className="field-group">
                        <label>Menu Icon</label>
                        <input type="text" value={formData.menuIcon} onChange={(e) => handleChange('menuIcon', e.target.value)} className="compact-input" placeholder="e.g., 📊" disabled={loading} />
                    </div>
                </div>

                {/* LINE 5: Is Web Page Checkbox */}
                <div className="checkbox-field">
                    <label className="checkbox-label">
                        <input type="checkbox" checked={formData.isWebPage} onChange={(e) => handleChange('isWebPage', e.target.checked)} disabled={loading} />
                        <span className="checkbox-custom"></span>
                        <span className="checkbox-text">Is Web Page (Show in menu)</span>
                    </label>
                </div>
            </div>
        </Modal>
    );
}