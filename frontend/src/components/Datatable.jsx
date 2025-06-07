import React, { useState } from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";

const DataTable = ({ title, columns, data, actions = [] }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 20;
  const totalPages = Math.ceil(data.length / entriesPerPage);

  const maxVisiblePages = 5;
  const currentGroup = Math.floor((currentPage - 1) / maxVisiblePages);
  const startPage = currentGroup * maxVisiblePages + 1;
  const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div
      className="table-container"
      style={{ height: "70vh", overflowY: "auto" }}
    >
      <h5 className="mb-0">{title}</h5>

      <div>
        <table className="table custom-table mt-3">
          <thead>
            <tr>
              <th></th>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              {actions.length > 0 && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 2 : 1)}
                  className="text-center"
                >
                  No details found
                </td>
              </tr>
            ) : (
              data
                .slice(
                  (currentPage - 1) * entriesPerPage,
                  currentPage * entriesPerPage
                )
                .map((row, index) => (
                  <tr key={row.id || index}>
                    <td>{(currentPage - 1) * entriesPerPage + index + 1}</td>
                    {columns.map((col) => (
                      <td key={col.key}>{row[col.key]}</td>
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

        {/* Pagination Controls */}
        <div className="pagination d-flex align-items-center gap-2 ">
          {/* First */}
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

          {/* Previous Group */}
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

          {/* Page Numbers */}
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

          {/* Next Group */}
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

          {/* Last */}
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
