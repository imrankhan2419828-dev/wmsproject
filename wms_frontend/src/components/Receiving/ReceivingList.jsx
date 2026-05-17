//import React, { useEffect, useState } from "react";
//import receivingApi from "../../api/receivingApi";
//import ReceivingPopup from "./ReceivingPopup";

//const ReceivingList = ({ branchId, userId }) => {
//    const [receivings, setReceivings] = useState([]);
//    const [showPopup, setShowPopup] = useState(false);
//    const [editId, setEditId] = useState(null);

//    // 🔹 Fetch all receivings
//    const fetchReceivings = async () => {
//        try {
//            const res = await receivingApi.getAll(branchId);
//            setReceivings(res.data);
//        } catch (err) {
//            alert(err.response?.data?.message || err.message || "Failed to fetch receivings");
//        }
//    };

//    useEffect(() => { fetchReceivings(); }, [branchId]);

//    // 🔹 Handlers
//    const handleAdd = () => { setEditId(null); setShowPopup(true); };
//    const handleEdit = (id) => { setEditId(id); setShowPopup(true); };
//    const handleDelete = async (id) => {
//        if (!window.confirm("Are you sure to delete?")) return;
//        try {
//            await receivingApi.delete(id);
//            fetchReceivings();
//        } catch (err) {
//            alert(err.response?.data?.message || err.message || "Error deleting receiving");
//        }
//    };

//    return (
//        <div>
//            <h2>Receiving List</h2>
//            <button onClick={handleAdd}>Add Receiving</button>

//            <table border="1" cellPadding="5" style={{ marginTop: "10px", width: "100%" }}>
//                <thead>
//                    <tr>
//                        <th>ID</th>
//                        <th>Date</th>
//                        <th>Account</th>
//                        <th>Total Cash</th>
//                        <th>Total Cheque</th>
//                        <th>Total Amount</th>
//                        <th>Remarks</th>
//                        <th>Actions</th>
//                    </tr>
//                </thead>
//                <tbody>
//                    {receivings.length > 0 ? receivings.map(r => (
//                        <tr key={r.id}>
//                            <td>{r.id}</td>
//                            <td>{new Date(r.receiveDate).toLocaleDateString()}</td>
//                            <td>{r.accountName}</td>
//                            <td>{r.totalCash.toFixed(2)}</td>
//                            <td>{r.totalCheque.toFixed(2)}</td>
//                            <td>{r.totalAmount.toFixed(2)}</td>
//                            <td>{r.remarks}</td>
//                            <td>
//                                <button onClick={() => handleEdit(r.id)}>Edit</button>
//                                <button onClick={() => handleDelete(r.id)}>Delete</button>
//                            </td>
//                        </tr>
//                    )) : (
//                        <tr>
//                            <td colSpan="8" style={{ textAlign: "center" }}>No records found</td>
//                        </tr>
//                    )}
//                </tbody>
//            </table>

//            {/* 🔹 Popup for Add/Edit */}
//            {showPopup && (
//                <ReceivingPopup
//                    branchId={branchId}
//                    userId={userId}
//                    editId={editId}
//                    onClose={() => setShowPopup(false)}
//                    onSaved={() => { setShowPopup(false); fetchReceivings(); }}
//                />
//            )}
//        </div>
//    );
//};

//export default ReceivingList;
