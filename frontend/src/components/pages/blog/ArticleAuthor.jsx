import { Calendar, Clock3 } from "lucide-react";
import { LOGO_URL } from "@/lib/store-data";

/**
 * Author block of the article header: store logo, author, date and read time.
 * @param {object} props
 * @param {{author: string, date: string, readTime: string}} props.article
 */
export function ArticleAuthor({ article }) {
  return (
    <div className="article-author">
      <span className="article-author-mark">
        <img
          src={LOGO_URL}
          alt="Health With Herbal"
          className="article-author-logo"
        />
      </span>
      <span>
        <strong>{article.author}</strong>
        <small>
          <Calendar size={13} /> {article.date}
          <i>·</i>
          <Clock3 size={13} /> {article.readTime}
        </small>
      </span>
    </div>
  );
}
