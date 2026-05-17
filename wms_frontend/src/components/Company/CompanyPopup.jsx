import React, { useState, useEffect } from 'react';
import { Input, Button, useDialog } from '../../components/common';
import { Modal } from "../../components/common/Modal/Modal";
import { FaBuilding } from 'react-icons/fa';
import './CompanyPopup.css';

export default function CompanyPopup({ company, onClose, onSave }) {
    const [formData, setFormData] = useState({
        compID: null,
        compName: "",
        contPrsn: "",
        phonNumb: "",
        cellNumb: "",
        emalAddr: "",
        compAddr: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { showSuccess, showError } = useDialog();

    useEffect(() => {
        if (company) {
            setFormData({
                compID: company.compID || null,
                compName: company.compName || "",
                contPrsn: company.contPrsn || "",
                phonNumb: company.phonNumb || "",
                cellNumb: company.cellNumb || "",
                emalAddr: company.emalAddr || "",
                compAddr: company.compAddr || "",
            });
        }
    }, [company]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.compName.trim()) {
            newErrors.compName = 'Company name is required';
        }
        if (formData.emalAddr && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emalAddr)) {
            newErrors.emalAddr = 'Invalid email address';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await onSave(formData);
            onClose();

            // Show success dialog AFTER modal closes
            setTimeout(() => {
                showSuccess(
                    company ? 'Company updated successfully!' : 'Company created successfully!'
                );
            }, 100);
        } catch (err) {
            console.error('Submit error:', err);
            showError(err.response?.data?.message || 'Failed to save company');
        } finally {
            setLoading(false);
        }
    };

    const modalFooter = (
        <div className="popup-footer">
            <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={loading}>
                {company ? 'Update' : 'Create'}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={
                <>
                    <FaBuilding /> {company ? "Edit Company" : "Add New Company"}
                </>
            }
            size="md"
            footer={modalFooter}
        >
            <div className="company-popup-form">
                <Input
                    label="Company Name"
                    name="compName"
                    value={formData.compName}
                    onChange={handleChange}
                    error={errors.compName}
                    required
                    disabled={loading}
                    placeholder="Enter company name"
                />

                <div className="form-two-col">
                    <Input
                        label="Contact Person"
                        name="contPrsn"
                        value={formData.contPrsn}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Contact person"
                    />
                    <Input
                        label="Phone Number"
                        name="phonNumb"
                        value={formData.phonNumb}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Phone"
                    />
                </div>

                <div className="form-two-col">
                    <Input
                        label="Cell Number"
                        name="cellNumb"
                        value={formData.cellNumb}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Cell"
                    />
                    <Input
                        label="Email Address"
                        name="emalAddr"
                        type="email"
                        value={formData.emalAddr}
                        onChange={handleChange}
                        error={errors.emalAddr}
                        disabled={loading}
                        placeholder="Email"
                    />
                </div>

                <div className="textarea-field">
                    <label className="field-label">Address</label>
                    <textarea
                        name="compAddr"
                        value={formData.compAddr}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Enter company address"
                        rows={2}
                        className="compact-textarea"
                    />
                </div>
            </div>
        </Modal>
    );
}