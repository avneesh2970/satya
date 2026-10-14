import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage = 1, totalPages, onPageChange, totalItems = 0, itemsPerPage = 10 }) => {
  if (!totalItems || totalItems <= 0) return null;

  const safeItemsPerPage = itemsPerPage > 0 ? itemsPerPage : 10;
  const computedTotalPages = Math.ceil(totalItems / safeItemsPerPage);
  const safeTotalPages = Math.max(1, totalPages || computedTotalPages);

  // Keep currentPage strictly within valid bounds [1, safeTotalPages]
  const safeCurrentPage = Math.min(Math.max(1, Number(currentPage) || 1), safeTotalPages);

  const startItem = (safeCurrentPage - 1) * safeItemsPerPage + 1;
  const endItem = Math.min(safeCurrentPage * safeItemsPerPage, totalItems);

  // Generate page numbers range
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, safeCurrentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(safeTotalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePrev = (e) => {
    e.preventDefault();
    if (safeCurrentPage > 1 && typeof onPageChange === 'function') {
      onPageChange(safeCurrentPage - 1);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (safeCurrentPage < safeTotalPages && typeof onPageChange === 'function') {
      onPageChange(safeCurrentPage + 1);
    }
  };

  const handlePageClick = (e, page) => {
    e.preventDefault();
    if (page !== safeCurrentPage && typeof onPageChange === 'function') {
      onPageChange(page);
    }
  };

  return (
    <div className="pagination-wrapper">
      <div className="pagination-info">
        Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> entries
      </div>
      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-btn pagination-nav-btn"
          onClick={handlePrev}
          disabled={safeCurrentPage <= 1}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            type="button"
            className={`pagination-btn pagination-num-btn ${page === safeCurrentPage ? 'active' : ''}`}
            onClick={(e) => handlePageClick(e, page)}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          className="pagination-btn pagination-nav-btn"
          onClick={handleNext}
          disabled={safeCurrentPage >= safeTotalPages}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
