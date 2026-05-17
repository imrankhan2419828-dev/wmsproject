import React, { useEffect, useState } from 'react';
import './Alert.css';

export const Alert = ({
    type = 'info',
    title,
    message,
    onClose,
    closable = true,
    autoClose = false,
    duration = 5000,
    className = '',
    icon = true
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (autoClose && onClose) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        if (onClose) {
            onClose();
        }
    };

    if (!isVisible) return null;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    return (
        <div className={`alert alert-${type} ${className}`} role="alert">
            {icon && (
                <div className="alert-icon">
                    {icons[type] || icons.info}
                </div>
            )}

            <div className="alert-content">
                {title && <div className="alert-title">{title}</div>}
                <div className="alert-message">{message}</div>
            </div>

            {closable && (
                <button
                    type="button"
                    className="alert-close"
                    onClick={handleClose}
                    aria-label="Close"
                >
                    ✕
                </button>
            )}
        </div>
    );
};

export default Alert;