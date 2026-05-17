import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import voucherApi from "../../../api/voucherApi";
import vochTypeApi from "../../../api/vochTypeApi";
import { FaEye, FaSearch } from "react-icons/fa";
import ReportTemplate from "../ReportTemplate";

export default function VoucherList() {
    const navigate = useNavigate();
    const [vouchers, setVouchers] = useState([]);
    const [voucherTypes, setVoucherTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ vochType: "", fromDate: "", toDate: "" });
    const [searched, setSearched] = useState(false);

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

    const formatDt = (d) => {
        if (!d) return "";
        const dt = new Date(d);
        const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${String(dt.getDate()).padStart(2, '0')}-${m[dt.getMonth()]}-${dt.getFullYear()}`;
    };

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

    const totalPosted = vouchers.filter(v => v.isPosted).length;
    const totalPending = vouchers.filter(v => !v.isPosted).length;

    return (
        <ReportTemplate
            title="VOUCHER LIST"
            subtitle="All accounting vouchers with status"
            filters={filtersBar}
            printedBy="admin"
            metaFields={searched ? [
                { label: "Total Vouchers", value: vouchers.length },
                { label: "Posted", value: totalPosted },
                { label: "Pending", value: totalPending },
            ] : null}
        >
            {loading && <div className="rp-no-data">⏳ Loading vouchers...</div>}

            {!loading && searched && (
                <div className="rp-table-wrapper">
                    <table className="rp-table">
                        <thead>
                            <tr>
                                <th>Voucher #</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th className="text-center">Status</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vouchers.length > 0 ? vouchers.map(v => (
                                <tr key={v.acctTranID}>
                                    <td><strong>{v.vochNumb}</strong></td>
                                    <td>{formatDt(v.tranDate)}</td>
                                    <td>{getVoucherTypeName(v.vochType)}</td>
                                    <td>{v.tranDesc || '-'}</td>
                                    <td className="text-center">
                                        <span style={{
                                            padding: '2px 10px',
                                            borderRadius: 10,
                                            fontSize: 10,
                                            fontWeight: 600,
                                            background: v.isPosted ? '#d1fae5' : '#fef3c7',
                                            color: v.isPosted ? '#065f46' : '#92400e'
                                        }}>
                                            {v.isPosted ? '✅ Posted' : '⏳ Pending'}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <button
                                            onClick={() => handleView(v.acctTranID)}
                                            style={{
                                                background: '#2563eb',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '5px 12px',
                                                borderRadius: 6,
                                                cursor: 'pointer',
                                                fontSize: 11
                                            }}
                                        >
                                            <FaEye /> View
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="rp-no-data">No vouchers found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && !searched && (
                <div className="rp-no-data">📊 Select filters and click "Search" to view vouchers</div>
            )}
        </ReportTemplate>
    );
}