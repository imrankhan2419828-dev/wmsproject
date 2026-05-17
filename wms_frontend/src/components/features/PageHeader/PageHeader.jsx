import React from 'react';
import { Button } from '../../common';
import { FaPlus } from 'react-icons/fa';
import './PageHeader.css';

/**
 * Global Page Header Component
 * @param {string} title - Page title
 * @param {string} subtitle - Page subtitle (optional)
 * @param {ReactNode} icon - Title icon
 * @param {string} addButtonText - Text for add button (optional)
 * @param {function} onAdd - Add button click handler (optional)
 * @param {ReactNode} actions - Additional actions (optional)
 */
const PageHeader = ({
    title,
    subtitle,
    icon,
    addButtonText = "Add New",
    onAdd,
    actions,
    className = ''
}) => {
    return (
        <div className={`page-header-premium ${className}`}>
            <div className="header-left">
                <h1 className="page-title">
                    {icon && <span className="title-icon">{icon}</span>}
                    {title}
                </h1>
                {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
            <div className="header-right">
                {actions}
                {onAdd && (
                    <Button variant="primary" onClick={onAdd} icon={<FaPlus />}>
                        {addButtonText}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default PageHeader;