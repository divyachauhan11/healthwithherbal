import { SearchField } from "@/components/admin/global";
import { ReviewTable } from "@/components/admin/tables";

/**
 * Reviews page: searchable product review table with moderation actions.
 */
export default function ReviewsPage({
  rows,
  query,
  setQuery,
  token,
  onRefresh,
  notify,
  remove,
}) {
  return (
    <section className="panel page-panel">
      <div className="page-tools">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search reviews"
        />
      </div>
      <ReviewTable
        rows={rows}
        token={token}
        onChange={onRefresh}
        notify={notify}
        onDelete={remove ? (item) => remove("reviews", item) : undefined}
      />
    </section>
  );
}
