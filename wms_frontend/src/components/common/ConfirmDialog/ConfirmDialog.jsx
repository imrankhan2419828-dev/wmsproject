import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import './ConfirmDialog.css';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm',
    message,
    type = 'success', // success, error, warning, info
    confirmText = 'OK',
    showCancel = false,
    cancelText = 'Cancel'
}) => {
    if (!isOpen) return null;

    const icons = {
        success: <FaCheckCircle className="dialog-icon success" />,
        error: <FaTimesCircle className="dialog-icon error" />,
        warning: <FaExclamationTriangle className="dialog-icon warning" />,
        info: <FaInfoCircle className="dialog-icon info" />
    };

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog-container" onClick={(e) => e.stopPropagation()}>
                <div className="dialog-content">
                    <div className="dialog-icon-wrapper">
                        {icons[type] || icons.info}
                    </div>
                    <h3 className="dialog-title">{title}</h3>
                    <p className="dialog-message">{message}</p>
                </div>
                <div className="dialog-actions">
                    {showCancel && (
                        <button className="dialog-btn dialog-btn-cancel" onClick={onClose}>
                            {cancelText}
                        </button>
                    )}
                    <button
                        className={`dialog-btn dialog-btn-${type}`}
                        onClick={() => {
                            onConfirm?.();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;