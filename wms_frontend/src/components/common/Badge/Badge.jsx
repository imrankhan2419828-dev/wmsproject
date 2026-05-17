import React from 'react';
import './Badge.css';

export const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    rounded = false,
    className = '',
    dot = false
}) => {
    const classes = [
        'badge',
        `badge-${variant}`,
        `badge-${size}`,
        rounded ? 'badge-rounded' : '',
        dot ? 'badge-dot' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <span className={classes}>
            {dot && <span className="badge-dot-indicator"></span>}
            {children}
        </span>
    );
};

export default Badge;