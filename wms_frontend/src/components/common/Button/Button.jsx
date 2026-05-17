import React from 'react';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    onClick,
    type = 'button',
    className = '',
    fullWidth = false,
    icon = null,
    iconPosition = 'left'
}) => {
    const classes = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth ? 'btn-full' : '',
        loading ? 'btn-loading' : '',
        icon && !children ? 'btn-icon-only' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={classes}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {loading && <span className="btn-spinner"></span>}
            {icon && iconPosition === 'left' && !loading && (
                <span className="btn-icon btn-icon-left">{icon}</span>
            )}
            {children && <span className="btn-text">{children}</span>}
            {icon && iconPosition === 'right' && !loading && (
                <span className="btn-icon btn-icon-right">{icon}</span>
            )}
        </button>
    );
};

export default Button;