import React, { useEffect, useState } from "react";
import technicianTimeLogApi from "../../../api/technicianTimeLogApi";
import { FaUsers, FaUserCheck, FaExclamationTriangle, FaUserClock } from "react-icons/fa";
import "./TechnicianTimeLog.css";

export default function TechnicianWorkloadDashboard({ date }) {
    const [workloads, setWorkloads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState({
        totalTechnicians: 0,
        activeTechnicians: 0,
        overloaded: 0,
        available: 0
    });

    const loadWorkload = async () => {
        setLoading(true);
        try {
            const res = await technicianTimeLogApi.getWorkload(date);
            let data = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                data = res.data.data;
            } else if (Array.isArray(res.data)) {
                data = res.data;
            }
            setWorkloads(data);
            setSummary({
                totalTechnicians: data.length,
                activeTechnicians: data.filter(w => w.todayMinutes > 0).length,
                overloaded: data.filter(w => w.workloadStatus === 'OVERLOADED').length,
                available: data.filter(w => w.workloadStatus === 'AVAILABLE').length
            });
        } catch (error) {
            console.error("Error loading workload:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWorkload();
    }, [date]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'AVAILABLE': return 'available';
            case 'NEAR_CAPACITY': return 'near';
            case 'OVERLOADED': return 'overloaded';
            default: return '';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'AVAILABLE': return 'Available';
            case 'NEAR_CAPACITY': return 'Near Capacity';
            case 'OVERLOADED': return 'Overloaded';
            default: return status;
        }
    };

    return (
        <div className="workload-dashboard-container">
            <div className="workload-summary-grid">
                <div className="summary-card total">
                    <FaUsers className="summary-icon" />
                    <div className="summary-info">
                        <div className="summary-value">{summary.totalTechnicians}</div>
                        <div className="summary-label">Total Technicians</div>
                    </div>
                </div>
                <div className="summary-card active">
                    <FaUserCheck className="summary-icon" />
                    <div className="summary-info">
                        <div className="summary-value">{summary.activeTechnicians}</div>
                        <div className="summary-label">Active Today</div>
                    </div>
                </div>
                <div className="summary-card overloaded">
                    <FaExclamationTriangle className="summary-icon" />
                    <div className="summary-info">
                        <div className="summary-value">{summary.overloaded}</div>
                        <div className="summary-label">Overloaded</div>
                    </div>
                </div>
                <div className="summary-card available">
                    <FaUserClock className="summary-icon" />
                    <div className="summary-info">
                        <div className="summary-value">{summary.available}</div>
                        <div className="summary-label">Available</div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-container"><div className="spinner"></div><p>Loading workload...</p></div>
            ) : (
                <div className="workload-cards-grid">
                    {workloads.length > 0 ? (
                        workloads.map(w => (
                            <div key={w.technicianID} className={`workload-card ${getStatusClass(w.workloadStatus)}`}>
                                <div className="workload-card-header">
                                    <h4>{w.technicianName}</h4>
                                    <span className={`workload-badge ${getStatusClass(w.workloadStatus)}`}>
                                        {getStatusText(w.workloadStatus)}
                                    </span>
                                </div>
                                <div className="workload-card-body">
                                    <div className="workload-stat"><span>Services:</span><strong>{w.assignedServices}</strong></div>
                                    <div className="workload-stat"><span>Jobs:</span><strong>{w.assignedJobs}</strong></div>
                                    <div className="workload-stat"><span>Hours Today:</span><strong>{w.todayHours}h</strong></div>
                                    <div className="workload-stat"><span>Value:</span><strong>Rs. {w.totalValue?.toFixed(2)}</strong></div>
                                    <div className="capacity-bar">
                                        <div className="capacity-fill" style={{ width: `${(w.assignedServices / w.dailyCapacity) * 100}%` }} />
                                        <span className="capacity-text">{w.assignedServices}/{w.dailyCapacity}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-data">No workload data available</div>
                    )}
                </div>
            )}
        </div>
    );
}