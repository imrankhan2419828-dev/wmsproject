import React, { useEffect, useState } from "react";
import workshopSettingsApi from "../../../api/workshopSettingsApi";
import "./WorkshopSettings.css";

export default function WorkshopSettingsPage() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [capacityCheck, setCapacityCheck] = useState(null);

    // Form state
    const [form, setForm] = useState({
        settingID: 0,
        dailyBookingCapacity: 50,
        maxTechnicianLoad: 8,
        overbookingAlertThreshold: 80,
        smsEnabled: false,
        whatsAppEnabled: false,
        inspectionRequired: true
    });

    const loadSettings = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await workshopSettingsApi.getSettings();
            console.log("Settings response:", res);

            let data = null;
            if (res.data && res.data.data) {
                data = res.data.data;
            } else if (res.data) {
                data = res.data;
            }

            if (data) {
                setSettings(data);
                setForm({
                    settingID: data.settingID || 0,
                    dailyBookingCapacity: data.dailyBookingCapacity || 50,
                    maxTechnicianLoad: data.maxTechnicianLoad || 8,
                    overbookingAlertThreshold: data.overbookingAlertThreshold || 80,
                    smsEnabled: data.smsEnabled || false,
                    whatsAppEnabled: data.whatsAppEnabled || false,
                    inspectionRequired: data.inspectionRequired || true
                });
            }
        } catch (err) {
            console.error("Error loading settings:", err);
            setError("Failed to load workshop settings");
        } finally {
            setLoading(false);
        }
    };

    const checkCapacity = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const res = await workshopSettingsApi.checkCapacity(today);
            console.log("Capacity check:", res);

            let data = null;
            if (res.data && res.data.data) {
                data = res.data.data;
            } else if (res.data) {
                data = res.data;
            }
            setCapacityCheck(data);
        } catch (err) {
            console.error("Error checking capacity:", err);
        }
    };

    useEffect(() => {
        loadSettings();
        checkCapacity();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : parseInt(value) || value
        });
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            let response;
            if (form.settingID) {
                response = await workshopSettingsApi.updateSettings(form.settingID, form);
                setSuccess("Settings updated successfully");
            } else {
                response = await workshopSettingsApi.createSettings(form);
                setSuccess("Settings created successfully");
            }

            // Reload settings to get updated data
            await loadSettings();
        } catch (err) {
            console.error("Save error:", err);
            setError(err.response?.data?.message || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const getCapacityStatusColor = (status) => {
        switch (status) {
            case 'AVAILABLE': return '#28a745';
            case 'NEAR_CAPACITY': return '#ffc107';
            case 'OVERBOOKED': return '#dc3545';
            default: return '#6c757d';
        }
    };

    if (loading) {
        return (
            <div className="workshop-settings-page">
                <div className="loading-spinner">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="workshop-settings-page">
            <div className="page-header">
                <h2>Workshop Settings</h2>
            </div>

            {/* Capacity Status Card */}
            {capacityCheck && (
                <div className="capacity-status-card" style={{ borderLeftColor: getCapacityStatusColor(capacityCheck.status) }}>
                    <h3>Today's Booking Capacity</h3>
                    <div className="capacity-details">
                        <div className="capacity-stat">
                            <span className="stat-label">Status:</span>
                            <span className="stat-value" style={{ color: getCapacityStatusColor(capacityCheck.status) }}>
                                {capacityCheck.status}
                            </span>
                        </div>
                        <div className="capacity-stat">
                            <span className="stat-label">Bookings:</span>
                            <span className="stat-value">{capacityCheck.currentBookings} / {capacityCheck.capacity}</span>
                        </div>
                        <div className="capacity-stat">
                            <span className="stat-label">Utilization:</span>
                            <span className="stat-value">{capacityCheck.percentage}%</span>
                        </div>
                        {capacityCheck.message && (
                            <div className="capacity-message">{capacityCheck.message}</div>
                        )}
                    </div>
                    <div className="capacity-bar">
                        <div
                            className="capacity-fill"
                            style={{
                                width: `${capacityCheck.percentage}%`,
                                backgroundColor: getCapacityStatusColor(capacityCheck.status)
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Settings Form */}
            <div className="settings-form-container">
                <h3>Workshop Configuration</h3>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit} className="settings-form">
                    <div className="form-section">
                        <h4>Booking Settings</h4>
                        <div className="form-group">
                            <label>Daily Booking Capacity</label>
                            <input
                                type="number"
                                name="dailyBookingCapacity"
                                value={form.dailyBookingCapacity}
                                onChange={handleChange}
                                min="1"
                                max="200"
                                required
                            />
                            <small>Maximum number of bookings allowed per day</small>
                        </div>

                        <div className="form-group">
                            <label>Overbooking Alert Threshold (%)</label>
                            <input
                                type="number"
                                name="overbookingAlertThreshold"
                                value={form.overbookingAlertThreshold}
                                onChange={handleChange}
                                min="1"
                                max="100"
                                required
                            />
                            <small>Alert when bookings reach this percentage of capacity</small>
                        </div>
                    </div>

                    <div className="form-section">
                        <h4>Technician Settings</h4>
                        <div className="form-group">
                            <label>Max Technician Load (jobs per day)</label>
                            <input
                                type="number"
                                name="maxTechnicianLoad"
                                value={form.maxTechnicianLoad}
                                onChange={handleChange}
                                min="1"
                                max="20"
                                required
                            />
                            <small>Maximum jobs a technician can handle per day</small>
                        </div>
                    </div>

                    <div className="form-section">
                        <h4>Communication Settings</h4>
                        <div className="checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="smsEnabled"
                                    checked={form.smsEnabled}
                                    onChange={handleChange}
                                />
                                Enable SMS Notifications
                            </label>
                        </div>
                        <div className="checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="whatsAppEnabled"
                                    checked={form.whatsAppEnabled}
                                    onChange={handleChange}
                                />
                                Enable WhatsApp Notifications
                            </label>
                        </div>
                    </div>

                    <div className="form-section">
                        <h4>Inspection Settings</h4>
                        <div className="checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="inspectionRequired"
                                    checked={form.inspectionRequired}
                                    onChange={handleChange}
                                />
                                Require Vehicle Inspection for all jobs
                            </label>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? "Saving..." : (form.settingID ? "Update Settings" : "Save Settings")}
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={checkCapacity}
                            disabled={saving}
                        >
                            Refresh Capacity
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}