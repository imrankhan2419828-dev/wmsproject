import React, { useEffect, useState } from "react";
import subcategoryApi from "../../api/subcategoryApi";
import SubcategoryPopup from "./SubcategoryPopup";
import {
    FaLayerGroup, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle
} from "react-icons/fa";
import { Button, useDialog } from "../../components/common";
import { PageHeader, SearchFilterBar, EmptyState } from "../../components/features";
import "./SubcategoryPage.css";

export default function SubcategoryPage() {
    const [subcategories, setSubcategories] = useState([]);
    const [selected, setSelected] = useState(null);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showList, setShowList] = useState(false);
    const [viewMode, setViewMode] = useState(() => {
        return window.innerWidth < 768 ? 'card' : 'table';
    });

    const { showConfirm, showSuccess, showError } = useDialog();

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await subcategoryApi.getAll();
            let data = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                data = res.data.data;
            } else if (Array.isArray(res.data)) {
                data = res.data;
            }
            setSubcategories(data);
        } catch (err) {
            console.error("Error loading subcategories:", err);
            setError(err.response?.data?.message || "Failed to load subcategories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setViewMode(window.innerWidth < 768 ? 'card' : 'table');
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Filter function
    const getFilteredSubcategories = () => {
        if (!searchTerm || searchTerm.trim() === '') {
            return subcategories;
        }
        const term = searchTerm.toLowerCase().trim();
        return subcategories.filter(item =>
            (item.subcatName?.toLowerCase() || '').includes(term) ||
            (item.companyName?.toLowerCase() || '').includes(term) ||
            (item.catgName?.toLowerCase() || '').includes(term)
        );
    };

    const displaySubcategories = getFilteredSubcategories();

    const handleDelete = (id, name) => {
        showConfirm(
            `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            async () => {
                try {
                    await subcategoryApi.delete(id);
                    await load();
                    showSuccess(`"${name}" deleted successfully!`);
                } catch (err) {
                    console.error("Delete error:", err);
                    showError(err.response?.data?.message || "Failed to delete subcategory");
                }
            },
            'Delete Subcategory'
        );
    };

    // Table View
    const renderTableView = () => (
        <div className="subcategory-table-wrapper">
            <table className="subcategory-table">
                <thead>
                    <tr>
                        <th>Subcategory Name</th>
                        <th>Company</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th className="actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {displaySubcategories.map((item) => (
                        <tr key={item.subcatID}>
                            <td>
                                <div className="subcategory-name-cell">
                                    <FaLayerGroup className="subcategory-icon-small" />
                                    <span>{item.subcatName}</span>
                                </div>
                            </td>
                            <td>{item.companyName || '-'}</td>
                            <td>{item.catgName || '-'}</td>
                            <td>
                                <span className={`type-badge ${item.isSparepart ? 'sparepart' : 'regular'}`}>
                                    {item.isSparepart ? '🔧 Spare Part' : '📦 Regular'}
                                </span>
                            </td>
                            <td>
                                <span className={`status-badge ${item.inActive ? 'inactive' : 'active'}`}>
                                    {item.inActive ? (
                                        <><FaTimesCircle /> Inactive</>
                                    ) : (
                                        <><FaCheckCircle /> Active</>
                                    )}
                                </span>
                            </td>
                            <td className="actions-col">
                                <button className="action-btn edit" onClick={() => { setSelected(item); setShow(true); }} title="Edit">
                                    <FaEdit />
                                </button>
                                <button className="action-btn delete" onClick={() => handleDelete(item.subcatID, item.subcatName)} title="Delete">
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Card View (Mobile)
    const renderCardView = () => (
        <div className="subcategory-cards-grid">
            {displaySubcategories.map((item) => (
                <div key={item.subcatID} className="subcategory-card-premium">
                    <div className="card-header-premium">
                        <div className="card-avatar">
                            <FaLayerGroup />
                        </div>
                        <div className="card-title-section">
                            <h3>{item.subcatName}</h3>
                            <div className="card-meta">
                                <span className="company-tag">{item.companyName}</span>
                                <span className="category-tag">{item.catgName}</span>
                            </div>
                        </div>
                        <div className="card-actions-premium">
                            <button className="card-btn edit" onClick={() => { setSelected(item); setShow(true); }}>
                                <FaEdit />
                            </button>
                            <button className="card-btn delete" onClick={() => handleDelete(item.subcatID, item.subcatName)}>
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                    <div className="card-body-premium">
                        <div className="card-info-row">
                            <span className="info-label">Type:</span>
                            <span className={`type-badge ${item.isSparepart ? 'sparepart' : 'regular'}`}>
                                {item.isSparepart ? '🔧 Spare Part' : '📦 Regular'}
                            </span>
                        </div>
                        <div className="card-info-row">
                            <span className="info-label">Status:</span>
                            <span className={`status-badge ${item.inActive ? 'inactive' : 'active'}`}>
                                {item.inActive ? (
                                    <><FaTimesCircle /> Inactive</>
                                ) : (
                                    <><FaCheckCircle /> Active</>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="subcategory-page-premium">
            <PageHeader
                title="Subcategory Management"
                
                icon={<FaLayerGroup />}
                addButtonText="Add Subcategory"
                onAdd={() => { setSelected(null); setShow(true); }}
            />

            <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search by name, company or category..."
                onRefresh={load}
                showList={showList}
                onToggleList={() => setShowList(!showList)}
                loading={loading}
            />

            {error && (
                <div className="error-alert">
                    <span>⚠</span>
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading subcategories...</p>
                </div>
            ) : showList ? (
                displaySubcategories.length > 0 ? (
                    viewMode === 'table' ? renderTableView() : renderCardView()
                ) : (
                    <EmptyState
                        icon={<FaLayerGroup />}
                        title="No subcategories found"
                        description={searchTerm ? 'Try adjusting your search' : 'Get started by adding your first subcategory'}
                        action={!searchTerm ? (
                            <Button variant="primary" onClick={() => { setSelected(null); setShow(true); }} icon={<FaPlus />}>
                                Add Subcategory
                            </Button>
                        ) : null}
                    />
                )
            ) : null}

            {show && (
                <SubcategoryPopup
                    data={selected}
                    onClose={() => setShow(false)}
                    onSaved={load}
                />
            )}
        </div>
    );
}