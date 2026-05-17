import React, { useState, useEffect } from "react";
import branchApi from "../../api/branchApi";
import { Modal } from "../../components/common/Modal/Modal";
import { Input, Button, useDialog } from "../../components/common";
import { FaBuilding } from "react-icons/fa";
import "./BranchModal.css";

export default function BranchModal({ branch, onClose }) {
    const [form, setForm] = useState({
        branchName: "", branchAddress: "", branchPhone: "", branchCooridnator: "",
        branchAbbr: "", c_Cell: "", c_Email: "", branchCity: "", remarks: "", inActive: false
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { showSuccess, showError } = useDialog();
    const isEdit = !!branch?.branchID;

    useEffect(() => {
        if (branch) {
            setForm({
                branchName: branch.branchName || "", branchAddress: branch.branchAddress || "",
                branchPhone: branch.branchPhone || "", branchCooridnator: branch.branchCooridnator || "",
                branchAbbr: branch.branchAbbr || "", c_Cell: branch.c_Cell || "",
                c_Email: branch.c_Email || "", branchCity: branch.branchCity || "",
                remarks: branch.remarks || "", inActive: branch.inActive || false
            });
        }
    }, [branch]);

    const handleChange = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.branchName?.trim()) newErrors.branchName = "Branch name required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            if (isEdit) await branchApi.update(branch.branchID, form);
            else await branchApi.create(form);
            showSuccess(isEdit ? "Branch updated!" : "Branch created!");
            onClose();
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
            title={<><FaBuilding /> {isEdit ? "Edit Branch" : "Add New Branch"}</>}
            size="auto"
            footer={
                <div className="popup-footer">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} loading={loading}>Save Branch</Button>
                </div>
            }
        >
            <div className="branch-popup-container">
                {/* LINE 1: Branch Name*, Branch Code (2 fields) */}
                <div className="form-row-2">
                    <div className="field-group">
                        <label>Branch Name <span className="required">*</span></label>
                        <input type="text" value={form.branchName} onChange={(e) => handleChange('branchName', e.target.value)} className={`compact-input ${errors.branchName ? 'error' : ''}`} placeholder="Branch name" disabled={loading} />
                        {errors.branchName && <small className="error-text">{errors.branchName}</small>}
                    </div>
                    <div className="field-group">
                        <label>Branch Code</label>
                        <input type="text" value={form.branchAbbr} onChange={(e) => handleChange('branchAbbr', e.target.value)} className="compact-input" placeholder="e.g., HO, BR01" disabled={loading} />
                    </div>
                </div>

                {/* LINE 2: City, Phone (2 fields) */}
                <div className="form-row-2">
                    <div className="field-group">
                        <label>City</label>
                        <input type="text" value={form.branchCity} onChange={(e) => handleChange('branchCity', e.target.value)} className="compact-input" placeholder="City" disabled={loading} />
                    </div>
                    <div className="field-group">
                        <label>Phone</label>
                        <input type="text" value={form.branchPhone} onChange={(e) => handleChange('branchPhone', e.target.value)} className="compact-input" placeholder="Phone number" disabled={loading} />
                    </div>
                </div>

                {/* LINE 3: Address (full width) */}
                <div className="field-group">
                    <label>Address</label>
                    <input type="text" value={form.branchAddress} onChange={(e) => handleChange('branchAddress', e.target.value)} className="compact-input" placeholder="Branch address" disabled={loading} />
                </div>

                {/* LINE 4: Coordinator, Mobile (2 fields) */}
                <div className="form-row-2">
                    <div className="field-group">
                        <label>Coordinator</label>
                        <input type="text" value={form.branchCooridnator} onChange={(e) => handleChange('branchCooridnator', e.target.value)} className="compact-input" placeholder="Coordinator name" disabled={loading} />
                    </div>
                    <div className="field-group">
                        <label>Mobile</label>
                        <input type="text" value={form.c_Cell} onChange={(e) => handleChange('c_Cell', e.target.value)} className="compact-input" placeholder="Mobile number" disabled={loading} />
                    </div>
                </div>

                {/* LINE 5: Email, Remarks (2 fields) */}
                <div className="form-row-2">
                    <div className="field-group">
                        <label>Email</label>
                        <input type="email" value={form.c_Email} onChange={(e) => handleChange('c_Email', e.target.value)} className="compact-input" placeholder="Email address" disabled={loading} />
                    </div>
                    <div className="field-group">
                        <label>Remarks</label>
                        <input type="text" value={form.remarks} onChange={(e) => handleChange('remarks', e.target.value)} className="compact-input" placeholder="Any remarks" disabled={loading} />
                    </div>
                </div>

                {/* LINE 6: Inactive Checkbox */}
                <div className="checkbox-field">
                    <label className="checkbox-label">
                        <input type="checkbox" checked={form.inActive} onChange={(e) => handleChange('inActive', e.target.checked)} disabled={loading} />
                        <span className="checkbox-custom"></span>
                        <span className="checkbox-text">Inactive Branch</span>
                    </label>
                </div>
            </div>
        </Modal>
    );
}