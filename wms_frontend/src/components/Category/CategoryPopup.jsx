import React, { useState, useEffect } from "react";
import categoryApi from "../../api/categoryApi";
import { Modal } from "../../components/common/Modal/Modal";
import { Input, Button } from "../../components/common";
import { useToast } from "../../components/common/Toast/Toast"; // ← DIRECT IMPORT
import { FaTags, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "./CategoryPopup.css";
import { useDialog } from "../../components/common";
export default function CategoryPopup({ data, onClose, onSaved }) {
    const [form, setForm] = useState({
        catgID: 0,
        catgName: "",
        inActive: false
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { showToast } = useToast();
    const { showSuccess, showError } = useDialog();

    console.log('🎯 useToast available:', !!showToast);

    useEffect(() => {
        if (data) {
            setForm({
                catgID: data.catgID || 0,
                catgName: data.catgName || "",
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
        if (!form.catgName.trim()) {
            newErrors.catgName = "Category name is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            if (form.catgID) {
                await categoryApi.update(form.catgID, form);
                onSaved();
                onClose();
                showSuccess("Category updated successfully!");
            } else {
                await categoryApi.create(form);
                onSaved();
                onClose();
                showSuccess("Category created successfully!");
            }
        } catch (err) {
            console.error("Save error:", err);
            showError(err.response?.data?.message || "Failed to save category");
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
                {form.catgID ? "Update" : "Create"}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={
                <>
                    <FaTags /> {form.catgID ? "Edit Category" : "Add New Category"}
                </>
            }
            size="sm"
            footer={modalFooter}
        >
            <div className="category-popup-form">
                <Input
                    label="Category Name"
                    name="catgName"
                    value={form.catgName}
                    onChange={handleChange}
                    error={errors.catgName}
                    required
                    disabled={loading}
                    placeholder="Enter category name"
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
                            ? "Inactive categories will not appear in dropdowns"
                            : "Active categories will be available for selection"}
                    </p>
                </div>
            </div>
        </Modal>
    );
}