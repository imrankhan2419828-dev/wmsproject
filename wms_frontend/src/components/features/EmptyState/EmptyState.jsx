import React from 'react';
import { FaInbox, FaSearch, FaFileAlt, FaBoxOpen } from 'react-icons/fa';
import { Button } from '../../common';
import './EmptyState.css';

const EmptyState = ({
    type = 'default',
    title = 'No data found',
    description = 'There are no items to display at this time.',
    action,
    actionText,
    onAction,
    icon,
    className = ''
}) => {
    const getIcon = () => {
        if (icon) return icon;

        switch (type) {
            case 'search':
                return <FaSearch />;
            case 'document':
                return <FaFileAlt />;
            case 'empty':
                return <FaBoxOpen />;
            default:
                return <FaInbox />;
        }
    };

    return (
        <div className={`empty-state ${className}`}>
            <div className="empty-state-icon">
                {getIcon()}
            </div>

            <h3 className="empty-state-title">{title}</h3>

            {description && (
                <p className="empty-state-description">{description}</p>
            )}

            {(action || actionText) && (
                <div className="empty-state-action">
                    {action || (
                        <Button
                            variant="primary"
                            onClick={onAction}
                        >
                            {actionText}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmptyState;