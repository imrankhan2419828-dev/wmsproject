import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { FaPrint, FaDownload, FaFileExcel, FaTimes } from "react-icons/fa";
import "./PrintSlip.css";

export default function PrintSlip({ module, id, onClose }) {
    const [html, setHtml] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadPrintData(); }, [module, id]);

    const loadPrintData = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/Print/${module}/${id}`);
            setHtml(res.data?.html || "");
        } catch (err) { console.error("Error:", err); }
        finally { setLoading(false); }
    };

    const handlePrint = () => {
        const w = window.open("", "_blank");
        w.document.write(html);
        w.document.close();
        setTimeout(() => w.print(), 500);
    };

    const handlePdf = () => {
        const w = window.open("", "_blank");
        w.document.write(`<!DOCTYPE html><html><head><style>@page{size:A4;margin:5mm}body{font-family:Arial,sans-serif;font-size:11px}</style></head><body>${html}</body></html>`);
        w.document.close();
        setTimeout(() => w.print(), 500);
    };

    const handleExcel = async () => {
        try {
            const res = await axiosClient.get(`/Print/${module}/${id}/data`);
            const d = res.data;
            let h = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body>`;
            h += `<h2>${d.title || ''}</h2><p>${d.partyLabel || ''}: ${d.partyName || ''}</p><p>Bill#: ${d.billNumber || ''}</p><p>Date: ${d.date || ''}</p><br/>`;
            if (d.headers && d.rows) {
                h += `<table border="1" cellpadding="5"><tr>${d.headers.map(x => `<th style="background:#f0f0f0">${x}</th>`).join('')}</tr>`;
                h += d.rows.map(r => `<tr>${r.map(c => `<td>${c ?? ''}</td>`).join('')}</tr>`).join('') + '</table>';
            }
            if (d.totalLabel) h += `<br/><p><b>${d.totalLabel}: ${d.totalAmount || ''}</b></p>`;
            h += '</body></html>';
            const blob = new Blob(['\ufeff' + h], { type: 'application/vnd.ms-excel' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `${module}_${id}.xls`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        } catch (err) { alert("Excel failed"); }
    };

    return (
        <div className="print-slip-overlay">
            <div className="print-slip-modal">
                <div className="print-slip-header"><h3>📄 Print Preview</h3><button className="close-btn" onClick={onClose}><FaTimes /></button></div>
                <div className="print-slip-body">{loading ? <div className="loading">Loading...</div> : <div dangerouslySetInnerHTML={{ __html: html }} />}</div>
                <div className="print-slip-footer">
                    <button className="btn-print" onClick={handlePrint}><FaPrint /> Print</button>
                    <button className="btn-pdf" onClick={handlePdf}><FaDownload /> PDF</button>
                    <button className="btn-excel" onClick={handleExcel}><FaFileExcel /> Excel</button>
                    <button className="btn-cancel" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}