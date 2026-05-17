import React from 'react';
import './Loader.css';

export const Loader = ({
    size = 'md',
    variant = 'primary',
    fullScreen = false,
    text,
    className = ''
}) => {
    const loaderContent = (
        <div className={`loader-container ${fullScreen ? 'fullscreen' : ''} ${className}`}>
            <div className={`loader loader-${variant} loader-${size}`}>
                <div className="loader-spinner"></div>
            </div>
            {text && <span className="loader-text">{text}</span>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="loader-overlay">
                {loaderContent}
            </div>
        );
    }

    return loaderContent;
};

// Page Loader (Full screen with overlay)
export const PageLoader = ({ text = 'Loading...' }) => {
    return (
        <div className="page-loader">
            <div className="page-loader-content">
                <div className="loader-spinner-large"></div>
                <span className="page-loader-text">{text}</span>
            </div>
        </div>
    );
};

// Inline Loader (Small, for buttons etc)
export const InlineLoader = ({ size = 'sm', className = '' }) => {
    return (
        <span className={`inline-loader inline-loader-${size} ${className}`}>
            <span className="inline-loader-spinner"></span>
        </span>
    );
};

export default Loader;