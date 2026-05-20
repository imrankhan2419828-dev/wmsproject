//import React, { useState, useEffect } from "react";
//import reportApi from "../../../api/reportApi";
//import itemApi from "../../../api/itemApi";
//import godownApi from "../../../api/godownApi";
//import companyApi from "../../../api/companyApi";
//import categoryApi from "../../../api/categoryApi";
//import subcategoryApi from "../../../api/subcategoryApi";
//import { FaSearch } from "react-icons/fa";
//import ReportTemplate from "../ReportTemplate";

//export default function StockReport() {
//    const [loading, setLoading] = useState(false);
//    const [items, setItems] = useState([]);
//    const [godowns, setGodowns] = useState([]);
//    const [companies, setCompanies] = useState([]);
//    const [categories, setCategories] = useState([]);
//    const [subcategories, setSubcategories] = useState([]);
//    const [selectedItem, setSelectedItem] = useState("");
//    const [selectedGodown, setSelectedGodown] = useState("");
//    const [selectedCompany, setSelectedCompany] = useState("");
//    const [selectedCategory, setSelectedCategory] = useState("");
//    const [selectedSubcategory, setSelectedSubcategory] = useState("");
//    const [showRateValue, setShowRateValue] = useState(true);
//    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
//    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
//    const [data, setData] = useState(null);
//    const [error, setError] = useState("");

//    useEffect(() => {
//        const load = async () => {
//            try {
//                const [itemRes, godownRes, compRes, catRes] = await Promise.all([
//                    itemApi.getAll(), godownApi.getAll(), companyApi.getAll(), categoryApi.getAll()
//                ]);
//                setItems((itemRes.data?.data || itemRes.data || []).map(i => ({ itemID: i.itemID || i.ItemID, label: i.itemName || i.ItemName })));
//                setGodowns((godownRes.data?.data || godownRes.data || []).map(g => ({ godnID: g.godnID || g.GodnID, label: g.godnName || g.GodnName })));
//                setCompanies((compRes.data?.data || compRes.data || []).map(c => ({ compID: c.compID || c.CompID || c.id, label: c.compName || c.CompName })));
//                setCategories((catRes.data?.data || catRes.data || []).map(c => ({ catgID: c.catgID || c.CatgID || c.id, label: c.catgName || c.CatgName })));
//            } catch (err) { }
//        };
//        load();
//    }, []);

//    useEffect(() => {
//        if (selectedCategory) {
//            subcategoryApi.getByCategory(selectedCategory).then(res => {
//                setSubcategories((res.data?.data || res.data || []).map(s => ({ subcatID: s.subcatID || s.SubcatID, label: s.subcatName || s.SubcatName })));
//            }).catch(() => setSubcategories([]));
//        } else { setSubcategories([]); setSelectedSubcategory(""); }
//    }, [selectedCategory]);

//    const handleSearch = async () => {
//        setLoading(true); setError("");
//        try {
//            const res = await reportApi.getStockReport(fromDate, toDate, selectedItem || null, selectedCompany || null, selectedCategory || null, selectedSubcategory || null, selectedGodown || null, showRateValue);
//            setData(res.data?.data || null);
//        } catch (err) { setError(err.response?.data?.message || "Failed"); }
//        finally { setLoading(false); }
//    };

//    const f = (n) => n != null ? new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) : "-";
//    const totalValue = data?.reduce((s, d) => s + (d.stockValue || 0), 0) || 0;

//    const filters = (
//        <>
//            <div className="rp-filter-group"><label>From</label><input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
//            <div className="rp-filter-group"><label>To</label><input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
//            <div className="rp-filter-group" style={{ minWidth: 150 }}><label>Company</label><select value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}><option value="">All</option>{companies.map(c => <option key={c.compID} value={c.compID}>{c.label}</option>)}</select></div>
//            <div className="rp-filter-group" style={{ minWidth: 150 }}><label>Category</label><select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}><option value="">All</option>{categories.map(c => <option key={c.catgID} value={c.catgID}>{c.label}</option>)}</select></div>
//            <div className="rp-filter-group" style={{ minWidth: 150 }}><label>Subcategory</label><select value={selectedSubcategory} onChange={e => setSelectedSubcategory(e.target.value)} disabled={!selectedCategory}><option value="">All</option>{subcategories.map(s => <option key={s.subcatID} value={s.subcatID}>{s.label}</option>)}</select></div>
//            <div className="rp-filter-group" style={{ minWidth: 150 }}><label>Item</label><select value={selectedItem} onChange={e => setSelectedItem(e.target.value)}><option value="">All</option>{items.map(i => <option key={i.itemID} value={i.itemID}>{i.label}</option>)}</select></div>
//            <div className="rp-filter-group" style={{ minWidth: 150 }}><label>Godown</label><select value={selectedGodown} onChange={e => setSelectedGodown(e.target.value)}><option value="">All</option>{godowns.map(g => <option key={g.godnID} value={g.godnID}>{g.label}</option>)}</select></div>
//            <div className="rp-filter-group" style={{ alignItems: 'center' }}>
//                <label style={{ marginBottom: 4 }}>Show Rate/Value</label>
//                <input type="checkbox" checked={showRateValue} onChange={e => setShowRateValue(e.target.checked)} style={{ width: 20, height: 20, cursor: 'pointer' }} />
//            </div>
//            <button className="rp-btn-search" onClick={handleSearch} disabled={loading}><FaSearch /> {loading ? "Loading..." : "Generate"}</button>
//        </>
//    );

//    return (
//        <ReportTemplate title="STOCK REPORT" subtitle="Item-wise stock position" filters={filters} printedBy="admin"
//            metaFields={data ? [{ label: "Items", value: data.length }, { label: "Total Value", value: showRateValue ? f(totalValue) : "N/A" }] : null}>
//            {error && <div className="rp-error">⚠ {error}</div>}
//            {loading && <div className="rp-no-data">⏳ Loading...</div>}
//            {data && !loading && (
//                <div className="rp-table-wrapper"><table className="rp-table" style={{ fontSize: 10 }}>
//                    <thead><tr>
//                        <th>Item</th><th>Model</th><th>Company</th><th>Category</th>
//                        <th className="text-center">Opening</th><th className="text-center">Purch</th><th className="text-center">P.Ret</th>
//                        <th className="text-center">Sale</th><th className="text-center">S.Ret</th><th className="text-center">Stock</th>
//                        {showRateValue && <><th className="text-right">Rate</th><th className="text-right">Value</th></>}
//                    </tr></thead>
//                    <tbody>{data.map((d, i) => (<tr key={i}>
//                        <td>{d.itemName}</td><td>{d.model || '-'}</td><td>{d.company || '-'}</td><td>{d.category || '-'}</td>
//                        <td className="text-center">{d.openingStock}</td><td className="text-center">{d.purchaseQty}</td><td className="text-center">{d.purchaseReturnQty}</td>
//                        <td className="text-center">{d.saleQty}</td><td className="text-center">{d.saleReturnQty}</td><td className="text-center"><strong>{d.currentStock}</strong></td>
//                        {showRateValue && <><td className="text-right">{f(d.avgRate)}</td><td className="text-right"><strong>{f(d.stockValue)}</strong></td></>}
//                    </tr>))}</tbody>
//                </table></div>
//            )}
//            {!data && !loading && !error && <div className="rp-no-data">📊 Select filters and click "Generate Report"</div>}
//        </ReportTemplate>
//    );
//}

import React, { useState, useEffect } from "react";
import reportApi from "../../../api/reportApi";
import itemApi from "../../../api/itemApi";
import godownApi from "../../../api/godownApi";
import companyApi from "../../../api/companyApi";
import categoryApi from "../../../api/categoryApi";
import subcategoryApi from "../../../api/subcategoryApi";
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

export default function StockReport() {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [godowns, setGodowns] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [selectedItem, setSelectedItem] = useState("");
    const [selectedGodown, setSelectedGodown] = useState("");
    const [selectedCompany, setSelectedCompany] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubcategory, setSelectedSubcategory] = useState("");
    const [showRateValue, setShowRateValue] = useState(true);
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

    useEffect(() => {
        const load = async () => {
            try {
                const [itemRes, godownRes, compRes, catRes] = await Promise.all([
                    itemApi.getAll(), godownApi.getAll(), companyApi.getAll(), categoryApi.getAll()
                ]);
                setItems((itemRes.data?.data || itemRes.data || []).map(i => ({ itemID: i.itemID || i.ItemID, label: i.itemName || i.ItemName })));
                setGodowns((godownRes.data?.data || godownRes.data || []).map(g => ({ godnID: g.godnID || g.GodnID, label: g.godnName || g.GodnName })));
                setCompanies((compRes.data?.data || compRes.data || []).map(c => ({ compID: c.compID || c.CompID || c.id, label: c.compName || c.CompName })));
                setCategories((catRes.data?.data || catRes.data || []).map(c => ({ catgID: c.catgID || c.CatgID || c.id, label: c.catgName || c.CatgName })));
            } catch (err) { }
        };
        load();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            subcategoryApi.getByCategory(selectedCategory).then(res => {
                setSubcategories((res.data?.data || res.data || []).map(s => ({ subcatID: s.subcatID || s.SubcatID, label: s.subcatName || s.SubcatName })));
            }).catch(() => setSubcategories([]));
        } else { setSubcategories([]); setSelectedSubcategory(""); }
    }, [selectedCategory]);

    const handleSearch = async () => {
        setLoading(true); setError("");
        try {
            const res = await reportApi.getStockReport(fromDate, toDate, selectedItem || null, selectedCompany || null, selectedCategory || null, selectedSubcategory || null, selectedGodown || null, showRateValue);
            setData(res.data?.data || null);
        } catch (err) { setError(err.response?.data?.message || "Failed"); }
        finally { setLoading(false); }
    };

    const formatNumber = (n) => n != null ? new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) : "-";
    const totalValue = data?.reduce((s, d) => s + (d.stockValue || 0), 0) || 0;

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

        const pageWidth = doc.internal.pageSize.getWidth();  // 297mm
        const pageHeight = doc.internal.pageSize.getHeight();
        const generatedOn = new Date().toLocaleString();

        // ===== HEADER =====
        doc.setFont("helvetica");
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("STOCK REPORT", pageWidth / 2, 10, { align: "center" });

        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        doc.text(`Branch: ${branchName}`, 5, 16);
        doc.text(`Period: ${fromDate} to ${toDate}`, 5, 20);
        doc.text(`Items: ${data.length} | Total Value: ${showRateValue ? formatNumber(totalValue) : "N/A"}`, 5, 24);

        doc.text(`Generated By: ${loggedInUser}`, pageWidth - 5, 16, { align: "right" });
        doc.text(`Generated On: ${generatedOn}`, pageWidth - 5, 20, { align: "right" });

        // ===== TABLE HEAD & BODY =====
        const headBase = ["#", "ITEM", "MODEL", "COMPANY", "CATEGORY", "OPEN", "PURCH", "P.RET", "SALE", "S.RET", "STOCK"];
        const headFull = [...headBase, "RATE", "VALUE"];
        const head = showRateValue ? headFull : headBase;

        const body = data.map((d, index) => {
            const row = [
                index + 1,
                d.itemName || "-",
                d.model || "-",
                d.company || "-",
                d.category || "-",
                d.openingStock || 0,
                d.purchaseQty || 0,
                d.purchaseReturnQty || 0,
                d.saleQty || 0,
                d.saleReturnQty || 0,
                d.currentStock || 0
            ];
            if (showRateValue) {
                row.push(formatNumber(d.avgRate));
                row.push(formatNumber(d.stockValue));
            }
            return row;
        });

        // ===== TABLE - PERFECT FIT WITH GAPS =====
        autoTable(doc, {
            startY: 28,
            head: [head],
            body: body,
            theme: "plain",

            // ❌ REMOVE THIS
            // tableWidth: 287,

            // ✅ ADD THIS
            tableWidth: "auto",

            styles: {
                font: "helvetica",
                fontSize: 6.5,
                cellPadding: 1.5,
                valign: "middle",
                overflow: "linebreak",
                halign: "left",
                lineWidth: 0,
            },

            margin: {
                left: 5,
                right: 5,
                top: 3,
                bottom: 10
            },

            columnStyles: showRateValue ? {
                0: { cellWidth: 8, halign: "center" },
                1: { cellWidth: 52 }, // ITEM increase
                2: { cellWidth: 22 },
                3: { cellWidth: 28 },
                4: { cellWidth: 28 },
                5: { cellWidth: 15, halign: "center" },
                6: { cellWidth: 15, halign: "center" },
                7: { cellWidth: 15, halign: "center" },
                8: { cellWidth: 15, halign: "center" },
                9: { cellWidth: 15, halign: "center" },
                10: { cellWidth: 15, halign: "center" },
                11: { cellWidth: 28, halign: "right" },
                12: { cellWidth: 31, halign: "right" }
            } : {
                0: { cellWidth: 8, halign: "center" },
                1: { cellWidth: 60 },
                2: { cellWidth: 28 },
                3: { cellWidth: 35 },
                4: { cellWidth: 35 },
                5: { cellWidth: 18, halign: "center" },
                6: { cellWidth: 18, halign: "center" },
                7: { cellWidth: 18, halign: "center" },
                8: { cellWidth: 18, halign: "center" },
                9: { cellWidth: 18, halign: "center" },
                10: { cellWidth: 21, halign: "center" }
            },

            didDrawPage: (data) => {
                doc.setFontSize(6);
                doc.setTextColor(130, 130, 130);

                doc.text(
                    `Page ${data.pageNumber}`,
                    pageWidth - 5,
                    pageHeight - 5,
                    { align: "right" }
                );

                doc.text(
                    `${loggedInUser} | ${generatedOn}`,
                    5,
                    pageHeight - 5
                );
            }
        });

        doc.save(`StockReport_${fromDate}_to_${toDate}.pdf`);
    };

    // ================= EXCEL =================
    const exportExcel = () => {
        if (!data || data.length === 0) {
            alert("No data available");
            return;
        }

        const excelData = data.map((d, idx) => {
            const row = {
                "#": idx + 1,
                ITEM: d.itemName || "-",
                MODEL: d.model || "-",
                COMPANY: d.company || "-",
                CATEGORY: d.category || "-",
                OPENING: d.openingStock || 0,
                PURCHASE: d.purchaseQty || 0,
                "PURCH RETURN": d.purchaseReturnQty || 0,
                SALE: d.saleQty || 0,
                "SALE RETURN": d.saleReturnQty || 0,
                STOCK: d.currentStock || 0
            };
            if (showRateValue) {
                row.RATE = d.avgRate || 0;
                row.VALUE = d.stockValue || 0;
            }
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const cols = showRateValue
            ? [{ wch: 6 }, { wch: 30 }, { wch: 18 }, { wch: 22 }, { wch: 22 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 14 }]
            : [{ wch: 6 }, { wch: 35 }, { wch: 20 }, { wch: 25 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
        worksheet["!cols"] = cols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Report");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `StockReport_${fromDate}_to_${toDate}.xlsx`);
    };

    const handlePrint = () => { window.print(); };

    const filters = (
        <>
            <div className="rp-filter-group"><label>From</label><input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
            <div className="rp-filter-group"><label>To</label><input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
            <div className="rp-filter-group" style={{ minWidth: 150 }}><label>Company</label><select value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}><option value="">All</option>{companies.map(c => <option key={c.compID} value={c.compID}>{c.label}</option>)}</select></div>
            <div className="rp-filter-group" style={{ minWidth: 150 }}><label>Category</label><select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}><option value="">All</option>{categories.map(c => <option key={c.catgID} value={c.catgID}>{c.label}</option>)}</select></div>
            <div className="rp-filter-group" style={{ minWidth: 150 }}><label>Subcategory</label><select value={selectedSubcategory} onChange={e => setSelectedSubcategory(e.target.value)} disabled={!selectedCategory}><option value="">All</option>{subcategories.map(s => <option key={s.subcatID} value={s.subcatID}>{s.label}</option>)}</select></div>
            <div className="rp-filter-group" style={{ minWidth: 150 }}><label>Item</label><select value={selectedItem} onChange={e => setSelectedItem(e.target.value)}><option value="">All</option>{items.map(i => <option key={i.itemID} value={i.itemID}>{i.label}</option>)}</select></div>
            <div className="rp-filter-group" style={{ minWidth: 150 }}><label>Godown</label><select value={selectedGodown} onChange={e => setSelectedGodown(e.target.value)}><option value="">All</option>{godowns.map(g => <option key={g.godnID} value={g.godnID}>{g.label}</option>)}</select></div>
            <div className="rp-filter-group" style={{ alignItems: 'center' }}>
                <label style={{ marginBottom: 4 }}>Show Rate/Value</label>
                <input type="checkbox" checked={showRateValue} onChange={e => setShowRateValue(e.target.checked)} style={{ width: 20, height: 20, cursor: 'pointer' }} />
            </div>
            <button className="rp-btn-search" onClick={handleSearch} disabled={loading}><FaSearch /> {loading ? "Loading..." : "Generate"}</button>
        </>
    );

    const exportButtons = data && data.length > 0 ? (
        <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={exportPDF} style={{ background: "#dc2626", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}><FaFilePdf /> PDF</button>
            <button onClick={exportExcel} style={{ background: "#16a34a", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}><FaFileExcel /> Excel</button>
            <button onClick={handlePrint} style={{ background: "#475569", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}><FaPrint /> Print</button>
        </div>
    ) : null;

    return (
        <ReportTemplate
            title="STOCK REPORT"
            subtitle="Item-wise stock position"
            filters={filters}
            printedBy={loggedInUser}
            extraActions={exportButtons}
            metaFields={data ? [{ label: "Items", value: data.length }, { label: "Total Value", value: showRateValue ? formatNumber(totalValue) : "N/A" }] : null}
        >
            {error && <div className="rp-error">⚠ {error}</div>}
            {loading && <div className="rp-no-data">⏳ Loading...</div>}

            {data && !loading && (
                <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", width: "100%" }}>
                    <div style={{ overflowX: "auto", width: "100%" }}>
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "clamp(9px, 1.1vw, 11px)", fontFamily: "'Segoe UI', sans-serif", tableLayout: "auto" }}>
                            <thead>
                                <tr style={{ background: "#f8fafc" }}>
                                    <th style={thStyle("3%", "center")}>#</th>
                                    <th style={thStyle("12%", "left")}>ITEM</th>
                                    <th style={thStyle("8%", "left")}>MODEL</th>
                                    <th style={thStyle("10%", "left")}>COMPANY</th>
                                    <th style={thStyle("10%", "left")}>CATEGORY</th>
                                    <th style={thStyle("6%", "center")}>OPEN</th>
                                    <th style={thStyle("6%", "center")}>PURCH</th>
                                    <th style={thStyle("6%", "center")}>P.RET</th>
                                    <th style={thStyle("6%", "center")}>SALE</th>
                                    <th style={thStyle("6%", "center")}>S.RET</th>
                                    <th style={thStyle("7%", "center")}>STOCK</th>
                                    {showRateValue && <><th style={thStyle("8%", "right")}>RATE</th><th style={thStyle("10%", "right")}>VALUE</th></>}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((d, idx) => (
                                    <tr key={idx} style={{ background: idx % 2 === 0 ? "#ffffff" : "#f9fbfd" }}>
                                        <td style={tdStyle("center", "#475569")}>{idx + 1}</td>
                                        <td style={tdStyle("left", "#334155", false, true)}>{d.itemName || "-"}</td>
                                        <td style={tdStyle("left", "#64748b")}>{d.model || "-"}</td>
                                        <td style={tdStyle("left", "#64748b")}>{d.company || "-"}</td>
                                        <td style={tdStyle("left", "#64748b")}>{d.category || "-"}</td>
                                        <td style={tdStyle("center", "#0f172a")}>{d.openingStock || 0}</td>
                                        <td style={tdStyle("center", "#16a34a")}>{d.purchaseQty || 0}</td>
                                        <td style={tdStyle("center", "#dc2626")}>{d.purchaseReturnQty || 0}</td>
                                        <td style={tdStyle("center", "#2563eb")}>{d.saleQty || 0}</td>
                                        <td style={tdStyle("center", "#d97706")}>{d.saleReturnQty || 0}</td>
                                        <td style={tdStyle("center", "#0f172a", false, false, true)}>{d.currentStock || 0}</td>
                                        {showRateValue && <><td style={tdStyle("right", "#0f172a", true)}>{formatNumber(d.avgRate)}</td><td style={tdStyle("right", "#0f172a", true, false, true)}>{formatNumber(d.stockValue)}</td></>}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!data && !loading && !error && <div className="rp-no-data">📊 Select filters and click "Generate Report"</div>}
        </ReportTemplate>
    );
}

// ========== STYLE HELPERS ==========
const thStyle = (width, align) => ({
    padding: "10px 6px", borderBottom: "2px solid #e2e8f0", textAlign: align,
    color: "#0f172a", fontWeight: "700", whiteSpace: "nowrap",
    fontSize: "10px", width: width, textTransform: "uppercase", letterSpacing: "0.5px"
});

const tdStyle = (align, color = "#334155", nowrap = false, wordBreak = false, bold = false) => ({
    padding: "8px 6px", borderBottom: "1px solid #edf2f7", textAlign: align,
    color: color, fontWeight: bold ? 600 : 400,
    whiteSpace: nowrap ? "nowrap" : "normal", wordBreak: wordBreak ? "break-word" : "normal",
    fontSize: "11px", fontVariantNumeric: align === "right" ? "tabular-nums" : "normal"
});