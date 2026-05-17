import React, { useState, useEffect } from 'react';
import { Button } from '../../common';
import { FaSearch, FaSync, FaEye, FaEyeSlash, FaFilter, FaTimes } from 'react-icons/fa';
import './SearchFilterBar.css';

/**
 * Global Search & Filter Bar Component
 * 
 * @param {string} searchValue - Current search value
 * @param {function} onSearchChange - Search input change handler
 * @param {string} searchPlaceholder - Search placeholder text
 * @param {function} onRefresh - Refresh button handler (optional)
 * @param {boolean} showList - Whether list is visible (optional)
 * @param {function} onToggleList - Toggle list visibility handler (optional)
 * @param {function} onToggleFilters - Toggle filters panel handler (optional)
 * @param {boolean} showFilters - Whether filters panel is visible (optional)
 * @param {boolean} hasActiveFilters - Whether any filter is active (optional)
 * @param {function} onClearFilters - Clear all filters handler (optional)
 * @param {function} onSearchSubmit - Manual search submit handler (optional)
 * @param {Array} filterComponents - Filter components to render (optional)
 * @param {boolean} loading - Loading state (optional)
 * @param {string} className - Additional CSS classes (optional)
 */
const SearchFilterBar = ({
    // Search Props
    searchValue = '',
    onSearchChange,
    searchPlaceholder = 'Search...',
    onSearchSubmit,

    // Refresh Props
    onRefresh,
    loading = false,

    // List Toggle Props
    showList = false,
    onToggleList,
    showListText = 'Show List',
    hideListText = 'Hide List',

    // Filter Props
    onToggleFilters,
    showFilters = false,
    hasActiveFilters = false,
    onClearFilters,
    filterComponents = null,

    // Extra
    className = ''
}) => {
    const [localSearch, setLocalSearch] = useState(searchValue);

    // Debounce search - only trigger after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== searchValue) {
                onSearchChange?.(localSearch);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [localSearch, searchValue, onSearchChange]);

    // Sync with external search value
    useEffect(() => {
        setLocalSearch(searchValue);
    }, [searchValue]);

    const handleClearSearch = () => {
        setLocalSearch('');
        onSearchChange?.('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            if (onSearchSubmit) {
                onSearchSubmit();
            } else if (onSearchChange) {
                onSearchChange(localSearch);
            }
        }
    };

    const handleManualSearch = () => {
        if (onSearchSubmit) {
            onSearchSubmit();
        } else if (onSearchChange) {
            onSearchChange(localSearch);
        }
    };

    return (
        <div className={`search-filter-bar ${className}`}>
            {/* Left Section - Search */}
            <div className="search-section">
                <div className="search-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="search-input"
                    />
                    {localSearch && (
                        <button className="clear-search-btn" onClick={handleClearSearch} title="Clear search">
                            <FaTimes />
                        </button>
                    )}
                </div>

                {/* Search Button (Optional) */}
                {(onSearchSubmit || onSearchChange) && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleManualSearch}
                        icon={<FaSearch />}
                    >
                        Search
                    </Button>
                )}
            </div>

            {/* Right Section - Actions */}
            <div className="actions-section">
                {/* Refresh Button */}
                {onRefresh && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        loading={loading}
                        icon={<FaSync />}
                    >
                        Refresh
                    </Button>
                )}

                {/* Show/Hide List Toggle */}
                {onToggleList && (
                    <Button
                        variant={showList ? 'primary' : 'outline'}
                        size="sm"
                        onClick={onToggleList}
                        icon={showList ? <FaEyeSlash /> : <FaEye />}
                    >
                        {showList ? hideListText : showListText}
                    </Button>
                )}

                {/* Filter Toggle Button */}
                {onToggleFilters && (
                    <Button
                        variant={showFilters ? 'primary' : 'outline'}
                        size="sm"
                        onClick={onToggleFilters}
                        icon={<FaFilter />}
                    >
                        Filters {hasActiveFilters && '(Active)'}
                    </Button>
                )}

                {/* Clear Filters Button */}
                {hasActiveFilters && onClearFilters && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearFilters}
                        icon={<FaTimes />}
                    >
                        Clear
                    </Button>
                )}
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && filterComponents && (
                <div className="advanced-filters">
                    {filterComponents}
                </div>
            )}
        </div>
    );
};

export default SearchFilterBar;