//import React from 'react';
//import Select from 'react-select';
//import './ReactSelect.css';

//const ReactSelect = ({
//    label,
//    name,
//    value,
//    onChange,
//    options = [],
//    error,
//    required = false,
//    placeholder = 'Select...',
//    disabled = false,
//    isSearchable = true,
//    isClearable = true,
//    isLoading = false,
//    className = ''
//}) => {
//    // Convert simple options to react-select format
//    const selectOptions = options.map(opt => ({
//        value: opt.value,
//        label: opt.label
//    }));

//    // Find selected option
//    const selectedOption = selectOptions.find(opt => opt.value === value) || null;

//    const handleChange = (selected) => {
//        onChange({
//            target: {
//                name,
//                value: selected?.value || ''
//            }
//        });
//    };

//    return (
//        <div className={`react-select-wrapper ${className}`}>
//            {label && (
//                <label className="react-select-label">
//                    {label}
//                    {required && <span className="required-star">*</span>}
//                </label>
//            )}

//            <Select
//                value={selectedOption}
//                onChange={handleChange}
//                options={selectOptions}
//                placeholder={placeholder}
//                isDisabled={disabled}
//                isSearchable={isSearchable}
//                isClearable={isClearable}
//                isLoading={isLoading}
//                className={`react-select-container ${error ? 'has-error' : ''}`}
//                classNamePrefix="react-select"
//                noOptionsMessage={() => "No options found"}
//                loadingMessage={() => "Loading..."}
//                styles={{
//                    control: (base, state) => ({
//                        ...base,
//                        minHeight: '40px',
//                        borderColor: error ? 'var(--danger)' : 'var(--border-color)',
//                        borderRadius: 'var(--radius-md)',
//                        boxShadow: state.isFocused ? '0 0 0 3px rgba(var(--primary-rgb), 0.1)' : 'none',
//                        '&:hover': {
//                            borderColor: error ? 'var(--danger)' : 'var(--primary)'
//                        }
//                    }),
//                    menu: (base) => ({
//                        ...base,
//                        borderRadius: 'var(--radius-md)',
//                        boxShadow: 'var(--shadow-lg)',
//                        zIndex: 1000
//                    }),
//                    option: (base, state) => ({
//                        ...base,
//                        backgroundColor: state.isSelected
//                            ? 'var(--primary)'
//                            : state.isFocused
//                                ? 'var(--bg-secondary)'
//                                : 'transparent',
//                        color: state.isSelected ? 'white' : 'var(--text-primary)',
//                        fontSize: '14px',
//                        padding: '10px 12px',
//                        cursor: 'pointer',
//                        '&:active': {
//                            backgroundColor: 'var(--primary)'
//                        }
//                    }),
//                    placeholder: (base) => ({
//                        ...base,
//                        color: 'var(--text-muted)',
//                        fontSize: '14px'
//                    }),
//                    singleValue: (base) => ({
//                        ...base,
//                        color: 'var(--text-primary)',
//                        fontSize: '14px'
//                    }),
//                    input: (base) => ({
//                        ...base,
//                        color: 'var(--text-primary)',
//                        fontSize: '14px'
//                    }),
//                    indicatorSeparator: () => ({
//                        display: 'none'
//                    }),
//                    dropdownIndicator: (base) => ({
//                        ...base,
//                        color: 'var(--text-muted)',
//                        '&:hover': {
//                            color: 'var(--primary)'
//                        }
//                    }),
//                    clearIndicator: (base) => ({
//                        ...base,
//                        color: 'var(--text-muted)',
//                        '&:hover': {
//                            color: 'var(--danger)'
//                        }
//                    })
//                }}
//            />

//            {error && (
//                <div className="react-select-error">{error}</div>
//            )}
//        </div>
//    );
//};

//export default ReactSelect;


import React from 'react';
import Select from 'react-select';
import './ReactSelect.css';

const ReactSelect = ({
    label,
    name,
    value,
    onChange,
    options = [],
    error,
    required = false,
    placeholder = 'Select...',
    disabled = false,
    isSearchable = true,
    isClearable = true,
    isLoading = false,
    className = ''
}) => {
    const selectOptions = options.map(opt => ({
        value: opt.value,
        label: opt.label
    }));

    // Support both object and primitive value
    let selectedOption = null;
    if (value && typeof value === 'object' && value.value) {
        // If value is already an object with value property
        selectedOption = value;
    } else {
        // If value is primitive
        selectedOption = selectOptions.find(opt => opt.value === value) || null;
    }

    const handleChange = (selected) => {
        if (onChange) {
            // Support both handler types
            if (typeof onChange === 'function') {
                // Check if onChange expects selected object directly
                onChange(selected);
            }
        }
    };

    return (
        <div className={`react-select-wrapper ${className}`}>
            {label && (
                <label className="react-select-label">
                    {label}
                    {required && <span className="required-star">*</span>}
                </label>
            )}

            <Select
                value={selectedOption}
                onChange={handleChange}
                options={selectOptions}
                placeholder={placeholder}
                isDisabled={disabled}
                isSearchable={isSearchable}
                isClearable={isClearable}
                isLoading={isLoading}
                className={`react-select-container ${error ? 'has-error' : ''}`}
                classNamePrefix="react-select"
                noOptionsMessage={() => "No options found"}
                loadingMessage={() => "Loading..."}
                menuPortalTarget={document.body}
                styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    control: (base, state) => ({
                        ...base,
                        minHeight: '40px',
                        borderColor: error ? 'var(--danger)' : 'var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: state.isFocused ? '0 0 0 3px rgba(var(--primary-rgb), 0.1)' : 'none',
                        '&:hover': {
                            borderColor: error ? 'var(--danger)' : 'var(--primary)'
                        }
                    }),
                    menu: (base) => ({
                        ...base,
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 9998
                    }),
                    option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                            ? 'var(--primary)'
                            : state.isFocused
                                ? 'var(--bg-secondary)'
                                : 'transparent',
                        color: state.isSelected ? 'white' : 'var(--text-primary)',
                        fontSize: '14px',
                        padding: '10px 12px',
                        cursor: 'pointer',
                        '&:active': {
                            backgroundColor: 'var(--primary)'
                        }
                    }),
                    placeholder: (base) => ({
                        ...base,
                        color: 'var(--text-muted)',
                        fontSize: '14px'
                    }),
                    singleValue: (base) => ({
                        ...base,
                        color: 'var(--text-primary)',
                        fontSize: '14px'
                    }),
                    input: (base) => ({
                        ...base,
                        color: 'var(--text-primary)',
                        fontSize: '14px'
                    }),
                    indicatorSeparator: () => ({
                        display: 'none'
                    }),
                    dropdownIndicator: (base) => ({
                        ...base,
                        color: 'var(--text-muted)',
                        '&:hover': {
                            color: 'var(--primary)'
                        }
                    }),
                    clearIndicator: (base) => ({
                        ...base,
                        color: 'var(--text-muted)',
                        '&:hover': {
                            color: 'var(--danger)'
                        }
                    })
                }}
            />

            {error && (
                <div className="react-select-error">{error}</div>
            )}
        </div>
    );
};

export default ReactSelect;