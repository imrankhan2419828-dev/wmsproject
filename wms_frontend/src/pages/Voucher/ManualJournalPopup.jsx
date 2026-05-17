import React, { useState, useEffect } from "react";
import voucherApi from "../../api/voucherApi";
import { Modal } from "../../components/common/Modal/Modal";
import { Input, Button, ReactSelect, useDialog } from "../../components/common";
import { FaPlus, FaTrash, FaMagic } from "react-icons/fa";
import "./ManualJournalPopup.css";

export default function ManualJournalPopup({ voucherTypes, onClose, onSaved }) {
    const [form, setForm] = useState({
        tranDate: new Date().toISOString().split('T')[0],
        vochType: "JV",
        tranDesc: "",
        details: [
            { acctID: "", amount: "", tranNatr: "DR", remarks: "" },
            { acctID: "", amount: "", tranNatr: "CR", remarks: "" }
        ]
    });
    const [accountOptions, setAccountOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { showSuccess, showError } = useDialog();

    useEffect(() => {
        const loadAccounts = async () => {
            try {
                const res = await voucherApi.getAccounts();
                let data = res.data?.data || res.data || [];
                if (Array.isArray(data)) {
                    const uniqueAccounts = data.filter((acc, index, self) =>
                        index === self.findIndex((a) => a.value === acc.value)
                    );
                    setAccountOptions(uniqueAccounts.map(acc => ({
                        value: acc.value?.toString(),
                        label: `${acc.code || ''} - ${acc.name || ''}`
                    })));
                }
            } catch (err) {
                console.error("Failed to load accounts:", err);
            }
        };
        loadAccounts();
    }, []);

    const handleChange = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    // ✅ AUTO-BALANCE LOGIC
    const handleDetailChange = (index, field, value) => {
        const newDetails = [...form.details];
        newDetails[index][field] = value;

        // ✅ If changing tranNatr (DR/CR), auto-update the paired row
        if (field === 'tranNatr') {
            const pairedIndex = index === 0 ? 1 : index === 1 ? 0 : -1;
            if (pairedIndex >= 0 && newDetails[pairedIndex]) {
                // Flip the type for paired row
                newDetails[pairedIndex].tranNatr = value === "DR" ? "CR" : "DR";

                // Copy amount if exists
                if (newDetails[index].amount) {
                    newDetails[pairedIndex].amount = newDetails[index].amount;
                }
            }
        }

        // ✅ If changing amount, auto-fill paired row's amount
        if (field === 'amount' && value) {
            // Only auto-fill for rows 0 and 1 (primary pair)
            if (index === 0 || index === 1) {
                const pairedIndex = index === 0 ? 1 : 0;
                if (newDetails[pairedIndex]) {
                    newDetails[pairedIndex].amount = value;
                }
            }
        }

        setForm({ ...form, details: newDetails });
        if (errors[`${field}_${index}`]) setErrors(prev => ({ ...prev, [`${field}_${index}`]: '' }));
    };

    // ✅ ADD ROW - Auto balance with new pair
    const addRow = () => {
        const newDetails = [...form.details];

        // Add DR row
        newDetails.push({ acctID: "", amount: "", tranNatr: "DR", remarks: "" });
        // Add CR row (auto-balanced pair)
        newDetails.push({ acctID: "", amount: "", tranNatr: "CR", remarks: "" });

        setForm({ ...form, details: newDetails });
    };

    // ✅ REMOVE ROW - Remove pair
    const removeRow = (index) => {
        if (form.details.length <= 2) {
            showError("Minimum 2 entries required (1 DR + 1 CR)");
            return;
        }

        const newDetails = [...form.details];

        // Determine paired index
        let pairedIndex;
        if (index % 2 === 0) {
            pairedIndex = index + 1; // Even index, pair is next
        } else {
            pairedIndex = index - 1; // Odd index, pair is previous
        }

        // Remove both (higher index first to avoid shift issues)
        const removeIndices = [index, pairedIndex].sort((a, b) => b - a);
        removeIndices.forEach(i => newDetails.splice(i, 1));

        setForm({ ...form, details: newDetails });
    };

    // ✅ Auto-balance all pairs
    const autoBalanceAll = () => {
        const newDetails = [...form.details];
        let changed = false;

        // Loop through pairs
        for (let i = 0; i < newDetails.length; i += 2) {
            if (i + 1 < newDetails.length) {
                const drRow = newDetails[i];
                const crRow = newDetails[i + 1];

                // Ensure types are correct
                if (drRow.tranNatr !== "DR") drRow.tranNatr = "DR";
                if (crRow.tranNatr !== "CR") crRow.tranNatr = "CR";

                // Balance amounts - if one has amount, copy to other
                if (drRow.amount && !crRow.amount) {
                    crRow.amount = drRow.amount;
                    changed = true;
                } else if (!drRow.amount && crRow.amount) {
                    drRow.amount = crRow.amount;
                    changed = true;
                }
            }
        }

        if (changed) {
            setForm({ ...form, details: newDetails });
            showSuccess("Entries balanced!");
        } else {
            showSuccess("All entries already balanced!");
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.tranDesc?.trim()) {
            newErrors.tranDesc = "Description required";
        }

        let totalDebit = 0, totalCredit = 0;

        form.details.forEach((d, i) => {
            // ✅ Account is REQUIRED
            if (!d.acctID) {
                newErrors[`acct_${i}`] = "Account is required";
            }

            // ✅ Amount is REQUIRED
            if (!d.amount || parseFloat(d.amount) <= 0) {
                newErrors[`amount_${i}`] = "Valid amount required";
            }

            if (d.tranNatr === "DR") {
                totalDebit += parseFloat(d.amount) || 0;
            } else {
                totalCredit += parseFloat(d.amount) || 0;
            }
        });

        // ✅ Check debit = credit
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            newErrors.balance = `Debit (${totalDebit.toFixed(2)}) must equal Credit (${totalCredit.toFixed(2)})`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            await voucherApi.createManualJournal({
                tranDate: form.tranDate,
                vochType: form.vochType,
                tranDesc: form.tranDesc,
                details: form.details.map(d => ({
                    acctID: parseInt(d.acctID),
                    tranNatr: d.tranNatr,
                    amount: parseFloat(d.amount),
                    remarks: d.remarks
                }))
            });
            showSuccess("Journal voucher created!");
            onSaved();
            onClose();
        } catch (err) {
            showError(err.response?.data?.message || "Save failed");
        } finally {
            setLoading(false);
        }
    };

    const totalDebit = form.details.filter(d => d.tranNatr === "DR").reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);
    const totalCredit = form.details.filter(d => d.tranNatr === "CR").reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Manual Journal Voucher"
            size="xl"
            footer={
                <div className="popup-footer">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button variant="secondary" onClick={autoBalanceAll} disabled={loading} icon={<FaMagic />}>
                        Auto Balance
                    </Button>
                    <Button variant="primary" onClick={handleSave} loading={loading}>Create</Button>
                </div>
            }
        >
            <div className="journal-popup-container">
                <div className="form-row-3">
                    <Input
                        label="Date"
                        type="date"
                        value={form.tranDate}
                        onChange={(e) => handleChange('tranDate', e.target.value)}
                        disabled={loading}
                    />
                    <div className="field-group">
                        <label>Voucher Type</label>
                        <select
                            value={form.vochType}
                            onChange={(e) => handleChange('vochType', e.target.value)}
                            className="compact-select"
                            disabled={loading}
                        >
                            <option value="JV">Journal Voucher (JV)</option>
                            {voucherTypes?.filter(vt => vt.vochType !== "JV").map(vt => (
                                <option key={vt.vochType} value={vt.vochType}>
                                    {vt.vochName || vt.vochType}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Input
                        label="Description"
                        value={form.tranDesc}
                        onChange={(e) => handleChange('tranDesc', e.target.value)}
                        error={errors.tranDesc}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="items-section">
                    <div className="items-header">
                        <span>Accounting Entries (Auto-Balanced Pairs)</span>
                        <Button size="sm" variant="outline" onClick={addRow} icon={<FaPlus />}>
                            Add Pair
                        </Button>
                    </div>

                    {errors.balance && <div className="error-message">⚠ {errors.balance}</div>}

                    {/* ✅ Pair indicator */}
                    <div className="pair-info">
                        <small>
                            💡 Each pair has 1 Debit + 1 Credit. Amount auto-syncs within each pair.
                            Total DR must equal Total CR.
                        </small>
                    </div>

                    <div className="items-table-wrapper">
                        <table className="items-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40%' }}>Account *</th>
                                    <th style={{ width: '10%' }}>Type</th>
                                    <th style={{ width: '15%' }}>Amount *</th>
                                    <th style={{ width: '25%' }}>Remarks</th>
                                    <th style={{ width: '10%' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {form.details.map((d, i) => {
                                    const isPairStart = i % 2 === 0;
                                    return (
                                        <React.Fragment key={`detail-row-${i}`}>
                                            {/* Pair separator */}
                                            {isPairStart && i > 0 && (
                                                <tr key={`pair-sep-${i}`} className="pair-separator">
                                                    <td colSpan="5">
                                                        <div className="pair-divider">
                                                            <span>Pair {Math.floor(i / 2) + 1}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            <tr className={isPairStart ? 'pair-start' : 'pair-end'}>
                                                <td>
                                                    <ReactSelect
                                                        key={`account-select-${i}`}
                                                        value={d.acctID}
                                                        onChange={(e) => handleDetailChange(i, 'acctID', e?.target?.value || e)}
                                                        options={accountOptions}
                                                        placeholder="Select account *"
                                                        disabled={loading}
                                                    />
                                                    {errors[`acct_${i}`] && <small className="error-text">{errors[`acct_${i}`]}</small>}
                                                </td>
                                                <td>
                                                    <span className={`type-badge ${d.tranNatr === 'DR' ? 'type-dr' : 'type-cr'}`}>
                                                        {d.tranNatr}
                                                    </span>
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        value={d.amount}
                                                        onChange={(e) => handleDetailChange(i, 'amount', e.target.value)}
                                                        className={`table-input ${errors[`amount_${i}`] ? 'error' : ''}`}
                                                        placeholder="0.00"
                                                        step="0.01"
                                                        disabled={loading}
                                                    />
                                                    {errors[`amount_${i}`] && <small className="error-text">{errors[`amount_${i}`]}</small>}
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={d.remarks}
                                                        onChange={(e) => handleDetailChange(i, 'remarks', e.target.value)}
                                                        className="table-input"
                                                        placeholder="Remarks"
                                                        disabled={loading}
                                                    />
                                                </td>
                                                <td>
                                                    <button
                                                        className="remove-row-btn"
                                                        onClick={() => removeRow(i)}
                                                        disabled={form.details.length <= 2}
                                                        type="button"
                                                        title="Remove this pair"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="items-total">
                        <span className="total-dr">Total Debit: <strong>{totalDebit.toFixed(2)}</strong></span>
                        <span className="total-cr">Total Credit: <strong>{totalCredit.toFixed(2)}</strong></span>
                        {Math.abs(totalDebit - totalCredit) > 0.01 && (
                            <span className="total-diff">Difference: <strong>{(totalDebit - totalCredit).toFixed(2)}</strong></span>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}