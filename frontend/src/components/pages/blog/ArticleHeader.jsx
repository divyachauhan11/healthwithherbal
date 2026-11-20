import { ArticleAuthor } from "./ArticleAuthor";
import { ArticleShareButton } from "./ArticleShareButton";

/**
 * Article title with the author row and share button.
 * @param {object} props
 * @param {{title: string, author: string, date: string, readTime: string}} props.article
 * @param {boolean} props.shareCopied
 * @param {() => void} props.onShare
 */
export function ArticleHeader({ article, shareCopied, onShare }) {
  return (
    <header className="article-page-header">
      <h1>{article.title}</h1>
      <div className="article-author-row">
        <ArticleAuthor article={article} />
        <ArticleShareButton copied={shareCopied} onShare={onShare} />
      </div>
    </header>
  );
}
