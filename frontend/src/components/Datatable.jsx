import React, { useState } from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
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
  const totalPages = Math.ceil(data.length / entriesPerPage);
  const currentGroup = Math.floor((currentPage - 1) / maxVisiblePages);
  const startPage = currentGroup * maxVisiblePages + 1;
  const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  const filteredData =
    searchableFields.length === 0
      ? data
      : data.filter((row) => {
          const query = searchQuery.toLowerCase();
          return searchableFields.some((field) =>
            row[field]?.toString().toLowerCase().includes(query)
          );
        });

  const paginatedData = filteredData.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  return (
    <div>
      <h5 className="mb-3">{title}</h5>
      {(searchableFields.length > 0 || actionButton) && (
        <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
          {searchableFields.length > 0 && (
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{ maxWidth: "300px" }}
            />
          )}
          {actionButton && <div>{actionButton}</div>}
        </div>
      )}

      <div className="table-wrapper">
        {viewMode === "card" ? (
          <div className="table-body-scroll">
            <div className="datatable-card-grid">
              {paginatedData.length === 0 ? (
                <p className="text-center text-muted py-4">No results found</p>
              ) : (
                paginatedData.map((row, index) => (
                  <div key={row.booking_id || row.id || index}>
                    {typeof cardTemplate === "function" ? cardTemplate(row) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="table-body-scroll">
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
        <div className="pagination-bar">
          <span
            className="page-link"
            style={{
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
            onClick={() => currentPage > 1 && setCurrentPage(1)}
          >
            {"<<"}
          </span>
          <span
            className="page-link"
            style={{
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
            onClick={() => {
              if (startPage > 1) setCurrentPage(startPage - 1);
            }}
          >
            {"<"}
          </span>
          {pageNumbers.map((page) => (
            <span
              key={page}
              className={`page-link ${
                page === currentPage ? "custom-active" : ""
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </span>
          ))}
          <span
            className="page-link"
            style={{
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
            onClick={() => {
              if (endPage < totalPages) setCurrentPage(endPage + 1);
            }}
          >
            {">"}
          </span>
          <span
            className="page-link"
            style={{
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
            onClick={() =>
              currentPage < totalPages && setCurrentPage(totalPages)
            }
          >
            {">>"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
