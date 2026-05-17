import React, { useEffect, useState } from "react";
import inspectionApi from "../../../api/inspectionApi";
import { Modal } from "../../../components/common/Modal/Modal";
import { Button, useDialog } from "../../../components/common";
import { FaClipboardCheck, FaCheckCircle, FaTimesCircle, FaCamera, FaStickyNote } from "react-icons/fa";
import "./Inspection.css";

export default function InspectionResultForm({ inspectionId, onClose, onComplete }) {
    const [inspection, setInspection] = useState(null);
    const [items, setItems] = useState([]);
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('pending');
    const { showSuccess, showError } = useDialog();

    const loadInspection = async () => {
        setLoading(true);
        try {
            const res = await inspectionApi.getInspectionById(inspectionId);
            let data = res.data?.data || res.data;
            setInspection(data);

            const resultsMap = {};
            if (data.results) {
                data.results.forEach(r => { resultsMap[r.itemID] = r; });
            }
            setResults(resultsMap);

            if (data.templateID) {
                const itemsRes = await inspectionApi.getItemsByTemplate(data.templateID);
                let itemsData = itemsRes.data?.data || itemsRes.data || [];
                setItems(itemsData);
            }
        } catch (error) {
            console.error("Error loading inspection:", error);
            showError("Failed to load inspection data");
        } finally { setLoading(false); }
    };

    useEffect(() => {
        if (inspectionId) loadInspection();
    }, [inspectionId]);

    const handleResultChange = (itemId, field, value) => {
        setResults(prev => ({ ...prev, [itemId]: { ...prev[itemId], [field]: value } }));
    };

    const renderResultInput = (item) => {
        const result = results[item.itemID] || {};

        switch (item.itemType) {
            case 'CHECKBOX':
                return (
                    <div className="result-checkbox-group">
                        <label className={`option-btn ${result.isPass === true ? 'active-pass' : ''}`}>
                            <input type="radio" name={`item_${item.itemID}`} checked={result.isPass === true} onChange={() => handleResultChange(item.itemID, 'isPass', true)} />
                            <FaCheckCircle /> Pass
                        </label>
                        <label className={`option-btn ${result.isPass === false ? 'active-fail' : ''}`}>
                            <input type="radio" name={`item_${item.itemID}`} checked={result.isPass === false} onChange={() => handleResultChange(item.itemID, 'isPass', false)} />
                            <FaTimesCircle /> Fail
                        </label>
                    </div>
                );
            case 'YES_NO':
                return (
                    <select value={result.observedValue || ''} onChange={(e) => handleResultChange(item.itemID, 'observedValue', e.target.value)} className="form-select-sm">
                        <option value="">Select</option><option value="YES">Yes</option><option value="NO">No</option>
                    </select>
                );
            case 'NUMBER':
                return <input type="number" value={result.numericValue || ''} onChange={(e) => handleResultChange(item.itemID, 'numericValue', e.target.value)} className="form-input-sm" />;
            default:
                return <input type="text" value={result.observedValue || ''} onChange={(e) => handleResultChange(item.itemID, 'observedValue', e.target.value)} className="form-input-sm" placeholder="Enter value" />;
        }
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const resultsArray = items.map(item => ({
                itemID: item.itemID,
                observedValue: results[item.itemID]?.observedValue,
                numericValue: results[item.itemID]?.numericValue,
                isPass: results[item.itemID]?.isPass,
                remarks: results[item.itemID]?.remarks
            }));

            await inspectionApi.submitInspection(inspectionId, { status: "COMPLETED", results: resultsArray });
            showSuccess("Inspection completed successfully");
            if (onComplete) onComplete();
            onClose();
        } catch (err) {
            showError(err.response?.data?.message || "Failed to submit inspection");
        } finally { setSaving(false); }
    };

    const modalFooter = (
        <div className="inspection-modal-footer">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={saving}>Complete Inspection</Button>
        </div>
    );

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading inspection...</p>
        </div>
    );

    return (
        <Modal isOpen={true} onClose={onClose} title={<><FaClipboardCheck /> Inspection - {inspection?.inspectionNo}</>} size="lg" footer={modalFooter}>
            <div className="inspection-result-container">
                <div className="inspection-info">
                    <div className="info-item"><strong>Job Card:</strong> {inspection?.jobCardNo}</div>
                    <div className="info-item"><strong>Vehicle:</strong> {inspection?.vehicleRegNo}</div>
                    <div className="info-item"><strong>Template:</strong> {inspection?.templateName}</div>
                </div>

                <div className="result-tabs">
                    <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Items</button>
                    <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pending</button>
                    <button className={`tab-btn ${activeTab === 'critical' ? 'active' : ''}`} onClick={() => setActiveTab('critical')}>Critical</button>
                </div>

                <div className="results-list">
                    {items.filter(item => activeTab === 'all' || (activeTab === 'pending' && !results[item.itemID]?.isPass) || (activeTab === 'critical' && item.isCritical)).map(item => (
                        <div key={item.itemID} className="result-item">
                            <div className="result-header">
                                <span className="item-name">{item.itemName}{item.isCritical && <span className="critical-badge">Critical</span>}</span>
                                <span className="expected-value">Expected: {item.expectedValue || `${item.minValue || ''} ${item.unit || ''}`}</span>
                            </div>
                            <div className="result-input-wrapper">
                                {renderResultInput(item)}
                            </div>
                            <div className="result-actions">
                                {item.requiresPhoto && <Button variant="outline" size="sm" onClick={() => alert("Photo upload coming soon")} icon={<FaCamera />}>Photo</Button>}
                                {item.requiresRemarks && (
                                    <input type="text" placeholder="Remarks" className="remarks-input" value={results[item.itemID]?.remarks || ''} onChange={(e) => handleResultChange(item.itemID, 'remarks', e.target.value)} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
}