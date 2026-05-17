import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import departmentApi from "../../../api/departmentApi";
import TechnicianDepartmentAssignment from "./TechnicianDepartmentAssignment";
import JobDepartmentTransfer from "./JobDepartmentTransfer";
import { FaBuilding, FaArrowLeft, FaUsers, FaWrench, FaCog, FaExchangeAlt, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { Button, useDialog } from "../../../components/common";
import { PageHeader } from "../../../components/features";
import "./Departments.css";

export default function DepartmentDetailsPage() {
    const { id } = useParams();
    const [department, setDepartment] = useState(null);
    const [technicians, setTechnicians] = useState([]);
    const [services, setServices] = useState([]);
    const [parts, setParts] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [activeTab, setActiveTab] = useState('technicians');
    const [loading, setLoading] = useState(false);
    const [showTechnicianModal, setShowTechnicianModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const { showConfirm, showSuccess, showError } = useDialog();

    const loadDepartmentData = async () => {
        setLoading(true);
        try {
            const [deptRes, techRes, servicesRes, partsRes, transfersRes] = await Promise.all([
                departmentApi.getById(id),
                departmentApi.getDepartmentTechnicians(id),
                departmentApi.getDepartmentServices(id),
                departmentApi.getDepartmentParts(id),
                departmentApi.getTransfers()
            ]);
            setDepartment(deptRes.data?.data || deptRes.data);
            setTechnicians(techRes.data?.data || techRes.data || []);
            setServices(servicesRes.data?.data || servicesRes.data || []);
            setParts(partsRes.data?.data || partsRes.data || []);
            const allTransfers = transfersRes.data?.data || transfersRes.data || [];
            setTransfers(allTransfers.filter(t => t.toDepartmentID === parseInt(id) || t.fromDepartmentID === parseInt(id)));
        } catch (error) {
            showError(error.response?.data?.message || "Failed to load department details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDepartmentData();
    }, [id]);

    const handleRemoveTechnician = async (technicianId, name) => {
        showConfirm(`Remove ${name} from department?`, async () => {
            try {
                await departmentApi.removeTechnicianFromDepartment(technicianId, parseInt(id));
                showSuccess("Technician removed");
                loadDepartmentData();
            } catch (error) {
                showError("Failed to remove technician");
            }
        }, "Remove Technician");
    };

    const handleToggleService = async (serviceId, isAvailable) => {
        try {
            await departmentApi.updateServiceAvailability(parseInt(id), serviceId, !isAvailable);
            showSuccess(`Service ${!isAvailable ? 'enabled' : 'disabled'}`);
            loadDepartmentData();
        } catch (error) {
            showError("Failed to update service");
        }
    };

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading department details...</p>
        </div>
    );

    if (!department) return <div className="not-found">Department not found</div>;

    return (
        <div className="dept-page-premium">
            <PageHeader title={department.departmentName} icon={<FaBuilding />} subtitle={department.departmentCode} />

            <div className="dept-info-grid">
                <div className="info-card">
                    <h4>Department Information</h4>
                    <div className="info-grid">
                        <div><span className="label">Description:</span><span>{department.description || 'N/A'}</span></div>
                        <div><span className="label">Manager:</span><span>{department.managerName || 'Not assigned'}</span></div>
                        <div><span className="label">Phone:</span><span>{department.phone || 'N/A'}</span></div>
                        <div><span className="label">Email:</span><span>{department.email || 'N/A'}</span></div>
                        <div><span className="label">Location:</span><span>{department.location || 'N/A'}</span></div>
                        <div><span className="label">Status:</span><span className={`status-badge ${department.isActive ? 'active' : 'inactive'}`}>{department.isActive ? 'Active' : 'Inactive'}</span></div>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stat"><span className="stat-value">{technicians.length}</span><span className="stat-label">Technicians</span></div>
                    <div className="stat"><span className="stat-value">{services.length}</span><span className="stat-label">Services</span></div>
                    <div className="stat"><span className="stat-value">{parts.length}</span><span className="stat-label">Parts</span></div>
                    <div className="stat"><span className="stat-value">{transfers.filter(t => t.status === 'PENDING').length}</span><span className="stat-label">Pending Transfers</span></div>
                </div>
            </div>

            <div className="dept-tabs">
                <button className={`tab-btn ${activeTab === 'technicians' ? 'active' : ''}`} onClick={() => setActiveTab('technicians')}><FaUsers /> Technicians</button>
                <button className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}><FaWrench /> Services</button>
                <button className={`tab-btn ${activeTab === 'parts' ? 'active' : ''}`} onClick={() => setActiveTab('parts')}><FaCog /> Parts</button>
                <button className={`tab-btn ${activeTab === 'transfers' ? 'active' : ''}`} onClick={() => setActiveTab('transfers')}><FaExchangeAlt /> Transfers</button>
            </div>

            <div className="tab-content">
                {activeTab === 'technicians' && (
                    <div>
                        <div className="section-header">
                            <h3>Department Technicians</h3>
                            <Button variant="primary" size="sm" onClick={() => setShowTechnicianModal(true)}>+ Assign Technician</Button>
                        </div>
                        <div className="technicians-grid">
                            {technicians.map(t => (
                                <div key={t.techDeptID} className="tech-card">
                                    <div className="tech-header">
                                        <span className="tech-name">{t.technicianName}</span>
                                        {t.isPrimary && <span className="primary-badge">Primary</span>}
                                    </div>
                                    <div className="tech-details">
                                        <div>Assigned: {new Date(t.assignedDate).toLocaleDateString()}</div>
                                        <div>Status: <span className={`status-badge ${t.isActive ? 'active' : 'inactive'}`}>{t.isActive ? 'Active' : 'Inactive'}</span></div>
                                    </div>
                                    <div className="tech-actions">
                                        <Button variant="danger" size="sm" onClick={() => handleRemoveTechnician(t.technicianID, t.technicianName)}>Remove</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'services' && (
                    <div>
                        <h3>Department Services</h3>
                        <div className="services-grid">
                            {services.map(s => (
                                <div key={s.deptServiceID} className="service-card">
                                    <div className="service-header">
                                        <span className="service-name">{s.serviceName}</span>
                                        <button className={`toggle-btn ${s.isAvailable ? 'enabled' : 'disabled'}`} onClick={() => handleToggleService(s.serviceID, s.isAvailable)}>
                                            {s.isAvailable ? '✓' : '✗'}
                                        </button>
                                    </div>
                                    {s.estimatedTime && <div className="service-time">Est. Time: {s.estimatedTime} min</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'parts' && (
                    <div>
                        <h3>Department Parts</h3>
                        <div className="parts-grid">
                            {parts.map(p => (
                                <div key={p.deptPartID} className="part-card">
                                    <div className="part-header">
                                        <span className="part-name">{p.itemName}</span>
                                        {p.isCommon && <span className="common-badge">Common</span>}
                                    </div>
                                    {p.minStockLevel && <div className="part-stock">Min Stock: {p.minStockLevel}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'transfers' && (
                    <div>
                        <h3>Department Transfers</h3>
                        <div className="transfers-list">
                            {transfers.map(t => (
                                <div key={t.transferID} className="transfer-card">
                                    <div className="transfer-header">
                                        <span className="job-no">{t.jobCardNo}</span>
                                        <span className={`status-badge ${t.status.toLowerCase()}`}>{t.status}</span>
                                    </div>
                                    <div className="transfer-details">
                                        <div><span>From:</span> {t.fromDepartmentName}</div>
                                        <div><span>To:</span> {t.toDepartmentName}</div>
                                        <div><span>Date:</span> {new Date(t.transferDate).toLocaleString()}</div>
                                        {t.reason && <div><span>Reason:</span> {t.reason}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showTechnicianModal && (
                <TechnicianDepartmentAssignment
                    departmentId={parseInt(id)}
                    departmentName={department.departmentName}
                    onClose={() => setShowTechnicianModal(false)}
                    onSaved={() => { loadDepartmentData(); setShowTechnicianModal(false); }}
                />
            )}

            {showTransferModal && (
                <JobDepartmentTransfer
                    departmentId={parseInt(id)}
                    departmentName={department.departmentName}
                    onClose={() => setShowTransferModal(false)}
                    onSaved={() => { loadDepartmentData(); setShowTransferModal(false); }}
                />
            )}
        </div>
    );
}