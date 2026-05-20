//import React, { useState, useEffect } from "react";
//import reportApi from "../../../api/reportApi";
//import { getCoaTree } from "../../../api/coaApi";
//import itemApi from "../../../api/itemApi";
//import { FaSearch, FaChevronDown, FaChevronRight } from "react-icons/fa";
//import ReportTemplate from "../ReportTemplate";

//export default function PurchaseReturnReport() {
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
//                    const code = acc.AcctCode || acc.acctCode || "";
//                    const name = acc.AcctName || acc.acctName || "";
//                    const cat = (acc.AccountCategory || acc.accountCategory || "").trim();
//                    if (acc.acctLast && cat === "Supplier" && id) suppList.push({ acctID: id, label: `${code} - ${name}` });
//                    if (acc.children?.length) flatten(acc.children);
//                }
//            };
//            flatten(coaRes.data?.data || coaRes.data || []);
//            setSuppliers(suppList);
//            setItems((itemRes.data?.data || itemRes.data || []).map(i => ({ itemID: i.itemID || i.ItemID, label: i.itemName || i.ItemName })));
//        } catch (err) { }
//    };

//    const handleSearch = async () => {
//        setLoading(true); setError("");
//        try {
//            const res = await reportApi.getPurchaseReturnReport(fromDate, toDate, selectedSupplier || null, selectedItem || null);
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
//        <ReportTemplate title="PURCHASE RETURN REPORT" subtitle="Summary & detail of purchase returns" filters={filters} printedBy="admin"
//            metaFields={data ? [{ label: "Returns", value: data.length }, { label: "Total Qty", value: f(totalQty) }, { label: "Total Amount", value: f(totalAmount) }] : null}>
//            {error && <div className="rp-error">⚠ {error}</div>}
//            {loading && <div className="rp-no-data">⏳ Loading...</div>}
//            {data && !loading && data.map((r) => (
//                <div key={r.returnID} style={{ marginBottom: 16 }}>
//                    <div style={{ display: 'flex', gap: 16, padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafbfc', marginBottom: 4, cursor: 'pointer' }} onClick={() => toggleExpand(r.returnID)}>
//                        <div style={{ flex: 1 }}><strong>{r.billNumb}</strong></div>
//                        <div style={{ flex: 1 }}>{formatDt(r.tranDate)}</div>
//                        <div style={{ flex: 2 }}>{r.supplierName}</div>
//                        <div style={{ flex: 1, textAlign: 'center' }}>{r.totalQty} qty</div>
//                        <div style={{ flex: 1, textAlign: 'right', fontWeight: 700 }}>{f(r.totalAmount)}</div>
//                        <div style={{ width: 24, textAlign: 'center', color: '#2563eb' }}>{expanded[r.returnID] ? <FaChevronDown /> : <FaChevronRight />}</div>
//                    </div>
//                    {expanded && expanded[r.returnID] && (
//                        <div className="rp-table-wrapper"><table className="rp-table" style={{ fontSize: 10 }}><thead><tr><th>Item</th><th>Model</th><th className="text-center">Qty</th><th className="text-right">Rate</th><th className="text-right">Amount</th></tr></thead><tbody>{r.items?.map((item, idx) => (<tr key={idx}><td>{item.itemName}</td><td>{item.model || '-'}</td><td className="text-center">{item.quantity}</td><td className="text-right">{f(item.rate)}</td><td className="text-right">{f(item.amount)}</td></tr>))}</tbody></table></div>
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

export default function PurchaseReturnReport() {
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
                await reportApi.getPurchaseReturnReport(
                    fromDate,
                    toDate,
                    selectedSupplier || null,
                    selectedItem || null
                );

            const nestedData =
                res.data?.data || [];

            const flat = [];

            for (const ret of nestedData) {
                if (
                    ret.items &&
                    ret.items.length > 0
                ) {
                    for (const item of ret.items) {
                        flat.push({
                            billNo:
                                ret.billNumb || "-",
                            date:
                                ret.tranDate || "",
                            supplier:
                                ret.supplierName ||
                                "-",
                            itemName:
                                item.itemName || "-",
                            model:
                                item.model || "",
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
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        return `${String(dt.getDate()).padStart(2, '0')}-${months[dt.getMonth()]}-${dt.getFullYear()}`;
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

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const generatedOn = new Date().toLocaleString();

        const supplierFilter = selectedSupplier
            ? suppliers.find((s) => s.acctID == selectedSupplier)?.label || "Selected Supplier"
            : "All Suppliers";

        const itemFilter = selectedItem
            ? items.find((i) => i.itemID == selectedItem)?.label || "Selected Item"
            : "All Items";

        // ===== HEADER =====
        doc.setFont("helvetica");
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("PURCHASE RETURN REPORT", pageWidth / 2, 12, { align: "center" });

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");

        doc.text(`Branch: ${branchName}`, 4, 20);
        doc.text(`Date Range: ${fromDate} to ${toDate}`, 4, 25);
        doc.text(`Supplier: ${supplierFilter}`, 4, 30);
        doc.text(`Item: ${itemFilter}`, 4, 35);

        doc.text(`Generated By: ${loggedInUser}`, pageWidth - 4, 20, { align: "right" });
        doc.text(`Generated On: ${generatedOn}`, pageWidth - 4, 25, { align: "right" });

        // ===== TABLE BODY =====
        const body = flatData.map((row, index) => [
            index + 1,
            row.billNo,
            formatDate(row.date),
            row.supplier,
            row.itemName + (row.model ? ` (${row.model})` : ""),
            formatNumber(row.qty),
            formatNumber(row.rate),
            formatNumber(row.amount)
        ]);

        // ===== TOTAL ROW =====
        body.push([
            { content: "TOTAL", colSpan: 5, styles: { halign: "right", fontStyle: "bold", fontSize: 8 } },
            { content: formatNumber(totalQty), styles: { halign: "right", fontStyle: "bold", fontSize: 8 } },
            { content: "", styles: { halign: "center" } },
            { content: formatNumber(totalAmount), styles: { halign: "right", fontStyle: "bold", fontSize: 8 } }
        ]);

        // ===== TABLE =====
        // ===== TABLE =====
        autoTable(doc, {
            startY: 40,
            head: [["#", "BILL NO", "DATE", "SUPPLIER", "ITEM", "QTY", "RATE", "AMOUNT"]],
            body: body,
            theme: "plain",

            // 🔥🔥🔥 ULTIMATE FULL WIDTH FORCE - 8 COLUMNS
            tableWidth: 291,

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

            // 🔥 8 COLUMNS FULL WIDTH - TOTAL = 291mm
            columnStyles: {
                0: { cellWidth: 10, halign: "center" },      // # = 10mm
                1: { cellWidth: 52 },                          // BILL NO = 52mm
                2: { cellWidth: 26, halign: "center" },       // DATE = 26mm
                3: { cellWidth: 48 },                          // SUPPLIER = 48mm
                4: { cellWidth: 65 },                          // ITEM = 65mm
                5: { cellWidth: 22, halign: "right" },        // QTY = 22mm
                6: { cellWidth: 30, halign: "right" },        // RATE = 30mm
                7: { cellWidth: 38, halign: "right" }         // AMOUNT = 38mm
            },
            // TOTAL: 10+52+26+48+65+22+30+38 = 291mm ✅

            margin: { left: 3, right: 3, top: 5, bottom: 10 },

            didDrawPage: (data) => {
                doc.setFontSize(6.5);
                doc.setTextColor(130, 130, 130);
                doc.text(`Page ${data.pageNumber}`, pageWidth - 6, pageHeight - 5, { align: "right" });
                doc.text(`${loggedInUser} | ${generatedOn}`, 4, pageHeight - 5);
            }
        });

        doc.save(`PurchaseReturnReport_${fromDate}_to_${toDate}.pdf`);
    };

    // ================= EXCEL =================
    const exportExcel = () => {
        if (flatData.length === 0) {
            alert("No data available");
            return;
        }

        const excelData = flatData.map((row, idx) => ({
            "#": idx + 1,
            "BILL NO": row.billNo,
            DATE: formatDate(row.date),
            SUPPLIER: row.supplier,
            ITEM: row.itemName + (row.model ? ` (${row.model})` : ""),
            QTY: row.qty,
            RATE: row.rate,
            AMOUNT: row.amount
        }));

        excelData.push({
            "#": "",
            "BILL NO": "",
            DATE: "",
            SUPPLIER: "TOTAL",
            ITEM: "",
            QTY: totalQty,
            RATE: "",
            AMOUNT: totalAmount
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        worksheet["!cols"] = [
            { wch: 6 }, { wch: 38 }, { wch: 16 }, { wch: 30 },
            { wch: 50 }, { wch: 12 }, { wch: 15 }, { wch: 18 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Return Report");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `PurchaseReturnReport_${fromDate}_to_${toDate}.xlsx`);
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
            <div className="rp-filter-group" style={{ minWidth: 220 }}>
                <label>Supplier</label>
                <select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)}>
                    <option value="">All Suppliers</option>
                    {suppliers.map((s) => (
                        <option key={s.acctID} value={s.acctID}>{s.label}</option>
                    ))}
                </select>
            </div>
            <div className="rp-filter-group" style={{ minWidth: 220 }}>
                <label>Item</label>
                <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
                    <option value="">All Items</option>
                    {items.map((i) => (
                        <option key={i.itemID} value={i.itemID}>{i.label}</option>
                    ))}
                </select>
            </div>
            <button className="rp-btn-search" onClick={handleSearch} disabled={loading}>
                <FaSearch /> {loading ? "Loading..." : "Generate"}
            </button>
        </>
    );

    const exportButtons = flatData.length > 0 ? (
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
            title="PURCHASE RETURN REPORT"
            subtitle="Summary & detail of purchase returns"
            filters={filters}
            printedBy={loggedInUser}
            extraActions={exportButtons}
            metaFields={flatData.length > 0 ? [
                { label: "Total Records", value: flatData.length },
                { label: "Total Qty", value: formatNumber(totalQty) },
                { label: "Total Amount", value: formatNumber(totalAmount) }
            ] : null}
        >
            {error && <div className="rp-error">⚠ {error}</div>}
            {loading && <div className="rp-no-data">⏳ Loading...</div>}

            {flatData.length > 0 && !loading && (
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
                                    <th style={thStyle("4%", "center")}>#</th>
                                    <th style={thStyle("18%", "left")}>BILL NO</th>
                                    <th style={thStyle("12%", "center")}>DATE</th>
                                    <th style={thStyle("16%", "left")}>SUPPLIER</th>
                                    <th style={thStyle("20%", "left")}>ITEM</th>
                                    <th style={thStyle("8%", "right")}>QTY</th>
                                    <th style={thStyle("10%", "right")}>RATE</th>
                                    <th style={thStyle("12%", "right")}>AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {flatData.map((row, idx) => (
                                    <tr key={idx} style={{ background: idx % 2 === 0 ? "#ffffff" : "#f9fbfd" }}>
                                        <td style={tdStyle("center", "#475569")}>{idx + 1}</td>
                                        <td style={tdStyle("left", "#334155", false, true, true)}>{row.billNo}</td>
                                        <td style={tdStyle("center", "#475569", true)}>{formatDate(row.date)}</td>
                                        <td style={tdStyle("left", "#334155", false, true)}>{row.supplier}</td>
                                        <td style={tdStyle("left", "#334155", false, true)}>
                                            {row.itemName}{row.model ? ` (${row.model})` : ""}
                                        </td>
                                        <td style={tdStyle("right", "#0f172a", true)}>{formatNumber(row.qty)}</td>
                                        <td style={tdStyle("right", "#0f172a", true)}>{formatNumber(row.rate)}</td>
                                        <td style={tdStyle("right", "#0f172a", true, false, true)}>{formatNumber(row.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: "#f1f5f9" }}>
                                    <td colSpan={5} style={tfStyle("right")}>TOTAL</td>
                                    <td style={tfStyle("right")}>{formatNumber(totalQty)}</td>
                                    <td style={tfStyle("center")}>-</td>
                                    <td style={tfStyle("right", "#0f172a")}>{formatNumber(totalAmount)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {flatData.length === 0 && !loading && !error && (
                <div className="rp-no-data">📊 Select filters and click "Generate Report"</div>
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