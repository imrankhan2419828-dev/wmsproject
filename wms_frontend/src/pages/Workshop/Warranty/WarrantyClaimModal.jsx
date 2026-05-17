import React, { useEffect, useState } from "react";
import warrantyApi from "../../../api/warrantyApi";
import jobCardApi from "../../../api/jobCardApi";
import { getSuppliers } from "../../../api/coaApi";
import itemApi from "../../../api/itemApi";
import { Modal } from "../../../components/common/Modal/Modal";
import { Button, ReactSelect, useDialog } from "../../../components/common";
import { FaShieldAlt } from "react-icons/fa";
import "./Warranty.css";

const CLAIM_TYPES = [{ value: 'LABOUR', label: 'Labour' }, { value: 'PARTS', label: 'Parts' }, { value: 'BOTH', label: 'Both' }];
const PRIORITIES = [{ value: 'NORMAL', label: 'Normal' }, { value: 'HIGH', label: 'High' }, { value: 'URGENT', label: 'Urgent' }];

export default function WarrantyClaimModal({ claim, onClose, onSaved }) {
    const isEdit = !!claim?.claimID;
    const [jobCards, setJobCards] = useState([]);
    const [jobServices, setJobServices] = useState([]);
    const [jobParts, setJobParts] = useState([]);
    const [items, setItems] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError } = useDialog();

    const [form, setForm] = useState({
        claimID: 0, jobCardID: "", claimType: "PARTS", jobServiceID: "", jobPartID: "",
        itemID: "", supplierID: "", claimAmount: "", description: "", priority: "NORMAL"
    });

    const jobCardOptions = jobCards.map(j => ({ value: j.jobCardID?.toString(), label: `${j.jobCardNo} - ${j.vehicleRegNo}` }));
    const supplierOptions = suppliers.map(s => ({ value: s.acctID?.toString(), label: s.acctName }));
    const itemOptions = items.map(i => ({ value: i.itemID?.toString(), label: i.itemName }));

    useEffect(() => {
        loadInitialData();
        if (claim) {
            setForm({
                claimID: claim.claimID || 0, jobCardID: claim.jobCardID?.toString() || "", claimType: claim.claimType || "PARTS",
                jobServiceID: claim.jobServiceID || "", jobPartID: claim.jobPartID || "", itemID: claim.itemID || "",
                supplierID: claim.supplierID || "", claimAmount: claim.claimAmount || "", description: claim.description || "",
                priority: claim.priority || "NORMAL"
            });
            if (claim.jobCardID) loadJobDetails(claim.jobCardID);
        }
    }, [claim]);

    const loadInitialData = async () => {
        try {
            const [jobsRes, suppliersRes] = await Promise.all([jobCardApi.getAll(), getSuppliers()]);
            setJobCards(jobsRes.data?.data || jobsRes.data || []);
            setSuppliers(suppliersRes.data?.data || suppliersRes.data || []);
            const itemsRes = await itemApi.getAll();
            setItems(itemsRes.data?.data || itemsRes.data || []);
        } catch (error) { console.error("Error loading data:", error); }
    };

    const loadJobDetails = async (jobId) => {
        try {
            const res = await jobCardApi.getById(jobId);
            let data = res.data?.data || res.data;
            if (data) {
                setSelectedJob(data);
                setJobServices(data.services || []);
                setJobParts(data.parts || []);
                const itemsList = (data.parts || []).map(p => ({ itemID: p.itemID, itemName: p.itemName }));
                setItems(prev => [...prev, ...itemsList.filter(i => !prev.find(p => p.itemID === i.itemID))]);
            }
        } catch (error) { console.error("Error loading job details:", error); }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (name === 'jobCardID' && value) loadJobDetails(value);
    };

    const handleSubmit = async () => {
        if (!form.jobCardID) { showError("Please select a job card"); return; }
        if (!form.claimAmount || parseFloat(form.claimAmount) <= 0) { showError("Please enter valid claim amount"); return; }
        setLoading(true);
        try {
            const payload = {
                jobCardID: parseInt(form.jobCardID), claimType: form.claimType,
                jobServiceID: form.jobServiceID ? parseInt(form.jobServiceID) : null,
                jobPartID: form.jobPartID ? parseInt(form.jobPartID) : null,
                itemID: form.itemID ? parseInt(form.itemID) : null,
                supplierID: form.supplierID ? parseInt(form.supplierID) : null,
                claimAmount: parseFloat(form.claimAmount), description: form.description, priority: form.priority
            };
            if (isEdit) await warrantyApi.update(form.claimID, payload);
            else await warrantyApi.create(payload);
            showSuccess(isEdit ? "Claim updated" : "Claim created");
            onSaved(); onClose();
        } catch (err) { showError(err.response?.data?.message || "Failed to save claim"); }
        finally { setLoading(false); }
    };

    const modalFooter = (<div className="warranty-modal-footer"><Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button><Button variant="primary" onClick={handleSubmit} loading={loading}>{isEdit ? "Update" : "Create"} Claim</Button></div>);

    return (
        <Modal isOpen={true} onClose={onClose} title={<><FaShieldAlt /> {isEdit ? "Edit Warranty Claim" : "New Warranty Claim"}</>} size="md" footer={modalFooter}>
            <div className="warranty-modal-container">
                <div className="form-group"><label>Job Card <span className="required">*</span></label><ReactSelect value={jobCardOptions.find(j => j.value === form.jobCardID)} onChange={(selected) => handleChange({ target: { name: 'jobCardID', value: selected?.value } })} options={jobCardOptions} placeholder="Select job card..." isDisabled={loading || isEdit} /></div>
                <div className="form-row-2"><div className="form-group"><label>Claim Type</label><ReactSelect value={CLAIM_TYPES.find(t => t.value === form.claimType)} onChange={(selected) => setForm({ ...form, claimType: selected?.value })} options={CLAIM_TYPES} isDisabled={loading} /></div><div className="form-group"><label>Priority</label><ReactSelect value={PRIORITIES.find(p => p.value === form.priority)} onChange={(selected) => setForm({ ...form, priority: selected?.value })} options={PRIORITIES} isDisabled={loading} /></div></div>
                {form.claimType !== 'LABOUR' && (<><div className="form-group"><label>Item (Part)</label><ReactSelect value={itemOptions.find(i => i.value === form.itemID)} onChange={(selected) => setForm({ ...form, itemID: selected?.value })} options={itemOptions} placeholder="Select item..." isClearable isDisabled={loading} /></div><div className="form-group"><label>Supplier</label><ReactSelect value={supplierOptions.find(s => s.value === form.supplierID)} onChange={(selected) => setForm({ ...form, supplierID: selected?.value })} options={supplierOptions} placeholder="Select supplier..." isClearable isDisabled={loading} /></div></>)}
                <div className="form-group"><label>Claim Amount <span className="required">*</span></label><input type="number" name="claimAmount" value={form.claimAmount} onChange={handleChange} min="0.01" step="0.01" className="form-input" disabled={loading} /></div>
                <div className="form-group"><label>Description</label><textarea name="description" value={form.description} onChange={handleChange} rows="3" className="form-textarea" placeholder="Describe the issue..." disabled={loading} /></div>
                {selectedJob && (<div className="job-summary"><h4>Job Summary</h4><p><strong>Vehicle:</strong> {selectedJob.vehicleRegNo}</p><p><strong>Customer:</strong> {selectedJob.customerName}</p><p><strong>Completed:</strong> {selectedJob.completedDate ? new Date(selectedJob.completedDate).toLocaleDateString() : 'Not completed'}</p></div>)}
            </div>
        </Modal>
    );
}