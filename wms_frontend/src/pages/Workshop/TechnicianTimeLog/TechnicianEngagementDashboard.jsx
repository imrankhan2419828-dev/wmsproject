import React, { useState, useEffect } from 'react';
import technicianTimeLogApi from '../../../api/technicianTimeLogApi';
import { FaUser, FaUserClock, FaClock, FaBriefcase, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { Button, useDialog } from '../../../components/common';
import './TechnicianEngagementDashboard.css';

export default function TechnicianEngagementDashboard() {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // all, engaged, free
    const { showError } = useDialog();

    const loadEngagementStatus = async () => {
        setLoading(true);
        try {
            const res = await technicianTimeLogApi.getEngagementStatus();
            let data = res.data?.data || res.data || [];
            setTechnicians(data);
        } catch (error) {
            console.error('Error loading engagement status:', error);
            showError('Failed to load technician status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEngagementStatus();
        // Refresh every 30 seconds
        const interval = setInterval(loadEngagementStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const filteredTechnicians = technicians.filter(t => {
        if (filter === 'engaged') return t.isEngaged;
        if (filter === 'free') return !t.isEngaged;
        return true;
    });

    const engagedCount = technicians.filter(t => t.isEngaged).length;
    const freeCount = technicians.filter(t => !t.isEngaged).length;

    return (
        <div className="engagement-dashboard">
            <div className="engagement-stats">
                <div className="stat-card engaged">
                    <FaBriefcase />
                    <div>
                        <span className="stat-value">{engagedCount}</span>
                        <span className="stat-label">Engaged</span>
                    </div>
                </div>
                <div className="stat-card free">
                    <FaUserClock />
                    <div>
                        <span className="stat-value">{freeCount}</span>
                        <span className="stat-label">Free</span>
                    </div>
                </div>
                <div className="stat-card total">
                    <FaUser />
                    <div>
                        <span className="stat-value">{technicians.length}</span>
                        <span className="stat-label">Total</span>
                    </div>
                </div>
            </div>

            <div className="engagement-filters">
                <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                <button className={`filter-btn ${filter === 'engaged' ? 'active' : ''}`} onClick={() => setFilter('engaged')}>Engaged ({engagedCount})</button>
                <button className={`filter-btn ${filter === 'free' ? 'active' : ''}`} onClick={() => setFilter('free')}>Free ({freeCount})</button>
                <button className="refresh-btn" onClick={loadEngagementStatus}>⟳ Refresh</button>
            </div>

            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : (
                <div className="technician-grid">
                    {filteredTechnicians.map(tech => (
                        <div key={tech.technicianID} className={`technician-card ${tech.isEngaged ? 'engaged' : 'free'}`}>
                            <div className="technician-header">
                                <div className="technician-avatar">
                                    {tech.isEngaged ? <FaExclamationTriangle /> : <FaCheckCircle />}
                                </div>
                                <div className="technician-info">
                                    <h4>{tech.technicianName}</h4>
                                    <span className="employee-code">{tech.employeeCode || 'No Code'}</span>
                                </div>
                                <div className={`status-badge ${tech.isEngaged ? 'engaged' : 'free'}`}>
                                    {tech.isEngaged ? 'ENGAGED' : 'FREE'}
                                </div>
                            </div>
                            <div className="technician-details">
                                <div className="detail-row">
                                    <span>Specialization:</span>
                                    <strong>{tech.specialization || 'General'}</strong>
                                </div>
                                {tech.isEngaged && (
                                    <>
                                        <div className="detail-row engaged-info">
                                            <span>Engaged Since:</span>
                                            <strong>{new Date(tech.engagedSince).toLocaleTimeString()}</strong>
                                        </div>
                                        <div className="detail-row engaged-info">
                                            <span>Current Job:</span>
                                            <strong>{tech.currentJobCardNo || 'No Job'}</strong>
                                        </div>
                                        <div className="detail-row engaged-info">
                                            <span>Status:</span>
                                            <strong>{tech.currentStatus === 'BREAK' ? 'On Break' : 'Working'}</strong>
                                        </div>
                                    </>
                                )}
                                {!tech.isEngaged && (
                                    <div className="detail-row free-info">
                                        <span>Today Hours:</span>
                                        <strong>{tech.todayHours}h</strong>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}