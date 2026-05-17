//import React, { useEffect, useState } from "react";
//import postdatedChequeApi from "../../api/postdatedChequeApi";
//import "./PostdatedCheque.css";

//const PostdatedChequePopup = ({ editId, onClose, onSaved }) => {
//    const [form, setForm] = useState({
//        chequeNumber: "",
//        bankName: "",
//        chequeDate: new Date().toISOString().split("T")[0],
//        amount: "",
//        sourceType: "CUSTOMER",
//        sourceId: "",
//        referenceType: "MANUAL",
//        remarks: ""
//    });

//    const [sources, setSources] = useState([]);
//    const [loading, setLoading] = useState(false);
//    const [loadingSources, setLoadingSources] = useState(false); // 🔥 ADD THIS LINE
//    const [error, setError] = useState("");

//    // Load sources based on type
//    useEffect(() => {
//        const loadSources = async () => {
//            if (!form.sourceType) return;

//            try {
//                setLoadingSources(true); // 🔥 Use loadingSources
//                setError("");

//                console.log(`Loading ${form.sourceType} accounts...`);
//                const res = await postdatedChequeApi.getAccountsByType(form.sourceType);
//                console.log("Accounts response:", res.data);

//                if (Array.isArray(res.data)) {
//                    setSources(res.data);
//                } else {
//                    setSources([]);
//                }

//            } catch (err) {
//                console.error("Failed to load sources:", err);
//                setError("Failed to load accounts");
//                setSources([]);
//            } finally {
//                setLoadingSources(false); // 🔥 Use loadingSources
//            }
//        };

//        loadSources();
//    }, [form.sourceType]);

//    // Load cheque for edit
//    useEffect(() => {
//        if (!editId) return;

//        const loadCheque = async () => {
//            try {
//                setLoading(true);
//                const res = await postdatedChequeApi.getById(editId);
//                const data = res.data;

//                setForm({
//                    chequeNumber: data.chequeNumber || "",
//                    bankName: data.bankName || "",
//                    chequeDate: data.chequeDate ? data.chequeDate.split("T")[0] : new Date().toISOString().split("T")[0],
//                    amount: data.amount || "",
//                    sourceType: data.sourceType || "CUSTOMER",
//                    sourceId: data.sourceId || "",
//                    referenceType: data.referenceType || "MANUAL",
//                    remarks: ""
//                });
//            } catch (err) {
//                console.error("Load error:", err);
//                setError("Failed to load cheque");
//            } finally {
//                setLoading(false);
//            }
//        };
//        loadCheque();
//    }, [editId]);

//    //const handleSubmit = async (e) => {
//    //    e.preventDefault();

//    //    // Validation
//    //    if (!form.chequeNumber.trim()) {
//    //        setError("Cheque number is required");
//    //        return;
//    //    }
//    //    if (!form.bankName.trim()) {
//    //        setError("Bank name is required");
//    //        return;
//    //    }
//    //    if (!form.chequeDate) {
//    //        setError("Cheque date is required");
//    //        return;
//    //    }
//    //    if (!form.amount || parseFloat(form.amount) <= 0) {
//    //        setError("Valid amount is required");
//    //        return;
//    //    }
//    //    if (!form.sourceId) {
//    //        setError("Please select source");
//    //        return;
//    //    }

//    //    const payload = {
//    //        ...form,
//    //        amount: parseFloat(form.amount)
//    //    };

//    //    try {
//    //        setLoading(true);
//    //        setError("");

//    //        if (editId) {
//    //            await postdatedChequeApi.updateStatus(editId, {
//    //                status: "PENDING",
//    //                remarks: form.remarks
//    //            });
//    //        } else {
//    //            await postdatedChequeApi.create(payload);
//    //        }

//    //        if (onSaved) onSaved();
//    //        onClose();
//    //    } catch (err) {
//    //        console.error("Save error:", err);
//    //        setError(err.response?.data?.error || "Failed to save cheque");
//    //    } finally {
//    //        setLoading(false);
//    //    }
//    //};
//    // PostdatedChequePopup.jsx mein handleSubmit update karo

//    const handleSubmit = async (e) => {
//        e.preventDefault();

//        // Validation
//        if (!form.chequeNumber.trim()) {
//            setError("Cheque number is required");
//            return;
//        }
//        if (!form.bankName.trim()) {
//            setError("Bank name is required");
//            return;
//        }
//        if (!form.chequeDate) {
//            setError("Cheque date is required");
//            return;
//        }
//        if (!form.amount || parseFloat(form.amount) <= 0) {
//            setError("Valid amount is required");
//            return;
//        }
//        if (!form.sourceId) {
//            setError("Please select source");
//            return;
//        }

//        const payload = {
//            ...form,
//            amount: parseFloat(form.amount)
//        };

//        try {
//            setLoading(true);
//            setError("");

//            if (editId) {
//                // 🔥 UPDATE existing cheque
//                await postdatedChequeApi.update(editId, payload);  // Update API call
//            } else {
//                // CREATE new cheque
//                await postdatedChequeApi.create(payload);
//            }

//            if (onSaved) onSaved();
//            onClose();
//        } catch (err) {
//            console.error("Save error:", err);
//            setError(err.response?.data?.error || "Failed to save cheque");
//        } finally {
//            setLoading(false);
//        }
//    };
//    return (
//        <div className="popup-overlay">
//            <div className="popup-container">
//                <h2>{editId ? "Edit Cheque" : "New Postdated Cheque"}</h2>

//                {error && <div className="error-box">{error}</div>}

//                <form onSubmit={handleSubmit}>
//                    <div className="form-row">
//                        <div className="form-group">
//                            <label>Cheque Number *</label>
//                            <input
//                                type="text"
//                                value={form.chequeNumber}
//                                onChange={(e) => setForm({ ...form, chequeNumber: e.target.value })}
//                                disabled={loading || loadingSources}
//                                required
//                            />
//                        </div>

//                        <div className="form-group">
//                            <label>Bank Name *</label>
//                            <input
//                                type="text"
//                                value={form.bankName}
//                                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
//                                disabled={loading || loadingSources}
//                                required
//                            />
//                        </div>
//                    </div>

//                    <div className="form-row">
//                        <div className="form-group">
//                            <label>Cheque Date *</label>
//                            <input
//                                type="date"
//                                value={form.chequeDate}
//                                onChange={(e) => setForm({ ...form, chequeDate: e.target.value })}
//                                disabled={loading || loadingSources}
//                                min={new Date().toISOString().split("T")[0]}
//                                required
//                            />
//                        </div>

//                        <div className="form-group">
//                            <label>Amount *</label>
//                            <input
//                                type="number"
//                                step="0.01"
//                                min="0.01"
//                                value={form.amount}
//                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
//                                disabled={loading || loadingSources}
//                                required
//                            />
//                        </div>
//                    </div>

//                    <div className="form-row">
//                        <div className="form-group">
//                            <label>Source Type *</label>
//                            <select
//                                value={form.sourceType}
//                                onChange={(e) => setForm({ ...form, sourceType: e.target.value, sourceId: "" })}
//                                disabled={loading || loadingSources}
//                            >
//                                <option value="CUSTOMER">Customer</option>
//                                <option value="SUPPLIER">Supplier</option>
//                                <option value="BANK">Bank</option>
//                            </select>
//                        </div>

//                        <div className="form-group">
//                            <label>Source *</label>
//                            <select
//                                value={form.sourceId}
//                                onChange={(e) => setForm({ ...form, sourceId: parseInt(e.target.value) })}
//                                disabled={loading || loadingSources || sources.length === 0}
//                                required
//                            >
//                                <option value="">-- Select {form.sourceType} --</option>
//                                {sources.map(s => (
//                                    <option key={s.acctID} value={s.acctID}>
//                                        {s.AcctName} {s.AcctCode ? `(${s.AcctCode})` : ''}
//                                    </option>
//                                ))}
//                            </select>
//                            {loadingSources && (
//                                <div className="loading-text">Loading accounts...</div>
//                            )}
//                            {!loadingSources && sources.length === 0 && form.sourceType && (
//                                <div className="info-text">No accounts found</div>
//                            )}
//                        </div>
//                    </div>

//                    <div className="form-group">
//                        <label>Reference Type</label>
//                        <select
//                            value={form.referenceType}
//                            onChange={(e) => setForm({ ...form, referenceType: e.target.value })}
//                            disabled={loading || loadingSources}
//                        >
//                            <option value="MANUAL">Manual Entry</option>
//                            <option value="RECEIVING">From Receiving</option>
//                            <option value="PAYMENT">From Payment</option>
//                        </select>
//                    </div>

//                    <div className="form-group">
//                        <label>Remarks</label>
//                        <textarea
//                            value={form.remarks}
//                            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
//                            rows="3"
//                            disabled={loading || loadingSources}
//                        />
//                    </div>

//                    <div className="button-group">
//                        <button type="submit" disabled={loading || loadingSources} className="btn-save">
//                            {loading ? "Saving..." : (editId ? "Update" : "Save")}
//                        </button>
//                        <button type="button" onClick={onClose} className="btn-cancel">
//                            Cancel
//                        </button>
//                    </div>
//                </form>
//            </div>
//        </div>
//    );
//};

//export default PostdatedChequePopup;

import React, { useEffect, useState } from "react";
import postdatedChequeApi from "../../api/postdatedChequeApi";
import "./PostdatedCheque.css";

const PostdatedChequePopup = ({ editId, onClose, onSaved }) => {
    const [form, setForm] = useState({
        chequeNumber: "",
        bankName: "",
        chequeDate: new Date().toISOString().split("T")[0],
        amount: "",
        sourceType: "CUSTOMER",
        sourceId: "",
        referenceType: "MANUAL",
        remarks: ""
    });

    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingSources, setLoadingSources] = useState(false);
    const [error, setError] = useState("");

    // Load sources based on type
    useEffect(() => {
        const loadSources = async () => {
            if (!form.sourceType) return;

            try {
                setLoadingSources(true);
                setError("");

                console.log(`Loading ${form.sourceType} accounts...`);
                const res = await postdatedChequeApi.getAccountsByType(form.sourceType);
                console.log("Accounts response:", res);

                // ✅ Handle wrapped response
                let accountsData = [];
                if (res.data && res.data.data && Array.isArray(res.data.data)) {
                    accountsData = res.data.data;
                } else if (Array.isArray(res.data)) {
                    accountsData = res.data;
                }

                setSources(accountsData);

            } catch (err) {
                console.error("Failed to load sources:", err);
                setError("Failed to load accounts");
                setSources([]);
            } finally {
                setLoadingSources(false);
            }
        };

        loadSources();
    }, [form.sourceType]);

    // Load cheque for edit
    useEffect(() => {
        if (!editId) return;

        const loadCheque = async () => {
            try {
                setLoading(true);
                const res = await postdatedChequeApi.getById(editId);
                console.log("Edit cheque response:", res);

                // ✅ Handle wrapped response
                let data = res.data;
                if (data && data.data) {
                    data = data.data;
                }

                setForm({
                    chequeNumber: data.chequeNumber || "",
                    bankName: data.bankName || "",
                    chequeDate: data.chequeDate ? data.chequeDate.split("T")[0] : new Date().toISOString().split("T")[0],
                    amount: data.amount || "",
                    sourceType: data.sourceType || "CUSTOMER",
                    sourceId: data.sourceId || "",
                    referenceType: data.referenceType || "MANUAL",
                    remarks: data.remarks || ""
                });
            } catch (err) {
                console.error("Load error:", err);
                setError("Failed to load cheque");
            } finally {
                setLoading(false);
            }
        };
        loadCheque();
    }, [editId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!form.chequeNumber.trim()) {
            setError("Cheque number is required");
            return;
        }
        if (!form.bankName.trim()) {
            setError("Bank name is required");
            return;
        }
        if (!form.chequeDate) {
            setError("Cheque date is required");
            return;
        }
        if (!form.amount || parseFloat(form.amount) <= 0) {
            setError("Valid amount is required");
            return;
        }
        if (!form.sourceId) {
            setError("Please select source");
            return;
        }

        const payload = {
            ...form,
            amount: parseFloat(form.amount)
        };

        try {
            setLoading(true);
            setError("");

            if (editId) {
                await postdatedChequeApi.update(editId, payload);
            } else {
                await postdatedChequeApi.create(payload);
            }

            if (onSaved) onSaved();
            onClose();
        } catch (err) {
            console.error("Save error:", err);
            setError(err.response?.data?.error || "Failed to save cheque");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-container">
                <h2>{editId ? "Edit Cheque" : "New Postdated Cheque"}</h2>

                {error && <div className="error-box">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Cheque Number *</label>
                            <input
                                type="text"
                                value={form.chequeNumber}
                                onChange={(e) => setForm({ ...form, chequeNumber: e.target.value })}
                                disabled={loading || loadingSources}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Bank Name *</label>
                            <input
                                type="text"
                                value={form.bankName}
                                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                                disabled={loading || loadingSources}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Cheque Date *</label>
                            <input
                                type="date"
                                value={form.chequeDate}
                                onChange={(e) => setForm({ ...form, chequeDate: e.target.value })}
                                disabled={loading || loadingSources}
                                min={new Date().toISOString().split("T")[0]}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Amount *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                disabled={loading || loadingSources}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Source Type *</label>
                            <select
                                value={form.sourceType}
                                onChange={(e) => setForm({ ...form, sourceType: e.target.value, sourceId: "" })}
                                disabled={loading || loadingSources}
                            >
                                <option value="CUSTOMER">Customer</option>
                                <option value="SUPPLIER">Supplier</option>
                                <option value="BANK">Bank</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Source *</label>
                            <select
                                value={form.sourceId}
                                onChange={(e) => setForm({ ...form, sourceId: parseInt(e.target.value) })}
                                disabled={loading || loadingSources || sources.length === 0}
                                required
                            >
                                <option value="">-- Select {form.sourceType} --</option>
                                {sources.map(s => (
                                    <option key={s.acctID} value={s.acctID}>
                                        {s.acctName} {s.acctCode ? `(${s.acctCode})` : ''}
                                    </option>
                                ))}
                            </select>
                            {loadingSources && (
                                <div className="loading-text">Loading accounts...</div>
                            )}
                            {!loadingSources && sources.length === 0 && form.sourceType && (
                                <div className="info-text">No accounts found</div>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Reference Type</label>
                        <select
                            value={form.referenceType}
                            onChange={(e) => setForm({ ...form, referenceType: e.target.value })}
                            disabled={loading || loadingSources}
                        >
                            <option value="MANUAL">Manual Entry</option>
                            <option value="RECEIVING">From Receiving</option>
                            <option value="PAYMENT">From Payment</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Remarks</label>
                        <textarea
                            value={form.remarks}
                            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                            rows="3"
                            disabled={loading || loadingSources}
                        />
                    </div>

                    <div className="button-group">
                        <button type="submit" disabled={loading || loadingSources} className="btn-save">
                            {loading ? "Saving..." : (editId ? "Update" : "Save")}
                        </button>
                        <button type="button" onClick={onClose} className="btn-cancel">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostdatedChequePopup;