//import { useEffect, useState } from "react";
//import { getTrialBalance } from "../../api/trialBalanceApi";

//const TrialBalance = () => {
//    const [data, setData] = useState([]);

//    useEffect(() => {
//        load();
//    }, []);

//    const load = async () => {
//        const res = await getTrialBalance();
//        setData(res.data);
//    };

//    const totalDebit = data.reduce((s, x) => s + x.debit, 0);
//    const totalCredit = data.reduce((s, x) => s + x.credit, 0);

//    return (
//        <div>
//            <h2>Trial Balance</h2>

//            <table border="1" cellPadding="6">
//                <thead>
//                    <tr>
//                        <th>Account Code</th>
//                        <th>Account Name</th>
//                        <th>Debit</th>
//                        <th>Credit</th>
//                    </tr>
//                </thead>
//                <tbody>
//                    {data.map((x, i) => (
//                        <tr key={i}>
//                            <td>{x.acctCode}</td>
//                            <td>{x.acctName}</td>
//                            <td align="right">{x.debit.toFixed(2)}</td>
//                            <td align="right">{x.credit.toFixed(2)}</td>
//                        </tr>
//                    ))}
//                </tbody>
//                <tfoot>
//                    <tr>
//                        <th colSpan="2">TOTAL</th>
//                        <th align="right">{totalDebit.toFixed(2)}</th>
//                        <th align="right">{totalCredit.toFixed(2)}</th>
//                    </tr>
//                </tfoot>
//            </table>
//        </div>
//    );
//};

//export default TrialBalance;
import { useEffect, useState } from "react";
import trialBalanceApi from "../../api/trialBalanceApi";
import "./TrialBalance.css";

const TrialBalance = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await trialBalanceApi.getTrialBalance();

            console.log("Trial balance response:", response);

            // ✅ Handle wrapped response
            let trialData = [];
            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                trialData = response.data.data;
            } else if (Array.isArray(response.data)) {
                trialData = response.data;
            }

            setData(trialData);
        } catch (err) {
            console.error("Error loading trial balance:", err);
            setError("Failed to load trial balance");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const totalDebit = data.reduce((s, x) => s + (x.debit || 0), 0);
    const totalCredit = data.reduce((s, x) => s + (x.credit || 0), 0);
    const difference = totalDebit - totalCredit;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-PK", {
            style: "currency",
            currency: "PKR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    return (
        <div className="trial-balance-page">
            <div className="page-header">
                <h2>Trial Balance</h2>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading-spinner">Loading trial balance...</div>
            ) : (
                <div className="table-responsive">
                    <table className="trial-balance-table">
                        <thead>
                            <tr>
                                <th>Account Code</th>
                                <th>Account Name</th>
                                <th className="amount-header">Debit (Rs.)</th>
                                <th className="amount-header">Credit (Rs.)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((x, i) => (
                                    <tr key={i}>
                                        <td>{x.acctCode || '-'}</td>
                                        <td>{x.acctName || '-'}</td>
                                        <td className="amount-cell">{formatCurrency(x.debit)}</td>
                                        <td className="amount-cell">{formatCurrency(x.credit)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="no-data">
                                        No data found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th colSpan="2" className="total-label">TOTAL</th>
                                <th className="amount-cell total-amount">{formatCurrency(totalDebit)}</th>
                                <th className="amount-cell total-amount">{formatCurrency(totalCredit)}</th>
                            </tr>
                            <tr>
                                <th colSpan="2" className="total-label">DIFFERENCE</th>
                                <th colSpan="2" className={`amount-cell ${Math.abs(difference) < 0.01 ? 'balanced' : 'unbalanced'}`}>
                                    {formatCurrency(difference)}
                                    {Math.abs(difference) < 0.01 && ' (Balanced)'}
                                </th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TrialBalance;