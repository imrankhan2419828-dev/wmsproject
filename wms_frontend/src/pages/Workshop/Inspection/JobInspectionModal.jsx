import React, { useEffect, useState } from "react";
import inspectionApi from "../../../api/inspectionApi";
import "./Inspection.css";

export default function JobInspectionModal({ inspection, jobCardId, onClose, onSaved }) {
    const [templates, setTemplates] = useState([]);
    const [form, setForm] = useState({
        inspectionID: 0,
        jobCardID: jobCardId,
        templateID: "",
        inspectedBy: "",
        overallNotes: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadTemplates();

        if (inspection) {
            setForm({
                inspectionID: inspection.inspectionID || 0,
                jobCardID: inspection.jobCardID || jobCardId,
                templateID: inspection.templateID || "",
                inspectedBy: inspection.inspectedBy || "",
                overallNotes: inspection.overallNotes || ""
            });
        }
    }, [inspection, jobCardId]);

    const loadTemplates = async () => {
        try {
            const res = await inspectionApi.getTemplates();
            let data = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                data = res.data.data;
            } else if (Array.isArray(res.data)) {
                data = res.data;
            }
            setTemplates(data.filter(t => t.isActive));
        } catch (error) {
            console.error("Error loading templates:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (error) setError("");
    };

    const validateForm = () => {
        if (!form.templateID) {
            setError("Please select an inspection template");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError("");

        try {
            const payload = {
                ...form,
                templateID: parseInt(form.templateID),
                inspectedBy: form.inspectedBy ? parseInt(form.inspectedBy) : null
            };

            console.log("Creating inspection:", payload);

            await inspectionApi.createInspection(payload);
            alert("Inspection created successfully");

            onSaved();
            onClose();
        } catch (err) {
            console.error("Create error:", err);
            setError(err.response?.data?.message || "Failed to create inspection");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content inspection-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>New Job Inspection</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="error-message">{error}</div>}

                        <div className="form-group">
                            <label>Inspection Template *</label>
                            <select
                                name="templateID"
                                value={form.templateID}
                                onChange={handleChange}
                                disabled={loading}
                                required
                            >
                                <option value="">Select Template</option>
                                {templates.map(t => (
                                    <option key={t.templateID} value={t.templateID}>
                                        {t.templateName} ({t.category})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Inspector (Technician)</label>
                            <input
                                type="text"
                                name="inspectedBy"
                                value={form.inspectedBy}
                                onChange={handleChange}
                                placeholder="Technician ID or Name"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Notes</label>
                            <textarea
                                name="overallNotes"
                                value={form.overallNotes}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Additional notes..."
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? "Creating..." : "Create Inspection"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}