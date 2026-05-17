import React, { useEffect, useState, useRef } from "react";
import purchaseApi from "../../api/purchaseApi";
import stockApi from "../../api/stockApi";
import godownApi from "../../api/godownApi";
import { formatNumber } from "../../utils/numberUtils";
import { formatDate } from "../../utils/dateUtils";
import { Modal } from "../../components/common/Modal/Modal";
import { Input, Button, ReactSelect, useDialog } from "../../components/common";
import {
    FaShoppingCart, FaMoneyBillWave, FaCreditCard, FaBoxes, FaPlus, FaTrash
} from "react-icons/fa";
import "./PurchasePopup.css";

// Last used godown cache
const lastGodownCache = {};

export default function PurchasePopup({ purchase, onClose, onSaved }) {
    const isEdit = !!purchase?.tranNumb;
    const [suppliers, setSuppliers] = useState([]);
    const [itemsList, setItemsList] = useState([]);
    const [godowns, setGodowns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [nextBillNo, setNextBillNo] = useState("");
    const { showSuccess, showError } = useDialog();

    const [form, setForm] = useState({
        tranNumb: 0,
        tranDate: new Date().toISOString().slice(0, 10),
        suppID: null,
        walkingCustomerName: "",
        refrNumb: "",
        tranType: "Credit",
        billNumb: "",
        tranDesc: "",
        items: [{ itemID: "", modlNumb: "", purcRate: 0, purcQnty: 1, purcAmnt: 0, godownID: null }]
    });

    const [enrichedItems, setEnrichedItems] = useState([]);

    const supplierOptions = suppliers.map(s => ({
        value: s.acctID?.toString(),
        label: `${s.acctCode} - ${s.acctName}`
    }));

    const itemOptions = itemsList.map(i => ({
        value: i.itemID?.toString(),
        label: `${i.itemName} ${i.modlNumb ? `(${i.modlNumb})` : ''}`,
        item: i
    }));

    const modelOptions = itemsList
        .filter(i => i.modlNumb)
        .map(i => ({
            value: i.modlNumb,
            label: i.modlNumb,
            item: i
        }));

    const godownOptions = godowns.map(g => ({
        value: g.godnID?.toString(),
        label: g.godnName
    }));

    const fetchStock = async (itemId) => {
        if (!itemId) return 0;
        try {
            const res = await stockApi.getCurrent(itemId);
            return res.data?.data ?? (typeof res.data === 'number' ? res.data : 0);
        } catch (err) {
            return 0;
        }
    };

    const enrichItemDetails = async (itemId, godownId = null) => {
        const itemDetail = itemsList.find(i => i.itemID === parseInt(itemId));
        if (!itemDetail) return null;

        const stock = await fetchStock(itemId);
        const rate = itemDetail.purcRate || itemDetail.saleRate || 0;

        // 🔥 Auto-select first godown if none selected
        let finalGodownId = godownId;
        if (!finalGodownId) {
            finalGodownId = lastGodownCache[itemId] ||
                itemDetail.godownID ||
                (godowns.length > 0 ? godowns[0].godnID : null); // ✅ Default to first godown
        }

        return {
            itemID: itemDetail.itemID,
            itemName: itemDetail.itemName,
            modlNumb: itemDetail.modlNumb,
            currentStock: stock,
            purcRate: rate,
            godownID: finalGodownId,
            godownName: godowns.find(g => g.godnID === parseInt(finalGodownId))?.godnName || ''
        };
    };

    useEffect(() => {
        const syncItems = async () => {
            const enriched = await Promise.all(
                form.items.map(async (item) => {
                    if (!item.itemID) return { ...item, currentStock: 0, itemName: '', modlNumb: '', godownName: '' };
                    const details = await enrichItemDetails(item.itemID, item.godownID);
                    return {
                        ...item,
                        ...details,
                        purcRate: item.purcRate || details?.purcRate || 0,
                        purcAmnt: (item.purcRate || details?.purcRate || 0) * (item.purcQnty || 1)
                    };
                })
            );
            setEnrichedItems(enriched);
        };
        syncItems();
    }, [form.items, itemsList, godowns]);

    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                setLoading(true);
                const [suppliersRes, itemsRes, godownsRes, billRes] = await Promise.all([
                    purchaseApi.getSuppliers(),
                    purchaseApi.getItems(),
                    godownApi.getAll(),
                    purchaseApi.getNextBill()
                ]);

                setSuppliers(suppliersRes.data?.data || suppliersRes.data || []);
                setItemsList(itemsRes.data?.data || itemsRes.data || []);
                setGodowns(godownsRes.data?.data || godownsRes.data || []);

                if (billRes.data?.data) {
                    setNextBillNo(billRes.data.data);
                    setForm(prev => ({ ...prev, billNumb: billRes.data.data }));
                }
            } catch (err) {
                showError("Failed to load initial data");
            } finally {
                setLoading(false);
            }
        };
        loadDropdownData();
    }, []);

    useEffect(() => {
        const loadPurchaseForEdit = async () => {
            if (purchase?.tranNumb && itemsList.length > 0) {
                try {
                    setLoading(true);
                    const res = await purchaseApi.getById(purchase.tranNumb);
                    const data = res.data?.data || res.data;
                    if (!data) return;

                    const items = (data.items || []).map(i => {
                        const itemDetail = itemsList.find(it => it.itemID === i.itemID);
                        return {
                            itemID: i.itemID || "",
                            modlNumb: itemDetail?.modlNumb || "",
                            purcRate: i.purcRate || 0,
                            purcQnty: i.purcQnty || 1,
                            purcAmnt: (i.purcRate || 0) * (i.purcQnty || 1),
                            godownID: i.godownID || null
                        };
                    });

                    items.forEach(i => {
                        if (i.itemID && i.godownID) {
                            lastGodownCache[i.itemID] = i.godownID;
                        }
                    });

                    setForm({
                        tranNumb: data.tranNumb || 0,
                        tranDate: data.tranDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
                        suppID: data.suppID || null,
                        walkingCustomerName: data.walkingCustomerName || "",
                        refrNumb: data.refrNumb || "",
                        tranType: data.tranType || "Credit",
                        billNumb: data.billNumb || nextBillNo,
                        tranDesc: data.tranDesc || "",
                        items: items.length > 0 ? items : [{ itemID: "", modlNumb: "", purcRate: 0, purcQnty: 1, purcAmnt: 0, godownID: null }]
                    });
                } catch (err) {
                    showError("Failed to load purchase data");
                } finally {
                    setLoading(false);
                }
            }
        };

        if (purchase?.tranNumb && itemsList.length > 0) {
            loadPurchaseForEdit();
        }
    }, [purchase?.tranNumb, itemsList]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleModelSelect = async (index, modelNumber) => {
        if (!modelNumber) return;

        const items = [...form.items];
        const itemDetail = itemsList.find(i => i.modlNumb === modelNumber);
        if (!itemDetail) return;

        const stock = await fetchStock(itemDetail.itemID);
        const rate = itemDetail.purcRate || 0;
        const godownId = lastGodownCache[itemDetail.itemID] ||
            itemDetail.godownID ||
            (godowns.length > 0 ? godowns[0].godnID : null); // ✅ Default to first godown

        items[index] = {
            ...items[index],
            itemID: itemDetail.itemID,
            modlNumb: modelNumber,
            purcRate: rate,
            purcQnty: items[index].purcQnty || 1,
            purcAmnt: rate * (items[index].purcQnty || 1),
            godownID: godownId
        };

        setForm({ ...form, items });
    };

    const handleItemSelect = async (index, itemId) => {
        if (!itemId) return;

        const items = [...form.items];
        const itemDetail = itemsList.find(i => i.itemID === parseInt(itemId));
        if (!itemDetail) return;

        const stock = await fetchStock(itemId);
        const rate = itemDetail.purcRate || 0;
        const godownId = lastGodownCache[itemId] ||
            itemDetail.godownID ||
            (godowns.length > 0 ? godowns[0].godnID : null); // ✅ Default to first godown

        items[index] = {
            ...items[index],
            itemID: itemId,
            modlNumb: itemDetail.modlNumb || "",
            purcRate: rate,
            purcQnty: items[index].purcQnty || 1,
            purcAmnt: rate * (items[index].purcQnty || 1),
            godownID: godownId
        };

        setForm({ ...form, items });
    };

    const handleItemFieldChange = (index, field, value) => {
        const items = [...form.items];

        if (field === 'purcRate') {
            const rate = parseFloat(value) || 0;
            items[index].purcRate = rate;
            items[index].purcAmnt = rate * (items[index].purcQnty || 1);
        } else if (field === 'purcQnty') {
            const qty = parseFloat(value) || 1;
            items[index].purcQnty = qty;
            items[index].purcAmnt = (items[index].purcRate || 0) * qty;
        } else if (field === 'godownID') {
            items[index].godownID = value;
            if (items[index].itemID && value) {
                lastGodownCache[items[index].itemID] = value;
            }
        }

        setForm({ ...form, items });
    };

    const addItemRow = () => {
        setForm({
            ...form,
            items: [...form.items, { itemID: "", modlNumb: "", purcRate: 0, purcQnty: 1, purcAmnt: 0, godownID: null }]
        });
    };

    const removeItemRow = (index) => {
        if (form.items.length <= 1) {
            showError("At least one item is required");
            return;
        }
        const items = [...form.items];
        items.splice(index, 1);
        setForm({ ...form, items });
    };

    const validateForm = () => {
        const newErrors = {};
        const validItems = form.items.filter(i => i.itemID && i.purcQnty > 0);

        if (validItems.length === 0) {
            newErrors.items = "Please add at least one item with quantity > 0";
        }

        // 🔥 Check if all items have godown selected
        const itemsWithoutGodown = validItems.filter(i => !i.godownID);
        if (itemsWithoutGodown.length > 0) {
            newErrors.godown = "Please select godown for all items";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        try {
            setLoading(true);
            const validItems = form.items.filter(i => i.itemID && i.purcQnty > 0);
            const payload = {
                tranNumb: form.tranNumb,
                tranDate: form.tranDate,
                suppID: form.suppID ? Number(form.suppID) : null,
                walkingCustomerName: form.walkingCustomerName,
                refrNumb: form.refrNumb,
                tranType: form.tranType,
                billNumb: form.billNumb,
                tranDesc: form.tranDesc,
                items: validItems.map(i => ({
                    itemID: Number(i.itemID),
                    purcQnty: Number(i.purcQnty),
                    purcRate: Number(i.purcRate),
                    godownID: i.godownID ? Number(i.godownID) : null // 🔥 Save godown
                }))
            };

            if (isEdit) await purchaseApi.update(form.tranNumb, payload);
            else await purchaseApi.create(payload);

            showSuccess(isEdit ? "Purchase updated!" : "Purchase saved!");
            if (onSaved) onSaved();
            if (onClose) onClose();
        } catch (err) {
            showError(err.response?.data?.message || "Save failed");
        } finally {
            setLoading(false);
        }
    };

    const selectStyles = {
        menuPortal: (base) => ({ ...base, zIndex: 9999 })
    };





    const totalQty = form.items.reduce((sum, i) => sum + (i.purcQnty || 0), 0);
    const totalAmount = form.items.reduce((sum, i) => sum + (i.purcAmnt || 0), 0);
    const displayDate = formatDate ? formatDate(form.tranDate) : form.tranDate;

    const modalFooter = (
        <div className="popup-footer">
            <Button variant="primary" onClick={handleSave} loading={loading}>
                {isEdit ? "Update Purchase" : "Save Purchase"}
            </Button>

            <Button variant="danger" onClick={onClose} disabled={loading}>
                Cancel
            </Button>
            {/*<Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>*/}
            {/*<Button variant="primary" onClick={handleSave} loading={loading}>Save Purchase</Button>*/}
        </div>
    );

    //return (
    //    <Modal
    //        isOpen={true}
    //        onClose={onClose}
    //        title={<><FaShoppingCart /> {isEdit ? "Edit Purchase" : "New Purchase"}</>}
    //        size="xxl"
    //        footer={modalFooter}
    //    >
    //        <div className="purchase-popup-container">
    //            {/* Header Row */}
    //            <div className="purchase-header-row">
    //                <div className="field-group">
    //                    <label>Date</label>
    //                    <input type="date" name="tranDate" value={form.tranDate} onChange={handleChange} className="compact-input" disabled={loading} />
    //                    <small className="date-hint">{displayDate}</small>
    //                </div>
    //                <div className="field-group">
    //                    <label>Bill Number</label>
    //                    <input type="text" value={form.billNumb || "Auto-generated"} readOnly className="compact-input readonly" disabled />
    //                </div>
    //                <div className="field-group">
    //                    <label>Purchase Type</label>
    //                    <div className="radio-group">
    //                        <label className={`radio-btn ${form.tranType === "Cash" ? 'active' : ''}`}>
    //                            <input type="radio" name="tranType" value="Cash" checked={form.tranType === "Cash"} onChange={handleChange} />
    //                            <FaMoneyBillWave /> Cash
    //                        </label>
    //                        <label className={`radio-btn ${form.tranType === "Credit" ? 'active' : ''}`}>
    //                            <input type="radio" name="tranType" value="Credit" checked={form.tranType === "Credit"} onChange={handleChange} />
    //                            <FaCreditCard /> Credit
    //                        </label>
    //                    </div>
    //                </div>
    //            </div>

    //            {/* Supplier Row */}
    //            <div className="purchase-supplier-row">
    //                <div className="field-group flex-2">
    //                    <label>Supplier</label>
    //                    <ReactSelect
    //                        value={form.suppID?.toString()}
    //                        onChange={(e) => setForm({ ...form, suppID: e.target.value })}
    //                        options={supplierOptions}
    //                        placeholder="Search supplier..."
    //                        isClearable
    //                        disabled={loading}
    //                    />
    //                </div>
    //                <div className="field-group flex-1">
    //                    <label>Ref. Number</label>
    //                    <input type="text" name="refrNumb" value={form.refrNumb} onChange={handleChange} className="compact-input" placeholder="Supplier ref" disabled={loading} />
    //                </div>
    //            </div>

    //            {/* Walking Supplier */}
    //            <div className="field-group">
    //                <label>Walking Supplier</label>
    //                <input type="text" name="walkingCustomerName" value={form.walkingCustomerName} onChange={handleChange} className="compact-input" placeholder="For walk-in supplier..." disabled={loading} />
    //            </div>

    //            {/* Items Table */}
    //            <div className="items-table-container">
    //                <div className="items-table-header">
    //                    <span className="header-cell model-col">Model</span>
    //                    <span className="header-cell item-col">Item</span>
    //                    <span className="header-cell stock-col">Stock</span>
    //                    <span className="header-cell rate-col">Rate</span>
    //                    <span className="header-cell qty-col">Qty</span>
    //                    <span className="header-cell godown-col">Godown <span className="required">*</span></span>
    //                    <span className="header-cell amount-col">Amount</span>
    //                    <span className="header-cell action-col">
    //                        <button type="button" className="add-row-btn" onClick={addItemRow} title="Add Item">
    //                            <FaPlus />
    //                        </button>
    //                    </span>
    //                </div>

    //                <div className="items-table-body">
    //                    {enrichedItems.map((item, index) => (
    //                        <div key={index} className="items-table-row">
    //                            <div className="table-cell model-col">
    //                                <ReactSelect
    //                                    value={item.modlNumb || ''}
    //                                    onChange={(e) => handleModelSelect(index, e.target.value)}
    //                                    options={modelOptions}
    //                                    placeholder="Model"
    //                                    isClearable
    //                                    disabled={loading}
    //                                />
    //                            </div>
    //                            <div className="table-cell item-col">
    //                                <ReactSelect
    //                                    value={item.itemID?.toString()}
    //                                    onChange={(e) => handleItemSelect(index, e.target.value)}
    //                                    options={itemOptions}
    //                                    placeholder="Item"
    //                                    isClearable
    //                                    disabled={loading}
    //                                />
    //                            </div>
    //                            <div className="table-cell stock-col">
    //                                <span className={`stock-indicator ${item.currentStock <= 0 ? 'out' : item.currentStock < 10 ? 'low' : 'good'}`}>
    //                                    {formatNumber(item.currentStock, 0)}
    //                                </span>
    //                            </div>
    //                            <div className="table-cell rate-col">
    //                                <input
    //                                    type="number"
    //                                    value={item.purcRate || ''}
    //                                    onChange={(e) => handleItemFieldChange(index, 'purcRate', e.target.value)}
    //                                    className="table-input"
    //                                    step="0.01"
    //                                    disabled={loading}
    //                                />
    //                            </div>
    //                            <div className="table-cell qty-col">
    //                                <input
    //                                    type="number"
    //                                    value={item.purcQnty || ''}
    //                                    onChange={(e) => handleItemFieldChange(index, 'purcQnty', e.target.value)}
    //                                    className="table-input"
    //                                    min="1"
    //                                    disabled={loading}
    //                                />
    //                            </div>
    //                            <div className="table-cell godown-col">
    //                                <ReactSelect
    //                                    value={item.godownID?.toString()}
    //                                    onChange={(e) => handleItemFieldChange(index, 'godownID', e.target.value)}
    //                                    options={godownOptions}
    //                                    placeholder="Select"
    //                                    isClearable={false} // 🔥 Required field
    //                                    disabled={loading}
    //                                />
    //                            </div>
    //                            <div className="table-cell amount-col">
    //                                <span className="amount-value">{formatNumber(item.purcAmnt)}</span>
    //                            </div>
    //                            <div className="table-cell action-col">
    //                                <button
    //                                    type="button"
    //                                    className="remove-row-btn"
    //                                    onClick={() => removeItemRow(index)}
    //                                    disabled={form.items.length <= 1}
    //                                >
    //                                    <FaTrash />
    //                                </button>
    //                            </div>
    //                        </div>
    //                    ))}
    //                </div>

    //                <div className="items-table-footer">
    //                    <span className="footer-label">Total</span>
    //                    <span className="footer-value">{formatNumber(totalQty, 0)} units</span>
    //                    <span className="footer-label">Amount</span>
    //                    <span className="footer-value total-amount">{formatNumber(totalAmount)}</span>
    //                </div>
    //            </div>

    //            {errors.items && <div className="error-message">{errors.items}</div>}
    //            {errors.godown && <div className="error-message">{errors.godown}</div>}

    //            {/* Description */}
    //            <div className="field-group">
    //                <label>Description / Notes</label>
    //                <textarea name="tranDesc" value={form.tranDesc} onChange={handleChange} className="compact-textarea" rows="2" placeholder="Additional notes..." disabled={loading}></textarea>
    //            </div>
    //        </div>
    //    </Modal>
    //);
    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={<><FaShoppingCart /> {isEdit ? "Edit Purchase" : "New Purchase"}</>}
            size="xxl"
            footer={modalFooter}
        >
            <div className="purchase-popup-container">
                {/* Header Row */}
                <div className="purchase-header-row">
                    <div className="field-group">
                        <label>Date</label>
                        <input type="date" name="tranDate" value={form.tranDate} onChange={handleChange} className="compact-input" disabled={loading} />
                        <small className="date-hint">{displayDate}</small>
                    </div>
                    <div className="field-group">
                        <label>Bill Number</label>
                        <input type="text" value={form.billNumb || "Auto-generated"} readOnly className="compact-input readonly" disabled />
                    </div>
                    <div className="field-group">
                        <label>Purchase Type</label>
                        <div className="radio-group">
                            <label className={`radio-btn ${form.tranType === "Cash" ? 'active' : ''}`}>
                                <input type="radio" name="tranType" value="Cash" checked={form.tranType === "Cash"} onChange={handleChange} />
                                <FaMoneyBillWave /> Cash
                            </label>
                            <label className={`radio-btn ${form.tranType === "Credit" ? 'active' : ''}`}>
                                <input type="radio" name="tranType" value="Credit" checked={form.tranType === "Credit"} onChange={handleChange} />
                                <FaCreditCard /> Credit
                            </label>
                        </div>
                    </div>
                </div>

                {/* Supplier Row */}
                <div className="purchase-supplier-row">
                    <div className="field-group flex-2">
                        <label>Supplier</label>
                        <ReactSelect
                            value={form.suppID?.toString()}
                            onChange={(selected) => setForm({ ...form, suppID: selected?.value })}
                            options={supplierOptions}
                            placeholder="Search supplier..."
                            isClearable
                            isDisabled={loading}
                        />
                    </div>
                    <div className="field-group flex-1">
                        <label>Ref. Number</label>
                        <input type="text" name="refrNumb" value={form.refrNumb} onChange={handleChange} className="compact-input" placeholder="Supplier ref" disabled={loading} />
                    </div>
                </div>

                {/* ✅ NEW: Walking Supplier + Description Row - 2 Columns */}
                <div className="two-column-row">
                    <div className="field-group walking-supplier-field">
                        <label>Walking Supplier</label>
                        <input type="text" name="walkingCustomerName" value={form.walkingCustomerName} onChange={handleChange} className="compact-input" placeholder="Walk-in supplier..." disabled={loading} />
                    </div>
                    <div className="field-group description-field">
                        <label>Description / Notes</label>
                        <textarea name="tranDesc" value={form.tranDesc} onChange={handleChange} className="compact-textarea" rows="2" placeholder="Additional notes..." disabled={loading}></textarea>
                    </div>
                </div>

                {/* Items Table */}
                <div className="items-table-container">
                    <div className="items-table-header">
                        <span className="header-cell model-col">Model</span>
                        <span className="header-cell item-col">Item</span>
                        <span className="header-cell stock-col">Stock</span>
                        <span className="header-cell rate-col">Rate</span>
                        <span className="header-cell qty-col">Qty</span>
                        <span className="header-cell godown-col">Godown <span className="required">*</span></span>
                        <span className="header-cell amount-col">Amount</span>
                        <span className="header-cell action-col">
                            <button type="button" className="add-row-btn" onClick={addItemRow} title="Add Item">
                                <FaPlus />
                            </button>
                        </span>
                    </div>

                    <div className="items-table-body">
                        {enrichedItems.map((item, index) => (
                            <div key={index} className="items-table-row">
                                <div className="table-cell model-col">
                                    <ReactSelect
                                        value={item.modlNumb || ''}
                                        onChange={(selected) => handleModelSelect(index, selected?.value)}
                                        options={modelOptions}
                                        placeholder="Model"
                                        isClearable
                                        isDisabled={loading}
                                    />
                                </div>
                                <div className="table-cell item-col">
                                    <ReactSelect
                                        value={item.itemID?.toString() || ''}
                                        onChange={(selected) => handleItemSelect(index, selected?.value)}
                                        options={itemOptions}
                                        placeholder="Item"
                                        isClearable
                                        isDisabled={loading}
                                    />
                                </div>
                                <div className="table-cell stock-col">
                                    <span className={`stock-indicator ${item.currentStock <= 0 ? 'out' : item.currentStock < 10 ? 'low' : 'good'}`}>
                                        {formatNumber(item.currentStock, 0)}
                                    </span>
                                </div>
                                <div className="table-cell rate-col">
                                    <input
                                        type="number"
                                        value={item.purcRate || ''}
                                        onChange={(e) => handleItemFieldChange(index, 'purcRate', e.target.value)}
                                        className="table-input"
                                        step="0.01"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="table-cell qty-col">
                                    <input
                                        type="number"
                                        value={item.purcQnty || ''}
                                        onChange={(e) => handleItemFieldChange(index, 'purcQnty', e.target.value)}
                                        className="table-input"
                                        min="1"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="table-cell godown-col">
                                    <ReactSelect
                                        value={item.godownID?.toString() || ''}
                                        onChange={(selected) => handleItemFieldChange(index, 'godownID', selected?.value)}
                                        options={godownOptions}
                                        placeholder="Select"
                                        isClearable={false}
                                        isDisabled={loading}
                                    />
                                </div>
                                <div className="table-cell amount-col">
                                    <span className="amount-value">{formatNumber(item.purcAmnt)}</span>
                                </div>
                                <div className="table-cell action-col">
                                    <button
                                        type="button"
                                        className="remove-row-btn"
                                        onClick={() => removeItemRow(index)}
                                        disabled={form.items.length <= 1}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="items-table-footer">
                        <span className="footer-label">Total</span>
                        <span className="footer-value">{formatNumber(totalQty, 0)} units</span>
                        <span className="footer-label">Amount</span>
                        <span className="footer-value total-amount">{formatNumber(totalAmount)}</span>
                    </div>
                </div>

                {errors.items && <div className="error-message">{errors.items}</div>}
                {errors.godown && <div className="error-message">{errors.godown}</div>}
            </div>
        </Modal>
    );
}