import React, { useEffect, useState } from "react";
import partsRequestApi from "../../../api/partsRequestApi";
import jobCardApi from "../../../api/jobCardApi";
import itemApi from "../../../api/itemApi";
import { getSuppliers } from "../../../api/coaApi";
import { Modal } from "../../../components/common/Modal/Modal";
import { Button, ReactSelect, useDialog } from "../../../components/common";
import { FaBoxes } from "react-icons/fa";
import "./PartsRequest.css";

const URGENCY_OPTIONS = [
    { value: "NORMAL", label: "Normal" },
    { value: "URGENT", label: "Urgent" },
    { value: "CRITICAL", label: "Critical" }
];

export default function PartsRequestModal({ request, onClose, onSaved }) {
    const isEdit = !!request?.requestID;
    const [jobCards, setJobCards] = useState([]);
    const [items, setItems] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { showSuccess, showError } = useDialog();

    const [form, setForm] = useState({
        requestID: 0,
        jobCardID: "",
        itemID: "",
        quantity: "",
        requiredDate: "",
        supplierID: "",
        urgency: "NORMAL",
        notes: ""
    });

    const jobCardOptions = jobCards.map(j => ({ value: j.jobCardID?.toString(), label: `${j.jobCardNo} - ${j.vehicleRegNo}` }));
    const itemOptions = items.map(i => ({ value: i.itemID?.toString(), label: `${i.itemName} - ${i.itemCode || ''}` }));
    const supplierOptions = suppliers.map(s => ({ value: s.acctID?.toString(), label: s.acctName }));

    useEffect(() => {
        loadDropdownData();
        if (request) {
            setForm({
                requestID: request.requestID || 0,
                jobCardID: request.jobCardID?.toString() || "",
                itemID: request.itemID?.toString() || "",
                quantity: request.quantity || "",
                requiredDate: request.requiredDate ? request.requiredDate.split('T')[0] : "",
                supplierID: request.supplierID?.toString() || "",
                urgency: request.urgency || "NORMAL",
                notes: request.notes || ""
            });
        }
    }, [request]);

    const loadDropdownData = async () => {
        try {
            const [jobsRes, itemsRes, suppliersRes] = await Promise.all([
                jobCardApi.getAll(), itemApi.getAll(), getSuppliers()
            ]);
            setJobCards(jobsRes.data?.data || jobsRes.data || []);
            setItems(itemsRes.data?.data || itemsRes.data || []);
            setSuppliers(suppliersRes.data?.data || suppliersRes.data || []);
        } catch (error) { console.error("Error loading dropdown data:", error); }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (error) setError("");
    };

    const validateForm = () => {
        if (!form.jobCardID) { setError("Please select a job card"); return false; }
        if (!form.itemID) { setError("Please select an item"); return false; }
        if (!form.quantity || parseFloat(form.quantity) <= 0) { setError("Please enter valid quantity"); return false; }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);
        setError("");
        try {
            const payload = {
                jobCardID: parseInt(form.jobCardID),
                itemID: parseInt(form.itemID),
                quantity: parseFloat(form.quantity),
                requiredDate: form.requiredDate || null,
                supplierID: form.supplierID ? parseInt(form.supplierID) : null,
                urgency: form.urgency,
                notes: form.notes || null
            };

            if (isEdit) await partsRequestApi.update(form.requestID, payload);
            else await partsRequestApi.create(payload);

            showSuccess(isEdit ? "Parts request updated successfully" : "Parts request created successfully");
            onSaved();
            onClose();
        } catch (err) {
            console.error("Save error:", err);
            showError(err.response?.data?.message || "Failed to save parts request");
        } finally { setLoading(false); }
    };

    const modalFooter = (
        <div className="parts-modal-footer">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={loading}>{isEdit ? "Update" : "Create"} Request</Button>
        </div>
    );

    return (
        <Modal isOpen={true} onClose={onClose} title={<><FaBoxes /> {isEdit ? "Edit Parts Request" : "New Parts Request"}</>} size="md" footer={modalFooter}>
            <div className="parts-modal-container">
                <div className="form-group">
                    <label>Job Card <span className="required">*</span></label>
                    <ReactSelect value={jobCardOptions.find(j => j.value === form.jobCardID)} onChange={(selected) => setForm({ ...form, jobCardID: selected?.value })} options={jobCardOptions} placeholder="Select job card..." isDisabled={loading || isEdit} />
                </div>

                <div className="form-group">
                    <label>Item <span className="required">*</span></label>
                    <ReactSelect value={itemOptions.find(i => i.value === form.itemID)} onChange={(selected) => setForm({ ...form, itemID: selected?.value })} options={itemOptions} placeholder="Select item..." isDisabled={loading} />
                </div>

                <div className="form-row-2">
                    <div className="form-group"><label>Quantity <span className="required">*</span></label><input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="0.01" step="0.01" className="form-input" disabled={loading} /></div>
                    <div className="form-group"><label>Required Date</label><input type="date" name="requiredDate" value={form.requiredDate} onChange={handleChange} className="form-input" disabled={loading} /></div>
                </div>

                <div className="form-row-2">
                    <div className="form-group"><label>Supplier</label><ReactSelect value={supplierOptions.find(s => s.value === form.supplierID)} onChange={(selected) => setForm({ ...form, supplierID: selected?.value })} options={supplierOptions} placeholder="Select supplier..." isClearable isDisabled={loading} /></div>
                    <div className="form-group"><label>Urgency</label><ReactSelect value={URGENCY_OPTIONS.find(u => u.value === form.urgency)} onChange={(selected) => setForm({ ...form, urgency: selected?.value })} options={URGENCY_OPTIONS} placeholder="Select urgency..." isDisabled={loading} /></div>
                </div>

                <div className="form-group"><label>Notes</label><textarea name="notes" value={form.notes} onChange={handleChange} rows="2" className="form-textarea" placeholder="Additional notes..." disabled={loading} /></div>
            </div>
        </Modal>
    );
}