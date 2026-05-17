import React, { useState } from "react";
import reportApi from "../../../api/reportApi";
import { FaSearch } from "react-icons/fa";
import ReportTemplate from "../ReportTemplate";

export default function TrialBalance() {
    const [loading, setLoading] = useState(false);
    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    const handleSearch = async () => {
        setLoading(true); setError("");
        try {
            const res = await reportApi.getTrialBalance(fromDate, toDate);
            setData(res.data?.data || null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load trial balance");
        } finally { setLoading(false); }
    };

    const formatDt = (d) => {
        if (!d) return "";
        const dt = new Date(d);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${String(dt.getDate()).padStart(2, '0')}-${months[dt.getMonth()]}-${dt.getFullYear()}`;
    };

    const f = (n) => new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

    // Calculate totals
    const totalOpenDr = data?.reduce((s, d) => s + (d.openingDebit || 0), 0) || 0;
    const totalOpenCr = data?.reduce((s, d) => s + (d.openingCredit || 0), 0) || 0;
    const totalPeriodDr = data?.reduce((s, d) => s + (d.periodDebit || 0), 0) || 0;
    const totalPeriodCr = data?.reduce((s, d) => s + (d.periodCredit || 0), 0) || 0;
    const totalCloseDr = data?.filter(d => d.closingBalanceType === "Dr").reduce((s, d) => s + (d.closingBalance || 0), 0) || 0;
    const totalCloseCr = data?.filter(d => d.closingBalanceType === "Cr").reduce((s, d) => s + (d.closingBalance || 0), 0) || 0;

    const isBalanced = Math.abs(totalCloseDr - totalCloseCr) < 0.01;

    const filters = (
        <>
            <div className="rp-filter-group"><label>From</label><input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
            <div className="rp-filter-group"><label>To</label><input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
            <button className="rp-btn-search" onClick={handleSearch} disabled={loading}>
                <FaSearch /> {loading ? "Loading..." : "Generate Report"}
            </button>
        </>
    );

    return (
        <ReportTemplate
            title="TRIAL BALANCE"
            subtitle={isBalanced ? "✅ Debit = Credit — Balanced" : "⚠️ Unbalanced — Check Entries"}
            filters={filters}
            printedBy="admin"
            metaFields={data ? [
                { label: "Period", value: `${formatDt(fromDate)} → ${formatDt(toDate)}` },
                { label: "Total Debit", value: f(totalCloseDr) },
                { label: "Total Credit", value: f(totalCloseCr) },
                { label: "Difference", value: f(Math.abs(totalCloseDr - totalCloseCr)) },
            ] : null}
        >
            {error && <div className="rp-error">⚠ {error}</div>}
            {loading && <div className="rp-no-data">⏳ Loading trial balance...</div>}

            {data && !loading && (
                <div className="rp-table-wrapper">
                    <table className="rp-table">
                        <thead>
                            <tr>
                                <th>Account Code</th>
                                <th>Account Name</th>
                                <th className="text-right">Opening Dr</th>
                                <th className="text-right">Opening Cr</th>
                                <th className="text-right">Period Dr</th>
                                <th className="text-right">Period Cr</th>
                                <th className="text-right">Closing Dr</th>
                                <th className="text-right">Closing Cr</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? data.map((item, idx) => (
                                <tr key={idx}>
                                    <td><strong>{item.accountCode}</strong></td>
                                    <td>{item.accountName}</td>
                                    <td className="text-right">{f(item.openingDebit)}</td>
                                    <td className="text-right">{f(item.openingCredit)}</td>
                                    <td className="text-right">{f(item.periodDebit)}</td>
                                    <td className="text-right">{f(item.periodCredit)}</td>
                                    <td className="text-right debit">{item.closingBalanceType === "Dr" ? f(item.closingBalance) : "-"}</td>
                                    <td className="text-right credit">{item.closingBalanceType === "Cr" ? f(item.closingBalance) : "-"}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="8" className="rp-no-data">No accounts found with transactions</td></tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="2"><strong>Totals</strong></td>
                                <td className="text-right"><strong>{f(totalOpenDr)}</strong></td>
                                <td className="text-right"><strong>{f(totalOpenCr)}</strong></td>
                                <td className="text-right"><strong>{f(totalPeriodDr)}</strong></td>
                                <td className="text-right"><strong>{f(totalPeriodCr)}</strong></td>
                                <td className="text-right"><strong>{f(totalCloseDr)}</strong></td>
                                <td className="text-right"><strong>{f(totalCloseCr)}</strong></td>
                            </tr>
                            {!isBalanced && (
                                <tr style={{ background: '#fef2f2' }}>
                                    <td colSpan="6"><strong style={{ color: '#dc2626' }}>⚠ Difference</strong></td>
                                    <td colSpan="2" className="text-right" style={{ color: '#dc2626', fontWeight: 700 }}>
                                        {f(Math.abs(totalCloseDr - totalCloseCr))}
                                    </td>
                                </tr>
                            )}
                        </tfoot>
                    </table>
                </div>
            )}

            {!data && !loading && !error && (
                <div className="rp-no-data">📊 Select date range and click "Generate Report"</div>
            )}
        </ReportTemplate>
    );
}