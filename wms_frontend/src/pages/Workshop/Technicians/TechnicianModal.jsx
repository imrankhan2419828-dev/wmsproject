import React, { useEffect, useState } from "react";
import technicianApi from "../../../api/technicianApi";
import { Modal } from "../../../components/common/Modal/Modal";
import { Button, useDialog } from "../../../components/common";
import { FaUserCog } from "react-icons/fa";
import "./Technician.css";

export default function TechnicianModal({ technician, onClose, onSaved }) {
    const isEdit = !!technician?.technicianID;
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { showSuccess, showError } = useDialog();

    const [form, setForm] = useState({
        technicianID: 0,
        technicianName: "",
        employeeCode: "",
        specialization: "",
        certification: "",
        experienceYears: "",
        hourlyRate: "",
        dailyCapacity: "8",
        remarks: "",
        inActive: false
    });

    useEffect(() => {
        if (technician) {
            setForm({
                technicianID: technician.technicianID || 0,
                technicianName: technician.technicianName || technician.fullName || "",
                employeeCode: technician.employeeCode || "",
                specialization: technician.specialization || "",
                certification: technician.certification || "",
                experienceYears: technician.experienceYears || "",
                hourlyRate: technician.hourlyRate || "",
                dailyCapacity: technician.dailyCapacity || "8",
                remarks: technician.remarks || "",
                inActive: technician.inActive || false
            });
        }
    }, [technician]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value
        });
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.technicianName.trim()) {
            newErrors.technicianName = "Technician name is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            const payload = {
                technicianName: form.technicianName,
                employeeCode: form.employeeCode || null,
                specialization: form.specialization || null,
                certification: form.certification || null,
                experienceYears: form.experienceYears ? parseInt(form.experienceYears) : null,
                hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : null,
                dailyCapacity: form.dailyCapacity ? parseInt(form.dailyCapacity) : 8,
                remarks: form.remarks || null,
                inActive: form.inActive || false
            };

            if (isEdit) {
                await technicianApi.update(form.technicianID, payload);
                showSuccess("Technician updated successfully");
            } else {
                await technicianApi.create(payload);
                showSuccess("Technician created successfully");
            }

            onSaved();
            onClose();
        } catch (err) {
            console.error("Save error:", err);
            showError(err.response?.data?.message || "Failed to save technician");
        } finally {
            setLoading(false);
        }
    };

    const modalFooter = (
        <div className="technician-modal-footer">
            <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={loading}>
                {isEdit ? "Update Technician" : "Save Technician"}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={<><FaUserCog /> {isEdit ? "Edit Technician" : "Add New Technician"}</>}
            size="lg"
            footer={modalFooter}
        >
            <div className="technician-modal-container">
                {/* LINE 1: Technician Name *, Employee Code, Experience (Years) */}
                <div className="technician-row-3">
                    <div className="form-group">
                        <label>Technician Name <span className="required">*</span></label>
                        <input
                            type="text"
                            name="technicianName"
                            value={form.technicianName}
                            onChange={handleChange}
                            placeholder="Full name of technician"
                            className="form-input"
                            disabled={loading}
                        />
                        {errors.technicianName && <div className="error-text">{errors.technicianName}</div>}
                    </div>
                    <div className="form-group">
                        <label>Employee Code</label>
                        <input
                            type="text"
                            name="employeeCode"
                            value={form.employeeCode}
                            onChange={handleChange}
                            placeholder="e.g., TECH-001"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Experience (Years)</label>
                        <input
                            type="number"
                            name="experienceYears"
                            value={form.experienceYears}
                            onChange={handleChange}
                            placeholder="e.g., 5"
                            min="0"
                            max="50"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* LINE 2: Specialization, Certification, Hourly Rate, Daily Capacity */}
                <div className="technician-row-4">
                    <div className="form-group">
                        <label>Specialization</label>
                        <input
                            type="text"
                            name="specialization"
                            value={form.specialization}
                            onChange={handleChange}
                            placeholder="e.g., Engine Repair"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Certification</label>
                        <input
                            type="text"
                            name="certification"
                            value={form.certification}
                            onChange={handleChange}
                            placeholder="e.g., ASE Certified"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Hourly Rate (Rs.)</label>
                        <input
                            type="number"
                            name="hourlyRate"
                            value={form.hourlyRate}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Daily Capacity</label>
                        <input
                            type="number"
                            name="dailyCapacity"
                            value={form.dailyCapacity}
                            onChange={handleChange}
                            placeholder="8"
                            min="1"
                            max="20"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* LINE 3: Remarks */}
                <div className="form-group full-width">
                    <label>Remarks</label>
                    <textarea
                        name="remarks"
                        value={form.remarks}
                        onChange={handleChange}
                        rows="2"
                        className="form-textarea"
                        placeholder="Additional notes about the technician..."
                        disabled={loading}
                    />
                </div>

                {/* LINE 4: Inactive Checkbox */}
                <div className="checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            name="inActive"
                            checked={form.inActive}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        Inactive
                    </label>
                </div>
            </div>
        </Modal>
    );
}