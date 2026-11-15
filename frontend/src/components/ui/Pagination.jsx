import React from "react";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}) {
  if (totalCount === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "14px",
        marginTop: "16px",
        padding: "12px 16px",
        background: "var(--apl-card-bg, #ffffff)",
        borderRadius: "12px",
        border: "1px solid var(--apl-border, #ECEEDF)",
      }}
    >
      {/* Left: Summary and Page Size Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "13px", color: "var(--apl-neutral-600, #8A8F76)" }}>
          Showing <strong style={{ color: "var(--apl-neutral-900, #22241B)" }}>{startItem}</strong> to{" "}
          <strong style={{ color: "var(--apl-neutral-900, #22241B)" }}>{endItem}</strong> of{" "}
          <strong style={{ color: "var(--apl-neutral-900, #22241B)" }}>{totalCount}</strong> results
        </span>

        {onPageSizeChange && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label
              htmlFor="pagination-page-size"
              style={{ fontSize: "12px", color: "var(--apl-neutral-500, #8A8F76)" }}
            >
              Per page:
            </label>
            <select
              id="pagination-page-size"
              className="apl-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                fontSize: "12px",
                padding: "3px 8px",
                borderRadius: "6px",
                minHeight: "28px",
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Navigation Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {/* Previous Button */}
        <button
          type="button"
          className="apl-btn apl-btn-secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{
            fontSize: "12px",
            padding: "5px 12px",
            opacity: currentPage <= 1 ? 0.45 : 1,
            cursor: currentPage <= 1 ? "not-allowed" : "pointer",
          }}
        >
          &larr; Prev
        </button>

        {/* Page Number Buttons */}
        {pageNumbers.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  fontSize: "13px",
                  color: "var(--apl-neutral-400, #9CA485)",
                  padding: "0 4px",
                }}
              >
                …
              </span>
            );
          }

          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              style={{
                minWidth: "32px",
                height: "32px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: isActive ? 700 : 500,
                border: "none",
                cursor: "pointer",
                background: isActive
                  ? "var(--apl-accent, #3D4127)"
                  : "var(--apl-neutral-100, #ECEEDF)",
                color: isActive ? "#ffffff" : "var(--apl-neutral-800, #22241B)",
                transition: "all 0.15s ease",
              }}
            >
              {p}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          className="apl-btn apl-btn-secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={{
            fontSize: "12px",
            padding: "5px 12px",
            opacity: currentPage >= totalPages ? 0.45 : 1,
            cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
          }}
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}

