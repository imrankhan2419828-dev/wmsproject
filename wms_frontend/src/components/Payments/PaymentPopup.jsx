import React, { useEffect, useState } from "react";
import paymentApi from "../../api/paymentApi";
import { formatNumber } from "../../utils/numberUtils";
import { formatDate } from "../../utils/dateUtils";
import { Modal } from "../../components/common/Modal/Modal";
import { Input, Button, ReactSelect, useDialog } from "../../components/common";
import { FaMoneyBillWave, FaPlus, FaTrash } from "react-icons/fa";
import "./PaymentPopup.css";

const emptyEntry = { paymentMode: "CASH", amount: 0, bankAccountID: null, chequeNo: "" };

export default function PaymentPopup({ payment, onClose, onSaved }) {
    const isEdit = !!payment?.paymentID;
    const [suppliers, setSuppliers] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [expenseAccounts, setExpenseAccounts] = useState([]);
    const [otherAccounts, setOtherAccounts] = useState([]);
    const [allBankAccounts, setAllBankAccounts] = useState([]);
    const [entries, setEntries] = useState([{ ...emptyEntry }]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [voucherNumber, setVoucherNumber] = useState("");
    const { showSuccess, showError } = useDialog();

    const [form, setForm] = useState({
        paymentID: null, paymentDate: new Date().toISOString().slice(0, 10), paymentType: "SUPPLIER",
        referenceID: null, referenceName: "", walkingParty: "", paymentRefNumb: "", description: ""
    });

    const displayDate = formatDate(form.paymentDate);

    const paymentTypeOptions = [
        { value: "SUPPLIER", label: "Supplier Payment" },
        { value: "BANK", label: "Bank Payment" },
        { value: "EXPENSE", label: "Expense Payment" },
        { value: "OTHER", label: "Other Payment" }
    ];

    const paymentModeOptions = [
        { value: "CASH", label: "Cash" },
        { value: "BANK", label: "Bank Transfer" },
        { value: "CHEQUE", label: "Cheque" }
    ];

    const getReferenceOptions = () => {
        switch (form.paymentType) {
            case "SUPPLIER": return suppliers.map(s => ({ value: s.acctID?.toString(), label: s.acctName }));
            case "BANK": return bankAccounts.map(b => ({ value: b.acctID?.toString(), label: b.acctName }));
            case "EXPENSE": return expenseAccounts.map(e => ({ value: e.acctID?.toString(), label: e.acctName }));
            case "OTHER": return otherAccounts.map(o => ({ value: o.acctID?.toString(), label: o.acctName }));
            default: return [];
        }
    };

    const allBankOptions = allBankAccounts.map(b => ({ value: b.acctID?.toString(), label: b.acctName }));

    useEffect(() => {
        const loadNext = async () => { if (!isEdit) { try { const res = await paymentApi.getNextVoucher(); setVoucherNumber(res.data?.data || res.data || "Auto-generated"); } catch (err) { setVoucherNumber("Auto-generated"); } } };
        loadNext();
    }, [isEdit]);

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            try {
                const [suppliersRes, bankRes, expenseRes, otherRes, allBankRes] = await Promise.all([
                    paymentApi.getAccounts("SUPPLIER"), paymentApi.getAccounts("BANK"), paymentApi.getAccounts("EXPENSE"), paymentApi.getAccounts("OTHER"), paymentApi.getBankAccounts()
                ]);
                setSuppliers(suppliersRes.data?.data || suppliersRes.data || []);
                setBankAccounts(bankRes.data?.data || bankRes.data || []);
                setExpenseAccounts(expenseRes.data?.data || expenseRes.data || []);
                setOtherAccounts(otherRes.data?.data || otherRes.data || []);
                setAllBankAccounts(allBankRes.data?.data || allBankRes.data || []);
            } catch (err) { console.error("Load error:", err); }
            finally { setLoading(false); }
        };
        loadAll();
    }, []);

    useEffect(() => {
        if (payment) {
            setForm({
                paymentID: payment.paymentID, paymentDate: payment.paymentDate?.split("T")[0] || new Date().toISOString().slice(0, 10),
                paymentType: payment.paymentType || "SUPPLIER", referenceID: payment.referenceID || null, referenceName: payment.referenceName || "",
                walkingParty: payment.walkingParty || "", paymentRefNumb: payment.paymentRefNumb || "", description: payment.description || ""
            });
            setVoucherNumber(payment.voucherNumb || "");
            if (payment.details?.length) setEntries(payment.details.map(d => ({ paymentMode: d.paymentMode, amount: d.amount, bankAccountID: d.bankAccountID, chequeNo: d.chequeNo || "" })));
            else setEntries([{ paymentMode: payment.paymentMode || "CASH", amount: payment.amount || 0, bankAccountID: payment.bankAccountID || null, chequeNo: payment.chequeNo || "" }]);
        }
    }, [payment]);

    const handleChange = (field, value) => { setForm(f => ({ ...f, [field]: value })); if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' })); };
    const handleEntryChange = (index, field, value) => { setEntries(prev => { const copy = [...prev]; copy[index][field] = value; return copy; }); };
    const addEntry = () => setEntries(e => [...e, { ...emptyEntry }]);
    const removeEntry = (index) => { if (entries.length > 1) setEntries(e => e.filter((_, i) => i !== index)); };

    const validateForm = () => {
        const newErrors = {};
        if (!form.walkingParty && !form.referenceID) newErrors.party = "Select account or enter walking party";
        const validEntries = entries.filter(e => e.amount > 0);
        if (!validEntries.length) newErrors.entries = "Add at least one entry with amount > 0";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const validEntries = entries.filter(e => e.amount > 0);

            // ✅ Determine master payment mode
            let masterPaymentMode = "CASH";
            if (validEntries.length === 1) {
                masterPaymentMode = validEntries[0].paymentMode;
            } else if (validEntries.length > 1) {
                // Check if all entries are same mode
                const allSameMode = validEntries.every(e => e.paymentMode === validEntries[0].paymentMode);
                masterPaymentMode = allSameMode ? validEntries[0].paymentMode : "MIXED";
            }

            const payload = {
                ...form,
                amount: validEntries.reduce((s, e) => s + e.amount, 0),
                paymentMode: masterPaymentMode,  // ✅ ALWAYS SET PAYMENT MODE
                details: validEntries.length > 1 ? validEntries : null,
                ...(validEntries.length === 1 ? {
                    bankAccountID: validEntries[0].bankAccountID,
                    chequeNo: validEntries[0].chequeNo
                } : {})
            };

            console.log("📦 Saving payload:", payload);  // Debug

            if (isEdit) await paymentApi.update(form.paymentID, payload);
            else await paymentApi.create(payload);

            showSuccess(isEdit ? "Payment updated!" : "Payment saved!");
            onSaved(); onClose();
        } catch (err) {
            showError(err.response?.data?.message || "Save failed");
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
    const referenceOptions = getReferenceOptions();

    //return (
    //    <Modal isOpen={true} onClose={onClose} title={<><FaMoneyBillWave /> {isEdit ? "Edit Payment" : "New Payment"}</>} size="xxl" footer={<div className="popup-footer"><Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button><Button variant="primary" onClick={handleSave} loading={loading}>Save Payment</Button></div>}>
    //        <div className="pm-popup-container">
    //            <div className="form-row-3">
    //                <div className="field-group"><label>Date</label><input type="date" value={form.paymentDate} onChange={(e) => handleChange('paymentDate', e.target.value)} className="compact-input" disabled={loading} /><small className="date-hint">{displayDate}</small></div>
    //                <div className="field-group"><label>Voucher No.</label><input type="text" value={voucherNumber || "Auto-generated"} readOnly className="compact-input readonly" disabled /></div>
    //                <div className="field-group"><label>Payment Type</label><ReactSelect value={form.paymentType} onChange={(e) => handleChange('paymentType', e?.target?.value || e)} options={paymentTypeOptions} disabled={loading} /></div>
    //            </div>
    //            <div className="form-row-2">
    //                <div className="field-group"><label>{form.paymentType === "SUPPLIER" ? "Supplier" : "Account"}</label><ReactSelect value={form.referenceID?.toString()} onChange={(e) => { handleChange('referenceID', e?.target?.value || e); handleChange('referenceName', referenceOptions.find(o => o.value === (e?.target?.value || e))?.label || ''); }} options={referenceOptions} placeholder={`Select ${form.paymentType.toLowerCase()}...`} isClearable disabled={loading} /></div>
    //                <div className="field-group"><label>Walking Party</label><input type="text" value={form.walkingParty} onChange={(e) => handleChange('walkingParty', e.target.value)} className="compact-input" placeholder="Walk-in party" disabled={loading} /></div>
    //            </div>
    //            <Input label="Reference No." value={form.paymentRefNumb} onChange={(e) => handleChange('paymentRefNumb', e.target.value)} placeholder="Supplier reference" disabled={loading} />
    //            {errors.party && <div className="error-message">{errors.party}</div>}

    //            <div className="items-section">
    //                <div className="items-header"><span>Payment Entries</span><Button size="sm" variant="outline" onClick={addEntry} icon={<FaPlus />}>Add Entry</Button></div>
    //                {errors.entries && <div className="error-message">{errors.entries}</div>}
    //                <div className="items-table-wrapper">
    //                    <table className="items-table">
    //                        <thead><tr><th>Mode</th><th>Bank</th><th>Cheque No.</th><th>Amount</th><th></th></tr></thead>
    //                        <tbody>
    //                            {entries.map((e, i) => (
    //                                <tr key={i}>
    //                                    <td><ReactSelect value={e.paymentMode} onChange={(val) => handleEntryChange(i, 'paymentMode', val?.target?.value || val)} options={paymentModeOptions} disabled={loading} /></td>
    //                                    <td>{(e.paymentMode === "BANK" || e.paymentMode === "CHEQUE") && <ReactSelect value={e.bankAccountID?.toString()} onChange={(val) => handleEntryChange(i, 'bankAccountID', val?.target?.value || val)} options={allBankOptions} placeholder="Bank" isClearable disabled={loading} />}</td>
    //                                    <td>{e.paymentMode === "CHEQUE" && <input type="text" value={e.chequeNo} onChange={(ev) => handleEntryChange(i, 'chequeNo', ev.target.value)} className="table-input" placeholder="Cheque #" disabled={loading} />}</td>
    //                                    <td><input type="number" value={e.amount} onChange={(ev) => handleEntryChange(i, 'amount', parseFloat(ev.target.value) || 0)} className="table-input" placeholder="0" disabled={loading} /></td>
    //                                    <td>{entries.length > 1 && <button className="remove-row-btn" onClick={() => removeEntry(i)}><FaTrash /></button>}</td>
    //                                </tr>
    //                            ))}
    //                        </tbody>
    //                    </table>
    //                </div>
    //                <div className="items-total">Total: <strong>{formatNumber(totalAmount)}</strong></div>
    //            </div>
    //            <Input label="Description" value={form.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Remarks..." disabled={loading} />
    //        </div>
    //    </Modal>
    //);
    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={<><FaMoneyBillWave /> {isEdit ? "Edit Payment" : "New Payment"}</>}
            size="xxl"
            footer={
                <div className="popup-footer">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} loading={loading}>Save Payment</Button>
                </div>
            }
        >
            <div className="pm-popup-container">
                {/* LINE 1: Date, Voucher, Payment Type, Supplier/Account, Reference No. */}
                <div className="form-row-5">
                    <div className="field-group">
                        <label>Date</label>
                        <input type="date" value={form.paymentDate} onChange={(e) => handleChange('paymentDate', e.target.value)} className="compact-input" disabled={loading} />
                        <small className="date-hint">{displayDate}</small>
                    </div>
                    <div className="field-group">
                        <label>Voucher No.</label>
                        <input type="text" value={voucherNumber || "Auto-generated"} readOnly className="compact-input readonly" disabled />
                    </div>
                    <div className="field-group">
                        <label>Payment Type</label>
                        <ReactSelect value={form.paymentType} onChange={(e) => handleChange('paymentType', e?.target?.value || e)} options={paymentTypeOptions} disabled={loading} />
                    </div>
                    <div className="field-group">
                        <label>{form.paymentType === "SUPPLIER" ? "Supplier" : "Account"}</label>
                        <ReactSelect
                            value={form.referenceID?.toString()}
                            onChange={(e) => {
                                handleChange('referenceID', e?.target?.value || e);
                                handleChange('referenceName', referenceOptions.find(o => o.value === (e?.target?.value || e))?.label || '');
                            }}
                            options={referenceOptions}
                            placeholder={`Select ${form.paymentType.toLowerCase()}...`}
                            isClearable
                            disabled={loading}
                        />
                    </div>
                    <div className="field-group">
                        <label>Reference No.</label>
                        <input type="text" value={form.paymentRefNumb} onChange={(e) => handleChange('paymentRefNumb', e.target.value)} className="compact-input" placeholder="Ref. number" disabled={loading} />
                    </div>
                </div>

                {/* LINE 2: Walking Party, Description */}
                <div className="form-row-2">
                    <div className="field-group">
                        <label>Walking Party</label>
                        <input type="text" value={form.walkingParty} onChange={(e) => handleChange('walkingParty', e.target.value)} className="compact-input" placeholder="Walk-in party" disabled={loading} />
                    </div>
                    <div className="field-group">
                        <label>Description</label>
                        <input type="text" value={form.description} onChange={(e) => handleChange('description', e.target.value)} className="compact-input" placeholder="Remarks..." disabled={loading} />
                    </div>
                </div>

                {errors.party && <div className="error-message">{errors.party}</div>}

                {/* Payment Entries Section */}
                <div className="items-section">
                    <div className="items-header">
                        <span>Payment Entries</span>
                        <Button size="sm" variant="outline" onClick={addEntry} icon={<FaPlus />}>Add Entry</Button>
                    </div>
                    {errors.entries && <div className="error-message">{errors.entries}</div>}
                    <div className="items-table-wrapper">
                        <table className="items-table">
                            <thead>
                                <tr>
                                    <th>Mode</th>
                                    <th>Bank</th>
                                    <th>Cheque No.</th>
                                    <th>Amount</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((e, i) => (
                                    <tr key={i}>
                                        <td>
                                            <ReactSelect
                                                value={e.paymentMode}
                                                onChange={(val) => handleEntryChange(i, 'paymentMode', val?.target?.value || val)}
                                                options={paymentModeOptions}
                                                disabled={loading}
                                            />
                                        </td>
                                        <td>
                                            {(e.paymentMode === "BANK" || e.paymentMode === "CHEQUE") && (
                                                <ReactSelect
                                                    value={e.bankAccountID?.toString()}
                                                    onChange={(val) => handleEntryChange(i, 'bankAccountID', val?.target?.value || val)}
                                                    options={allBankOptions}
                                                    placeholder="Bank"
                                                    isClearable
                                                    disabled={loading}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            {e.paymentMode === "CHEQUE" && (
                                                <input
                                                    type="text"
                                                    value={e.chequeNo}
                                                    onChange={(ev) => handleEntryChange(i, 'chequeNo', ev.target.value)}
                                                    className="table-input"
                                                    placeholder="Cheque #"
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