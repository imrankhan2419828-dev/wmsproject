import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmDialog from './ConfirmDialog';

const DialogContext = createContext();

export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within DialogProvider');
    }
    return context;
};

export const DialogProvider = ({ children }) => {
    const [dialog, setDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success',
        confirmText: 'OK',
        showCancel: false,
        cancelText: 'Cancel',
        onConfirm: null
    });

    const showDialog = useCallback((options) => {
        setDialog({
            isOpen: true,
            title: options.title || 'Success',
            message: options.message,
            type: options.type || 'success',
            confirmText: options.confirmText || 'OK',
            showCancel: options.showCancel || false,
            cancelText: options.cancelText || 'Cancel',
            onConfirm: options.onConfirm || null
        });
    }, []);

    const hideDialog = useCallback(() => {
        setDialog(prev => ({ ...prev, isOpen: false }));
    }, []);

    // Convenience methods
    const showSuccess = useCallback((message, title = 'Success') => {
        showDialog({ title, message, type: 'success' });
    }, [showDialog]);

    const showError = useCallback((message, title = 'Error') => {
        showDialog({ title, message, type: 'error' });
    }, [showDialog]);

    const showWarning = useCallback((message, title = 'Warning') => {
        showDialog({ title, message, type: 'warning' });
    }, [showDialog]);

    const showInfo = useCallback((message, title = 'Info') => {
        showDialog({ title, message, type: 'info' });
    }, [showDialog]);

    const showConfirm = useCallback((message, onConfirm, title = 'Confirm') => {
        showDialog({
            title,
            message,
            type: 'warning',
            confirmText: 'Confirm',
            showCancel: true,
            cancelText: 'Cancel',
            onConfirm
        });
    }, [showDialog]);

    return (
        <DialogContext.Provider value={{
            showDialog,
            hideDialog,
            showSuccess,
            showError,
            showWarning,
            showInfo,
            showConfirm
        }}>
            {children}
            <ConfirmDialog
                isOpen={dialog.isOpen}
                onClose={hideDialog}
                onConfirm={dialog.onConfirm}
                title={dialog.title}
                message={dialog.message}
                type={dialog.type}
                confirmText={dialog.confirmText}
                showCancel={dialog.showCancel}
                cancelText={dialog.cancelText}
            />
        </DialogContext.Provider>
    );
};