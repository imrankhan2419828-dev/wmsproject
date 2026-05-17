import React, { useEffect, useState } from "react";
import purchaseReturnApi from "../../api/purchaseReturnApi";
import godownApi from "../../api/godownApi";
import { formatNumber } from "../../utils/numberUtils";
import { formatDate } from "../../utils/dateUtils";
import { Modal } from "../../components/common/Modal/Modal";
import { Input, Button, ReactSelect, useDialog } from "../../components/common";
import { FaExchangeAlt, FaUndo, FaTimes } from "react-icons/fa";
import "./PurchaseReturnPopup.css";

export default function PurchaseReturnPopup({ onClose, onSaved, editData }) {
    const isEdit = !!editData?.returnID;
    const [purchases, setPurchases] = useState([]);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [items, setItems] = useState([]);
    const [godowns, setGodowns] = useState([]);
    const [tranDesc, setTranDesc] = useState("");
    const [returnRefNumb, setReturnRefNumb] = useState("");
    const [tranDate, setTranDate] = useState(new Date().toISOString().slice(0, 10));
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [billNumber, setBillNumber] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
    const { showSuccess, showError } = useDialog();

    const displayDate = formatDate(tranDate);

    const purchaseOptions = purchases.map(p => ({
        value: p.purchaseTranNumb?.toString(),
        label: `${p.billNumb} - ${p.supplierName} (${formatDate(p.tranDate)})`
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
                    const res = await purchaseReturnApi.getNextBill();
                    setBillNumber(res.data?.data || res.data || "Auto-generated");
                } catch (err) { setBillNumber("Auto-generated"); }
            }
        };
        loadNextBill();
    }, [isEdit]);

    // Load purchases for dropdown
    useEffect(() => {
        const loadPurchases = async () => {
            try {
                const res = await purchaseReturnApi.getPurchasesForReturn();
                const data = res.data?.data || res.data || [];
                setPurchases(data);
            } catch (err) {
                showError("Failed to load purchases");
            }
        };
        loadPurchases();
    }, []);

    // Load items when purchase selected
    // Load items when purchase selected
    useEffect(() => {
        if (!selectedPurchase || isEdit) return;

        const loadItems = async () => {
            setLoading(true);
            setInfoMessage("");

            try {
                const itemsRes = await purchaseReturnApi.getPurchaseItemsForReturn(selectedPurchase);
                const itemsData = itemsRes.data?.data || itemsRes.data;
                const originalItems = itemsData.items || [];

                // DEBUG: Console log to see actual structure
                console.log("📦 API Response:", itemsData);
                console.log("📦 First item keys:", Object.keys(originalItems[0] || {}));

                const itemsWithDetails = originalItems.map(item => {
                    const purchased = Number(item.purchasedQty) || 0;
                    const available = Number(item.availableQty) || purchased;
                    // 🔥 ALL POSSIBLE GODOWN FIELD NAMES
                    const godownID = item.godownID
                        || item.godownId
                        || item.GodownID
                        || item.GodownId
                        || item.godown_ID
                        || item.godown
                        || item.godownid
                        || item.godown_id
                        || (item.godownDetails && item.godownDetails.godownID)
                        || (item.godown && item.godown.godownID)
                        || null;


                    console.log(`📌 Item: ${item.itemName}, Found godownID: ${godownID}`);

                    return {
                        ...item,
                        itemID: item.itemID,
                        itemName: item.itemName,
                        modlNumb: item.modlNumb,
                        purchasedQty: purchased,       // ✅ Original purchase qty (always same)
                        purcRate: Number(item.purcRate) || 0,
                        currentStock: Number(item.currentStock) || 0,
                        godownID: godownID,
                        availableQty: available,       // ✅ API se aaya hua (decreases with returns)
                        returnQty: item.returnQty || 0
                    };
                }).filter(item => item.availableQty > 0);

                setItems(itemsWithDetails);
                setTranDesc(itemsData.tranDesc || "");

            } catch (err) {
                showError("Failed to load items");
            } finally {
                setLoading(false);
            }
        };

        loadItems();
    }, [selectedPurchase, isEdit]);

    // Load edit data
    useEffect(() => {
        if (!editData?.returnID) return;

        const loadReturn = async () => {
            setLoading(true);
            try {
                const res = await purchaseReturnApi.getById(editData.returnID);
                let data = res.data?.data || res.data;

                setSelectedPurchase(data.purchaseTranNumb?.toString());
                setTranDate(data.tranDate?.slice(0, 10) || new Date().toISOString().slice(0, 10));
                setTranDesc(data.tranDesc || "");
                setReturnRefNumb(data.returnRefNumb || "");
                if (data.billNumb) setBillNumber(data.billNumb);

                const editItems = data.items?.map(i => ({
                    ...i,
                    itemID: i.itemID,
                    itemName: i.itemName,
                    purchasedQty: Number(i.purchasedQty) || 0,
                    purcRate: Number(i.purcRate) || 0,
                    currentStock: Number(i.currentStock) || 0,
                    godownID: i.godownID || null,
                    availableQty: Number(i.purchasedQty) || 0,
                    returnQty: Number(i.returnQty) || 0
                })) || [];

                setItems(editItems);
            } catch (err) {
                showError("Failed to load return data");
            } finally {
                setLoading(false);
            }
        };
        loadReturn();
    }, [editData]);

    const handlePurchaseChange = (e) => {
        setSelectedPurchase(e.target.value);
        setItems([]);
        setInfoMessage("");
        if (errors.purchase) setErrors(prev => ({ ...prev, purchase: '' }));
    };

    const handleQtyChange = (index, value) => {
        const qty = parseFloat(value) || 0;
        const maxQty = items[index].availableQty;

        if (qty > maxQty) {
            showError(`Maximum available quantity is ${maxQty}`);
            return;
        }
        if (qty < 0) {
            showError("Quantity cannot be negative");
            return;
        }

        const updated = [...items];
        updated[index].returnQty = qty;
        setItems(updated);
    };

    const handleGodownChange = (index, godownId) => {
        const updated = [...items];
        updated[index].godownID = godownId;
        setItems(updated);
    };

    const handleReturnAll = () => {
        setItems(items.map(i => ({ ...i, returnQty: i.availableQty })));
    };

    const handleClearAll = () => {
        setItems(items.map(i => ({ ...i, returnQty: 0 })));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!selectedPurchase) newErrors.purchase = "Select a purchase bill";

        const validItems = items.filter(i => i.returnQty > 0);
        if (validItems.length === 0) newErrors.items = "Add at least one item with quantity > 0";

        const itemsWithoutGodown = validItems.filter(i => !i.godownID);
        if (itemsWithoutGodown.length > 0) {
            newErrors.godown = "Please select godown for all return items";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        const validItems = items.filter(i => i.returnQty > 0);
        const selectedData = purchases.find(p => p.purchaseTranNumb?.toString() === selectedPurchase);

        const payload = {
            purchaseTranNumb: Number(selectedPurchase),
            tranDate: new Date(tranDate).toISOString(),
            tranDesc,
            returnRefNumb,
            suppID: selectedData?.suppID,
            items: validItems.map(i => ({
                itemID: i.itemID,
                returnQty: i.returnQty,
                purcRate: i.purcRate,
                godownID: i.godownID ? Number(i.godownID) : null
            }))
        };

        setLoading(true);
        try {
            if (isEdit) {
                await purchaseReturnApi.update(editData.returnID, { ...payload, returnID: editData.returnID });
            } else {
                await purchaseReturnApi.create(payload);
            }
            showSuccess(isEdit ? "Return updated!" : "Return saved!");
            onSaved();
            onClose();
        } catch (err) {
            showError(err.response?.data?.message || "Save failed");
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = items.reduce((sum, i) => sum + (i.returnQty * i.purcRate), 0);
    const selectedData = purchases.find(p => p.purchaseTranNumb?.toString() === selectedPurchase);

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={<><FaExchangeAlt /> {isEdit ? "Edit Purchase Return" : "New Purchase Return"}</>}
            size="xl"
            footer={
                <div className="popup-footer">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} loading={loading}>Save Return</Button>
                </div>
            }
        >
            <div className="pr-popup-container">
                <div className="form-row-2">
                    <div className="field-group">
                        <label>Purchase Bill <span className="required">*</span></label>
                        <select
                            value={selectedPurchase || ""}
                            onChange={handlePurchaseChange}
                            className={`compact-select ${errors.purchase ? 'error' : ''}`}
                            disabled={isEdit || loading}
                        >
                            <option value="">Select purchase bill...</option>
                            {purchaseOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        {errors.purchase && <small className="error-text">{errors.purchase}</small>}
                    </div>
                    <div className="field-group">
                        <label>Return Date</label>
                        <input type="date" value={tranDate} onChange={(e) => setTranDate(e.target.value)} className="compact-input" disabled={loading} />
                        <small className="date-hint">{displayDate}</small>
                    </div>
                </div>

                <div className="form-row-2">
                    <div className="field-group">
                        <label>Return Bill No.</label>
                        <input type="text" value={billNumber || (isEdit ? "Loading..." : "Auto-generated")} readOnly className="compact-input readonly" disabled />
                    </div>
                    <div className="field-group">
                        <label>Supplier</label>
                        <input type="text" value={selectedData?.supplierName || "Select purchase bill"} readOnly className="compact-input readonly" disabled />
                    </div>
                </div>

                <Input label="Return Reference No." value={returnRefNumb} onChange={(e) => setReturnRefNumb(e.target.value)} placeholder="Supplier return reference" disabled={loading} />
                <Input label="Description / Remarks" value={tranDesc} onChange={(e) => setTranDesc(e.target.value)} placeholder="Return remarks (optional)" disabled={loading} />

                {infoMessage && <div className="info-message info">{infoMessage}</div>}
                {errors.godown && <div className="error-message">{errors.godown}</div>}

                {items.length > 0 && (
                    <div className="items-section">
                        <div className="items-header">
                            <span className="section-title">Return Items</span>
                            <div className="items-actions">
                                <Button size="sm" variant="outline" onClick={handleReturnAll} disabled={loading}><FaUndo /> Return All</Button>
                                <Button size="sm" variant="outline" onClick={handleClearAll} disabled={loading}><FaTimes /> Clear All</Button>
                            </div>
                        </div>
                        {errors.items && <div className="error-message">{errors.items}</div>}

                        <div className="items-table-wrapper">
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Purchased</th>
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
                                            <td className="text-center">{item.purchasedQty}</td>
                                            <td className={`text-center ${item.availableQty > 0 ? 'stock-good' : 'stock-out'}`}>
                                                {item.availableQty}
                                            </td>
                                            <td className="text-right">{formatNumber(item.purcRate)}</td>
                                            <td>
                                                <ReactSelect
                                                    value={item.godownID?.toString()}
                                                    onChange={(e) => handleGodownChange(idx, e?.target?.value || e)}
                                                    options={godownOptions}
                                                    placeholder="Select godown"
                                                    isClearable
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={item.availableQty}
                                                    value={item.returnQty}
                                                    onChange={(e) => handleQtyChange(idx, e.target.value)}
                                                    className="table-input"
                                                    disabled={loading || item.availableQty <= 0}
                                                />
                                            </td>
                                            <td className="text-right">{formatNumber(item.returnQty * item.purcRate)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="items-total">
                            Total Return Amount: <strong>{formatNumber(totalAmount)}</strong>
                        </div>
                    </div>
                )}

                {selectedPurchase && items.length === 0 && !loading && !infoMessage && (
                    <div className="info-message warning">No items available for return.</div>
                )}
            </div>
        </Modal>
    );
}