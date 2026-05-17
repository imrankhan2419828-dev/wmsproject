////export default PostdatedChequePage;

//import React, { useEffect, useState } from "react";
//import postdatedChequeApi from "../../api/postdatedChequeApi";
//import PostdatedChequePopup from "./PostdatedChequePopup";
//import "./PostdatedCheque.css";

//const PostdatedChequePage = () => {
//    const [cheques, setCheques] = useState([]);
//    const [summary, setSummary] = useState(null);
//    const [showPopup, setShowPopup] = useState(false);
//    const [editId, setEditId] = useState(null); // 🔥 Edit ID ke liye
//    const [loading, setLoading] = useState(false);
//    const [error, setError] = useState("");
//    const [statusFilter, setStatusFilter] = useState("");
//    const [dateRange, setDateRange] = useState({ from: "", to: "" });

//    const statusOptions = [
//        { value: "", label: "All Status" },
//        { value: "PENDING", label: "Pending" },
//        { value: "DEPOSITED", label: "Deposited" },
//        { value: "CLEARED", label: "Cleared" },
//        { value: "BOUNCED", label: "Bounced" },
//        { value: "CANCELLED", label: "Cancelled" }
//    ];

//    const fetchCheques = async () => {
//        try {
//            setLoading(true);
//            const res = await postdatedChequeApi.getAll(statusFilter);
//            setCheques(res.data || []);
//        } catch (err) {
//            console.error("Fetch error:", err);
//            setError("Failed to load cheques");
//        } finally {
//            setLoading(false);
//        }
//    };

//    const fetchSummary = async () => {
//        try {
//            const res = await postdatedChequeApi.getSummary();
//            setSummary(res.data);
//        } catch (err) {
//            console.error("Summary error:", err);
//        }
//    };

//    useEffect(() => {
//        fetchCheques();
//        fetchSummary();
//    }, [statusFilter]);

//    const handleProcessDue = async () => {
//        if (!window.confirm("Process all due cheques?")) return;
//        try {
//            setLoading(true);
//            const res = await postdatedChequeApi.processDue();
//            alert(res.data.message);
//            fetchCheques();
//            fetchSummary();
//        } catch (err) {
//            setError("Failed to process due cheques");
//        } finally {
//            setLoading(false);
//        }
//    };

//    const handleSearchByDate = async () => {
//        if (!dateRange.from || !dateRange.to) {
//            setError("Please select both dates");
//            return;
//        }
//        try {
//            setLoading(true);
//            const res = await postdatedChequeApi.getByDateRange(dateRange.from, dateRange.to);
//            setCheques(res.data);
//        } catch (err) {
//            setError("Failed to search by date");
//        } finally {
//            setLoading(false);
//        }
//    };

//    // 🔥 Edit handler
//    const handleEdit = (id) => {
//        setEditId(id);
//        setShowPopup(true);
//    };

//    // 🔥 Add handler
//    const handleAdd = () => {
//        setEditId(null);
//        setShowPopup(true);
//    };

//    const handleStatusUpdate = async (id, newStatus) => {
//        try {
//            await postdatedChequeApi.updateStatus(id, { status: newStatus });
//            fetchCheques();
//            fetchSummary();
//        } catch (err) {
//            setError("Failed to update status");
//        }
//    };

//    const handleDelete = async (id) => {
//        if (!window.confirm("Delete this cheque?")) return;
//        try {
//            await postdatedChequeApi.delete(id);
//            fetchCheques();
//            fetchSummary();
//        } catch (err) {
//            setError("Failed to delete");
//        }
//    };

//    const getStatusBadge = (status) => {
//        const colors = {
//            PENDING: '#ffc107',
//            DEPOSITED: '#17a2b8',
//            CLEARED: '#28a745',
//            BOUNCED: '#dc3545',
//            CANCELLED: '#6c757d'
//        };
//        return { backgroundColor: colors[status] || '#6c757d', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '12px' };
//    };

//    return (
//        <div className="cheque-page">
//            {/* Header */}
//            <div className="page-header">
//                <h2>Postdated Cheques</h2>
//                <div>
//                    <button onClick={handleProcessDue} className="btn-warning">
//                        Process Due Cheques
//                    </button>
//                    <button onClick={handleAdd} className="btn-primary">  {/* 🔥 handleAdd call */}
//                        + Add Cheque
//                    </button>
//                </div>
//            </div>

//            {/* Summary Cards */}
//            {summary && (
//                <div className="summary-cards">
//                    <div className="card">
//                        <h3>Pending</h3>
//                        <p className="amount">Rs. {summary.totalPendingAmount?.toFixed(2)}</p>
//                        <p className="count">{summary.totalPending} cheques</p>
//                    </div>
//                    <div className="card warning">
//                        <h3>Due Today</h3>
//                        <p className="amount">Rs. {summary.totalDueTodayAmount?.toFixed(2)}</p>
//                        <p className="count">{summary.totalDueToday} cheques</p>
//                    </div>
//                    <div className="card success">
//                        <h3>Cleared</h3>
//                        <p className="amount">Rs. {summary.totalClearedAmount?.toFixed(2)}</p>
//                        <p className="count">{summary.totalCleared} cheques</p>
//                    </div>
//                    <div className="card danger">
//                        <h3>Bounced</h3>
//                        <p className="amount">Rs. {summary.totalBouncedAmount?.toFixed(2)}</p>
//                        <p className="count">{summary.totalBounced} cheques</p>
//                    </div>
//                </div>
//            )}

//            {/* Filters */}
//            <div className="filters">
//                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
//                    {statusOptions.map(opt => (
//                        <option key={opt.value} value={opt.value}>{opt.label}</option>
//                    ))}
//                </select>

//                <div className="date-range">
//                    <input
//                        type="date"
//                        value={dateRange.from}
//                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
//                    />
//                    <span>to</span>
//                    <input
//                        type="date"
//                        value={dateRange.to}
//                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
//                    />
//                    <button onClick={handleSearchByDate}>Search</button>
//                </div>
//            </div>

//            {error && <div className="error-box">{error}</div>}
//            {loading && <div className="loading">Loading...</div>}

//            {/* Cheques Table */}
//            <div className="table-container">
//                <table className="cheque-table">
//                    <thead>
//                        <tr>
//                            <th>Cheque #</th>
//                            <th>Bank</th>
//                            <th>Date</th>
//                            <th>Days Left</th>
//                            <th>Amount</th>
//                            <th>Source</th>
//                            <th>Status</th>
//                            <th>Actions</th>
//                        </tr>
//                    </thead>
//                    <tbody>
//                        {cheques.map(c => (
//                            <tr key={c.id}>
//                                <td>{c.chequeNumber}</td>
//                                <td>{c.bankName}</td>
//                                <td>{new Date(c.chequeDate).toLocaleDateString()}</td>
//                                <td className={c.daysRemaining <= 0 ? 'due' : ''}>
//                                    {c.daysRemaining > 0 ? `${c.daysRemaining} days` : 'Due'}
//                                </td>
//                                <td className="amount">Rs. {c.amount?.toFixed(2)}</td>
//                                <td>{c.sourceName}</td>
//                                <td>
//                                    <span style={getStatusBadge(c.status)}>{c.status}</span>
//                                </td>
//                                <td className="actions">
//                                    <select
//                                        onChange={(e) => handleStatusUpdate(c.id, e.target.value)}
//                                        value=""
//                                        className="status-select"
//                                    >
//                                        <option value="">Change Status</option>
//                                        <option value="DEPOSITED">Deposit</option>
//                                        <option value="CLEARED">Clear</option>
//                                        <option value="BOUNCED">Bounce</option>
//                                        <option value="CANCELLED">Cancel</option>
//                                    </select>
//                                    {/* 🔥 Edit Button */}
//                                    <button onClick={() => handleEdit(c.id)} className="btn-edit">
//                                        Edit
//                                    </button>
//                                    <button onClick={() => handleDelete(c.id)} className="btn-delete">
//                                        Delete
//                                    </button>
//                                </td>
//                            </tr>
//                        ))}
//                        {cheques.length === 0 && !loading && (
//                            <tr>
//                                <td colSpan="8" className="no-records">No cheques found</td>
//                            </tr>
//                        )}
//                    </tbody>
//                </table>
//            </div>

//            {/* Popup */}
//            {showPopup && (
//                <PostdatedChequePopup
//                    editId={editId}  // 🔥 editId pass karo
//                    onClose={() => setShowPopup(false)}
//                    onSaved={() => {
//                        setShowPopup(false);
//                        fetchCheques();
//                        fetchSummary();
//                    }}
//                />
//            )}
//        </div>
//    );
//};

//export default PostdatedChequePage;

//export default PostdatedChequePage;

import React, { useEffect, useState } from "react";
import postdatedChequeApi from "../../api/postdatedChequeApi";
import PostdatedChequePopup from "./PostdatedChequePopup";
import "./PostdatedCheque.css";

const PostdatedChequePage = () => {
    const [cheques, setCheques] = useState([]);
    const [summary, setSummary] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateRange, setDateRange] = useState({ from: "", to: "" });

    const statusOptions = [
        { value: "", label: "All Status" },
        { value: "PENDING", label: "Pending" },
        { value: "DEPOSITED", label: "Deposited" },
        { value: "CLEARED", label: "Cleared" },
        { value: "BOUNCED", label: "Bounced" },
        { value: "CANCELLED", label: "Cancelled" }
    ];

    const fetchCheques = async () => {
        try {
            setLoading(true);
            const res = await postdatedChequeApi.getAll(statusFilter);
            console.log("Cheques response:", res);

            // ✅ Handle wrapped response
            let chequesData = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                chequesData = res.data.data;
            } else if (Array.isArray(res.data)) {
                chequesData = res.data;
            } else {
                chequesData = [];
            }

            setCheques(chequesData);
            setError("");
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to load cheques");
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const res = await postdatedChequeApi.getSummary();
            console.log("Summary response:", res);

            // ✅ Handle wrapped response
            let summaryData = null;
            if (res.data && res.data.data) {
                summaryData = res.data.data;
            } else if (res.data) {
                summaryData = res.data;
            }

            setSummary(summaryData);
        } catch (err) {
            console.error("Summary error:", err);
        }
    };

    useEffect(() => {
        fetchCheques();
        fetchSummary();
    }, [statusFilter]);

    const handleProcessDue = async () => {
        if (!window.confirm("Process all due cheques?")) return;
        try {
            setLoading(true);
            const res = await postdatedChequeApi.processDue();
            alert(res.data.message || "Due cheques processed");
            fetchCheques();
            fetchSummary();
        } catch (err) {
            setError("Failed to process due cheques");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchByDate = async () => {
        if (!dateRange.from || !dateRange.to) {
            setError("Please select both dates");
            return;
        }
        try {
            setLoading(true);
            const res = await postdatedChequeApi.getByDateRange(dateRange.from, dateRange.to);

            // ✅ Handle wrapped response
            let data = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                data = res.data.data;
            } else if (Array.isArray(res.data)) {
                data = res.data;
            }

            setCheques(data);
        } catch (err) {
            setError("Failed to search by date");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id) => {
        setEditId(id);
        setShowPopup(true);
    };

    const handleAdd = () => {
        setEditId(null);
        setShowPopup(true);
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await postdatedChequeApi.updateStatus(id, { status: newStatus });
            fetchCheques();
            fetchSummary();
        } catch (err) {
            setError("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this cheque?")) return;
        try {
            await postdatedChequeApi.delete(id);
            fetchCheques();
            fetchSummary();
        } catch (err) {
            setError("Failed to delete");
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            PENDING: '#ffc107',
            DEPOSITED: '#17a2b8',
            CLEARED: '#28a745',
            BOUNCED: '#dc3545',
            CANCELLED: '#6c757d'
        };
        return {
            backgroundColor: colors[status] || '#6c757d',
            color: 'white',
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '12px'
        };
    };

    return (
        <div className="cheque-page">
            {/* Header */}
            <div className="page-header">
                <h2>Postdated Cheques</h2>
                <div>
                    <button onClick={handleProcessDue} className="btn-warning">
                        Process Due Cheques
                    </button>
                    <button onClick={handleAdd} className="btn-primary">
                        + Add Cheque
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="summary-cards">
                    <div className="card">
                        <h3>Pending</h3>
                        <p className="amount">Rs. {summary.totalPendingAmount?.toFixed(2)}</p>
                        <p className="count">{summary.totalPending || 0} cheques</p>
                    </div>
                    <div className="card warning">
                        <h3>Due Today</h3>
                        <p className="amount">Rs. {summary.totalDueTodayAmount?.toFixed(2)}</p>
                        <p className="count">{summary.totalDueToday || 0} cheques</p>
                    </div>
                    <div className="card success">
                        <h3>Cleared</h3>
                        <p className="amount">Rs. {summary.totalClearedAmount?.toFixed(2)}</p>
                        <p className="count">{summary.totalCleared || 0} cheques</p>
                    </div>
                    <div className="card danger">
                        <h3>Bounced</h3>
                        <p className="amount">Rs. {summary.totalBouncedAmount?.toFixed(2)}</p>
                        <p className="count">{summary.totalBounced || 0} cheques</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filters">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

                <div className="date-range">
                    <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    />
                    <span>to</span>
                    <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    />
                    <button onClick={handleSearchByDate}>Search</button>
                </div>
            </div>

            {error && <div className="error-box">{error}</div>}
            {loading && <div className="loading">Loading...</div>}

            {/* Cheques Table */}
            <div className="table-container">
                <table className="cheque-table">
                    <thead>
                        <tr>
                            <th>Cheque #</th>
                            <th>Bank</th>
                            <th>Date</th>
                            <th>Days Left</th>
                            <th>Amount</th>
                            <th>Source</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cheques.map(c => (
                            <tr key={c.id}>
                                <td>{c.chequeNumber}</td>
                                <td>{c.bankName}</td>
                                <td>{new Date(c.chequeDate).toLocaleDateString()}</td>
                                <td className={c.daysRemaining <= 0 ? 'due' : ''}>
                                    {c.daysRemaining > 0 ? `${c.daysRemaining} days` : 'Due'}
                                </td>
                                <td className="amount">Rs. {c.amount?.toFixed(2)}</td>
                                <td>{c.sourceName}</td>
                                <td>
                                    <span style={getStatusBadge(c.status)}>{c.status}</span>
                                </td>
                                <td className="actions">
                                    <select
                                        onChange={(e) => handleStatusUpdate(c.id, e.target.value)}
                                        value=""
                                        className="status-select"
                                    >
                                        <option value="">Change Status</option>
                                        <option value="DEPOSITED">Deposit</option>
                                        <option value="CLEARED">Clear</option>
                                        <option value="BOUNCED">Bounce</option>
                                        <option value="CANCELLED">Cancel</option>
                                    </select>
                                    <button onClick={() => handleEdit(c.id)} className="btn-edit">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(c.id)} className="btn-delete">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {cheques.length === 0 && !loading && (
                            <tr>
                                <td colSpan="8" className="no-records">No cheques found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Popup */}
            {showPopup && (
                <PostdatedChequePopup
                    editId={editId}
                    onClose={() => setShowPopup(false)}
                    onSaved={() => {
                        setShowPopup(false);
                        fetchCheques();
                        fetchSummary();
                    }}
                />
            )}
        </div>
    );
};

export default PostdatedChequePage;