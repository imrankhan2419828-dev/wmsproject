import React, { useEffect, useState } from "react";
import inspectionApi from "../../../api/inspectionApi";
import jobCardApi from "../../../api/jobCardApi";
import JobInspectionModal from "./JobInspectionModal";
import InspectionResultForm from "./InspectionResultForm";
import { FaClipboardCheck, FaPlus, FaEye, FaEdit, FaPlay, FaTrash } from "react-icons/fa";
import { Button, useDialog } from "../../../components/common";
import { PageHeader, EmptyState } from "../../../components/features";
import { ReactSelect } from "../../../components/common";
import "./Inspection.css";

const STATUS_CONFIG = {
    PENDING: { class: "pending", label: "Pending" },
    IN_PROGRESS: { class: "in-progress", label: "In Progress" },
    COMPLETED: { class: "completed", label: "Completed" },
    PASSED: { class: "passed", label: "Passed" },
    FAILED: { class: "failed", label: "Failed" }
};

export default function JobInspectionPage() {
    const [inspections, setInspections] = useState([]);
    const [jobCards, setJobCards] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedInspection, setSelectedInspection] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showConfirm, showSuccess, showError } = useDialog();

    const loadInspections = async () => {
        if (!selectedJob) return;
        setLoading(true);
        try {
            const res = await inspectionApi.getInspectionsByJob(selectedJob);
            let data = res.data?.data || res.data || [];
            setInspections(data);
        } catch (error) {
            showError(error.response?.data?.message || "Failed to load inspections");
        } finally {
            setLoading(false);
        }
    };

    const loadJobCards = async () => {
        try {
            const res = await jobCardApi.getAll();
            let data = res.data?.data || res.data || [];
            setJobCards(data);
        } catch (error) {
            console.error("Error loading job cards:", error);
        }
    };

    useEffect(() => { loadJobCards(); }, []);
    useEffect(() => { if (selectedJob) loadInspections(); }, [selectedJob]);

    const handleAdd = () => {
        if (!selectedJob) {
            showError("Please select a job card first");
            return;
        }
        setSelectedInspection(null);
        setShowModal(true);
    };

    const handleViewResults = (inspection) => {
        setSelectedInspection(inspection);
        setShowResults(true);
    };

    const handleContinue = (inspection) => {
        setSelectedInspection(inspection);
        setShowModal(true);
    };

    const handleStart = async (id) => {
        try {
            await inspectionApi.startInspection(id);
            showSuccess("Inspection started");
            loadInspections();
        } catch (error) {
            showError(error.response?.data?.message || "Failed to start inspection");
        }
    };

    const handleDelete = async (id) => {
        showConfirm("Delete this inspection?", async () => {
            try {
                await inspectionApi.deleteInspection(id);
                showSuccess("Inspection deleted");
                loadInspections();
            } catch (error) {
                showError(error.response?.data?.message || "Failed to delete inspection");
            }
        }, "Delete Inspection");
    };

    const getStatusBadge = (status) => {
        const config = STATUS_CONFIG[status] || { class: "pending", label: status };
        return <span className={`inspection-status-badge ${config.class}`}>{config.label}</span>;
    };

    const jobCardOptions = jobCards.map(j => ({ value: j.jobCardID?.toString(), label: `${j.jobCardNo} - ${j.vehicleRegNo} (${j.customerName})` }));

    const stats = {
        total: inspections.length,
        pending: inspections.filter(i => i.status === 'PENDING').length,
        inProgress: inspections.filter(i => i.status === 'IN_PROGRESS').length,
        completed: inspections.filter(i => i.status === 'COMPLETED').length
    };

    return (
        <div className="job-inspection-page-premium">
            <PageHeader title="Job Inspections" icon={<FaClipboardCheck />} addButtonText="New Inspection" onAdd={handleAdd} />

            <div className="job-selector-wrapper">
                <label>Select Job Card</label>
                <ReactSelect
                    value={jobCardOptions.find(j => j.value === selectedJob)}
                    onChange={(selected) => setSelectedJob(selected?.value)}
                    options={jobCardOptions}
                    placeholder="Select a job card..."
                    isClearable
                />
            </div>

            {selectedJob && (
                <>
                    <div className="inspection-summary-grid">
                        <div className="summary-card total"><span>{stats.total}</span><label>Total Inspections</label></div>
                        <div className="summary-card pending"><span>{stats.pending}</span><label>Pending</label></div>
                        <div className="summary-card progress"><span>{stats.inProgress}</span><label>In Progress</label></div>
                        <div className="summary-card completed"><span>{stats.completed}</span><label>Completed</label></div>
                    </div>

                    {loading ? (
                        <div className="loading-container"><div className="spinner"></div><p>Loading inspections...</p></div>
                    ) : (
                        <div className="inspection-cards-grid">
                            {inspections.length > 0 ? (
                                inspections.map(insp => (
                                    <div key={insp.inspectionID} className="inspection-result-card">
                                        <div className="card-header">
                                            <div className="header-info">
                                                <h4>{insp.inspectionNo}</h4>
                                                <span className="template-name">{insp.templateName}</span>
                                            </div>
                                            {getStatusBadge(insp.status)}
                                        </div>
                                        <div className="card-stats">
                                            <span className="pass">✅ {insp.passCount || 0}</span>
                                            <span className="fail">❌ {insp.failCount || 0}</span>
                                            <span className="pending">⏳ {insp.pendingCount || 0}</span>
                                        </div>
                                        <div className="card-footer">
                                            <Button variant="outline" size="sm" onClick={() => handleViewResults(insp)} icon={<FaEye />}>View</Button>
                                            {insp.status === 'PENDING' && <Button variant="success" size="sm" onClick={() => handleStart(insp.inspectionID)} icon={<FaPlay />}>Start</Button>}
                                            {(insp.status === 'PENDING' || insp.status === 'IN_PROGRESS') && <Button variant="primary" size="sm" onClick={() => handleContinue(insp)} icon={<FaEdit />}>Continue</Button>}
                                            {insp.status === 'PENDING' && <Button variant="danger" size="sm" onClick={() => handleDelete(insp.inspectionID)} icon={<FaTrash />}>Delete</Button>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState icon={<FaClipboardCheck />} title="No inspections found" description="Create a new inspection for this job card" action={<Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>New Inspection</Button>} />
                            )}
                        </div>
                    )}
                </>
            )}

            {showModal && selectedJob && (
                <JobInspectionModal
                    inspection={selectedInspection}
                    jobCardId={selectedJob}
                    onClose={() => { setShowModal(false); setSelectedInspection(null); }}
                    onSaved={() => { loadInspections(); setShowModal(false); setSelectedInspection(null); }}
                />
            )}

            {showResults && selectedInspection && (
                <InspectionResultForm
                    inspectionId={selectedInspection.inspectionID}
                    onClose={() => { setShowResults(false); setSelectedInspection(null); }}
                    onComplete={() => { loadInspections(); setShowResults(false); setSelectedInspection(null); }}
                />
            )}
        </div>
    );
}