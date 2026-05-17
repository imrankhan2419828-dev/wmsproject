//import axiosClient from "./axiosClient";

//const API_URL = "/Booking";

//const bookingApi = {
//    // Get bookings by date
//    getByDate: (date) => axiosClient.get(`${API_URL}/date/${date}`),

//    // Get bookings by date range
//    getByDateRange: (fromDate, toDate) =>
//        axiosClient.get(`${API_URL}/range?fromDate=${fromDate}&toDate=${toDate}`),

//    // Get booking by ID
//    getById: (id) => axiosClient.get(`${API_URL}/${id}`),

//    // Create new booking
//    create: (data) => axiosClient.post(API_URL, data),

//    // Update booking
//    update: (id, data) => axiosClient.put(`${API_URL}/${id}`, data),

//    // Update booking status
//    updateStatus: (id, status) => axiosClient.patch(`${API_URL}/${id}/status`, { status }),


//    // Delete booking
//    delete: (id) => axiosClient.delete(`${API_URL}/${id}`),

//    // Convert booking to job card
//    convertToJobCard: (id, data) => axiosClient.post(`${API_URL}/${id}/convert`, data),

//    // Get available time slots
//    getAvailableTimeSlots: (date, technicianId) => {
//        let url = `${API_URL}/time-slots/available?date=${date}`;
//        if (technicianId) url += `&technicianId=${technicianId}`;
//        return axiosClient.get(url);
//    },

//    // Get all time slots
//    getAllTimeSlots: () => axiosClient.get(`${API_URL}/time-slots`),

//    // Get daily summary
//    getDailySummary: (date) => axiosClient.get(`${API_URL}/daily-summary/${date}`),

//    // Get bookings by vehicle
//    getByVehicle: (vehicleId) => axiosClient.get(`${API_URL}/vehicle/${vehicleId}`)
//};

//export default bookingApi;

import axiosClient from "./axiosClient";

const API_URL = "/Booking";

const bookingApi = {
    // Get bookings by date
    getByDate: (date) => axiosClient.get(`${API_URL}/date/${date}`),

    // Get bookings by date range
    getByDateRange: (fromDate, toDate) =>
        axiosClient.get(`${API_URL}/range?fromDate=${fromDate}&toDate=${toDate}`),

    // Get booking by ID
    getById: (id) => axiosClient.get(`${API_URL}/${id}`),

    // Create new booking
    create: (data) => axiosClient.post(API_URL, data),

    // Update booking
    update: (id, data) => axiosClient.put(`${API_URL}/${id}`, data),

    // ✅ FIXED: Update booking status - using query parameter
    updateStatus: (id, status) => axiosClient.put(`/Booking/${id}/status`, { status: status }),

    updatePriority: (id, priority) => axiosClient.patch(`${API_URL}/${id}/priority`, { priority: priority }),

    // Delete booking
    delete: (id) => axiosClient.delete(`${API_URL}/${id}`),

    // Convert booking to job card
    convertToJobCard: (id, data) => axiosClient.post(`${API_URL}/${id}/convert`, data),

    // Get available time slots
    getAvailableTimeSlots: (date, technicianId) => {
        let url = `${API_URL}/time-slots/available?date=${date}`;
        if (technicianId) url += `&technicianId=${technicianId}`;
        return axiosClient.get(url);
    },

    // Get all time slots
    getAllTimeSlots: () => axiosClient.get(`${API_URL}/time-slots`),

    // Get daily summary
    getDailySummary: (date) => axiosClient.get(`${API_URL}/daily-summary/${date}`),

    // Get bookings by vehicle
    getByVehicle: (vehicleId) => axiosClient.get(`${API_URL}/vehicle/${vehicleId}`)
};

export default bookingApi;