import React, { useEffect, useState } from "react";
import notificationApi from "../../../api/notificationApi";
import axiosClient from "../../../api/axiosClient";
import { FaUser, FaPhone, FaEnvelope, FaWhatsapp, FaSave } from "react-icons/fa";
import { Button, useDialog } from "../../../components/common";
import { PageHeader, EmptyState } from "../../../components/features";
import "./Notifications.css";

export default function CustomerPreferencesPage() {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const { showSuccess, showError } = useDialog();

    const [form, setForm] = useState({
        customerID: 0, preferSMS: true, preferEmail: true, preferWhatsApp: false,
        smsNumber: "", emailAddress: "", whatsAppNumber: "",
        allowMarketing: false, allowServiceReminders: true, allowJobUpdates: true, language: "EN"
    });

    const loadCustomers = async () => {
        try {
            const res = await axiosClient.get("/Coa/customers");
            setCustomers(res.data?.data || res.data || []);
        } catch (error) { console.error("Error loading customers:", error); }
    };

    useEffect(() => { loadCustomers(); }, []);

    const loadPreferences = async (customerId) => {
        setLoading(true);
        try {
            const res = await notificationApi.getPreferences(customerId);
            let data = res.data?.data || res.data;
            if (data) {
                setForm({
                    customerID: data.customerID, preferSMS: data.preferSMS, preferEmail: data.preferEmail, preferWhatsApp: data.preferWhatsApp,
                    smsNumber: data.smsNumber || "", emailAddress: data.emailAddress || "", whatsAppNumber: data.whatsAppNumber || "",
                    allowMarketing: data.allowMarketing, allowServiceReminders: data.allowServiceReminders, allowJobUpdates: data.allowJobUpdates, language: data.language || "EN"
                });
            } else {
                const customer = customers.find(c => c.acctID === customerId);
                setForm({ customerID: customerId, preferSMS: true, preferEmail: true, preferWhatsApp: false, smsNumber: customer?.cellNo || "", emailAddress: "", whatsAppNumber: "", allowMarketing: false, allowServiceReminders: true, allowJobUpdates: true, language: "EN" });
            }
        } catch (error) { console.error("Error loading preferences:", error); }
        finally { setLoading(false); }
    };

    const handleCustomerSelect = (customer) => {
        setSelectedCustomer(customer);
        loadPreferences(customer.acctID);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await notificationApi.updatePreferences(form);
            showSuccess("Preferences updated successfully");
            loadPreferences(form.customerID);
        } catch (error) { showError(error.response?.data?.message || "Failed to save preferences"); }
        finally { setSaving(false); }
    };

    const filteredCustomers = customers.filter(c => c.acctName?.toLowerCase().includes(searchTerm.toLowerCase()) || c.cellNo?.includes(searchTerm));

    return (
        <div className="preferences-page-premium">
            <PageHeader title="Customer Notification Preferences" icon={<FaUser />} />
            <div className="preferences-layout">
                <div className="customer-list-panel">
                    <input type="text" placeholder="Search customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
                    <div className="customer-list">
                        {filteredCustomers.map(c => (
                            <div key={c.acctID} className={`customer-item ${selectedCustomer?.acctID === c.acctID ? 'selected' : ''}`} onClick={() => handleCustomerSelect(c)}>
                                <div className="customer-name">{c.acctName}</div>
                                <div className="customer-phone">{c.cellNo || 'No phone'}</div>
                            </div>
                        ))}
                        {filteredCustomers.length === 0 && <div className="no-data">No customers found</div>}
                    </div>
                </div>
                <div className="preferences-form-panel">
                    {selectedCustomer ? (
                        loading ? (<div className="loading-container"><div className="spinner"></div><p>Loading preferences...</p></div>) : (
                            <form onSubmit={handleSubmit}>
                                <h3>Preferences for {selectedCustomer.acctName}</h3>
                                <div className="form-section"><h4><FaPhone /> Contact Information</h4>
                                    <div className="form-group"><label>SMS Number</label><input type="text" name="smsNumber" value={form.smsNumber} onChange={handleChange} className="form-input" placeholder="+92XXXXXXXXXX" /></div>
                                    <div className="form-group"><label>Email Address</label><input type="email" name="emailAddress" value={form.emailAddress} onChange={handleChange} className="form-input" placeholder="customer@example.com" /></div>
                                    <div className="form-group"><label>WhatsApp Number</label><input type="text" name="whatsAppNumber" value={form.whatsAppNumber} onChange={handleChange} className="form-input" placeholder="+92XXXXXXXXXX" /></div>
                                </div>
                                <div className="form-section"><h4>Notification Channels</h4>
                                    <div className="checkbox-group"><label><input type="checkbox" name="preferSMS" checked={form.preferSMS} onChange={handleChange} /> SMS Notifications</label></div>
                                    <div className="checkbox-group"><label><input type="checkbox" name="preferEmail" checked={form.preferEmail} onChange={handleChange} /> Email Notifications</label></div>
                                    <div className="checkbox-group"><label><input type="checkbox" name="preferWhatsApp" checked={form.preferWhatsApp} onChange={handleChange} /> WhatsApp Notifications</label></div>
                                </div>
                                <div className="form-section"><h4>Notification Types</h4>
                                    <div className="checkbox-group"><label><input type="checkbox" name="allowServiceReminders" checked={form.allowServiceReminders} onChange={handleChange} /> Service Reminders</label></div>
                                    <div className="checkbox-group"><label><input type="checkbox" name="allowJobUpdates" checked={form.allowJobUpdates} onChange={handleChange} /> Job Updates</label></div>
                                    <div className="checkbox-group"><label><input type="checkbox" name="allowMarketing" checked={form.allowMarketing} onChange={handleChange} /> Marketing & Promotions</label></div>
                                </div>
                                <div className="form-group"><label>Preferred Language</label><select name="language" value={form.language} onChange={handleChange} className="form-select"><option value="EN">English</option><option value="UR">Urdu</option></select></div>
                                <div className="form-actions"><Button type="submit" variant="primary" loading={saving} icon={<FaSave />}>Save Preferences</Button></div>
                            </form>
                        )
                    ) : (<EmptyState icon={<FaUser />} title="No customer selected" description="Select a customer from the list to manage their notification preferences" />)}
                </div>
            </div>
        </div>
    );
}