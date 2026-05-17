import React, { useState } from 'react';
import './Input.css';

export const Input = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    required = false,
    type = 'text',
    placeholder = '',
    disabled = false,
    readOnly = false,
    className = '',
    helperText = '',
    prefix = null,
    suffix = null,
    maxLength,
    autoFocus = false
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = type === 'password' && showPassword ? 'text' : type;

    const handleChange = (e) => {
        if (onChange) {
            onChange(e);
        }
    };

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={`input-wrapper ${className}`}>
            {label && (
                <label className="input-label" htmlFor={name}>
                    {label}
                    {required && <span className="required-star">*</span>}
                </label>
            )}

            <div className={`input-container ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}>
                {prefix && <span className="input-prefix">{prefix}</span>}

                <input
                    id={name}
                    name={name}
                    type={inputType}
                    value={value || ''}
                    onChange={handleChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    readOnly={readOnly}
                    maxLength={maxLength}
                    autoFocus={autoFocus}
                    className="input-field"
                    autoComplete="off"
                />

                {type === 'password' && value && (
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={togglePassword}
                        tabIndex={-1}
                    >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                )}

                {suffix && <span className="input-suffix">{suffix}</span>}
            </div>

            {(error || helperText) && (
                <div className={`input-message ${error ? 'error' : 'helper'}`}>
                    {error || helperText}
                </div>
            )}
        </div>
    );
};

export default Input;