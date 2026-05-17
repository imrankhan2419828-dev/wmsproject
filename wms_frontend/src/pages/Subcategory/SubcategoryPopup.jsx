import React, { useState, useEffect } from "react";
import subcategoryApi from "../../api/subcategoryApi";
import categoryApi from "../../api/categoryApi";
import { FaLayerGroup, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Modal } from "../../components/common/Modal/Modal";
import { Input, Button, ReactSelect, useDialog } from "../../components/common";
import "./SubcategoryPopup.css";

export default function SubcategoryPopup({ data, onClose, onSaved }) {
    const [form, setForm] = useState({
        subcatID: 0,
        subcatName: "",
        catgID: "",
        isSparepart: false,
        inActive: false
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { showSuccess, showError } = useDialog();

    const loadCategories = async () => {
        try {
            const res = await categoryApi.getAll();
            let list = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                list = res.data.data;
            } else if (Array.isArray(res.data)) {
                list = res.data;
            } else if (res.data && Array.isArray(res.data.$values)) {
                list = res.data.$values;
            }
            setCategories(list);
        } catch (err) {
            console.error("Error loading categories:", err);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (data) {
            setForm({
                subcatID: data.subcatID || 0,
                subcatName: data.subcatName || "",
                catgID: data.catgID?.toString() || "",
                isSparepart: data.isSparepart || false,
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
        if (!form.subcatName.trim()) newErrors.subcatName = "Subcategory name is required";
        if (!form.catgID) newErrors.catgID = "Please select a category";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const payload = {
                ...form,
                catgID: parseInt(form.catgID)
            };

            if (form.subcatID) {
                await subcategoryApi.update(form.subcatID, payload);
            } else {
                await subcategoryApi.create(payload);
            }

            onSaved();
            onClose();

            setTimeout(() => {
                showSuccess(
                    form.subcatID ? 'Subcategory updated successfully!' : 'Subcategory created successfully!'
                );
            }, 100);
        } catch (err) {
            console.error("Save error:", err);
            showError(err.response?.data?.message || "Failed to save subcategory");
        } finally {
            setLoading(false);
        }
    };

    // Convert categories to react-select format
    const categoryOptions = categories.map(c => ({
        value: (c.catgID || c.CatgID)?.toString(),
        label: c.catgName || c.CatgName
    }));

    const modalFooter = (
        <div className="popup-footer">
            <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} loading={loading}>
                {form.subcatID ? "Update" : "Create"}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={
                <>
                    <FaLayerGroup /> {form.subcatID ? "Edit Subcategory" : "Add New Subcategory"}
                </>
            }
            size="md"
            footer={modalFooter}
        >
            <div className="subcategory-popup-form">
                <ReactSelect
                    label="Category"
                    name="catgID"
                    value={form.catgID}
                    onChange={handleChange}
                    options={categoryOptions}
                    error={errors.catgID}
                    required
                    disabled={loading}
                    placeholder="Select Category"
                    isSearchable={true}
                    isClearable={true}
                />

                <Input
                    label="Subcategory Name"
                    name="subcatName"
                    value={form.subcatName}
                    onChange={handleChange}
                    error={errors.subcatName}
                    required
                    disabled={loading}
                    placeholder="Enter subcategory name"
                />

                <div className="checkbox-field-premium">
                    <label className="checkbox-label-premium">
                        <input
                            type="checkbox"
                            name="isSparepart"
                            checked={form.isSparepart}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <span className="checkbox-custom"></span>
                        <span className="checkbox-text">
                            {form.isSparepart ? "🔧 Spare Part" : "📦 Regular Item"}
                        </span>
                    </label>
                    <p className="checkbox-hint">
                        Check this if this subcategory contains spare parts
                    </p>
                </div>

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
                </div>
            </div>
        </Modal>
    );
}