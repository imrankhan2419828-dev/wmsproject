import React, { useEffect, useState } from "react";
import inspectionApi from "../../../api/inspectionApi";
import { Modal } from "../../../components/common/Modal/Modal";
import { Button, useDialog } from "../../../components/common";
import { FaClipboardList } from "react-icons/fa";
import "./Inspection.css";

const ITEM_TYPES = [
    { value: 'CHECKBOX', label: 'Checkbox (Pass/Fail)' },
    { value: 'YES_NO', label: 'Yes/No' },
    { value: 'TEXT', label: 'Text' },
    { value: 'NUMBER', label: 'Number' },
    { value: 'RANGE', label: 'Range' }
];

export default function InspectionItemModal({ item, templateId, onClose, onSaved }) {
    const isEdit = !!item?.itemID;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { showSuccess, showError } = useDialog();
    const [showRange, setShowRange] = useState(false);

    const [form, setForm] = useState({
        itemID: 0,
        templateID: templateId,
        itemCode: "",
        itemName: "",
        description: "",
        itemType: "CHECKBOX",
        expectedValue: "",
        minValue: "",
        maxValue: "",
        unit: "",
        isCritical: false,
        displayOrder: 0,
        requiresPhoto: false,
        requiresRemarks: false,
        isActive: true
    });

    useEffect(() => {
        if (item) {
            setForm({
                itemID: item.itemID || 0,
                templateID: item.templateID || templateId,
                itemCode: item.itemCode || "",
                itemName: item.itemName || "",
                description: item.description || "",
                itemType: item.itemType || "CHECKBOX",
                expectedValue: item.expectedValue || "",
                minValue: item.minValue || "",
                maxValue: item.maxValue || "",
                unit: item.unit || "",
                isCritical: item.isCritical || false,
                displayOrder: item.displayOrder || 0,
                requiresPhoto: item.requiresPhoto || false,
                requiresRemarks: item.requiresRemarks || false,
                isActive: item.isActive !== false
            });
        }
        setShowRange(form.itemType === 'RANGE');
    }, [item, templateId]);

    useEffect(() => { setShowRange(form.itemType === 'RANGE'); }, [form.itemType]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
        if (error) setError("");
    };

    const validateForm = () => {
        if (!form.itemCode.trim()) { setError("Item code is required"); return false; }
        if (!form.itemName.trim()) { setError("Item name is required"); return false; }
        if (form.itemType === 'RANGE' && (form.minValue === "" || form.maxValue === "")) { setError("Min and Max values are required for range type"); return false; }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);
        setError("");
        try {
            const payload = {
                ...form,
                minValue: form.minValue ? parseFloat(form.minValue) : null,
                maxValue: form.maxValue ? parseFloat(form.maxValue) : null,
                displayOrder: parseInt(form.displayOrder) || 0
            };

            if (isEdit) await inspectionApi.updateItem(form.itemID, payload);
            else await inspectionApi.createItem(payload);

            showSuccess(isEdit ? "Item updated successfully" : "Item created successfully");
            onSaved();
            onClose();
        } catch (err) {
            showError(err.response?.data?.message || "Failed to save item");
        } finally { setLoading(false); }
    };

    const modalFooter = (
        <div className="inspection-modal-footer">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={loading}>{isEdit ? "Update" : "Create"} Item</Button>
        </div>
    );

    return (
        <Modal isOpen={true} onClose={onClose} title={<><FaClipboardList /> {isEdit ? "Edit Inspection Item" : "New Inspection Item"}</>} size="md" footer={modalFooter}>
            <div className="inspection-modal-container">
                <div className="form-row-2">
                    <div className="form-group"><label>Item Code <span className="required">*</span></label><input type="text" name="itemCode" value={form.itemCode} onChange={handleChange} className="form-input" disabled={loading} /></div>
                    <div className="form-group"><label>Display Order</label><input type="number" name="displayOrder" value={form.displayOrder} onChange={handleChange} min="0" className="form-input" disabled={loading} /></div>
                </div>

                <div className="form-group"><label>Item Name <span className="required">*</span></label><input type="text" name="itemName" value={form.itemName} onChange={handleChange} className="form-input" disabled={loading} /></div>

                <div className="form-group"><label>Description</label><textarea name="description" value={form.description} onChange={handleChange} rows="2" className="form-textarea" placeholder="Item description..." disabled={loading} /></div>

                <div className="form-row-2">
                    <div className="form-group"><label>Item Type</label><select name="itemType" value={form.itemType} onChange={handleChange} className="form-select" disabled={loading}>{ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                    {!showRange && <div className="form-group"><label>Expected Value</label><input type="text" name="expectedValue" value={form.expectedValue} onChange={handleChange} className="form-input" placeholder="e.g., Pass, OK" disabled={loading} /></div>}
                </div>

                {showRange && (
                    <div className="form-row-3">
                        <div className="form-group"><label>Min Value</label><input type="number" name="minValue" value={form.minValue} onChange={handleChange} step="0.01" className="form-input" disabled={loading} /></div>
                        <div className="form-group"><label>Max Value</label><input type="number" name="maxValue" value={form.maxValue} onChange={handleChange} step="0.01" className="form-input" disabled={loading} /></div>
                        <div className="form-group"><label>Unit</label><input type="text" name="unit" value={form.unit} onChange={handleChange} className="form-input" placeholder="mm, psi" disabled={loading} /></div>
                    </div>
                )}

                <div className="checkbox-row">
                    <div className="checkbox-group"><label><input type="checkbox" name="isCritical" checked={form.isCritical} onChange={handleChange} disabled={loading} /> Critical Item</label></div>
                    <div className="checkbox-group"><label><input type="checkbox" name="requiresPhoto" checked={form.requiresPhoto} onChange={handleChange} disabled={loading} /> Requires Photo</label></div>
                    <div className="checkbox-group"><label><input type="checkbox" name="requiresRemarks" checked={form.requiresRemarks} onChange={handleChange} disabled={loading} /> Requires Remarks</label></div>
                    <div className="checkbox-group"><label><input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} disabled={loading} /> Active</label></div>
                </div>
            </div>
        </Modal>
    );
}