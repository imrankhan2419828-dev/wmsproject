import React, { useState, useEffect } from "react";
import reportApi from "../../../api/reportApi";
import { getCoaTree } from "../../../api/coaApi";
import itemApi from "../../../api/itemApi";
import { FaSearch, FaChevronDown, FaChevronRight } from "react-icons/fa";
import ReportTemplate from "../ReportTemplate";

export default function SaleReport() {
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [selectedItem, setSelectedItem] = useState("");
    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState({});

    useEffect(() => { loadDropdowns(); }, []);

    const loadDropdowns = async () => {
        try {
            const [coaRes, itemRes] = await Promise.all([getCoaTree(), itemApi.getAll()]);
            let custList = [];
            const flatten = (tree) => {
                for (const acc of tree) {
                    const id = acc.acctID || acc.AcctID; const code = acc.AcctCode || acc.acctCode || "";
                    const name = acc.AcctName || acc.acctName || ""; const cat = (acc.AccountCategory || acc.accountCategory || "").trim();
                    if (acc.acctLast && cat === "Customer" && id) custList.push({ acctID: id, label: `${code} - ${name}` });
                    if (acc.children?.length) flatten(acc.children);
                }
            };
            flatten(coaRes.data?.data || coaRes.data || []);
            setCustomers(custList);
            setItems((itemRes.data?.data || itemRes.data || []).map(i => ({ itemID: i.itemID || i.ItemID, label: i.itemName || i.ItemName })));
        } catch (err) { }
    };

    const handleSearch = async () => {
        setLoading(true); setError("");
        try {
            const res = await reportApi.getSaleReport(fromDate, toDate, selectedCustomer || null, selectedItem || null);
            setData(res.data?.data || null); setExpanded({});
        } catch (err) { setError(err.response?.data?.message || "Failed"); }
        finally { setLoading(false); }
    };

    const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    const formatDt = (d) => { if (!d) return ""; const dt = new Date(d); const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return `${String(dt.getDate()).padStart(2, '0')}-${m[dt.getMonth()]}-${dt.getFullYear()}`; };
    const f = (n) => new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

    const totalAmount = data?.reduce((s, d) => s + (d.totalAmount || 0), 0) || 0;
    const totalQty = data?.reduce((s, d) => s + (d.totalQty || 0), 0) || 0;

    const filters = (
        <>
            <div className="rp-filter-group"><label>From</label><input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
            <div className="rp-filter-group"><label>To</label><input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
            <div className="rp-filter-group" style={{ minWidth: 180 }}><label>Customer</label><select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}><option value="">All</option>{customers.map(c => <option key={c.acctID} value={c.acctID}>{c.label}</option>)}</select></div>
            <div className="rp-filter-group" style={{ minWidth: 180 }}><label>Item</label><select value={selectedItem} onChange={e => setSelectedItem(e.target.value)}><option value="">All</option>{items.map(i => <option key={i.itemID} value={i.itemID}>{i.label}</option>)}</select></div>
            <button className="rp-btn-search" onClick={handleSearch} disabled={loading}><FaSearch /> {loading ? "Loading..." : "Generate"}</button>
        </>
    );

    return (
        <ReportTemplate title="SALE REPORT" subtitle="Summary & detail of sales" filters={filters} printedBy="admin"
            metaFields={data ? [{ label: "Sales", value: data.length }, { label: "Total Qty", value: f(totalQty) }, { label: "Total Amount", value: f(totalAmount) }] : null}>
            {error && <div className="rp-error">⚠ {error}</div>}
            {loading && <div className="rp-no-data">⏳ Loading...</div>}
            {data && !loading && data.map((s) => (
                <div key={s.tranNumb} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 16, padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafbfc', marginBottom: 4, cursor: 'pointer' }} onClick={() => toggleExpand(s.tranNumb)}>
                        <div style={{ flex: 1 }}><strong>{s.billNumb}</strong></div>
                        <div style={{ flex: 1 }}>{formatDt(s.tranDate)}</div>
                        <div style={{ flex: 2 }}>{s.customerName}</div>
                        <div style={{ flex: 1, textAlign: 'center' }}>{s.totalQty} qty</div>
                        <div style={{ flex: 1, textAlign: 'right', fontWeight: 700 }}>{f(s.totalAmount)}</div>
                        <div style={{ width: 24, textAlign: 'center', color: '#2563eb' }}>{expanded[s.tranNumb] ? <FaChevronDown /> : <FaChevronRight />}</div>
                    </div>
                    {expanded && expanded[s.tranNumb] && (
                        <div className="rp-table-wrapper"><table className="rp-table" style={{ fontSize: 10 }}><thead><tr><th>Item</th><th>Model</th><th className="text-center">Qty</th><th className="text-right">Rate</th><th className="text-right">Amount</th></tr></thead><tbody>{s.items?.map((item, idx) => (<tr key={idx}><td>{item.itemName}</td><td>{item.model || '-'}</td><td className="text-center">{item.quantity}</td><td className="text-right">{f(item.rate)}</td><td className="text-right">{f(item.amount)}</td></tr>))}</tbody></table></div>
                    )}
                </div>
            ))}
            {!data && !loading && !error && <div className="rp-no-data">📊 Select filters and click "Generate Report"</div>}
        </ReportTemplate>
    );
}