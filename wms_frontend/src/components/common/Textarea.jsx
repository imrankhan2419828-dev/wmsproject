import React from 'react';
import './Form.css';

export const Textarea = ({
    label,
    name,
    value,
    onChange,
    error,
    required = false,
    placeholder = '',
    rows = 3,
    disabled = false
}) => {
    return (
        <div className="form-group">
            {label && (
                <label>
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                disabled={disabled}
                className={`form-control ${error ? 'is-invalid' : ''}`}
            />
            {error && <div className="error-feedback">{error}</div>}
        </div>
    );
};