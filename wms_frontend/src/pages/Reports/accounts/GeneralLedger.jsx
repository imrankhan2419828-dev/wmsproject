//import React, { useState, useEffect } from "react";
//import reportApi from "../../../api/reportApi";
//import { getCoaTree } from "../../../api/coaApi";
//import { FaSearch } from "react-icons/fa";
//import ReportTemplate from "../ReportTemplate";

//export default function GeneralLedger() {
//    const [loading, setLoading] = useState(false);
//    const [accounts, setAccounts] = useState([]);
//    const [selectedAccount, setSelectedAccount] = useState("");
//    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
//    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
//    const [ledgerData, setLedgerData] = useState(null);
//    const [error, setError] = useState("");

//    useEffect(() => { loadAccounts(); }, []);

//    const loadAccounts = async () => {
//        try {
//            const res = await getCoaTree();
//            let list = [];
//            const flatten = (tree) => {
//                for (const acc of tree) {
//                    if (acc.acctLast && acc.acctID) {
//                        list.push({
//                            acctID: acc.acctID,
//                            code: acc.AcctCode || acc.acctCode || "",
//                            name: acc.AcctName || acc.acctName || "",
//                            openAmnt: acc.openAmnt || acc.OpenAmnt || acc.openingBalance || 0,
//                            label: `${acc.AcctCode || acc.acctCode || ""} - ${acc.AcctName || acc.acctName || ""}`
//                        });
//                    }
//                    if (acc.children?.length) flatten(acc.children);
//                }
//            };
//            flatten(res.data?.data || res.data || []);
//            setAccounts(list);
//        } catch (err) { }
//    };

//    const handleSearch = async () => {
//        if (!selectedAccount) { setError("Please select an account"); return; }
//        setLoading(true); setError("");
//        try {
//            const res = await reportApi.getGeneralLedger({ fromDate, toDate, accountId: selectedAccount });
//            setLedgerData(res.data?.data || null);
//        } catch (err) { setError(err.response?.data?.message || "Failed to load"); }
//        finally { setLoading(false); }
//    };

//    // ✅ Date formatter: 01-May-2026
//    const formatDt = (d) => {
//        if (!d) return "";
//        const dt = new Date(d);
//        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//        return `${String(dt.getDate()).padStart(2, '0')}-${months[dt.getMonth()]}-${dt.getFullYear()}`;
//    };

//    const f = (n) => new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
//    const totals = ledgerData?.transactions?.reduce((s, t) => ({ d: s.d + (t.debit || 0), c: s.c + (t.credit || 0) }), { d: 0, c: 0 }) || { d: 0, c: 0 };

//    const filters = (
//        <>
//            <div className="rp-filter-group"><label>From</label><input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
//            <div className="rp-filter-group"><label>To</label><input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
//            <div className="rp-filter-group" style={{ flex: 1, minWidth: 220 }}><label>Account</label><select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}><option value="">Select Account</option>{accounts.map(a => <option key={a.acctID} value={a.acctID}>{a.label}</option>)}</select></div>
//            <button className="rp-btn-search" onClick={handleSearch} disabled={loading}><FaSearch /> {loading ? "Loading..." : "Generate Report"}</button>
//        </>
//    );

//    return (
//        <ReportTemplate
//            title="GENERAL LEDGER"
//            subtitle="Detailed account transaction history"
//            filters={filters}
//            printedBy="admin"
//            metaFields={ledgerData ? [
//                { label: "Account", value: `${ledgerData.accountCode} - ${ledgerData.accountName}` },
//                { label: "Opening Balance", value: `${f(ledgerData.openingBalance)} ${ledgerData.openingBalanceType}` },
//                { label: "Period", value: `${formatDt(fromDate)} → ${formatDt(toDate)}` },
//                { label: "Closing Balance", value: `${f(ledgerData.closingBalance)} ${ledgerData.closingBalanceType}` },
//            ] : null}
//        >
//            {error && <div className="rp-error">⚠ {error}</div>}
//            {loading && <div className="rp-no-data">⏳ Loading...</div>}
//            {ledgerData && !loading && (
//                <div className="rp-table-wrapper">
//                    <table className="rp-table">
//                        <thead><tr><th>Date</th><th>Voucher</th><th>Description</th><th className="text-right">Debit</th><th className="text-right">Credit</th><th className="text-right">Balance</th></tr></thead>
//                        <tbody>
//                            {ledgerData.transactions?.length > 0 ? ledgerData.transactions.map((t, i) => (
//                                <tr key={i}>
//                                    <td>{formatDt(t.transactionDate)}</td>
//                                    <td>{t.voucherNo}</td>
//                                    <td>{t.description}</td>
//                                    <td className="text-right debit">{t.debit > 0 ? f(t.debit) : "-"}</td>
//                                    <td className="text-right credit">{t.credit > 0 ? f(t.credit) : "-"}</td>
//                                    <td className="text-right balance">{f(t.balance)}</td>
//                                </tr>
//                            )) : <tr><td colSpan="6" className="rp-no-data">No transactions found</td></tr>}
//                        </tbody>
//                        {ledgerData.transactions?.length > 0 && (
//                            <tfoot><tr><td colSpan="3"><strong>Totals</strong></td><td className="text-right"><strong>{f(totals.d)}</strong></td><td className="text-right"><strong>{f(totals.c)}</strong></td><td className="text-right"><strong>{f(ledgerData.closingBalance)} {ledgerData.closingBalanceType}</strong></td></tr></tfoot>
//                        )}
//                    </table>
//                </div>
//            )}
//            {!ledgerData && !loading && !error && <div className="rp-no-data">📊 Select an account and click "Generate Report"</div>}
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

export default function GeneralLedger() {
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState("");
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

    const [ledgerData, setLedgerData] = useState(null);
    const [error, setError] = useState("");

    const loggedInUser =
        localStorage.getItem("userName") ||
        localStorage.getItem("username") ||
        localStorage.getItem("fullName") ||
        "Admin User";

    const branchName =
        localStorage.getItem("branchName") || "Main Branch";

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
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

                    if (leaf && id) {
                        list.push({
                            acctID: id,
                            code: code,
                            name: name,
                            openAmnt:
                                acc.openAmnt ||
                                acc.OpenAmnt ||
                                acc.openingBalance ||
                                0,
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

            setAccounts(list);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = async () => {
        if (!selectedAccount) {
            setError("Please select an account");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await reportApi.getGeneralLedger(
                {
                    fromDate,
                    toDate,
                    accountId: selectedAccount
                }
            );

            setLedgerData(
                res.data?.data || null
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load"
            );
        } finally {
            setLoading(false);
        }
    };

    // ✅ Date formatter: 01-May-2026
    const formatDt = (d) => {
        if (!d) return "";
        const dt = new Date(d);

        const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ];

        return `${String(dt.getDate()).padStart(
            2,
            "0"
        )}-${months[dt.getMonth()]}-${dt.getFullYear()}`;
    };

    const formatNumber = (n) => {
        return new Intl.NumberFormat("en-PK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(n || 0);
    };

    const totals =
        ledgerData?.transactions?.reduce(
            (s, t) => ({
                d: s.d + (t.debit || 0),
                c: s.c + (t.credit || 0)
            }),
            { d: 0, c: 0 }
        ) || { d: 0, c: 0 };

    // ================= PDF =================

    const exportPDF = () => {
        if (
            !ledgerData ||
            !ledgerData.transactions?.length
        ) {
            alert("No data available");
            return;
        }

        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });

        const pageWidth =
            doc.internal.pageSize.getWidth();

        const pageHeight =
            doc.internal.pageSize.getHeight();

        const generatedOn =
            new Date().toLocaleString();

        const accountLabel = selectedAccount
            ? accounts.find(
                (a) =>
                    a.acctID == selectedAccount
            )?.label || "Selected Account"
            : "N/A";

        doc.setFont("helvetica");

        // Header
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");

        doc.text(
            "GENERAL LEDGER REPORT",
            pageWidth / 2,
            16,
            {
                align: "center"
            }
        );

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        doc.text(
            `Branch: ${branchName}`,
            14,
            28
        );

        doc.text(
            `Account: ${ledgerData.accountCode} - ${ledgerData.accountName}`,
            14,
            35
        );

        doc.text(
            `Opening Balance: ${formatNumber(ledgerData.openingBalance)} ${ledgerData.openingBalanceType}`,
            14,
            42
        );

        doc.text(
            `Closing Balance: ${formatNumber(ledgerData.closingBalance)} ${ledgerData.closingBalanceType}`,
            14,
            49
        );

        doc.text(
            `Period: ${formatDt(fromDate)} → ${formatDt(toDate)}`,
            pageWidth - 14,
            28,
            {
                align: "right"
            }
        );

        doc.text(
            `Generated By: ${loggedInUser}`,
            pageWidth - 14,
            35,
            {
                align: "right"
            }
        );

        doc.text(
            `Generated On: ${generatedOn}`,
            pageWidth - 14,
            42,
            {
                align: "right"
            }
        );

        const body =
            ledgerData.transactions.map(
                (t, index) => [
                    index + 1,
                    formatDt(t.transactionDate),
                    t.voucherNo || "-",
                    t.description || "-",
                    t.debit > 0
                        ? formatNumber(t.debit)
                        : "-",
                    t.credit > 0
                        ? formatNumber(t.credit)
                        : "-",
                    formatNumber(t.balance)
                ]
            );

        body.push([
            "",
            "",
            "",
            "TOTAL",
            formatNumber(totals.d),
            formatNumber(totals.c),
            `${formatNumber(ledgerData.closingBalance)} ${ledgerData.closingBalanceType}`
        ]);

        autoTable(doc, {
            startY: 58,

            head: [
                [
                    "#",
                    "DATE",
                    "VOUCHER",
                    "DESCRIPTION",
                    "DEBIT",
                    "CREDIT",
                    "BALANCE"
                ]
            ],

            body,

            theme: "plain",

            styles: {
                font: "helvetica",
                fontSize: 8.5,
                cellPadding: 3,
                lineColor: [220, 220, 220],
                lineWidth: 0.2,
                valign: "middle",
                overflow: "linebreak"
            },

            headStyles: {
                fillColor: [245, 247, 250],
                textColor: [30, 41, 59],
                fontStyle: "bold",
                halign: "center",
                lineWidth: 0.3
            },

            bodyStyles: {
                textColor: [55, 65, 81]
            },

            alternateRowStyles: {
                fillColor: [250, 250, 250]
            },

            columnStyles: {
                0: {
                    cellWidth: 10,
                    halign: "center"
                },
                1: {
                    cellWidth: 30,
                    halign: "center"
                },
                2: {
                    cellWidth: 40
                },
                3: {
                    cellWidth: 65
                },
                4: {
                    cellWidth: 35,
                    halign: "right"
                },
                5: {
                    cellWidth: 35,
                    halign: "right"
                },
                6: {
                    cellWidth: 40,
                    halign: "right"
                }
            },

            margin: {
                left: 12,
                right: 12
            }
        });

        const pageCount =
            doc.internal.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            doc.setFontSize(8);

            doc.text(
                `Page ${i} of ${pageCount}`,
                pageWidth - 20,
                pageHeight - 8
            );

            doc.text(
                `Printed By: ${loggedInUser}`,
                14,
                pageHeight - 8
            );
        }

        doc.save(
            `GeneralLedger_${ledgerData.accountCode}_${fromDate}_to_${toDate}.pdf`
        );
    };

    // ================= EXCEL =================

    const exportExcel = () => {
        if (
            !ledgerData ||
            !ledgerData.transactions?.length
        ) {
            alert("No data available");
            return;
        }

        const excelData =
            ledgerData.transactions.map(
                (t, idx) => ({
                    "#": idx + 1,
                    DATE: formatDt(
                        t.transactionDate
                    ),
                    VOUCHER: t.voucherNo || "-",
                    DESCRIPTION:
                        t.description || "-",
                    DEBIT:
                        t.debit > 0
                            ? t.debit
                            : 0,
                    CREDIT:
                        t.credit > 0
                            ? t.credit
                            : 0,
                    BALANCE: t.balance
                })
            );

        excelData.push({
            "#": "",
            DATE: "",
            VOUCHER: "",
            DESCRIPTION: "TOTAL",
            DEBIT: totals.d,
            CREDIT: totals.c,
            BALANCE: ledgerData.closingBalance
        });

        const worksheet =
            XLSX.utils.json_to_sheet(
                excelData
            );

        worksheet["!cols"] = [
            { wch: 6 },
            { wch: 16 },
            { wch: 25 },
            { wch: 50 },
            { wch: 18 },
            { wch: 18 },
            { wch: 18 }
        ];

        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "General Ledger"
        );

        const excelBuffer = XLSX.write(
            workbook,
            {
                bookType: "xlsx",
                type: "array"
            }
        );

        const blob = new Blob(
            [excelBuffer],
            {
                type: "application/octet-stream"
            }
        );

        saveAs(
            blob,
            `GeneralLedger_${ledgerData.accountCode}_${fromDate}_to_${toDate}.xlsx`
        );
    };

    const handlePrint = () => {
        window.print();
    };

    const filters = (
        <>
            <div className="rp-filter-group">
                <label>From</label>

                <input
                    type="date"
                    value={fromDate}
                    onChange={(e) =>
                        setFromDate(
                            e.target.value
                        )
                    }
                />
            </div>

            <div className="rp-filter-group">
                <label>To</label>

                <input
                    type="date"
                    value={toDate}
                    onChange={(e) =>
                        setToDate(
                            e.target.value
                        )
                    }
                />
            </div>

            <div
                className="rp-filter-group"
                style={{
                    flex: 1,
                    minWidth: 220
                }}
            >
                <label>Account</label>

                <select
                    value={selectedAccount}
                    onChange={(e) =>
                        setSelectedAccount(
                            e.target.value
                        )
                    }
                >
                    <option value="">
                        Select Account
                    </option>

                    {accounts.map((a) => (
                        <option
                            key={a.acctID}
                            value={a.acctID}
                        >
                            {a.label}
                        </option>
                    ))}
                </select>
            </div>

            <button
                className="rp-btn-search"
                onClick={handleSearch}
                disabled={loading}
            >
                <FaSearch />

                {loading
                    ? "Loading..."
                    : "Generate Report"}
            </button>
        </>
    );

    const exportButtons =
        ledgerData &&
            ledgerData.transactions?.length >
            0 ? (
            <div
                style={{
                    display: "flex",
                    gap: "10px"
                }}
            >
                <button
                    onClick={exportPDF}
                    style={{
                        background:
                            "#dc2626",
                        color: "#fff",
                        border: "none",
                        padding:
                            "10px 16px",
                        borderRadius:
                            "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems:
                            "center",
                        gap: "8px",
                        fontWeight: 600
                    }}
                >
                    <FaFilePdf />
                    PDF
                </button>

                <button
                    onClick={exportExcel}
                    style={{
                        background:
                            "#16a34a",
                        color: "#fff",
                        border: "none",
                        padding:
                            "10px 16px",
                        borderRadius:
                            "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems:
                            "center",
                        gap: "8px",
                        fontWeight: 600
                    }}
                >
                    <FaFileExcel />
                    Excel
                </button>

                <button
                    onClick={handlePrint}
                    style={{
                        background:
                            "#475569",
                        color: "#fff",
                        border: "none",
                        padding:
                            "10px 16px",
                        borderRadius:
                            "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems:
                            "center",
                        gap: "8px",
                        fontWeight: 600
                    }}
                >
                    <FaPrint />
                    Print
                </button>
            </div>
        ) : null;

    return (
        <ReportTemplate
            title="GENERAL LEDGER"
            subtitle="Detailed account transaction history"
            filters={filters}
            printedBy={loggedInUser}
            extraActions={exportButtons}
            metaFields={
                ledgerData
                    ? [
                        {
                            label: "Account",
                            value: `${ledgerData.accountCode} - ${ledgerData.accountName}`
                        },
                        {
                            label:
                                "Opening Balance",
                            value: `${formatNumber(ledgerData.openingBalance)} ${ledgerData.openingBalanceType}`
                        },
                        {
                            label:
                                "Closing Balance",
                            value: `${formatNumber(ledgerData.closingBalance)} ${ledgerData.closingBalanceType}`
                        },
                        {
                            label: "Period",
                            value: `${formatDt(fromDate)} → ${formatDt(toDate)}`
                        },
                        {
                            label:
                                "Total Transactions",
                            value:
                                ledgerData
                                    .transactions
                                    ?.length || 0
                        }
                    ]
                    : null
            }
        >
            {error && (
                <div className="rp-error">
                    ⚠ {error}
                </div>
            )}

            {loading && (
                <div className="rp-no-data">
                    ⏳ Loading...
                </div>
            )}

            {ledgerData &&
                !loading && (
                    <div
                        style={{
                            background:
                                "#ffffff",
                            border:
                                "1px solid #e5e7eb",
                            borderRadius:
                                "14px",
                            overflow: "hidden",
                            boxShadow:
                                "0 2px 10px rgba(0,0,0,0.04)",
                            width: "100%"
                        }}
                    >
                        <div
                            style={{
                                overflowX:
                                    "auto",
                                width: "100%",
                                maxWidth:
                                    "100%"
                            }}
                        >
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse:
                                        "separate",
                                    borderSpacing: 0,
                                    fontSize:
                                        "clamp(11px, 1.5vw, 11px)",
                                    fontFamily:
                                        "'Segoe UI', sans-serif",
                                    tableLayout:
                                        "auto"
                                }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            background:
                                                "#f8fafc"
                                        }}
                                    >
                                        {[
                                            {
                                                label: "#",
                                                width: "5%",
                                                align: "center"
                                            },
                                            {
                                                label: "DATE",
                                                width: "14%",
                                                align: "center"
                                            },
                                            {
                                                label: "VOUCHER",
                                                width: "16%",
                                                align: "left"
                                            },
                                            {
                                                label: "DESCRIPTION",
                                                width: "26%",
                                                align: "left"
                                            },
                                            {
                                                label: "DEBIT",
                                                width: "13%",
                                                align: "right"
                                            },
                                            {
                                                label: "CREDIT",
                                                width: "13%",
                                                align: "right"
                                            },
                                            {
                                                label: "BALANCE",
                                                width: "13%",
                                                align: "right"
                                            }
                                        ].map(
                                            (
                                                col,
                                                index
                                            ) => (
                                                <th
                                                    key={
                                                        index
                                                    }
                                                    style={{
                                                        padding:
                                                            "12px 8px",
                                                        borderBottom:
                                                            "2px solid #e2e8f0",
                                                        textAlign:
                                                            col.align,
                                                        color: "#0f172a",
                                                        fontWeight:
                                                            "700",
                                                        whiteSpace:
                                                            "nowrap",
                                                        fontSize:
                                                            "inherit",
                                                        width: col.width
                                                    }}
                                                >
                                                    {
                                                        col.label
                                                    }
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {ledgerData
                                        .transactions
                                        ?.length >
                                        0 ? (
                                        ledgerData.transactions.map(
                                            (
                                                t,
                                                idx
                                            ) => (
                                                <tr
                                                    key={
                                                        idx
                                                    }
                                                    style={{
                                                        background:
                                                            idx %
                                                                2 ===
                                                                0
                                                                ? "#ffffff"
                                                                : "#f9fbfd"
                                                    }}
                                                >
                                                    <td
                                                        style={{
                                                            padding:
                                                                "10px 8px",
                                                            borderBottom:
                                                                "1px solid #edf2f7",
                                                            textAlign:
                                                                "center",
                                                            color: "#475569"
                                                        }}
                                                    >
                                                        {idx +
                                                            1}
                                                    </td>

                                                    <td
                                                        style={{
                                                            padding:
                                                                "10px 8px",
                                                            borderBottom:
                                                                "1px solid #edf2f7",
                                                            color: "#475569",
                                                            whiteSpace:
                                                                "nowrap",
                                                            textAlign:
                                                                "center"
                                                        }}
                                                    >
                                                        {formatDt(
                                                            t.transactionDate
                                                        )}
                                                    </td>

                                                    <td
                                                        style={{
                                                            padding:
                                                                "10px 8px",
                                                            borderBottom:
                                                                "1px solid #edf2f7",
                                                            color: "#334155",
                                                            fontWeight: 500,
                                                            wordBreak:
                                                                "break-word"
                                                        }}
                                                    >
                                                        {t.voucherNo ||
                                                            "-"}
                                                    </td>

                                                    <td
                                                        style={{
                                                            padding:
                                                                "10px 8px",
                                                            borderBottom:
                                                                "1px solid #edf2f7",
                                                            color: "#334155",
                                                            wordBreak:
                                                                "break-word"
                                                        }}
                                                    >
                                                        {t.description ||
                                                            "-"}
                                                    </td>

                                                    <td
                                                        style={{
                                                            padding:
                                                                "10px 8px",
                                                            borderBottom:
                                                                "1px solid #edf2f7",
                                                            textAlign:
                                                                "right",
                                                            color: t.debit >
                                                                0
                                                                ? "#dc2626"
                                                                : "#64748b",
                                                            fontVariantNumeric:
                                                                "tabular-nums",
                                                            whiteSpace:
                                                                "nowrap"
                                                        }}
                                                    >
                                                        {t.debit >
                                                            0
                                                            ? formatNumber(
                                                                t.debit
                                                            )
                                                            : "-"}
                                                    </td>

                                                    <td
                                                        style={{
                                                            padding:
                                                                "10px 8px",
                                                            borderBottom:
                                                                "1px solid #edf2f7",
                                                            textAlign:
                                                                "right",
                                                            color: t.credit >
                                                                0
                                                                ? "#16a34a"
                                                                : "#64748b",
                                                            fontVariantNumeric:
                                                                "tabular-nums",
                                                            whiteSpace:
                                                                "nowrap"
                                                        }}
                                                    >
                                                        {t.credit >
                                                            0
                                                            ? formatNumber(
                                                                t.credit
                                                            )
                                                            : "-"}
                                                    </td>

                                                    <td
                                                        style={{
                                                            padding:
                                                                "10px 8px",
                                                            borderBottom:
                                                                "1px solid #edf2f7",
                                                            textAlign:
                                                                "right",
                                                            color: "#0f172a",
                                                            fontWeight: 600,
                                                            fontVariantNumeric:
                                                                "tabular-nums",
                                                            whiteSpace:
                                                                "nowrap"
                                                        }}
                                                    >
                                                        {formatNumber(
                                                            t.balance
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={
                                                    7
                                                }
                                                style={{
                                                    padding:
                                                        "40px",
                                                    textAlign:
                                                        "center",
                                                    color: "#94a3b8"
                                                }}
                                            >
                                                No
                                                transactions
                                                found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                                {ledgerData
                                    .transactions
                                    ?.length >
                                    0 && (
                                        <tfoot>
                                            <tr
                                                style={{
                                                    background:
                                                        "#f1f5f9"
                                                }}
                                            >
                                                <td
                                                    colSpan={
                                                        4
                                                    }
                                                    style={{
                                                        padding:
                                                            "14px 8px",
                                                        borderTop:
                                                            "2px solid #dbe3ea",
                                                        textAlign:
                                                            "right",
                                                        fontWeight:
                                                            "700",
                                                        color: "#0f172a"
                                                    }}
                                                >
                                                    TOTAL
                                                </td>

                                                <td
                                                    style={{
                                                        padding:
                                                            "14px 8px",
                                                        borderTop:
                                                            "2px solid #dbe3ea",
                                                        textAlign:
                                                            "right",
                                                        fontWeight:
                                                            "700",
                                                        color: "#dc2626"
                                                    }}
                                                >
                                                    {formatNumber(
                                                        totals.d
                                                    )}
                                                </td>

                                                <td
                                                    style={{
                                                        padding:
                                                            "14px 8px",
                                                        borderTop:
                                                            "2px solid #dbe3ea",
                                                        textAlign:
                                                            "right",
                                                        fontWeight:
                                                            "700",
                                                        color: "#16a34a"
                                                    }}
                                                >
                                                    {formatNumber(
                                                        totals.c
                                                    )}
                                                </td>

                                                <td
                                                    style={{
                                                        padding:
                                                            "14px 8px",
                                                        borderTop:
                                                            "2px solid #dbe3ea",
                                                        textAlign:
                                                            "right",
                                                        fontWeight:
                                                            "700",
                                                        color: "#0f172a"
                                                    }}
                                                >
                                                    {formatNumber(
                                                        ledgerData.closingBalance
                                                    )}{" "}
                                                    {
                                                        ledgerData.closingBalanceType
                                                    }
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                            </table>
                        </div>
                    </div>
                )}

            {!ledgerData &&
                !loading &&
                !error && (
                    <div className="rp-no-data">
                        📊 Select an account and
                        click "Generate Report"
                    </div>
                )}
        </ReportTemplate>
    );
}