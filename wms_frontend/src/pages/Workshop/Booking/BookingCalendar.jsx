import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import bookingApi from '../../../api/bookingApi';
import axiosClient from '../../../api/axiosClient'; // ✅ ADD THIS IMPORT
import BookingModal from './BookingModal';
import BookingSlip from './BookingSlip';
import { FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaFlag } from 'react-icons/fa';
import { Button, useDialog } from '../../../components/common';
import { PageHeader } from '../../../components/features';
import './BookingCalendar.css';

const localizer = momentLocalizer(moment);

const STATUS_CONFIG = {
    Pending: { label: 'Pending', color: '#FFC107', icon: '⏳' },
    Confirmed: { label: 'Confirmed', color: '#17A2B8', icon: '✅' },
    InProgress: { label: 'In Progress', color: '#007BFF', icon: '🔧' },
    Completed: { label: 'Completed', color: '#28A745', icon: '✔️' },
    Cancelled: { label: 'Cancelled', color: '#DC3545', icon: '❌' }
};

const PRIORITY_CONFIG = {
    Low: { label: 'Low', color: '#6c757d', icon: '🟢', bgColor: '#f8f9fa' },
    Normal: { label: 'Normal', color: '#17A2B8', icon: '🔵', bgColor: '#e3f2fd' },
    High: { label: 'High', color: '#FFC107', icon: '🟠', bgColor: '#fff3e0' },
    Urgent: { label: 'Urgent', color: '#DC3545', icon: '🔴', bgColor: '#ffebee' }
};

export default function BookingCalendar() {
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showSlip, setShowSlip] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedBookingForSlip, setSelectedBookingForSlip] = useState(null);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState(Views.MONTH);
    const [date, setDate] = useState(new Date());
    const [contextMenu, setContextMenu] = useState(null);
    const calendarRef = useRef(null);
    const { showConfirm, showSuccess, showError } = useDialog();

    // Load bookings
    const loadBookings = async (start, end) => {
        setLoading(true);
        try {
            const fromDate = moment(start).format('YYYY-MM-DD');
            const toDate = moment(end).format('YYYY-MM-DD');
            const res = await bookingApi.getByDateRange(fromDate, toDate);
            let bookings = res.data?.data || res.data || [];

            const calendarEvents = bookings.map(booking => {
                const startDateTime = moment(booking.bookingDate).set({
                    hour: booking.startTime ? parseInt(booking.startTime.split(':')[0]) : 9,
                    minute: booking.startTime ? parseInt(booking.startTime.split(':')[1]) : 0
                }).toDate();

                const endDateTime = moment(booking.bookingDate).set({
                    hour: booking.endTime ? parseInt(booking.endTime.split(':')[0]) : 10,
                    minute: booking.endTime ? parseInt(booking.endTime.split(':')[1]) : 0
                }).toDate();

                const priorityConfig = PRIORITY_CONFIG[booking.priority] || PRIORITY_CONFIG.Normal;

                return {
                    id: booking.bookingID,
                    title: `${booking.bookingNo} - ${booking.vehicleRegNo || 'No Vehicle'}`,
                    start: startDateTime,
                    end: endDateTime,
                    resource: booking,
                    statusColor: STATUS_CONFIG[booking.status]?.color || '#6c757d',
                    priorityColor: priorityConfig.color,
                    priorityIcon: priorityConfig.icon,
                    priorityLabel: priorityConfig.label
                };
            });
            setEvents(calendarEvents);
        } catch (error) {
            console.error('Error loading bookings:', error);
            showError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const start = moment(date).startOf(view).toDate();
        const end = moment(date).endOf(view).toDate();
        loadBookings(start, end);
    }, [date, view]);

    // Context menu handlers - FIXED SCROLL ISSUE
    const openContextMenu = useCallback((e, type, data) => {
        e.preventDefault();
        e.stopPropagation();

        // Use clientX/clientY for fixed positioning
        const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;

        setContextMenu({
            type: type,
            date: type === 'date' ? moment(data).format('YYYY-MM-DD') : null,
            booking: type === 'booking' ? data : null,
            x: x + 10,
            y: y + 10
        });
    }, []);

    const handleDateClick = (date, e) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
            showError('Back date booking allowed nahi hai! Aaj ya future date select karo.');
            return;
        }
        openContextMenu(e, 'date', date);
    };

    const handleEventClick = (event, e) => {
        openContextMenu(e, 'booking', event.resource);
    };

    // Close context menu on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (contextMenu && !e.target.closest('.booking-context-menu')) {
                setContextMenu(null);
            }
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [contextMenu]);

    // Clean up context menu on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (contextMenu) {
                setContextMenu(null);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [contextMenu]);

    // Menu actions
    const handleNewBooking = () => {
        setSelectedDate(contextMenu.date);
        setSelectedEvent(null);
        setShowModal(true);
        setContextMenu(null);
    };

    const handleEditBooking = (booking) => {
        setSelectedEvent(booking);
        setSelectedDate(moment(booking.bookingDate).format('YYYY-MM-DD'));
        setShowModal(true);
        setContextMenu(null);
    };

    // ✅ FIXED STATUS CHANGE - With proper error handling
    const handleStatusChange = async (booking, newStatus) => {
        setContextMenu(null);
        showConfirm(`Status change karna hai to ${STATUS_CONFIG[newStatus]?.label}?`, async () => {
            try {
                setLoading(true);

                console.log("🔄 Status Change Request:");
                console.log("Booking ID:", booking.bookingID);
                console.log("New Status:", newStatus);

                // ✅ Query parameter format
                const response = await bookingApi.updateStatus(booking.bookingID, newStatus);

                console.log("✅ Response:", response);
                showSuccess(`Status update ho gaya: ${STATUS_CONFIG[newStatus]?.label}`);

                const start = moment(date).startOf(view).toDate();
                const end = moment(date).endOf(view).toDate();
                await loadBookings(start, end);
            } catch (error) {
                console.error("❌ Error:", error);
                showError(error.response?.data?.message || 'Status update nahi hua');
            } finally {
                setLoading(false);
            }
        }, 'Change Status');
    };

    const handlePriorityChange = async (booking, newPriority) => {
        setContextMenu(null);
        showConfirm(`Priority change karni hai to ${PRIORITY_CONFIG[newPriority]?.label}?`, async () => {
            try {
                setLoading(true);

                console.log("🔄 Priority Change Request:");
                console.log("Booking ID:", booking.bookingID);
                console.log("New Priority:", newPriority);

                // ✅ Wait for API call to complete
                await bookingApi.updatePriority(booking.bookingID, newPriority);

                showSuccess(`Priority update ho gayi: ${PRIORITY_CONFIG[newPriority]?.label}`);

                // ✅ Refresh calendar
                const start = moment(date).startOf(view).toDate();
                const end = moment(date).endOf(view).toDate();
                await loadBookings(start, end);  // ✅ Refresh events
            } catch (error) {
                console.error('Priority update error:', error);
                showError(error.response?.data?.message || 'Priority update nahi hui');
            } finally {
                setLoading(false);
            }
        }, 'Change Priority');
    };

    const handleDeleteBooking = async (booking) => {
        setContextMenu(null);
        showConfirm(`Booking "${booking.bookingNo}" delete karni hai?`, async () => {
            try {
                setLoading(true);
                await bookingApi.delete(booking.bookingID);
                showSuccess('Booking delete ho gayi');

                const start = moment(date).startOf(view).toDate();
                const end = moment(date).endOf(view).toDate();
                await loadBookings(start, end);
            } catch (error) {
                console.error('Delete error:', error);
                showError(error.response?.data?.message || 'Delete nahi hui');
            } finally {
                setLoading(false);
            }
        }, 'Delete Booking');
    };

    const handlePrintSlip = (booking) => {
        setSelectedBookingForSlip(booking);
        setShowSlip(true);
        setContextMenu(null);
    };

    // Event styling
    const eventStyleGetter = (event) => {
        const priorityConfig = PRIORITY_CONFIG[event.resource?.priority] || PRIORITY_CONFIG.Normal;
        return {
            style: {
                backgroundColor: event.statusColor,
                borderRadius: '4px',
                borderLeft: `4px solid ${priorityConfig.color}`,
                color: 'white',
                fontSize: '11px',
                padding: '2px 6px',
                cursor: 'pointer',
                opacity: event.resource?.status === 'Cancelled' ? 0.6 : 0.9
            }
        };
    };

    // Custom date cell
    const CustomDateCell = ({ date, label }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isPastDate = date < today;

        const dayEvents = events.filter(
            e => moment(e.start).format('YYYY-MM-DD') === moment(date).format('YYYY-MM-DD')
        );

        return (
            <div
                onClick={(e) => !isPastDate && handleDateClick(date, e)}
                style={{
                    height: '100%',
                    width: '100%',
                    cursor: isPastDate ? 'not-allowed' : 'pointer',
                    opacity: isPastDate ? 0.5 : 1,
                    background: isPastDate ? '#f8f9fa' : 'transparent'
                }}
                title={isPastDate ? 'Back date booking allowed nahi' : 'Click to add booking'}
            >
                <span style={{ fontWeight: 500, color: isPastDate ? '#adb5bd' : '#212529' }}>
                    {label}
                </span>
                {dayEvents.length > 0 && (
                    <div style={{ marginTop: '4px' }}>
                        {dayEvents.slice(0, 3).map((e, i) => {
                            const priorityConfig = PRIORITY_CONFIG[e.resource?.priority] || PRIORITY_CONFIG.Normal;
                            return (
                                <div
                                    key={i}
                                    style={{
                                        height: '3px',
                                        backgroundColor: e.statusColor,
                                        borderRadius: '2px',
                                        marginBottom: '2px',
                                        borderLeft: `2px solid ${priorityConfig.color}`
                                    }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    // Custom toolbar
    const CustomToolbar = ({ label, onView, onNavigate, view }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                    style={{ padding: '6px 12px', border: '1px solid #dee2e6', background: 'white', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => onNavigate('PREV')}
                >
                    ◀
                </button>
                <button
                    style={{ padding: '6px 12px', border: '1px solid #dee2e6', background: 'white', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => onNavigate('TODAY')}
                >
                    Today
                </button>
                <button
                    style={{ padding: '6px 12px', border: '1px solid #dee2e6', background: 'white', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => onNavigate('NEXT')}
                >
                    ▶
                </button>
                <span style={{ fontSize: '16px', fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
                {['month', 'week', 'day', 'agenda'].map(v => (
                    <button
                        key={v}
                        style={{
                            padding: '6px 12px',
                            border: '1px solid #dee2e6',
                            background: view === v ? '#1976d2' : 'white',
                            color: view === v ? 'white' : '#212529',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                        onClick={() => onView(v)}
                    >
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                ))}
            </div>
        </div>
    );

    // Statistics
    const stats = {
        Pending: events.filter(e => e.resource?.status === 'Pending').length,
        Confirmed: events.filter(e => e.resource?.status === 'Confirmed').length,
        InProgress: events.filter(e => e.resource?.status === 'InProgress').length,
        Completed: events.filter(e => e.resource?.status === 'Completed').length,
        Cancelled: events.filter(e => e.resource?.status === 'Cancelled').length
    };

    return (
        <div className="booking-calendar-modern">
            <PageHeader
                title="Booking Diary"
                icon={<FaCalendarAlt />}
                addButtonText="New Booking"
                onAdd={() => {
                    setSelectedDate(moment().format('YYYY-MM-DD'));
                    setSelectedEvent(null);
                    setShowModal(true);
                }}
            />

            <div className="booking-status-summary">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <div key={key} className="booking-status-card" style={{ borderLeftColor: config.color }}>
                        <span className="booking-status-icon">{config.icon}</span>
                        <div className="booking-status-info">
                            <span className="booking-status-count">{stats[key] || 0}</span>
                            <span className="booking-status-label">{config.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div ref={calendarRef} className="calendar-container">
                {loading && <div className="loading-spinner">Loading...</div>}
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 600 }}
                    views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                    defaultView={Views.MONTH}
                    view={view}
                    onView={setView}
                    date={date}
                    onNavigate={setDate}
                    components={{
                        toolbar: CustomToolbar,
                        month: {
                            dateHeader: CustomDateCell
                        }
                    }}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={handleEventClick}
                />
            </div>

            {/* Context Menu - Date */}
            {contextMenu && contextMenu.type === 'date' && (
                <div className="booking-context-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
                    <div className="menu-header"><FaCalendarAlt /> {contextMenu.date}</div>
                    <div className="menu-item" onClick={handleNewBooking}>
                        <FaPlus /> New Booking
                    </div>
                </div>
            )}

            {/* Context Menu - Booking */}
            {contextMenu && contextMenu.type === 'booking' && contextMenu.booking && (
                <div className="booking-context-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
                    <div className="menu-header">
                        {contextMenu.booking.bookingNo}
                        <span className="priority-badge" style={{
                            background: PRIORITY_CONFIG[contextMenu.booking.priority]?.bgColor || '#f8f9fa',
                            color: PRIORITY_CONFIG[contextMenu.booking.priority]?.color
                        }}>
                            {PRIORITY_CONFIG[contextMenu.booking.priority]?.icon} {contextMenu.booking.priority || 'Normal'}
                        </span>
                    </div>
                    <div className="menu-item" onClick={() => handleEditBooking(contextMenu.booking)}>
                        <FaEdit /> Edit Booking
                    </div>
                    <div className="menu-item" onClick={() => handlePrintSlip(contextMenu.booking)}>
                        🖨️ Print Slip
                    </div>

                    <div className="menu-divider"></div>
                    <div className="menu-subheader"><FaFlag /> Change Priority</div>
                    <div className="menu-item" onClick={() => handlePriorityChange(contextMenu.booking, 'Low')}>
                        🟢 Low
                    </div>
                    <div className="menu-item" onClick={() => handlePriorityChange(contextMenu.booking, 'Normal')}>
                        🔵 Normal
                    </div>
                    <div className="menu-item" onClick={() => handlePriorityChange(contextMenu.booking, 'High')}>
                        🟠 High
                    </div>
                    <div className="menu-item" onClick={() => handlePriorityChange(contextMenu.booking, 'Urgent')}>
                        🔴 Urgent
                    </div>

                    <div className="menu-divider"></div>
                    <div className="menu-subheader">Change Status</div>
                    <div className="menu-item" onClick={() => handleStatusChange(contextMenu.booking, 'Pending')}>
                        ⏳ Pending
                    </div>
                    <div className="menu-item" onClick={() => handleStatusChange(contextMenu.booking, 'Confirmed')}>
                        ✅ Confirmed
                    </div>
                    <div className="menu-item" onClick={() => handleStatusChange(contextMenu.booking, 'InProgress')}>
                        🔧 In Progress
                    </div>
                    <div className="menu-item" onClick={() => handleStatusChange(contextMenu.booking, 'Completed')}>
                        ✔️ Completed
                    </div>
                    <div className="menu-item" onClick={() => handleStatusChange(contextMenu.booking, 'Cancelled')}>
                        ❌ Cancelled
                    </div>

                    <div className="menu-divider"></div>
                    <div className="menu-item delete-item" onClick={() => handleDeleteBooking(contextMenu.booking)}>
                        <FaTrash /> Delete
                    </div>
                </div>
            )}

            {showModal && (
                <BookingModal
                    date={selectedDate}
                    booking={selectedEvent}
                    onClose={() => { setShowModal(false); setSelectedDate(null); setSelectedEvent(null); }}
                    onSaved={() => {
                        const start = moment(date).startOf(view).toDate();
                        const end = moment(date).endOf(view).toDate();
                        loadBookings(start, end);
                        setShowModal(false);
                    }}
                    onPrint={(d) => { setSelectedBookingForSlip(d); setShowSlip(true); }}
                />
            )}

            {showSlip && selectedBookingForSlip && (
                <BookingSlip
                    booking={selectedBookingForSlip}
                    onClose={() => { setShowSlip(false); setSelectedBookingForSlip(null); }}
                />
            )}
        </div>
    );
}