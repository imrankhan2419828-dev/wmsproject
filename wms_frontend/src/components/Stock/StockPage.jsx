// src/components/Stock/StockPage.jsx
import React, { useState } from "react";
import stockApi from "../../api/stockApi";
import "./Stock.css";

const StockPage = () => {
    const [itemId, setItemId] = useState("");
    const [stock, setStock] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const checkStock = async () => {
        if (!itemId) return;

        setLoading(true);
        setError("");
        try {
            const res = await stockApi.getCurrent(itemId);
            console.log("Stock response:", res);

            // ✅ Handle wrapped response
            let stockValue = 0;
            if (res.data && res.data.data !== undefined) {
                stockValue = res.data.data;
            } else if (res.data !== undefined) {
                stockValue = res.data;
            }

            setStock(stockValue);
        } catch (err) {
            console.error("Stock check error:", err);
            setError("Failed to check stock");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="stock-page">
            <h2>Stock Management</h2>

            <div className="stock-checker">
                <input
                    type="number"
                    placeholder="Enter Item ID"
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                />
                <button onClick={checkStock} disabled={loading}>
                    Check Stock
                </button>
            </div>

            {loading && <div className="loading">Loading...</div>}
            {error && <div className="error">{error}</div>}

            {stock !== null && (
                <div className="stock-result">
                    <h3>Current Stock: <span className="stock-value">{stock}</span></h3>
                </div>
            )}
        </div>
    );
};

export default StockPage;