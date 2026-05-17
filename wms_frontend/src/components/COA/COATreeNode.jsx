import React, { useState } from 'react';
import { deleteCoa } from '../../api/coaApi';
import './COA.css';

const COATreeNode = ({ node, level, isExpanded, onToggle, onAddChild, onEdit, searchTerm, expandedNodes }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const hasChildren = node.children && node.children.length > 0;
    const showAddButton = node.isControlAccount || hasChildren;
    const showDeleteButton = node.acctLast === true && !node.isControlAccount;
    const canExpand = hasChildren || node.isControlAccount;

    const highlightText = (text) => {
        if (!searchTerm || !text) return text;
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? <mark key={i}>{part}</mark> : part
        );
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteCoa(node.acctID);
            setShowDeleteConfirm(false);
            window.location.reload();
        } catch (error) {
            console.error('Delete error:', error);
            alert(error.response?.data?.message || 'Failed to delete account');
        } finally {
            setDeleting(false);
        }
    };

    const getIcon = () => {
        if (canExpand) {
            return isExpanded ? '📂' : '📁';
        }
        if (node.accountCategory === 'Customer') return '👤';
        if (node.accountCategory === 'Supplier') return '🏭';
        if (node.accountCategory === 'Bank' || node.accountCategory === 'Cash & Bank') return '🏦';
        if (node.accountCategory === 'Expense') return '💰';
        if (node.accountCategory === 'Revenue') return '📈';
        if (node.accountCategory === 'Other') return '📦';
        return '📄';
    };

    const getBalanceDisplay = () => {
        if (node.openAmnt && node.openAmnt !== 0) {
            const absAmount = Math.abs(node.openAmnt).toLocaleString();
            if (node.openAmnt < 0) return `(Cr ${absAmount})`;
            return `(${node.normalSide === 'Dr' ? 'Dr' : 'Cr'} ${absAmount})`;
        }
        return '';
    };

    // ================================================================
    // Handle toggle - pass node.acctID directly
    // ================================================================
    const handleToggleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (canExpand && onToggle) {
            onToggle(node.acctID);
        }
    };

    const handleNodeClick = (e) => {
        if (e.target.closest('button')) return;
        if (e.target.closest('.node-actions')) return;
        if (e.target.closest('.confirm-modal')) return;
        handleToggleClick(e);
    };

    return (
        <>
            <div
                className={`tree-node ${node.acctType?.toLowerCase() || ''}`}
                style={{ paddingLeft: `${level * 20 + 12}px` }}
            >
                <div className="node-content" onClick={handleNodeClick}>
                    <span className="node-icon">{getIcon()}</span>
                    {canExpand ? (
                        <span
                            className="node-expand"
                            onClick={handleToggleClick}
                            style={{ cursor: 'pointer', zIndex: 10, userSelect: 'none' }}
                        >
                            {isExpanded ? '▼' : '▶'}
                        </span>
                    ) : (
                        <span className="node-expand-placeholder"></span>
                    )}
                    <span className="node-label">
                        <strong>{highlightText(node.acctCode)}</strong> - {highlightText(node.acctName)}
                        {node.isControlAccount && <span className="badge-control">Control</span>}
                        {node.accountCategory && !node.isControlAccount && (
                            <span className="badge-category">{node.accountCategory}</span>
                        )}
                        {node.lockAcct && <span className="badge-locked">🔒</span>}
                        <span className="balance">{getBalanceDisplay()}</span>
                    </span>
                </div>

                <div className="node-actions">
                    {showAddButton && (
                        <button className="action-btn action-add" onClick={(e) => { e.stopPropagation(); onAddChild(node); }} title="Add Child">➕</button>
                    )}
                    <button className="action-btn action-edit" onClick={(e) => { e.stopPropagation(); onEdit(node); }} title="Edit">✏️</button>
                    {showDeleteButton && (
                        <button className="action-btn action-delete" onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }} title="Delete">🗑️</button>
                    )}
                </div>
            </div>

            {isExpanded && hasChildren && (
                <div className="node-children">
                    {node.children.map(child => (
                        <COATreeNode
                            key={child.acctID}
                            node={child}
                            level={level + 1}
                            isExpanded={expandedNodes?.has(child.acctID) || false}
                            onToggle={onToggle}
                            onAddChild={onAddChild}
                            onEdit={onEdit}
                            searchTerm={searchTerm}
                            expandedNodes={expandedNodes}
                        />
                    ))}
                </div>
            )}

            {showDeleteConfirm && (
                <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="confirm-modal-content">
                        <h4>Confirm Delete</h4>
                        <p>Are you sure you want to delete <strong>"{node.acctName}"</strong>?</p>
                        <p className="warning">⚠️ This action cannot be undone!</p>
                        <div className="confirm-modal-actions">
                            <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                                {deleting ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                            <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default COATreeNode;