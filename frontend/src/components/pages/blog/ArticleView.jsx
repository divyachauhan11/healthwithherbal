import { ArticleBreadcrumb } from "./ArticleBreadcrumb";
import { ArticleComments } from "./ArticleComments";
import { ArticleCommunityBar } from "./ArticleCommunityBar";
import { ArticleCoverImage } from "./ArticleCoverImage";
import { ArticleHeader } from "./ArticleHeader";
import { ArticleMarkdown } from "./ArticleMarkdown";
import { RelatedArticles } from "./RelatedArticles";

/**
 * Single article view: breadcrumb, header, activity bar, cover, markdown
 * body, comments and related articles.
 * @param {object} props
 * @param {object} props.article Open article (see `toBlogPost`).
 * @param {Array<object>} props.relatedPosts Posts suggested below the article.
 * @param {ReturnType<typeof import("./useBlogCommunity").useBlogCommunity>} props.activity Community state and actions.
 * @param {{shareCopied: boolean, shareArticle: () => void}} props.share Share state and action.
 * @param {() => void} props.onBack Returns to the blog list.
 * @param {(post: object) => void} props.onOpenArticle Opens another article.
 */
export function ArticleView({ article, relatedPosts, activity, share, onBack, onOpenArticle }) {
  return (
    <div className="article-page-shell">
      <ArticleBreadcrumb title={article.title} onBack={onBack} />

      <article>
        <ArticleHeader
          article={article}
          shareCopied={share.shareCopied}
          onShare={share.shareArticle}
        />

        <ArticleCommunityBar
          community={activity.community}
          busy={activity.communityBusy}
          onToggleLike={activity.toggleLike}
        />

        {article.image && (
          <ArticleCoverImage src={article.image} alt={article.title} />
        )}

        <div className="article-page-body">
          <ArticleMarkdown content={article.content} />
        </div>

        <ArticleComments
          community={activity.community}
          form={activity.commentForm}
          onFieldChange={activity.updateCommentField}
          onSubmit={activity.sendComment}
          notice={activity.commentNotice}
          noticeIsError={activity.commentNoticeIsError}
          busy={activity.communityBusy}
        />
      </article>

      {relatedPosts.length > 0 && (
        <RelatedArticles posts={relatedPosts} onOpenArticle={onOpenArticle} />
      )}
    </div>
  );
}
