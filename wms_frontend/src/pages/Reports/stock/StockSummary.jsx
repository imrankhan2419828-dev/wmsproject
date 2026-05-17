import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import { FaPrint, FaSearch } from "react-icons/fa";

export default function StockSummary() {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get("/Item/all");
            let data = res.data?.data || res.data || [];
            setItems(data);
            setFilteredItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (!searchTerm) {
            setFilteredItems(items);
        } else {
            setFilteredItems(items.filter(i =>
                i.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                i.modlNumb?.toLowerCase().includes(searchTerm.toLowerCase())
            ));
        }
    };

    const formatNumber = (num) => new Intl.NumberFormat('en-PK').format(num);

    return (
        <div className="general-ledger">
            <div className="ledger-header">
                <h3>Stock Summary</h3>
                <button onClick={() => window.print()} className="btn-print"><FaPrint /> Print</button>
            </div>

            <div className="ledger-filters">
                <div className="filter-group">
                    <label>Search Item</label>
                    <input
                        type="text"
                        placeholder="Item name or model..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <button onClick={handleSearch} className="btn-search"><FaSearch /> Search</button>
                </div>
            </div>

            {loading && <div className="loading">Loading...</div>}

            {!loading && (
                <table className="ledger-table">
                    <thead>
                        <tr>
                            <th>Item Code</th>
                            <th>Item Name</th>
                            <th>Model</th>
                            <th>Current Stock</th>
                            <th>Unit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => (
                            <tr key={item.itemID}>
                                <td>{item.itemCode}</td>
                                <td>{item.itemName}</td>
                                <td>{item.modlNumb}</td>
                                <td className="amount">{formatNumber(item.currentStock || 0)}</td>
                                <td>{item.unit}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}