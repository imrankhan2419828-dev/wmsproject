import React, { useState } from 'react';
import { Input, Select, DatePicker, Button } from '../../common';
import { FaSearch, FaFilter, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './FilterBar.css';

export const FilterBar = ({
    filters = [],
    onFilterChange,
    onSearch,
    onClear,
    onToggleList,
    showList = false,
    loading = false,
    className = ''
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [filterValues, setFilterValues] = useState({});

    const handleFilterChange = (name, value) => {
        const newValues = { ...filterValues, [name]: value };
        setFilterValues(newValues);
        if (onFilterChange) {
            onFilterChange(newValues);
        }
    };

    const handleSearch = () => {
        if (onSearch) {
            onSearch(filterValues);
        }
    };

    const handleClear = () => {
        setFilterValues({});
        if (onClear) {
            onClear();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const renderFilterInput = (filter) => {
        const value = filterValues[filter.name] || '';

        switch (filter.type) {
            case 'select':
                return (
                    <Select
                        name={filter.name}
                        value={value}
                        onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                        options={filter.options || []}
                        placeholder={filter.placeholder || `Select ${filter.label}`}
                        className="filter-select"
                    />
                );

            case 'date':
                return (
                    <DatePicker
                        name={filter.name}
                        value={value}
                        onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                        placeholder={filter.placeholder || 'Select date'}
                        className="filter-date"
                    />
                );

            case 'dateRange':
                return (
                    <div className="date-range-filter">
                        <DatePicker
                            name={`${filter.name}Start`}
                            value={filterValues[`${filter.name}Start`] || ''}
                            onChange={(e) => handleFilterChange(`${filter.name}Start`, e.target.value)}
                            placeholder="From"
                        />
                        <span className="date-range-separator">-</span>
                        <DatePicker
                            name={`${filter.name}End`}
                            value={filterValues[`${filter.name}End`] || ''}
                            onChange={(e) => handleFilterChange(`${filter.name}End`, e.target.value)}
                            placeholder="To"
                        />
                    </div>
                );

            default:
                return (
                    <Input
                        name={filter.name}
                        value={value}
                        onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={filter.placeholder || `Search ${filter.label}...`}
                        prefix={<FaSearch />}
                        className="filter-input"
                    />
                );
        }
    };

    const basicFilters = filters.filter(f => !f.advanced);
    const advancedFilters = filters.filter(f => f.advanced);

    const hasActiveFilters = Object.keys(filterValues).length > 0;

    return (
        <div className={`filter-bar ${className}`}>
            {/* Basic Filters Row */}
            <div className="filter-bar-main">
                <div className="filters-container">
                    {basicFilters.map((filter) => (
                        <div key={filter.name} className="filter-item">
                            {filter.label && (
                                <label className="filter-label">{filter.label}</label>
                            )}
                            {renderFilterInput(filter)}
                        </div>
                    ))}
                </div>

                <div className="filter-actions">
                    {onSearch && (
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleSearch}
                            loading={loading}
                            icon={<FaSearch />}
                        >
                            Search
                        </Button>
                    )}

                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="md"
                            onClick={handleClear}
                            icon={<FaTimes />}
                        >
                            Clear
                        </Button>
                    )}

                    {advancedFilters.length > 0 && (
                        <Button
                            variant="ghost"
                            size="md"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            icon={showAdvanced ? <FaChevronUp /> : <FaChevronDown />}
                        >
                            {showAdvanced ? 'Less' : 'More'} Filters
                        </Button>
                    )}

                    {onToggleList && (
                        <Button
                            variant={showList ? 'primary' : 'outline'}
                            size="md"
                            onClick={onToggleList}
                            icon={<FaFilter />}
                        >
                            {showList ? 'Hide' : 'Show'} List
                        </Button>
                    )}
                </div>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && advancedFilters.length > 0 && (
                <div className="filter-bar-advanced">
                    <div className="filters-container">
                        {advancedFilters.map((filter) => (
                            <div key={filter.name} className="filter-item">
                                {filter.label && (
                                    <label className="filter-label">{filter.label}</label>
                                )}
                                {renderFilterInput(filter)}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Filters Summary */}
            {hasActiveFilters && (
                <div className="active-filters">
                    <span className="active-filters-label">Active Filters:</span>
                    <div className="active-filters-list">
                        {Object.entries(filterValues).map(([key, value]) => {
                            if (!value) return null;
                            const filter = [...basicFilters, ...advancedFilters].find(f => f.name === key);
                            if (!filter) return null;

                            return (
                                <span key={key} className="active-filter-tag">
                                    {filter.label}: {value}
                                    <button
                                        className="remove-filter"
                                        onClick={() => handleFilterChange(key, '')}
                                    >
                                        <FaTimes />
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterBar;