//import React, { useEffect, useState, useCallback } from "react";
//import jobCardApi from "../../../api/jobCardApi";
//import vehicleApi from "../../../api/vehicleApi";
//import technicianApi from "../../../api/technicianApi";
//import serviceCatalogApi from "../../../api/serviceCatalogApi";
//import itemApi from "../../../api/itemApi";
//import godownApi from "../../../api/godownApi";
//import { Modal } from "../../../components/common/Modal/Modal";
//import { Button, ReactSelect, useDialog } from "../../../components/common";
//import { FaClipboardList, FaCar, FaUser, FaUserCog, FaWrench, FaCog, FaPlus, FaTrash, FaWarehouse, FaBoxes } from "react-icons/fa";
//import "./JobCard.css";

//export default function JobCardModal({ jobCard, onClose, onSaved }) {
//    const isEdit = !!jobCard?.jobCardID;
//    const [vehicles, setVehicles] = useState([]);
//    const [technicians, setTechnicians] = useState([]);
//    const [serviceCatalog, setServiceCatalog] = useState([]);
//    const [items, setItems] = useState([]);
//    const [godowns, setGodowns] = useState([]);
//    const [loading, setLoading] = useState(false);
//    const [error, setError] = useState("");
//    const [activeTab, setActiveTab] = useState("basic");
//    const [manualVehicleNo, setManualVehicleNo] = useState("");
//    const [isNewVehicle, setIsNewVehicle] = useState(false);
//    const [itemStockMap, setItemStockMap] = useState({});
//    const [initialDataLoaded, setInitialDataLoaded] = useState(false);
//    const { showSuccess, showError } = useDialog();

//    const [form, setForm] = useState({
//        jobCardID: 0,
//        vehicleID: "",
//        serviceAdvisorName: "",
//        technicianID: "",
//        receivedDate: new Date().toISOString().split('T')[0],
//        promisedDate: "",
//        customerComplaint: "",
//        technicianFindings: "",
//        recommendations: "",
//        services: [],
//        parts: []
//    });

//    const vehicleOptions = vehicles.map(v => ({ value: v.vehicleID?.toString(), label: `${v.registrationNo} - ${v.make} ${v.model}` }));
//    const technicianOptions = technicians.map(t => ({ value: t.technicianID?.toString(), label: t.fullName }));
//    const serviceOptions = serviceCatalog.map(s => ({ value: s.serviceID?.toString(), label: `${s.serviceName} - Rs.${s.defaultLaborRate}` }));
//    const itemOptions = items.map(i => ({ value: i.itemID?.toString(), label: `${i.itemName} - Rs.${i.saleRate}` }));
//    const godownOptions = godowns.map(g => ({ value: g.godnID?.toString(), label: g.godnName }));

//    // Load item stock
//    const loadItemStock = async (branchId) => {
//        const stockMap = {};
//        for (const item of items) {
//            try {
//                const res = await itemApi.getStock(item.itemID, branchId);
//                const stockValue = res.data?.data || res.data || 0;
//                stockMap[item.itemID] = typeof stockValue === 'number' ? stockValue : Number(stockValue) || 0;
//            } catch (err) {
//                stockMap[item.itemID] = 0;
//            }
//        }
//        setItemStockMap(stockMap);
//    };

//    // Load godowns
//    const loadGodowns = async () => {
//        try {
//            const res = await godownApi.getAll();
//            const godownsData = res.data?.data || res.data || [];
//            setGodowns(godownsData);
//        } catch (err) {
//            console.error("Error loading godowns:", err);
//        }
//    };

//    // Load initial data only once
//    useEffect(() => {
//        const loadData = async () => {
//            try {
//                const [vehiclesRes, techniciansRes, servicesRes, itemsRes] = await Promise.all([
//                    vehicleApi.getAll(),
//                    technicianApi.getAll(),
//                    serviceCatalogApi.getAll(),
//                    itemApi.getAll()
//                ]);
//                setVehicles(vehiclesRes.data?.data || vehiclesRes.data || []);
//                setTechnicians(techniciansRes.data?.data || techniciansRes.data || []);
//                setServiceCatalog(servicesRes.data?.data || servicesRes.data || []);
//                setItems(itemsRes.data?.data || itemsRes.data || []);
//                await loadGodowns();
//                setInitialDataLoaded(true);
//            } catch (err) {
//                console.error("Error loading data:", err);
//                setInitialDataLoaded(true);
//            }
//        };
//        loadData();
//    }, []);

//    // Load stock after items are loaded
//    useEffect(() => {
//        if (items.length > 0) {
//            const branchId = localStorage.getItem('branchId') || 1;
//            loadItemStock(branchId);
//        }
//    }, [items]);

//    // ✅ FIXED: Populate form with ORIGINAL backend data (NO MOCK)
//    useEffect(() => {
//        if (!initialDataLoaded) {
//            return;
//        }

//        if (isEdit && jobCard && Object.keys(jobCard).length > 0) {
//            console.log("=== EDIT MODE: Loading ORIGINAL job card data ===");
//            console.log("JobCard object:", jobCard);
//            console.log("Services from API:", jobCard.services);
//            console.log("Parts from API:", jobCard.parts);
//            console.log("Services count:", jobCard.services?.length || 0);
//            console.log("Parts count:", jobCard.parts?.length || 0);

//            setForm({
//                jobCardID: jobCard.jobCardID || 0,
//                vehicleID: jobCard.vehicleID?.toString() || "",
//                serviceAdvisorName: jobCard.serviceAdvisorName || "",
//                technicianID: jobCard.technicianID?.toString() || "",
//                receivedDate: jobCard.receivedDate ? jobCard.receivedDate.split('T')[0] : new Date().toISOString().split('T')[0],
//                promisedDate: jobCard.promisedDate ? jobCard.promisedDate.split('T')[0] : "",
//                customerComplaint: jobCard.customerComplaint || "",
//                technicianFindings: jobCard.technicianFindings || "",
//                recommendations: jobCard.recommendations || "",

//                // Map services from backend (NO MOCK)
//                services: (jobCard.services || []).map((s, idx) => ({
//                    tempId: idx,
//                    jobServiceID: s.jobServiceID,
//                    serviceID: s.serviceID?.toString() || "",
//                    serviceName: s.serviceName || "",
//                    quantity: s.quantity || 1,
//                    unitPrice: s.unitPrice || 0,
//                    discountPercent: s.discountPercent || 0,
//                    technicianID: s.technicianID?.toString() || "",
//                    technicianName: s.technicianName || "",
//                    totalAmount: s.totalAmount || 0,
//                    status: s.status || "PENDING"
//                })),

//                // Map parts from backend (NO MOCK)
//                parts: (jobCard.parts || []).map((p, idx) => ({
//                    tempId: idx,
//                    jobPartID: p.jobPartID,
//                    itemID: p.itemID?.toString() || "",
//                    itemName: p.itemName || "",
//                    quantity: p.quantity || 1,
//                    unitPrice: p.unitPrice || 0,
//                    discountPercent: p.discountPercent || 0,
//                    godownID: p.godownID?.toString() || "",
//                    totalAmount: p.totalAmount || 0,
//                    stockSource: p.stockSource || "STOCK"
//                }))
//            });

//            console.log("Form populated with", jobCard.services?.length || 0, "services and", jobCard.parts?.length || 0, "parts");
//        } else if (!isEdit) {
//            // Reset form for new job card
//            setForm({
//                jobCardID: 0,
//                vehicleID: "",
//                serviceAdvisorName: "",
//                technicianID: "",
//                receivedDate: new Date().toISOString().split('T')[0],
//                promisedDate: "",
//                customerComplaint: "",
//                technicianFindings: "",
//                recommendations: "",
//                services: [],
//                parts: []
//            });
//        }
//    }, [jobCard, initialDataLoaded, isEdit]);

//    const handleChange = (e) => {
//        const { name, value } = e.target;
//        setForm(prev => ({ ...prev, [name]: value }));
//        if (error) setError("");
//    };

//    const handleVehicleSelect = (selected) => {
//        if (selected) {
//            setIsNewVehicle(false);
//            setManualVehicleNo("");
//            setForm(prev => ({ ...prev, vehicleID: selected.value }));
//        } else {
//            setForm(prev => ({ ...prev, vehicleID: "" }));
//        }
//    };

//    const handleManualVehicleChange = (e) => {
//        setManualVehicleNo(e.target.value);
//        if (e.target.value) {
//            setIsNewVehicle(true);
//            setForm(prev => ({ ...prev, vehicleID: "" }));
//        } else {
//            setIsNewVehicle(false);
//        }
//    };

//    const addService = () => {
//        setForm(prev => ({
//            ...prev,
//            services: [...prev.services, {
//                tempId: Date.now(),
//                serviceID: "",
//                serviceName: "",
//                quantity: 1,
//                unitPrice: 0,
//                discountPercent: 0,
//                technicianID: "",
//                totalAmount: 0
//            }]
//        }));
//    };

//    const updateService = (index, field, value) => {
//        const services = [...form.services];
//        services[index][field] = value;

//        if (field === 'serviceID' && value) {
//            const service = serviceCatalog.find(s => s.serviceID === parseInt(value));
//            if (service) {
//                services[index].unitPrice = service.defaultLaborRate || 0;
//                services[index].serviceName = service.serviceName || "";
//            }
//        }

//        const quantity = services[index].quantity || 1;
//        const unitPrice = services[index].unitPrice || 0;
//        const discountPercent = services[index].discountPercent || 0;
//        services[index].totalAmount = unitPrice * quantity * (1 - (discountPercent / 100));

//        setForm(prev => ({ ...prev, services }));
//    };

//    const removeService = (index) => {
//        setForm(prev => ({
//            ...prev,
//            services: prev.services.filter((_, i) => i !== index)
//        }));
//    };

//    const addPart = () => {
//        setForm(prev => ({
//            ...prev,
//            parts: [...prev.parts, {
//                tempId: Date.now(),
//                itemID: "",
//                itemName: "",
//                quantity: 1,
//                unitPrice: 0,
//                discountPercent: 0,
//                godownID: "",
//                totalAmount: 0
//            }]
//        }));
//    };

//    const updatePart = (index, field, value) => {
//        const parts = [...form.parts];
//        parts[index][field] = value;

//        if (field === 'itemID' && value) {
//            const item = items.find(i => i.itemID === parseInt(value));
//            if (item) {
//                parts[index].unitPrice = item.saleRate || 0;
//                parts[index].itemName = item.itemName || "";
//                if (item.godnID && !parts[index].godownID) {
//                    parts[index].godownID = item.godnID.toString();
//                }
//            }
//        }

//        const quantity = parts[index].quantity || 1;
//        const unitPrice = parts[index].unitPrice || 0;
//        const discountPercent = parts[index].discountPercent || 0;
//        parts[index].totalAmount = unitPrice * quantity * (1 - (discountPercent / 100));

//        setForm(prev => ({ ...prev, parts }));
//    };

//    const removePart = (index) => {
//        setForm(prev => ({
//            ...prev,
//            parts: prev.parts.filter((_, i) => i !== index)
//        }));
//    };

//    const validateForm = () => {
//        if (!form.vehicleID && !manualVehicleNo) {
//            setError("Please select or enter a vehicle");
//            return false;
//        }
//        return true;
//    };

//    const calculateTotal = useCallback(() => {
//        const servicesTotal = form.services.reduce((sum, s) => sum + ((s.unitPrice || 0) * (s.quantity || 1) * (1 - ((s.discountPercent || 0) / 100))), 0);
//        const partsTotal = form.parts.reduce((sum, p) => sum + ((p.unitPrice || 0) * (p.quantity || 1) * (1 - ((p.discountPercent || 0) / 100))), 0);
//        return servicesTotal + partsTotal;
//    }, [form.services, form.parts]);

//    const handleSubmit = async () => {
//        if (!validateForm()) return;
//        setLoading(true);
//        setError("");

//        try {
//            let vehicleId = form.vehicleID;

//            if (isNewVehicle && manualVehicleNo) {
//                try {
//                    const newVehicleRes = await vehicleApi.create({ registrationNo: manualVehicleNo });
//                    vehicleId = newVehicleRes.data?.data?.vehicleID || newVehicleRes.data?.vehicleID;
//                    if (!vehicleId) throw new Error("Failed to create vehicle");
//                    showSuccess(`Vehicle ${manualVehicleNo} registered successfully`);
//                } catch (err) {
//                    setError(`Failed to register vehicle: ${err.response?.data?.message || err.message}`);
//                    setLoading(false);
//                    return;
//                }
//            }

//            if (!vehicleId) {
//                setError("Vehicle ID is required");
//                setLoading(false);
//                return;
//            }

//            const payload = {
//                // ✅ CRITICAL FIX: Add jobCardID for update
//                jobCardID: form.jobCardID,  // <--- YEH ADD KARO
//                vehicleID: parseInt(vehicleId),
//                serviceAdvisorName: form.serviceAdvisorName || null,
//                technicianID: form.technicianID ? parseInt(form.technicianID) : null,
//                receivedDate: form.receivedDate,
//                promisedDate: form.promisedDate || null,
//                customerComplaint: form.customerComplaint || null,
//                technicianFindings: form.technicianFindings || null,
//                recommendations: form.recommendations || null,
//                services: form.services.filter(s => s.serviceID).map(s => ({
//                    serviceID: parseInt(s.serviceID),
//                    quantity: s.quantity || 1,
//                    unitPrice: parseFloat(s.unitPrice) || 0,
//                    discountPercent: parseFloat(s.discountPercent) || 0,
//                    technicianID: s.technicianID ? parseInt(s.technicianID) : null
//                })),
//                parts: form.parts.filter(p => p.itemID).map(p => ({
//                    itemID: parseInt(p.itemID),
//                    quantity: parseFloat(p.quantity) || 1,
//                    unitPrice: parseFloat(p.unitPrice) || 0,
//                    discountPercent: parseFloat(p.discountPercent) || 0,
//                    godownID: p.godownID ? parseInt(p.godownID) : null
//                }))
//            };

//            console.log("Submitting payload:", payload);
//            console.log("Is Edit:", isEdit);
//            console.log("JobCard ID being sent:", payload.jobCardID);

//            if (isEdit) {
//                // ✅ Make sure we pass the correct ID
//                const updateId = form.jobCardID;
//                console.log("Updating job card with ID:", updateId);
//                await jobCardApi.update(updateId, payload);
//                showSuccess("Job card updated successfully");
//            } else {
//                const response = await jobCardApi.create(payload);
//                console.log("Create response:", response);
//                showSuccess("Job card created successfully");
//            }

//            onSaved();
//            onClose();
//        } catch (err) {
//            console.error("Save error:", err);
//            console.error("Error response:", err.response?.data);
//            showError(err.response?.data?.message || "Failed to save job card");
//        } finally {
//            setLoading(false);
//        }
//    };

//    const modalFooter = (
//        <div className="jobcard-modal-footer">
//            <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
//            <Button variant="primary" onClick={handleSubmit} loading={loading}>
//                {isEdit ? "Update" : "Create"} Job Card
//            </Button>
//        </div>
//    );

//    const getSafeStockValue = (itemId) => {
//        const stock = itemStockMap[itemId];
//        if (typeof stock === 'number') return stock;
//        if (typeof stock === 'string') return parseFloat(stock) || 0;
//        return 0;
//    };

//    return (
//        <Modal isOpen={true} onClose={onClose} title={<><FaClipboardList /> {isEdit ? "Edit Job Card" : "New Job Card"}</>} size="xl" footer={modalFooter}>
//            <div className="jobcard-modal-container">
//                <div className="jobcard-modal-tabs">
//                    <button type="button" className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`} onClick={() => setActiveTab('basic')}>
//                        Basic Info
//                    </button>
//                    <button type="button" className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
//                        Services ({form.services.length})
//                    </button>
//                    <button type="button" className={`tab-btn ${activeTab === 'parts' ? 'active' : ''}`} onClick={() => setActiveTab('parts')}>
//                        Parts ({form.parts.length})
//                    </button>
//                </div>

//                {error && <div className="error-message">{error}</div>}

//                {/* Basic Info Tab - Same as before */}
//                {activeTab === 'basic' && (
//                    <div className="basic-info-tab">
//                        <div className="form-row-2">
//                            <div className="form-group">
//                                <label><FaCar /> Vehicle (Select)</label>
//                                <ReactSelect
//                                    value={vehicleOptions.find(v => v.value === form.vehicleID)}
//                                    onChange={handleVehicleSelect}
//                                    options={vehicleOptions}
//                                    placeholder="Select vehicle..."
//                                    isDisabled={loading || isNewVehicle}
//                                />
//                            </div>
//                            <div className="form-group">
//                                <label><FaCar /> Or Enter New Vehicle</label>
//                                <input
//                                    type="text"
//                                    value={manualVehicleNo}
//                                    onChange={handleManualVehicleChange}
//                                    placeholder="Enter registration number for new vehicle"
//                                    className="form-input"
//                                    disabled={loading || !!form.vehicleID}
//                                />
//                            </div>
//                        </div>

//                        <div className="form-row-2">
//                            <div className="form-group">
//                                <label><FaUser /> Service Advisor</label>
//                                <input type="text" name="serviceAdvisorName" value={form.serviceAdvisorName} onChange={handleChange} placeholder="Enter service advisor name" className="form-input" disabled={loading} />
//                            </div>
//                            <div className="form-group">
//                                <label><FaUserCog /> Primary Technician</label>
//                                <ReactSelect value={technicianOptions.find(t => t.value === form.technicianID)} onChange={(selected) => setForm(prev => ({ ...prev, technicianID: selected?.value }))} options={technicianOptions} placeholder="Select technician..." isClearable isDisabled={loading} />
//                            </div>
//                        </div>

//                        <div className="form-row-2">
//                            <div className="form-group"><label>Received Date</label><input type="date" name="receivedDate" value={form.receivedDate} onChange={handleChange} className="form-input" disabled={loading} /></div>
//                            <div className="form-group"><label>Promised Date</label><input type="date" name="promisedDate" value={form.promisedDate} onChange={handleChange} className="form-input" disabled={loading} /></div>
//                        </div>

//                        <div className="form-group"><label>Customer Complaint</label><textarea name="customerComplaint" value={form.customerComplaint} onChange={handleChange} rows="2" className="form-textarea" placeholder="What did the customer report?" disabled={loading} /></div>
//                        <div className="form-group"><label>Technician Findings</label><textarea name="technicianFindings" value={form.technicianFindings} onChange={handleChange} rows="2" className="form-textarea" placeholder="What did the technician find?" disabled={loading} /></div>
//                        <div className="form-group"><label>Recommendations</label><textarea name="recommendations" value={form.recommendations} onChange={handleChange} rows="2" className="form-textarea" placeholder="Any recommendations?" disabled={loading} /></div>
//                    </div>
//                )}

//                {/* Services Tab */}
//                {activeTab === 'services' && (
//                    <div className="services-tab">
//                        <div className="items-header">
//                            <h4><FaWrench /> Services</h4>
//                            <Button variant="primary" size="sm" onClick={addService} icon={<FaPlus />}>Add Service</Button>
//                        </div>

//                        {form.services.length === 0 ? (
//                            <div className="no-items">No services added. Click "Add Service" to add.</div>
//                        ) : (
//                            <div className="items-list">
//                                {form.services.map((service, index) => (
//                                    <div key={service.tempId || index} className="item-row">
//                                        <div className="item-row-header">
//                                            <span className="item-index">Service #{index + 1}</span>
//                                            <button type="button" className="remove-btn" onClick={() => removeService(index)}><FaTrash /></button>
//                                        </div>
//                                        <div className="item-row-content">
//                                            <div className="item-field"><label>Service</label><ReactSelect value={serviceOptions.find(s => s.value === service.serviceID)} onChange={(selected) => updateService(index, 'serviceID', selected?.value)} options={serviceOptions} placeholder="Select service..." isDisabled={loading} /></div>
//                                            <div className="item-field"><label>Quantity</label><input type="number" value={service.quantity} onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)} min="1" className="form-input-sm" disabled={loading} /></div>
//                                            <div className="item-field"><label>Rate (Rs.)</label><input type="number" value={service.unitPrice} onChange={(e) => updateService(index, 'unitPrice', parseFloat(e.target.value) || 0)} step="0.01" className="form-input-sm" disabled={loading} /></div>
//                                            <div className="item-field"><label>Discount %</label><input type="number" value={service.discountPercent} onChange={(e) => updateService(index, 'discountPercent', parseFloat(e.target.value) || 0)} min="0" max="100" className="form-input-sm" disabled={loading} /></div>
//                                            <div className="item-field"><label>Technician</label><ReactSelect value={technicianOptions.find(t => t.value === service.technicianID)} onChange={(selected) => updateService(index, 'technicianID', selected?.value)} options={technicianOptions} placeholder="Assign technician..." isClearable isDisabled={loading} /></div>
//                                            <div className="item-field total-field"><label>Total</label><div className="total-amount">Rs. {(service.totalAmount || 0).toFixed(2)}</div></div>
//                                        </div>
//                                    </div>
//                                ))}
//                            </div>
//                        )}
//                    </div>
//                )}

//                {/* Parts Tab */}
//                {activeTab === 'parts' && (
//                    <div className="parts-tab">
//                        <div className="items-header">
//                            <h4><FaCog /> Parts</h4>
//                            <Button variant="primary" size="sm" onClick={addPart} icon={<FaPlus />}>Add Part</Button>
//                        </div>

//                        {form.parts.length === 0 ? (
//                            <div className="no-items">No parts added. Click "Add Part" to add.</div>
//                        ) : (
//                            <div className="items-list">
//                                {form.parts.map((part, index) => {
//                                    const selectedItem = items.find(i => i.itemID === parseInt(part.itemID));
//                                    const currentStock = getSafeStockValue(selectedItem?.itemID);
//                                    const quantity = Number(part.quantity) || 0;
//                                    const isLowStock = currentStock < quantity;
//                                    const totalAmount = Number(part.totalAmount) || 0;

//                                    return (
//                                        <div key={part.tempId || index} className="item-row">
//                                            <div className="item-row-header">
//                                                <span className="item-index">Part #{index + 1}</span>
//                                                <button type="button" className="remove-btn" onClick={() => removePart(index)}><FaTrash /></button>
//                                            </div>
//                                            <div className="item-row-content">
//                                                <div className="item-field"><label>Part</label><ReactSelect value={itemOptions.find(i => i.value === part.itemID)} onChange={(selected) => updatePart(index, 'itemID', selected?.value)} options={itemOptions} placeholder="Select part..." isDisabled={loading} /></div>
//                                                <div className="item-field"><label>Quantity</label><input type="number" value={quantity} onChange={(e) => updatePart(index, 'quantity', parseFloat(e.target.value) || 1)} min="1" step="0.01" className={`form-input-sm ${isLowStock ? 'error-border' : ''}`} disabled={loading} /></div>
//                                                <div className="item-field"><label>Rate (Rs.)</label><input type="number" value={part.unitPrice} onChange={(e) => updatePart(index, 'unitPrice', parseFloat(e.target.value) || 0)} step="0.01" className="form-input-sm" disabled={loading} /></div>
//                                                <div className="item-field"><label>Discount %</label><input type="number" value={part.discountPercent} onChange={(e) => updatePart(index, 'discountPercent', parseFloat(e.target.value) || 0)} min="0" max="100" className="form-input-sm" disabled={loading} /></div>
//                                                <div className="item-field"><label><FaWarehouse /> Godown</label><ReactSelect value={godownOptions.find(g => g.value === part.godownID)} onChange={(selected) => updatePart(index, 'godownID', selected?.value)} options={godownOptions} placeholder="Select godown..." isDisabled={loading} /></div>
//                                                <div className="item-field stock-info"><label><FaBoxes /> Current Stock</label><div className={`stock-value ${currentStock <= 0 ? 'out-of-stock' : currentStock < 10 ? 'low-stock' : 'good-stock'}`}>{currentStock} units</div></div>
//                                                <div className="item-field total-field"><label>Total</label><div className="total-amount">Rs. {totalAmount.toFixed(2)}</div></div>
//                                            </div>
//                                            {isLowStock && <div className="stock-warning">⚠️ Insufficient stock! Available: {currentStock}, Required: {quantity}</div>}
//                                        </div>
//                                    );
//                                })}
//                            </div>
//                        )}
//                    </div>
//                )}

//                <div className="total-display">Total Amount: <strong>Rs. {calculateTotal().toFixed(2)}</strong></div>
//            </div>
//        </Modal>
//    );
//}


import React, { useEffect, useState, useCallback } from "react";
import jobCardApi from "../../../api/jobCardApi";
import vehicleApi from "../../../api/vehicleApi";
import technicianApi from "../../../api/technicianApi";
import serviceCatalogApi from "../../../api/serviceCatalogApi";
import itemApi from "../../../api/itemApi";
import godownApi from "../../../api/godownApi";
import { Modal } from "../../../components/common/Modal/Modal";
import { Button, ReactSelect, useDialog } from "../../../components/common";
import { FaClipboardList, FaCar, FaUser, FaUserCog, FaWrench, FaCog, FaPlus, FaTrash, FaWarehouse, FaBoxes } from "react-icons/fa";
import "./JobCard.css";

export default function JobCardModal({ jobCard, onClose, onSaved }) {
    const isEdit = !!jobCard?.jobCardID;
    const [vehicles, setVehicles] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [serviceCatalog, setServiceCatalog] = useState([]);
    const [items, setItems] = useState([]);
    const [godowns, setGodowns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("basic");
    const [manualVehicleNo, setManualVehicleNo] = useState("");
    const [isNewVehicle, setIsNewVehicle] = useState(false);
    const [itemStockMap, setItemStockMap] = useState({});
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);
    const { showSuccess, showError } = useDialog();

    const [form, setForm] = useState({
        jobCardID: 0,
        vehicleID: "",
        serviceAdvisorName: "",
        technicianID: "",
        receivedDate: new Date().toISOString().split('T')[0],
        promisedDate: "",
        customerComplaint: "",
        technicianFindings: "",
        recommendations: "",
        services: [],
        parts: []
    });

    // ✅ Convert technician options - ensure value is string
    const technicianOptions = technicians.map(t => ({
        value: String(t.technicianID),
        label: t.fullName
    }));

    const vehicleOptions = vehicles.map(v => ({ value: String(v.vehicleID), label: `${v.registrationNo} - ${v.make} ${v.model}` }));
    const serviceOptions = serviceCatalog.map(s => ({ value: String(s.serviceID), label: `${s.serviceName} - Rs.${s.defaultLaborRate}` }));
    const itemOptions = items.map(i => ({ value: String(i.itemID), label: `${i.itemName} - Rs.${i.saleRate}` }));
    const godownOptions = godowns.map(g => ({ value: String(g.godnID), label: g.godnName }));

    // Load item stock
    const loadItemStock = async (branchId) => {
        const stockMap = {};
        for (const item of items) {
            try {
                const res = await itemApi.getStock(item.itemID, branchId);
                const stockValue = res.data?.data || res.data || 0;
                stockMap[item.itemID] = typeof stockValue === 'number' ? stockValue : Number(stockValue) || 0;
            } catch (err) {
                stockMap[item.itemID] = 0;
            }
        }
        setItemStockMap(stockMap);
    };

    // Load godowns
    const loadGodowns = async () => {
        try {
            const res = await godownApi.getAll();
            const godownsData = res.data?.data || res.data || [];
            setGodowns(godownsData);
        } catch (err) {
            console.error("Error loading godowns:", err);
        }
    };

    // Load initial data only once
    useEffect(() => {
        const loadData = async () => {
            try {
                const [vehiclesRes, techniciansRes, servicesRes, itemsRes] = await Promise.all([
                    vehicleApi.getAll(),
                    technicianApi.getAll(),
                    serviceCatalogApi.getAll(),
                    itemApi.getAll()
                ]);
                setVehicles(vehiclesRes.data?.data || vehiclesRes.data || []);
                setTechnicians(techniciansRes.data?.data || techniciansRes.data || []);
                setServiceCatalog(servicesRes.data?.data || servicesRes.data || []);
                setItems(itemsRes.data?.data || itemsRes.data || []);
                await loadGodowns();
                setInitialDataLoaded(true);
            } catch (err) {
                console.error("Error loading data:", err);
                setInitialDataLoaded(true);
            }
        };
        loadData();
    }, []);

    // Load stock after items are loaded
    useEffect(() => {
        if (items.length > 0) {
            const branchId = localStorage.getItem('branchId') || 1;
            loadItemStock(branchId);
        }
    }, [items]);

    // Populate form with backend data
    useEffect(() => {
        if (!initialDataLoaded) {
            return;
        }

        if (isEdit && jobCard && Object.keys(jobCard).length > 0) {
            console.log("=== EDIT MODE: Loading ORIGINAL job card data ===");
            console.log("Technician ID from API (raw):", jobCard.technicianID);
            console.log("Technician ID type:", typeof jobCard.technicianID);

            // ✅ CRITICAL FIX: Convert technicianID to string properly
            const technicianIdValue = jobCard.technicianID ? String(jobCard.technicianID) : "";

            setForm({
                jobCardID: jobCard.jobCardID || 0,
                vehicleID: jobCard.vehicleID ? String(jobCard.vehicleID) : "",
                serviceAdvisorName: jobCard.serviceAdvisorName || "",
                technicianID: technicianIdValue,  // ✅ String value
                receivedDate: jobCard.receivedDate ? jobCard.receivedDate.split('T')[0] : new Date().toISOString().split('T')[0],
                promisedDate: jobCard.promisedDate ? jobCard.promisedDate.split('T')[0] : "",
                customerComplaint: jobCard.customerComplaint || "",
                technicianFindings: jobCard.technicianFindings || "",
                recommendations: jobCard.recommendations || "",

                services: (jobCard.services || []).map((s, idx) => ({
                    tempId: idx,
                    jobServiceID: s.jobServiceID,
                    serviceID: s.serviceID ? String(s.serviceID) : "",
                    serviceName: s.serviceName || "",
                    quantity: s.quantity || 1,
                    unitPrice: s.unitPrice || 0,
                    discountPercent: s.discountPercent || 0,
                    technicianID: s.technicianID ? String(s.technicianID) : "",
                    technicianName: s.technicianName || "",
                    totalAmount: s.totalAmount || 0,
                    status: s.status || "PENDING"
                })),

                parts: (jobCard.parts || []).map((p, idx) => ({
                    tempId: idx,
                    jobPartID: p.jobPartID,
                    itemID: p.itemID ? String(p.itemID) : "",
                    itemName: p.itemName || "",
                    quantity: p.quantity || 1,
                    unitPrice: p.unitPrice || 0,
                    discountPercent: p.discountPercent || 0,
                    godownID: p.godownID ? String(p.godownID) : "",
                    totalAmount: p.totalAmount || 0,
                    stockSource: p.stockSource || "STOCK"
                }))
            });

            console.log("Form technicianID after set (string):", technicianIdValue);
        } else if (!isEdit) {
            setForm({
                jobCardID: 0,
                vehicleID: "",
                serviceAdvisorName: "",
                technicianID: "",
                receivedDate: new Date().toISOString().split('T')[0],
                promisedDate: "",
                customerComplaint: "",
                technicianFindings: "",
                recommendations: "",
                services: [],
                parts: []
            });
        }
    }, [jobCard, initialDataLoaded, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (error) setError("");
    };

    const handleVehicleSelect = (selected) => {
        if (selected) {
            setIsNewVehicle(false);
            setManualVehicleNo("");
            setForm(prev => ({ ...prev, vehicleID: selected.value }));
        } else {
            setForm(prev => ({ ...prev, vehicleID: "" }));
        }
    };

    const handleManualVehicleChange = (e) => {
        setManualVehicleNo(e.target.value);
        if (e.target.value) {
            setIsNewVehicle(true);
            setForm(prev => ({ ...prev, vehicleID: "" }));
        } else {
            setIsNewVehicle(false);
        }
    };

    // ✅ FIXED: Technician change handler
    const handleTechnicianChange = (selected) => {
        const value = selected?.value || "";
        console.log("Technician selected (string):", value);
        setForm(prev => ({ ...prev, technicianID: value }));
    };

    // ✅ FIXED: Get selected technician option - compares string with string
    const getSelectedTechnician = () => {
        if (!form.technicianID) return null;
        const found = technicianOptions.find(t => t.value === form.technicianID);
        console.log("Looking for technician - form value:", form.technicianID, "Found:", found);
        return found || null;
    };

    const addService = () => {
        setForm(prev => ({
            ...prev,
            services: [...prev.services, {
                tempId: Date.now(),
                serviceID: "",
                serviceName: "",
                quantity: 1,
                unitPrice: 0,
                discountPercent: 0,
                technicianID: "",
                totalAmount: 0
            }]
        }));
    };

    const updateService = (index, field, value) => {
        const services = [...form.services];
        services[index][field] = value;

        if (field === 'serviceID' && value) {
            const service = serviceCatalog.find(s => String(s.serviceID) === value);
            if (service) {
                services[index].unitPrice = service.defaultLaborRate || 0;
                services[index].serviceName = service.serviceName || "";
            }
        }

        const quantity = services[index].quantity || 1;
        const unitPrice = services[index].unitPrice || 0;
        const discountPercent = services[index].discountPercent || 0;
        services[index].totalAmount = unitPrice * quantity * (1 - (discountPercent / 100));

        setForm(prev => ({ ...prev, services }));
    };

    const removeService = (index) => {
        setForm(prev => ({
            ...prev,
            services: prev.services.filter((_, i) => i !== index)
        }));
    };

    const addPart = () => {
        setForm(prev => ({
            ...prev,
            parts: [...prev.parts, {
                tempId: Date.now(),
                itemID: "",
                itemName: "",
                quantity: 1,
                unitPrice: 0,
                discountPercent: 0,
                godownID: "",
                totalAmount: 0
            }]
        }));
    };

    const updatePart = (index, field, value) => {
        const parts = [...form.parts];
        parts[index][field] = value;

        if (field === 'itemID' && value) {
            const item = items.find(i => String(i.itemID) === value);
            if (item) {
                parts[index].unitPrice = item.saleRate || 0;
                parts[index].itemName = item.itemName || "";
                if (item.godnID && !parts[index].godownID) {
                    parts[index].godownID = String(item.godnID);
                }
            }
        }

        const quantity = parts[index].quantity || 1;
        const unitPrice = parts[index].unitPrice || 0;
        const discountPercent = parts[index].discountPercent || 0;
        parts[index].totalAmount = unitPrice * quantity * (1 - (discountPercent / 100));

        setForm(prev => ({ ...prev, parts }));
    };

    const removePart = (index) => {
        setForm(prev => ({
            ...prev,
            parts: prev.parts.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        if (!form.vehicleID && !manualVehicleNo) {
            setError("Please select or enter a vehicle");
            return false;
        }
        return true;
    };

    const calculateTotal = useCallback(() => {
        const servicesTotal = form.services.reduce((sum, s) => sum + ((s.unitPrice || 0) * (s.quantity || 1) * (1 - ((s.discountPercent || 0) / 100))), 0);
        const partsTotal = form.parts.reduce((sum, p) => sum + ((p.unitPrice || 0) * (p.quantity || 1) * (1 - ((p.discountPercent || 0) / 100))), 0);
        return servicesTotal + partsTotal;
    }, [form.services, form.parts]);

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);
        setError("");

        try {
            let vehicleId = form.vehicleID;

            if (isNewVehicle && manualVehicleNo) {
                try {
                    const newVehicleRes = await vehicleApi.create({ registrationNo: manualVehicleNo });
                    vehicleId = newVehicleRes.data?.data?.vehicleID || newVehicleRes.data?.vehicleID;
                    if (!vehicleId) throw new Error("Failed to create vehicle");
                    showSuccess(`Vehicle ${manualVehicleNo} registered successfully`);
                } catch (err) {
                    setError(`Failed to register vehicle: ${err.response?.data?.message || err.message}`);
                    setLoading(false);
                    return;
                }
            }

            if (!vehicleId) {
                setError("Vehicle ID is required");
                setLoading(false);
                return;
            }

            const payload = {
                jobCardID: form.jobCardID,
                vehicleID: parseInt(vehicleId),
                serviceAdvisorName: form.serviceAdvisorName || null,
                technicianID: form.technicianID ? parseInt(form.technicianID) : null,
                receivedDate: form.receivedDate,
                promisedDate: form.promisedDate || null,
                customerComplaint: form.customerComplaint || null,
                technicianFindings: form.technicianFindings || null,
                recommendations: form.recommendations || null,
                services: form.services.filter(s => s.serviceID).map(s => ({
                    serviceID: parseInt(s.serviceID),
                    quantity: s.quantity || 1,
                    unitPrice: parseFloat(s.unitPrice) || 0,
                    discountPercent: parseFloat(s.discountPercent) || 0,
                    technicianID: s.technicianID ? parseInt(s.technicianID) : null
                })),
                parts: form.parts.filter(p => p.itemID).map(p => ({
                    itemID: parseInt(p.itemID),
                    quantity: parseFloat(p.quantity) || 1,
                    unitPrice: parseFloat(p.unitPrice) || 0,
                    discountPercent: parseFloat(p.discountPercent) || 0,
                    godownID: p.godownID ? parseInt(p.godownID) : null
                }))
            };

            console.log("Submitting payload - technicianID:", payload.technicianID);

            if (isEdit) {
                await jobCardApi.update(form.jobCardID, payload);
                showSuccess("Job card updated successfully");
            } else {
                await jobCardApi.create(payload);
                showSuccess("Job card created successfully");
            }

            onSaved();
            onClose();
        } catch (err) {
            console.error("Save error:", err);
            showError(err.response?.data?.message || "Failed to save job card");
        } finally {
            setLoading(false);
        }
    };

    const modalFooter = (
        <div className="jobcard-modal-footer">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={loading}>
                {isEdit ? "Update" : "Create"} Job Card
            </Button>
        </div>
    );

    const getSafeStockValue = (itemId) => {
        const stock = itemStockMap[itemId];
        if (typeof stock === 'number') return stock;
        if (typeof stock === 'string') return parseFloat(stock) || 0;
        return 0;
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={<><FaClipboardList /> {isEdit ? "Edit Job Card" : "New Job Card"}</>} size="xl" footer={modalFooter}>
            <div className="jobcard-modal-container">
                <div className="jobcard-modal-tabs">
                    <button type="button" className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`} onClick={() => setActiveTab('basic')}>
                        Basic Info
                    </button>
                    <button type="button" className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
                        Services ({form.services.length})
                    </button>
                    <button type="button" className={`tab-btn ${activeTab === 'parts' ? 'active' : ''}`} onClick={() => setActiveTab('parts')}>
                        Parts ({form.parts.length})
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                    <div className="basic-info-tab">
                        <div className="form-row-2">
                            <div className="form-group">
                                <label><FaCar /> Vehicle (Select)</label>
                                <ReactSelect
                                    value={vehicleOptions.find(v => v.value === form.vehicleID)}
                                    onChange={handleVehicleSelect}
                                    options={vehicleOptions}
                                    placeholder="Select vehicle..."
                                    isDisabled={loading || isNewVehicle}
                                />
                            </div>
                            <div className="form-group">
                                <label><FaCar /> Or Enter New Vehicle</label>
                                <input
                                    type="text"
                                    value={manualVehicleNo}
                                    onChange={handleManualVehicleChange}
                                    placeholder="Enter registration number for new vehicle"
                                    className="form-input"
                                    disabled={loading || !!form.vehicleID}
                                />
                            </div>
                        </div>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label><FaUser /> Service Advisor</label>
                                <input type="text" name="serviceAdvisorName" value={form.serviceAdvisorName} onChange={handleChange} placeholder="Enter service advisor name" className="form-input" disabled={loading} />
                            </div>
                            <div className="form-group">
                                <label><FaUserCog /> Primary Technician</label>
                                <ReactSelect
                                    value={getSelectedTechnician()}
                                    onChange={handleTechnicianChange}
                                    options={technicianOptions}
                                    placeholder="Select technician..."
                                    isClearable={true}
                                    isDisabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-row-2">
                            <div className="form-group"><label>Received Date</label><input type="date" name="receivedDate" value={form.receivedDate} onChange={handleChange} className="form-input" disabled={loading} /></div>
                            <div className="form-group"><label>Promised Date</label><input type="date" name="promisedDate" value={form.promisedDate} onChange={handleChange} className="form-input" disabled={loading} /></div>
                        </div>

                        <div className="form-group"><label>Customer Complaint</label><textarea name="customerComplaint" value={form.customerComplaint} onChange={handleChange} rows="2" className="form-textarea" placeholder="What did the customer report?" disabled={loading} /></div>
                        <div className="form-group"><label>Technician Findings</label><textarea name="technicianFindings" value={form.technicianFindings} onChange={handleChange} rows="2" className="form-textarea" placeholder="What did the technician find?" disabled={loading} /></div>
                        <div className="form-group"><label>Recommendations</label><textarea name="recommendations" value={form.recommendations} onChange={handleChange} rows="2" className="form-textarea" placeholder="Any recommendations?" disabled={loading} /></div>
                    </div>
                )}

                {/* Services Tab - Same as before */}
                {activeTab === 'services' && (
                    <div className="services-tab">
                        <div className="items-header">
                            <h4><FaWrench /> Services</h4>
                            <Button variant="primary" size="sm" onClick={addService} icon={<FaPlus />}>Add Service</Button>
                        </div>

                        {form.services.length === 0 ? (
                            <div className="no-items">No services added. Click "Add Service" to add.</div>
                        ) : (
                            <div className="items-list">
                                {form.services.map((service, index) => (
                                    <div key={service.tempId || index} className="item-row">
                                        <div className="item-row-header">
                                            <span className="item-index">Service #{index + 1}</span>
                                            <button type="button" className="remove-btn" onClick={() => removeService(index)}><FaTrash /></button>
                                        </div>
                                        <div className="item-row-content">
                                            <div className="item-field"><label>Service</label><ReactSelect value={serviceOptions.find(s => s.value === service.serviceID)} onChange={(selected) => updateService(index, 'serviceID', selected?.value)} options={serviceOptions} placeholder="Select service..." isDisabled={loading} /></div>
                                            <div className="item-field"><label>Quantity</label><input type="number" value={service.quantity} onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)} min="1" className="form-input-sm" disabled={loading} /></div>
                                            <div className="item-field"><label>Rate (Rs.)</label><input type="number" value={service.unitPrice} onChange={(e) => updateService(index, 'unitPrice', parseFloat(e.target.value) || 0)} step="0.01" className="form-input-sm" disabled={loading} /></div>
                                            <div className="item-field"><label>Discount %</label><input type="number" value={service.discountPercent} onChange={(e) => updateService(index, 'discountPercent', parseFloat(e.target.value) || 0)} min="0" max="100" className="form-input-sm" disabled={loading} /></div>
                                            <div className="item-field"><label>Technician</label><ReactSelect value={technicianOptions.find(t => t.value === service.technicianID)} onChange={(selected) => updateService(index, 'technicianID', selected?.value)} options={technicianOptions} placeholder="Assign technician..." isClearable isDisabled={loading} /></div>
                                            <div className="item-field total-field"><label>Total</label><div className="total-amount">Rs. {(service.totalAmount || 0).toFixed(2)}</div></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Parts Tab */}
                {activeTab === 'parts' && (
                    <div className="parts-tab">
                        <div className="items-header">
                            <h4><FaCog /> Parts</h4>
                            <Button variant="primary" size="sm" onClick={addPart} icon={<FaPlus />}>Add Part</Button>
                        </div>

                        {form.parts.length === 0 ? (
                            <div className="no-items">No parts added. Click "Add Part" to add.</div>
                        ) : (
                            <div className="items-list">
                                {form.parts.map((part, index) => {
                                    const selectedItem = items.find(i => String(i.itemID) === part.itemID);
                                    const currentStock = getSafeStockValue(selectedItem?.itemID);
                                    const quantity = Number(part.quantity) || 0;
                                    const isLowStock = currentStock < quantity;
                                    const totalAmount = Number(part.totalAmount) || 0;

                                    return (
                                        <div key={part.tempId || index} className="item-row">
                                            <div className="item-row-header">
                                                <span className="item-index">Part #{index + 1}</span>
                                                <button type="button" className="remove-btn" onClick={() => removePart(index)}><FaTrash /></button>
                                            </div>
                                            <div className="item-row-content">
                                                <div className="item-field"><label>Part</label><ReactSelect value={itemOptions.find(i => i.value === part.itemID)} onChange={(selected) => updatePart(index, 'itemID', selected?.value)} options={itemOptions} placeholder="Select part..." isDisabled={loading} /></div>
                                                <div className="item-field"><label>Quantity</label><input type="number" value={quantity} onChange={(e) => updatePart(index, 'quantity', parseFloat(e.target.value) || 1)} min="1" step="0.01" className={`form-input-sm ${isLowStock ? 'error-border' : ''}`} disabled={loading} /></div>
                                                <div className="item-field"><label>Rate (Rs.)</label><input type="number" value={part.unitPrice} onChange={(e) => updatePart(index, 'unitPrice', parseFloat(e.target.value) || 0)} step="0.01" className="form-input-sm" disabled={loading} /></div>
                                                <div className="item-field"><label>Discount %</label><input type="number" value={part.discountPercent} onChange={(e) => updatePart(index, 'discountPercent', parseFloat(e.target.value) || 0)} min="0" max="100" className="form-input-sm" disabled={loading} /></div>
                                                <div className="item-field"><label><FaWarehouse /> Godown</label><ReactSelect value={godownOptions.find(g => g.value === part.godownID)} onChange={(selected) => updatePart(index, 'godownID', selected?.value)} options={godownOptions} placeholder="Select godown..." isDisabled={loading} /></div>
                                                <div className="item-field stock-info"><label><FaBoxes /> Current Stock</label><div className={`stock-value ${currentStock <= 0 ? 'out-of-stock' : currentStock < 10 ? 'low-stock' : 'good-stock'}`}>{currentStock} units</div></div>
                                                <div className="item-field total-field"><label>Total</label><div className="total-amount">Rs. {totalAmount.toFixed(2)}</div></div>
                                            </div>
                                            {isLowStock && <div className="stock-warning">⚠️ Insufficient stock! Available: {currentStock}, Required: {quantity}</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                <div className="total-display">Total Amount: <strong>Rs. {calculateTotal().toFixed(2)}</strong></div>
            </div>
        </Modal>
    );
}