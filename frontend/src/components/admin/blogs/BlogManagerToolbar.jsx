import { Plus, RefreshCw } from "lucide-react";
import { SearchField } from "@/components/admin/global";

/**
 * Blog manager toolbar: article search, post count, refresh and "Create New Article".
 * @param {{query: string, setQuery: Function, totalPosts: number, onRefresh?: () => void, onCreate: () => void}} props
 */
export function BlogManagerToolbar({ query, setQuery, totalPosts, onRefresh, onCreate }) {
  return (
    <div className="blog-manager-toolbar">
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Search articles by title, category, author, or tag"
      />
      <div className="blog-manager-toolbar-actions">
        <span className="blog-manager-total">Total posts: <strong>{totalPosts}</strong></span>
        <button type="button" className="blog-manager-refresh" onClick={() => onRefresh?.()}><RefreshCw size={15} /> Refresh</button>
        <button
          type="button"
          className="primary"
          onClick={onCreate}
        >
          <Plus size={16} /> Create New Article
        </button>
      </div>
    </div>
  );
}
