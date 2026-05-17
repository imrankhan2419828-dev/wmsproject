import React, { useState, useEffect } from "react";
import vochTypeApi from "../../api/vochTypeApi";
import { Modal } from "../../components/common/Modal/Modal";
import { Input, Button, useDialog } from "../../components/common";
import { FaBook, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "./VochTypePopup.css";

export default function VochTypePopup({ data, onClose, onSaved }) {
    const [form, setForm] = useState({
        vochTypeID: 0, vochName: "", typeAbbr: "", vochType: "", vochDesc: "", inActive: false
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { showSuccess, showError } = useDialog();
    const isEdit = !!data?.vochTypeID;

    useEffect(() => {
        if (data) {
            setForm({
                vochTypeID: data.vochTypeID || 0, vochName: data.vochName || "",
                typeAbbr: data.typeAbbr || "", vochType: data.vochType || "",
                vochDesc: data.vochDesc || "", inActive: data.inActive || false
            });
        }
    }, [data]);

    const handleChange = (field, value) => {
        setForm(f => ({ ...f, [field]: field === 'typeAbbr' || field === 'vochType' ? value.toUpperCase() : value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.vochName?.trim()) newErrors.vochName = "Voucher name required";
        if (!form.typeAbbr?.trim()) newErrors.typeAbbr = "Type abbreviation required";
        if (form.typeAbbr?.length > 3) newErrors.typeAbbr = "Max 3 characters";
        if (!form.vochType?.trim()) newErrors.vochType = "Voucher code required";
        if (form.vochType?.length > 2) newErrors.vochType = "Max 2 characters";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            if (isEdit) await vochTypeApi.update(form.vochTypeID, form);
            else await vochTypeApi.create(form);
            showSuccess(isEdit ? "Voucher type updated!" : "Voucher type created!");
            onSaved(); onClose();
        } catch (err) {
            showError(err.response?.data?.message || "Save failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={<><FaBook /> {isEdit ? "Edit Voucher Type" : "Add Voucher Type"}</>}
            size="auto"
            footer={
                <div className="popup-footer">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} loading={loading}>Save</Button>
                </div>
            }
        >
            <div className="vochtype-popup-container">
                <div className="field-group">
                    <label>Voucher Name <span className="required">*</span></label>
                    <input type="text" value={form.vochName} onChange={(e) => handleChange('vochName', e.target.value)} className={`compact-input ${errors.vochName ? 'error' : ''}`} placeholder="e.g., Sale, Purchase" disabled={loading} />
                    {errors.vochName && <small className="error-text">{errors.vochName}</small>}
                </div>

                <div className="form-row-2">
                    <div className="field-group">
                        <label>Type Abbreviation <span className="required">*</span></label>
                        <input type="text" value={form.typeAbbr} onChange={(e) => handleChange('typeAbbr', e.target.value)} className={`compact-input ${errors.typeAbbr ? 'error' : ''}`} placeholder="e.g., SAL" maxLength="3" disabled={loading} />
                        {errors.typeAbbr && <small className="error-text">{errors.typeAbbr}</small>}
                    </div>
                    <div className="field-group">
                        <label>Voucher Code <span className="required">*</span></label>
                        <input type="text" value={form.vochType} onChange={(e) => handleChange('vochType', e.target.value)} className={`compact-input ${errors.vochType ? 'error' : ''}`} placeholder="e.g., SI" maxLength="2" disabled={loading} />
                        {errors.vochType && <small className="error-text">{errors.vochType}</small>}
                    </div>
                </div>

                <div className="field-group">
                    <label>Description</label>
                    <input type="text" value={form.vochDesc} onChange={(e) => handleChange('vochDesc', e.target.value)} className="compact-input" placeholder="Optional description" disabled={loading} />
                </div>

                <div className="checkbox-field">
                    <label className="checkbox-label">
                        <input type="checkbox" checked={form.inActive} onChange={(e) => handleChange('inActive', e.target.checked)} disabled={loading} />
                        <span className="checkbox-custom"></span>
                        <span className="checkbox-text">{form.inActive ? <><FaTimesCircle /> Inactive</> : <><FaCheckCircle /> Active</>}</span>
                    </label>
                </div>
            </div>
        </Modal>
    );
}