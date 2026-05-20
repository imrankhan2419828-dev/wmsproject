//import React, { useState } from "react";
//import reportApi from "../../../api/reportApi";
//import { FaSearch, FaChevronDown, FaChevronRight } from "react-icons/fa";
//import ReportTemplate from "../ReportTemplate";

//export default function ProfitLoss() {
//    const [loading, setLoading] = useState(false);
//    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
//    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
//    const [data, setData] = useState(null);
//    const [error, setError] = useState("");
//    const [showDetails, setShowDetails] = useState(false);
//    const [expanded, setExpanded] = useState({});

//    const handleSearch = async () => {
//        setLoading(true);
//        setError("");
//        try {
//            const res = await reportApi.getProfitLoss(fromDate, toDate);
//            setData(res.data?.data || null);
//            setExpanded({});
//        } catch (err) {
//            setError(err.response?.data?.message || "Failed to load report");
//        } finally {
//            setLoading(false);
//        }
//    };

//    const toggleExpand = (key) => {
//        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
//    };

//    const formatDt = (d) => {
//        if (!d) return "";
//        const dt = new Date(d);
//        const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//        return `${String(dt.getDate()).padStart(2, '0')}-${m[dt.getMonth()]}-${dt.getFullYear()}`;
//    };

//    const f = (n) => new Intl.NumberFormat('en-PK', {
//        minimumFractionDigits: 2,
//        maximumFractionDigits: 2
//    }).format(n || 0);

//    const filters = (
//        <>
//            <div className="rp-filter-group">
//                <label>From</label>
//                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
//            </div>
//            <div className="rp-filter-group">
//                <label>To</label>
//                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
//            </div>
//            <div className="rp-filter-group" style={{ alignItems: 'center' }}>
//                <label style={{ marginBottom: 4 }}>Show Details</label>
//                <input
//                    type="checkbox"
//                    checked={showDetails}
//                    onChange={e => setShowDetails(e.target.checked)}
//                    style={{ width: 20, height: 20, cursor: 'pointer' }}
//                />
//            </div>
//            <button className="rp-btn-search" onClick={handleSearch} disabled={loading}>
//                <FaSearch /> {loading ? "Loading..." : "Generate Report"}
//            </button>
//        </>
//    );

//    const renderRow = (item, index, sectionKey) => (
//        <div key={index} style={{ marginBottom: 4 }}>
//            <div
//                style={{
//                    display: 'flex',
//                    justifyContent: 'space-between',
//                    padding: '6px 10px',
//                    background: '#fafbfc',
//                    border: '1px solid #eee',
//                    borderRadius: 4,
//                    cursor: showDetails ? 'pointer' : 'default'
//                }}
//                onClick={() => showDetails && toggleExpand(`${sectionKey}_${index}`)}
//            >
//                <span>{item.accountCode} - {item.accountName}</span>
//                <span style={{
//                    fontWeight: 700,
//                    color: item.amount < 0 ? '#dc2626' : '#059669'
//                }}>
//                    {f(item.amount)}
//                </span>
//                {showDetails && (
//                    <span style={{ color: '#2563eb', marginLeft: 8 }}>
//                        {expanded[`${sectionKey}_${index}`] ? <FaChevronDown /> : <FaChevronRight />}
//                    </span>
//                )}
//            </div>

//            {showDetails && expanded[`${sectionKey}_${index}`] && item.details?.length > 0 && (
//                <div className="rp-table-wrapper" style={{ margin: '4px 0 8px 20px' }}>
//                    <table className="rp-table" style={{ fontSize: 10 }}>
//                        <thead>
//                            <tr>
//                                <th>Date</th>
//                                <th>Voucher</th>
//                                <th>Description</th>
//                                <th className="text-right">Debit</th>
//                                <th className="text-right">Credit</th>
//                            </tr>
//                        </thead>
//                        <tbody>
//                            {item.details.map((d, j) => (
//                                <tr key={j}>
//                                    <td>{formatDt(d.date)}</td>
//                                    <td>{d.voucherNo}</td>
//                                    <td>{d.description}</td>
//                                    <td className="text-right">{f(d.debit)}</td>
//                                    <td className="text-right">{f(d.credit)}</td>
//                                </tr>
//                            ))}
//                        </tbody>
//                    </table>
//                </div>
//            )}
//        </div>
//    );

//    return (
//        <ReportTemplate
//            title="PROFIT & LOSS STATEMENT"
//            subtitle="Income vs Expenses Summary"
//            filters={filters}
//            printedBy="admin"
//            metaFields={data ? [
//                { label: "Period", value: `${formatDt(fromDate)} → ${formatDt(toDate)}` },
//                { label: "Total Income", value: f(data.totalIncome) },
//                { label: "Total Expenses", value: f(data.totalExpenses) },
//                { label: "Net Result", value: `${f(data.netProfitLoss)} ${data.resultType}` },
//            ] : null}
//        >
//            {error && <div className="rp-error">⚠ {error}</div>}
//            {loading && <div className="rp-no-data">⏳ Loading profit & loss data...</div>}

//            {data && !loading && (
//                <div>
//                    {/* INCOME SECTION */}
//                    <div style={{ marginBottom: 20 }}>
//                        <h3 style={{
//                            color: '#059669',
//                            borderBottom: '2px solid #059669',
//                            paddingBottom: 6,
//                            marginBottom: 10
//                        }}>
//                            💰 INCOME
//                        </h3>
//                        {data.incomeGroups?.map((item, i) => renderRow(item, i, 'income'))}
//                        <div style={{
//                            display: 'flex',
//                            justifyContent: 'space-between',
//                            padding: '8px 10px',
//                            background: '#d1fae5',
//                            borderRadius: 4,
//                            fontWeight: 700,
//                            borderTop: '2px solid #059669',
//                            marginTop: 6
//                        }}>
//                            <span>TOTAL INCOME</span>
//                            <span>{f(data.totalIncome)}</span>
//                        </div>
//                    </div>

//                    {/* EXPENSES SECTION */}
//                    <div style={{ marginBottom: 20 }}>
//                        <h3 style={{
//                            color: '#dc2626',
//                            borderBottom: '2px solid #dc2626',
//                            paddingBottom: 6,
//                            marginBottom: 10
//                        }}>
//                            💸 EXPENSES
//                        </h3>
//                        {data.expenseGroups?.map((item, i) => renderRow(item, i, 'expense'))}
//                        <div style={{
//                            display: 'flex',
//                            justifyContent: 'space-between',
//                            padding: '8px 10px',
//                            background: '#fee2e2',
//                            borderRadius: 4,
//                            fontWeight: 700,
//                            borderTop: '2px solid #dc2626',
//                            marginTop: 6
//                        }}>
//                            <span>TOTAL EXPENSES</span>
//                            <span>{f(data.totalExpenses)}</span>
//                        </div>
//                    </div>

//                    {/* NET RESULT */}
//                    <div style={{
//                        display: 'flex',
//                        justifyContent: 'space-between',
//                        padding: '14px 16px',
//                        background: data.resultType === 'Profit' ? '#d1fae5' : '#fee2e2',
//                        borderRadius: 8,
//                        fontWeight: 700,
//                        fontSize: 16,
//                        border: `2px solid ${data.resultType === 'Profit' ? '#059669' : '#dc2626'}`
//                    }}>
//                        <span>📊 NET {String(data.resultType).toUpperCase()}</span>
//                        <span style={{ color: data.resultType === 'Profit' ? '#059669' : '#dc2626' }}>
//                            {f(data.netProfitLoss)}
//                        </span>
//                    </div>
//                </div>
//            )}

//            {!data && !loading && !error && (
//                <div className="rp-no-data">
//                    📊 Select date range and click "Generate Report"
//                </div>
//            )}
//        </ReportTemplate>
//    );
//}

import React, { useState } from "react";
import reportApi from "../../../api/reportApi";
import {
    FaSearch,
    FaFilePdf,
    FaFileExcel,
    FaPrint
} from "react-icons/fa";
import ReportTemplate from "../ReportTemplate";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ProfitLoss() {
    const [loading, setLoading] = useState(false);
    const [fromDate, setFromDate] = useState(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    );
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    const loggedInUser =
        localStorage.getItem("userName") ||
        localStorage.getItem("username") ||
        localStorage.getItem("fullName") ||
        "Admin User";

    const branchName = localStorage.getItem("branchName") || "Main Branch";

    const handleSearch = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await reportApi.getProfitLoss(fromDate, toDate);
            setData(res.data?.data || null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load report");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (d) => {
        if (!d) return "";
        const dt = new Date(d);
        const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${String(dt.getDate()).padStart(2, '0')}-${m[dt.getMonth()]}-${dt.getFullYear()}`;
    };

    const formatNumber = (n) => new Intl.NumberFormat('en-PK', {
        minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(n || 0);

    // ================= PDF =================
    const exportPDF = () => {
        if (!data) {
            alert("No data available");
            return;
        }

        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const generatedOn = new Date().toLocaleString();
        let y = 15;

        // ===== HEADER =====
        doc.setFont("helvetica");
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("PROFIT & LOSS STATEMENT", pageWidth / 2, y, { align: "center" });
        y += 8;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(`Branch: ${branchName}`, 10, y);
        doc.text(`Period: ${formatDate(fromDate)} to ${formatDate(toDate)}`, pageWidth - 10, y, { align: "right" });
        y += 5;
        doc.text(`Generated By: ${loggedInUser} | ${generatedOn}`, 10, y);
        y += 8;

        // ===== INCOME SECTION =====
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(5, 150, 105);
        doc.text("INCOME", 10, y);
        y += 7;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 60, 75);

        if (data.incomeGroups) {
            for (const item of data.incomeGroups) {
                doc.text(`${item.accountCode} - ${item.accountName}`, 14, y);
                doc.text(formatNumber(item.amount), pageWidth - 10, y, { align: "right" });
                y += 5;
            }
        }

        // Income Total
        y += 2;
        doc.setDrawColor(5, 150, 105);
        doc.line(10, y, pageWidth - 10, y);
        y += 5;
        doc.setFont("helvetica", "bold");
        doc.text("TOTAL INCOME", 10, y);
        doc.text(formatNumber(data.totalIncome), pageWidth - 10, y, { align: "right" });
        y += 10;

        // ===== EXPENSES SECTION =====
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 38, 38);
        doc.text("EXPENSES", 10, y);
        y += 7;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 60, 75);

        if (data.expenseGroups) {
            for (const item of data.expenseGroups) {
                doc.text(`${item.accountCode} - ${item.accountName}`, 14, y);
                doc.text(formatNumber(item.amount), pageWidth - 10, y, { align: "right" });
                y += 5;
            }
        }

        // Expenses Total
        y += 2;
        doc.setDrawColor(220, 38, 38);
        doc.line(10, y, pageWidth - 10, y);
        y += 5;
        doc.setFont("helvetica", "bold");
        doc.text("TOTAL EXPENSES", 10, y);
        doc.text(formatNumber(data.totalExpenses), pageWidth - 10, y, { align: "right" });
        y += 10;

        // ===== NET RESULT =====
        doc.setDrawColor(100, 100, 100);
        doc.line(10, y, pageWidth - 10, y);
        y += 7;

        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        const resultColor = data.resultType === 'Profit' ? [5, 150, 105] : [220, 38, 38];
        doc.setTextColor(resultColor[0], resultColor[1], resultColor[2]);
        doc.text(`NET ${String(data.resultType).toUpperCase()}`, 10, y);
        doc.text(formatNumber(data.netProfitLoss), pageWidth - 10, y, { align: "right" });
        y += 8;

        // Footer
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(`${loggedInUser} | ${generatedOn}`, 10, pageHeight - 8);

        doc.save(`ProfitLoss_${fromDate}_to_${toDate}.pdf`);
    };

    // ================= EXCEL =================
    const exportExcel = () => {
        if (!data) {
            alert("No data available");
            return;
        }

        const excelData = [];

        // Income Section
        excelData.push({ "ACCOUNT CODE": "INCOME", "ACCOUNT NAME": "", AMOUNT: "" });
        if (data.incomeGroups) {
            for (const item of data.incomeGroups) {
                excelData.push({
                    "ACCOUNT CODE": item.accountCode,
                    "ACCOUNT NAME": item.accountName,
                    AMOUNT: item.amount
                });
            }
        }
        excelData.push({ "ACCOUNT CODE": "", "ACCOUNT NAME": "TOTAL INCOME", AMOUNT: data.totalIncome });
        excelData.push({ "ACCOUNT CODE": "", "ACCOUNT NAME": "", AMOUNT: "" });

        // Expenses Section
        excelData.push({ "ACCOUNT CODE": "EXPENSES", "ACCOUNT NAME": "", AMOUNT: "" });
        if (data.expenseGroups) {
            for (const item of data.expenseGroups) {
                excelData.push({
                    "ACCOUNT CODE": item.accountCode,
                    "ACCOUNT NAME": item.accountName,
                    AMOUNT: item.amount
                });
            }
        }
        excelData.push({ "ACCOUNT CODE": "", "ACCOUNT NAME": "TOTAL EXPENSES", AMOUNT: data.totalExpenses });
        excelData.push({ "ACCOUNT CODE": "", "ACCOUNT NAME": "", AMOUNT: "" });
        excelData.push({ "ACCOUNT CODE": `NET ${String(data.resultType).toUpperCase()}`, "ACCOUNT NAME": "", AMOUNT: data.netProfitLoss });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        worksheet["!cols"] = [{ wch: 18 }, { wch: 40 }, { wch: 18 }];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Profit & Loss");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `ProfitLoss_${fromDate}_to_${toDate}.xlsx`);
    };

    const handlePrint = () => { window.print(); };

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
            <button className="rp-btn-search" onClick={handleSearch} disabled={loading}>
                <FaSearch /> {loading ? "Loading..." : "Generate Report"}
            </button>
        </>
    );

    const exportButtons = data ? (
        <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={exportPDF} style={{ background: "#dc2626", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}><FaFilePdf /> PDF</button>
            <button onClick={exportExcel} style={{ background: "#16a34a", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}><FaFileExcel /> Excel</button>
            <button onClick={handlePrint} style={{ background: "#475569", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}><FaPrint /> Print</button>
        </div>
    ) : null;

    return (
        <ReportTemplate
            title="PROFIT & LOSS STATEMENT"
            subtitle="Income vs Expenses Summary"
            filters={filters}
            printedBy={loggedInUser}
            extraActions={exportButtons}
            metaFields={data ? [
                { label: "Period", value: `${formatDate(fromDate)} → ${formatDate(toDate)}` },
                { label: "Total Income", value: formatNumber(data.totalIncome) },
                { label: "Total Expenses", value: formatNumber(data.totalExpenses) },
                { label: "Net Result", value: `${formatNumber(data.netProfitLoss)} ${data.resultType}` },
            ] : null}
        >
            {error && <div className="rp-error">⚠ {error}</div>}
            {loading && <div className="rp-no-data">⏳ Loading profit & loss data...</div>}

            {data && !loading && (
                <div>
                    {/* INCOME SECTION */}
                    <div style={{ marginBottom: 20 }}>
                        <h3 style={{ color: '#059669', borderBottom: '2px solid #059669', paddingBottom: 6, marginBottom: 10 }}>💰 INCOME</h3>
                        {data.incomeGroups?.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', background: '#f9fbfd', borderBottom: '1px solid #edf2f7' }}>
                                <span style={{ color: '#334155' }}>{item.accountCode} - {item.accountName}</span>
                                <span style={{ fontWeight: 700, color: '#059669' }}>{formatNumber(item.amount)}</span>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#d1fae5', borderRadius: 4, fontWeight: 700, borderTop: '2px solid #059669', marginTop: 4 }}>
                            <span>TOTAL INCOME</span><span>{formatNumber(data.totalIncome)}</span>
                        </div>
                    </div>

                    {/* EXPENSES SECTION */}
                    <div style={{ marginBottom: 20 }}>
                        <h3 style={{ color: '#dc2626', borderBottom: '2px solid #dc2626', paddingBottom: 6, marginBottom: 10 }}>💸 EXPENSES</h3>
                        {data.expenseGroups?.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', background: '#f9fbfd', borderBottom: '1px solid #edf2f7' }}>
                                <span style={{ color: '#334155' }}>{item.accountCode} - {item.accountName}</span>
                                <span style={{ fontWeight: 700, color: '#dc2626' }}>{formatNumber(item.amount)}</span>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#fee2e2', borderRadius: 4, fontWeight: 700, borderTop: '2px solid #dc2626', marginTop: 4 }}>
                            <span>TOTAL EXPENSES</span><span>{formatNumber(data.totalExpenses)}</span>
                        </div>
                    </div>

                    {/* NET RESULT */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', padding: '16px 20px',
                        background: data.resultType === 'Profit' ? '#d1fae5' : '#fee2e2',
                        borderRadius: 8, fontWeight: 700, fontSize: 16,
                        border: `2px solid ${data.resultType === 'Profit' ? '#059669' : '#dc2626'}`
                    }}>
                        <span>📊 NET {String(data.resultType).toUpperCase()}</span>
                        <span style={{ color: data.resultType === 'Profit' ? '#059669' : '#dc2626' }}>
                            {formatNumber(data.netProfitLoss)}
                        </span>
                    </div>
                </div>
            )}

            {!data && !loading && !error && (
                <div className="rp-no-data">📊 Select date range and click "Generate Report"</div>
            )}
        </ReportTemplate>
    );
}