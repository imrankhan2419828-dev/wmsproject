import React, { useState, useEffect, useMemo } from 'react';
import { getCoaTree } from '../../api/coaApi';
import COATreeNode from './COATreeNode';
import './COA.css';

const CoaTree = ({ onAddChild, onEdit }) => {
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [viewMode, setViewMode] = useState('tree');

    const loadTree = async () => {
        setLoading(true);
        try {
            const response = await getCoaTree();
            const data = response.data?.data || [];
            setTree(data);
            setExpandedNodes(new Set());
        } catch (error) {
            console.error('Error loading COA tree:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTree();
    }, []);

    const stats = useMemo(() => {
        const result = { total: 0, control: 0, leaf: 0, categories: {} };
        const processNode = (node) => {
            result.total++;
            if (node.isControlAccount) result.control++;
            if (node.acctLast && !node.isControlAccount) result.leaf++;
            if (node.accountCategory) {
                result.categories[node.accountCategory] =
                    (result.categories[node.accountCategory] || 0) + 1;
            }
            if (node.children?.length) node.children.forEach(processNode);
        };
        tree.forEach(processNode);
        return result;
    }, [tree]);

    // ================================================================
    // SIMPLE TOGGLE - Just add/remove the ID from Set
    // ================================================================
    const handleToggle = (nodeId) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    };

    useEffect(() => {
        if (searchTerm?.length > 1) {
            const getAllIds = (nodes) => {
                let ids = [];
                nodes.forEach(n => {
                    ids.push(n.acctID);
                    if (n.children?.length) ids = [...ids, ...getAllIds(n.children)];
                });
                return ids;
            };
            setExpandedNodes(new Set(getAllIds(tree)));
        } else if (!searchTerm) {
            setExpandedNodes(new Set());
        }
    }, [searchTerm, tree]);

    const filterTree = (nodes, search) => {
        if (!search) return nodes;
        const term = search.toLowerCase();
        return nodes.map(node => {
            const children = node.children ? filterTree(node.children, search) : [];
            const matches =
                node.acctName?.toLowerCase().includes(term) ||
                node.acctCode?.toLowerCase().includes(term);
            return (matches || children.length) ? { ...node, children } : null;
        }).filter(Boolean);
    };

    const filteredTree = filterTree(tree, searchTerm);

    const expandAll = () => {
        const getAllIds = (nodes) => {
            let ids = [];
            nodes.forEach(n => {
                ids.push(n.acctID);
                if (n.children?.length) ids = [...ids, ...getAllIds(n.children)];
            });
            return ids;
        };
        setExpandedNodes(new Set(getAllIds(tree)));
    };

    const collapseAll = () => setExpandedNodes(new Set());

    return (
        <div className="coa-tree-wrapper">
            <div className="coa-toolbar">
                <div className="coa-view-toggle">
                    <button className={`toggle-btn ${viewMode === 'stats' ? 'active' : ''}`}
                        onClick={() => setViewMode('stats')}>📊 Overview</button>
                    <button className={`toggle-btn ${viewMode === 'tree' ? 'active' : ''}`}
                        onClick={() => setViewMode('tree')}>🌳 Tree View</button>
                </div>
                <div className="coa-search-box">
                    <span className="search-icon">🔍</span>
                    <input type="text" placeholder="Search accounts..."
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    {searchTerm && <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>}
                </div>
            </div>

            {viewMode === 'stats' && (
                <div className="coa-stats-dashboard">
                    <div className="stats-grid">
                        <div className="stat-card primary">
                            <span className="stat-num">{stats.total}</span>
                            <span className="stat-emoji">📊</span>
                            <span className="stat-lbl">Total Accounts</span>
                        </div>
                        <div className="stat-card info">
                            <span className="stat-num">{stats.control}</span>
                            <span className="stat-emoji">📁</span>
                            <span className="stat-lbl">Control</span>
                        </div>
                        <div className="stat-card success">
                            <span className="stat-num">{stats.leaf}</span>
                            <span className="stat-emoji">📄</span>
                            <span className="stat-lbl">Detail</span>
                        </div>
                    </div>
                    {Object.keys(stats.categories).length > 0 && (
                        <div className="category-breakdown">
                            <h4>📂 By Category</h4>
                            <div className="category-list">
                                {Object.entries(stats.categories).map(([cat, count]) => (
                                    <div key={cat} className="category-item">
                                        <span className="cat-emoji">
                                            {cat === 'Customer' ? '👤' : cat === 'Supplier' ? '🏭' : cat === 'Bank' ? '🏦' : cat === 'Expense' ? '💰' : '📦'}
                                        </span>
                                        <span className="cat-name">{cat}</span>
                                        <span className="cat-count">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <button className="btn-back-tree" onClick={() => setViewMode('tree')}>🌳 View Full Tree</button>
                </div>
            )}

            {viewMode === 'tree' && (
                <>
                    <div className="coa-tree-actions">
                        <button className="tree-action-btn" onClick={expandAll}>📂 Expand All</button>
                        <button className="tree-action-btn" onClick={collapseAll}>📁 Collapse All</button>
                        <button className="tree-action-btn" onClick={loadTree} disabled={loading}>🔄 Refresh</button>
                    </div>

                    <div className="coa-tree-container">
                        {loading ? (
                            <div className="coa-loading"><div className="coa-spinner"></div><p>Loading accounts...</p></div>
                        ) : filteredTree.length === 0 ? (
                            <div className="coa-empty">
                                <span className="empty-icon">📂</span>
                                <h4>{searchTerm ? 'No accounts found' : 'No accounts yet'}</h4>
                                <p>{searchTerm ? 'Try different keywords' : 'Start by adding your first account'}</p>
                            </div>
                        ) : (
                            <div className="coa-tree">
                                {filteredTree.map(node => (
                                    <COATreeNode
                                        key={node.acctID}
                                        node={node}
                                        level={0}
                                        isExpanded={expandedNodes.has(node.acctID)}
                                        onToggle={handleToggle}
                                        onAddChild={onAddChild}
                                        onEdit={onEdit}
                                        searchTerm={searchTerm}
                                        expandedNodes={expandedNodes}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default CoaTree;