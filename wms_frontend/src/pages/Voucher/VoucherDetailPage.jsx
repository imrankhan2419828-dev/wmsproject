import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import voucherApi from "../../api/voucherApi";
import {
    FaArrowLeft, FaPrint, FaCheckCircle, FaFileInvoice,
    FaCalendarAlt, FaUser, FaInfoCircle
} from "react-icons/fa";
import { Button, useDialog } from "../../components/common";
import { formatNumber } from "../../utils/numberUtils";
import { formatDate } from "../../utils/dateUtils";
import "./VoucherDetailPage.css";

export default function VoucherDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [voucher, setVoucher] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showConfirm, showSuccess, showError } = useDialog();

    const loadVoucher = async () => {
        try {
            setLoading(true);
            const res = await voucherApi.getById(id);
            const data = res.data?.data || res.data;

            if (!data) {
                showError("Voucher not found");
                navigate("/vouchers");
                return;
            }

            setVoucher(data);
        } catch (err) {
            console.error("Load error:", err);
            showError("Failed to load voucher details");
            navigate("/vouchers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadVoucher();
        } else {
            navigate("/vouchers");
        }
    }, [id]);

    const handlePrint = async () => {
        try {
            showSuccess("Preparing print...");
            const response = await voucherApi.printVoucher(id);
            const blob = new Blob([response.data], { type: 'text/html' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
        } catch (err) {
            console.error("Print error:", err);
            showError("Print failed. Please try again.");
        }
    };

    const handlePost = () => {
        showConfirm(
            "Post this voucher to ledger? This action cannot be undone.",
            async () => {
                try {
                    await voucherApi.postToLedger(id);
                    showSuccess("Voucher posted successfully!");
                    loadVoucher();
                } catch (err) {
                    showError(err.response?.data?.message || "Failed to post voucher");
                }
            },
            'Post Voucher'
        );
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading voucher details...</p>
            </div>
        );
    }

    if (!voucher) {
        return (
            <div className="error-container">
                <FaFileInvoice size={48} />
                <h3>Voucher Not Found</h3>
                <p>The requested voucher could not be found.</p>
                <Button variant="primary" onClick={() => navigate("/vouchers")}>
                    Back to Vouchers
                </Button>
            </div>
        );
    }

    const totalDebit = voucher.details?.reduce((sum, d) => sum + (parseFloat(d.debtAmnt) || 0), 0) || 0;
    const totalCredit = voucher.details?.reduce((sum, d) => sum + (parseFloat(d.crdtAmnt) || 0), 0) || 0;
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    const voucherTypeDisplay = voucher.vochTypeName || voucher.vochType || "Journal";
    const typeAbbr = voucher.typeAbbr || voucher.vochType || "JV";

    const formatDateTime = (dateInput) => {
        if (!dateInput) return "";
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return "";
        return `${formatDate(d)} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <div className="voucher-detail-premium">
            <div className="detail-header">
                <Button variant="outline" onClick={() => navigate("/vouchers")} icon={<FaArrowLeft />}>
                    Back to Vouchers
                </Button>
                <div className="header-actions">
                    <Button variant="outline" onClick={handlePrint} icon={<FaPrint />}>Print</Button>
                    {!voucher.isPosted && isBalanced && (
                        <Button variant="primary" onClick={handlePost} icon={<FaCheckCircle />}>
                            Post to Ledger
                        </Button>
                    )}
                </div>
            </div>

            <div className="voucher-detail-card">
                <div className="card-title">
                    <div className="title-left">
                        <FaFileInvoice size={24} />
                        <h2>Voucher #{voucher.vochNumb || `VCH-${voucher.vochID}`}</h2>
                        <span className={`status-badge ${voucher.isPosted ? 'posted' : 'pending'}`}>
                            {voucher.isPosted ? '✓ Posted' : '⏳ Pending'}
                        </span>
                        {!isBalanced && (
                            <span className="status-badge unbalanced">⚠️ Unbalanced</span>
                        )}
                    </div>
                </div>

                <div className="info-grid">
                    <div className="info-item">
                        <FaCalendarAlt />
                        <div>
                            <label>Transaction Date</label>
                            <span>{formatDate(voucher.tranDate) || "N/A"}</span>
                        </div>
                    </div>
                    <div className="info-item">
                        <FaFileInvoice />
                        <div>
                            <label>Voucher Type</label>
                            <span>{voucherTypeDisplay} ({typeAbbr})</span>
                        </div>
                    </div>
                    <div className="info-item">
                        <FaUser />
                        <div>
                            <label>Created By</label>
                            <span>{voucher.createdBy || "System"}</span>
                        </div>
                    </div>
                    <div className="info-item">
                        <FaCalendarAlt />
                        <div>
                            <label>Created On</label>
                            <span>{formatDateTime(voucher.addOn) || "N/A"}</span>
                        </div>
                    </div>
                    {voucher.postedBy && (
                        <div className="info-item">
                            <FaCheckCircle />
                            <div>
                                <label>Posted By</label>
                                <span>{voucher.postedBy}</span>
                            </div>
                        </div>
                    )}
                    {voucher.postedOn && (
                        <div className="info-item">
                            <FaCalendarAlt />
                            <div>
                                <label>Posted On</label>
                                <span>{formatDateTime(voucher.postedOn) || "N/A"}</span>
                            </div>
                        </div>
                    )}
                </div>

                {voucher.tranDesc && (
                    <div className="description-section">
                        <FaInfoCircle />
                        <div>
                            <label>Description</label>
                            <p>{voucher.tranDesc}</p>
                        </div>
                    </div>
                )}

                <div className="entries-section">
                    <h3>Accounting Entries</h3>
                    <div className="table-wrapper">
                        <table className="detail-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Account Code</th>
                                    <th>Account Name</th>
                                    <th className="text-right">Debit</th>
                                    <th className="text-right">Credit</th>
                                    <th>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {voucher.details && voucher.details.length > 0 ? (
                                    voucher.details.map((d, index) => (
                                        <tr key={d.acctTradID || d.detailId || `detail-${index}`}>
                                            <td>{index + 1}</td>
                                            <td><span className="account-code">{d.acctCode || "-"}</span></td>
                                            <td><span className="account-name">{d.acctName || "Unknown Account"}</span></td>
                                            <td className="amount debit">{d.debtAmnt > 0 ? formatNumber(d.debtAmnt) : "-"}</td>
                                            <td className="amount credit">{d.crdtAmnt > 0 ? formatNumber(d.crdtAmnt) : "-"}</td>
                                            <td className="remarks">{d.remarks || "-"}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" className="no-data">No entries found</td></tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="total-label">Total</td>
                                    <td className={`amount debit ${!isBalanced ? 'unbalanced' : ''}`}>{formatNumber(totalDebit)}</td>
                                    <td className={`amount credit ${!isBalanced ? 'unbalanced' : ''}`}>{formatNumber(totalCredit)}</td>
                                    <td></td>
                                </tr>
                                {!isBalanced && (
                                    <tr className="difference-row">
                                        <td colSpan="3" className="total-label">Difference</td>
                                        <td colSpan="2" className="amount difference">{formatNumber(Math.abs(totalDebit - totalCredit))}</td>
                                        <td></td>
                                    </tr>
                                )}
                            </tfoot>
                        </table>
                    </div>
                </div>

                {!isBalanced && !voucher.isPosted && (
                    <div className="warning-message">
                        <FaInfoCircle />
                        <span>This voucher is unbalanced and cannot be posted.</span>
                    </div>
                )}

                {voucher.isPosted && (
                    <div className="posted-indicator">
                        <FaCheckCircle />
                        <span>This voucher has been posted to the ledger.</span>
                    </div>
                )}
            </div>
        </div>
    );
}