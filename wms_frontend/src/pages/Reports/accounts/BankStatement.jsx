//import React, { useState, useEffect } from "react";
//import reportApi from "../../../api/reportApi";
//import { getCoaTree } from "../../../api/coaApi";
//import { FaSearch, FaChevronDown, FaChevronRight } from "react-icons/fa";
//import ReportTemplate from "../ReportTemplate";

//export default function BankStatement() {
//    const [loading, setLoading] = useState(false);
//    const [banks, setBanks] = useState([]);
//    const [selectedBank, setSelectedBank] = useState("");
//    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
//    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
//    const [data, setData] = useState(null);
//    const [error, setError] = useState("");
//    const [expanded, setExpanded] = useState({});

//    useEffect(() => { loadBanks(); }, []);

//    const loadBanks = async () => {
//        try {
//            const res = await getCoaTree();
//            let list = [];
//            const flatten = (tree) => {
//                for (const acc of tree) {
//                    const id = acc.acctID || acc.AcctID || acc.id;
//                    const code = acc.AcctCode || acc.acctCode || acc.code || "";
//                    const name = acc.AcctName || acc.acctName || acc.name || "";
//                    const cat = (acc.AccountCategory || acc.accountCategory || acc.account_category || "").trim();
//                    const leaf = acc.acctLast || acc.AcctLast || acc.isLeaf;

//                    // ✅ Multiple checks for Bank category
//                    const isBank = cat === "Bank" || cat === "Cash & Bank" || cat === "Cash & Bank";

//                    if (leaf && isBank && id) {
//                        list.push({ acctID: id, label: `${code} - ${name}` });
//                    }
//                    if (acc.children?.length) flatten(acc.children);
//                }
//            };
//            flatten(res.data?.data || res.data || []);
//            console.log("Banks loaded:", list); // Debug
//            setBanks(list);
//        } catch (err) {
//            console.error("Bank load error:", err);
//        }
//    };

//    const handleSearch = async () => {
//        setLoading(true); setError("");
//        try {
//            const res = await reportApi.getBankStatement(fromDate, toDate, selectedBank || null);
//            setData(res.data?.data || null);
//            setExpanded({});
//        } catch (err) { setError(err.response?.data?.message || "Failed"); }
//        finally { setLoading(false); }
//    };

//    const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
//    const formatDt = (d) => { if (!d) return ""; const dt = new Date(d); const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return `${String(dt.getDate()).padStart(2, '0')}-${m[dt.getMonth()]}-${dt.getFullYear()}`; };
//    const f = (n) => new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

//    const filters = (
//        <>
//            <div className="rp-filter-group"><label>From</label><input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
//            <div className="rp-filter-group"><label>To</label><input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
//            <div className="rp-filter-group" style={{ flex: 1, minWidth: 200 }}><label>Bank Account</label><select value={selectedBank} onChange={e => setSelectedBank(e.target.value)}><option value="">All Banks</option>{banks.map(b => <option key={b.acctID} value={b.acctID}>{b.label}</option>)}</select></div>
//            <button className="rp-btn-search" onClick={handleSearch} disabled={loading}><FaSearch /> {loading ? "Loading..." : "Generate"}</button>
//        </>
//    );

//    return (
//        <ReportTemplate title="BANK STATEMENT" subtitle="Bank-wise transaction statement" filters={filters} printedBy="admin">
//            {error && <div className="rp-error">⚠ {error}</div>}
//            {loading && <div className="rp-no-data">⏳ Loading...</div>}

//            {data && !loading && data.map((bank) => (
//                <div key={bank.accountId} style={{ marginBottom: 24 }}>
//                    <div style={{ display: 'flex', gap: 16, padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafbfc', marginBottom: 4, cursor: 'pointer' }} onClick={() => toggleExpand(bank.accountId)}>
//                        <div style={{ flex: 2 }}><strong>{bank.accountCode} - {bank.accountName}</strong></div>
//                        <div style={{ flex: 1 }}>Opening: {f(bank.openingBalance)} {bank.openingBalanceType}</div>
//                        <div style={{ flex: 1 }}>Closing: {f(bank.closingBalance)} {bank.closingBalanceType}</div>
//                        <div style={{ width: 24, textAlign: 'center', color: '#2563eb' }}>{expanded[bank.accountId] ? <FaChevronDown /> : <FaChevronRight />}</div>
//                    </div>
//                    {expanded[bank.accountId] && (
//                        <div className="rp-table-wrapper">
//                            <table className="rp-table" style={{ fontSize: 10 }}>
//                                <thead><tr><th>Date</th><th>Voucher</th><th>Type</th><th>Description</th><th className="text-right">Debit</th><th className="text-right">Credit</th><th className="text-right">Balance</th></tr></thead>
//                                <tbody>
//                                    {bank.transactions?.length > 0 ? bank.transactions.map((t, i) => (
//                                        <tr key={i}>
//                                            <td>{formatDt(t.date)}</td><td>{t.voucherNo}</td>
//                                            <td><span className={`badge ${t.type === 'RECEIVING' ? 'badge-receipt' : 'badge-payment'}`}>{t.type === 'RECEIVING' ? 'Receipt' : 'Payment'}</span></td>
//                                            <td>{t.description}</td>
//                                            <td className="text-right debit">{t.debit > 0 ? f(t.debit) : '-'}</td>
//                                            <td className="text-right credit">{t.credit > 0 ? f(t.credit) : '-'}</td>
//                                            <td className="text-right balance">{f(t.balance)}</td>
//                                        </tr>
//                                    )) : <tr><td colSpan="7" className="rp-no-data">No transactions</td></tr>}
//                                </tbody>
//                            </table>
//                        </div>
//                    )}
//                </div>
//            ))}

//            {!data && !loading && !error && <div className="rp-no-data">📊 Select filters and click "Generate Report"</div>}
//        </ReportTemplate>
//    );
//}


import React, { useState, useEffect } from "react";
import reportApi from "../../../api/reportApi";
import { getCoaTree } from "../../../api/coaApi";
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

export default function BankStatement() {
    const [loading, setLoading] = useState(false);
    const [banks, setBanks] = useState([]);
    const [selectedBank, setSelectedBank] = useState("");
    const [fromDate, setFromDate] = useState(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    );
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [allData, setAllData] = useState([]);
    const [error, setError] = useState("");

    const loggedInUser =
        localStorage.getItem("userName") ||
        localStorage.getItem("username") ||
        localStorage.getItem("fullName") ||
        "Admin User";

    const branchName = localStorage.getItem("branchName") || "Main Branch";

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
                    const isBank = cat === "Bank" || cat === "Cash & Bank";

                    if (leaf && isBank && id) {
                        list.push({ acctID: id, label: `${code} - ${name}` });
                    }
                    if (acc.children?.length) flatten(acc.children);
                }
            };
            flatten(res.data?.data || res.data || []);
            setBanks(list);
        } catch (err) {
            console.error("Bank load error:", err);
        }
    };

    const handleSearch = async () => {
        if (!selectedBank) {
            setError("Please select a bank account");
            return;
        }
        setLoading(true); setError("");
        try {
            const res = await reportApi.getBankStatement(fromDate, toDate, selectedBank || null);
            let rawData = res.data?.data || [];

            // Sort transactions and recalculate balance
            const fixedData = rawData.map(bank => {
                if (!bank.transactions?.length) return bank;
                const sorted = [...bank.transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
                let balance = bank.openingBalance || 0;
                const recalculated = sorted.map(t => {
                    balance = balance + (t.debit || 0) - (t.credit || 0);
                    return { ...t, balance };
                });
                return { ...bank, transactions: recalculated };
            });

            setAllData(fixedData);
        } catch (err) {
            setError(err.response?.data?.message || "Failed");
        } finally { setLoading(false); }
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

    const allTransactions = allData.reduce((acc, bank) => {
        if (bank.transactions?.length) {
            for (const t of bank.transactions) {
                acc.push({
                    bankCode: bank.accountCode, bankName: bank.accountName,
                    date: t.date, voucherNo: t.voucherNo, type: t.type,
                    description: t.description || "-", debit: t.debit || 0,
                    credit: t.credit || 0, balance: t.balance || 0
                });
            }
        }
        return acc;
    }, []);

    const totalDebit = allTransactions.reduce((s, t) => s + t.debit, 0);
    const totalCredit = allTransactions.reduce((s, t) => s + t.credit, 0);
    const selectedBankData = allData.length > 0 ? allData[0] : null;

    // ================= PDF =================
    const exportPDF = () => {
        if (allTransactions.length === 0) { alert("No data available"); return; }

        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const generatedOn = new Date().toLocaleString();

        const bankLabel = selectedBank
            ? banks.find(b => b.acctID == selectedBank)?.label || "Selected Bank"
            : "All Banks";

        doc.setFont("helvetica");
        doc.setFontSize(16); doc.setFont("helvetica", "bold");
        doc.text("BANK STATEMENT REPORT", pageWidth / 2, 12, { align: "center" });

        doc.setFontSize(7); doc.setFont("helvetica", "normal");
        doc.text(`Branch: ${branchName}`, 4, 20);
        doc.text(`Bank: ${bankLabel}`, 4, 25);
        if (selectedBankData) {
            doc.text(`Opening: ${formatNumber(selectedBankData.openingBalance)} ${selectedBankData.openingBalanceType}`, 4, 30);
            doc.text(`Closing: ${formatNumber(selectedBankData.closingBalance)} ${selectedBankData.closingBalanceType}`, 4, 35);
        }
        doc.text(`Period: ${fromDate} to ${toDate}`, pageWidth - 4, 20, { align: "right" });
        doc.text(`Generated By: ${loggedInUser}`, pageWidth - 4, 25, { align: "right" });
        doc.text(`Generated On: ${generatedOn}`, pageWidth - 4, 30, { align: "right" });

        const body = allTransactions.map((t, i) => [
            i + 1, formatDate(t.date), t.voucherNo,
            t.type === 'RECEIVING' ? 'Receipt' : 'Payment',
            t.description,
            t.debit > 0 ? formatNumber(t.debit) : "-",
            t.credit > 0 ? formatNumber(t.credit) : "-",
            formatNumber(t.balance)
        ]);

        body.push([
            { content: "TOTAL", colSpan: 5, styles: { halign: "right", fontStyle: "bold", fontSize: 8 } },
            { content: formatNumber(totalDebit), styles: { halign: "right", fontStyle: "bold", textColor: [220, 38, 38], fontSize: 8 } },
            { content: formatNumber(totalCredit), styles: { halign: "right", fontStyle: "bold", textColor: [22, 163, 74], fontSize: 8 } },
            { content: selectedBankData ? `${formatNumber(selectedBankData.closingBalance)} ${selectedBankData.closingBalanceType}` : "", styles: { halign: "right", fontStyle: "bold", fontSize: 8 } }
        ]);

        autoTable(doc, {
            startY: 40,
            head: [["#", "DATE", "VOUCHER", "TYPE", "DESCRIPTION", "DEBIT", "CREDIT", "BALANCE"]],
            body: body,
            theme: "plain",

            // 🔥 FORCE EXACT FULL WIDTH
            tableWidth: 291,
            tableLineColor: [255, 255, 255],
            tableLineWidth: 0,

            styles: {
                font: "helvetica",
                fontSize: 7,
                cellPadding: 2,
                valign: "middle",
                overflow: "hidden",
                halign: "left",
                lineWidth: 0,
            },

            headStyles: {
                fillColor: [230, 235, 245],
                textColor: [20, 30, 50],
                fontStyle: "bold",
                halign: "center",
                fontSize: 7.5,
                lineWidth: 0,
            },

            bodyStyles: {
                textColor: [50, 60, 75],
                fontSize: 7,
                lineWidth: 0,
            },

            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },

            // 🔥 8 COLUMNS = 291mm TOTAL
            columnStyles: {
                0: { cellWidth: 10, halign: "center" },      // # = 10mm
                1: { cellWidth: 24, halign: "center" },       // DATE = 24mm
                2: { cellWidth: 42 },                          // VOUCHER = 42mm
                3: { cellWidth: 20, halign: "center" },       // TYPE = 20mm
                4: { cellWidth: 85 },                          // DESCRIPTION = 85mm
                5: { cellWidth: 35, halign: "right" },        // DEBIT = 35mm
                6: { cellWidth: 35, halign: "right" },        // CREDIT = 35mm
                7: { cellWidth: 40, halign: "right" }         // BALANCE = 40mm
            },
            // TOTAL: 10+24+42+20+85+35+35+40 = 291mm ✅

            margin: { left: 3, right: 3, top: 5, bottom: 10 },

            didDrawPage: (data) => {
                doc.setFontSize(6.5);
                doc.setTextColor(130, 130, 130);
                doc.text(`Page ${data.pageNumber}`, pageWidth - 6, pageHeight - 5, { align: "right" });
                doc.text(`${loggedInUser} | ${generatedOn}`, 4, pageHeight - 5);
            }
        });

        doc.save(`BankStatement_${fromDate}_to_${toDate}.pdf`);
    };

    // ================= EXCEL =================
    const exportExcel = () => {
        if (allTransactions.length === 0) { alert("No data available"); return; }
        const excelData = allTransactions.map((t, i) => ({
            "#": i + 1, DATE: formatDate(t.date), VOUCHER: t.voucherNo,
            TYPE: t.type === 'RECEIVING' ? 'Receipt' : 'Payment',
            DESCRIPTION: t.description,
            DEBIT: t.debit > 0 ? t.debit : 0, CREDIT: t.credit > 0 ? t.credit : 0, BALANCE: t.balance
        }));
        excelData.push({ "#": "", DATE: "", VOUCHER: "", TYPE: "TOTAL", DESCRIPTION: "", DEBIT: totalDebit, CREDIT: totalCredit, BALANCE: selectedBankData ? selectedBankData.closingBalance : 0 });
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        worksheet["!cols"] = [{ wch: 6 }, { wch: 16 }, { wch: 30 }, { wch: 14 }, { wch: 55 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bank Statement");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `BankStatement_${fromDate}_to_${toDate}.xlsx`);
    };

    const handlePrint = () => { window.print(); };

    const getBadgeStyle = (type) => ({
        display: "inline-block", padding: "3px 8px", borderRadius: "12px",
        fontSize: "clamp(9px, 1vw, 10px)", fontWeight: 600, whiteSpace: "nowrap",
        background: type === 'RECEIVING' ? "#d1fae5" : "#fef3c7",
        color: type === 'RECEIVING' ? "#065f46" : "#92400e"
    });

    const filters = (
        <>
            <div className="rp-filter-group"><label>From</label><input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
            <div className="rp-filter-group"><label>To</label><input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
            <div className="rp-filter-group" style={{ flex: 1, minWidth: 220 }}>
                <label>Bank Account</label>
                <select value={selectedBank} onChange={e => setSelectedBank(e.target.value)}>
                    <option value="">Select Bank</option>
                    {banks.map(b => <option key={b.acctID} value={b.acctID}>{b.label}</option>)}
                </select>
            </div>
            <button className="rp-btn-search" onClick={handleSearch} disabled={loading}><FaSearch /> {loading ? "Loading..." : "Generate"}</button>
        </>
    );

    const exportButtons = allTransactions.length > 0 ? (
        <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={exportPDF} style={{ background: "#dc2626", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}><FaFilePdf /> PDF</button>
            <button onClick={exportExcel} style={{ background: "#16a34a", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}><FaFileExcel /> Excel</button>
            <button onClick={handlePrint} style={{ background: "#475569", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}><FaPrint /> Print</button>
        </div>
    ) : null;

    return (
        <ReportTemplate title="BANK STATEMENT" subtitle="Bank-wise transaction statement" filters={filters} printedBy={loggedInUser}
            extraActions={exportButtons}
            metaFields={selectedBankData ? [
                { label: "Bank", value: `${selectedBankData.accountCode} - ${selectedBankData.accountName}` },
                { label: "Opening", value: `${formatNumber(selectedBankData.openingBalance)} ${selectedBankData.openingBalanceType}` },
                { label: "Closing", value: `${formatNumber(selectedBankData.closingBalance)} ${selectedBankData.closingBalanceType}` },
                { label: "Total Debit", value: formatNumber(totalDebit) },
                { label: "Total Credit", value: formatNumber(totalCredit) },
                { label: "Transactions", value: allTransactions.length }
            ] : null}
        >
            {error && <div className="rp-error">⚠ {error}</div>}
            {loading && <div className="rp-no-data">⏳ Loading...</div>}

            {allTransactions.length > 0 && !loading && (
                <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", width: "100%" }}>
                    <div style={{ overflowX: "auto", width: "100%" }}>
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "clamp(10px, 1.2vw, 12px)", fontFamily: "'Segoe UI', sans-serif", tableLayout: "auto" }}>
                            <thead>
                                <tr style={{ background: "#f8fafc" }}>
                                    <th style={thStyle("3%", "center")}>#</th>
                                    <th style={thStyle("10%", "center")}>DATE</th>
                                    <th style={thStyle("14%", "left")}>VOUCHER</th>
                                    <th style={thStyle("8%", "center")}>TYPE</th>
                                    <th style={thStyle("28%", "left")}>DESCRIPTION</th>
                                    <th style={thStyle("12%", "right")}>DEBIT</th>
                                    <th style={thStyle("12%", "right")}>CREDIT</th>
                                    <th style={thStyle("13%", "right")}>BALANCE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allTransactions.map((t, idx) => (
                                    <tr key={idx} style={{ background: idx % 2 === 0 ? "#ffffff" : "#f9fbfd" }}>
                                        <td style={tdStyle("center", "#475569")}>{idx + 1}</td>
                                        <td style={tdStyle("center", "#475569", true)}>{formatDate(t.date)}</td>
                                        <td style={tdStyle("left", "#334155", false, true)}>{t.voucherNo}</td>
                                        <td style={tdStyle("center")}>
                                            <span style={getBadgeStyle(t.type)}>
                                                {t.type === 'RECEIVING' ? 'Receipt' : 'Payment'}
                                            </span>
                                        </td>
                                        <td style={tdStyle("left", "#334155", false, true)}>{t.description}</td>
                                        <td style={tdStyle("right", t.debit > 0 ? "#dc2626" : "#64748b", true, false, true)}>
                                            {t.debit > 0 ? formatNumber(t.debit) : "-"}
                                        </td>
                                        <td style={tdStyle("right", t.credit > 0 ? "#16a34a" : "#64748b", true, false, true)}>
                                            {t.credit > 0 ? formatNumber(t.credit) : "-"}
                                        </td>
                                        <td style={tdStyle("right", "#0f172a", true, false, true)}>{formatNumber(t.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: "#f1f5f9" }}>
                                    <td colSpan={5} style={tfStyle("right")}>TOTAL</td>
                                    <td style={tfStyle("right", "#dc2626")}>{formatNumber(totalDebit)}</td>
                                    <td style={tfStyle("right", "#16a34a")}>{formatNumber(totalCredit)}</td>
                                    <td style={tfStyle("right", "#0f172a")}>
                                        {selectedBankData ? `${formatNumber(selectedBankData.closingBalance)} ${selectedBankData.closingBalanceType}` : ""}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {allTransactions.length === 0 && !loading && !error && (
                <div className="rp-no-data">📊 Select bank and click "Generate Report"</div>
            )}
        </ReportTemplate>
    );
}

// ========== STYLE HELPERS ==========
const thStyle = (width, align) => ({
    padding: "14px 10px", borderBottom: "2px solid #e2e8f0", textAlign: align,
    color: "#0f172a", fontWeight: "700", whiteSpace: "nowrap",
    fontSize: "11px", width: width, textTransform: "uppercase", letterSpacing: "0.5px"
});

const tdStyle = (align, color = "#334155", nowrap = false, wordBreak = false, bold = false) => ({
    padding: "10px 10px", borderBottom: "1px solid #edf2f7", textAlign: align,
    color: color, fontWeight: bold ? 600 : 400,
    whiteSpace: nowrap ? "nowrap" : "normal", wordBreak: wordBreak ? "break-word" : "normal",
    fontSize: "12px", fontVariantNumeric: align === "right" ? "tabular-nums" : "normal"
});

const tfStyle = (align, color = "#0f172a") => ({
    padding: "14px 10px", borderTop: "2px solid #dbe3ea", textAlign: align,
    fontWeight: "700", color: color, fontSize: "12px"
});