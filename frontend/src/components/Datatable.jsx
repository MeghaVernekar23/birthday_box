import React, { useState } from "react";
import "../css/Datatable.css";

const DataTable = ({
  title,
  columns = [],
  data,
  actions = [],
  searchableFields = [],
  rowClassName,
  actionButton,
  viewMode = "table",
  cardTemplate,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const entriesPerPage = 15;
  const maxVisiblePages = 5;

  const filteredData =
    searchableFields.length === 0
      ? data
      : data.filter((row) => {
          const query = searchQuery.toLowerCase();
          return searchableFields.some((field) =>
            row[field]?.toString().toLowerCase().includes(query)
          );
        });

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const currentGroup = Math.floor((currentPage - 1) / maxVisiblePages);
  const startPage = currentGroup * maxVisiblePages + 1;
  const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const paginatedData = filteredData.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const isCard = viewMode === "card";

  return (
    <div className="dt-root">
      {(title || searchableFields.length > 0 || actionButton) && (
        <div className="dt-header">
          {title && <h5 className="dt-title">{title}</h5>}
          <div className="dt-toolbar">
            {searchableFields.length > 0 && (
              <input
                type="text"
                className="dt-search"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            )}
            {actionButton && <div>{actionButton}</div>}
          </div>
        </div>
      )}

      <div className={isCard ? "dt-card-wrapper" : "dt-table-wrapper"}>
        {isCard ? (
          <div className="dt-card-grid">
            {paginatedData.length === 0 ? (
              <p className="dt-empty">No results found</p>
            ) : (
              paginatedData.map((row, index) => (
                <div key={row.booking_id || row.id || index}>
                  {typeof cardTemplate === "function" ? cardTemplate(row) : null}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="dt-scroll">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-light">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="text-center">
                      {col.label}
                    </th>
                  ))}
                  {actions.length > 0 && <th className="text-center">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                      className="text-center"
                    >
                      No results found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className={
                        typeof rowClassName === "function"
                          ? rowClassName(row)
                          : ""
                      }
                    >
                      {columns.map((col) => (
                        <td key={col.key}>
                          {col.render ? col.render(row) : row[col.key] ?? "--"}
                        </td>
                      ))}
                      {actions.length > 0 && (
                        <td>
                          {actions.map((ActionBtn, i) => (
                            <ActionBtn key={i} row={row} />
                          ))}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className={isCard ? "dt-pagination dt-pagination--card" : "dt-pagination dt-pagination--table"}>
            <span
              className={`dt-page-btn ${currentPage === 1 ? "dt-page-btn--disabled" : ""}`}
              onClick={() => currentPage > 1 && setCurrentPage(1)}
            >{"<<"}</span>
            <span
              className={`dt-page-btn ${startPage === 1 ? "dt-page-btn--disabled" : ""}`}
              onClick={() => startPage > 1 && setCurrentPage(startPage - 1)}
            >{"<"}</span>
            {pageNumbers.map((page) => (
              <span
                key={page}
                className={`dt-page-btn ${page === currentPage ? "dt-page-btn--active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >{page}</span>
            ))}
            <span
              className={`dt-page-btn ${endPage >= totalPages ? "dt-page-btn--disabled" : ""}`}
              onClick={() => endPage < totalPages && setCurrentPage(endPage + 1)}
            >{">"}</span>
            <span
              className={`dt-page-btn ${currentPage === totalPages ? "dt-page-btn--disabled" : ""}`}
              onClick={() => currentPage < totalPages && setCurrentPage(totalPages)}
            >{">>"}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
