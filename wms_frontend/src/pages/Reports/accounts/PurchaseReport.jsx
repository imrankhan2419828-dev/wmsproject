//import React, { useState, useEffect } from "react";
//import reportApi from "../../../api/reportApi";
//import { getCoaTree } from "../../../api/coaApi";
//import itemApi from "../../../api/itemApi";
//import { FaSearch, FaChevronDown, FaChevronRight } from "react-icons/fa";
//import ReportTemplate from "../ReportTemplate";

//export default function PurchaseReport() {
//    const [loading, setLoading] = useState(false);
//    const [suppliers, setSuppliers] = useState([]);
//    const [items, setItems] = useState([]);
//    const [selectedSupplier, setSelectedSupplier] = useState("");
//    const [selectedItem, setSelectedItem] = useState("");
//    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
//    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
//    const [data, setData] = useState(null);
//    const [error, setError] = useState("");
//    const [expanded, setExpanded] = useState({});

//    useEffect(() => { loadDropdowns(); }, []);

//    const loadDropdowns = async () => {
//        try {
//            const [coaRes, itemRes] = await Promise.all([getCoaTree(), itemApi.getAll()]);
//            let suppList = [];
//            const flatten = (tree) => {
//                for (const acc of tree) {
//                    const id = acc.acctID || acc.AcctID || acc.id;
//                    const code = acc.AcctCode || acc.acctCode || acc.code || "";
//                    const name = acc.AcctName || acc.acctName || acc.name || "";
//                    const leaf = acc.acctLast || acc.AcctLast || acc.isLeaf;
//                    const cat = (acc.AccountCategory || acc.accountCategory || acc.account_category || "").trim();

//                    if (leaf && cat === "Supplier" && id) {
//                        suppList.push({ acctID: id, label: `${code} - ${name}` });
//                    }
//                    if (acc.children?.length) flatten(acc.children);
//                }
//            };
//            flatten(coaRes.data?.data || coaRes.data || []);
//            console.log("Suppliers loaded:", suppList);
//            setSuppliers(suppList);

//            const itemData = itemRes.data?.data || itemRes.data || [];
//            setItems(itemData.map(i => ({
//                itemID: i.itemID || i.ItemID || i.id,
//                label: i.itemName || i.ItemName || i.name || ""
//            })));
//        } catch (err) {
//            console.error("Dropdown load error:", err);
//        }
//    };

//    const handleSearch = async () => {
//        setLoading(true); setError("");
//        try {
//            const res = await reportApi.getPurchaseReport(fromDate, toDate, selectedSupplier || null, selectedItem || null);
//            setData(res.data?.data || null);
//            setExpanded({});
//        } catch (err) { setError(err.response?.data?.message || "Failed"); }
//        finally { setLoading(false); }
//    };

//    const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
//    const formatDt = (d) => { if (!d) return ""; const dt = new Date(d); const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return `${String(dt.getDate()).padStart(2, '0')}-${m[dt.getMonth()]}-${dt.getFullYear()}`; };
//    const f = (n) => new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

//    const totalAmount = data?.reduce((s, d) => s + (d.totalAmount || 0), 0) || 0;
//    const totalQty = data?.reduce((s, d) => s + (d.totalQty || 0), 0) || 0;

//    const filters = (
//        <>
//            <div className="rp-filter-group"><label>From</label><input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
//            <div className="rp-filter-group"><label>To</label><input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
//            <div className="rp-filter-group" style={{ minWidth: 180 }}><label>Supplier</label><select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}><option value="">All</option>{suppliers.map(s => <option key={s.acctID} value={s.acctID}>{s.label}</option>)}</select></div>
//            <div className="rp-filter-group" style={{ minWidth: 180 }}><label>Item</label><select value={selectedItem} onChange={e => setSelectedItem(e.target.value)}><option value="">All</option>{items.map(i => <option key={i.itemID} value={i.itemID}>{i.label}</option>)}</select></div>
//            <button className="rp-btn-search" onClick={handleSearch} disabled={loading}><FaSearch /> {loading ? "Loading..." : "Generate"}</button>
//        </>
//    );

//    return (
//        <ReportTemplate title="PURCHASE REPORT" subtitle="Summary & detail of purchases" filters={filters} printedBy="admin"
//            metaFields={data ? [
//                { label: "Total Purchases", value: data.length },
//                { label: "Total Qty", value: f(totalQty) },
//                { label: "Total Amount", value: f(totalAmount) },
//            ] : null}
//        >
//            {error && <div className="rp-error">⚠ {error}</div>}
//            {loading && <div className="rp-no-data">⏳ Loading...</div>}

//            {data && !loading && data.map((p) => (
//                <div key={p.tranNumb} style={{ marginBottom: 16 }}>
//                    <div style={{ display: 'flex', gap: 16, padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafbfc', marginBottom: 4, cursor: 'pointer' }} onClick={() => toggleExpand(p.tranNumb)}>
//                        <div style={{ flex: 1 }}><strong>{p.billNumb}</strong></div>
//                        <div style={{ flex: 1 }}>{formatDt(p.tranDate)}</div>
//                        <div style={{ flex: 2 }}>{p.supplierName}</div>
//                        <div style={{ flex: 1, textAlign: 'center' }}>{p.totalQty} qty</div>
//                        <div style={{ flex: 1, textAlign: 'right', fontWeight: 700 }}>{f(p.totalAmount)}</div>
//                        <div style={{ width: 24, textAlign: 'center', color: '#2563eb' }}>{expanded[p.tranNumb] ? <FaChevronDown /> : <FaChevronRight />}</div>
//                    </div>
//                    {expanded[p.tranNumb] && (
//                        <div className="rp-table-wrapper">
//                            <table className="rp-table" style={{ fontSize: 10 }}>
//                                <thead><tr><th>Item</th><th>Model</th><th className="text-center">Qty</th><th className="text-right">Rate</th><th className="text-right">Amount</th></tr></thead>
//                                <tbody>
//                                    {p.items?.map((item, idx) => (
//                                        <tr key={idx}>
//                                            <td>{item.itemName}</td><td>{item.model || '-'}</td>
//                                            <td className="text-center">{item.quantity}</td>
//                                            <td className="text-right">{f(item.rate)}</td>
//                                            <td className="text-right">{f(item.amount)}</td>
//                                        </tr>
//                                    ))}
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
import itemApi from "../../../api/itemApi";
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

export default function PurchaseReport() {
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState("");
    const [selectedItem, setSelectedItem] = useState("");
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

    const [flatData, setFlatData] = useState([]);
    const [error, setError] = useState("");

    const loggedInUser =
        localStorage.getItem("userName") ||
        localStorage.getItem("username") ||
        localStorage.getItem("fullName") ||
        "Admin User";

    const branchName =
        localStorage.getItem("branchName") || "Main Branch";

    useEffect(() => {
        loadDropdowns();
    }, []);

    const loadDropdowns = async () => {
        try {
            const [coaRes, itemRes] = await Promise.all([
                getCoaTree(),
                itemApi.getAll()
            ]);

            let suppList = [];

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

                    if (leaf && cat === "Supplier" && id) {
                        suppList.push({
                            acctID: id,
                            label: `${code} - ${name}`
                        });
                    }

                    if (acc.children?.length) {
                        flatten(acc.children);
                    }
                }
            };

            flatten(coaRes.data?.data || coaRes.data || []);

            setSuppliers(suppList);

            const itemData =
                itemRes.data?.data ||
                itemRes.data ||
                [];

            setItems(
                itemData.map((i) => ({
                    itemID:
                        i.itemID ||
                        i.ItemID ||
                        i.id,

                    label:
                        i.itemName ||
                        i.ItemName ||
                        i.name ||
                        ""
                }))
            );
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        setError("");

        try {
            const res =
                await reportApi.getPurchaseReport(
                    fromDate,
                    toDate,
                    selectedSupplier || null,
                    selectedItem || null
                );

            const nestedData =
                res.data?.data || [];

            const flat = [];

            for (const purchase of nestedData) {
                if (
                    purchase.items &&
                    purchase.items.length > 0
                ) {
                    for (const item of purchase.items) {
                        flat.push({
                            billNo:
                                purchase.billNumb || "-",

                            date:
                                purchase.tranDate || "",

                            supplier:
                                purchase.supplierName ||
                                "-",

                            itemName:
                                item.itemName || "-",

                            qty:
                                Number(
                                    item.quantity
                                ) || 0,

                            rate:
                                Number(item.rate) || 0,

                            amount:
                                Number(
                                    item.amount
                                ) || 0
                        });
                    }
                }
            }

            flat.sort(
                (a, b) =>
                    new Date(a.date) -
                    new Date(b.date)
            );

            setFlatData(flat);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load report"
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "-";

        const dt = new Date(date);

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

    const formatNumber = (num) => {
        return new Intl.NumberFormat("en-PK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num || 0);
    };

    const totalQty = flatData.reduce(
        (sum, row) => sum + row.qty,
        0
    );

    const totalAmount = flatData.reduce(
        (sum, row) => sum + row.amount,
        0
    );

    // ================= PDF =================

    const exportPDF = () => {
        if (flatData.length === 0) {
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

        const supplierFilter = selectedSupplier
            ? suppliers.find(
                (s) =>
                    s.acctID ==
                    selectedSupplier
            )?.label || "Selected Supplier"
            : "All Suppliers";

        const itemFilter = selectedItem
            ? items.find(
                (i) =>
                    i.itemID == selectedItem
            )?.label || "Selected Item"
            : "All Items";

        doc.setFont("helvetica");

        // Header
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");

        doc.text(
            "PURCHASE DETAIL REPORT",
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
            `Date Range: ${fromDate} to ${toDate}`,
            14,
            35
        );

        doc.text(
            `Generated By: ${loggedInUser}`,
            14,
            42
        );

        doc.text(
            `Generated On: ${generatedOn}`,
            14,
            49
        );

        doc.text(
            `Supplier Filter: ${supplierFilter}`,
            pageWidth - 14,
            35,
            {
                align: "right"
            }
        );

        doc.text(
            `Item Filter: ${itemFilter}`,
            pageWidth - 14,
            42,
            {
                align: "right"
            }
        );

        const body = flatData.map(
            (row, index) => [
                index + 1,
                row.billNo,
                formatDate(row.date),
                row.supplier,
                row.itemName,
                formatNumber(row.qty),
                formatNumber(row.rate),
                formatNumber(row.amount)
            ]
        );

        body.push([
            "",
            "TOTAL",
            "",
            "",
            "",
            formatNumber(totalQty),
            "",
            formatNumber(totalAmount)
        ]);

        autoTable(doc, {
            startY: 58,

            head: [
                [
                    "#",
                    "BILL NO",
                    "DATE",
                    "SUPPLIER",
                    "ITEM",
                    "QTY",
                    "RATE",
                    "AMOUNT"
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
                    cellWidth: 45
                },

                2: {
                    cellWidth: 25,
                    halign: "center"
                },

                3: {
                    cellWidth: 42
                },

                4: {
                    cellWidth: 68
                },

                5: {
                    cellWidth: 18,
                    halign: "right"
                },

                6: {
                    cellWidth: 28,
                    halign: "right"
                },

                7: {
                    cellWidth: 32,
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

        for (
            let i = 1;
            i <= pageCount;
            i++
        ) {
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
            `PurchaseReport_${fromDate}_to_${toDate}.pdf`
        );
    };

    // ================= EXCEL =================

    const exportExcel = () => {
        if (flatData.length === 0) {
            alert("No data available");
            return;
        }

        const excelData = flatData.map(
            (row, idx) => ({
                "#": idx + 1,
                "BILL NO": row.billNo,
                DATE: formatDate(row.date),
                SUPPLIER: row.supplier,
                ITEM: row.itemName,
                QTY: row.qty,
                RATE: row.rate,
                AMOUNT: row.amount
            })
        );

        excelData.push({
            "#": "",
            "BILL NO": "TOTAL",
            DATE: "",
            SUPPLIER: "",
            ITEM: "",
            QTY: totalQty,
            RATE: "",
            AMOUNT: totalAmount
        });

        const worksheet =
            XLSX.utils.json_to_sheet(
                excelData
            );

        worksheet["!cols"] = [
            { wch: 6 },
            { wch: 35 },
            { wch: 16 },
            { wch: 30 },
            { wch: 45 },
            { wch: 12 },
            { wch: 15 },
            { wch: 18 }
        ];

        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Purchase Report"
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
            `PurchaseReport_${fromDate}_to_${toDate}.xlsx`
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
                style={{ minWidth: 220 }}
            >
                <label>Supplier</label>

                <select
                    value={selectedSupplier}
                    onChange={(e) =>
                        setSelectedSupplier(
                            e.target.value
                        )
                    }
                >
                    <option value="">
                        All Suppliers
                    </option>

                    {suppliers.map((s) => (
                        <option
                            key={s.acctID}
                            value={s.acctID}
                        >
                            {s.label}
                        </option>
                    ))}
                </select>
            </div>

            <div
                className="rp-filter-group"
                style={{ minWidth: 220 }}
            >
                <label>Item</label>

                <select
                    value={selectedItem}
                    onChange={(e) =>
                        setSelectedItem(
                            e.target.value
                        )
                    }
                >
                    <option value="">
                        All Items
                    </option>

                    {items.map((i) => (
                        <option
                            key={i.itemID}
                            value={i.itemID}
                        >
                            {i.label}
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
                    : "Generate"}
            </button>
        </>
    );

    const exportButtons =
        flatData.length > 0 ? (
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
            title="PURCHASE REPORT"
            subtitle="Purchase detail report with flat item listing"
            filters={filters}
            printedBy={loggedInUser}
            extraActions={exportButtons}
            metaFields={
                flatData.length > 0
                    ? [
                        {
                            label:
                                "Total Records",
                            value:
                                flatData.length
                        },
                        {
                            label:
                                "Total Qty",
                            value:
                                formatNumber(
                                    totalQty
                                )
                        },
                        {
                            label:
                                "Total Amount",
                            value:
                                formatNumber(
                                    totalAmount
                                )
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

            {flatData.length > 0 && !loading && (
                <div
                    style={{
                        background: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "14px",
                        overflow: "hidden",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                        width: "100%"
                    }}
                >
                    <div
                        style={{
                            overflowX: "auto",
                            width: "100%",
                            maxWidth: "100%"
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "separate",
                                borderSpacing: 0,
                                fontSize: "clamp(11px, 1.5vw, 11px)",
                                fontFamily: "'Segoe UI', sans-serif",
                                tableLayout: "auto"
                            }}
                        >
                            <thead>
                                <tr style={{ background: "#f8fafc" }}>
                                    {[
                                        { label: "#", width: "5%", align: "center" },
                                        { label: "BILL NO", width: "18%", align: "left" },
                                        { label: "DATE", width: "12%", align: "center" },
                                        { label: "SUPPLIER", width: "16%", align: "left" },
                                        { label: "ITEM", width: "20%", align: "left" },
                                        { label: "QTY", width: "8%", align: "right" },
                                        { label: "RATE", width: "10%", align: "right" },
                                        { label: "AMOUNT", width: "11%", align: "right" }
                                    ].map((col, index) => (
                                        <th
                                            key={index}
                                            style={{
                                                padding: "12px 8px",
                                                borderBottom: "2px solid #e2e8f0",
                                                textAlign: col.align,
                                                color: "#0f172a",
                                                fontWeight: "700",
                                                whiteSpace: "nowrap",
                                                fontSize: "inherit",
                                                width: col.width
                                            }}
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {flatData.map((row, idx) => (
                                    <tr
                                        key={idx}
                                        style={{
                                            background: idx % 2 === 0 ? "#ffffff" : "#f9fbfd"
                                        }}
                                    >
                                        <td
                                            style={{
                                                padding: "10px 8px",
                                                borderBottom: "1px solid #edf2f7",
                                                textAlign: "center",
                                                color: "#475569"
                                            }}
                                        >
                                            {idx + 1}
                                        </td>

                                        <td
                                            style={{
                                                padding: "10px 8px",
                                                borderBottom: "1px solid #edf2f7",
                                                color: "#334155",
                                                fontWeight: 500,
                                                wordBreak: "break-word"
                                            }}
                                        >
                                            {row.billNo}
                                        </td>

                                        <td
                                            style={{
                                                padding: "10px 8px",
                                                borderBottom: "1px solid #edf2f7",
                                                color: "#475569",
                                                whiteSpace: "nowrap",
                                                textAlign: "center"
                                            }}
                                        >
                                            {formatDate(row.date)}
                                        </td>

                                        <td
                                            style={{
                                                padding: "10px 8px",
                                                borderBottom: "1px solid #edf2f7",
                                                color: "#334155",
                                                wordBreak: "break-word"
                                            }}
                                        >
                                            {row.supplier}
                                        </td>

                                        <td
                                            style={{
                                                padding: "10px 8px",
                                                borderBottom: "1px solid #edf2f7",
                                                color: "#334155",
                                                wordBreak: "break-word"
                                            }}
                                        >
                                            {row.itemName}
                                        </td>

                                        <td
                                            style={{
                                                padding: "10px 8px",
                                                borderBottom: "1px solid #edf2f7",
                                                textAlign: "right",
                                                color: "#0f172a",
                                                fontVariantNumeric: "tabular-nums",
                                                whiteSpace: "nowrap"
                                            }}
                                        >
                                            {formatNumber(row.qty)}
                                        </td>

                                        <td
                                            style={{
                                                padding: "10px 8px",
                                                borderBottom: "1px solid #edf2f7",
                                                textAlign: "right",
                                                color: "#0f172a",
                                                fontVariantNumeric: "tabular-nums",
                                                whiteSpace: "nowrap"
                                            }}
                                        >
                                            {formatNumber(row.rate)}
                                        </td>

                                        <td
                                            style={{
                                                padding: "10px 8px",
                                                borderBottom: "1px solid #edf2f7",
                                                textAlign: "right",
                                                color: "#0f172a",
                                                fontWeight: 600,
                                                fontVariantNumeric: "tabular-nums",
                                                whiteSpace: "nowrap"
                                            }}
                                        >
                                            {formatNumber(row.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                            <tfoot>
                                <tr style={{ background: "#f1f5f9" }}>
                                    <td
                                        colSpan={5}
                                        style={{
                                            padding: "14px 8px",
                                            borderTop: "2px solid #dbe3ea",
                                            textAlign: "right",
                                            fontWeight: "700",
                                            color: "#0f172a"
                                        }}
                                    >
                                        TOTAL
                                    </td>

                                    <td
                                        style={{
                                            padding: "14px 8px",
                                            borderTop: "2px solid #dbe3ea",
                                            textAlign: "right",
                                            fontWeight: "700",
                                            color: "#0f172a"
                                        }}
                                    >
                                        {formatNumber(totalQty)}
                                    </td>

                                    <td
                                        style={{
                                            padding: "14px 8px",
                                            borderTop: "2px solid #dbe3ea",
                                            textAlign: "center"
                                        }}
                                    >
                                        -
                                    </td>

                                    <td
                                        style={{
                                            padding: "14px 8px",
                                            borderTop: "2px solid #dbe3ea",
                                            textAlign: "right",
                                            fontWeight: "700",
                                            color: "#0f172a"
                                        }}
                                    >
                                        {formatNumber(totalAmount)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {flatData.length === 0 &&
                !loading &&
                !error && (
                    <div className="rp-no-data">
                        📊 Select filters and
                        click Generate Report
                    </div>
                )}
        </ReportTemplate>
    );
}