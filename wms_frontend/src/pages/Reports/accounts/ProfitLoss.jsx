import React, { useState } from "react";
import reportApi from "../../../api/reportApi";
import { FaSearch, FaChevronDown, FaChevronRight } from "react-icons/fa";
import ReportTemplate from "../ReportTemplate";

export default function ProfitLoss() {
    const [loading, setLoading] = useState(false);
    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [showDetails, setShowDetails] = useState(false);
    const [expanded, setExpanded] = useState({});

    const handleSearch = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await reportApi.getProfitLoss(fromDate, toDate);
            setData(res.data?.data || null);
            setExpanded({});
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load report");
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (key) => {
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
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
            <div className="rp-filter-group" style={{ alignItems: 'center' }}>
                <label style={{ marginBottom: 4 }}>Show Details</label>
                <input
                    type="checkbox"
                    checked={showDetails}
                    onChange={e => setShowDetails(e.target.checked)}
                    style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
            </div>
            <button className="rp-btn-search" onClick={handleSearch} disabled={loading}>
                <FaSearch /> {loading ? "Loading..." : "Generate Report"}
            </button>
        </>
    );

    const renderRow = (item, index, sectionKey) => (
        <div key={index} style={{ marginBottom: 4 }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: '#fafbfc',
                    border: '1px solid #eee',
                    borderRadius: 4,
                    cursor: showDetails ? 'pointer' : 'default'
                }}
                onClick={() => showDetails && toggleExpand(`${sectionKey}_${index}`)}
            >
                <span>{item.accountCode} - {item.accountName}</span>
                <span style={{
                    fontWeight: 700,
                    color: item.amount < 0 ? '#dc2626' : '#059669'
                }}>
                    {f(item.amount)}
                </span>
                {showDetails && (
                    <span style={{ color: '#2563eb', marginLeft: 8 }}>
                        {expanded[`${sectionKey}_${index}`] ? <FaChevronDown /> : <FaChevronRight />}
                    </span>
                )}
            </div>

            {showDetails && expanded[`${sectionKey}_${index}`] && item.details?.length > 0 && (
                <div className="rp-table-wrapper" style={{ margin: '4px 0 8px 20px' }}>
                    <table className="rp-table" style={{ fontSize: 10 }}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Voucher</th>
                                <th>Description</th>
                                <th className="text-right">Debit</th>
                                <th className="text-right">Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {item.details.map((d, j) => (
                                <tr key={j}>
                                    <td>{formatDt(d.date)}</td>
                                    <td>{d.voucherNo}</td>
                                    <td>{d.description}</td>
                                    <td className="text-right">{f(d.debit)}</td>
                                    <td className="text-right">{f(d.credit)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <ReportTemplate
            title="PROFIT & LOSS STATEMENT"
            subtitle="Income vs Expenses Summary"
            filters={filters}
            printedBy="admin"
            metaFields={data ? [
                { label: "Period", value: `${formatDt(fromDate)} → ${formatDt(toDate)}` },
                { label: "Total Income", value: f(data.totalIncome) },
                { label: "Total Expenses", value: f(data.totalExpenses) },
                { label: "Net Result", value: `${f(data.netProfitLoss)} ${data.resultType}` },
            ] : null}
        >
            {error && <div className="rp-error">⚠ {error}</div>}
            {loading && <div className="rp-no-data">⏳ Loading profit & loss data...</div>}

            {data && !loading && (
                <div>
                    {/* INCOME SECTION */}
                    <div style={{ marginBottom: 20 }}>
                        <h3 style={{
                            color: '#059669',
                            borderBottom: '2px solid #059669',
                            paddingBottom: 6,
                            marginBottom: 10
                        }}>
                            💰 INCOME
                        </h3>
                        {data.incomeGroups?.map((item, i) => renderRow(item, i, 'income'))}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            background: '#d1fae5',
                            borderRadius: 4,
                            fontWeight: 700,
                            borderTop: '2px solid #059669',
                            marginTop: 6
                        }}>
                            <span>TOTAL INCOME</span>
                            <span>{f(data.totalIncome)}</span>
                        </div>
                    </div>

                    {/* EXPENSES SECTION */}
                    <div style={{ marginBottom: 20 }}>
                        <h3 style={{
                            color: '#dc2626',
                            borderBottom: '2px solid #dc2626',
                            paddingBottom: 6,
                            marginBottom: 10
                        }}>
                            💸 EXPENSES
                        </h3>
                        {data.expenseGroups?.map((item, i) => renderRow(item, i, 'expense'))}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            background: '#fee2e2',
                            borderRadius: 4,
                            fontWeight: 700,
                            borderTop: '2px solid #dc2626',
                            marginTop: 6
                        }}>
                            <span>TOTAL EXPENSES</span>
                            <span>{f(data.totalExpenses)}</span>
                        </div>
                    </div>

                    {/* NET RESULT */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        background: data.resultType === 'Profit' ? '#d1fae5' : '#fee2e2',
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: 16,
                        border: `2px solid ${data.resultType === 'Profit' ? '#059669' : '#dc2626'}`
                    }}>
                        <span>📊 NET {String(data.resultType).toUpperCase()}</span>
                        <span style={{ color: data.resultType === 'Profit' ? '#059669' : '#dc2626' }}>
                            {f(data.netProfitLoss)}
                        </span>
                    </div>
                </div>
            )}

            {!data && !loading && !error && (
                <div className="rp-no-data">
                    📊 Select date range and click "Generate Report"
                </div>
            )}
        </ReportTemplate>
    );
}