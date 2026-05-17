import React, { useState, useEffect } from 'react';
import bookingApi from '../../../api/bookingApi';
import vehicleApi from '../../../api/vehicleApi';
import technicianApi from '../../../api/technicianApi';
import serviceCatalogApi from '../../../api/serviceCatalogApi';
import { Modal } from '../../../components/common/Modal/Modal';
import { Button, ReactSelect, useDialog } from '../../../components/common';
import {
    FaCalendarAlt, FaClock, FaCar, FaUserCog, FaWrench,
    FaPlus, FaTrash, FaPrint, FaInfoCircle, FaCheckCircle, FaRupeeSign
} from 'react-icons/fa';

const BOOKING_STATUS = [
    { value: 'Pending', label: '⏳ Pending', color: '#FFC107' },
    { value: 'Confirmed', label: '✅ Confirmed', color: '#17A2B8' },
    { value: 'InProgress', label: '🔧 In Progress', color: '#007BFF' },
    { value: 'Completed', label: '🎉 Completed', color: '#28A745' },
    { value: 'Cancelled', label: '❌ Cancelled', color: '#DC3545' }
];

const PRIORITY_OPTIONS = [
    { value: 'Low', label: '🟢 Low', color: '#6c757d' },
    { value: 'Normal', label: '🔵 Normal', color: '#17A2B8' },
    { value: 'High', label: '🟠 High', color: '#FFC107' },
    { value: 'Urgent', label: '🔴 Urgent', color: '#DC3545' }
];

export default function BookingModal({ date, booking, onClose, onSaved, onPrint }) {
    const isEdit = !!booking?.bookingID;
    const [vehicles, setVehicles] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [serviceCatalog, setServiceCatalog] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [manualVehicleNo, setManualVehicleNo] = useState('');
    const [isNewVehicle, setIsNewVehicle] = useState(false);
    const { showSuccess, showError, showConfirm } = useDialog();

    const [form, setForm] = useState({
        bookingID: 0,
        bookingNo: '',
        bookingDate: date || new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        vehicleID: '',
        technicianID: '',
        status: 'Pending',
        priority: 'Normal',
        notes: '',
        services: []
    });

    const vehicleOptions = vehicles.map(v => ({
        value: v.vehicleID?.toString(),
        label: `${v.registrationNo} - ${v.make} ${v.model}`,
        subLabel: v.customerName ? `(${v.customerName})` : ''
    }));

    const technicianOptions = technicians.map(t => ({
        value: t.technicianID?.toString(),
        label: `${t.fullName} - ${t.specialization || 'General'}`,
        available: t.isAvailable !== false
    }));

    // ✅ FIX: Use DefaultLaborRate from your model
    const serviceOptions = serviceCatalog.map(s => ({
        value: s.serviceID?.toString(),
        label: s.serviceName,
        estimatedTime: s.estimatedTime || 60,
        defaultLaborRate: s.defaultLaborRate || 0  // ✅ Fixed field name
    }));

    const timeSlotOptions = timeSlots.map(s => ({
        value: s.timeSlotID?.toString(),
        label: `${s.slotName || 'Slot'} (${s.startTime?.slice(0, 5)} - ${s.endTime?.slice(0, 5)})`,
        startTime: s.startTime?.slice(0, 5),
        endTime: s.endTime?.slice(0, 5)
    }));

    useEffect(() => {
        loadInitialData();
        loadTimeSlots();

        if (booking) {
            setForm({
                bookingID: booking.bookingID || 0,
                bookingNo: booking.bookingNo || '',
                bookingDate: booking.bookingDate || date,
                startTime: booking.startTime?.slice(0, 5) || '09:00',
                endTime: booking.endTime?.slice(0, 5) || '10:00',
                vehicleID: booking.vehicleID?.toString() || '',
                technicianID: booking.technicianID?.toString() || '',
                status: booking.status || 'Pending',
                priority: booking.priority || 'Normal',
                notes: booking.notes || '',
                services: (booking.services || []).map(s => ({
                    serviceID: s.serviceID?.toString(),
                    serviceName: s.serviceName,
                    estimatedTime: s.estimatedTime || 60,
                    laborRate: s.laborRate || s.defaultLaborRate || 0,  // ✅ Fixed
                    notes: s.notes || ''
                }))
            });
        }
    }, [booking]);

    const loadInitialData = async () => {
        try {
            const [vehiclesRes, techniciansRes, servicesRes] = await Promise.all([
                vehicleApi.getAll(),
                technicianApi.getAll(),
                serviceCatalogApi.getAll()
            ]);
            setVehicles(vehiclesRes.data?.data || vehiclesRes.data || []);
            setTechnicians(techniciansRes.data?.data || techniciansRes.data || []);
            setServiceCatalog(servicesRes.data?.data || servicesRes.data || []);
        } catch (err) {
            console.error('Error loading data:', err);
            showError('Data load nahi ho paya!');
        }
    };

    const loadTimeSlots = async () => {
        try {
            const res = await bookingApi.getAllTimeSlots();
            setTimeSlots(res.data?.data || res.data || []);
        } catch (err) {
            console.error('Error loading time slots:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const handleVehicleSelect = (selected) => {
        if (selected) {
            setIsNewVehicle(false);
            setManualVehicleNo("");
            setForm({ ...form, vehicleID: selected.value });
            setErrors({ ...errors, vehicleID: '' });
        } else {
            setForm({ ...form, vehicleID: "" });
        }
    };

    const handleManualVehicleChange = (e) => {
        const value = e.target.value.toUpperCase();
        setManualVehicleNo(value);
        if (value) {
            setIsNewVehicle(true);
            setForm({ ...form, vehicleID: "" });
        } else {
            setIsNewVehicle(false);
        }
    };

    const handleTimeSlotChange = (selectedOption) => {
        if (selectedOption && selectedOption.value) {
            const slot = timeSlots.find(s => s.timeSlotID === parseInt(selectedOption.value));
            if (slot) {
                setForm({
                    ...form,
                    startTime: slot.startTime?.slice(0, 5),
                    endTime: slot.endTime?.slice(0, 5)
                });
            }
        } else {
            setForm({
                ...form,
                startTime: '09:00',
                endTime: '10:00'
            });
        }
    };

    const addService = () => {
        setForm({
            ...form,
            services: [...form.services, {
                serviceID: "",
                notes: "",
                estimatedTime: 60,
                laborRate: 0,
                serviceName: ""
            }]
        });
    };

    // ✅ FIX: Update service with correct rate field
    const updateService = (index, field, value) => {
        const services = [...form.services];
        services[index][field] = value;

        if (field === 'serviceID' && value) {
            const service = serviceCatalog.find(s => s.serviceID === parseInt(value));
            if (service) {
                services[index].serviceName = service.serviceName;
                services[index].estimatedTime = service.estimatedTime || 60;
                services[index].laborRate = service.defaultLaborRate || 0;  // ✅ DefaultLaborRate se rate le rahe hain
            }
        }
        setForm({ ...form, services });
    };

    const removeService = (index) => {
        if (form.services.length <= 1) {
            showError('Kam se kam ek service to chahiye!');
            return;
        }
        setForm({ ...form, services: form.services.filter((_, i) => i !== index) });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.vehicleID && !manualVehicleNo) {
            newErrors.vehicleID = 'Vehicle select karo ya naya register karo';
        }
        if (!form.startTime || !form.endTime) {
            newErrors.timeSlot = 'Time slot select karo';
        }
        if (form.services.filter(s => s.serviceID).length === 0) {
            newErrors.services = 'Kam se kam ek service add karo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePrint = () => {
        const bookingData = {
            ...form,
            bookingNo: form.bookingNo || `BK-${Date.now()}`,
            vehicleRegNo: isNewVehicle ? manualVehicleNo : vehicles.find(v => v.vehicleID === parseInt(form.vehicleID))?.registrationNo,
            vehicleMakeModel: isNewVehicle ? 'New Vehicle' : `${vehicles.find(v => v.vehicleID === parseInt(form.vehicleID))?.make} ${vehicles.find(v => v.vehicleID === parseInt(form.vehicleID))?.model}`,
            technicianName: technicians.find(t => t.technicianID === parseInt(form.technicianID))?.fullName,
            servicesList: form.services.filter(s => s.serviceID).map(s => ({
                serviceName: serviceCatalog.find(sc => sc.serviceID === parseInt(s.serviceID))?.serviceName,
                laborRate: s.laborRate,
                notes: s.notes
            }))
        };

        if (onPrint) {
            onPrint(bookingData);
        }
    };

    const handleConvertToJobCard = async () => {
        showConfirm('Is booking ko job card mein convert karna hai?', async () => {
            setLoading(true);
            try {
                await bookingApi.convertToJobCard(form.bookingID, {
                    technicianID: form.technicianID ? parseInt(form.technicianID) : null
                });
                showSuccess('Booking job card mein convert ho gayi!');
                onSaved();
                onClose();
            } catch (err) {
                showError(err.response?.data?.message || 'Convert nahi ho paya');
            } finally {
                setLoading(false);
            }
        }, 'Convert to Job Card');
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            let vehicleId = form.vehicleID;

            if (isNewVehicle && manualVehicleNo) {
                try {
                    const newVehicleRes = await vehicleApi.create({
                        registrationNo: manualVehicleNo,
                        isWalkin: true
                    });
                    vehicleId = newVehicleRes.data?.data?.vehicleID || newVehicleRes.data?.vehicleID;
                    if (!vehicleId) throw new Error("Vehicle create nahi hua");
                    showSuccess(`Vehicle ${manualVehicleNo} register ho gaya!`);
                } catch (err) {
                    setErrors({ vehicleID: `Vehicle register nahi hua: ${err.response?.data?.message || err.message}` });
                    setLoading(false);
                    return;
                }
            }

            if (!vehicleId) {
                setErrors({ vehicleID: "Vehicle ID chahiye" });
                setLoading(false);
                return;
            }

            const payload = {
                bookingDate: form.bookingDate,
                startTime: form.startTime + ':00',
                endTime: form.endTime + ':00',
                vehicleID: parseInt(vehicleId),
                technicianID: form.technicianID ? parseInt(form.technicianID) : null,
                status: form.status,
                priority: form.priority,
                notes: form.notes,
                services: form.services.filter(s => s.serviceID).map(s => ({
                    serviceID: parseInt(s.serviceID),
                    notes: s.notes,
                    laborRate: s.laborRate  // ✅ Sending laborRate
                }))
            };

            if (isEdit) {
                await bookingApi.update(form.bookingID, payload);
                showSuccess('Booking update ho gayi!');
            } else {
                await bookingApi.create(payload);
                showSuccess('Booking save ho gayi!');
            }

            onSaved();
            onClose();
        } catch (err) {
            console.error('Save error:', err);
            showError(err.response?.data?.message || 'Booking save nahi hui!');
        } finally {
            setLoading(false);
        }
    };

    // Calculate total
    const totalEstimatedTime = form.services.reduce((total, s) => {
        if (s.serviceID) {
            return total + (s.estimatedTime || 60);
        }
        return total;
    }, 0);

    // ✅ Total amount calculation from laborRate
    const totalAmount = form.services.reduce((total, s) => {
        if (s.serviceID && s.laborRate) {
            return total + (parseFloat(s.laborRate) || 0);
        }
        return total;
    }, 0);

    const modalFooter = (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
            </Button>
            {!isEdit && (
                <Button variant="info" onClick={handlePrint} disabled={loading} icon={<FaPrint />}>
                    Print Slip
                </Button>
            )}
            {isEdit && !booking?.jobCardID && (
                <Button variant="warning" onClick={handleConvertToJobCard} disabled={loading}>
                    Convert to Job Card
                </Button>
            )}
            <Button variant="primary" onClick={handleSubmit} loading={loading}>
                {isEdit ? 'Update Booking' : 'Create Booking'}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCalendarAlt />
                    {isEdit ? 'Edit Booking' : 'New Booking'}
                    {form.bookingNo && (
                        <span style={{
                            background: '#e3f2fd',
                            color: '#1976d2',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 500
                        }}>
                            {form.bookingNo}
                        </span>
                    )}
                </div>
            }
            size="xl"
            footer={modalFooter}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '8px' }}>

                {/* Header Row - Date & Time */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#6c757d' }}>
                            <FaCalendarAlt /> Booking Date <span style={{ color: '#dc3545' }}>*</span>
                        </label>
                        <input
                            type="date"
                            name="bookingDate"
                            value={form.bookingDate}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px',
                                background: '#ffffff',
                                fontSize: '14px'
                            }}
                            disabled={loading}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#6c757d' }}>
                            <FaClock /> Time Slot
                        </label>
                        <ReactSelect
                            value={timeSlotOptions.find(s => s.startTime === form.startTime)}
                            onChange={handleTimeSlotChange}
                            options={timeSlotOptions}
                            placeholder="Select time slot..."
                            isClearable
                            isDisabled={loading}
                        />
                        {errors.timeSlot && <small style={{ fontSize: '11px', color: '#dc3545' }}>{errors.timeSlot}</small>}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#6c757d' }}>Estimated Time</label>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            background: '#e3f2fd',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#1976d2'
                        }}>
                            <FaClock /> {Math.floor(totalEstimatedTime / 60)} hr {totalEstimatedTime % 60} min
                        </div>
                    </div>
                </div>

                {/* Time Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#6c757d' }}>
                            Start Time <span style={{ color: '#dc3545' }}>*</span>
                        </label>
                        <input
                            type="time"
                            name="startTime"
                            value={form.startTime}
                            onChange={handleChange}
                            step="1800"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                            disabled={loading}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#6c757d' }}>
                            End Time <span style={{ color: '#dc3545' }}>*</span>
                        </label>
                        <input
                            type="time"
                            name="endTime"
                            value={form.endTime}
                            onChange={handleChange}
                            step="1800"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Vehicle Section */}
                <div style={{
                    border: '1px solid #e9ecef',
                    borderRadius: '12px',
                    padding: '16px',
                    background: '#fafbfc'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid #e9ecef',
                        fontSize: '14px',
                        fontWeight: 600
                    }}>
                        <FaCar /> Vehicle Details
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6c757d' }}>Select Existing Vehicle</label>
                            <ReactSelect
                                value={vehicleOptions.find(v => v.value === form.vehicleID)}
                                onChange={handleVehicleSelect}
                                options={vehicleOptions}
                                placeholder="Select vehicle..."
                                isDisabled={loading || isNewVehicle}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6c757d' }}>Or Enter New Vehicle</label>
                            <input
                                type="text"
                                value={manualVehicleNo}
                                onChange={handleManualVehicleChange}
                                placeholder="Enter registration number"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                                disabled={loading || !!form.vehicleID}
                            />
                            {isNewVehicle && (
                                <small style={{ fontSize: '11px', color: '#28a745' }}>✅ New vehicle will be registered</small>
                            )}
                        </div>
                    </div>
                    {errors.vehicleID && (
                        <div style={{ background: 'rgba(220, 53, 69, 0.1)', color: '#dc3545', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginTop: '8px' }}>
                            {errors.vehicleID}
                        </div>
                    )}
                </div>

                {/* Technician & Priority */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#6c757d' }}><FaUserCog /> Technician (Optional)</label>
                        <ReactSelect
                            value={technicianOptions.find(t => t.value === form.technicianID)}
                            onChange={(selected) => setForm({ ...form, technicianID: selected?.value })}
                            options={technicianOptions}
                            placeholder="Select technician..."
                            isClearable
                            isDisabled={loading}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#6c757d' }}>Priority</label>
                        <select
                            name="priority"
                            value={form.priority}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px',
                                fontSize: '14px',
                                background: '#ffffff'
                            }}
                            disabled={loading}
                        >
                            {PRIORITY_OPTIONS.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Services Section */}
                <div style={{
                    border: '1px solid #e9ecef',
                    borderRadius: '12px',
                    padding: '16px',
                    background: '#fafbfc'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid #e9ecef'
                    }}>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}><FaWrench /> Services</span>
                        <Button variant="primary" size="sm" onClick={addService} icon={<FaPlus />}>
                            Add Service
                        </Button>
                    </div>

                    {form.services.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '24px', color: '#6c757d', fontSize: '13px' }}>
                            <FaInfoCircle /> No services added. Click "Add Service" to add.
                        </div>
                    ) : (
                        <div style={{ border: '1px solid #e9ecef', borderRadius: '8px', overflow: 'hidden' }}>
                            {/* Table Header */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr 0.8fr 1.5fr 0.5fr',
                                background: '#f8f9fa',
                                padding: '10px 12px',
                                fontSize: '12px',
                                fontWeight: 600,
                                borderBottom: '1px solid #dee2e6'
                            }}>
                                <span>Service <span style={{ color: '#dc3545' }}>*</span></span>
                                <span>Rate </span>
                                <span>Time</span>
                                <span>Notes</span>
                                <span></span>
                            </div>

                            {/* Table Body */}
                            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                {form.services.map((service, index) => {
                                    const selectedService = serviceCatalog.find(s => s.serviceID === parseInt(service.serviceID));
                                    return (
                                        <div key={index} style={{
                                            display: 'grid',
                                            gridTemplateColumns: '2fr 1fr 0.8fr 1.5fr 0.5fr',
                                            padding: '8px 12px',
                                            borderBottom: '1px solid #e9ecef',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <div>
                                                <ReactSelect
                                                    value={serviceOptions.find(s => s.value === service.serviceID)}
                                                    onChange={(selected) => updateService(index, 'serviceID', selected?.value)}
                                                    options={serviceOptions}
                                                    placeholder="Select service..."
                                                    isDisabled={loading}
                                                />
                                            </div>
                                            <div>
                                                {/* ✅ Show DefaultLaborRate from selected service */}
                                                {selectedService ? (
                                                    <span style={{
                                                        fontWeight: 600,
                                                        color: '#1976d2',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <FaCheckCircle style={{ fontSize: '11px' }} />
                                                        {selectedService.defaultLaborRate?.toLocaleString('en-IN') || 0}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#6c757d', fontSize: '12px' }}>-</span>
                                                )}
                                            </div>
                                            <div>
                                                {selectedService && (
                                                    <span style={{
                                                        background: '#e3f2fd',
                                                        color: '#1976d2',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        fontSize: '11px',
                                                        fontWeight: 500
                                                    }}>
                                                        {selectedService.estimatedTime || 60} min
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Instructions..."
                                                    value={service.notes || ''}
                                                    onChange={(e) => updateService(index, 'notes', e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '6px 10px',
                                                        border: '1px solid #dee2e6',
                                                        borderRadius: '6px',
                                                        fontSize: '13px'
                                                    }}
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeService(index)}
                                                    disabled={form.services.length <= 1}
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#dc3545',
                                                        cursor: 'pointer',
                                                        borderRadius: '6px',
                                                        opacity: form.services.length <= 1 ? 0.4 : 1
                                                    }}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Total Row */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '10px 16px',
                                background: '#f8f9fa',
                                borderTop: '1px solid #dee2e6'
                            }}>
                                <span style={{ fontSize: '13px', fontWeight: 500, color: '#6c757d' }}>Total Amount:</span>
                                <span style={{ fontSize: '16px', fontWeight: 600, color: '#1976d2' }}>
                                    <FaCheckCircle /> {totalAmount.toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>
                    )}
                    {errors.services && (
                        <div style={{ background: 'rgba(220, 53, 69, 0.1)', color: '#dc3545', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginTop: '8px' }}>
                            {errors.services}
                        </div>
                    )}
                </div>

                {/* Status & Notes */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#6c757d' }}>Status</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: `2px solid ${BOOKING_STATUS.find(s => s.value === form.status)?.color || '#6c757d'}`,
                                borderRadius: '8px',
                                fontSize: '14px',
                                background: '#ffffff'
                            }}
                            disabled={loading}
                        >
                            {BOOKING_STATUS.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#6c757d' }}>Notes / Instructions</label>
                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            rows="2"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px',
                                fontSize: '14px',
                                resize: 'vertical'
                            }}
                            placeholder="Any special instructions..."
                            disabled={loading}
                        />
                    </div>
                </div>

                {isEdit && booking?.jobCardID && (
                    <div style={{
                        background: '#e3f2fd',
                        color: '#17a2b8',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <FaCheckCircle /> Already converted to Job Card #{booking.jobCardNo}
                    </div>
                )}
            </div>
        </Modal>
    );
}