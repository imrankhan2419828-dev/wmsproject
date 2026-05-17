import React, { useState, useEffect } from "react";
import { FaWarehouse, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Modal } from "../../components/common/Modal/Modal";
import { Input, Button, useDialog } from "../../components/common";
import "./GodownPopup.css";

export default function GodownPopup({ data, onClose, onSave, onSaved }) {
    const [form, setForm] = useState({
        godnID: 0,
        godnName: "",
        inActive: false
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { showSuccess, showError } = useDialog();

    useEffect(() => {
        if (data) {
            setForm({
                godnID: data.godnID || 0,
                godnName: data.godnName || "",
                inActive: data.inActive || false
            });
        }
    }, [data]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value
        });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.godnName.trim()) {
            newErrors.godnName = "Godown name is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await onSave(form);
            onClose();
            onSaved();

            setTimeout(() => {
                showSuccess(
                    form.godnID ? 'Godown updated successfully!' : 'Godown created successfully!'
                );
            }, 100);
        } catch (err) {
            console.error("Save error:", err);
            showError(err.response?.data?.message || "Failed to save godown");
        } finally {
            setLoading(false);
        }
    };

    const modalFooter = (
        <div className="popup-footer">
            <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} loading={loading}>
                {form.godnID ? "Update" : "Create"}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={
                <>
                    <FaWarehouse /> {form.godnID ? "Edit Godown" : "Add New Godown"}
                </>
            }
            size="sm"
            footer={modalFooter}
        >
            <div className="godown-popup-form">
                <Input
                    label="Godown Name"
                    name="godnName"
                    value={form.godnName}
                    onChange={handleChange}
                    error={errors.godnName}
                    required
                    disabled={loading}
                    placeholder="Enter godown/warehouse name"
                    autoFocus
                />

                <div className="checkbox-field-premium">
                    <label className="checkbox-label-premium">
                        <input
                            type="checkbox"
                            name="inActive"
                            checked={form.inActive}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <span className="checkbox-custom"></span>
                        <span className="checkbox-text">
                            {form.inActive ? (
                                <><FaTimesCircle /> Inactive</>
                            ) : (
                                <><FaCheckCircle /> Active</>
                            )}
                        </span>
                    </label>
                    <p className="checkbox-hint">
                        {form.inActive
                            ? "Inactive godowns will not appear in dropdowns"
                            : "Active godowns will be available for selection"}
                    </p>
                </div>
            </div>
        </Modal>
    );
}