import React, { useState, useEffect } from "react";
import reportApi from "../../../api/reportApi";
import { getCoaTree } from "../../../api/coaApi";
import { FaSearch, FaChevronDown, FaChevronRight } from "react-icons/fa";
import ReportTemplate from "../ReportTemplate";

export default function CustomerStatement() {
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState({});

    useEffect(() => { loadCustomers(); }, []);

    const loadCustomers = async () => {
        try {
            const res = await getCoaTree();
            let list = [];
            const flatten = (tree) => {
                for (const acc of tree) {
                    const cat = acc.accountCategory || acc.AccountCategory || "";
                    const leaf = acc.acctLast || acc.AcctLast;
                    if (leaf && cat === "Customer" && (acc.acctID || acc.AcctID)) {
                        list.push({
                            acctID: acc.acctID || acc.AcctID,
                            label: `${acc.AcctCode || acc.acctCode || ""} - ${acc.AcctName || acc.acctName || ""}`
                        });
                    }
                    if (acc.children?.length) flatten(acc.children);
                }
            };
            flatten(res.data?.data || res.data || []);
            setCustomers(list);
        } catch (err) { }
    };

    const handleSearch = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await reportApi.getCustomerStatement(
                fromDate, toDate,
                selectedCustomer ? parseInt(selectedCustomer) : null
            );
            setData(res.data?.data || null);
            setExpanded({});
        } catch (err) {
            setError(err.response?.data?.message || "Failed");
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (customerId) => {
        setExpanded(prev => ({ ...prev, [customerId]: !prev[customerId] }));
    };

    const formatDt = (d) => {
        if (!d) return "";
        const dt = new Date(d);
        const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${String(dt.getDate()).padStart(2, '0')}-${m[dt.getMonth()]}-${dt.getFullYear()}`;
    };

    const f = (n) => new Intl.NumberFormat('en-PK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(n || 0);

    const filters = (
        <>
            <div className="rp-filter-group">
                <label>From</label>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className="rp-filter-group">
                <label>To</label>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
            <div className="rp-filter-group" style={{ flex: 1, minWidth: 200 }}>
                <label>Customer</label>
                <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
                    <option value="">All Customers</option>
                    {customers.map(c => (
                        <option key={c.acctID} value={c.acctID}>{c.label}</option>
                    ))}
                </select>
            </div>
            <button className="rp-btn-search" onClick={handleSearch} disabled={loading}>
                <FaSearch /> {loading ? "Loading..." : "Generate Report"}
            </button>
        </>
    );

    return (
        <ReportTemplate
            title="CUSTOMER STATEMENT"
            subtitle="Detailed transaction-wise customer report"
            filters={filters}
            printedBy="admin"
        >
            {error && <div className="rp-error">⚠ {error}</div>}
            {loading && <div className="rp-no-data">⏳ Loading customer data...</div>}

            {data && !loading && data.map((cust) => (
                <div key={cust.customerId} style={{ marginBottom: 24 }}>

                    {/* ============================================================ */}
                    {/* LEFT-RIGHT SUMMARY (Screen + Print same)                    */}
                    {/* ============================================================ */}
                    <div style={{
                        display: 'flex',
                        gap: '20px',
                        marginBottom: 10,
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        padding: '12px 16px',
                        background: '#fafbfc'
                    }}>
                        {/* Left Column */}
                        <div style={{ flex: 1 }}>
                            <div style={rowStyleB}>
                                <span style={labelStyle}>Customer</span>
                                <span style={valueStyle}>{cust.customerCode} - {cust.customerName}</span>
                            </div>
                            <div style={rowStyleB}>
                                <span style={labelStyle}>Opening</span>
                                <span style={valueStyle}>{f(cust.openingBalance)} {cust.openingBalanceType}</span>
                            </div>
                            <div style={rowStyle}>
                                <span style={labelStyle}>Closing</span>
                                <span style={valueStyle}>{f(cust.closingBalance)} {cust.closingBalanceType}</span>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div style={{ flex: 1 }}>
                            <div style={rowStyleB}>
                                <span style={labelStyle}>Total Debit</span>
                                <span style={valueStyle}>{f(cust.totalDebit)}</span>
                            </div>
                            <div style={rowStyleB}>
                                <span style={labelStyle}>Total Credit</span>
                                <span style={valueStyle}>{f(cust.totalCredit)}</span>
                            </div>
                            <div style={{ ...rowStyle, cursor: 'pointer' }} onClick={() => toggleExpand(cust.customerId)}>
                                <span style={labelStyle}>Transactions</span>
                                <span style={{ ...valueStyle, color: '#2563eb' }}>
                                    {expanded[cust.customerId] ? <FaChevronDown /> : <FaChevronRight />} {cust.transactions?.length || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ============================================================ */}
                    {/* DETAIL TABLE                                                    */}
                    {/* ============================================================ */}
                    {expanded[cust.customerId] && (
                        <div className="rp-table-wrapper">
                            <table className="rp-table" style={{ fontSize: 10 }}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Voucher</th>
                                        <th>Type</th>
                                        <th>Item/Model</th>
                                        <th className="text-center">Qty</th>
                                        <th className="text-right">Rate</th>
                                        <th className="text-right">Debit</th>
                                        <th className="text-right">Credit</th>
                                        <th className="text-right">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cust.transactions?.length > 0 ? (
                                        cust.transactions.map((t, i) => (
                                            <tr key={i}>
                                                <td>{formatDt(t.date)}</td>
                                                <td>{t.voucherNo}</td>
                                                <td>
                                                    <span className={`badge ${t.type === 'SALE' ? 'badge-sale' : t.type === 'SALE_RETURN' ? 'badge-return' : 'badge-receipt'}`}>
                                                        {t.type === 'SALE' ? 'Sale' : t.type === 'SALE_RETURN' ? 'Return' : 'Receipt'}
                                                    </span>
                                                </td>
                                                <td>{t.itemName}{t.model ? ` (${t.model})` : ''}</td>
                                                <td className="text-center">{t.quantity > 0 ? t.quantity : '-'}</td>
                                                <td className="text-right">{t.rate > 0 ? f(t.rate) : '-'}</td>
                                                <td className="text-right debit">{t.debit > 0 ? f(t.debit) : '-'}</td>
                                                <td className="text-right credit">{t.credit > 0 ? f(t.credit) : '-'}</td>
                                                <td className="text-right balance">{f(t.balance)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="9" className="rp-no-data">No transactions found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}

            {!data && !loading && !error && (
                <div className="rp-no-data">📊 Select filters and click "Generate Report"</div>
            )}
        </ReportTemplate>
    );
}

// ============================================================
// Inline Styles
// ============================================================
const rowStyleB = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
    borderBottom: '1px dotted #e0e0e0',
    fontSize: 13
};

const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
    fontSize: 13
};

const labelStyle = {
    fontWeight: 600,
    color: '#64748b'
};

const valueStyle = {
    fontWeight: 700,
    color: '#1e293b'
};