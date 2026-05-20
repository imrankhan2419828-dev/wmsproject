//import React, { useState, useEffect } from "react";
//import reportApi from "../../../api/reportApi";
//import { getCoaTree } from "../../../api/coaApi";
//import { FaSearch, FaChevronDown, FaChevronRight } from "react-icons/fa";
//import ReportTemplate from "../ReportTemplate";

//export default function SupplierStatement() {
//    const [loading, setLoading] = useState(false);
//    const [suppliers, setSuppliers] = useState([]);
//    const [selectedSupplier, setSelectedSupplier] = useState("");
//    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
//    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
//    const [data, setData] = useState(null);
//    const [error, setError] = useState("");
//    const [expanded, setExpanded] = useState({});

//    useEffect(() => { loadSuppliers(); }, []);

//    const loadSuppliers = async () => {
//        try {
//            const res = await getCoaTree();
//            let list = [];
//            const flatten = (tree) => {
//                for (const acc of tree) {
//                    const cat = acc.accountCategory || acc.AccountCategory || "";
//                    const leaf = acc.acctLast || acc.AcctLast;
//                    if (leaf && cat === "Supplier" && (acc.acctID || acc.AcctID)) {
//                        list.push({ acctID: acc.acctID || acc.AcctID, label: `${acc.AcctCode || acc.acctCode || ""} - ${acc.AcctName || acc.acctName || ""}` });
//                    }
//                    if (acc.children?.length) flatten(acc.children);
//                }
//            };
//            flatten(res.data?.data || res.data || []);
//            setSuppliers(list);
//        } catch (err) { }
//    };

//    const handleSearch = async () => {
//        setLoading(true); setError("");
//        try {
//            const res = await reportApi.getSupplierStatement(fromDate, toDate, selectedSupplier ? parseInt(selectedSupplier) : null);
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
//            <div className="rp-filter-group" style={{ flex: 1, minWidth: 200 }}><label>Supplier</label><select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}><option value="">All Suppliers</option>{suppliers.map(s => <option key={s.acctID} value={s.acctID}>{s.label}</option>)}</select></div>
//            <button className="rp-btn-search" onClick={handleSearch} disabled={loading}><FaSearch /> {loading ? "Loading..." : "Generate Report"}</button>
//        </>
//    );

//    return (
//        <ReportTemplate title="SUPPLIER STATEMENT" subtitle="Detailed transaction-wise supplier report" filters={filters} printedBy="admin">
//            {error && <div className="rp-error">⚠ {error}</div>}
//            {loading && <div className="rp-no-data">⏳ Loading...</div>}

//            {data && !loading && data.map((supp) => (
//                <div key={supp.supplierId} style={{ marginBottom: 24 }}>
//                    <div style={{ display: 'flex', gap: '20px', marginBottom: 10, border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px', background: '#fafbfc' }}>
//                        <div style={{ flex: 1 }}>
//                            <div style={rsb}><span style={ls}>Supplier</span><span style={vs}>{supp.supplierCode} - {supp.supplierName}</span></div>
//                            <div style={rsb}><span style={ls}>Opening</span><span style={vs}>{f(supp.openingBalance)} {supp.openingBalanceType}</span></div>
//                            <div style={rs}><span style={ls}>Closing</span><span style={vs}>{f(supp.closingBalance)} {supp.closingBalanceType}</span></div>
//                        </div>
//                        <div style={{ flex: 1 }}>
//                            <div style={rsb}><span style={ls}>Total Debit</span><span style={vs}>{f(supp.totalDebit)}</span></div>
//                            <div style={rsb}><span style={ls}>Total Credit</span><span style={vs}>{f(supp.totalCredit)}</span></div>
//                            <div style={{ ...rs, cursor: 'pointer' }} onClick={() => toggleExpand(supp.supplierId)}>
//                                <span style={ls}>Transactions</span>
//                                <span style={{ ...vs, color: '#2563eb' }}>{expanded[supp.supplierId] ? <FaChevronDown /> : <FaChevronRight />} {supp.transactions?.length || 0}</span>
//                            </div>
//                        </div>
//                    </div>

//                    {expanded[supp.supplierId] && (
//                        <div className="rp-table-wrapper">
//                            <table className="rp-table" style={{ fontSize: 10 }}>
//                                <thead><tr><th>Date</th><th>Voucher</th><th>Type</th><th>Item/Model</th><th className="text-center">Qty</th><th className="text-right">Rate</th><th className="text-right">Debit</th><th className="text-right">Credit</th><th className="text-right">Balance</th></tr></thead>
//                                <tbody>
//                                    {supp.transactions?.length > 0 ? supp.transactions.map((t, i) => (
//                                        <tr key={i}>
//                                            <td>{formatDt(t.date)}</td><td>{t.voucherNo}</td>
//                                            <td><span className={`badge ${t.type === 'PURCHASE' ? 'badge-purchase' : t.type === 'PURCHASE_RETURN' ? 'badge-return' : 'badge-payment'}`}>{t.type === 'PURCHASE' ? 'Purchase' : t.type === 'PURCHASE_RETURN' ? 'Return' : 'Payment'}</span></td>
//                                            <td>{t.itemName}{t.model ? ` (${t.model})` : ''}</td>
//                                            <td className="text-center">{t.quantity > 0 ? t.quantity : '-'}</td>
//                                            <td className="text-right">{t.rate > 0 ? f(t.rate) : '-'}</td>
//                                            <td className="text-right debit">{t.debit > 0 ? f(t.debit) : '-'}</td>
//                                            <td className="text-right credit">{t.credit > 0 ? f(t.credit) : '-'}</td>
//                                            <td className="text-right balance">{f(t.balance)}</td>
//                                        </tr>
//                                    )) : <tr><td colSpan="9" className="rp-no-data">No transactions</td></tr>}
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

//const rsb = { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dotted #e0e0e0', fontSize: 13 };
//const rs = { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 };
//const ls = { fontWeight: 600, color: '#64748b' };
//const vs = { fontWeight: 700, color: '#1e293b' };


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

export default function SupplierStatement() {
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState("");
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

    const [allData, setAllData] = useState([]);
    const [error, setError] = useState("");

    const loggedInUser =
        localStorage.getItem("userName") ||
        localStorage.getItem("username") ||
        localStorage.getItem("fullName") ||
        "Admin User";

    const branchName =
        localStorage.getItem("branchName") || "Main Branch";

    useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async () => {
        try {
            const res = await getCoaTree();
            let list = [];

            const flatten = (tree) => {
                for (const acc of tree) {
                    const id =
                        acc.acctID ||
                        acc.AcctID ||
                        acc.id;

                    const code =
                        acc.AcctCode ||
                        acc.acctCode ||
                        acc.code ||
                        "";

                    const name =
                        acc.AcctName ||
                        acc.acctName ||
                        acc.name ||
                        "";

                    const leaf =
                        acc.acctLast ||
                        acc.AcctLast ||
                        acc.isLeaf;

                    const cat = (
                        acc.AccountCategory ||
                        acc.accountCategory ||
                        ""
                    ).trim();

                    if (
                        leaf &&
                        cat === "Supplier" &&
                        id
                    ) {
                        list.push({
                            acctID: id,
                            label: `${code} - ${name}`
                        });
                    }

                    if (acc.children?.length) {
                        flatten(acc.children);
                    }
                }
            };

            flatten(
                res.data?.data || res.data || []
            );

            setSuppliers(list);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = async () => {
        if (!selectedSupplier) {
            setError("Please select a supplier");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await reportApi.getSupplierStatement(
                fromDate,
                toDate,
                selectedSupplier ? parseInt(selectedSupplier) : null
            );

            let rawData = res.data?.data || [];

            const fixedData = rawData.map(supplier => {
                if (!supplier.transactions?.length) return supplier;

                const sortedTransactions = [...supplier.transactions].sort((a, b) => {
                    const dateCompare = new Date(a.date) - new Date(b.date);
                    if (dateCompare !== 0) return dateCompare;

                    const typePriority = {
                        'PURCHASE': 1,
                        'PURCHASE_RETURN': 2,
                        'PAYMENT': 3,
                        'RECEIPT': 4
                    };

                    const typeCompare = (typePriority[a.type] || 5) - (typePriority[b.type] || 5);
                    if (typeCompare !== 0) return typeCompare;

                    return (a.voucherNo || '').localeCompare(b.voucherNo || '');
                });

                let runningBalance = supplier.openingBalance || 0;
                const recalculatedTransactions = sortedTransactions.map(t => {
                    runningBalance = runningBalance + (t.credit || 0) - (t.debit || 0);
                    return {
                        ...t,
                        balance: runningBalance
                    };
                });

                return {
                    ...supplier,
                    transactions: recalculatedTransactions
                };
            });

            setAllData(fixedData);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load statement");
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

    const allTransactions = allData.reduce(
        (acc, supp) => {
            if (supp.transactions?.length) {
                for (const t of supp.transactions) {
                    acc.push({
                        supplierCode: supp.supplierCode,
                        supplierName: supp.supplierName,
                        date: t.date,
                        voucherNo: t.voucherNo,
                        type: t.type,
                        itemName: t.itemName || "-",
                        model: t.model || "",
                        quantity: t.quantity || 0,
                        rate: t.rate || 0,
                        debit: t.debit || 0,
                        credit: t.credit || 0,
                        balance: t.balance || 0
                    });
                }
            }
            return acc;
        },
        []
    );

    const totalDebit = allTransactions.reduce((sum, t) => sum + t.debit, 0);
    const totalCredit = allTransactions.reduce((sum, t) => sum + t.credit, 0);
    const selectedSupplierData = allData.length > 0 ? allData[0] : null;

    // ================= PDF =================
    const exportPDF = () => {
        if (allTransactions.length === 0) {
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

        const supplierLabel = selectedSupplier
            ? suppliers.find((s) => s.acctID == selectedSupplier)?.label || "Selected Supplier"
            : "All Suppliers";

        // ===== HEADER =====
        doc.setFont("helvetica");
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("SUPPLIER STATEMENT REPORT", pageWidth / 2, 12, {
            align: "center"
        });

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");

        // Left side
        doc.text(`Branch: ${branchName}`, 4, 20);
        doc.text(`Supplier: ${supplierLabel}`, 4, 25);

        if (selectedSupplierData) {
            doc.text(
                `Opening: ${formatNumber(selectedSupplierData.openingBalance)} ${selectedSupplierData.openingBalanceType}`,
                4,
                30
            );

            doc.text(
                `Closing: ${formatNumber(selectedSupplierData.closingBalance)} ${selectedSupplierData.closingBalanceType}`,
                4,
                35
            );
        }

        // Right side
        doc.text(
            `Period: ${fromDate} to ${toDate}`,
            pageWidth - 4,
            20,
            { align: "right" }
        );

        doc.text(
            `Generated By: ${loggedInUser}`,
            pageWidth - 4,
            25,
            { align: "right" }
        );

        doc.text(
            `Generated On: ${generatedOn}`,
            pageWidth - 4,
            30,
            { align: "right" }
        );

        // ===== TABLE BODY =====
        const body = allTransactions.map((t, index) => [
            index + 1,
            formatDate(t.date),
            t.voucherNo,
            t.type === "PURCHASE"
                ? "Purchase"
                : t.type === "PURCHASE_RETURN"
                    ? "Return"
                    : "Payment",

            t.itemName + (t.model ? ` (${t.model})` : ""),

            t.quantity > 0 ? t.quantity : "-",
            t.rate > 0 ? formatNumber(t.rate) : "-",
            t.debit > 0 ? formatNumber(t.debit) : "-",
            t.credit > 0 ? formatNumber(t.credit) : "-",
            formatNumber(t.balance)
        ]);

        // ===== TOTAL ROW =====
        body.push([
            {
                content: "TOTAL",
                colSpan: 7,
                styles: {
                    halign: "right",
                    fontStyle: "bold",
                    fontSize: 8
                }
            },
            {
                content: formatNumber(totalDebit),
                styles: {
                    halign: "right",
                    fontStyle: "bold",
                    textColor: [220, 38, 38],
                    fontSize: 8
                }
            },
            {
                content: formatNumber(totalCredit),
                styles: {
                    halign: "right",
                    fontStyle: "bold",
                    textColor: [22, 163, 74],
                    fontSize: 8
                }
            },
            {
                content: selectedSupplierData
                    ? `${formatNumber(
                        selectedSupplierData.closingBalance
                    )} ${selectedSupplierData.closingBalanceType}`
                    : "",

                styles: {
                    halign: "right",
                    fontStyle: "bold",
                    fontSize: 8
                }
            }
        ]);

        // ===== TABLE =====
        autoTable(doc, {
            startY: selectedSupplierData ? 40 : 34,

            head: [[
                "#",
                "DATE",
                "VOUCHER",
                "TYPE",
                "ITEM/MODEL",
                "QTY",
                "RATE",
                "DEBIT",
                "CREDIT",
                "BALANCE"
            ]],

            body: body,

            theme: "plain",

            styles: {
                font: "helvetica",
                fontSize: 7,
                cellPadding: 2,
                valign: "middle",
                overflow: "hidden",
                halign: "left",

                lineWidth: 0
            },

            headStyles: {
                fillColor: [230, 235, 245],
                textColor: [20, 30, 50],
                fontStyle: "bold",
                halign: "center",
                fontSize: 7.5
            },

            bodyStyles: {
                textColor: [50, 60, 75],
                fontSize: 7
            },

            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },

            // Width adjusted to fill complete page
            columnStyles: {
                0: { cellWidth: 8, halign: "center" },
                1: { cellWidth: 20, halign: "center" },
                2: { cellWidth: 42 },
                3: { cellWidth: 18, halign: "center" },
                4: { cellWidth: 75 },
                5: { cellWidth: 12, halign: "center" },
                6: { cellWidth: 25, halign: "right" },
                7: { cellWidth: 25, halign: "right" },
                8: { cellWidth: 25, halign: "right" },
                9: { cellWidth: 35, halign: "right" }
            },

            // reduced margins
            margin: {
                left: 3,
                right: 3,
                top: 5,
                bottom: 10
            },

            didDrawPage: (data) => {
                doc.setFontSize(6.5);
                doc.setTextColor(130, 130, 130);

                doc.text(
                    `Page ${data.pageNumber}`,
                    pageWidth - 6,
                    pageHeight - 5,
                    { align: "right" }
                );

                doc.text(
                    `${loggedInUser} | ${generatedOn}`,
                    4,
                    pageHeight - 5
                );
            }
        });

        doc.save(
            `SupplierStatement_${fromDate}_to_${toDate}.pdf`
        );
    };

    // ================= EXCEL =================
    const exportExcel = () => {
        if (allTransactions.length === 0) {
            alert("No data available");
            return;
        }

        const excelData = allTransactions.map((t, idx) => ({
            "#": idx + 1,
            DATE: formatDate(t.date),
            VOUCHER: t.voucherNo,
            TYPE: t.type === "PURCHASE" ? "Purchase" : t.type === "PURCHASE_RETURN" ? "Return" : "Payment",
            "ITEM/MODEL": t.itemName + (t.model ? ` (${t.model})` : ""),
            QTY: t.quantity > 0 ? t.quantity : "",
            RATE: t.rate > 0 ? t.rate : "",
            DEBIT: t.debit > 0 ? t.debit : 0,
            CREDIT: t.credit > 0 ? t.credit : 0,
            BALANCE: t.balance
        }));

        excelData.push({
            "#": "", DATE: "", VOUCHER: "", TYPE: "TOTAL", "ITEM/MODEL": "",
            QTY: "", RATE: "", DEBIT: totalDebit, CREDIT: totalCredit,
            BALANCE: selectedSupplierData ? selectedSupplierData.closingBalance : 0
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        worksheet["!cols"] = [
            { wch: 6 }, { wch: 14 }, { wch: 38 }, { wch: 12 },
            { wch: 48 }, { wch: 8 }, { wch: 16 }, { wch: 18 },
            { wch: 18 }, { wch: 18 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Supplier Statement");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `SupplierStatement_${fromDate}_to_${toDate}.xlsx`);
    };

    const handlePrint = () => {
        window.print();
    };

    // ================= BADGE STYLE =================
    const getBadgeStyle = (type) => ({
        display: "inline-block",
        padding: "3px 8px",
        borderRadius: "12px",
        fontSize: "clamp(9px, 1vw, 10px)",
        fontWeight: 600,
        whiteSpace: "nowrap",
        background: type === "PURCHASE" ? "#dbeafe" : type === "PURCHASE_RETURN" ? "#fee2e2" : "#fef3c7",
        color: type === "PURCHASE" ? "#1e40af" : type === "PURCHASE_RETURN" ? "#991b1b" : "#92400e"
    });

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
            <div className="rp-filter-group" style={{ flex: 1, minWidth: 220 }}>
                <label>Supplier</label>
                <select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)}>
                    <option value="">Select Supplier</option>
                    {suppliers.map((s) => (
                        <option key={s.acctID} value={s.acctID}>{s.label}</option>
                    ))}
                </select>
            </div>
            <button className="rp-btn-search" onClick={handleSearch} disabled={loading}>
                <FaSearch /> {loading ? "Loading..." : "Generate Report"}
            </button>
        </>
    );

    const exportButtons = allTransactions.length > 0 ? (
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
            title="SUPPLIER STATEMENT"
            subtitle="Detailed transaction-wise supplier report"
            filters={filters}
            printedBy={loggedInUser}
            extraActions={exportButtons}
            metaFields={selectedSupplierData ? [
                { label: "Supplier", value: `${selectedSupplierData.supplierCode} - ${selectedSupplierData.supplierName}` },
                { label: "Opening", value: `${formatNumber(selectedSupplierData.openingBalance)} ${selectedSupplierData.openingBalanceType}` },
                { label: "Closing", value: `${formatNumber(selectedSupplierData.closingBalance)} ${selectedSupplierData.closingBalanceType}` },
                { label: "Total Debit", value: formatNumber(selectedSupplierData.totalDebit) },
                { label: "Total Credit", value: formatNumber(selectedSupplierData.totalCredit) },
                { label: "Transactions", value: allTransactions.length }
            ] : null}
        >
            {error && <div className="rp-error">⚠ {error}</div>}
            {loading && <div className="rp-no-data">⏳ Loading...</div>}

            {allTransactions.length > 0 && !loading && (
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
                                    <th style={thStyle("10%", "center")}>DATE</th>
                                    <th style={thStyle("15%", "left")}>VOUCHER</th>
                                    <th style={thStyle("8%", "center")}>TYPE</th>
                                    <th style={thStyle("24%", "left")}>ITEM/MODEL</th>
                                    <th style={thStyle("5%", "center")}>QTY</th>
                                    <th style={thStyle("7%", "right")}>RATE</th>
                                    <th style={thStyle("10%", "right")}>DEBIT</th>
                                    <th style={thStyle("10%", "right")}>CREDIT</th>
                                    <th style={thStyle("8%", "right")}>BALANCE</th>
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
                                                {t.type === "PURCHASE" ? "Purchase" : t.type === "PURCHASE_RETURN" ? "Return" : "Payment"}
                                            </span>
                                        </td>
                                        <td style={tdStyle("left", "#334155", false, true)}>
                                            {t.itemName}{t.model ? ` (${t.model})` : ""}
                                        </td>
                                        <td style={tdStyle("center", "#0f172a")}>
                                            {t.quantity > 0 ? t.quantity : "-"}
                                        </td>
                                        <td style={tdStyle("right", "#0f172a", true)}>
                                            {t.rate > 0 ? formatNumber(t.rate) : "-"}
                                        </td>
                                        <td style={tdStyle("right", t.debit > 0 ? "#dc2626" : "#64748b", true, false, true)}>
                                            {t.debit > 0 ? formatNumber(t.debit) : "-"}
                                        </td>
                                        <td style={tdStyle("right", t.credit > 0 ? "#16a34a" : "#64748b", true, false, true)}>
                                            {t.credit > 0 ? formatNumber(t.credit) : "-"}
                                        </td>
                                        <td style={tdStyle("right", "#0f172a", true, false, true)}>
                                            {formatNumber(t.balance)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: "#f1f5f9" }}>
                                    <td colSpan={7} style={tfStyle("right")}>TOTAL</td>
                                    <td style={tfStyle("right", "#dc2626")}>{formatNumber(totalDebit)}</td>
                                    <td style={tfStyle("right", "#16a34a")}>{formatNumber(totalCredit)}</td>
                                    <td style={tfStyle("right", "#0f172a")}>
                                        {selectedSupplierData ? `${formatNumber(selectedSupplierData.closingBalance)} ${selectedSupplierData.closingBalanceType}` : ""}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {allTransactions.length === 0 && !loading && !error && (
                <div className="rp-no-data">📊 Select supplier and click "Generate Report"</div>
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