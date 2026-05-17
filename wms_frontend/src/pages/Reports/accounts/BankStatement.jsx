import React, { useState, useEffect } from "react";
import reportApi from "../../../api/reportApi";
import { getCoaTree } from "../../../api/coaApi";
import { FaSearch, FaChevronDown, FaChevronRight } from "react-icons/fa";
import ReportTemplate from "../ReportTemplate";

export default function BankStatement() {
    const [loading, setLoading] = useState(false);
    const [banks, setBanks] = useState([]);
    const [selectedBank, setSelectedBank] = useState("");
    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState({});

    useEffect(() => { loadBanks(); }, []);

    const loadBanks = async () => {
        try {
            const res = await getCoaTree();
            let list = [];
            const flatten = (tree) => {
                for (const acc of tree) {
                    const id = acc.acctID || acc.AcctID || acc.id;
                    const code = acc.AcctCode || acc.acctCode || acc.code || "";
                    const name = acc.AcctName || acc.acctName || acc.name || "";
                    const cat = (acc.AccountCategory || acc.accountCategory || acc.account_category || "").trim();
                    const leaf = acc.acctLast || acc.AcctLast || acc.isLeaf;

                    // ✅ Multiple checks for Bank category
                    const isBank = cat === "Bank" || cat === "Cash & Bank" || cat === "Cash & Bank";

                    if (leaf && isBank && id) {
                        list.push({ acctID: id, label: `${code} - ${name}` });
                    }
                    if (acc.children?.length) flatten(acc.children);
                }
            };
            flatten(res.data?.data || res.data || []);
            console.log("Banks loaded:", list); // Debug
            setBanks(list);
        } catch (err) {
            console.error("Bank load error:", err);
        }
    };

    const handleSearch = async () => {
        setLoading(true); setError("");
        try {
            const res = await reportApi.getBankStatement(fromDate, toDate, selectedBank || null);
            setData(res.data?.data || null);
            setExpanded({});
        } catch (err) { setError(err.response?.data?.message || "Failed"); }
        finally { setLoading(false); }
    };

    const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    const formatDt = (d) => { if (!d) return ""; const dt = new Date(d); const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return `${String(dt.getDate()).padStart(2, '0')}-${m[dt.getMonth()]}-${dt.getFullYear()}`; };
    const f = (n) => new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

    const filters = (
        <>
            <div className="rp-filter-group"><label>From</label><input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
            <div className="rp-filter-group"><label>To</label><input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
            <div className="rp-filter-group" style={{ flex: 1, minWidth: 200 }}><label>Bank Account</label><select value={selectedBank} onChange={e => setSelectedBank(e.target.value)}><option value="">All Banks</option>{banks.map(b => <option key={b.acctID} value={b.acctID}>{b.label}</option>)}</select></div>
            <button className="rp-btn-search" onClick={handleSearch} disabled={loading}><FaSearch /> {loading ? "Loading..." : "Generate"}</button>
        </>
    );

    return (
        <ReportTemplate title="BANK STATEMENT" subtitle="Bank-wise transaction statement" filters={filters} printedBy="admin">
            {error && <div className="rp-error">⚠ {error}</div>}
            {loading && <div className="rp-no-data">⏳ Loading...</div>}

            {data && !loading && data.map((bank) => (
                <div key={bank.accountId} style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', gap: 16, padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafbfc', marginBottom: 4, cursor: 'pointer' }} onClick={() => toggleExpand(bank.accountId)}>
                        <div style={{ flex: 2 }}><strong>{bank.accountCode} - {bank.accountName}</strong></div>
                        <div style={{ flex: 1 }}>Opening: {f(bank.openingBalance)} {bank.openingBalanceType}</div>
                        <div style={{ flex: 1 }}>Closing: {f(bank.closingBalance)} {bank.closingBalanceType}</div>
                        <div style={{ width: 24, textAlign: 'center', color: '#2563eb' }}>{expanded[bank.accountId] ? <FaChevronDown /> : <FaChevronRight />}</div>
                    </div>
                    {expanded[bank.accountId] && (
                        <div className="rp-table-wrapper">
                            <table className="rp-table" style={{ fontSize: 10 }}>
                                <thead><tr><th>Date</th><th>Voucher</th><th>Type</th><th>Description</th><th className="text-right">Debit</th><th className="text-right">Credit</th><th className="text-right">Balance</th></tr></thead>
                                <tbody>
                                    {bank.transactions?.length > 0 ? bank.transactions.map((t, i) => (
                                        <tr key={i}>
                                            <td>{formatDt(t.date)}</td><td>{t.voucherNo}</td>
                                            <td><span className={`badge ${t.type === 'RECEIVING' ? 'badge-receipt' : 'badge-payment'}`}>{t.type === 'RECEIVING' ? 'Receipt' : 'Payment'}</span></td>
                                            <td>{t.description}</td>
                                            <td className="text-right debit">{t.debit > 0 ? f(t.debit) : '-'}</td>
                                            <td className="text-right credit">{t.credit > 0 ? f(t.credit) : '-'}</td>
                                            <td className="text-right balance">{f(t.balance)}</td>
                                        </tr>
                                    )) : <tr><td colSpan="7" className="rp-no-data">No transactions</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}

            {!data && !loading && !error && <div className="rp-no-data">📊 Select filters and click "Generate Report"</div>}
        </ReportTemplate>
    );
}