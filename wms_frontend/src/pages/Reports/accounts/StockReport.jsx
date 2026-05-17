import React, { useState, useEffect } from "react";
import reportApi from "../../../api/reportApi";
import itemApi from "../../../api/itemApi";
import godownApi from "../../../api/godownApi";
import companyApi from "../../../api/companyApi";
import categoryApi from "../../../api/categoryApi";
import subcategoryApi from "../../../api/subcategoryApi";
import { FaSearch } from "react-icons/fa";
import ReportTemplate from "../ReportTemplate";

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
    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

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

    const f = (n) => n != null ? new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) : "-";
    const totalValue = data?.reduce((s, d) => s + (d.stockValue || 0), 0) || 0;

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

    return (
        <ReportTemplate title="STOCK REPORT" subtitle="Item-wise stock position" filters={filters} printedBy="admin"
            metaFields={data ? [{ label: "Items", value: data.length }, { label: "Total Value", value: showRateValue ? f(totalValue) : "N/A" }] : null}>
            {error && <div className="rp-error">⚠ {error}</div>}
            {loading && <div className="rp-no-data">⏳ Loading...</div>}
            {data && !loading && (
                <div className="rp-table-wrapper"><table className="rp-table" style={{ fontSize: 10 }}>
                    <thead><tr>
                        <th>Item</th><th>Model</th><th>Company</th><th>Category</th>
                        <th className="text-center">Opening</th><th className="text-center">Purch</th><th className="text-center">P.Ret</th>
                        <th className="text-center">Sale</th><th className="text-center">S.Ret</th><th className="text-center">Stock</th>
                        {showRateValue && <><th className="text-right">Rate</th><th className="text-right">Value</th></>}
                    </tr></thead>
                    <tbody>{data.map((d, i) => (<tr key={i}>
                        <td>{d.itemName}</td><td>{d.model || '-'}</td><td>{d.company || '-'}</td><td>{d.category || '-'}</td>
                        <td className="text-center">{d.openingStock}</td><td className="text-center">{d.purchaseQty}</td><td className="text-center">{d.purchaseReturnQty}</td>
                        <td className="text-center">{d.saleQty}</td><td className="text-center">{d.saleReturnQty}</td><td className="text-center"><strong>{d.currentStock}</strong></td>
                        {showRateValue && <><td className="text-right">{f(d.avgRate)}</td><td className="text-right"><strong>{f(d.stockValue)}</strong></td></>}
                    </tr>))}</tbody>
                </table></div>
            )}
            {!data && !loading && !error && <div className="rp-no-data">📊 Select filters and click "Generate Report"</div>}
        </ReportTemplate>
    );
}