import React, { useState, useRef, useEffect } from 'react';
import './Select.css';

export const Select = ({
    label,
    name,
    value,
    onChange,
    options = [],
    error,
    required = false,
    placeholder = 'Select...',
    disabled = false,
    className = '',
    helperText = '',
    searchable = false,
    clearable = false,
    loading = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const selectRef = useRef(null);
    const searchInputRef = useRef(null);

    // Filter options based on search
    const filteredOptions = searchable && searchTerm
        ? options.filter(opt =>
            opt.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            opt.value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
        : options;

    // Find selected option
    const selectedOption = options.find(opt => opt.value === value);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen, searchable]);

    const handleSelect = (option) => {
        if (onChange) {
            onChange({
                target: { name, value: option.value }
            });
        }
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        if (onChange) {
            onChange({
                target: { name, value: '' }
            });
        }
    };

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
                setSearchTerm('');
            }
        }
    };

    return (
        <div className={`select-wrapper ${className}`} ref={selectRef}>
            {label && (
                <label className="select-label" htmlFor={name}>
                    {label}
                    {required && <span className="required-star">*</span>}
                </label>
            )}

            <div className={`select-container ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''} ${isOpen ? 'is-open' : ''}`}>
                <div className="select-trigger" onClick={toggleDropdown}>
                    <span className={`select-value ${!selectedOption ? 'placeholder' : ''}`}>
                        {loading ? 'Loading...' : (selectedOption?.label || placeholder)}
                    </span>

                    <div className="select-actions">
                        {clearable && value && !disabled && (
                            <button
                                type="button"
                                className="select-clear"
                                onClick={handleClear}
                            >
                                ✕
                            </button>
                        )}
                        <span className={`select-arrow ${isOpen ? 'open' : ''}`}>
                            ▼
                        </span>
                    </div>
                </div>

                {isOpen && (
                    <div className="select-dropdown">
                        {searchable && (
                            <div className="select-search">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    className="select-search-input"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        )}

                        <div className="select-options">
                            {loading ? (
                                <div className="select-option loading">Loading...</div>
                            ) : filteredOptions.length === 0 ? (
                                <div className="select-option empty">No options found</div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <div
                                        key={option.value}
                                        className={`select-option ${option.value === value ? 'selected' : ''} ${option.disabled ? 'disabled' : ''}`}
                                        onClick={() => !option.disabled && handleSelect(option)}
                                    >
                                        {option.label}
                                        {option.value === value && (
                                            <span className="select-check">✓</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {(error || helperText) && (
                <div className={`select-message ${error ? 'error' : 'helper'}`}>
                    {error || helperText}
                </div>
            )}
        </div>
    );
};

export default Select;