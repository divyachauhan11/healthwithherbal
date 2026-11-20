"use client";

import { FormModal } from "@/components/admin/global";
import { BlogTable } from "@/components/admin/tables";
import { BlogCommentsModal, BlogManagerToolbar, useBlogCommentsDialog } from "@/components/admin/blogs";
import BlogCommentsPanel from "./BlogCommentsPanel";

/**
 * Blogs page: article toolbar and table, the article form and the comment manager dialog.
 */
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
  const { commentsBlog, setCommentsBlog } = useBlogCommentsDialog();

  return (
    <section className="panel page-panel">
      <BlogManagerToolbar
        query={query}
        setQuery={setQuery}
        totalPosts={rows.length}
        onRefresh={onRefresh}
        onCreate={() => setForm({ kind: "blogs", item: null })}
      />

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
        <BlogCommentsModal blog={commentsBlog} onClose={() => setCommentsBlog(null)}>
          <BlogCommentsPanel
            blog={commentsBlog}
            token={token}
            onBack={() => setCommentsBlog(null)}
            onChanged={onRefresh}
          />
        </BlogCommentsModal>
      )}
    </section>
  );
}
