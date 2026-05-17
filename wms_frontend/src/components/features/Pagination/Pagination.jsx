import React from 'react';
import { FaChevronLeft, FaChevronRight, FaEllipsisH } from 'react-icons/fa';
import { Select } from '../../common';
import './Pagination.css';

export const Pagination = ({
    currentPage = 1,
    totalPages = 1,
    pageSize = 10,
    pageSizeOptions = [10, 25, 50, 100],
    totalItems = 0,
    onPageChange,
    onPageSizeChange,
    showPageSize = true,
    showTotal = true,
    className = ''
}) => {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const handlePageChange = (page) => {
        if (page === '...') return;
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange?.(page);
        }
    };

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className={`pagination-wrapper ${className}`}>
            <div className="pagination-left">
                {showTotal && totalItems > 0 && (
                    <span className="pagination-info">
                        Showing {startItem} - {endItem} of {totalItems} items
                    </span>
                )}
            </div>

            <div className="pagination-right">
                {showPageSize && onPageSizeChange && (
                    <div className="page-size-selector">
                        <Select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            options={pageSizeOptions.map(size => ({
                                value: size,
                                label: `${size} / page`
                            }))}
                            className="page-size-select"
                        />
                    </div>
                )}

                <nav className="pagination-nav">
                    <button
                        className="pagination-btn nav-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                    >
                        <FaChevronLeft />
                    </button>

                    <div className="pagination-pages">
                        {getPageNumbers().map((page, index) => (
                            <button
                                key={index}
                                className={`
                                    pagination-btn
                                    ${page === currentPage ? 'active' : ''}
                                    ${page === '...' ? 'ellipsis' : ''}
                                `}
                                onClick={() => handlePageChange(page)}
                                disabled={page === '...'}
                            >
                                {page === '...' ? <FaEllipsisH /> : page}
                            </button>
                        ))}
                    </div>

                    <button
                        className="pagination-btn nav-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                    >
                        <FaChevronRight />
                    </button>
                </nav>
            </div>
        </div>
    );
};

export default Pagination;