export default function CatalogPagination({ pagination, page, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const pages = [];
  const totalPages = pagination.totalPages;
  const current = page;

  for (let i = 1; i <= totalPages; i += 1) {
    if (i === 1 || i === totalPages || (i >= current - 1 && i <= current + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <nav className="catalog-pagination" aria-label="Product pages">
      <button
        type="button"
        className="catalog-page-btn catalog-page-btn-prev"
        disabled={!pagination.hasPrevPage}
        onClick={() => onPageChange(current - 1)}
        aria-label="Previous page"
      >
        Previous
      </button>
      <div className="catalog-page-numbers">
        {pages.map((num, index) =>
          num === '…' ? (
            <span key={`ellipsis-${index}`} className="catalog-page-num catalog-page-ellipsis" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={num}
              type="button"
              className={`catalog-page-num ${num === current ? 'catalog-page-num-active' : ''}`}
              onClick={() => onPageChange(num)}
              aria-label={`Page ${num}`}
              aria-current={num === current ? 'page' : undefined}
            >
              {num}
            </button>
          )
        )}
      </div>
      <button
        type="button"
        className="catalog-page-btn catalog-page-btn-next"
        disabled={!pagination.hasNextPage}
        onClick={() => onPageChange(current + 1)}
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
}
