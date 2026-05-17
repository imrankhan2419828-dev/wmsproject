import React, { useEffect, useState } from "react";
import warrantyApi from "../../../api/warrantyApi";
import { Modal } from "../../../components/common/Modal/Modal";
import { Button, useDialog } from "../../../components/common";
import { FaShieldAlt, FaFileInvoice, FaUser, FaCalendarAlt, FaClock, FaDownload } from "react-icons/fa";
import "./Warranty.css";

const STATUS_CONFIG = {
    OPEN: { class: "open", label: "Open" }, SUBMITTED: { class: "submitted", label: "Submitted" },
    APPROVED: { class: "approved", label: "Approved" }, REJECTED: { class: "rejected", label: "Rejected" },
    PAID: { class: "paid", label: "Paid" }, CLOSED: { class: "closed", label: "Closed" }
};

export default function WarrantyClaimDetails({ claimId, onClose, onStatusUpdate }) {
    const [claim, setClaim] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [uploading, setUploading] = useState(false);
    const { showSuccess, showError, showConfirm } = useDialog();

    useEffect(() => { loadClaimDetails(); }, [claimId]);

    const loadClaimDetails = async () => {
        setLoading(true);
        try {
            const [claimRes, attachmentsRes, historyRes] = await Promise.all([
                warrantyApi.getById(claimId), warrantyApi.getAttachments(claimId), warrantyApi.getHistory(claimId)
            ]);
            setClaim(claimRes.data?.data || claimRes.data);
            setAttachments(attachmentsRes.data?.data || attachmentsRes.data || []);
            setHistory(historyRes.data?.data || historyRes.data || []);
        } catch (error) { showError("Failed to load claim details"); }
        finally { setLoading(false); }
    };

    const getStatusBadge = (status) => {
        const config = STATUS_CONFIG[status] || { class: "open", label: status };
        return <span className={`warranty-status-badge ${config.class}`}>{config.label}</span>;
    };

    const modalFooter = (<div className="warranty-modal-footer"><Button variant="outline" onClick={onClose}>Close</Button></div>);

    if (loading) return (<div className="loading-container"><div className="spinner"></div><p>Loading claim details...</p></div>);
    if (!claim) return null;

    return (
        <Modal isOpen={true} onClose={onClose} title={<><FaShieldAlt /> Warranty Claim - {claim.claimNo}</>} size="lg" footer={modalFooter}>
            <div className="warranty-details-container">
                <div className="details-tabs"><button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Details</button><button className={`tab-btn ${activeTab === 'attachments' ? 'active' : ''}`} onClick={() => setActiveTab('attachments')}>Attachments ({attachments.length})</button><button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>History</button></div>
                {activeTab === 'details' && (<div className="details-content"><div className="status-header">{getStatusBadge(claim.status)}<span className={`priority-badge ${claim.priority?.toLowerCase()}`}>{claim.priority}</span></div><div className="details-grid"><div className="detail-item"><span className="label">Job Card:</span><span className="value">{claim.jobCardNo}</span></div><div className="detail-item"><span className="label">Vehicle:</span><span className="value">{claim.vehicleRegNo}</span></div><div className="detail-item"><span className="label">Customer:</span><span className="value">{claim.customerName}</span></div><div className="detail-item"><span className="label">Claim Type:</span><span className="value">{claim.claimType}</span></div><div className="detail-item"><span className="label">Claim Date:</span><span className="value">{new Date(claim.claimDate).toLocaleString()}</span></div><div className="detail-item"><span className="label">Claim Amount:</span><span className="value amount">Rs. {claim.claimAmount?.toFixed(2)}</span></div>{claim.approvedAmount && (<div className="detail-item"><span className="label">Approved Amount:</span><span className="value amount">Rs. {claim.approvedAmount?.toFixed(2)}</span></div>)}</div>{claim.description && (<div className="description-section"><h4>Description</h4><p>{claim.description}</p></div>)}<div className="status-actions">{claim.status === 'OPEN' && <Button variant="primary" onClick={() => onStatusUpdate('SUBMITTED')}>Submit Claim</Button>}{claim.status === 'SUBMITTED' && (<><Button variant="success" onClick={() => { const amount = prompt("Enter approved amount:", claim.claimAmount); if (amount) onStatusUpdate('APPROVED', { approvedAmount: parseFloat(amount) }); }}>Approve</Button><Button variant="danger" onClick={() => { const reason = prompt("Enter rejection reason:"); if (reason) onStatusUpdate('REJECTED', { rejectionReason: reason }); }}>Reject</Button></>)}{claim.status === 'APPROVED' && <Button variant="primary" onClick={() => onStatusUpdate('PAID')}>Mark as Paid</Button>}{claim.status === 'PAID' && <Button variant="success" onClick={() => onStatusUpdate('CLOSED')}>Close Claim</Button>}</div></div>)}
                {activeTab === 'attachments' && (<div className="attachments-content"><div className="attachments-list">{attachments.map(a => (<div key={a.attachmentID} className="attachment-item"><div className="attachment-icon">📎</div><div className="attachment-info"><div className="attachment-name">{a.fileName}</div><div className="attachment-meta">{new Date(a.uploadedDate).toLocaleString()}</div></div><button className="download-btn"><FaDownload /></button></div>))}</div></div>)}
                {activeTab === 'history' && (<div className="history-content"><div className="timeline">{history.map(h => (<div key={h.historyID} className="timeline-item"><div className="timeline-badge">{h.statusTo === 'APPROVED' ? '✅' : h.statusTo === 'REJECTED' ? '❌' : h.statusTo === 'PAID' ? '💰' : '📝'}</div><div className="timeline-content"><div className="timeline-header"><span className="status-change">{h.statusFrom ? `${h.statusFrom} → ` : ''}{h.statusTo}</span><span className="timeline-date">{new Date(h.changedDate).toLocaleString()}</span></div>{h.notes && <div className="timeline-notes">{h.notes}</div>}</div></div>))}</div></div>)}
            </div>
        </Modal>
    );
}