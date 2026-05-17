import React, { useEffect, useState } from "react";
import receivingApi from "../../api/receivingApi";
import { formatNumber } from "../../utils/numberUtils";
import { formatDate } from "../../utils/dateUtils";
import { Modal } from "../../components/common/Modal/Modal";
import { Input, Button, ReactSelect, useDialog } from "../../components/common";
import { FaMoneyBillWave, FaPlus, FaTrash } from "react-icons/fa";
import "./ReceivingPopup.css";

const emptyEntry = { type: "CASH", amount: 0, bankName: "", chequeNumber: "", chequeDate: "" };

export default function ReceivingPopup({ editId, onClose, onSaved }) {
    const isEdit = !!editId;
    const [customers, setCustomers] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [otherAccounts, setOtherAccounts] = useState([]);
    const [entries, setEntries] = useState([{ ...emptyEntry }]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [voucherNumber, setVoucherNumber] = useState("");
    const { showSuccess, showError } = useDialog();

    const [form, setForm] = useState({
        id: null, receiveDate: new Date().toISOString().slice(0, 10), receivingType: "CUSTOMER",
        partyId: "", partyName: "", walkingCustomer: "", receiptRefNumb: "", remarks: ""
    });

    const displayDate = formatDate(form.receiveDate);

    const receivingTypeOptions = [
        { value: "CUSTOMER", label: "Customer Receipt" },
        { value: "BANK", label: "Bank Receipt" },
        { value: "OTHER", label: "Other Receipt" }
    ];

    const entryTypeOptions = [
        { value: "CASH", label: "Cash" },
        { value: "CHEQUE", label: "Cheque" }
    ];

    const getPartyOptions = () => {
        switch (form.receivingType) {
            case "CUSTOMER": return customers.map(c => ({ value: c.acctID?.toString(), label: `${c.acctCode} - ${c.acctName}` }));
            case "BANK": return bankAccounts.map(b => ({ value: b.acctID?.toString(), label: b.acctName }));
            case "OTHER": return otherAccounts.map(o => ({ value: o.acctID?.toString(), label: o.acctName }));
            default: return [];
        }
    };

    useEffect(() => {
        const loadNext = async () => { if (!isEdit) { try { const res = await receivingApi.getNextVoucher(); setVoucherNumber(res.data?.data || res.data || "Auto-generated"); } catch (err) { setVoucherNumber("Auto-generated"); } } };
        loadNext();
    }, [isEdit]);

    useEffect(() => {
        const loadAll = async () => {
            try {
                const [customersRes, bankRes, otherRes] = await Promise.all([
                    receivingApi.getCustomers(), receivingApi.getBankCashAccounts(), receivingApi.getAccountsByType("OTHER")
                ]);
                setCustomers(customersRes.data?.data || customersRes.data || []);
                setBankAccounts(bankRes.data?.data || bankRes.data || []);
                setOtherAccounts(otherRes.data?.data || otherRes.data || []);
            } catch (err) { console.error("Load error:", err); }
        };
        loadAll();
    }, []);

    useEffect(() => {
        if (!editId) return;
        const loadReceipt = async () => {
            setLoading(true);
            try {
                const res = await receivingApi.getById(editId);
                let data = res.data?.data || res.data;
                setForm({
                    id: data.id, receiveDate: data.receiveDate?.split("T")[0] || new Date().toISOString().slice(0, 10),
                    receivingType: data.receivingType || "CUSTOMER", partyId: data.partyId?.toString() || "",
                    partyName: data.partyName || "", walkingCustomer: data.walkingCustomer || "",
                    receiptRefNumb: data.receiptRefNumb || "", remarks: data.remarks || ""
                });
                setVoucherNumber(data.voucherNumb || "");
                const newEntries = [];
                if (data.cashList?.length) data.cashList.forEach(c => newEntries.push({ type: "CASH", amount: c.amount, bankName: "", chequeNumber: "", chequeDate: "" }));
                if (data.chequeList?.length) data.chequeList.forEach(c => newEntries.push({ type: "CHEQUE", amount: c.amount, bankName: c.bankName, chequeNumber: c.chequeNumber, chequeDate: c.chequeDate?.split("T")[0] || "" }));
                if (newEntries.length) setEntries(newEntries);
            } catch (err) { showError("Failed to load receipt"); }
            finally { setLoading(false); }
        };
        loadReceipt();
    }, [editId]);

    const handleChange = (field, value) => { setForm(f => ({ ...f, [field]: value })); if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' })); };
    const handleEntryChange = (index, field, value) => { setEntries(prev => { const copy = [...prev]; copy[index][field] = value; return copy; }); };
    const addEntry = () => setEntries(e => [...e, { ...emptyEntry }]);
    const removeEntry = (index) => { if (entries.length > 1) setEntries(e => e.filter((_, i) => i !== index)); };

    const validateForm = () => {
        const newErrors = {};
        if (!form.walkingCustomer && !form.partyId) newErrors.party = "Select party or enter walking customer";
        const validEntries = entries.filter(e => e.amount > 0);
        if (!validEntries.length) newErrors.entries = "Add at least one entry with amount > 0";
        validEntries.forEach((e, i) => { if (e.type === "CHEQUE" && (!e.bankName || !e.chequeNumber || !e.chequeDate)) newErrors[`cheque_${i}`] = "Complete cheque details"; });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const cashList = [], chequeList = [];
            entries.filter(e => e.amount > 0).forEach(e => { if (e.type === "CASH") cashList.push({ amount: e.amount }); else chequeList.push({ bankName: e.bankName, chequeNumber: e.chequeNumber, chequeDate: e.chequeDate, amount: e.amount }); });
            const payload = { ...form, partyId: form.partyId ? parseInt(form.partyId) : null, cashList, chequeList, accountId: 7 };
            if (isEdit) await receivingApi.update(editId, payload);
            else await receivingApi.create(payload);
            showSuccess(isEdit ? "Receipt updated!" : "Receipt saved!");
            onSaved(); onClose();
        } catch (err) { showError(err.response?.data?.message || "Save failed"); }
        finally { setLoading(false); }
    };

    const totalAmount = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
    const partyOptions = getPartyOptions();

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={<><FaMoneyBillWave /> {isEdit ? "Edit Receipt" : "New Receipt"}</>}
            size="xxl"
            footer={
                <div className="popup-footer">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} loading={loading}>Save Receipt</Button>
                </div>
            }
        >
            <div className="rec-popup-container">
                {/* LINE 1: Date, Receipt No., Receipt Type, Reference No., Customer/Account */}
                <div className="form-row-5">
                    <div className="field-group">
                        <label>Date</label>
                        <input type="date" value={form.receiveDate} onChange={(e) => handleChange('receiveDate', e.target.value)} className="compact-input" disabled={loading} />
                        <small className="date-hint">{displayDate}</small>
                    </div>
                    <div className="field-group">
                        <label>Receipt No.</label>
                        <input type="text" value={voucherNumber || "Auto-generated"} readOnly className="compact-input readonly" disabled />
                    </div>
                    <div className="field-group">
                        <label>Receipt Type</label>
                        <ReactSelect value={form.receivingType} onChange={(e) => handleChange('receivingType', e?.target?.value || e)} options={receivingTypeOptions} disabled={loading} />
                    </div>
                    <div className="field-group">
                        <label>Reference No.</label>
                        <input type="text" value={form.receiptRefNumb} onChange={(e) => handleChange('receiptRefNumb', e.target.value)} className="compact-input" placeholder="Ref. number" disabled={loading} />
                    </div>
                    <div className="field-group">
                        <label>{form.receivingType === "CUSTOMER" ? "Customer" : "Account"}</label>
                        <ReactSelect
                            value={form.partyId}
                            onChange={(e) => {
                                handleChange('partyId', e?.target?.value || e);
                                handleChange('partyName', partyOptions.find(o => o.value === (e?.target?.value || e))?.label || '');
                            }}
                            options={partyOptions}
                            placeholder={`Select ${form.receivingType.toLowerCase()}...`}
                            isClearable
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* LINE 2: Walking Customer, Remarks */}
                <div className="form-row-2">
                    <div className="field-group">
                        <label>Walking Customer</label>
                        <input type="text" value={form.walkingCustomer} onChange={(e) => handleChange('walkingCustomer', e.target.value)} className="compact-input" placeholder="Walk-in customer" disabled={loading} />
                    </div>
                    <div className="field-group">
                        <label>Remarks</label>
                        <input type="text" value={form.remarks} onChange={(e) => handleChange('remarks', e.target.value)} className="compact-input" placeholder="Additional notes..." disabled={loading} />
                    </div>
                </div>

                {errors.party && <div className="error-message">{errors.party}</div>}

                {/* Receipt Entries Section */}
                <div className="items-section">
                    <div className="items-header">
                        <span>Receipt Entries</span>
                        <Button size="sm" variant="outline" onClick={addEntry} icon={<FaPlus />}>Add Entry</Button>
                    </div>
                    {errors.entries && <div className="error-message">{errors.entries}</div>}
                    <div className="items-table-wrapper">
                        <table className="items-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Bank</th>
                                    <th>Cheque No.</th>
                                    <th>Cheque Date</th>
                                    <th>Amount</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((e, i) => (
                                    <tr key={i}>
                                        <td>
                                            <ReactSelect
                                                value={e.type}
                                                onChange={(val) => handleEntryChange(i, 'type', val?.target?.value || val)}
                                                options={entryTypeOptions}
                                                disabled={loading}
                                            />
                                        </td>
                                        <td>
                                            {e.type === "CHEQUE" && (
                                                <input
                                                    type="text"
                                                    value={e.bankName}
                                                    onChange={(ev) => handleEntryChange(i, 'bankName', ev.target.value)}
                                                    className="table-input"
                                                    placeholder="Bank name"
                                                    disabled={loading}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            {e.type === "CHEQUE" && (
                                                <input
                                                    type="text"
                                                    value={e.chequeNumber}
                                                    onChange={(ev) => handleEntryChange(i, 'chequeNumber', ev.target.value)}
                                                    className="table-input"
                                                    placeholder="Cheque #"
                                                    disabled={loading}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            {e.type === "CHEQUE" && (
                                                <input
                                                    type="date"
                                                    value={e.chequeDate}
                                                    onChange={(ev) => handleEntryChange(i, 'chequeDate', ev.target.value)}
                                                    className="table-input"
                                                    disabled={loading}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={e.amount}
                                                onChange={(ev) => handleEntryChange(i, 'amount', parseFloat(ev.target.value) || 0)}
                                                className="table-input"
                                                placeholder="0"
                                                disabled={loading}
                                            />
                                        </td>
                                        <td>
                                            {entries.length > 1 && (
                                                <button className="remove-row-btn" onClick={() => removeEntry(i)}>
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="items-total">
                        Total: <strong>{formatNumber(totalAmount)}</strong>
                    </div>
                </div>
            </div>
        </Modal>
    );
}