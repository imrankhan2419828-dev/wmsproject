import React, { useEffect, useState } from "react";
import inspectionApi from "../../../api/inspectionApi";
import InspectionItemModal from "./InspectionItemModal";
import { Modal } from "../../../components/common/Modal/Modal";
import { Button, useDialog } from "../../../components/common";
import { FaList, FaPlus, FaEdit, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import "./Inspection.css";

const ITEM_TYPES = [
    { value: 'CHECKBOX', label: 'Checkbox (Pass/Fail)' },
    { value: 'YES_NO', label: 'Yes/No' },
    { value: 'TEXT', label: 'Text' },
    { value: 'NUMBER', label: 'Number' },
    { value: 'RANGE', label: 'Range' }
];

export default function InspectionItemsPage({ template, onClose }) {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showConfirm, showSuccess, showError } = useDialog();

    const loadItems = async () => {
        setLoading(true);
        try {
            const res = await inspectionApi.getItemsByTemplate(template.templateID);
            let data = res.data?.data || res.data || [];
            setItems(data);
        } catch (error) {
            showError(error.response?.data?.message || "Failed to load items");
        } finally { setLoading(false); }
    };

    useEffect(() => { loadItems(); }, []);

    const handleDelete = async (id, name) => {
        showConfirm(`Delete item "${name}"?`, async () => {
            try {
                await inspectionApi.deleteItem(id);
                showSuccess("Item deleted successfully");
                loadItems();
            } catch (error) {
                showError(error.response?.data?.message || "Failed to delete item");
            }
        }, "Delete Item");
    };

    const modalFooter = (
        <div className="inspection-modal-footer">
            <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
    );

    return (
        <Modal isOpen={true} onClose={onClose} title={<><FaList /> Inspection Items - {template.templateName}</>} size="lg" footer={modalFooter}>
            <div className="inspection-items-container">
                <div className="items-toolbar">
                    <Button variant="primary" size="sm" onClick={() => { setSelectedItem(null); setShowModal(true); }} icon={<FaPlus />}>Add Item</Button>
                </div>

                {loading ? (
                    <div className="loading-container"><div className="spinner"></div><p>Loading items...</p></div>
                ) : (
                    <div className="items-list">
                        {items.length > 0 ? (
                            items.map(item => (
                                <div key={item.itemID} className="item-card">
                                    <div className="item-header">
                                        <div className="item-title">
                                            <span className="item-code">{item.itemCode}</span>
                                            <span className="item-name">{item.itemName}</span>
                                            {item.isCritical && <span className="critical-badge"><FaExclamationTriangle /> Critical</span>}
                                        </div>
                                        <div className="item-actions">
                                            <button className="card-btn edit" onClick={() => { setSelectedItem(item); setShowModal(true); }}><FaEdit /></button>
                                            <button className="card-btn delete" onClick={() => handleDelete(item.itemID, item.itemName)}><FaTrash /></button>
                                        </div>
                                    </div>
                                    <div className="item-details">
                                        <div className="detail-row"><span className="detail-label">Type:</span><span>{ITEM_TYPES.find(t => t.value === item.itemType)?.label || item.itemType}</span></div>
                                        {item.expectedValue && <div className="detail-row"><span className="detail-label">Expected:</span><span>{item.expectedValue} {item.unit}</span></div>}
                                        {item.minValue !== null && <div className="detail-row"><span className="detail-label">Range:</span><span>{item.minValue} - {item.maxValue} {item.unit}</span></div>}
                                        <div className="detail-row"><span className="detail-label">Options:</span><span>{item.requiresPhoto ? '📷 ' : ''}{item.requiresRemarks ? '📝 ' : ''}Order: {item.displayOrder}</span></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">No items found. Click "Add Item" to create one.</div>
                        )}
                    </div>
                )}
            </div>

            {showModal && (
                <InspectionItemModal
                    item={selectedItem}
                    templateId={template.templateID}
                    onClose={() => { setShowModal(false); setSelectedItem(null); }}
                    onSaved={() => { loadItems(); setShowModal(false); setSelectedItem(null); }}
                />
            )}
        </Modal>
    );
}