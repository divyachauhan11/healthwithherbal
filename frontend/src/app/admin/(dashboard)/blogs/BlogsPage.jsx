"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { SearchField, FormModal } from "@/components/admin/global";
import { BlogTable } from "@/components/admin/tables";
import BlogCommentsPanel from "./BlogCommentsPanel";

export default function BlogsPage({
  rows = [],
  query,
  setQuery,
  form,
  setForm,
  save,
  busy,
  remove,
  token,
  onRefresh,
}) {
  const [commentsBlog, setCommentsBlog] = useState(null);

  useEffect(() => {
    if (!commentsBlog) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setCommentsBlog(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [commentsBlog]);

  return (
    <section className="panel page-panel">
      <div className="blog-manager-toolbar">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search articles by title, category, author, or tag"
        />
        <div className="blog-manager-toolbar-actions">
          <span className="blog-manager-total">Total posts: <strong>{rows.length}</strong></span>
          <button type="button" className="blog-manager-refresh" onClick={() => onRefresh?.()}><RefreshCw size={15} /> Refresh</button>
          <button
            type="button"
            className="primary"
            onClick={() => setForm({ kind: "blogs", item: null })}
          >
            <Plus size={16} /> Create New Article
          </button>
        </div>
      </div>

      <BlogTable
        rows={rows}
        onEdit={(item) => setForm({ kind: "blogs", item })}
        onDelete={remove ? (item) => remove("blogs", item) : undefined}
        onManageComments={setCommentsBlog}
      />

      <FormModal
        entity="blog"
        isOpen={Boolean(form?.kind === "blogs")}
        initial={form?.item}
        onSave={save}
        onClose={() => setForm(null)}
        busy={busy}
      />

      {commentsBlog && (
        <div
          className="blog-comments-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCommentsBlog(null);
          }}
        >
          <section
            className="blog-comments-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Comments for ${commentsBlog.title}`}
          >
            <BlogCommentsPanel
              blog={commentsBlog}
              token={token}
              onBack={() => setCommentsBlog(null)}
              onChanged={onRefresh}
            />
          </section>
        </div>
      )}
    </section>
  );
}

