//import React, { useState } from "react";
//import reportApi from "../../../api/reportApi";
//import { FaSearch } from "react-icons/fa";
//import ReportTemplate from "../ReportTemplate";

//export default function TrialBalance() {
//    const [loading, setLoading] = useState(false);
//    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
//    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
//    const [data, setData] = useState(null);
//    const [error, setError] = useState("");

//    const handleSearch = async () => {
//        setLoading(true); setError("");
//        try {
//            const res = await reportApi.getTrialBalance(fromDate, toDate);
//            setData(res.data?.data || null);
//        } catch (err) {
//            setError(err.response?.data?.message || "Failed to load trial balance");
//        } finally { setLoading(false); }
//    };

//    const formatDt = (d) => {
//        if (!d) return "";
//        const dt = new Date(d);
//        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//        return `${String(dt.getDate()).padStart(2, '0')}-${months[dt.getMonth()]}-${dt.getFullYear()}`;
//    };

//    const f = (n) => new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

//    // Calculate totals
//    const totalOpenDr = data?.reduce((s, d) => s + (d.openingDebit || 0), 0) || 0;
//    const totalOpenCr = data?.reduce((s, d) => s + (d.openingCredit || 0), 0) || 0;
//    const totalPeriodDr = data?.reduce((s, d) => s + (d.periodDebit || 0), 0) || 0;
//    const totalPeriodCr = data?.reduce((s, d) => s + (d.periodCredit || 0), 0) || 0;
//    const totalCloseDr = data?.filter(d => d.closingBalanceType === "Dr").reduce((s, d) => s + (d.closingBalance || 0), 0) || 0;
//    const totalCloseCr = data?.filter(d => d.closingBalanceType === "Cr").reduce((s, d) => s + (d.closingBalance || 0), 0) || 0;

//    const isBalanced = Math.abs(totalCloseDr - totalCloseCr) < 0.01;

//    const filters = (
//        <>
//            <div className="rp-filter-group"><label>From</label><input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
//            <div className="rp-filter-group"><label>To</label><input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
//            <button className="rp-btn-search" onClick={handleSearch} disabled={loading}>
//                <FaSearch /> {loading ? "Loading..." : "Generate Report"}
//            </button>
//        </>
//    );

//    return (
//        <ReportTemplate
//            title="TRIAL BALANCE"
//            subtitle={isBalanced ? "✅ Debit = Credit — Balanced" : "⚠️ Unbalanced — Check Entries"}
//            filters={filters}
//            printedBy="admin"
//            metaFields={data ? [
//                { label: "Period", value: `${formatDt(fromDate)} → ${formatDt(toDate)}` },
//                { label: "Total Debit", value: f(totalCloseDr) },
//                { label: "Total Credit", value: f(totalCloseCr) },
//                { label: "Difference", value: f(Math.abs(totalCloseDr - totalCloseCr)) },
//            ] : null}
//        >
//            {error && <div className="rp-error">⚠ {error}</div>}
//            {loading && <div className="rp-no-data">⏳ Loading trial balance...</div>}

//            {data && !loading && (
//                <div className="rp-table-wrapper">
//                    <table className="rp-table">
//                        <thead>
//                            <tr>
//                                <th>Account Code</th>
//                                <th>Account Name</th>
//                                <th className="text-right">Opening Dr</th>
//                                <th className="text-right">Opening Cr</th>
//                                <th className="text-right">Period Dr</th>
//                                <th className="text-right">Period Cr</th>
//                                <th className="text-right">Closing Dr</th>
//                                <th className="text-right">Closing Cr</th>
//                            </tr>
//                        </thead>
//                        <tbody>
//                            {data.length > 0 ? data.map((item, idx) => (
//                                <tr key={idx}>
//                                    <td><strong>{item.accountCode}</strong></td>
//                                    <td>{item.accountName}</td>
//                                    <td className="text-right">{f(item.openingDebit)}</td>
//                                    <td className="text-right">{f(item.openingCredit)}</td>
//                                    <td className="text-right">{f(item.periodDebit)}</td>
//                                    <td className="text-right">{f(item.periodCredit)}</td>
//                                    <td className="text-right debit">{item.closingBalanceType === "Dr" ? f(item.closingBalance) : "-"}</td>
//                                    <td className="text-right credit">{item.closingBalanceType === "Cr" ? f(item.closingBalance) : "-"}</td>
//                                </tr>
//                            )) : (
//                                <tr><td colSpan="8" className="rp-no-data">No accounts found with transactions</td></tr>
//                            )}
//                        </tbody>
//                        <tfoot>
//                            <tr>
//                                <td colSpan="2"><strong>Totals</strong></td>
//                                <td className="text-right"><strong>{f(totalOpenDr)}</strong></td>
//                                <td className="text-right"><strong>{f(totalOpenCr)}</strong></td>
//                                <td className="text-right"><strong>{f(totalPeriodDr)}</strong></td>
//                                <td className="text-right"><strong>{f(totalPeriodCr)}</strong></td>
//                                <td className="text-right"><strong>{f(totalCloseDr)}</strong></td>
//                                <td className="text-right"><strong>{f(totalCloseCr)}</strong></td>
//                            </tr>
//                            {!isBalanced && (
//                                <tr style={{ background: '#fef2f2' }}>
//                                    <td colSpan="6"><strong style={{ color: '#dc2626' }}>⚠ Difference</strong></td>
//                                    <td colSpan="2" className="text-right" style={{ color: '#dc2626', fontWeight: 700 }}>
//                                        {f(Math.abs(totalCloseDr - totalCloseCr))}
//                                    </td>
//                                </tr>
//                            )}
//                        </tfoot>
//                    </table>
//                </div>
//            )}

//            {!data && !loading && !error && (
//                <div className="rp-no-data">📊 Select date range and click "Generate Report"</div>
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

export default function TrialBalance() {
    const [loading, setLoading] = useState(false);
    const [fromDate, setFromDate] = useState(
        new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
        )
            .toISOString()
            .split("T")[0]
    );

    const [toDate, setToDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    const loggedInUser =
        localStorage.getItem("userName") ||
        localStorage.getItem("username") ||
        localStorage.getItem("fullName") ||
        "Admin User";

    const branchName =
        localStorage.getItem("branchName") || "Main Branch";

    const handleSearch = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await reportApi.getTrialBalance(fromDate, toDate);
            setData(res.data?.data || null);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load trial balance"
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (d) => {
        if (!d) return "";
        const dt = new Date(d);
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        return `${String(dt.getDate()).padStart(2, '0')}-${months[dt.getMonth()]}-${dt.getFullYear()}`;
    };

    const formatNumber = (n) => {
        return new Intl.NumberFormat("en-PK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(n || 0);
    };

    // Calculate totals
    const totalOpenDr = data?.reduce((s, d) => s + (d.openingDebit || 0), 0) || 0;
    const totalOpenCr = data?.reduce((s, d) => s + (d.openingCredit || 0), 0) || 0;
    const totalPeriodDr = data?.reduce((s, d) => s + (d.periodDebit || 0), 0) || 0;
    const totalPeriodCr = data?.reduce((s, d) => s + (d.periodCredit || 0), 0) || 0;
    const totalCloseDr = data?.filter(d => d.closingBalanceType === "Dr").reduce((s, d) => s + (d.closingBalance || 0), 0) || 0;
    const totalCloseCr = data?.filter(d => d.closingBalanceType === "Cr").reduce((s, d) => s + (d.closingBalance || 0), 0) || 0;

    const isBalanced = Math.abs(totalCloseDr - totalCloseCr) < 0.01;

    // ================= PDF =================
    const exportPDF = () => {
        if (!data || data.length === 0) {
            alert("No data available");
            return;
        }

        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const generatedOn = new Date().toLocaleString();

        // ===== HEADER =====
        doc.setFont("helvetica");
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("TRIAL BALANCE REPORT", pageWidth / 2, 12, { align: "center" });

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");

        // Left side
        doc.text(`Branch: ${branchName}`, 4, 20);
        doc.text(`Status: ${isBalanced ? "BALANCED" : "UNBALANCED"}`, 4, 25);
        doc.text(`Total Debit: ${formatNumber(totalCloseDr)}`, 4, 30);
        doc.text(`Total Credit: ${formatNumber(totalCloseCr)}`, 4, 35);

        // Right side
        doc.text(`Period: ${formatDate(fromDate)} to ${formatDate(toDate)}`, pageWidth - 4, 20, { align: "right" });
        doc.text(`Generated By: ${loggedInUser}`, pageWidth - 4, 25, { align: "right" });
        doc.text(`Generated On: ${generatedOn}`, pageWidth - 4, 30, { align: "right" });

        if (!isBalanced) {
            doc.setTextColor(220, 38, 38);
            doc.text(`Difference: ${formatNumber(Math.abs(totalCloseDr - totalCloseCr))}`, pageWidth - 4, 35, { align: "right" });
            doc.setTextColor(0, 0, 0);
        }

        // ===== TABLE BODY =====
        const body = data.map((item, index) => [
            index + 1,
            item.accountCode || "",
            item.accountName || "",
            item.openingDebit > 0 ? formatNumber(item.openingDebit) : "-",
            item.openingCredit > 0 ? formatNumber(item.openingCredit) : "-",
            item.periodDebit > 0 ? formatNumber(item.periodDebit) : "-",
            item.periodCredit > 0 ? formatNumber(item.periodCredit) : "-",
            item.closingBalanceType === "Dr" ? formatNumber(item.closingBalance) : "-",
            item.closingBalanceType === "Cr" ? formatNumber(item.closingBalance) : "-"
        ]);

        // ===== TOTAL ROW =====
        body.push([
            {
                content: "TOTAL",
                colSpan: 3,
                styles: { halign: "right", fontStyle: "bold", fontSize: 8 }
            },
            {
                content: formatNumber(totalOpenDr),
                styles: { halign: "right", fontStyle: "bold", fontSize: 8 }
            },
            {
                content: formatNumber(totalOpenCr),
                styles: { halign: "right", fontStyle: "bold", fontSize: 8 }
            },
            {
                content: formatNumber(totalPeriodDr),
                styles: { halign: "right", fontStyle: "bold", fontSize: 8 }
            },
            {
                content: formatNumber(totalPeriodCr),
                styles: { halign: "right", fontStyle: "bold", fontSize: 8 }
            },
            {
                content: formatNumber(totalCloseDr),
                styles: { halign: "right", fontStyle: "bold", textColor: [220, 38, 38], fontSize: 8 }
            },
            {
                content: formatNumber(totalCloseCr),
                styles: { halign: "right", fontStyle: "bold", textColor: [22, 163, 74], fontSize: 8 }
            }
        ]);

        // ===== TABLE =====
        autoTable(doc, {
            startY: 40,
            head: [["#", "CODE", "ACCOUNT NAME", "OPEN Dr", "OPEN Cr", "PERIOD Dr", "PERIOD Cr", "CLOSE Dr", "CLOSE Cr"]],
            body: body,
            theme: "plain",

            // 🔥🔥🔥 ULTIMATE FULL WIDTH FORCE
            tableWidth: 291,

            styles: {
                font: "helvetica",
                fontSize: 6.5,
                cellPadding: 1.5,
                valign: "middle",
                overflow: "linebreak",
                halign: "left",
                lineWidth: 0,
            },

            headStyles: {
                fillColor: [230, 235, 245],
                textColor: [20, 30, 50],
                fontStyle: "bold",
                halign: "center",
                fontSize: 6.5,
            },

            bodyStyles: {
                textColor: [50, 60, 75],
                fontSize: 6.5,
            },

            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },

            // 🔥 PERCENTAGE WIDTHS (100% total)
            columnStyles: {
                0: { cellWidth: "3%", halign: "center" },
                1: { cellWidth: "8%", halign: "left" },
                2: { cellWidth: "22%" },
                3: { cellWidth: "11%", halign: "right" },
                4: { cellWidth: "11%", halign: "right" },
                5: { cellWidth: "11%", halign: "right" },
                6: { cellWidth: "11%", halign: "right" },
                7: { cellWidth: "11%", halign: "right" },
                8: { cellWidth: "12%", halign: "right" }
            },

            margin: { left: 2, right: 2, top: 5, bottom: 10 },

            didDrawPage: (data) => {
                doc.setFontSize(6.5);
                doc.setTextColor(130, 130, 130);
                doc.text(`Page ${data.pageNumber}`, pageWidth - 6, pageHeight - 5, { align: "right" });
                doc.text(`${loggedInUser} | ${generatedOn}`, 4, pageHeight - 5);
            }
        });

        doc.save(`TrialBalance_${fromDate}_to_${toDate}.pdf`);
    };

    // ================= EXCEL =================
    const exportExcel = () => {
        if (!data || data.length === 0) {
            alert("No data available");
            return;
        }

        const excelData = data.map((item, idx) => ({
            "#": idx + 1,
            CODE: item.accountCode || "",
            "ACCOUNT NAME": item.accountName || "",
            "OPEN Dr": item.openingDebit > 0 ? item.openingDebit : 0,
            "OPEN Cr": item.openingCredit > 0 ? item.openingCredit : 0,
            "PERIOD Dr": item.periodDebit > 0 ? item.periodDebit : 0,
            "PERIOD Cr": item.periodCredit > 0 ? item.periodCredit : 0,
            "CLOSE Dr": item.closingBalanceType === "Dr" ? item.closingBalance : 0,
            "CLOSE Cr": item.closingBalanceType === "Cr" ? item.closingBalance : 0
        }));

        excelData.push({
            "#": "", CODE: "", "ACCOUNT NAME": "TOTAL",
            "OPEN Dr": totalOpenDr, "OPEN Cr": totalOpenCr,
            "PERIOD Dr": totalPeriodDr, "PERIOD Cr": totalPeriodCr,
            "CLOSE Dr": totalCloseDr, "CLOSE Cr": totalCloseCr
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        worksheet["!cols"] = [
            { wch: 6 }, { wch: 16 }, { wch: 45 },
            { wch: 16 }, { wch: 16 }, { wch: 16 },
            { wch: 16 }, { wch: 16 }, { wch: 16 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Trial Balance");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `TrialBalance_${fromDate}_to_${toDate}.xlsx`);
    };

    const handlePrint = () => {
        window.print();
    };

    const filters = (
        <>
            <div className="rp-filter-group">
                <label>From</label>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="rp-filter-group">
                <label>To</label>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <button className="rp-btn-search" onClick={handleSearch} disabled={loading}>
                <FaSearch /> {loading ? "Loading..." : "Generate Report"}
            </button>
        </>
    );

    const exportButtons = data && data.length > 0 ? (
        <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={exportPDF} style={{ background: "#dc2626", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                <FaFilePdf /> PDF
            </button>
            <button onClick={exportExcel} style={{ background: "#16a34a", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                <FaFileExcel /> Excel
            </button>
            <button onClick={handlePrint} style={{ background: "#475569", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                <FaPrint /> Print
            </button>
        </div>
    ) : null;

    return (
        <ReportTemplate
            title="TRIAL BALANCE"
            subtitle={isBalanced ? "✅ Debit = Credit — Balanced" : "⚠️ Unbalanced — Check Entries"}
            filters={filters}
            printedBy={loggedInUser}
            extraActions={exportButtons}
            metaFields={data ? [
                { label: "Period", value: `${formatDate(fromDate)} → ${formatDate(toDate)}` },
                { label: "Status", value: isBalanced ? "✅ Balanced" : "⚠️ Unbalanced" },
                { label: "Total Debit", value: formatNumber(totalCloseDr) },
                { label: "Total Credit", value: formatNumber(totalCloseCr) },
                { label: "Difference", value: formatNumber(Math.abs(totalCloseDr - totalCloseCr)) },
                { label: "Accounts", value: data.length }
            ] : null}
        >
            {error && <div className="rp-error">⚠ {error}</div>}
            {loading && <div className="rp-no-data">⏳ Loading trial balance...</div>}

            {data && !loading && (
                <div style={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "14px",
                    overflow: "hidden",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                    width: "100%"
                }}>
                    <div style={{ overflowX: "auto", width: "100%" }}>
                        <table style={{
                            width: "100%",
                            borderCollapse: "separate",
                            borderSpacing: 0,
                            fontSize: "clamp(10px, 1.2vw, 12px)",
                            fontFamily: "'Segoe UI', sans-serif",
                            tableLayout: "auto"
                        }}>
                            <thead>
                                <tr style={{ background: "#f8fafc" }}>
                                    <th style={thStyle("3%", "center")}>#</th>
                                    <th style={thStyle("10%", "left")}>CODE</th>
                                    <th style={thStyle("22%", "left")}>ACCOUNT NAME</th>
                                    <th style={thStyle("10%", "right")}>OPEN Dr</th>
                                    <th style={thStyle("10%", "right")}>OPEN Cr</th>
                                    <th style={thStyle("10%", "right")}>PERIOD Dr</th>
                                    <th style={thStyle("10%", "right")}>PERIOD Cr</th>
                                    <th style={thStyle("12%", "right")}>CLOSE Dr</th>
                                    <th style={thStyle("13%", "right")}>CLOSE Cr</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? data.map((item, idx) => (
                                    <tr key={idx} style={{ background: idx % 2 === 0 ? "#ffffff" : "#f9fbfd" }}>
                                        <td style={tdStyle("center", "#475569")}>{idx + 1}</td>
                                        <td style={tdStyle("left", "#0f172a", false, false, true)}>{item.accountCode}</td>
                                        <td style={tdStyle("left", "#334155", false, true)}>{item.accountName}</td>
                                        <td style={tdStyle("right", item.openingDebit > 0 ? "#0f172a" : "#94a3b8", true)}>
                                            {formatNumber(item.openingDebit)}
                                        </td>
                                        <td style={tdStyle("right", item.openingCredit > 0 ? "#0f172a" : "#94a3b8", true)}>
                                            {formatNumber(item.openingCredit)}
                                        </td>
                                        <td style={tdStyle("right", item.periodDebit > 0 ? "#0f172a" : "#94a3b8", true)}>
                                            {formatNumber(item.periodDebit)}
                                        </td>
                                        <td style={tdStyle("right", item.periodCredit > 0 ? "#0f172a" : "#94a3b8", true)}>
                                            {formatNumber(item.periodCredit)}
                                        </td>
                                        <td style={tdStyle("right", item.closingBalanceType === "Dr" ? "#dc2626" : "#94a3b8", true, false, true)}>
                                            {item.closingBalanceType === "Dr" ? formatNumber(item.closingBalance) : "-"}
                                        </td>
                                        <td style={tdStyle("right", item.closingBalanceType === "Cr" ? "#16a34a" : "#94a3b8", true, false, true)}>
                                            {item.closingBalanceType === "Cr" ? formatNumber(item.closingBalance) : "-"}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={9} style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                                            No accounts found with transactions
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: "#f1f5f9" }}>
                                    <td colSpan={3} style={tfStyle("right")}>TOTAL</td>
                                    <td style={tfStyle("right")}>{formatNumber(totalOpenDr)}</td>
                                    <td style={tfStyle("right")}>{formatNumber(totalOpenCr)}</td>
                                    <td style={tfStyle("right")}>{formatNumber(totalPeriodDr)}</td>
                                    <td style={tfStyle("right")}>{formatNumber(totalPeriodCr)}</td>
                                    <td style={tfStyle("right", "#dc2626")}>{formatNumber(totalCloseDr)}</td>
                                    <td style={tfStyle("right", "#16a34a")}>{formatNumber(totalCloseCr)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {!data && !loading && !error && (
                <div className="rp-no-data">📊 Select date range and click "Generate Report"</div>
            )}
        </ReportTemplate>
    );
}

// ========== STYLE HELPERS ==========
const thStyle = (width, align) => ({
    padding: "14px 10px",
    borderBottom: "2px solid #e2e8f0",
    textAlign: align,
    color: "#0f172a",
    fontWeight: "700",
    whiteSpace: "nowrap",
    fontSize: "11px",
    width: width,
    textTransform: "uppercase",
    letterSpacing: "0.5px"
});

const tdStyle = (align, color = "#334155", nowrap = false, wordBreak = false, bold = false) => ({
    padding: "10px 10px",
    borderBottom: "1px solid #edf2f7",
    textAlign: align,
    color: color,
    fontWeight: bold ? 600 : 400,
    whiteSpace: nowrap ? "nowrap" : "normal",
    wordBreak: wordBreak ? "break-word" : "normal",
    fontSize: "12px",
    fontVariantNumeric: align === "right" ? "tabular-nums" : "normal"
});

const tfStyle = (align, color = "#0f172a") => ({
    padding: "14px 10px",
    borderTop: "2px solid #dbe3ea",
    textAlign: align,
    fontWeight: "700",
    color: color,
    fontSize: "12px"
});