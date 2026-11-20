import { ArticleCommentForm } from "./ArticleCommentForm";
import { ArticleCommentList } from "./ArticleCommentList";
import { ArticleCommentsHeading } from "./ArticleCommentsHeading";

/**
 * Comments section of an article: heading, the comment form (or a closed
 * notice) and the approved comments.
 * @param {object} props
 * @param {{comments: number, allowComments: boolean, items: Array<object>}} props.community
 * @param {object} props.form Comment form values (see `ArticleCommentForm`).
 * @param {(field: string, value: string) => void} props.onFieldChange
 * @param {(event: import("react").FormEvent<HTMLFormElement>) => void} props.onSubmit
 * @param {string} props.notice
 * @param {boolean} props.noticeIsError
 * @param {boolean} props.busy
 */
export function ArticleComments({ community, form, onFieldChange, onSubmit, notice, noticeIsError, busy }) {
  return (
    <section className="article-comments" id="article-comments" aria-labelledby="article-comments-title">
      <ArticleCommentsHeading count={community.comments} />
      {community.allowComments ? (
        <ArticleCommentForm
          form={form}
          onFieldChange={onFieldChange}
          onSubmit={onSubmit}
          notice={notice}
          noticeIsError={noticeIsError}
          busy={busy}
        />
      ) : <p className="article-no-comments">Comments are closed for this article.</p>}
      <ArticleCommentList comments={community.items} />
    </section>
  );
}
