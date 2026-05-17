import React, { useEffect, useState } from "react";
import technicianTimeLogApi from "../../../api/technicianTimeLogApi";
import technicianApi from "../../../api/technicianApi";
import { Modal } from "../../../components/common/Modal/Modal";
import { Button, ReactSelect, useDialog } from "../../../components/common";
import { FaClock, FaUserClock, FaExclamationTriangle } from "react-icons/fa";
import "./TechnicianTimeLog.css";

export default function TechnicianTimeLogModal({ log, onClose, onSaved }) {
    const isEdit = !!log?.timeLogID;
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeStatusMap, setActiveStatusMap] = useState({});
    const [checkingStatus, setCheckingStatus] = useState(false);
    const { showSuccess, showError } = useDialog();

    const [form, setForm] = useState({
        timeLogID: 0,
        technicianID: "",
        jobServiceID: "",
        jobCardID: "",
        clockInTime: new Date().toISOString().slice(0, 16),
        clockOutTime: "",
        breakStartTime: "",
        breakEndTime: "",
        totalBreakMinutes: 0,
        totalWorkMinutes: "",
        status: "ACTIVE",
        notes: ""
    });

    // Load technicians
    const loadTechnicians = async () => {
        try {
            const res = await technicianApi.getAll();
            let techData = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                techData = res.data.data;
            } else if (Array.isArray(res.data)) {
                techData = res.data;
            }
            setTechnicians(techData);

            // Check active status for all technicians
            await checkAllTechniciansStatus(techData);
        } catch (err) {
            console.error("Error loading technicians:", err);
        }
    };

    // ✅ Check active status for all technicians
    const checkAllTechniciansStatus = async (techList) => {
        setCheckingStatus(true);
        const statusMap = {};

        for (const tech of techList) {
            try {
                const res = await technicianTimeLogApi.getCurrentStatus(tech.technicianID);
                const currentLog = res.data?.data;
                if (currentLog && !currentLog.clockOutTime) {
                    statusMap[tech.technicianID] = {
                        isActive: true,
                        clockInTime: currentLog.clockInTime,
                        status: currentLog.status,
                        jobCardNo: currentLog.jobCardNo
                    };
                }
            } catch (err) {
                statusMap[tech.technicianID] = { isActive: false };
            }
        }
        setActiveStatusMap(statusMap);
        setCheckingStatus(false);
    };

    useEffect(() => {
        loadTechnicians();

        if (log) {
            setForm({
                timeLogID: log.timeLogID || 0,
                technicianID: log.technicianID?.toString() || "",
                jobServiceID: log.jobServiceID || "",
                jobCardID: log.jobCardID || "",
                clockInTime: log.clockInTime ? log.clockInTime.slice(0, 16) : new Date().toISOString().slice(0, 16),
                clockOutTime: log.clockOutTime ? log.clockOutTime.slice(0, 16) : "",
                breakStartTime: log.breakStartTime ? log.breakStartTime.slice(0, 16) : "",
                breakEndTime: log.breakEndTime ? log.breakEndTime.slice(0, 16) : "",
                totalBreakMinutes: log.totalBreakMinutes || 0,
                totalWorkMinutes: log.totalWorkMinutes || "",
                status: log.status || "ACTIVE",
                notes: log.notes || ""
            });
        }
    }, [log]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (error) setError("");
    };

    // ✅ Check if selected technician is active
    const isTechnicianActive = (techId) => {
        return activeStatusMap[techId]?.isActive === true;
    };

    const getTechnicianStatusLabel = (techId) => {
        const status = activeStatusMap[techId];
        if (!status?.isActive) return null;

        if (status.status === 'BREAK') {
            return ` (☕ On Break since ${new Date(status.clockInTime).toLocaleTimeString()})`;
        }
        return ` (🟢 Active since ${new Date(status.clockInTime).toLocaleTimeString()})`;
    };

    // ✅ Technician options with status indicator
    const technicianOptions = technicians.map(t => {
        const isActive = isTechnicianActive(t.technicianID);
        const statusLabel = getTechnicianStatusLabel(t.technicianID);

        return {
            value: t.technicianID?.toString(),
            label: isActive ? `🔴 ${t.fullName}${statusLabel}` : `🟢 ${t.fullName}`,
            isActive: isActive,
            technician: t
        };
    });

    // ✅ Custom format for ReactSelect
    const formatOptionLabel = (option) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {option.isActive ? (
                <FaExclamationTriangle style={{ color: '#dc3545', fontSize: '12px' }} />
            ) : (
                <FaUserClock style={{ color: '#28a745', fontSize: '12px' }} />
            )}
            <span>{option.label}</span>
        </div>
    );

    const calculateWorkMinutes = () => {
        if (form.clockInTime && form.clockOutTime) {
            const start = new Date(form.clockInTime);
            const end = new Date(form.clockOutTime);
            const totalMinutes = Math.floor((end - start) / 60000);
            return totalMinutes - (form.totalBreakMinutes || 0);
        }
        return 0;
    };

    const validateForm = () => {
        if (!form.technicianID) {
            setError("Please select a technician");
            return false;
        }

        // ✅ Check if technician is already active (for new entries only)
        if (!isEdit && isTechnicianActive(parseInt(form.technicianID))) {
            const status = activeStatusMap[parseInt(form.technicianID)];
            setError(`❌ ${technicians.find(t => t.technicianID === parseInt(form.technicianID))?.fullName} is already clocked in!\n\n⏰ Clock In Time: ${new Date(status.clockInTime).toLocaleString()}\n📋 Job: ${status.jobCardNo || 'No job assigned'}\n\nPlease clock out first before creating a new entry.`);
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);
        setError("");

        try {
            const payload = {
                technicianID: parseInt(form.technicianID),
                jobServiceID: form.jobServiceID ? parseInt(form.jobServiceID) : null,
                jobCardID: form.jobCardID ? parseInt(form.jobCardID) : null,
                clockInTime: form.clockInTime,
                clockOutTime: form.clockOutTime || null,
                breakStartTime: form.breakStartTime || null,
                breakEndTime: form.breakEndTime || null,
                totalBreakMinutes: parseInt(form.totalBreakMinutes) || 0,
                status: form.status,
                notes: form.notes || null
            };

            if (isEdit) {
                await technicianTimeLogApi.update(form.timeLogID, payload);
                showSuccess("Time log updated successfully");
            } else {
                await technicianTimeLogApi.clockIn(payload);
                showSuccess("Time log created successfully");
            }
            onSaved();
            onClose();
        } catch (err) {
            console.error("Save error:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to save time log";
            setError(errorMessage);
            showError(errorMessage);
        } finally { setLoading(false); }
    };

    const modalFooter = (
        <div className="timelog-modal-footer">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={loading}>
                {isEdit ? "Update" : "Save"} Time Log
            </Button>
        </div>
    );

    return (
        <Modal isOpen={true} onClose={onClose} title={<><FaClock /> {isEdit ? "Edit Time Log" : "Manual Time Entry"}</>} size="md" footer={modalFooter}>
            <div className="timelog-modal-container">
                {/* ✅ Warning if technician is active */}
                {form.technicianID && !isEdit && isTechnicianActive(parseInt(form.technicianID)) && (
                    <div className="warning-box">
                        <FaExclamationTriangle />
                        <div>
                            <strong>Technician is currently active!</strong>
                            <p>This technician is already clocked in. Please clock out first before creating a new entry.</p>
                        </div>
                    </div>
                )}

                <div className="form-group">
                    <label>Technician <span className="required">*</span></label>
                    <ReactSelect
                        value={technicianOptions.find(t => t.value === form.technicianID)}
                        onChange={(selected) => {
                            setForm({ ...form, technicianID: selected?.value });
                            setError("");
                        }}
                        options={technicianOptions}
                        formatOptionLabel={formatOptionLabel}
                        placeholder="Select technician..."
                        isDisabled={loading || isEdit}
                        isSearchable
                    />
                    {checkingStatus && <small className="status-loading">Checking technician status...</small>}
                </div>

                <div className="form-row-2">
                    <div className="form-group">
                        <label>Clock In Time</label>
                        <input type="datetime-local" name="clockInTime" value={form.clockInTime} onChange={handleChange} className="form-input" disabled={loading} required />
                    </div>
                    <div className="form-group">
                        <label>Clock Out Time</label>
                        <input type="datetime-local" name="clockOutTime" value={form.clockOutTime} onChange={handleChange} className="form-input" disabled={loading} />
                    </div>
                </div>

                <div className="form-row-2">
                    <div className="form-group">
                        <label>Break Start</label>
                        <input type="datetime-local" name="breakStartTime" value={form.breakStartTime} onChange={handleChange} className="form-input" disabled={loading} />
                    </div>
                    <div className="form-group">
                        <label>Break End</label>
                        <input type="datetime-local" name="breakEndTime" value={form.breakEndTime} onChange={handleChange} className="form-input" disabled={loading} />
                    </div>
                </div>

                <div className="form-row-2">
                    <div className="form-group">
                        <label>Break Minutes</label>
                        <input type="number" name="totalBreakMinutes" value={form.totalBreakMinutes} onChange={handleChange} min="0" className="form-input" disabled={loading} />
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <select name="status" value={form.status} onChange={handleChange} className="form-select" disabled={loading}>
                            <option value="ACTIVE">Active</option>
                            <option value="BREAK">On Break</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                </div>

                {form.clockInTime && form.clockOutTime && (
                    <div className="info-box">Total Work Time: <strong>{calculateWorkMinutes()} minutes</strong></div>
                )}

                <div className="form-group">
                    <label>Job Card ID</label>
                    <input type="text" name="jobCardID" value={form.jobCardID} onChange={handleChange} placeholder="Job Card ID (optional)" className="form-input" disabled={loading} />
                </div>

                <div className="form-group">
                    <label>Notes</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} rows="2" className="form-textarea" placeholder="Additional notes..." disabled={loading} />
                </div>
            </div>
        </Modal>
    );
}