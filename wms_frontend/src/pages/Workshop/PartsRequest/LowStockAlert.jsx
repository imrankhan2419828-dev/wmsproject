import React, { useEffect, useState } from "react";
import partsRequestApi from "../../../api/partsRequestApi";
import { Modal } from "../../../components/common/Modal/Modal";
import { Button, ReactSelect, useDialog } from "../../../components/common";
import { FaExclamationTriangle, FaBoxes } from "react-icons/fa";
import "./PartsRequest.css";

const STOCK_STATUS_OPTIONS = [
    { value: "", label: "All" },
    { value: "CRITICAL", label: "Critical" },
    { value: "LOW", label: "Low" }
];

export default function LowStockAlert({ onClose, onCreateRequest }) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("");
    const { showError } = useDialog();

    const loadAlerts = async () => {
        setLoading(true);
        try {
            const res = await partsRequestApi.getLowStockAlerts(filter);
            console.log("Low stock alerts response:", res);

            let alertsData = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                alertsData = res.data.data;
            } else if (Array.isArray(res.data)) {
                alertsData = res.data;
            }
            setAlerts(alertsData);
        } catch (error) {
            console.error("Error loading low stock alerts:", error);
            const errorMsg = error.response?.data?.message || error.message || "Failed to load alerts";
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAlerts();
    }, [filter]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'CRITICAL': return '#dc3545';
            case 'LOW': return '#ffc107';
            default: return '#28a745';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'CRITICAL': return 'Critical';
            case 'LOW': return 'Low';
            default: return 'Normal';
        }
    };

    const modalFooter = (
        <div className="alert-modal-footer">
            <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
    );

    return (
        <Modal isOpen={true} onClose={onClose} title={<><FaExclamationTriangle /> Low Stock Alerts</>} size="lg" footer={modalFooter}>
            <div className="alert-modal-container">
                <div className="alert-filters">
                    <ReactSelect
                        value={STOCK_STATUS_OPTIONS.find(s => s.value === filter)}
                        onChange={(selected) => setFilter(selected?.value || "")}
                        options={STOCK_STATUS_OPTIONS}
                        placeholder="Filter by status..."
                        isClearable
                    />
                </div>

                {loading ? (
                    <div className="loading-container"><div className="spinner"></div><p>Loading alerts...</p></div>
                ) : (
                    <div className="alert-list">
                        {alerts.length > 0 ? (
                            alerts.map(alert => (
                                <div key={alert.itemID} className="alert-item" style={{ borderLeftColor: getStatusColor(alert.stockStatus) }}>
                                    <div className="alert-header">
                                        <h4><FaBoxes /> {alert.itemName}</h4>
                                        <span className="alert-status" style={{ backgroundColor: getStatusColor(alert.stockStatus) }}>
                                            {getStatusText(alert.stockStatus)}
                                        </span>
                                    </div>
                                    <div className="alert-details">
                                        <div className="alert-row"><span className="label">Company:</span><span>{alert.companyName || 'N/A'}</span></div>
                                        <div className="alert-row"><span className="label">Category:</span><span>{alert.categoryName || 'N/A'}</span></div>
                                        <div className="alert-row"><span className="label">Current Stock:</span><span className="stock-value">{alert.currentStock}</span></div>
                                        <div className="alert-row"><span className="label">Pending Requests:</span><span>{alert.pendingRequests || 0}</span></div>
                                        {alert.earliestRequiredDate && (
                                            <div className="alert-row"><span className="label">Earliest Required:</span><span>{new Date(alert.earliestRequiredDate).toLocaleDateString()}</span></div>
                                        )}
                                        <div className="alert-row"><span className="label">Purchase Rate:</span><span>Rs. {alert.purchaseRate?.toFixed(2) || '0.00'}</span></div>
                                    </div>
                                    <div className="alert-actions">
                                        <Button variant="primary" size="sm" onClick={() => onCreateRequest(alert)} icon={<FaBoxes />}>Create Request</Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">No low stock alerts found</div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}