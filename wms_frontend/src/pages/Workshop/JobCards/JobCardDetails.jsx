//import React from "react";
//import { Modal } from "../../../components/common/Modal/Modal";
//import { Button } from "../../../components/common";
//import { FaClipboardList, FaCar, FaUser, FaCalendarAlt, FaWrench, FaCog, FaPlay, FaCheckDouble, FaCheckCircle, FaTruck } from "react-icons/fa";
//import "./JobCard.css";

//export default function JobCardDetails({ jobCard, onClose, onStatusUpdate }) {
//    const getStatusBadge = (status) => {
//        const statusConfig = {
//            PENDING: { class: "pending", label: "Pending" },
//            IN_PROGRESS: { class: "in-progress", label: "In Progress" },
//            QC: { class: "qc", label: "Quality Check" },
//            COMPLETED: { class: "completed", label: "Completed" },
//            DELIVERED: { class: "delivered", label: "Delivered" },
//            CANCELLED: { class: "cancelled", label: "Cancelled" }
//        };
//        const config = statusConfig[status] || { class: "pending", label: status };
//        return <span className={`jobcard-status-badge ${config.class}`}>{config.label}</span>;
//    };

//    // ✅ Debug logging
//    console.log("JobCardDetails received:", jobCard);
//    console.log("Services:", jobCard?.services);
//    console.log("Parts:", jobCard?.parts);
//    console.log("Services length:", jobCard?.services?.length || 0);
//    console.log("Parts length:", jobCard?.parts?.length || 0);

//    const services = jobCard?.services || [];
//    const parts = jobCard?.parts || [];

//    const modalFooter = (
//        <div className="jobcard-details-footer">
//            {jobCard?.status === "PENDING" && <Button variant="primary" onClick={() => onStatusUpdate("IN_PROGRESS")} icon={<FaPlay />}>Start Job</Button>}
//            {jobCard?.status === "IN_PROGRESS" && <Button variant="primary" onClick={() => onStatusUpdate("QC")} icon={<FaCheckDouble />}>Send to QC</Button>}
//            {jobCard?.status === "QC" && <Button variant="primary" onClick={() => onStatusUpdate("COMPLETED")} icon={<FaCheckCircle />}>Complete Job</Button>}
//            {jobCard?.status === "COMPLETED" && <Button variant="primary" onClick={() => onStatusUpdate("DELIVERED")} icon={<FaTruck />}>Mark Delivered</Button>}
//            <Button variant="outline" onClick={onClose}>Close</Button>
//        </div>
//    );

//    return (
//        <Modal isOpen={true} onClose={onClose} title={<><FaClipboardList /> Job Card Details - {jobCard?.jobCardNo}</>} size="lg" footer={modalFooter}>
//            <div className="jobcard-details-container">
//                <div className="details-section">
//                    <h4><FaClipboardList /> Basic Information</h4>
//                    <div className="details-grid">
//                        <div className="detail-item"><label>Status:</label><div>{getStatusBadge(jobCard?.status)}</div></div>
//                        <div className="detail-item"><label><FaCar /> Vehicle:</label><div>{jobCard?.vehicleRegNo} - {jobCard?.vehicleMakeModel}</div></div>
//                        <div className="detail-item"><label><FaUser /> Customer:</label><div>{jobCard?.customerName || 'N/A'}</div></div>
//                        <div className="detail-item"><label><FaCalendarAlt /> Received Date:</label><div>{jobCard?.receivedDate ? new Date(jobCard.receivedDate).toLocaleDateString() : 'N/A'}</div></div>
//                        {jobCard?.promisedDate && <div className="detail-item"><label><FaCalendarAlt /> Promised Date:</label><div>{new Date(jobCard.promisedDate).toLocaleDateString()}</div></div>}
//                        {jobCard?.completedDate && <div className="detail-item"><label><FaCalendarAlt /> Completed Date:</label><div>{new Date(jobCard.completedDate).toLocaleDateString()}</div></div>}
//                    </div>
//                </div>

//                {jobCard?.customerComplaint && (
//                    <div className="details-section">
//                        <h4><FaUser /> Customer Complaint</h4>
//                        <p>{jobCard.customerComplaint}</p>
//                    </div>
//                )}

//                {jobCard?.technicianFindings && (
//                    <div className="details-section">
//                        <h4><FaWrench /> Technician Findings</h4>
//                        <p>{jobCard.technicianFindings}</p>
//                    </div>
//                )}

//                {jobCard?.recommendations && (
//                    <div className="details-section">
//                        <h4><FaCog /> Recommendations</h4>
//                        <p>{jobCard.recommendations}</p>
//                    </div>
//                )}

//                {/* ✅ FIXED: Services Section */}
//                <div className="details-section">
//                    <h4><FaWrench /> Services ({services.length})</h4>
//                    {services.length === 0 ? (
//                        <p className="no-data">No services added</p>
//                    ) : (
//                        <div className="table-responsive">
//                            <table className="details-table">
//                                <thead>
//                                    <tr>
//                                        <th>Service</th>
//                                        <th>Qty</th>
//                                        <th>Rate</th>
//                                        <th>Disc %</th>
//                                        <th>Amount</th>
//                                        <th>Technician</th>
//                                        <th>Status</th>
//                                    </tr>
//                                </thead>
//                                <tbody>
//                                    {services.map((s, i) => (
//                                        <tr key={s.jobServiceID || i}>
//                                            <td>{s.serviceName}</td>
//                                            <td>{s.quantity}</td>
//                                            <td>Rs. {(s.unitPrice || 0).toFixed(2)}</td>
//                                            <td>{s.discountPercent || 0}%</td>
//                                            <td className="amount">Rs. {(s.totalAmount || 0).toFixed(2)}</td>
//                                            <td>{s.technicianName || 'N/A'}</td>
//                                            <td>{s.status || 'Pending'}</td>
//                                        </tr>
//                                    ))}
//                                </tbody>
//                            </table>
//                        </div>
//                    )}
//                </div>

//                {/* ✅ FIXED: Parts Section */}
//                <div className="details-section">
//                    <h4><FaCog /> Parts Used ({parts.length})</h4>
//                    {parts.length === 0 ? (
//                        <p className="no-data">No parts used</p>
//                    ) : (
//                        <div className="table-responsive">
//                            <table className="details-table">
//                                <thead>
//                                    <tr>
//                                        <th>Part</th>
//                                        <th>Qty</th>
//                                        <th>Rate</th>
//                                        <th>Disc %</th>
//                                        <th>Amount</th>
//                                        <th>Source</th>
//                                    </tr>
//                                </thead>
//                                <tbody>
//                                    {parts.map((p, i) => (
//                                        <tr key={p.jobPartID || i}>
//                                            <td>{p.itemName}</td>
//                                            <td>{p.quantity}</td>
//                                            <td>Rs. {(p.unitPrice || 0).toFixed(2)}</td>
//                                            <td>{p.discountPercent || 0}%</td>
//                                            <td className="amount">Rs. {(p.totalAmount || 0).toFixed(2)}</td>
//                                            <td>{p.stockSource === 'STOCK' ? 'From Stock' : 'Purchase'}</td>
//                                        </tr>
//                                    ))}
//                                </tbody>
//                            </table>
//                        </div>
//                    )}
//                </div>

//                <div className="financial-summary">
//                    <div className="summary-row"><span>Labor Total:</span><span>Rs. {(jobCard?.totalLabor || 0).toFixed(2)}</span></div>
//                    <div className="summary-row"><span>Parts Total:</span><span>Rs. {(jobCard?.totalParts || 0).toFixed(2)}</span></div>
//                    {(jobCard?.discountAmount || 0) > 0 && <div className="summary-row"><span>Discount:</span><span>- Rs. {(jobCard?.discountAmount || 0).toFixed(2)}</span></div>}
//                    {(jobCard?.taxAmount || 0) > 0 && <div className="summary-row"><span>Tax:</span><span>Rs. {(jobCard?.taxAmount || 0).toFixed(2)}</span></div>}
//                    <div className="summary-row grand-total"><span>Grand Total:</span><span>Rs. {(jobCard?.grandTotal || 0).toFixed(2)}</span></div>
//                </div>
//            </div>
//        </Modal>
//    );
//}

import React, { useRef } from "react";
import { Modal } from "../../../components/common/Modal/Modal";
import { Button } from "../../../components/common";
import {
    FaClipboardList, FaCar, FaUser, FaCalendarAlt, FaWrench, FaCog,
    FaPlay, FaCheckDouble, FaCheckCircle, FaTruck, FaPrint, FaFilePdf, FaFileExcel
} from "react-icons/fa";
import * as XLSX from "xlsx";
import "./JobCard.css";

export default function JobCardDetails({ jobCard, onClose, onStatusUpdate }) {
    const printRef = useRef();

    const getStatusBadge = (status) => {
        const statusConfig = {
            PENDING: { class: "pending", label: "Pending" },
            IN_PROGRESS: { class: "in-progress", label: "In Progress" },
            QC: { class: "qc", label: "Quality Check" },
            COMPLETED: { class: "completed", label: "Completed" },
            DELIVERED: { class: "delivered", label: "Delivered" },
            CANCELLED: { class: "cancelled", label: "Cancelled" }
        };
        const config = statusConfig[status] || { class: "pending", label: status };
        return <span className={`jobcard-status-badge ${config.class}`}>{config.label}</span>;
    };

    const services = jobCard?.services || [];
    const parts = jobCard?.parts || [];

    // ✅ Print Function
    const handlePrint = () => {
        const printContent = document.getElementById("jobcard-print-content").innerHTML;
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    // ✅ PDF Function (Browser Print to PDF)
    const handlePDF = () => {
        window.print();
    };

    // ✅ Excel Export Function
    const handleExcel = () => {
        // Prepare Services Data
        const servicesData = services.map(s => ({
            "Service Name": s.serviceName,
            "Quantity": s.quantity,
            "Rate": s.unitPrice,
            "Discount %": s.discountPercent,
            "Amount": s.totalAmount,
            "Technician": s.technicianName || 'N/A',
            "Status": s.status || 'Pending'
        }));

        // Prepare Parts Data
        const partsData = parts.map(p => ({
            "Part Name": p.itemName,
            "Quantity": p.quantity,
            "Rate": p.unitPrice,
            "Discount %": p.discountPercent,
            "Amount": p.totalAmount,
            "Source": p.stockSource === 'STOCK' ? 'From Stock' : 'Purchase'
        }));

        // Prepare Summary Data
        const summaryData = [
            { "Description": "Job Card No", "Value": jobCard?.jobCardNo },
            { "Description": "Vehicle", "Value": `${jobCard?.vehicleRegNo} - ${jobCard?.vehicleMakeModel}` },
            { "Description": "Customer", "Value": jobCard?.customerName || 'N/A' },
            { "Description": "Status", "Value": jobCard?.status },
            { "Description": "Received Date", "Value": jobCard?.receivedDate ? new Date(jobCard.receivedDate).toLocaleDateString() : 'N/A' },
            { "Description": "Labor Total", "Value": `Rs. ${(jobCard?.totalLabor || 0).toFixed(2)}` },
            { "Description": "Parts Total", "Value": `Rs. ${(jobCard?.totalParts || 0).toFixed(2)}` },
            { "Description": "Grand Total", "Value": `Rs. ${(jobCard?.grandTotal || 0).toFixed(2)}` }
        ];

        // Create Workbook
        const wb = XLSX.utils.book_new();

        // Add Sheets
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        const servicesSheet = XLSX.utils.json_to_sheet(servicesData);
        const partsSheet = XLSX.utils.json_to_sheet(partsData);

        // Set Column Widths
        servicesSheet['!cols'] = [{ wch: 30 }, { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 12 }];
        partsSheet['!cols'] = [{ wch: 30 }, { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 15 }];

        XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
        XLSX.utils.book_append_sheet(wb, servicesSheet, "Services");
        XLSX.utils.book_append_sheet(wb, partsSheet, "Parts");

        // Export Excel
        XLSX.writeFile(wb, `JobCard_${jobCard?.jobCardNo}.xlsx`);
    };

    const modalFooter = (
        <div className="jobcard-details-footer">
            <div className="footer-actions">
                {/* ✅ Export Buttons */}
                <Button variant="outline" onClick={handlePrint} icon={<FaPrint />}>Print</Button>
                <Button variant="outline" onClick={handlePDF} icon={<FaFilePdf />}>PDF</Button>
                <Button variant="outline" onClick={handleExcel} icon={<FaFileExcel />}>Excel</Button>
            </div>
            <div className="footer-status-actions">
                {jobCard?.status === "PENDING" && <Button variant="primary" onClick={() => onStatusUpdate("IN_PROGRESS")} icon={<FaPlay />}>Start Job</Button>}
                {jobCard?.status === "IN_PROGRESS" && <Button variant="primary" onClick={() => onStatusUpdate("QC")} icon={<FaCheckDouble />}>Send to QC</Button>}
                {jobCard?.status === "QC" && <Button variant="primary" onClick={() => onStatusUpdate("COMPLETED")} icon={<FaCheckCircle />}>Complete Job</Button>}
                {jobCard?.status === "COMPLETED" && <Button variant="primary" onClick={() => onStatusUpdate("DELIVERED")} icon={<FaTruck />}>Mark Delivered</Button>}
                <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
        </div>
    );

    return (
        <Modal isOpen={true} onClose={onClose} title={<><FaClipboardList /> Job Card Details - {jobCard?.jobCardNo}</>} size="lg" footer={modalFooter}>
            <div id="jobcard-print-content" className="jobcard-details-container">
                {/* Header for Print */}
                <div className="print-header" style={{ textAlign: 'center', marginBottom: '20px', display: 'none' }}>
                    <h2>Job Card Details</h2>
                    <p>Printed on: {new Date().toLocaleString()}</p>
                    <hr />
                </div>

                <div className="details-section">
                    <h4><FaClipboardList /> Basic Information</h4>
                    <div className="details-grid">
                        <div className="detail-item"><label>Status:</label><div>{getStatusBadge(jobCard?.status)}</div></div>
                        <div className="detail-item"><label><FaCar /> Vehicle:</label><div>{jobCard?.vehicleRegNo} - {jobCard?.vehicleMakeModel}</div></div>
                        <div className="detail-item"><label><FaUser /> Customer:</label><div>{jobCard?.customerName || 'N/A'}</div></div>
                        <div className="detail-item"><label><FaCalendarAlt /> Received Date:</label><div>{jobCard?.receivedDate ? new Date(jobCard.receivedDate).toLocaleDateString() : 'N/A'}</div></div>
                        {jobCard?.promisedDate && <div className="detail-item"><label><FaCalendarAlt /> Promised Date:</label><div>{new Date(jobCard.promisedDate).toLocaleDateString()}</div></div>}
                        {jobCard?.completedDate && <div className="detail-item"><label><FaCalendarAlt /> Completed Date:</label><div>{new Date(jobCard.completedDate).toLocaleDateString()}</div></div>}
                    </div>
                </div>

                {jobCard?.customerComplaint && (
                    <div className="details-section">
                        <h4><FaUser /> Customer Complaint</h4>
                        <p>{jobCard.customerComplaint}</p>
                    </div>
                )}

                {jobCard?.technicianFindings && (
                    <div className="details-section">
                        <h4><FaWrench /> Technician Findings</h4>
                        <p>{jobCard.technicianFindings}</p>
                    </div>
                )}

                {jobCard?.recommendations && (
                    <div className="details-section">
                        <h4><FaCog /> Recommendations</h4>
                        <p>{jobCard.recommendations}</p>
                    </div>
                )}

                {/* Services Section */}
                <div className="details-section">
                    <h4><FaWrench /> Services ({services.length})</h4>
                    {services.length === 0 ? (
                        <p className="no-data">No services added</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="details-table">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Qty</th>
                                        <th>Rate</th>
                                        <th>Disc %</th>
                                        <th>Amount</th>
                                        <th>Technician</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.map((s, i) => (
                                        <tr key={s.jobServiceID || i}>
                                            <td>{s.serviceName}</td>
                                            <td>{s.quantity}</td>
                                            <td>Rs. {(s.unitPrice || 0).toFixed(2)}</td>
                                            <td>{s.discountPercent || 0}%</td>
                                            <td className="amount">Rs. {(s.totalAmount || 0).toFixed(2)}</td>
                                            <td>{s.technicianName || 'N/A'}</td>
                                            <td>{s.status || 'Pending'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Parts Section */}
                <div className="details-section">
                    <h4><FaCog /> Parts Used ({parts.length})</h4>
                    {parts.length === 0 ? (
                        <p className="no-data">No parts used</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="details-table">
                                <thead>
                                    <tr>
                                        <th>Part</th>
                                        <th>Qty</th>
                                        <th>Rate</th>
                                        <th>Disc %</th>
                                        <th>Amount</th>
                                        <th>Source</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parts.map((p, i) => (
                                        <tr key={p.jobPartID || i}>
                                            <td>{p.itemName}</td>
                                            <td>{p.quantity}</td>
                                            <td>Rs. {(p.unitPrice || 0).toFixed(2)}</td>
                                            <td>{p.discountPercent || 0}%</td>
                                            <td className="amount">Rs. {(p.totalAmount || 0).toFixed(2)}</td>
                                            <td>{p.stockSource === 'STOCK' ? 'From Stock' : 'Purchase'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="financial-summary">
                    <div className="summary-row"><span>Labor Total:</span><span>Rs. {(jobCard?.totalLabor || 0).toFixed(2)}</span></div>
                    <div className="summary-row"><span>Parts Total:</span><span>Rs. {(jobCard?.totalParts || 0).toFixed(2)}</span></div>
                    {(jobCard?.discountAmount || 0) > 0 && <div className="summary-row"><span>Discount:</span><span>- Rs. {(jobCard?.discountAmount || 0).toFixed(2)}</span></div>}
                    {(jobCard?.taxAmount || 0) > 0 && <div className="summary-row"><span>Tax:</span><span>Rs. {(jobCard?.taxAmount || 0).toFixed(2)}</span></div>}
                    <div className="summary-row grand-total"><span>Grand Total:</span><span>Rs. {(jobCard?.grandTotal || 0).toFixed(2)}</span></div>
                </div>
            </div>
        </Modal>
    );
}