import React, { useEffect, useState } from "react";
import salesReturnApi from "../../api/salesReturnApi";
import godownApi from "../../api/godownApi";
import { formatNumber } from "../../utils/numberUtils";
import { formatDate } from "../../utils/dateUtils";
import { Modal } from "../../components/common/Modal/Modal";
import { Input, Button, ReactSelect, useDialog } from "../../components/common";
import { FaUndo, FaPlus, FaTimes } from "react-icons/fa";
import "./SalesReturnPopup.css";

export default function SalesReturnPopup({ tranNumb, onClose, onSaved }) {
    const isEdit = !!tranNumb;
    const [bills, setBills] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);
    const [items, setItems] = useState([]);
    const [godowns, setGodowns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [tranDate, setTranDate] = useState(new Date().toISOString().slice(0, 10));
    const [walkingCustomer, setWalkingCustomer] = useState("");
    const [returnRefNumb, setReturnRefNumb] = useState("");
    const [billNumber, setBillNumber] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
    const { showSuccess, showError } = useDialog();

    const displayDate = formatDate(tranDate);

    const billOptions = bills.map(b => ({
        value: b.tranNumb?.toString(),
        label: `${b.billNumb} - ${b.custName} (${formatDate(b.tranDate)})`
    }));

    const godownOptions = godowns.map(g => ({
        value: g.godnID?.toString(),
        label: g.godnName
    }));

    // Load godowns
    useEffect(() => {
        const loadGodowns = async () => {
            try {
                const res = await godownApi.getAll();
                setGodowns(res.data?.data || res.data || []);
            } catch (err) {
                console.error("Failed to load godowns:", err);
            }
        };
        loadGodowns();
    }, []);

    // Load next bill number
    useEffect(() => {
        const loadNextBill = async () => {
            if (!isEdit) {
                try {
                    const res = await salesReturnApi.getNextBill();
                    setBillNumber(res.data?.data || res.data || "Auto-generated");
                } catch (err) { setBillNumber("Auto-generated"); }
            }
        };
        loadNextBill();
    }, [isEdit]);

    // Load open sales
    useEffect(() => {
        const loadOpenSales = async () => {
            try {
                const res = await salesReturnApi.getOpenSales();
                setBills(res.data?.data || res.data || []);
            } catch (err) { showError("Failed to load sales bills"); }
        };
        loadOpenSales();
    }, []);

    // ============================================================
    // FIXED: fetchSaleItems - Proper Available Qty Calculation
    // ============================================================
    const fetchSaleItems = async (saleTranNumb) => {
        if (!saleTranNumb) return;
        setLoading(true);
        setInfoMessage("");
        try {
            const res = await salesReturnApi.getSaleItemsForReturn(saleTranNumb);
            let data = res.data?.data || res.data;

            // ============================================================
            // Get ALL already returned quantities for this sale
            // ============================================================
            let returnedMap = {};
            try {
                const returnsRes = await salesReturnApi.getReturnsBySale(saleTranNumb);
                const returnsData = returnsRes.data?.data || returnsRes.data || [];

                console.log("📋 Existing returns:", returnsData);

                returnsData.forEach(ret => {
                    // Skip current return if editing
                    if (ret.returnTranNumb === tranNumb) return;

                    ret.items?.forEach(item => {
                        const qty = Number(item.returnQnty) || Number(item.returnQty) || 0;
                        returnedMap[item.itemID] = (returnedMap[item.itemID] || 0) + qty;
                    });
                });

                console.log("📊 Returned Map:", returnedMap);
            } catch (err) {
                console.log("⚠️ Could not fetch existing returns:", err.message);
            }

            const fetchedItems = (data.items || []).map(item => {
                const sold = Number(item.soldQnty) || Number(item.soldQty) || 0;
                const returned = returnedMap[item.itemID] || 0;
                const available = sold - returned;

                console.log(`📦 ${item.itemName}: Sold=${sold}, Returned=${returned}, Available=${available}`);

                return {
                    itemID: item.itemID,
                    itemName: item.itemName || `Item ${item.itemID}`,
                    modlNumb: item.modlNumb || "",
                    soldQnty: sold,
                    returnedQty: returned,
                    availableQty: available,
                    returnQnty: 0,
                    rate: Number(item.rate) || 0,
                    currentStock: Number(item.currentStock) || 0,
                    godownID: item.godownID || null
                };
            }).filter(item => item.availableQty > 0);

            setItems(fetchedItems);
            console.log(`✅ Loaded ${fetchedItems.length} items`);

            if (data.items?.length > fetchedItems.length) {
                setInfoMessage(`${data.items.length - fetchedItems.length} item(s) already fully returned.`);
            }
        } catch (err) {
            console.error("❌ Error:", err);
            showError("Failed to load items");
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    // Load edit data
    useEffect(() => {
        if (!tranNumb) return;
        const fetchReturn = async () => {
            setLoading(true);
            try {
                const res = await salesReturnApi.getByReturnTranNumb(tranNumb);
                let data = res.data?.data || res.data;
                setSelectedBill(data.saleTranNumb?.toString());
                setTranDate(data.tranDate?.slice(0, 10) || new Date().toISOString().slice(0, 10));
                setWalkingCustomer(data.walkingCustomer || "");
                setReturnRefNumb(data.returnRefNumb || "");
                if (data.billNumb) setBillNumber(data.billNumb);

                setItems((data.items || []).map(item => ({
                    itemID: item.itemID,
                    itemName: item.itemName,
                    modlNumb: item.modlNumb || "",
                    soldQnty: Number(item.soldQnty) || 0,
                    availableQty: Number(item.soldQnty) || 0,
                    returnQnty: Number(item.returnQnty) || 0,
                    rate: Number(item.rate) || 0,
                    currentStock: Number(item.currentStock) || 0,
                    godownID: item.godownID || null
                })));
            } catch (err) {
                showError("Unable to load return data");
            } finally {
                setLoading(false);
            }
        };
        fetchReturn();
    }, [tranNumb]);

    const handleBillChange = (e) => {
        const value = e?.target?.value || e;
        setSelectedBill(value);
        if (!isEdit && value) fetchSaleItems(value);
    };

    const handleQtyChange = (idx, value) => {
        const qty = parseFloat(value) || 0;
        const maxQty = items[idx].availableQty;
        if (qty > maxQty) { showError(`Maximum available quantity is ${maxQty}`); return; }
        if (qty < 0) { showError("Quantity cannot be negative"); return; }
        const updated = [...items];
        updated[idx].returnQnty = qty;
        setItems(updated);
    };

    const handleGodownChange = (idx, godownId) => {
        const updated = [...items];
        updated[idx].godownID = godownId;
        setItems(updated);
    };

    const handleReturnAll = () => setItems(items.map(i => ({ ...i, returnQnty: i.availableQty })));
    const handleClearAll = () => setItems(items.map(i => ({ ...i, returnQnty: 0 })));

    const validateForm = () => {
        const newErrors = {};
        if (!selectedBill) newErrors.bill = "Select a sale bill";
        const validItems = items.filter(i => i.returnQnty > 0);
        if (validItems.length === 0) newErrors.items = "Add at least one item";
        const itemsWithoutGodown = validItems.filter(i => !i.godownID);
        if (itemsWithoutGodown.length > 0) newErrors.godown = "Please select godown for all return items";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        const validItems = items.filter(i => i.returnQnty > 0);
        const selectedData = bills.find(b => b.tranNumb?.toString() === selectedBill);

        let customerName = "Cash Customer";
        if (walkingCustomer && walkingCustomer.trim()) {
            customerName = walkingCustomer.trim();
        } else if (selectedData?.custName && selectedData.custName !== "Cash Customer") {
            customerName = selectedData.custName;
        }

        const payload = {
            returnTranNumb: isEdit ? tranNumb : null,
            saleTranNumb: Number(selectedBill),
            tranDate: new Date(tranDate).toISOString(),
            custID: selectedData?.custID || null,
            custName: customerName,
            walkingCustomer: walkingCustomer || null,
            returnRefNumb: returnRefNumb || null,
            items: validItems.map(i => ({
                itemID: i.itemID,
                soldQnty: i.soldQnty,
                returnQnty: i.returnQnty,
                rate: i.rate,
                godownID: i.godownID ? Number(i.godownID) : null
            }))
        };

        setLoading(true);
        try {
            await salesReturnApi.create(payload);
            showSuccess(isEdit ? "Return updated!" : "Return saved!");
            onSaved();
            onClose();
        } catch (err) {
            showError(err.response?.data?.message || "Save failed");
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = items.reduce((sum, i) => sum + (i.returnQnty * i.rate), 0);
    const selectedData = bills.find(b => b.tranNumb?.toString() === selectedBill);

    return (
        <Modal isOpen={true} onClose={onClose} title={<><FaUndo /> {isEdit ? "Edit Sale Return" : "New Sale Return"}</>} size="xl" footer={<div className="popup-footer"><Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button><Button variant="primary" onClick={handleSave} loading={loading}>Save Return</Button></div>}>
            <div className="sr-popup-container">
                <div className="form-row-3">
                    <div className="field-group">
                        <label>Sale Bill <span className="required">*</span></label>
                        <select value={selectedBill || ""} onChange={handleBillChange} className={`compact-select ${errors.bill ? 'error' : ''}`} disabled={isEdit || loading}>
                            <option value="">Select sale bill...</option>
                            {billOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        {errors.bill && <small className="error-text">{errors.bill}</small>}
                    </div>
                    <div className="field-group">
                        <label>Return Date</label>
                        <input type="date" value={tranDate} onChange={(e) => setTranDate(e.target.value)} className="compact-input" disabled={loading} />
                        <small className="date-hint">{displayDate}</small>
                    </div>
                    <div className="field-group">
                        <label>Return Bill No.</label>
                        <input type="text" value={billNumber || (isEdit ? "Loading..." : "Auto-generated")} readOnly className="compact-input readonly" disabled />
                    </div>
                </div>
                <div className="form-row-2">
                    <div className="field-group">
                        <label>Customer</label>
                        <input type="text" value={selectedData?.custName || "Select sale bill"} readOnly className="compact-input readonly" disabled />
                    </div>
                    <div className="field-group">
                        <label>Return Reference No.</label>
                        <input type="text" value={returnRefNumb} onChange={(e) => setReturnRefNumb(e.target.value)} className="compact-input" placeholder="Customer return reference" disabled={loading} />
                    </div>
                </div>
                <Input label="Walking Customer" value={walkingCustomer} onChange={(e) => setWalkingCustomer(e.target.value)} placeholder="Walk-in customer name" disabled={loading} />

                {infoMessage && <div className="info-message warning">{infoMessage}</div>}
                {errors.items && <div className="error-message">{errors.items}</div>}
                {errors.godown && <div className="error-message">{errors.godown}</div>}

                {items.length > 0 && (
                    <div className="items-section">
                        <div className="items-header">
                            <span className="section-title">Return Items</span>
                            <div className="items-actions">
                                <Button size="sm" variant="outline" onClick={handleReturnAll} disabled={loading}><FaPlus /> Return All</Button>
                                <Button size="sm" variant="outline" onClick={handleClearAll} disabled={loading}><FaTimes /> Clear All</Button>
                            </div>
                        </div>
                        <div className="items-table-wrapper">
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Sold</th>
                                        <th>Available</th>
                                        <th>Rate</th>
                                        <th>Godown</th>
                                        <th>Return Qty</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={item.itemID}>
                                            <td>{item.itemName}</td>
                                            <td className="text-center">{item.soldQnty}</td>
                                            <td className={`text-center ${item.availableQty > 0 ? 'stock-good' : 'stock-out'}`}>{item.availableQty}</td>
                                            <td className="text-right">{formatNumber(item.rate)}</td>
                                            <td>
                                                <ReactSelect
                                                    value={item.godownID?.toString()}
                                                    onChange={(e) => handleGodownChange(idx, e?.target?.value || e?.value)}
                                                    options={godownOptions}
                                                    placeholder="Select godown"
                                                    isClearable
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td>
                                                <input type="number" min="0" max={item.availableQty} value={item.returnQnty} onChange={(e) => handleQtyChange(idx, e.target.value)} className="table-input" disabled={loading || item.availableQty <= 0} />
                                            </td>
                                            <td className="text-right">{formatNumber(item.returnQnty * item.rate)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="items-total">Total Return Amount: <strong>{formatNumber(totalAmount)}</strong></div>
                    </div>
                )}

                {selectedBill && items.length === 0 && !loading && <div className="info-message warning">No items available for return.</div>}
            </div>
        </Modal>
    );
}