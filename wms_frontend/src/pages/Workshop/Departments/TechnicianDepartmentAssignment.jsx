import React, { useEffect, useState } from "react";
import departmentApi from "../../../api/departmentApi";
import technicianApi from "../../../api/technicianApi";
import { Modal } from "../../../components/common/Modal/Modal";
import { Button, ReactSelect, useDialog } from "../../../components/common";
import { FaUserPlus } from "react-icons/fa";
import "./Departments.css";

export default function TechnicianDepartmentAssignment({ departmentId, departmentName, onClose, onSaved }) {
    const [technicians, setTechnicians] = useState([]);
    const [assignedTechnicians, setAssignedTechnicians] = useState([]);
    const [selectedTechnician, setSelectedTechnician] = useState("");
    const [isPrimary, setIsPrimary] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { showSuccess, showError } = useDialog();

    useEffect(() => { loadData(); }, [departmentId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [allTechRes, assignedRes] = await Promise.all([technicianApi.getAll(), departmentApi.getDepartmentTechnicians(departmentId)]);
            setTechnicians(allTechRes.data?.data || allTechRes.data || []);
            setAssignedTechnicians(assignedRes.data?.data || assignedRes.data || []);
        } catch (error) { setError("Failed to load data"); }
        finally { setLoading(false); }
    };

    const availableTechnicians = technicians.filter(t => !assignedTechnicians.some(a => a.technicianID === t.technicianID));
    const techOptions = availableTechnicians.map(t => ({ value: t.technicianID?.toString(), label: `${t.fullName} - ${t.specialization || 'No specialization'}` }));

    const handleSubmit = async () => {
        if (!selectedTechnician) { setError("Please select a technician"); return; }
        setLoading(true); setError("");
        try {
            await departmentApi.assignTechnicianToDepartment({ technicianID: parseInt(selectedTechnician), departmentID: departmentId, isPrimary });
            showSuccess("Technician assigned successfully");
            onSaved(); onClose();
        } catch (err) { showError(err.response?.data?.message || "Failed to assign technician"); }
        finally { setLoading(false); }
    };

    const modalFooter = (<div className="dept-modal-footer"><Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button><Button variant="primary" onClick={handleSubmit} loading={loading || availableTechnicians.length === 0}>Assign Technician</Button></div>);

    return (
        <Modal isOpen={true} onClose={onClose} title={<><FaUserPlus /> Assign Technician to {departmentName}</>} size="md" footer={modalFooter}>
            <div className="dept-modal-container">
                <div className="form-group"><label>Select Technician <span className="required">*</span></label><ReactSelect value={techOptions.find(t => t.value === selectedTechnician)} onChange={(selected) => setSelectedTechnician(selected?.value)} options={techOptions} placeholder="Choose technician..." isDisabled={loading} /></div>
                <div className="checkbox-group"><label><input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} disabled={loading} /> Set as Primary Department</label></div>
            </div>
        </Modal>
    );
}