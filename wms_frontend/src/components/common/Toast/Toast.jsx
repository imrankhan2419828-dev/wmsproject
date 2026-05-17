//import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
//import './Toast.css';

//const ToastContext = createContext();

//export const useToast = () => {
//    const context = useContext(ToastContext);
//    if (!context) {
//        throw new Error('useToast must be used within ToastProvider');
//    }
//    return context;
//};

//export const ToastProvider = ({ children }) => {
//    const [toasts, setToasts] = useState([]);
//    const timeoutsRef = useRef({});

//    const removeToast = useCallback((id) => {
//        // Clear timeout if exists
//        if (timeoutsRef.current[id]) {
//            clearTimeout(timeoutsRef.current[id]);
//            delete timeoutsRef.current[id];
//        }
//        setToasts(prev => prev.filter(toast => toast.id !== id));
//    }, []);

//    const showToast = useCallback((message, type = 'info', duration = 3000) => {
//        console.log('🔔 TOAST CALLED:', message, type);
//        const id = Date.now() + Math.random();

//        // Add new toast
//        setToasts(prev => [...prev, { id, message, type, duration }]);

//        // Set timeout to remove
//        timeoutsRef.current[id] = setTimeout(() => {
//            removeToast(id);
//        }, duration);

//        return id;
//    }, [removeToast]);

//    const success = (message, duration) => showToast(message, 'success', duration);
//    const error = (message, duration) => showToast(message, 'error', duration);
//    const warning = (message, duration) => showToast(message, 'warning', duration);
//    const info = (message, duration) => showToast(message, 'info', duration);

//    console.log('🍞 ToastProvider rendering, toasts count:', toasts.length);

//    return (
//        <ToastContext.Provider value={{
//            showToast,
//            removeToast,
//            success,
//            error,
//            warning,
//            info
//        }}>
//            {children}
//            {toasts.length > 0 && (
//                <div className="toast-container">
//                    {toasts.map(toast => (
//                        <div key={toast.id} className={`toast toast-${toast.type}`}>
//                            <div className="toast-content">
//                                <span className="toast-icon">
//                                    {toast.type === 'success' && '✓'}
//                                    {toast.type === 'error' && '✗'}
//                                    {toast.type === 'warning' && '⚠'}
//                                    {toast.type === 'info' && 'ℹ'}
//                                </span>
//                                <span className="toast-message">{toast.message}</span>
//                                <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
//                            </div>
//                        </div>
//                    ))}
//                </div>
//            )}
//        </ToastContext.Provider>
//    );
//};

import React, { createContext, useContext, useState, useCallback } from 'react';
import './Toast.css';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now();

        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after duration
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);

        return id;
    }, []);

    const value = {
        showToast,
        removeToast,
        success: (msg, dur) => showToast(msg, 'success', dur),
        error: (msg, dur) => showToast(msg, 'error', dur),
        warning: (msg, dur) => showToast(msg, 'warning', dur),
        info: (msg, dur) => showToast(msg, 'info', dur)
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="toast-wrapper">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast-item toast-${toast.type}`}>
                        <span className="toast-icon">
                            {toast.type === 'success' && '✓'}
                            {toast.type === 'error' && '✗'}
                            {toast.type === 'warning' && '⚠'}
                            {toast.type === 'info' && 'ℹ'}
                        </span>
                        <span className="toast-text">{toast.message}</span>
                        <button className="toast-close-btn" onClick={() => removeToast(toast.id)}>×</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};