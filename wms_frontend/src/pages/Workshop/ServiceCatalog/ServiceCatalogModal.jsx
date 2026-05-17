import React, { useEffect, useState, useCallback } from "react";
import serviceCatalogApi from "../../../api/serviceCatalogApi";
import itemApi from "../../../api/itemApi";
import { Modal } from "../../../components/common/Modal/Modal";
import { Button, useDialog } from "../../../components/common";
import { FaWrench } from "react-icons/fa";
import Select from "react-select"; // DIRECT IMPORT - NOT your ReactSelect
import "./ServiceCatalog.css";

export default function ServiceCatalogModal({ service, onClose, onSaved }) {
    const isEdit = !!service?.serviceID;
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { showSuccess, showError } = useDialog();

    const [form, setForm] = useState({
        serviceID: 0,
        serviceCode: "",
        serviceName: "",
        category: "",
        description: "",
        defaultLaborRate: "",
        estimatedTime: "",
        warrantyPeriod: "",
        requiresParts: false,
        suggestedParts: [],
        inActive: false
    });

    useEffect(() => {
        loadItems();

        if (service) {
            setForm({
                serviceID: service.serviceID || 0,
                serviceCode: service.serviceCode || "",
                serviceName: service.serviceName || "",
                category: service.category || "",
                description: service.description || "",
                defaultLaborRate: service.defaultLaborRate || "",
                estimatedTime: service.estimatedTime || "",
                warrantyPeriod: service.warrantyPeriod || "",
                requiresParts: service.requiresParts || false,
                suggestedParts: service.suggestedParts || [],
                inActive: service.inActive || false
            });
        }
    }, [service]);

    const loadItems = async () => {
        try {
            const res = await itemApi.getAll();
            let itemsData = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                itemsData = res.data.data;
            } else if (Array.isArray(res.data)) {
                itemsData = res.data;
            }
            setItems(itemsData);
        } catch (error) {
            console.error("Error loading items:", error);
        }
    };

    // Create options array for react-select
    const itemOptions = items.map(i => ({
        value: i.itemID,
        label: i.itemName
    }));

    // Get selected options for react-select
    const selectedPartsOptions = form.suggestedParts
        .map(partId => itemOptions.find(opt => opt.value === partId))
        .filter(opt => opt !== undefined);

    // Handle react-select change
    const handlePartsChange = (selectedOptions) => {
        const partsArray = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
        setForm(prev => ({
            ...prev,
            suggestedParts: partsArray
        }));
    };

    // Regular input change handler
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.serviceCode?.trim()) newErrors.serviceCode = "Service code is required";
        if (!form.serviceName?.trim()) newErrors.serviceName = "Service name is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            const payload = {
                serviceCode: form.serviceCode,
                serviceName: form.serviceName,
                category: form.category || null,
                description: form.description || null,
                defaultLaborRate: form.defaultLaborRate ? parseFloat(form.defaultLaborRate) : null,
                estimatedTime: form.estimatedTime ? parseInt(form.estimatedTime) : null,
                warrantyPeriod: form.warrantyPeriod ? parseInt(form.warrantyPeriod) : null,
                requiresParts: form.requiresParts || false,
                suggestedParts: form.suggestedParts || [],
                inActive: form.inActive || false
            };

            if (isEdit) {
                await serviceCatalogApi.update(form.serviceID, payload);
                showSuccess("Service updated successfully");
            } else {
                await serviceCatalogApi.create(payload);
                showSuccess("Service created successfully");
            }

            onSaved();
            onClose();
        } catch (err) {
            console.error("Save error:", err);
            showError(err.response?.data?.message || "Failed to save service");
        } finally {
            setLoading(false);
        }
    };

    const modalFooter = (
        <div className="service-modal-footer">
            <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={loading}>
                {isEdit ? "Update Service" : "Save Service"}
            </Button>
        </div>
    );

    // Custom styles for react-select
    const customSelectStyles = {
        control: (base, state) => ({
            ...base,
            borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
            boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
            '&:hover': {
                borderColor: '#3b82f6'
            }
        }),
        menu: (base) => ({
            ...base,
            zIndex: 9999
        })
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={<><FaWrench /> {isEdit ? "Edit Service" : "Add New Service"}</>}
            size="lg"
            footer={modalFooter}
        >
            <div className="service-modal-container">
                {/* LINE 1: Service Code *, Service Name *, Category */}
                <div className="service-row-3">
                    <div className="form-group">
                        <label>Service Code <span className="required">*</span></label>
                        <input
                            type="text"
                            name="serviceCode"
                            value={form.serviceCode}
                            onChange={handleInputChange}
                            placeholder="e.g., OIL-001"
                            className="form-input"
                            disabled={loading}
                        />
                        {errors.serviceCode && <div className="error-text">{errors.serviceCode}</div>}
                    </div>
                    <div className="form-group">
                        <label>Service Name <span className="required">*</span></label>
                        <input
                            type="text"
                            name="serviceName"
                            value={form.serviceName}
                            onChange={handleInputChange}
                            placeholder="e.g., Oil Change"
                            className="form-input"
                            disabled={loading}
                        />
                        {errors.serviceName && <div className="error-text">{errors.serviceName}</div>}
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <input
                            type="text"
                            name="category"
                            value={form.category}
                            onChange={handleInputChange}
                            placeholder="e.g., Maintenance"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* LINE 2: Labor Rate, Est. Time, Warranty */}
                <div className="service-row-3">
                    <div className="form-group">
                        <label>Labor Rate (Rs.)</label>
                        <input
                            type="number"
                            name="defaultLaborRate"
                            value={form.defaultLaborRate}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            step="0.01"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Est. Time (minutes)</label>
                        <input
                            type="number"
                            name="estimatedTime"
                            value={form.estimatedTime}
                            onChange={handleInputChange}
                            placeholder="e.g., 60"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Warranty (days)</label>
                        <input
                            type="number"
                            name="warrantyPeriod"
                            value={form.warrantyPeriod}
                            onChange={handleInputChange}
                            placeholder="e.g., 30"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* LINE 3: Description */}
                <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleInputChange}
                        rows="2"
                        className="form-textarea"
                        placeholder="Service description..."
                        disabled={loading}
                    />
                </div>

                {/* LINE 4: Requires Parts + Inactive in ONE LINE */}
                <div className="checkbox-row">
                    <div className="checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="requiresParts"
                                checked={form.requiresParts}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                            Requires Parts
                        </label>
                    </div>
                    <div className="checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="inActive"
                                checked={form.inActive}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                            Inactive
                        </label>
                    </div>
                </div>

                {/* LINE 5: Suggested Parts (only if Requires Parts is checked) */}
                {form.requiresParts && (
                    <div className="form-group full-width">
                        <label>Suggested Parts</label>
                        <Select
                            value={selectedPartsOptions}
                            onChange={handlePartsChange}
                            options={itemOptions}
                            placeholder="Select suggested parts..."
                            isMulti={true}
                            isClearable={true}
                            isDisabled={loading}
                            styles={customSelectStyles}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                        {/* Show selected count */}
                        {selectedPartsOptions.length > 0 && (
                            <small style={{ color: '#10b981', marginTop: '5px', display: 'block' }}>
                                ✓ {selectedPartsOptions.length} part(s) selected
                            </small>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}