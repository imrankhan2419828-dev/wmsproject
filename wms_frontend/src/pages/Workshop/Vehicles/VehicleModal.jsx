import React, { useEffect, useState } from "react";
import vehicleApi from "../../../api/vehicleApi";
import { Modal } from "../../../components/common/Modal/Modal";
import { Button, useDialog } from "../../../components/common";
import { FaCar } from "react-icons/fa";
import "./VehicleModal.css";

export default function VehicleModal({ vehicle, onClose, onSaved }) {
    const isEdit = !!vehicle?.vehicleID;
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { showSuccess, showError } = useDialog();

    const [form, setForm] = useState({
        vehicleID: 0,
        registrationNo: "",
        customerName: "",
        make: "",
        model: "",
        year: "",
        color: "",
        chassisNo: "",
        engineNo: "",
        fuelType: "",
        odometerReading: "",
        lastServiceDate: "",
        nextServiceDue: "",
        remarks: "",
        inActive: false
    });

    useEffect(() => {
        if (vehicle) {
            setForm({
                vehicleID: vehicle.vehicleID || 0,
                registrationNo: vehicle.registrationNo || "",
                customerName: vehicle.customerName || "",
                make: vehicle.make || "",
                model: vehicle.model || "",
                year: vehicle.year || "",
                color: vehicle.color || "",
                chassisNo: vehicle.chassisNo || "",
                engineNo: vehicle.engineNo || "",
                fuelType: vehicle.fuelType || "",
                odometerReading: vehicle.odometerReading || "",
                lastServiceDate: vehicle.lastServiceDate ? vehicle.lastServiceDate.split('T')[0] : "",
                nextServiceDue: vehicle.nextServiceDue ? vehicle.nextServiceDue.split('T')[0] : "",
                remarks: vehicle.remarks || "",
                inActive: vehicle.inActive || false
            });
        }
    }, [vehicle]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value
        });
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        // No required fields - sab optional
        setErrors({});
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            const payload = {
                registrationNo: form.registrationNo || "",
                customerName: form.customerName || "",
                make: form.make || "",
                model: form.model || "",
                year: form.year ? parseInt(form.year) : null,
                color: form.color || "",
                chassisNo: form.chassisNo || "",
                engineNo: form.engineNo || "",
                fuelType: form.fuelType || "",
                odometerReading: form.odometerReading ? parseInt(form.odometerReading) : null,
                lastServiceDate: form.lastServiceDate || null,
                nextServiceDue: form.nextServiceDue || null,
                remarks: form.remarks || "",
                inActive: form.inActive || false
            };

            if (isEdit) {
                await vehicleApi.update(form.vehicleID, payload);
                showSuccess("Vehicle updated successfully");
            } else {
                await vehicleApi.create(payload);
                showSuccess("Vehicle created successfully");
            }

            onSaved();
            onClose();
        } catch (err) {
            console.error("Save error:", err);
            showError(err.response?.data?.message || "Failed to save vehicle");
        } finally {
            setLoading(false);
        }
    };

    const modalFooter = (
        <div className="vehicle-modal-footer">
            <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={loading}>
                {isEdit ? "Update Vehicle" : "Save Vehicle"}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={<><FaCar /> {isEdit ? "Edit Vehicle" : "Add New Vehicle"}</>}
            size="xl"
            footer={modalFooter}
        >
            <div className="vehicle-modal-container">
                {/* LINE 1: Registration Number, Customer Name, Make, Model */}
                <div className="vehicle-row-4">
                    <div className="form-group">
                        <label>Registration Number</label>
                        <input
                            type="text"
                            name="registrationNo"
                            value={form.registrationNo}
                            onChange={handleChange}
                            placeholder="e.g., ABC-1234"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Customer Name</label>
                        <input
                            type="text"
                            name="customerName"
                            value={form.customerName}
                            onChange={handleChange}
                            placeholder="Customer name"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Make</label>
                        <input
                            type="text"
                            name="make"
                            value={form.make}
                            onChange={handleChange}
                            placeholder="e.g., Toyota"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Model</label>
                        <input
                            type="text"
                            name="model"
                            value={form.model}
                            onChange={handleChange}
                            placeholder="e.g., Corolla"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* LINE 2: Year, Color, Chassis Number, Engine Number */}
                <div className="vehicle-row-4">
                    <div className="form-group">
                        <label>Year</label>
                        <input
                            type="number"
                            name="year"
                            value={form.year}
                            onChange={handleChange}
                            placeholder="e.g., 2020"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Color</label>
                        <input
                            type="text"
                            name="color"
                            value={form.color}
                            onChange={handleChange}
                            placeholder="e.g., White"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Chassis Number</label>
                        <input
                            type="text"
                            name="chassisNo"
                            value={form.chassisNo}
                            onChange={handleChange}
                            placeholder="Chassis number"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Engine Number</label>
                        <input
                            type="text"
                            name="engineNo"
                            value={form.engineNo}
                            onChange={handleChange}
                            placeholder="Engine number"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* LINE 3: Fuel Type, Odometer (km), Last Service Date, Next Service Due */}
                <div className="vehicle-row-4">
                    <div className="form-group">
                        <label>Fuel Type</label>
                        <select
                            name="fuelType"
                            value={form.fuelType}
                            onChange={handleChange}
                            className="form-select"
                            disabled={loading}
                        >
                            <option value="">Select fuel type</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Electric">Electric</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Odometer (km)</label>
                        <input
                            type="number"
                            name="odometerReading"
                            value={form.odometerReading}
                            onChange={handleChange}
                            placeholder="Current odometer"
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Last Service Date</label>
                        <input
                            type="date"
                            name="lastServiceDate"
                            value={form.lastServiceDate}
                            onChange={handleChange}
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Next Service Due</label>
                        <input
                            type="date"
                            name="nextServiceDue"
                            value={form.nextServiceDue}
                            onChange={handleChange}
                            className="form-input"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* LINE 4: Remarks (Full Width) & Inactive Checkbox */}
                <div className="vehicle-row-last">
                    <div className="form-group remarks-group">
                        <label>Remarks</label>
                        <textarea
                            name="remarks"
                            value={form.remarks}
                            onChange={handleChange}
                            rows="2"
                            className="form-textarea"
                            placeholder="Additional notes..."
                            disabled={loading}
                        />
                    </div>
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
            </div>
        </Modal>
    );
}