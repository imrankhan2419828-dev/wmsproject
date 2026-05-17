import React, { useEffect, useState } from "react";
import salesApi from "../../api/salesApi";
import stockApi from "../../api/stockApi";
import godownApi from "../../api/godownApi";
import { formatNumber } from "../../utils/numberUtils";
import { formatDate } from "../../utils/dateUtils";
import { Modal } from "../../components/common/Modal/Modal";
import { Input, Button, ReactSelect, useDialog } from "../../components/common";
import { FaShoppingCart, FaMoneyBillWave, FaCreditCard, FaPlus, FaTrash } from "react-icons/fa";
import "./SalesPopup.css";

// Last used godown cache
const lastGodownCache = {};

export default function SalesPopup({ tranNumb, onClose, onSaved }) {
    const isEdit = !!tranNumb;
    const [itemsList, setItemsList] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [godowns, setGodowns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [nextInvoiceNo, setNextInvoiceNo] = useState("");
    const { showSuccess, showError } = useDialog();

    const [form, setForm] = useState({
        tranDate: new Date().toISOString().slice(0, 10),
        tranMode: "Cash",
        custID: null,
        walkingCustomer: "",
        tranDesc: "",
        billNumb: "",
        items: [{ itemID: "", modlNumb: "", saleRate: 0, saleQnty: 1, saleAmnt: 0, godownID: null }]
    });

    const [enrichedItems, setEnrichedItems] = useState([]);

    const customerOptions = customers.map(c => ({ value: c.acctID?.toString(), label: `${c.acctCode} - ${c.acctName}` }));
    const itemOptions = itemsList.map(i => ({ value: i.itemID?.toString(), label: `${i.itemName} ${i.modlNumb ? `(${i.modlNumb})` : ''}`, item: i }));
    const modelOptions = itemsList.filter(i => i.modlNumb).map(i => ({ value: i.modlNumb, label: i.modlNumb, item: i }));
    const godownOptions = godowns.map(g => ({ value: g.godnID?.toString(), label: g.godnName }));

    const fetchStock = async (itemId) => {
        if (!itemId) return 0;
        try {
            const res = await stockApi.getCurrent(itemId);
            return res.data?.data ?? (typeof res.data === 'number' ? res.data : 0);
        } catch (err) { return 0; }
    };

    const enrichItemDetails = async (itemId, godownId = null) => {
        const itemDetail = itemsList.find(i => i.itemID === parseInt(itemId));
        if (!itemDetail) return null;
        const stock = await fetchStock(itemId);
        /*const rate = itemDetail.saleRate || 0;*/
        const rate = itemDetail.saleRate ?? 0;

        // ✅ Priority for godown: passed > cache > item default > FIRST AVAILABLE
        let finalGodownId = godownId;
        if (!finalGodownId) {
            finalGodownId = lastGodownCache[itemId] ||
                itemDetail.godownID ||
                (godowns.length > 0 ? godowns[0].godnID : null);
        }

        return {
            itemID: itemDetail.itemID,
            itemName: itemDetail.itemName,
            modlNumb: itemDetail.modlNumb,
            currentStock: stock,
            saleRate: rate,
            godownID: finalGodownId
        };
    };

    // Sync enriched items when form items change
    useEffect(() => {
        const syncItems = async () => {
            const enriched = await Promise.all(form.items.map(async (item) => {
                if (!item.itemID) {
                    return {
                        ...item,
                        currentStock: 0,
                        itemName: '',
                        modlNumb: '',
                        godownName: ''
                    };
                }
                const details = await enrichItemDetails(item.itemID, item.godownID);
                return {
                    ...item,
                    ...details,
                    saleRate: item.saleRate || details?.saleRate || 0,
                    saleAmnt: (item.saleRate || details?.saleRate || 0) * (item.saleQnty || 1)
                };
            }));
            setEnrichedItems(enriched);
        };
        syncItems();
    }, [form.items, itemsList, godowns]);

    // Load dropdown data
    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                setLoading(true);
                const [customersRes, itemsRes, godownsRes, invoiceRes] = await Promise.all([
                    salesApi.getCustomers(),
                    salesApi.getItems(),
                    godownApi.getAll(),
                    salesApi.getNextInvoice()
                ]);
                setCustomers(customersRes.data?.data || customersRes.data || []);
                setItemsList(itemsRes.data?.data || itemsRes.data || []);
                setGodowns(godownsRes.data?.data || godownsRes.data || []);
                if (invoiceRes.data?.data) {
                    setNextInvoiceNo(invoiceRes.data.data);
                    setForm(prev => ({ ...prev, billNumb: invoiceRes.data.data }));
                }
            } catch (err) {
                showError("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        loadDropdowns();
    }, []);

    // Load sale for edit
    useEffect(() => {
        if (!tranNumb || !itemsList.length) return;

        const loadSale = async () => {
            setLoading(true);
            try {
                const res = await salesApi.getByTranNumb(tranNumb);
                const data = res.data?.data || res.data;
                if (!data) return;

                const items = (data.items || []).map(i => {
                    const itemDetail = itemsList.find(it => it.itemID === i.itemID);
                    return {
                        itemID: i.itemID || "",
                        modlNumb: itemDetail?.modlNumb || "",
                        saleRate: i.saleRate || 0,
                        saleQnty: i.saleQnty || 1,
                        saleAmnt: (i.saleRate || 0) * (i.saleQnty || 1),
                        godownID: i.godownID || null
                    };
                });

                // Cache godowns from edit
                items.forEach(i => {
                    if (i.itemID && i.godownID) {
                        lastGodownCache[i.itemID] = i.godownID;
                    }
                });

                setForm({
                    tranDate: data.tranDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
                    tranMode: data.tranMode === "CASH" ? "Cash" : "Credit",
                    custID: data.custID || null,
                    walkingCustomer: data.walkingCustomer || "",
                    tranDesc: data.tranDesc || "",
                    billNumb: data.billNumb || nextInvoiceNo,
                    items: items.length ? items : [{ itemID: "", modlNumb: "", saleRate: 0, saleQnty: 1, saleAmnt: 0, godownID: null }]
                });
            } catch (err) {
                showError("Failed to load sale");
            } finally {
                setLoading(false);
            }
        };
        loadSale();
    }, [tranNumb, itemsList]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    // Handle Model Selection - AUTO POPULATE ITEM AND GODOWN
    const handleModelSelect = async (index, modelNumber) => {
        if (!modelNumber) return;

        const items = [...form.items];
        const itemDetail = itemsList.find(i => i.modlNumb === modelNumber);
        if (!itemDetail) return;

        const stock = await fetchStock(itemDetail.itemID);
        /*const rate = itemDetail.saleRate || 0;*/
        const rate = itemDetail.saleRate ?? 0;

        // ✅ Priority: Last used > Item default > First available godown
        const godownId = lastGodownCache[itemDetail.itemID] ||
            itemDetail.godownID ||
            (godowns.length > 0 ? godowns[0].godnID : null);

        items[index] = {
            ...items[index],
            itemID: itemDetail.itemID,
            modlNumb: modelNumber,
            saleRate: rate,
            saleQnty: items[index].saleQnty || 1,
            saleAmnt: rate * (items[index].saleQnty || 1),
            godownID: godownId
        };

        setForm({ ...form, items });
    };

    // Handle Item Selection
    const handleItemSelect = async (index, itemId) => {
        if (!itemId) return;

        const items = [...form.items];
        const itemDetail = itemsList.find(i => i.itemID === parseInt(itemId));
        if (!itemDetail) return;

        const stock = await fetchStock(itemId);
        /*const rate = itemDetail.saleRate || 0;*/
        const rate = itemDetail.saleRate ?? 0;

        // ✅ Priority: Last used > Item default > First available godown
        const godownId = lastGodownCache[itemId] ||
            itemDetail.godownID ||
            (godowns.length > 0 ? godowns[0].godnID : null);

        items[index] = {
            ...items[index],
            itemID: itemId,
            modlNumb: itemDetail.modlNumb || "",
            saleRate: rate,
            saleQnty: items[index].saleQnty || 1,
            saleAmnt: rate * (items[index].saleQnty || 1),
            godownID: godownId
        };

        setForm({ ...form, items });
    };

    const handleItemFieldChange = (index, field, value) => {
        const items = [...form.items];

        if (field === 'saleRate') {
            const rate = parseFloat(value) || 0;
            items[index].saleRate = rate;
            items[index].saleAmnt = rate * (items[index].saleQnty || 1);
        } else if (field === 'saleQnty') {
            const qty = parseFloat(value) || 1;

            // Stock validation
            const enriched = enrichedItems[index];
            if (enriched && qty > enriched.currentStock) {
                showError(`Insufficient stock! Available: ${enriched.currentStock}`);
                return;
            }

            items[index].saleQnty = qty;
            items[index].saleAmnt = (items[index].saleRate || 0) * qty;
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
            items: [...form.items, { itemID: "", modlNumb: "", saleRate: 0, saleQnty: 1, saleAmnt: 0, godownID: null }]
        });
    };

    const removeItemRow = (index) => {
        if (form.items.length <= 1) {
            showError("At least one item required");
            return;
        }
        const items = [...form.items];
        items.splice(index, 1);
        setForm({ ...form, items });
    };

    const validateForm = () => {
        const newErrors = {};
        const validItems = form.items.filter(i => i.itemID && i.saleQnty > 0);
        if (validItems.length === 0) newErrors.items = "Add at least one item with quantity > 0";

        // ✅ Check godown selected
        const itemsWithoutGodown = validItems.filter(i => !i.godownID);
        if (itemsWithoutGodown.length > 0) {
            newErrors.godown = "Please select godown for all items";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const validItems = form.items.filter(i => i.itemID && i.saleQnty > 0);
            const payload = {
                tranDate: form.tranDate,
                tranMode: form.tranMode === "Cash" ? "CASH" : "Credit",
                custID: form.custID ? Number(form.custID) : null,
                walkingCustomer: form.walkingCustomer,
                tranDesc: form.tranDesc,
                items: validItems.map(i => ({
                    itemID: Number(i.itemID),
                    saleQnty: Number(i.saleQnty),
                    saleRate: Number(i.saleRate),
                    godownID: i.godownID ? Number(i.godownID) : null
                }))
            };

            if (isEdit) {
                await salesApi.update(tranNumb, payload);
            } else {
                await salesApi.create(payload);
            }

            showSuccess(isEdit ? "Sale updated!" : "Sale saved!");
            onSaved();
            onClose();
        } catch (err) {
            showError(err.response?.data?.message || "Save failed");
        } finally {
            setLoading(false);
        }
    };

    const totalQty = form.items.reduce((sum, i) => sum + (i.saleQnty || 0), 0);
    const totalAmount = form.items.reduce((sum, i) => sum + (i.saleAmnt || 0), 0);
    const displayDate = formatDate(form.tranDate);

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={<><FaShoppingCart /> {isEdit ? "Edit Sale" : "New Sale"}</>}
            size="xxl"
            footer={
                <div className="popup-footer">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} loading={loading}>Save Sale</Button>
                </div>
            }
        >
            <div className="sales-popup-container">
                {/* Header Row */}
                <div className="sales-header-row">
                    <div className="field-group">
                        <label>Date</label>
                        <input type="date" name="tranDate" value={form.tranDate} onChange={handleChange} className="compact-input" disabled={loading} />
                        <small className="date-hint">{displayDate}</small>
                    </div>
                    <div className="field-group">
                        <label>Invoice Number</label>
                        <input type="text" value={form.billNumb || "Auto-generated"} readOnly className="compact-input readonly" disabled />
                    </div>
                    <div className="field-group">
                        <label>Sale Type</label>
                        <div className="radio-group">
                            <label className={`radio-btn ${form.tranMode === "Cash" ? 'active' : ''}`}>
                                <input type="radio" name="tranMode" value="Cash" checked={form.tranMode === "Cash"} onChange={handleChange} />
                                <FaMoneyBillWave /> Cash
                            </label>
                            <label className={`radio-btn ${form.tranMode === "Credit" ? 'active' : ''}`}>
                                <input type="radio" name="tranMode" value="Credit" checked={form.tranMode === "Credit"} onChange={handleChange} />
                                <FaCreditCard /> Credit
                            </label>
                        </div>
                    </div>
                </div>

                {/* Customer Row */}
                <div className="sales-customer-row">
                    <div className="field-group flex-2">
                        <label>Customer</label>
                        <ReactSelect
                            value={form.custID?.toString()}
                            onChange={(e) => setForm({ ...form, custID: e?.target?.value || e })}
                            options={customerOptions}
                            placeholder="Select customer..."
                            isClearable
                            disabled={loading}
                        />
                    </div>
                    <div className="field-group flex-1">
                        <label>Walking Customer</label>
                        <input type="text" name="walkingCustomer" value={form.walkingCustomer} onChange={handleChange} className="compact-input" placeholder="Walk-in customer" disabled={loading} />
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
                                        onChange={(e) => handleModelSelect(index, e?.target?.value || e)}
                                        options={modelOptions}
                                        placeholder="Model"
                                        isClearable
                                        disabled={loading}
                                    />
                                </div>
                                <div className="table-cell item-col">
                                    <ReactSelect
                                        value={item.itemID?.toString()}
                                        onChange={(e) => handleItemSelect(index, e?.target?.value || e)}
                                        options={itemOptions}
                                        placeholder="Item"
                                        isClearable
                                        disabled={loading}
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
                                        value={item.saleRate || ''}
                                        onChange={(e) => handleItemFieldChange(index, 'saleRate', e.target.value)}
                                        className="table-input"
                                        step="0.01"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="table-cell qty-col">
                                    <input
                                        type="number"
                                        value={item.saleQnty || ''}
                                        onChange={(e) => handleItemFieldChange(index, 'saleQnty', e.target.value)}
                                        className="table-input"
                                        min="1"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="table-cell godown-col">
                                    <ReactSelect
                                        value={item.godownID?.toString()}
                                        onChange={(e) => handleItemFieldChange(index, 'godownID', e?.target?.value || e)}
                                        options={godownOptions}
                                        placeholder="Select"
                                        isClearable={false}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="table-cell amount-col">
                                    <span className="amount-value">{formatNumber(item.saleAmnt)}</span>
                                </div>
                                <div className="table-cell action-col">
                                    <button
                                        type="button"
                                        className="remove-row-btn"
                                        onClick={() => removeItemRow(index)}
                                        disabled={form.items.length <= 1}
                                        title="Remove Item"
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

                {/* Description */}
                <div className="field-group">
                    <label>Description / Notes</label>
                    <textarea name="tranDesc" value={form.tranDesc} onChange={handleChange} className="compact-textarea" rows="2" placeholder="Additional notes..." disabled={loading}></textarea>
                </div>
            </div>
        </Modal>
    );
}