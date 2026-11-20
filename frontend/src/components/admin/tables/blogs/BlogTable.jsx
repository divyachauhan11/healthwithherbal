import { TablePagination, useTablePagination } from "../TablePagination";
import { BlogAdminCardGrid } from "./BlogAdminCardGrid";
import { BlogAdminEmpty } from "./BlogAdminEmpty";

/**
 * Paginated blog post cards with edit, delete and comment moderation entry points.
 * @param {Object} props
 * @param {Array<Object>} [props.rows=[]] Blog posts.
 * @param {(blog: Object) => void} [props.onEdit]
 * @param {(blog: Object) => void} [props.onDelete]
 * @param {(blog: Object) => void} [props.onManageComments]
 * @param {number} [props.pageSize=10] Initial cards per page.
 */
export function BlogTable({
  rows = [],
  onEdit,
  onDelete,
  onManageComments,
  pageSize: initialPageSize = 10,
}) {
  const { page, setPage, pageSize, setPageSize, displayedRows, totalItems } =
    useTablePagination(rows, initialPageSize);

  return (
    <div className="blog-card-manager">
      {displayedRows.length ? (
        <BlogAdminCardGrid
          blogs={displayedRows}
          onEdit={onEdit}
          onDelete={onDelete}
          onManageComments={onManageComments}
        />
      ) : (
        <BlogAdminEmpty />
      )}
      <TablePagination
        totalItems={totalItems}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
