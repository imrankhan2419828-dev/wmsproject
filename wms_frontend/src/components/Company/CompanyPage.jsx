import React, { useEffect, useState } from "react";
import companyApi from "../../api/companyApi";
import CompanyPopup from "./CompanyPopup";
import {
    FaBuilding, FaEdit, FaTrash, FaPhone,
    FaEnvelope, FaUser, FaMapMarkerAlt, FaMobileAlt,
    FaPlus
} from "react-icons/fa";
import { Button, useDialog } from "../../components/common";
import { PageHeader, SearchFilterBar, EmptyState } from "../../components/features";
import "./company.css";

export default function CompanyPage() {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showList, setShowList] = useState(false);
    const [viewMode, setViewMode] = useState(() => {
        return window.innerWidth < 768 ? 'card' : 'table';
    });

    const { showConfirm, showSuccess, showError } = useDialog();

    const fetchCompanies = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await companyApi.getAll();
            let companiesData = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                companiesData = res.data.data;
            } else if (Array.isArray(res.data)) {
                companiesData = res.data;
            }
            setCompanies(companiesData);
        } catch (err) {
            console.error("Error fetching companies:", err);
            setError("Failed to load companies");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setViewMode(window.innerWidth < 768 ? 'card' : 'table');
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getFilteredCompanies = () => {
        if (!searchTerm || searchTerm.trim() === '') {
            return companies;
        }
        const term = searchTerm.toLowerCase().trim();
        return companies.filter(company => {
            return (
                (company.compName?.toLowerCase() || '').includes(term) ||
                (company.contPrsn?.toLowerCase() || '').includes(term) ||
                (company.emalAddr?.toLowerCase() || '').includes(term) ||
                (company.phonNumb?.toString() || '').includes(term) ||
                (company.cellNumb?.toString() || '').includes(term) ||
                (company.compAddr?.toLowerCase() || '').includes(term)
            );
        });
    };

    const displayCompanies = getFilteredCompanies();

    const handleEdit = (company) => {
        setSelectedCompany(company);
        setShowPopup(true);
    };

    const handleAdd = () => {
        setSelectedCompany(null);
        setShowPopup(true);
    };

    const handleDelete = (id, name) => {
        showConfirm(
            `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            async () => {
                try {
                    await companyApi.delete(id);
                    await fetchCompanies();
                    showSuccess(`"${name}" deleted successfully!`);
                } catch (err) {
                    console.error("Delete error:", err);
                    showError(err.response?.data?.message || "Failed to delete company");
                }
            },
            'Delete Company'
        );
    };

    const handleClosePopup = () => setShowPopup(false);

    const handleSave = async (data) => {
        try {
            if (data.compID) {
                await companyApi.update(data.compID, data);
            } else {
                await companyApi.create(data);
            }
            setShowPopup(false);
            fetchCompanies();
        } catch (err) {
            console.error("Save error:", err);
            throw err;
        }
    };

    // Table View
    const renderTableView = () => (
        <div className="company-table-wrapper">
            <table className="company-table">
                <thead>
                    <tr>
                        <th>Company Name</th>
                        <th>Contact Person</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th className="actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {displayCompanies.map((company) => (
                        <tr key={company.compID}>
                            <td>
                                <div className="company-name-cell">
                                    <FaBuilding className="company-icon-small" />
                                    <span>{company.compName}</span>
                                </div>
                            </td>
                            <td>{company.contPrsn || '-'}</td>
                            <td>{company.phonNumb || company.cellNumb || '-'}</td>
                            <td>{company.emalAddr || '-'}</td>
                            <td className="address-cell">{company.compAddr || '-'}</td>
                            <td className="actions-col">
                                <button className="action-btn edit" onClick={() => handleEdit(company)} title="Edit">
                                    <FaEdit />
                                </button>
                                <button className="action-btn delete" onClick={() => handleDelete(company.compID, company.compName)} title="Delete">
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
        <div className="company-cards-grid">
            {displayCompanies.map((company) => (
                <div key={company.compID} className="company-card-premium">
                    <div className="card-header-premium">
                        <div className="card-avatar">
                            <FaBuilding />
                        </div>
                        <div className="card-title-section">
                            <h3>{company.compName}</h3>
                            {company.contPrsn && (
                                <span className="card-subtitle">
                                    <FaUser /> {company.contPrsn}
                                </span>
                            )}
                        </div>
                        <div className="card-actions-premium">
                            <button className="card-btn edit" onClick={() => handleEdit(company)}>
                                <FaEdit />
                            </button>
                            <button className="card-btn delete" onClick={() => handleDelete(company.compID, company.compName)}>
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                    <div className="card-body-premium">
                        {(company.phonNumb || company.cellNumb) && (
                            <div className="card-info-row">
                                <FaPhone />
                                <span>{company.phonNumb || company.cellNumb}</span>
                            </div>
                        )}
                        {company.emalAddr && (
                            <div className="card-info-row">
                                <FaEnvelope />
                                <span>{company.emalAddr}</span>
                            </div>
                        )}
                        {company.compAddr && (
                            <div className="card-info-row">
                                <FaMapMarkerAlt />
                                <span>{company.compAddr}</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="company-page-premium">
            <PageHeader
                title="Company Management"
                
                icon={<FaBuilding />}
                addButtonText="Add Company"
                onAdd={handleAdd}
            />

            <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search companies by name, contact, email..."
                onRefresh={fetchCompanies}
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
                    <p>Loading companies...</p>
                </div>
            ) : showList ? (
                displayCompanies.length > 0 ? (
                    viewMode === 'table' ? renderTableView() : renderCardView()
                ) : (
                    <EmptyState
                        icon={<FaBuilding />}
                        title="No companies found"
                        description={searchTerm ? 'Try adjusting your search' : 'Get started by adding your first company'}
                        action={!searchTerm ? (
                            <Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>
                                Add Company
                            </Button>
                        ) : null}
                    />
                )
            ) : null}

            {showPopup && (
                <CompanyPopup
                    company={selectedCompany}
                    onClose={handleClosePopup}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}