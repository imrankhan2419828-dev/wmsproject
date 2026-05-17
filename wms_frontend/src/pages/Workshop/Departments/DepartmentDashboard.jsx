import React, { useEffect, useState } from "react";
import departmentApi from "../../../api/departmentApi";
import { Link } from "react-router-dom";
import { FaBuilding, FaUsers, FaBriefcase, FaChartLine, FaCalendarAlt, FaArrowRight, FaCheckCircle, FaClock, FaUserCheck } from "react-icons/fa";
import { Button, useDialog } from "../../../components/common";
import { PageHeader, EmptyState } from "../../../components/features";
import "./Departments.css";

export default function DepartmentDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0]
    });
    const { showError } = useDialog();

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const [dashRes, summaryRes] = await Promise.all([
                departmentApi.getDashboard(),
                departmentApi.getSummary(dateRange.fromDate, dateRange.toDate)
            ]);
            setDashboard(dashRes.data?.data || dashRes.data);
            setSummary(summaryRes.data?.data || summaryRes.data || []);
        } catch (error) {
            console.error("Error loading dashboard:", error);
            showError("Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadDashboard(); }, [dateRange.fromDate, dateRange.toDate]);

    if (loading) {
        return (
            <div className="ds-loading-container">
                <div className="ds-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="ds-page-container">
            <PageHeader title="Department Dashboard" icon={<FaChartLine />} subtitle="Track department performance and metrics" />

            {/* KPI Cards */}
            {dashboard && (
                <div className="ds-stats-grid">
                    <div className="ds-kpi-card">
                        <div className="ds-kpi-icon ds-kpi-blue"><FaBuilding /></div>
                        <div className="ds-kpi-info">
                            <span className="ds-kpi-value">{dashboard.totalDepartments || 0}</span>
                            <span className="ds-kpi-label">Total Departments</span>
                        </div>
                    </div>
                    <div className="ds-kpi-card">
                        <div className="ds-kpi-icon ds-kpi-orange"><FaBriefcase /></div>
                        <div className="ds-kpi-info">
                            <span className="ds-kpi-value">{dashboard.activeJobs || 0}</span>
                            <span className="ds-kpi-label">Active Jobs</span>
                        </div>
                    </div>
                    <div className="ds-kpi-card">
                        <div className="ds-kpi-icon ds-kpi-green"><FaUsers /></div>
                        <div className="ds-kpi-info">
                            <span className="ds-kpi-value">{dashboard.availableTechnicians || 0}</span>
                            <span className="ds-kpi-label">Available Techs</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Date Filter */}
            <div className="ds-filter-bar">
                <div className="ds-date-range">
                    <div className="ds-date-field">
                        <FaCalendarAlt className="ds-field-icon" />
                        <input type="date" value={dateRange.fromDate} onChange={(e) => setDateRange(prev => ({ ...prev, fromDate: e.target.value }))} className="ds-date-input" />
                    </div>
                    <span className="ds-to-text">to</span>
                    <div className="ds-date-field">
                        <FaCalendarAlt className="ds-field-icon" />
                        <input type="date" value={dateRange.toDate} onChange={(e) => setDateRange(prev => ({ ...prev, toDate: e.target.value }))} className="ds-date-input" />
                    </div>
                    <Button variant="primary" size="sm" onClick={loadDashboard} icon={<FaChartLine />}>Apply</Button>
                </div>
            </div>

            {/* Department Performance */}
            <div className="ds-performance-section">
                <div className="ds-section-header">
                    <h3>Department Performance</h3>
                    <span className="ds-section-badge">{summary.length} departments active</span>
                </div>

                {summary.length > 0 ? (
                    <div className="ds-department-grid">
                        {summary.map(dept => {
                            const totalJobs = (dept.activeJobs || 0) + (dept.completedJobs || 0);
                            const completionRate = totalJobs > 0 ? Math.round((dept.completedJobs / totalJobs) * 100) : 0;

                            return (
                                <Link to={`/department-details/${dept.departmentID}`} key={dept.departmentID} className="ds-department-card">
                                    <div className="ds-card-top">
                                        <div className="ds-card-icon"><FaBuilding /></div>
                                        <div className="ds-card-title">
                                            <h4>{dept.departmentName}</h4>
                                            <span className="ds-card-code">{dept.departmentCode}</span>
                                        </div>
                                        <FaArrowRight className="ds-arrow-icon" />
                                    </div>

                                    <div className="ds-card-stats">
                                        <div className="ds-stat">
                                            <div className="ds-stat-value">{dept.activeJobs || 0}</div>
                                            <div className="ds-stat-label">Active Jobs</div>
                                        </div>
                                        <div className="ds-stat-divider"></div>
                                        <div className="ds-stat">
                                            <div className="ds-stat-value">{dept.completedJobs || 0}</div>
                                            <div className="ds-stat-label">Completed</div>
                                        </div>
                                        <div className="ds-stat-divider"></div>
                                        <div className="ds-stat">
                                            <div className="ds-stat-value">{dept.technicianCount || 0}</div>
                                            <div className="ds-stat-label">Technicians</div>
                                        </div>
                                    </div>

                                    <div className="ds-card-progress">
                                        <div className="ds-progress-label">
                                            <span>Completion Rate</span>
                                            <span className="ds-progress-percent">{completionRate}%</span>
                                        </div>
                                        <div className="ds-progress-bar">
                                            <div className="ds-progress-fill" style={{ width: `${completionRate}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="ds-card-footer">
                                        <div className="ds-footer-stat">
                                            <FaUserCheck className="ds-footer-icon" />
                                            <span>{dept.availableTechnicians || 0} Available Techs</span>
                                        </div>
                                        {dept.pendingTransfers > 0 && (
                                            <div className="ds-pending-badge">
                                                <FaClock /> {dept.pendingTransfers} Pending
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState icon={<FaChartLine />} title="No data available" description="No department performance data found for the selected period" action={<Button variant="primary" onClick={() => { setDateRange({ fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], toDate: new Date().toISOString().split('T')[0] }); loadDashboard(); }}>Reset Filters</Button>} />
                )}
            </div>
        </div>
    );
}