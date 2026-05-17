import React, { useEffect, useState } from "react";
import departmentApi from "../../../api/departmentApi";
import { Modal } from "../../../components/common/Modal/Modal";
import { Button, ReactSelect, useDialog } from "../../../components/common";
import { FaExchangeAlt } from "react-icons/fa";
import "./Departments.css";

export default function JobDepartmentTransfer({ departmentId, departmentName, onClose, onSaved }) {
    const [departments, setDepartments] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState("");
    const [selectedTargetDept, setSelectedTargetDept] = useState("");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { showSuccess, showError } = useDialog();

    useEffect(() => { loadData(); }, [departmentId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [deptsRes, jobsRes] = await Promise.all([departmentApi.getAll(true), departmentApi.getJobsByDepartment(departmentId, 'ACTIVE')]);
            let allDepts = deptsRes.data?.data || deptsRes.data || [];
            setDepartments(allDepts.filter(d => d.departmentID !== departmentId));
            setJobs(jobsRes.data?.data || jobsRes.data || []);
        } catch (error) { setError("Failed to load data"); }
        finally { setLoading(false); }
    };

    const handleSubmit = async () => {
        if (!selectedJob) { setError("Please select a job"); return; }
        if (!selectedTargetDept) { setError("Please select target department"); return; }
        setLoading(true); setError("");
        try {
            await departmentApi.createTransfer({ jobCardID: parseInt(selectedJob), toDepartmentID: parseInt(selectedTargetDept), reason });
            showSuccess("Job transferred successfully");
            onSaved(); onClose();
        } catch (err) { showError(err.response?.data?.message || "Failed to transfer job"); }
        finally { setLoading(false); }
    };

    const jobOptions = jobs.map(j => ({ value: j.jobCardID?.toString(), label: `${j.jobCardNo} - ${j.vehicleRegNo}` }));
    const deptOptions = departments.map(d => ({ value: d.departmentID?.toString(), label: d.departmentName }));

    const modalFooter = (<div className="dept-modal-footer"><Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button><Button variant="primary" onClick={handleSubmit} loading={loading || jobs.length === 0}>Transfer Job</Button></div>);

    return (
        <Modal isOpen={true} onClose={onClose} title={<><FaExchangeAlt /> Transfer Job from {departmentName}</>} size="md" footer={modalFooter}>
            <div className="dept-modal-container">
                <div className="form-group"><label>Select Job <span className="required">*</span></label><ReactSelect value={jobOptions.find(j => j.value === selectedJob)} onChange={(selected) => setSelectedJob(selected?.value)} options={jobOptions} placeholder="Choose job..." isDisabled={loading} /></div>
                <div className="form-group"><label>Target Department <span className="required">*</span></label><ReactSelect value={deptOptions.find(d => d.value === selectedTargetDept)} onChange={(selected) => setSelectedTargetDept(selected?.value)} options={deptOptions} placeholder="Choose department..." isDisabled={loading} /></div>
                <div className="form-group"><label>Reason for Transfer</label><textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="3" className="form-textarea" placeholder="Why is this job being transferred?" disabled={loading} /></div>
            </div>
        </Modal>
    );
}