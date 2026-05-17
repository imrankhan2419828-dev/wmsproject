import React, { useRef } from 'react';
import { Modal } from '../../../components/common/Modal/Modal';
import { Button } from '../../../components/common';
import { FaPrint, FaDownload } from 'react-icons/fa';
import './BookingCalendar.css';

const BookingSlip = ({ booking, onClose }) => {
    const printRef = useRef();

    const handlePrint = () => {
        const printContent = printRef.current;
        const originalContent = document.body.innerHTML;

        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    const getStatusBadge = (status) => {
        const colors = {
            Pending: '#FFC107',
            Confirmed: '#17A2B8',
            InProgress: '#007BFF',
            Completed: '#28A745',
            Cancelled: '#DC3545'
        };
        return { backgroundColor: colors[status] || '#6C757D', color: 'white', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' };
    };

    // Calculate total estimated time
    const totalServicesTime = booking.servicesList?.reduce((sum, s) => {
        return sum + (s.estimatedTime || 60);
    }, 0) || 0;

    return (
        <Modal isOpen={true} onClose={onClose} title="Booking Slip" size="md" footer={
            <div className="slip-footer">
                <Button variant="outline" onClick={onClose}>Close</Button>
                <Button variant="primary" onClick={handlePrint} icon={<FaPrint />}>Print</Button>
            </div>
        }>
            <div className="booking-slip" ref={printRef}>
                <div className="slip-header">
                    <h2>BOOKING CONFIRMATION</h2>
                    <div className="slip-booking-no">Booking #: {booking.bookingNo || 'New Booking'}</div>
                </div>

                <div className="slip-body">
                    <div className="slip-section">
                        <h4>Booking Details</h4>
                        <table className="slip-table">
                            <tbody>
                                <tr><th>Date:</th><td>{booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : '-'}</td></tr>
                                <tr><th>Time:</th><td>{booking.startTime || '-'} - {booking.endTime || '-'}</td></tr>
                                <tr><th>Status:</th><td><span className="status-badge" style={getStatusBadge(booking.status)}>{booking.status || 'Pending'}</span></td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="slip-section">
                        <h4>Vehicle Information</h4>
                        <table className="slip-table">
                            <tbody>
                                <tr><th>Registration No:</th><td>{booking.vehicleRegNo || booking.vehicleRegistrationNo || 'N/A'}</td></tr>
                                <tr><th>Make/Model:</th><td>{booking.vehicleMakeModel || 'N/A'}</td></tr>
                            </tbody>
                        </table>
                    </div>

                    {booking.technicianName && (
                        <div className="slip-section">
                            <h4>Technician</h4>
                            <table className="slip-table">
                                <tbody>
                                    <tr><th>Assigned Technician:</th><td>{booking.technicianName}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {booking.servicesList && booking.servicesList.length > 0 && (
                        <div className="slip-section">
                            <h4>Services Requested</h4>
                            <table className="slip-table">
                                <thead>
                                    <tr><th>Service</th><th>Est. Time</th><th>Notes</th></tr>
                                </thead>
                                <tbody>
                                    {booking.servicesList.map((s, i) => (
                                        <tr key={i}>
                                            <td>{s.serviceName || '-'}</td>
                                            <td>{s.estimatedTime || 60} min</td>
                                            <td>{s.notes || '-'}</td>
                                        </tr>
                                    ))}
                                    <tr className="total-row">
                                        <td><strong>Total Estimated Time</strong></td>
                                        <td><strong>{totalServicesTime} min</strong></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {booking.notes && (
                        <div className="slip-section">
                            <h4>Additional Notes</h4>
                            <p>{booking.notes}</p>
                        </div>
                    )}

                    <div className="slip-footer-note">
                        <p>Thank you for choosing our service. Please arrive on time for your booking.</p>
                        <p className="generated-date">Generated on: {new Date().toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default BookingSlip;