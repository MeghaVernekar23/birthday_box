import { useState } from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";

const DataTable = ({ title, columns, data, actions = [] }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;
  const totalPages = Math.ceil(data.length / entriesPerPage);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div
      className="table-container"
      style={{ maxWidth: "2000px", margin: "0 auto" }}
    >
      <div
        className="table-header d-flex justify-content-between align-items-center"
        style={{ cursor: "pointer" }}
      >
        <div
          className="d-flex align-items-center gap-2"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          <h5 className="mb-0">{title}</h5>
        </div>
      </div>
      {!isCollapsed && (
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
                    No bookings found.
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

          <div className="pagination d-flex align-items-center gap-2 ">
            <span
              className="page-link"
              style={{
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            >
              {"<"}
            </span>

            {pages.map((page) => (
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
              onClick={() =>
                currentPage < totalPages && setCurrentPage(currentPage + 1)
              }
            >
              {">"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
