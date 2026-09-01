import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, total } = pagination;
  const start = (page - 1) * 10 + 1;
  const end = Math.min(page * 10, total);

  return (
    <div className="pagination">
      <span className="pagination-info">Showing {start}–{end} of {total} results</span>
      <div className="pagination-controls">
        <button className="page-btn" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
          let p = i + 1;
          if (pages > 5 && page > 3) p = page - 2 + i;
          if (p > pages) return null;
          return (
            <button key={p} className={`page-btn ${p === page ? "active" : ""}`} onClick={() => onPageChange(p)}>
              {p}
            </button>
          );
        })}
        <button className="page-btn" onClick={() => onPageChange(page + 1)} disabled={page === pages}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
