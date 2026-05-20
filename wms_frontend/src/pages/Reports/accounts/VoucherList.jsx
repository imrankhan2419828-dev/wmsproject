//import React, { useState, useEffect } from "react";
//import { useNavigate } from "react-router-dom";
//import voucherApi from "../../../api/voucherApi";
//import vochTypeApi from "../../../api/vochTypeApi";
//import { FaEye, FaSearch } from "react-icons/fa";
//import ReportTemplate from "../ReportTemplate";

//export default function VoucherList() {
//    const navigate = useNavigate();
//    const [vouchers, setVouchers] = useState([]);
//    const [voucherTypes, setVoucherTypes] = useState([]);
//    const [loading, setLoading] = useState(false);
//    const [filters, setFilters] = useState({ vochType: "", fromDate: "", toDate: "" });
//    const [searched, setSearched] = useState(false);

//    useEffect(() => { loadVoucherTypes(); }, []);

//    const loadVoucherTypes = async () => {
//        try {
//            const res = await vochTypeApi.getAll();
//            setVoucherTypes(res.data?.data || res.data || []);
//        } catch (err) { }
//    };

//    const handleSearch = async () => {
//        setLoading(true);
//        setSearched(true);
//        try {
//            const params = {};
//            if (filters.vochType) params.vochType = filters.vochType;
//            if (filters.fromDate) params.fromDate = filters.fromDate;
//            if (filters.toDate) params.toDate = filters.toDate;
//            const res = await voucherApi.getAll(params);
//            setVouchers(res.data?.data || res.data || []);
//        } catch (err) {
//            console.error(err);
//        } finally {
//            setLoading(false);
//        }
//    };

//    const handleView = (id) => navigate(`/voucher-detail/${id}`);

//    const getVoucherTypeName = (type) => voucherTypes.find(v => v.vochType === type)?.vochName || type;

//    const formatDt = (d) => {
//        if (!d) return "";
//        const dt = new Date(d);
//        const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//        return `${String(dt.getDate()).padStart(2, '0')}-${m[dt.getMonth()]}-${dt.getFullYear()}`;
//    };

//    const filtersBar = (
//        <>
//            <div className="rp-filter-group">
//                <label>From</label>
//                <input type="date" value={filters.fromDate} onChange={e => setFilters({ ...filters, fromDate: e.target.value })} />
//            </div>
//            <div className="rp-filter-group">
//                <label>To</label>
//                <input type="date" value={filters.toDate} onChange={e => setFilters({ ...filters, toDate: e.target.value })} />
//            </div>
//            <div className="rp-filter-group" style={{ minWidth: 180 }}>
//                <label>Type</label>
//                <select value={filters.vochType} onChange={e => setFilters({ ...filters, vochType: e.target.value })}>
//                    <option value="">All Types</option>
//                    {voucherTypes.filter(v => !v.inActive).map(v => <option key={v.vochType} value={v.vochType}>{v.vochName}</option>)}
//                </select>
//            </div>
//            <button className="rp-btn-search" onClick={handleSearch} disabled={loading}>
//                <FaSearch /> {loading ? "Loading..." : "Search"}
//            </button>
//        </>
//    );

//    const totalPosted = vouchers.filter(v => v.isPosted).length;
//    const totalPending = vouchers.filter(v => !v.isPosted).length;

//    return (
//        <ReportTemplate
//            title="VOUCHER LIST"
//            subtitle="All accounting vouchers with status"
//            filters={filtersBar}
//            printedBy="admin"
//            metaFields={searched ? [
//                { label: "Total Vouchers", value: vouchers.length },
//                { label: "Posted", value: totalPosted },
//                { label: "Pending", value: totalPending },
//            ] : null}
//        >
//            {loading && <div className="rp-no-data">⏳ Loading vouchers...</div>}

//            {!loading && searched && (
//                <div className="rp-table-wrapper">
//                    <table className="rp-table">
//                        <thead>
//                            <tr>
//                                <th>Voucher #</th>
//                                <th>Date</th>
//                                <th>Type</th>
//                                <th>Description</th>
//                                <th className="text-center">Status</th>
//                                <th className="text-center">Action</th>
//                            </tr>
//                        </thead>
//                        <tbody>
//                            {vouchers.length > 0 ? vouchers.map(v => (
//                                <tr key={v.acctTranID}>
//                                    <td><strong>{v.vochNumb}</strong></td>
//                                    <td>{formatDt(v.tranDate)}</td>
//                                    <td>{getVoucherTypeName(v.vochType)}</td>
//                                    <td>{v.tranDesc || '-'}</td>
//                                    <td className="text-center">
//                                        <span style={{
//                                            padding: '2px 10px',
//                                            borderRadius: 10,
//                                            fontSize: 10,
//                                            fontWeight: 600,
//                                            background: v.isPosted ? '#d1fae5' : '#fef3c7',
//                                            color: v.isPosted ? '#065f46' : '#92400e'
//                                        }}>
//                                            {v.isPosted ? '✅ Posted' : '⏳ Pending'}
//                                        </span>
//                                    </td>
//                                    <td className="text-center">
//                                        <button
//                                            onClick={() => handleView(v.acctTranID)}
//                                            style={{
//                                                background: '#2563eb',
//                                                color: '#fff',
//                                                border: 'none',
//                                                padding: '5px 12px',
//                                                borderRadius: 6,
//                                                cursor: 'pointer',
//                                                fontSize: 11
//                                            }}
//                                        >
//                                            <FaEye /> View
//                                        </button>
//                                    </td>
//                                </tr>
//                            )) : (
//                                <tr><td colSpan="6" className="rp-no-data">No vouchers found</td></tr>
//                            )}
//                        </tbody>
//                    </table>
//                </div>
//            )}

//            {!loading && !searched && (
//                <div className="rp-no-data">📊 Select filters and click "Search" to view vouchers</div>
//            )}
//        </ReportTemplate>
//    );
//}


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import voucherApi from "../../../api/voucherApi";
import vochTypeApi from "../../../api/vochTypeApi";
import {
    FaEye,
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

export default function VoucherList() {
    const navigate = useNavigate();
    const [vouchers, setVouchers] = useState([]);
    const [voucherTypes, setVoucherTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ vochType: "", fromDate: "", toDate: "" });
    const [searched, setSearched] = useState(false);

    const loggedInUser =
        localStorage.getItem("userName") ||
        localStorage.getItem("username") ||
        localStorage.getItem("fullName") ||
        "Admin User";

    const branchName = localStorage.getItem("branchName") || "Main Branch";

    useEffect(() => { loadVoucherTypes(); }, []);

    const loadVoucherTypes = async () => {
        try {
            const res = await vochTypeApi.getAll();
            setVoucherTypes(res.data?.data || res.data || []);
        } catch (err) { }
    };

    const handleSearch = async () => {
        setLoading(true);
        setSearched(true);
        try {
            const params = {};
            if (filters.vochType) params.vochType = filters.vochType;
            if (filters.fromDate) params.fromDate = filters.fromDate;
            if (filters.toDate) params.toDate = filters.toDate;
            const res = await voucherApi.getAll(params);
            setVouchers(res.data?.data || res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (id) => navigate(`/voucher-detail/${id}`);

    const getVoucherTypeName = (type) => voucherTypes.find(v => v.vochType === type)?.vochName || type;

    const formatDate = (d) => {
        if (!d) return "";
        const dt = new Date(d);
        const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${String(dt.getDate()).padStart(2, '0')}-${m[dt.getMonth()]}-${dt.getFullYear()}`;
    };

    const formatNumber = (n) => new Intl.NumberFormat('en-PK', {
        minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(n || 0);

    const totalPosted = vouchers.filter(v => v.isPosted).length;
    const totalPending = vouchers.filter(v => !v.isPosted).length;

    // ================= PDF =================
    const exportPDF = () => {
        if (vouchers.length === 0) { alert("No data available"); return; }

        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const generatedOn = new Date().toLocaleString();

        doc.setFont("helvetica");
        doc.setFontSize(16); doc.setFont("helvetica", "bold");
        doc.text("VOUCHER LIST REPORT", pageWidth / 2, 12, { align: "center" });

        doc.setFontSize(7); doc.setFont("helvetica", "normal");
        doc.text(`Branch: ${branchName}`, 4, 20);
        doc.text(`Total: ${vouchers.length} | Posted: ${totalPosted} | Pending: ${totalPending}`, 4, 25);

        doc.text(`Period: ${filters.fromDate || 'All'} to ${filters.toDate || 'All'}`, pageWidth - 4, 20, { align: "right" });
        doc.text(`Generated By: ${loggedInUser} | ${generatedOn}`, pageWidth - 4, 25, { align: "right" });

        const body = vouchers.map((v, i) => [
            i + 1,
            v.vochNumb || "-",
            formatDate(v.tranDate),
            getVoucherTypeName(v.vochType),
            v.tranDesc || "-",
            v.isPosted ? "Posted" : "Pending"
        ]);

        autoTable(doc, {
            startY: 30,
            head: [["#", "VOUCHER #", "DATE", "TYPE", "DESCRIPTION", "STATUS"]],
            body: body,
            theme: "plain",
            tableWidth: 291,
            tableLineColor: [255, 255, 255],
            tableLineWidth: 0,

            styles: {
                font: "helvetica", fontSize: 7.5, cellPadding: 2.5,
                valign: "middle", overflow: "hidden", halign: "left", lineWidth: 0,
            },
            headStyles: {
                fillColor: [230, 235, 245], textColor: [20, 30, 50],
                fontStyle: "bold", halign: "center", fontSize: 8, lineWidth: 0,
            },
            bodyStyles: { textColor: [50, 60, 75], fontSize: 7.5, lineWidth: 0 },
            alternateRowStyles: { fillColor: [248, 250, 252] },

            columnStyles: {
                0: { cellWidth: 10, halign: "center" },
                1: { cellWidth: 50 },
                2: { cellWidth: 30, halign: "center" },
                3: { cellWidth: 55 },
                4: { cellWidth: 95 },
                5: { cellWidth: 35, halign: "center" }
            },

            margin: { left: 3, right: 3, top: 5, bottom: 10 },

            didDrawPage: (data) => {
                doc.setFontSize(6.5); doc.setTextColor(130, 130, 130);
                doc.text(`Page ${data.pageNumber}`, pageWidth - 6, pageHeight - 5, { align: "right" });
                doc.text(`${loggedInUser} | ${generatedOn}`, 4, pageHeight - 5);
            }
        });

        doc.save(`VoucherList_${filters.fromDate || 'all'}_to_${filters.toDate || 'all'}.pdf`);
    };

    // ================= EXCEL =================
    const exportExcel = () => {
        if (vouchers.length === 0) { alert("No data available"); return; }

        const excelData = vouchers.map((v, i) => ({
            "#": i + 1,
            "VOUCHER #": v.vochNumb || "-",
            DATE: formatDate(v.tranDate),
            TYPE: getVoucherTypeName(v.vochType),
            DESCRIPTION: v.tranDesc || "-",
            STATUS: v.isPosted ? "Posted" : "Pending"
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        worksheet["!cols"] = [
            { wch: 6 }, { wch: 35 }, { wch: 18 }, { wch: 35 }, { wch: 60 }, { wch: 14 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Voucher List");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `VoucherList_${filters.fromDate || 'all'}_to_${filters.toDate || 'all'}.xlsx`);
    };

    const handlePrint = () => { window.print(); };

    const filtersBar = (
        <>
            <div className="rp-filter-group">
                <label>From</label>
                <input type="date" value={filters.fromDate} onChange={e => setFilters({ ...filters, fromDate: e.target.value })} />
            </div>
            <div className="rp-filter-group">
                <label>To</label>
                <input type="date" value={filters.toDate} onChange={e => setFilters({ ...filters, toDate: e.target.value })} />
            </div>
            <div className="rp-filter-group" style={{ minWidth: 180 }}>
                <label>Type</label>
                <select value={filters.vochType} onChange={e => setFilters({ ...filters, vochType: e.target.value })}>
                    <option value="">All Types</option>
                    {voucherTypes.filter(v => !v.inActive).map(v => <option key={v.vochType} value={v.vochType}>{v.vochName}</option>)}
                </select>
            </div>
            <button className="rp-btn-search" onClick={handleSearch} disabled={loading}>
                <FaSearch /> {loading ? "Loading..." : "Search"}
            </button>
        </>
    );

    const exportButtons = vouchers.length > 0 ? (
        <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={exportPDF} style={{ background: "#dc2626", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}><FaFilePdf /> PDF</button>
            <button onClick={exportExcel} style={{ background: "#16a34a", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}><FaFileExcel /> Excel</button>
            <button onClick={handlePrint} style={{ background: "#475569", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}><FaPrint /> Print</button>
        </div>
    ) : null;

    return (
        <ReportTemplate
            title="VOUCHER LIST"
            subtitle="All accounting vouchers with status"
            filters={filtersBar}
            printedBy={loggedInUser}
            extraActions={exportButtons}
            metaFields={searched ? [
                { label: "Total Vouchers", value: vouchers.length },
                { label: "Posted", value: totalPosted },
                { label: "Pending", value: totalPending },
            ] : null}
        >
            {loading && <div className="rp-no-data">⏳ Loading vouchers...</div>}

            {!loading && searched && (
                <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", width: "100%" }}>
                    <div style={{ overflowX: "auto", width: "100%" }}>
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "clamp(10px, 1.2vw, 12px)", fontFamily: "'Segoe UI', sans-serif", tableLayout: "auto" }}>
                            <thead>
                                <tr style={{ background: "#f8fafc" }}>
                                    <th style={thStyle("5%", "center")}>#</th>
                                    <th style={thStyle("18%", "left")}>VOUCHER #</th>
                                    <th style={thStyle("12%", "center")}>DATE</th>
                                    <th style={thStyle("18%", "left")}>TYPE</th>
                                    <th style={thStyle("27%", "left")}>DESCRIPTION</th>
                                    <th style={thStyle("10%", "center")}>STATUS</th>
                                    <th style={thStyle("10%", "center")}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vouchers.length > 0 ? vouchers.map((v, idx) => (
                                    <tr key={v.acctTranID} style={{ background: idx % 2 === 0 ? "#ffffff" : "#f9fbfd" }}>
                                        <td style={tdStyle("center", "#475569")}>{idx + 1}</td>
                                        <td style={tdStyle("left", "#0f172a", false, false, true)}>{v.vochNumb}</td>
                                        <td style={tdStyle("center", "#475569", true)}>{formatDate(v.tranDate)}</td>
                                        <td style={tdStyle("left", "#334155")}>{getVoucherTypeName(v.vochType)}</td>
                                        <td style={tdStyle("left", "#334155", false, true)}>{v.tranDesc || '-'}</td>
                                        <td style={tdStyle("center")}>
                                            <span style={{
                                                display: "inline-block", padding: "4px 12px", borderRadius: "12px",
                                                fontSize: "clamp(9px, 1vw, 10px)", fontWeight: 600, whiteSpace: "nowrap",
                                                background: v.isPosted ? '#d1fae5' : '#fef3c7',
                                                color: v.isPosted ? '#065f46' : '#92400e'
                                            }}>
                                                {v.isPosted ? '✅ Posted' : '⏳ Pending'}
                                            </span>
                                        </td>
                                        <td style={tdStyle("center")}>
                                            <button
                                                onClick={() => handleView(v.acctTranID)}
                                                style={{
                                                    background: '#2563eb', color: '#fff', border: 'none',
                                                    padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
                                                    fontSize: '11px', fontWeight: 600,
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px'
                                                }}
                                            >
                                                <FaEye /> View
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>No vouchers found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && !searched && (
                <div className="rp-no-data">📊 Select filters and click "Search" to view vouchers</div>
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