import React, { useEffect, useState } from "react";
import vehicleApi from "../../../api/vehicleApi";
import VehicleModal from "./VehicleModal";
import { formatNumber } from "../../../utils/numberUtils";
import { FaCar, FaPlus, FaEdit, FaTrash, FaUser, FaCalendarAlt, FaTachometerAlt, FaPalette } from "react-icons/fa";
import { Button, useDialog } from "../../../components/common";
import { PageHeader, EmptyState, SearchFilterBar } from "../../../components/features";
import "./Vehicle.css";

// Chevron icons as simple components
const FaChevronDown = () => <span>▼</span>;
const FaChevronUp = () => <span>▲</span>;

export default function VehiclePage() {
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);

    // SearchFilterBar States
    const [showList, setShowList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filters State
    const [filters, setFilters] = useState({
        make: "", model: "", fuelType: "", yearFrom: "", yearTo: ""
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { showConfirm, showSuccess, showError } = useDialog();

    const loadVehicles = async () => {
        setLoading(true);
        try {
            const res = await vehicleApi.getAll();
            let vehiclesData = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                vehiclesData = res.data.data;
            } else if (Array.isArray(res.data)) {
                vehiclesData = res.data;
            }
            setVehicles(vehiclesData);
            setFilteredVehicles(vehiclesData);
        } catch (error) {
            console.error("Error loading vehicles:", error);
            showError(error.response?.data?.message || "Failed to load vehicles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVehicles();
    }, []);

    const applyFilters = () => {
        let filtered = [...vehicles];

        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(v =>
                (v.registrationNo || '').toLowerCase().includes(term) ||
                (v.make || '').toLowerCase().includes(term) ||
                (v.model || '').toLowerCase().includes(term) ||
                (v.customerName || '').toLowerCase().includes(term) ||
                (v.chassisNo || '').toLowerCase().includes(term)
            );
        }

        if (filters.make) {
            filtered = filtered.filter(v => (v.make || '').toLowerCase().includes(filters.make.toLowerCase()));
        }
        if (filters.model) {
            filtered = filtered.filter(v => (v.model || '').toLowerCase().includes(filters.model.toLowerCase()));
        }
        if (filters.fuelType) {
            filtered = filtered.filter(v => v.fuelType === filters.fuelType);
        }
        if (filters.yearFrom) {
            filtered = filtered.filter(v => v.year >= parseInt(filters.yearFrom));
        }
        if (filters.yearTo) {
            filtered = filtered.filter(v => v.year <= parseInt(filters.yearTo));
        }

        setFilteredVehicles(filtered);
        setCurrentPage(1);
        setShowList(true);
    };

    const resetFilters = () => {
        setFilters({ make: "", model: "", fuelType: "", yearFrom: "", yearTo: "" });
        setSearchTerm("");
        setFilteredVehicles(vehicles);
        setCurrentPage(1);
        setShowList(false);
        setShowFilters(false);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleApplyFilters = () => {
        applyFilters();
        setShowFilters(false);
    };

    const hasActiveFilters = filters.make || filters.model || filters.fuelType || filters.yearFrom || filters.yearTo;

    const handleAdd = () => {
        setSelectedVehicle(null);
        setShowModal(true);
    };

    const handleEdit = (vehicle) => {
        setSelectedVehicle(vehicle);
        setShowModal(true);
    };

    const handleDelete = async (id, registrationNo) => {
        showConfirm(`Delete vehicle "${registrationNo}"?`, async () => {
            try {
                await vehicleApi.delete(id);
                await loadVehicles();
                showSuccess(`Vehicle "${registrationNo}" deleted successfully`);
            } catch (error) {
                showError(error.response?.data?.message || "Failed to delete vehicle");
            }
        }, 'Delete Vehicle');
    };

    const displayVehicles = filteredVehicles;
    const totalPages = Math.ceil(displayVehicles.length / itemsPerPage);
    const currentItems = displayVehicles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const toggleExpand = (id) => setExpandedRow(expandedRow === id ? null : id);

    const filterComponents = (
        <>
            <input
                type="text"
                placeholder="Make"
                value={filters.make}
                onChange={(e) => handleFilterChange('make', e.target.value)}
                className="filter-input"
            />
            <input
                type="text"
                placeholder="Model"
                value={filters.model}
                onChange={(e) => handleFilterChange('model', e.target.value)}
                className="filter-input"
            />
            <select
                value={filters.fuelType}
                onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                className="filter-select"
            >
                <option value="">All Fuel Types</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
            </select>
            <div className="filter-group">
                <input
                    type="number"
                    placeholder="Year From"
                    value={filters.yearFrom}
                    onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                    className="filter-input"
                />
                <input
                    type="number"
                    placeholder="Year To"
                    value={filters.yearTo}
                    onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                    className="filter-input"
                />
            </div>
            <div className="filter-buttons">
                <Button variant="primary" size="sm" onClick={handleApplyFilters}>
                    Apply Filters
                </Button>
            </div>
        </>
    );

    const renderCardView = () => (
        <div className="vehicle-cards-grid">
            {currentItems.map(v => (
                <div key={v.vehicleID} className={`vehicle-card ${expandedRow === v.vehicleID ? 'expanded' : ''}`}>
                    <div className="vehicle-card-header" onClick={() => toggleExpand(v.vehicleID)}>
                        <FaCar className="card-icon" />
                        <div className="card-info">
                            <h4>{v.registrationNo}</h4>
                            <span><FaUser /> {v.customerName || 'N/A'}</span>
                        </div>
                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                            <button className="card-btn edit" onClick={() => handleEdit(v)}>
                                <FaEdit />
                            </button>
                            <button className="card-btn delete" onClick={() => handleDelete(v.vehicleID, v.registrationNo)}>
                                <FaTrash />
                            </button>
                            <button className="card-btn expand">
                                {expandedRow === v.vehicleID ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                        </div>
                    </div>
                    <div className="vehicle-card-body">
                        <div className="info-row"><FaCar /> {v.make} {v.model}</div>
                        <div className="info-row"><FaCalendarAlt /> Year: {v.year || '-'}</div>
                        <div className="info-row"><FaPalette /> Color: {v.color || '-'}</div>
                        <div className="info-row"><FaTachometerAlt /> Odometer: {formatNumber(v.odometerReading, 0)} km</div>
                    </div>
                    {expandedRow === v.vehicleID && (
                        <div className="vehicle-card-expanded">
                            <table className="expanded-table">
                                <tbody>
                                    <tr><th>Chassis No:</th><td>{v.chassisNo || '-'}</td></tr>
                                    <tr><th>Engine No:</th><td>{v.engineNo || '-'}</td></tr>
                                    <tr><th>Fuel Type:</th><td>{v.fuelType || '-'}</td></tr>
                                    <tr><th>Last Service:</th><td>{v.lastServiceDate ? new Date(v.lastServiceDate).toLocaleDateString() : '-'}</td></tr>
                                    <tr><th>Next Service:</th><td>{v.nextServiceDue ? new Date(v.nextServiceDue).toLocaleDateString() : '-'}</td></tr>
                                    {v.remarks && <tr><th>Remarks:</th><td>{v.remarks}</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="vehicle-page-premium">
            <PageHeader title="Vehicle Management" icon={<FaCar />} addButtonText="Add Vehicle" onAdd={handleAdd} />

            <SearchFilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search by registration, make, model, customer or chassis..."
                onRefresh={loadVehicles}
                showList={showList}
                onToggleList={() => setShowList(!showList)}
                showListText="Show List"
                hideListText="Hide List"
                onToggleFilters={() => setShowFilters(!showFilters)}
                showFilters={showFilters}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={resetFilters}
                onSearchSubmit={applyFilters}
                loading={loading}
                filterComponents={filterComponents}
            />

            {loading && (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading vehicles...</p>
                </div>
            )}

            {!loading && showList && (
                displayVehicles.length > 0 ? (
                    <>
                        {renderCardView()}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</button>
                                <span>Page {currentPage} of {totalPages}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyState icon={<FaCar />} title="No vehicles found" description="Try adjusting your filters" action={<Button variant="primary" onClick={resetFilters}>Clear Filters</Button>} />
                )
            )}

            {!loading && vehicles.length === 0 && !showList && (
                <EmptyState icon={<FaCar />} title="No vehicles yet" description="Get started by adding your first vehicle" action={<Button variant="primary" onClick={handleAdd} icon={<FaPlus />}>Add Vehicle</Button>} />
            )}

            {showModal && <VehicleModal vehicle={selectedVehicle} onClose={() => setShowModal(false)} onSaved={() => { loadVehicles(); setShowModal(false); }} />}
        </div>
    );
}