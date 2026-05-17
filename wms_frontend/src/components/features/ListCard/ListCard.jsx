import React from 'react';
import { FaEdit, FaTrash, FaEye, FaChevronRight } from 'react-icons/fa';
import { Button, Badge } from '../../common';
import './ListCard.css';

export const ListCard = ({
    item,
    fields = [],
    actions = true,
    onView,
    onEdit,
    onDelete,
    onClick,
    className = ''
}) => {
    const renderField = (field) => {
        const value = item[field.key];

        if (field.render) {
            return field.render(value, item);
        }

        if (field.type === 'badge') {
            const variant = field.badgeVariant?.(value, item) || 'default';
            return <Badge variant={variant}>{value}</Badge>;
        }

        if (field.type === 'date' && value) {
            return new Date(value).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).replace(/ /g, '-');
        }

        return value || '-';
    };

    return (
        <div
            className={`list-card ${onClick ? 'clickable' : ''} ${className}`}
            onClick={onClick}
        >
            {/* Card Header */}
            {fields.some(f => f.isHeader) && (
                <div className="card-header">
                    {fields.filter(f => f.isHeader).map((field, index) => (
                        <div key={field.key || index} className="header-content">
                            {renderField(field)}
                        </div>
                    ))}
                </div>
            )}

            {/* Card Body */}
            <div className="card-body">
                {fields.filter(f => !f.isHeader && !f.isFooter).map((field) => (
                    <div key={field.key} className="card-row">
                        <span className="row-label">{field.label}:</span>
                        <span className="row-value">{renderField(field)}</span>
                    </div>
                ))}
            </div>

            {/* Card Footer */}
            {(actions || fields.some(f => f.isFooter)) && (
                <div className="card-footer">
                    {fields.filter(f => f.isFooter).map((field) => (
                        <div key={field.key} className="footer-content">
                            {renderField(field)}
                        </div>
                    ))}

                    {actions && (onView || onEdit || onDelete) && (
                        <div className="card-actions">
                            {onView && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onView(item);
                                    }}
                                    icon={<FaEye />}
                                >
                                    View
                                </Button>
                            )}
                            {onEdit && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(item);
                                    }}
                                    icon={<FaEdit />}
                                >
                                    Edit
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(item);
                                    }}
                                    className="delete-btn"
                                    icon={<FaTrash />}
                                >
                                    Delete
                                </Button>
                            )}
                        </div>
                    )}

                    {onClick && (
                        <div className="card-indicator">
                            <FaChevronRight />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ListCard Container for multiple cards
export const ListCardContainer = ({
    children,
    loading = false,
    emptyMessage = 'No items found',
    className = ''
}) => {
    if (loading) {
        return (
            <div className={`list-card-container ${className}`}>
                <div className="card-loader">
                    <div className="spinner"></div>
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    if (!children || (Array.isArray(children) && children.length === 0)) {
        return (
            <div className={`list-card-container ${className}`}>
                <div className="card-empty">
                    <span>{emptyMessage}</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`list-card-container ${className}`}>
            {children}
        </div>
    );
};

export default ListCard;