//import React, { useState, useEffect } from "react";
//import axiosClient from "../../api/axiosClient";
//import { FaPrint, FaDownload, FaFileExcel, FaTimes } from "react-icons/fa";
//import "./PrintSlip.css";

//export default function PrintSlip({ module, id, onClose }) {
//    const [html, setHtml] = useState("");
//    const [loading, setLoading] = useState(true);

//    useEffect(() => { loadPrintData(); }, [module, id]);

//    const loadPrintData = async () => {
//        setLoading(true);
//        try {
//            const res = await axiosClient.get(`/Print/${module}/${id}`);
//            setHtml(res.data?.html || "");
//        } catch (err) { console.error("Error:", err); }
//        finally { setLoading(false); }
//    };

//    const handlePrint = () => {
//        const w = window.open("", "_blank");
//        w.document.write(html);
//        w.document.close();
//        setTimeout(() => w.print(), 500);
//    };

//    const handlePdf = () => {
//        const w = window.open("", "_blank");
//        w.document.write(`<!DOCTYPE html><html><head><style>@page{size:A4;margin:5mm}body{font-family:Arial,sans-serif;font-size:11px}</style></head><body>${html}</body></html>`);
//        w.document.close();
//        setTimeout(() => w.print(), 500);
//    };

//    const handleExcel = async () => {
//        try {
//            const res = await axiosClient.get(`/Print/${module}/${id}/data`);
//            const d = res.data;
//            let h = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body>`;
//            h += `<h2>${d.title || ''}</h2><p>${d.partyLabel || ''}: ${d.partyName || ''}</p><p>Bill#: ${d.billNumber || ''}</p><p>Date: ${d.date || ''}</p><br/>`;
//            if (d.headers && d.rows) {
//                h += `<table border="1" cellpadding="5"><tr>${d.headers.map(x => `<th style="background:#f0f0f0">${x}</th>`).join('')}</tr>`;
//                h += d.rows.map(r => `<tr>${r.map(c => `<td>${c ?? ''}</td>`).join('')}</tr>`).join('') + '</table>';
//            }
//            if (d.totalLabel) h += `<br/><p><b>${d.totalLabel}: ${d.totalAmount || ''}</b></p>`;
//            h += '</body></html>';
//            const blob = new Blob(['\ufeff' + h], { type: 'application/vnd.ms-excel' });
//            const url = URL.createObjectURL(blob);
//            const a = document.createElement('a'); a.href = url; a.download = `${module}_${id}.xls`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
//        } catch (err) { alert("Excel failed"); }
//    };

//    return (
//        <div className="print-slip-overlay">
//            <div className="print-slip-modal">
//                <div className="print-slip-header"><h3>📄 Print Preview</h3><button className="close-btn" onClick={onClose}><FaTimes /></button></div>
//                <div className="print-slip-body">{loading ? <div className="loading">Loading...</div> : <div dangerouslySetInnerHTML={{ __html: html }} />}</div>
//                <div className="print-slip-footer">
//                    <button className="btn-print" onClick={handlePrint}><FaPrint /> Print</button>
//                    <button className="btn-pdf" onClick={handlePdf}><FaDownload /> PDF</button>
//                    <button className="btn-excel" onClick={handleExcel}><FaFileExcel /> Excel</button>
//                    <button className="btn-cancel" onClick={onClose}>Close</button>
//                </div>
//            </div>
//        </div>
//    );
//}


import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import {
    FaPrint,
    FaFilePdf,
    FaFileExcel,
    FaTimes
} from "react-icons/fa";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import "./PrintSlip.css";

export default function PrintSlip({ module, id, onClose }) {

    const [html, setHtml] = useState("");
    const [loading, setLoading] = useState(true);
    const [printData, setPrintData] = useState(null);

    const loggedInUser =
        localStorage.getItem("userName") ||
        localStorage.getItem("username") ||
        localStorage.getItem("fullName") ||
        "Admin User";

    useEffect(() => {
        loadPrintData();
    }, [module, id]);

    const loadPrintData = async () => {

        setLoading(true);

        try {

            const res = await axiosClient.get(`/Print/${module}/${id}`);
            setHtml(res.data?.html || "");

            try {

                const dataRes = await axiosClient.get(`/Print/${module}/${id}/data`);
                setPrintData(dataRes.data);

            } catch (err) {

                console.log("Structured data not available");
            }

        } catch (err) {

            console.error("Error:", err);

        } finally {

            setLoading(false);
        }
    };

    const getCurrentDateTime = () => {

        const now = new Date();

        const months = [
            "Jan", "Feb", "Mar", "Apr",
            "May", "Jun", "Jul", "Aug",
            "Sep", "Oct", "Nov", "Dec"
        ];

        const dateStr =
            `${String(now.getDate()).padStart(2, "0")}-${months[now.getMonth()]}-${now.getFullYear()}`;

        const timeStr = now.toLocaleTimeString("en-PK", {
            hour: "2-digit",
            minute: "2-digit"
        });

        return `${dateStr} ${timeStr}`;
    };

    // =====================================================
    // PRINT
    // =====================================================

    const handlePrint = () => {

        const w = window.open("", "_blank", "width=900,height=700");

        const generatedOn = getCurrentDateTime();

        let printHTML = `
        <!DOCTYPE html>
        <html>

        <head>

            <title>Invoice Slip</title>

            <style>

                @page{
                    size:A5 portrait;
                    margin:8mm;
                }

                *{
                    margin:0;
                    padding:0;
                    box-sizing:border-box;
                }

                body{
                    font-family:Arial, Helvetica, sans-serif;
                    background:#f3f4f6;
                    color:#111827;
                    padding:10px;
                }

                .invoice{
                    width:100%;
                    max-width:138mm;
                    margin:auto;
                    background:#fff;
                    border:1px solid #d1d5db;
                    border-radius:8px;
                    padding:14px;
                }

                .header{
                    text-align:center;
                    border-bottom:2px solid #111827;
                    padding-bottom:10px;
                    margin-bottom:12px;
                }

                .header h1{
                    font-size:20px;
                    font-weight:700;
                    letter-spacing:1px;
                    margin-bottom:4px;
                }

                .branch{
                    font-size:11px;
                    color:#6b7280;
                }

                .info{
                    margin-bottom:14px;
                }

                .info-row{
                    display:flex;
                    justify-content:space-between;
                    margin-bottom:5px;
                    font-size:11px;
                }

                .label{
                    font-weight:700;
                }

                table{
                    width:100%;
                    border-collapse:collapse;
                    margin-top:10px;
                }

                thead{
                    background:#111827;
                    color:#fff;
                }

                th{
                    padding:8px 6px;
                    border:1px solid #d1d5db;
                    font-size:11px;
                    text-align:left;
                }

                td{
                    padding:8px 6px;
                    border:1px solid #e5e7eb;
                    font-size:10px;
                }

                .text-right{
                    text-align:right;
                }

                .text-center{
                    text-align:center;
                }

                .grand-total{
                    display:flex;
                    justify-content:flex-end;
                    margin-top:10px;
                }

                .total-box{
                    width:45%;
                    border:2px solid #111827;
                    padding:8px 10px;
                    border-radius:4px;
                    background:#f9fafb;
                }

                .total-row{
                    display:flex;
                    justify-content:space-between;
                    font-size:12px;
                    font-weight:700;
                }

                .footer{
                    margin-top:40px;
                }

                .signature-area{
                    display:flex;
                    justify-content:space-between;
                    margin-top:30px;
                }

                .signature-box{
                    width:38%;
                    text-align:center;
                    font-size:10px;
                }

                .signature-line{
                    border-top:1px solid #111827;
                    margin-bottom:5px;
                }

                .printed{
                    margin-top:20px;
                    text-align:center;
                    font-size:9px;
                    color:#6b7280;
                }

                @media print{

                    body{
                        background:#fff;
                        padding:0;
                    }

                    .invoice{
                        border:none;
                        border-radius:0;
                    }
                }

            </style>

        </head>

        <body>

            <div class="invoice">
        `;

        if (printData) {

            printHTML += `

                <div class="header">

                    <h1>
                        ${printData.title || "PURCHASE INVOICE"}
                    </h1>

                    <div class="branch">
                        ${printData.branch || "Main Branch"}
                    </div>

                </div>

                <div class="info">

                    <div class="info-row">
                        <span class="label">Bill No:</span>
                        <span>${printData.billNumber || "-"}</span>
                    </div>

                    <div class="info-row">
                        <span class="label">Date:</span>
                        <span>${printData.date || "-"}</span>
                    </div>

                    <div class="info-row">
                        <span class="label">
                            ${printData.partyLabel || "Supplier"}:
                        </span>

                        <span>
                            ${printData.partyName || "-"}
                        </span>
                    </div>

                </div>
            `;

            if (printData.headers && printData.rows) {

                printHTML += `
                    <table>

                        <thead>
                            <tr>
                `;

                printData.headers.forEach(h => {

                    printHTML += `<th>${h}</th>`;
                });

                printHTML += `
                            </tr>
                        </thead>

                        <tbody>
                `;

                printData.rows.forEach(row => {

                    printHTML += `<tr>`;

                    row.forEach((cell, i) => {

                        const isRight = i >= row.length - 2;

                        printHTML += `
                            <td class="${isRight ? "text-right" : ""}">
                                ${cell ?? ""}
                            </td>
                        `;
                    });

                    printHTML += `</tr>`;
                });

                printHTML += `
                        </tbody>

                    </table>
                `;
            }

            if (printData.totalLabel) {

                printHTML += `

                    <div class="grand-total">

                        <div class="total-box">

                            <div class="total-row">

                                <span>
                                    ${printData.totalLabel || "TOTAL"}
                                </span>

                                <span>
                                    ${printData.totalAmount || ""}
                                </span>

                            </div>

                        </div>

                    </div>
                `;
            }
        }

        printHTML += `

                <div class="footer">

                    <div class="signature-area">

                        <div class="signature-box">

                            <div class="signature-line"></div>

                            Prepared By

                        </div>

                        <div class="signature-box">

                            <div class="signature-line"></div>

                            Authorized By

                        </div>

                    </div>

                    <div class="printed">

                        Printed By: ${loggedInUser}

                        <br/>

                        ${generatedOn}

                    </div>

                </div>

            </div>

        </body>

        </html>
        `;

        w.document.write(printHTML);

        w.document.close();

        setTimeout(() => {

            w.print();

        }, 500);
    };

    // =====================================================
    // PDF
    // =====================================================

    const handlePdf = () => {

        if (!printData) {
            handlePrint();
            return;
        }

        const generatedOn = getCurrentDateTime();

        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a5"
        });

        const pageWidth = doc.internal.pageSize.getWidth();

        let y = 10;

        // HEADER

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);

        doc.text(
            printData.title || "PURCHASE INVOICE",
            pageWidth / 2,
            y,
            { align: "center" }
        );

        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        doc.text(
            printData.branch || "Main Branch",
            pageWidth / 2,
            y,
            { align: "center" }
        );

        y += 5;

        doc.setDrawColor(20);
        doc.setLineWidth(0.5);

        doc.line(8, y, pageWidth - 8, y);

        y += 6;

        // INFO

        doc.setFontSize(8);

        doc.text(
            `Bill No: ${printData.billNumber || "-"}`,
            8,
            y
        );

        y += 4;

        doc.text(
            `Date: ${printData.date || "-"}`,
            8,
            y
        );

        y += 4;

        doc.text(
            `${printData.partyLabel || "Supplier"}: ${printData.partyName || "-"}`,
            8,
            y
        );

        y += 6;

        // TABLE

        if (printData.headers && printData.rows) {

            const body = printData.rows.map(row =>
                row.map(c => c ?? "")
            );

            if (printData.totalLabel) {

                body.push([
                    {
                        content: printData.totalLabel || "TOTAL",
                        colSpan: printData.headers.length - 1,
                        styles: {
                            halign: "right",
                            fontStyle: "bold"
                        }
                    },
                    {
                        content: printData.totalAmount || "",
                        styles: {
                            halign: "right",
                            fontStyle: "bold"
                        }
                    }
                ]);
            }

            const availableWidth = pageWidth - 16;

            const columnStyles = {};

            printData.headers.forEach((header, i) => {

                const h = header.toLowerCase();

                if (
                    h.includes("item") ||
                    h.includes("description")
                ) {

                    columnStyles[i] = {
                        cellWidth: availableWidth * 0.50,
                        halign: "left"
                    };
                }

                else if (
                    h.includes("amount") ||
                    h.includes("rate") ||
                    h.includes("total")
                ) {

                    columnStyles[i] = {
                        cellWidth: availableWidth * 0.20,
                        halign: "right"
                    };
                }

                else if (h.includes("qty")) {

                    columnStyles[i] = {
                        cellWidth: availableWidth * 0.12,
                        halign: "center"
                    };
                }

                else {

                    columnStyles[i] = {
                        cellWidth: "auto"
                    };
                }
            });

            autoTable(doc, {

                startY: y,

                head: [printData.headers],

                body: body,

                theme: "grid",

                margin: {
                    left: 8,
                    right: 8
                },

                tableWidth: "auto",

                styles: {
                    font: "helvetica",
                    fontSize: 8,
                    cellPadding: 2,
                    overflow: "linebreak",
                    valign: "middle"
                },

                headStyles: {
                    fillColor: [20, 20, 20],
                    textColor: [255, 255, 255],
                    fontStyle: "bold",
                    halign: "center"
                },

                bodyStyles: {
                    textColor: [40, 40, 40]
                },

                alternateRowStyles: {
                    fillColor: [248, 248, 248]
                },

                columnStyles: columnStyles
            });

            y = doc.lastAutoTable.finalY + 12;
        }

        // SIGNATURES

        const signY = Math.max(y, 165);

        doc.line(15, signY, 55, signY);

        doc.text(
            "Prepared By",
            35,
            signY + 4,
            { align: "center" }
        );

        doc.line(
            pageWidth - 55,
            signY,
            pageWidth - 15,
            signY
        );

        doc.text(
            "Authorized By",
            pageWidth - 35,
            signY + 4,
            { align: "center" }
        );

        // PRINT INFO

        doc.setFontSize(6);

        doc.setTextColor(120);

        doc.text(
            `Printed By: ${loggedInUser}`,
            pageWidth / 2,
            signY + 14,
            { align: "center" }
        );

        doc.text(
            generatedOn,
            pageWidth / 2,
            signY + 18,
            { align: "center" }
        );

        doc.save(`${module}_${id}_slip.pdf`);
    };

    // =====================================================
    // EXCEL
    // =====================================================

    const handleExcel = async () => {

        if (!printData || !printData.headers || !printData.rows) {

            alert("Excel data not available");

            return;
        }

        try {

            const excelData = [];

            excelData.push({
                A: printData.title || "INVOICE"
            });

            excelData.push({
                A: `Bill #: ${printData.billNumber || "-"}`
            });

            excelData.push({
                A: `Date: ${printData.date || "-"}`
            });

            excelData.push({
                A: `${printData.partyLabel || "Supplier"}: ${printData.partyName || "-"}`
            });

            excelData.push({ A: "" });

            const headerRow = {};

            printData.headers.forEach((h, i) => {

                headerRow[String.fromCharCode(65 + i)] = h;
            });

            excelData.push(headerRow);

            printData.rows.forEach(row => {

                const dataRow = {};

                row.forEach((cell, i) => {

                    dataRow[String.fromCharCode(65 + i)] = cell ?? "";
                });

                excelData.push(dataRow);
            });

            const worksheet = XLSX.utils.json_to_sheet(
                excelData,
                { skipHeader: true }
            );

            worksheet["!cols"] =
                printData.headers.map(() => ({ wch: 20 }));

            const workbook = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Slip"
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
                `${module}_${id}_slip.xlsx`
            );

        } catch (err) {

            console.error("Excel failed:", err);

            alert("Excel generation failed");
        }
    };

    return (

        <div className="print-slip-overlay">

            <div className="print-slip-modal">

                <div className="print-slip-header">

                    <h3>
                        📄 Print Preview - Slip
                    </h3>

                    <button
                        className="close-btn"
                        onClick={onClose}
                    >
                        <FaTimes />
                    </button>

                </div>

                <div className="print-slip-body">

                    {loading ? (

                        <div className="loading">
                            Loading...
                        </div>

                    ) : (

                        <div
                            dangerouslySetInnerHTML={{
                                __html: html
                            }}
                        />

                    )}

                </div>

                <div className="print-slip-footer">

                    <button
                        className="btn-print"
                        onClick={handlePrint}
                    >
                        <FaPrint /> Print
                    </button>

                    <button
                        className="btn-pdf"
                        onClick={handlePdf}
                    >
                        <FaFilePdf /> PDF
                    </button>

                    <button
                        className="btn-excel"
                        onClick={handleExcel}
                    >
                        <FaFileExcel /> Excel
                    </button>

                    <button
                        className="btn-cancel"
                        onClick={onClose}
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>
    );
}