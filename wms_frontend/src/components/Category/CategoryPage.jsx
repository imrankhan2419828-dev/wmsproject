import React, { useEffect, useState } from "react";
import categoryApi from "../../api/categoryApi";
import CategoryPopup from "./CategoryPopup";
import { useDialog } from "../../components/common";
import {
    FaTags, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle
} from "react-icons/fa";
import { Button } from "../../components/common";
import { PageHeader, SearchFilterBar, EmptyState } from "../../components/features";
import "./CategoryPage.css";

export default function CategoryPage() {
    const [categories, setCategories] = useState([]);
    const [selected, setSelected] = useState(null);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showList, setShowList] = useState(false);
    const { showConfirm, showSuccess, showError } = useDialog();
    const [viewMode, setViewMode] = useState(() => {
        return window.innerWidth < 768 ? 'card' : 'table';
    });

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await categoryApi.getAll();
            let categoriesData = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                categoriesData = res.data.data;
            } else if (Array.isArray(res.data)) {
                categoriesData = res.data;
            }
            setCategories(categoriesData);
        } catch (err) {
            console.error("Error loading categories:", err);
            setError("Failed to load categories");
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
    const getFilteredCategories = () => {
        if (!searchTerm || searchTerm.trim() === '') {
            return categories;
        }
        const term = searchTerm.toLowerCase().trim();
        return categories.filter(category =>
            (category.catgName?.toLowerCase() || '').includes(term)
        );
    };

    const displayCategories = getFilteredCategories();

    const handleDelete = (id, name) => {
        showConfirm(
            `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            async () => {
                try {
                    await categoryApi.delete(id);
                    await load();
                    showSuccess(`"${name}" deleted successfully!`);
                } catch (err) {
                    console.error("Delete error:", err);
                    showError(err.response?.data?.message || "Failed to delete category");
                }
            },
            'Delete Category'
        );
    };

    // Table View
    const renderTableView = () => (
        <div className="category-table-wrapper">
            <table className="category-table">
                <thead>
                    <tr>
                        <th>Category Name</th>
                        <th>Status</th>
                        <th className="actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {displayCategories.map((category) => (
                        <tr key={category.catgID}>
                            <td>
                                <div className="category-name-cell">
                                    <FaTags className="category-icon-small" />
                                    <span>{category.catgName}</span>
                                </div>
                            </td>
                            <td>
                                <span className={`status-badge ${category.inActive ? 'inactive' : 'active'}`}>
                                    {category.inActive ? (
                                        <><FaTimesCircle /> Inactive</>
                                    ) : (
                                        <><FaCheckCircle /> Active</>
                                    )}
                                </span>
                            </td>
                            <td className="actions-col">
                                <button className="action-btn edit" onClick={() => { setSelected(category); setShow(true); }} title="Edit">
                                    <FaEdit />
                                </button>
                                <button className="action-btn delete" onClick={() => handleDelete(category.catgID, category.catgName)} title="Delete">
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
        <div className="category-cards-grid">
            {displayCategories.map((category) => (
                <div key={category.catgID} className="category-card-premium">
                    <div className="card-header-premium">
                        <div className="card-avatar">
                            <FaTags />
                        </div>
                        <div className="card-title-section">
                            <h3>{category.catgName}</h3>
                            <span className={`status-badge ${category.inActive ? 'inactive' : 'active'}`}>
                                {category.inActive ? (
                                    <><FaTimesCircle /> Inactive</>
                                ) : (
                                    <><FaCheckCircle /> Active</>
                                )}
                            </span>
                        </div>
                        <div className="card-actions-premium">
                            <button className="card-btn edit" onClick={() => { setSelected(category); setShow(true); }}>
                                <FaEdit />
                            </button>
                            <button className="card-btn delete" onClick={() => handleDelete(category.catgID)}>
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="category-page-premium">
            {/* Global Page Header */}
            <PageHeader
                title="Category Management"
                
                icon={<FaTags />}
                addButtonText="Add Category"
                onAdd={() => { setSelected(null); setShow(true); }}
            />

            {/* Global Search Filter Bar */}
            <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search categories..."
                onRefresh={load}
                showList={showList}
                onToggleList={() => setShowList(!showList)}
                loading={loading}
            />

            {/* Error Message */}
            {error && (
                <div className="error-alert">
                    <span>⚠</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Content Area */}
            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading categories...</p>
                </div>
            ) : showList ? (
                displayCategories.length > 0 ? (
                    viewMode === 'table' ? renderTableView() : renderCardView()
                ) : (
                    <EmptyState
                        icon={<FaTags />}
                        title="No categories found"
                        description={searchTerm ? 'Try adjusting your search' : 'Get started by adding your first category'}
                        action={!searchTerm ? (
                            <Button variant="primary" onClick={() => { setSelected(null); setShow(true); }} icon={<FaPlus />}>
                                Add Category
                            </Button>
                        ) : null}
                    />
                )
            ) : null}

            {/* Popup Modal */}
            {show && (
                <CategoryPopup
                    data={selected}
                    onClose={() => setShow(false)}
                    onSaved={load}
                />
            )}
        </div>
    );
}