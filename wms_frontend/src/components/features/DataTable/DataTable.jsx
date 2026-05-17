import React, { useState } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Button, Badge } from '../../common';
import './DataTable.css';

export const DataTable = ({
    columns = [],
    data = [],
    loading = false,
    selectable = false,
    selectedRows = [],
    onSelectionChange,
    onRowClick,
    onEdit,
    onDelete,
    onView,
    actions = true,
    emptyMessage = 'No data found',
    className = ''
}) => {
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');

    const handleSort = (column) => {
        if (!column.sortable) return;

        if (sortColumn === column.key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column.key);
            setSortDirection('asc');
        }
    };

    const handleSelectAll = (e) => {
        if (onSelectionChange) {
            if (e.target.checked) {
                onSelectionChange(data.map(row => row.id));
            } else {
                onSelectionChange([]);
            }
        }
    };

    const handleSelectRow = (id) => {
        if (onSelectionChange) {
            if (selectedRows.includes(id)) {
                onSelectionChange(selectedRows.filter(rowId => rowId !== id));
            } else {
                onSelectionChange([...selectedRows, id]);
            }
        }
    };

    const getSortedData = () => {
        if (!sortColumn) return data;

        return [...data].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const renderCell = (row, column) => {
        const value = row[column.key];

        if (column.render) {
            return column.render(value, row);
        }

        if (column.type === 'badge') {
            const variant = column.variant?.(value, row) || 'default';
            return <Badge variant={variant}>{value}</Badge>;
        }

        if (column.type === 'date') {
            return value ? new Date(value).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).replace(/ /g, '-') : '-';
        }

        if (column.type === 'number') {
            return typeof value === 'number' ? value.toLocaleString('en-US', {
                minimumFractionDigits: column.decimals || 2,
                maximumFractionDigits: column.decimals || 2
            }) : value;
        }

        return value || '-';
    };

    const getSortIcon = (column) => {
        if (!column.sortable) return null;

        if (sortColumn === column.key) {
            return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
        }
        return <FaSort />;
    };

    const sortedData = getSortedData();

    return (
        <div className={`data-table-wrapper ${className}`}>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            {selectable && (
                                <th className="checkbox-cell" style={{ width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.length === data.length && data.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                            )}

                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`
                                        ${column.sortable ? 'sortable' : ''}
                                        ${column.align ? `text-${column.align}` : ''}
                                    `}
                                    style={{ width: column.width }}
                                    onClick={() => handleSort(column)}
                                >
                                    <div className="th-content">
                                        {column.title}
                                        {column.sortable && (
                                            <span className="sort-icon">
                                                {getSortIcon(column)}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}

                            {actions && (onEdit || onDelete || onView) && (
                                <th className="actions-cell" style={{ width: '100px' }}>
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                                    className="loading-cell"
                                >
                                    <div className="table-loader">
                                        <div className="spinner"></div>
                                        <span>Loading...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : sortedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                                    className="empty-cell"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((row, index) => (
                                <tr
                                    key={row.id || index}
                                    className={`
                                        ${selectedRows.includes(row.id) ? 'selected' : ''}
                                        ${onRowClick ? 'clickable' : ''}
                                    `}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {selectable && (
                                        <td className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(row.id)}
                                                onChange={() => handleSelectRow(row.id)}
                                            />
                                        </td>
                                    )}

                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className={column.align ? `text-${column.align}` : ''}
                                        >
                                            {renderCell(row, column)}
                                        </td>
                                    ))}

                                    {actions && (onEdit || onDelete || onView) && (
                                        <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                                            <div className="row-actions">
                                                {onView && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onView(row)}
                                                        title="View"
                                                        icon={<FaEye />}
                                                    />
                                                )}
                                                {onEdit && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onEdit(row)}
                                                        title="Edit"
                                                        icon={<FaEdit />}
                                                    />
                                                )}
                                                {onDelete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onDelete(row)}
                                                        title="Delete"
                                                        className="delete-btn"
                                                        icon={<FaTrash />}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;