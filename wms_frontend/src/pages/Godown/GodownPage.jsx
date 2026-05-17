import React, { useEffect, useState } from "react";
import godownApi from "../../api/godownApi";
import GodownPopup from "./GodownPopup";
import {
    FaWarehouse, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle
} from "react-icons/fa";
import { Button, useDialog } from "../../components/common";
import { PageHeader, SearchFilterBar, EmptyState } from "../../components/features";
import "./GodownPage.css";

export default function GodownPage() {
    const [godowns, setGodowns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);  // ← Default FALSE
    const [selectedGodown, setSelectedGodown] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showList, setShowList] = useState(false);
    const [viewMode, setViewMode] = useState(() => {
        return window.innerWidth < 768 ? 'card' : 'table';
    });
    const [error, setError] = useState("");

    const { showConfirm, showSuccess, showError } = useDialog();

    const loadGodowns = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await godownApi.getAll();
            let data = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                data = res.data.data;
            } else if (Array.isArray(res.data)) {
                data = res.data;
            }
            setGodowns(data);
        } catch (err) {
            console.error("Error loading godowns:", err);
            setError("Failed to load godowns");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGodowns();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setViewMode(window.innerWidth < 768 ? 'card' : 'table');
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Filter function
    const getFilteredGodowns = () => {
        if (!searchTerm || searchTerm.trim() === '') {
            return godowns;
        }
        const term = searchTerm.toLowerCase().trim();
        return godowns.filter(godown =>
            (godown.godnName?.toLowerCase() || '').includes(term)
        );
    };

    const displayGodowns = getFilteredGodowns();

    const handleAdd = () => {
        setSelectedGodown(null);
        setShowPopup(true);
    };

    const handleEdit = (godown) => {
        setSelectedGodown(godown);
        setShowPopup(true);
    };

    const handleDelete = (id, name) => {
        showConfirm(
            `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            async () => {
                try {
                    await godownApi.delete(id);
                    await loadGodowns();
                    showSuccess(`"${name}" deleted successfully!`);
                } catch (err) {
                    console.error("Delete error:", err);
                    showError(err.response?.data?.message || "Failed to delete godown");
                }
            },
            'Delete Godown'
        );
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setSelectedGodown(null);
    };

    const handleSave = async (formData) => {
        try {
            if (formData.godnID) {
                await godownApi.update(formData.godnID, formData);
            } else {
                await godownApi.create(formData);
            }
            // Return true for success
            return true;
        } catch (err) {
            console.error("Save error:", err);
            throw err;
        }
    };

    const handleSaved = () => {
        setShowPopup(false);
        setSelectedGodown(null);
        loadGodowns();
    };

    // Table View
    const renderTableView = () => (
        <div className="godown-table-wrapper">
            <table className="godown-table">
                <thead>
                    <tr>
                        <th>Godown Name</th>
                        <th>Status</th>
                        <th className="actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {displayGodowns.map((godown) => (
                        <tr key={godown.godnID}>
                            <td>
                                <div className="godown-name-cell">
                                    <FaWarehouse className="godown-icon-small" />
                                    <span>{godown.godnName}</span>
                                </div>
                            </td>
                            <td>
                                <span className={`status-badge ${godown.inActive ? 'inactive' : 'active'}`}>
                                    {godown.inActive ? (
                                        <><FaTimesCircle /> Inactive</>
                                    ) : (
                                        <><FaCheckCircle /> Active</>
                                    )}
                                </span>
                            </td>
                            <td className="actions-col">
                                <button className="action-btn edit" onClick={() => handleEdit(godown)} title="Edit">
                                    <FaEdit />
                                </button>
                                <button className="action-btn delete" onClick={() => handleDelete(godown.godnID, godown.godnName)} title="Delete">
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
        <div className="godown-cards-grid">
            {displayGodowns.map((godown) => (
                <div key={godown.godnID} className="godown-card-premium">
                    <div className="card-header-premium">
                        <div className="card-avatar">
                            <FaWarehouse />
                        </div>
                        <div className="card-title-section">
                            <h3>{godown.godnName}</h3>
                            <span className={`status-badge ${godown.inActive ? 'inactive' : 'active'}`}>
                                {godown.inActive ? (
                                    <><FaTimesCircle /> Inactive</>
                                ) : (
                                    <><FaCheckCircle /> Active</>
                                )}
                            </span>
                        </div>
                        <div className="card-actions-premium">
                            <button className="card-btn edit" onClick={() => handleEdit(godown)}>
                                <FaEdit />
                            </button>
                            <button className="card-btn delete" onClick={() => handleDelete(godown.godnID, godown.godnName)}>
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="godown-page-premium">
            <PageHeader
                title="Godown Management"
                
                icon={<FaWarehouse />}
                addButtonText="Add Godown"
                onAdd={handleAdd}
            />

            <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search godowns..."
                onRefresh={loadGodowns}
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
                    <p>Loading godowns...</p>
                </div>
            ) : showList ? (
                displayGodowns.length > 0 ? (
                    viewMode === 'table' ? renderTableView() : renderCardView()
                ) : (
                    <EmptyState
                        icon={<FaWarehouse />}
                        title="No godowns found"
                        description={searchTerm ? 'Try adjusting your search' : 'Get started by adding your first godown'}
                        action={!searchTerm ? (
                            <Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>
                                Add Godown
                            </Button>
                        ) : null}
                    />
                )
            ) : null}

            {/* Popup - ONLY render when showPopup is TRUE */}
            {showPopup && (
                <GodownPopup
                    data={selectedGodown}
                    onClose={handleClosePopup}
                    onSave={handleSave}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}