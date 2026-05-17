import React, { useState, useEffect } from "react";
import {
    getSupplierBalancing,
    getSuppliers
} from "./supplierBalancingService";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const SupplierBalancingReportPage = () => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [supplierId, setSupplierId] = useState("");
    const [suppliers, setSuppliers] = useState([]);
    const [data, setData] = useState([]);
    const [openingBalance, setOpeningBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [error, setError] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async () => {
        try {
            const supplierData = await getSuppliers(1);
            setSuppliers(supplierData);
        } catch (err) {
            setError("Failed to load suppliers");
            console.error(err);
        }
    };

    // SupplierBalancingReportPage.jsx mein handleGenerate function mein:

    const handleGenerate = async () => {
        if (!fromDate || !toDate) {
            alert("Select date range");
            return;
        }
        if (!supplierId) {
            alert("Select a supplier");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const selected = suppliers.find(s => s.id == supplierId);
            setSelectedSupplier(selected);

            const response = await getSupplierBalancing(
                fromDate,
                toDate,
                supplierId,
                1
            );

            // 🔥 DEBUG: Detailed log
            console.log("===== API RESPONSE DETAILS =====");
            console.log("Full Response:", response);
            console.log("Transactions array:", response.transactions);
            console.log("First transaction:", response.transactions?.[0]);

            if (response.transactions && response.transactions.length > 0) {
                console.log("Transaction properties:", Object.keys(response.transactions[0]));
                console.log("Quantity value:", response.transactions[0].quantity);
                console.log("Quantity type:", typeof response.transactions[0].quantity);

                // Check if quantity exists in any transaction
                const hasQuantity = response.transactions.some(t => t.quantity !== undefined && t.quantity !== null && t.quantity !== 0);
                console.log("Has any quantity values:", hasQuantity);

                // Show all quantities
                const quantities = response.transactions.map(t => t.quantity);
                console.log("All quantities:", quantities);
            }

            setData(response.transactions || []);
            setOpeningBalance(response.openingBalance || 0);
            setCurrentPage(1);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to generate report");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Totals
    const quantityTotal = data.reduce((sum, r) => sum + (r.quantity || 0), 0);
    const debitTotal = data.reduce((sum, r) => sum + (r.debit || 0), 0);
    const creditTotal = data.reduce((sum, r) => sum + (r.credit || 0), 0);
    const lastBalance = data.length > 0
        ? data[data.length - 1].runningBalance
        : openingBalance;

    // Pagination
    const indexOfLast = currentPage * recordsPerPage;
    const indexOfFirst = indexOfLast - recordsPerPage;
    const currentRecords = data.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(data.length / recordsPerPage);

    const getTypeBadge = (type) => {
        switch (type) {
            case 'PURCHASE': return 'badge bg-primary';
            case 'RETURN': return 'badge bg-warning text-dark';
            case 'PAYMENT': return 'badge bg-success';
            default: return 'badge bg-secondary';
        }
    };

    const exportPDF = () => {
        const doc = new jsPDF("landscape");
        const pageWidth = doc.internal.pageSize.getWidth();

        const companyName = "ABC Company Pvt Ltd";
        const branchName = "Main Branch";
        const loginUser = "admin";
        const generatedOn = new Date().toLocaleString();
        const supplierName = selectedSupplier?.name || "N/A";

        // Header
        doc.setFontSize(18);
        doc.text(companyName, pageWidth / 2, 15, { align: "center" });

        doc.setFontSize(14);
        doc.text("Supplier Balancing Report", pageWidth / 2, 25, { align: "center" });

        doc.setFontSize(10);
        doc.text(`Branch: ${branchName}`, 14, 35);
        doc.text(`Supplier: ${supplierName}`, 14, 42);
        doc.text(`Date Range: ${fromDate} to ${toDate}`, 14, 49);
        doc.text(`Generated By: ${loginUser}`, 14, 56);
        doc.text(`Generated On: ${generatedOn}`, 14, 63);

        doc.text(`Opening Balance: ${openingBalance?.toFixed(2)}`, pageWidth - 14, 42, { align: "right" });

        // Table with Quantity column
        autoTable(doc, {
            startY: 70,
            head: [["Date", "Type", "Voucher #", "Reference", "Quantity", "Debit", "Credit", "Running Balance"]],
            body: data.map(r => [
                r.tranDate,
                r.tranType,
                r.voucherNo,
                r.reference,
                r.quantity?.toFixed(2),
                r.debit?.toFixed(2),
                r.credit?.toFixed(2),
                r.runningBalance?.toFixed(2)
            ]),
            foot: [[
                "TOTALS", "", "", "",
                { content: quantityTotal.toFixed(2), styles: { halign: 'right' } },
                { content: debitTotal.toFixed(2), styles: { halign: 'right' } },
                { content: creditTotal.toFixed(2), styles: { halign: 'right' } },
                { content: lastBalance.toFixed(2), styles: { halign: 'right' } }
            ]],
            theme: "grid",
            styles: { fontSize: 8 },
            headStyles: { fillColor: [40, 40, 40] },
            footStyles: {
                fillColor: [40, 40, 40],  // 🔥 DARK BLACK BACKGROUND
                textColor: [255, 255, 255], // WHITE TEXT
                fontStyle: 'bold',
                lineColor: [0, 0, 0],
                lineWidth: 0.5
            },
            columnStyles: {
                4: { halign: 'right' }, // Quantity
                5: { halign: 'right' }, // Debit
                6: { halign: 'right' }, // Credit
                7: { halign: 'right' }  // Running Balance
            }
        });

        const finalY = doc.lastAutoTable.finalY + 5;
        doc.setFontSize(10);
        doc.text(`Closing Balance: ${lastBalance?.toFixed(2)}`, pageWidth - 14, finalY, { align: "right" });

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(
                `Page ${i} of ${pageCount}`,
                pageWidth - 20,
                doc.internal.pageSize.getHeight() - 10
            );
        }

        doc.save(`SupplierBalance_${supplierName}_${fromDate}_to_${toDate}.pdf`);
    };

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(data.map(r => ({
            Date: r.tranDate,
            Type: r.tranType,
            "Voucher #": r.voucherNo,
            Reference: r.reference,
            Quantity: r.quantity,
            Debit: r.debit,
            Credit: r.credit,
            "Running Balance": r.runningBalance
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Supplier Balance");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `SupplierBalance_${selectedSupplier?.name}_${fromDate}_to_${toDate}.xlsx`);
    };

    return (
        <div className="container mt-4">
            <h3 className="mb-3">Supplier Balancing Report</h3>

            {/* Filters */}
            <div className="row g-2 mb-3">
                <div className="col-md-2">
                    <input
                        type="date"
                        className="form-control"
                        value={fromDate}
                        onChange={e => setFromDate(e.target.value)}
                    />
                </div>

                <div className="col-md-2">
                    <input
                        type="date"
                        className="form-control"
                        value={toDate}
                        onChange={e => setToDate(e.target.value)}
                    />
                </div>

                <div className="col-md-3">
                    <select
                        className="form-select"
                        value={supplierId}
                        onChange={e => setSupplierId(e.target.value)}
                    >
                        <option value="">Select Supplier</option>
                        {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-2 d-grid">
                    <button
                        className="btn btn-primary"
                        onClick={handleGenerate}
                        disabled={loading}
                    >
                        {loading ? "Generating..." : "Generate"}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {/* Export Buttons */}
            {data.length > 0 && (
                <div className="mb-3">
                    <button className="btn btn-danger me-2" onClick={exportPDF}>PDF</button>
                    <button className="btn btn-success me-2" onClick={exportExcel}>Excel</button>
                    <button className="btn btn-secondary" onClick={() => window.print()}>Print</button>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="text-center my-3">
                    <div className="spinner-border text-primary"></div>
                </div>
            )}

            {/* Table */}
            {!loading && data.length > 0 && (
                <>
                    <div className="row mb-2">
                        <div className="col-md-6">
                            <strong>Supplier:</strong> {selectedSupplier?.name}
                        </div>
                        <div className="col-md-6 text-end">
                            <strong>Opening Balance:</strong>
                            <span className={openingBalance < 0 ? "text-danger" : "text-success"}>
                                {openingBalance?.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <table className="table table-bordered table-striped">
                        <thead className="table-dark">
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Voucher #</th>
                                <th>Reference</th>
                                <th className="text-end">Qty</th>
                                <th className="text-end">Debit</th>
                                <th className="text-end">Credit</th>
                                <th className="text-end">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.tranDate}</td>
                                    <td>
                                        <span className={getTypeBadge(row.tranType)}>
                                            {row.tranType}
                                        </span>
                                    </td>
                                    <td>{row.voucherNo}</td>
                                    <td>{row.reference}</td>
                                    <td className="text-end">{row.quantity?.toFixed(2)}</td>
                                    <td className="text-end text-success fw-bold">
                                        {row.debit?.toFixed(2)}
                                    </td>
                                    <td className="text-end text-danger fw-bold">
                                        {row.credit?.toFixed(2)}
                                    </td>
                                    <td className={`text-end fw-bold ${row.runningBalance < 0 ? "text-danger" : "text-success"}`}>
                                        {row.runningBalance?.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="table-dark fw-bold" style={{ backgroundColor: '#212529', color: 'white' }}>
                            <tr>
                                <td colSpan="4" className="text-end">TOTALS:</td>
                                <td className="text-end">{quantityTotal.toFixed(2)}</td>
                                <td className="text-end">{debitTotal.toFixed(2)}</td>
                                <td className="text-end">{creditTotal.toFixed(2)}</td>
                                <td className="text-end">{lastBalance.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Closing Balance */}
                    <div className="row mt-2">
                        <div className="col-md-12 text-end">
                            <strong>Closing Balance: </strong>
                            <span className={lastBalance < 0 ? "text-danger fw-bold" : "text-success fw-bold"}>
                                {lastBalance?.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <nav className="mt-3">
                            <ul className="pagination">
                                {[...Array(totalPages)].map((_, i) => (
                                    <li key={i}
                                        className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                                        <button className="page-link"
                                            onClick={() => setCurrentPage(i + 1)}>
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}
                </>
            )}

            {!loading && data.length === 0 && supplierId && !error && (
                <div className="alert alert-info">
                    No transactions found for the selected criteria.
                </div>
            )}
        </div>
    );
};

export default SupplierBalancingReportPage;