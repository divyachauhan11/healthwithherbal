"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Check,
  Clock3,
  Share2,
  Sparkles,
} from "lucide-react";
import { AppButton } from "../../../components/global/primitives";
import { LOGO_URL } from "../../../lib/store-data";

function ArticleMarkdown({ content = "" }) {
  const inline = (text) => text.split(/(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]*\)|\[[^\]]+\]\{(?:size|color)=[^}]+\}|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`)/g).map((part, index) => {
    const image = part.match(/^!\[([^\]]*)\]\((https?:\/\/[^)]+)\)$/);
    if (image) return <img key={index} src={image[2]} alt={image[1]} className="blog-content-inline-image" />;
    const styled = part.match(/^\[([^\]]+)\]\{(size|color)=([^}]+)\}$/);
    if (styled?.[2] === "size" && /^(\d{1,2}(?:\.\d+)?)(px|rem|em|%)$/.test(styled[3])) return <span key={index} style={{ fontSize: styled[3] }}>{styled[1]}</span>;
    if (styled?.[2] === "color" && /^#[0-9a-f]{6}$/i.test(styled[3])) return <span key={index} style={{ color: styled[3] }}>{styled[1]}</span>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>;
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    return part;
  });

  const source = Array.isArray(content) ? content.join("\n\n") : String(content);
  const lines = source.replace(/\r/g, "").split("\n");
  const blocks = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }
    if (line.startsWith("```")) {
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) code.push(lines[index++]);
      if (index < lines.length) index += 1;
      blocks.push(<pre key={`code-${index}`}><code>{code.join("\n")}</code></pre>);
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const Tag = `h${heading[1].length}`;
      blocks.push(<Tag key={index}>{inline(heading[2])}</Tag>);
      index += 1;
    } else if (/^>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) quote.push(lines[index++].replace(/^>\s?/, ""));
      blocks.push(<blockquote key={`quote-${index}`}>{inline(quote.join("\n"))}</blockquote>);
    } else if (/^[-*+]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line);
      const items = [];
      const pattern = ordered ? /^\d+\.\s+(.*)$/ : /^[-*+]\s+(.*)$/;
      while (index < lines.length && pattern.test(lines[index])) items.push(<li key={index}>{inline(lines[index++].replace(pattern, "$1"))}</li>);
      const Tag = ordered ? "ol" : "ul";
      blocks.push(<Tag key={`list-${index}`}>{items}</Tag>);
    } else {
      blocks.push(<p key={index}>{inline(line)}</p>);
      index += 1;
    }
  }
  return <div className="markdown-content">{blocks}</div>;
}

export function BlogPage({ openCatalog, blogs: blogsProp = [] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeArticle, setActiveArticle] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);

  const allPosts = useMemo(() => {
    if (!Array.isArray(blogsProp) || blogsProp.length === 0) {
      return [];
    }
    return blogsProp.map((b) => ({
      id: b._id || b.id || b.slug,
      slug: b.slug,
      title: b.title,
      excerpt: b.excerpt,
      content: b.content,
      category: b.category || (b.tags && b.tags[0]) || "Wellness",
      tags: b.tags || [],
      readTime: b.readTime || "5 min read",
      date:
        b.date ||
        (b.publishedAt
          ? new Date(b.publishedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "Recent"),
      author: b.author || "Health With Herbal",
      image: b.coverImage || b.image || "",
    }));
  }, [blogsProp]);

  const categories = useMemo(() => {
    const set = new Set(["All"]);
    allPosts.forEach((post) => {
      if (post.category) set.add(post.category);
    });
    return Array.from(set);
  }, [allPosts]);

  const filteredPosts =
    selectedCategory === "All"
      ? allPosts
      : allPosts.filter(
          (post) =>
            post.category === selectedCategory ||
            (post.tags && post.tags.includes(selectedCategory)),
        );

  useEffect(() => {
    const syncArticleFromUrl = () => {
      const pathMatch = window.location.pathname.match(/^\/blog\/([^/]+)\/?$/);
      const slug = pathMatch
        ? decodeURIComponent(pathMatch[1])
        : new URLSearchParams(window.location.search).get("blog");
      setActiveArticle(slug ? allPosts.find((post) => post.slug === slug) || null : null);
    };
    syncArticleFromUrl();
    window.addEventListener("popstate", syncArticleFromUrl);
    return () => window.removeEventListener("popstate", syncArticleFromUrl);
  }, [allPosts]);

  const openArticle = (post) => {
    setActiveArticle(post);
    if (post.slug) {
      const url = new URL(`/blog/${encodeURIComponent(post.slug)}`, window.location.origin);
      window.history.pushState({ page: "blog", blog: post.slug }, "", url);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeArticle = () => {
    setActiveArticle(null);
    const url = new URL("/?page=blog", window.location.origin);
    window.history.replaceState({ page: "blog" }, "", url);
  };

  if (activeArticle) {
    const relatedPosts = allPosts
      .filter((post) => post.id !== activeArticle.id)
      .slice(0, 3);
    const shareArticle = async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        window.setTimeout(() => setShareCopied(false), 1800);
      } catch {
        setShareCopied(false);
      }
    };

    return (
      <main className="blog-page article-page">
        <div className="article-page-shell">
          <nav className="article-breadcrumb" aria-label="Breadcrumb">
            <button type="button" onClick={closeArticle}>
              Blog
            </button>
            <span>/</span>
            <span>{activeArticle.title}</span>
          </nav>

          <article>
            <header className="article-page-header">
              <h1>{activeArticle.title}</h1>
              <div className="article-author-row">
                <div className="article-author">
                  <span className="article-author-mark">
                    <img
                      src={LOGO_URL}
                      alt="Health With Herbal"
                      className="article-author-logo"
                    />
                  </span>
                  <span>
                    <strong>{activeArticle.author}</strong>
                    <small>
                      <Calendar size={13} /> {activeArticle.date}
                      <i>·</i>
                      <Clock3 size={13} /> {activeArticle.readTime}
                    </small>
                  </span>
                </div>
                <button
                  type="button"
                  className="article-share-button"
                  onClick={shareArticle}
                >
                  {shareCopied ? "Copied" : "Share"}
                  {shareCopied ? <Check size={18} /> : <Share2 size={18} />}
                </button>
              </div>
            </header>

            {activeArticle.image && (
              <div className="article-page-image">
                <img src={activeArticle.image} alt={activeArticle.title} />
              </div>
            )}

            <div className="article-page-body">
              <ArticleMarkdown content={activeArticle.content} />
            </div>
          </article>

          {relatedPosts.length > 0 && (
            <section
              className="article-related"
              aria-labelledby="article-related-heading"
            >
              <h2 id="article-related-heading">Read more of our articles</h2>
              <div className="article-related-grid">
                {relatedPosts.map((post) => (
                  <button
                    type="button"
                    className="article-related-card"
                    key={post.id}
                    onClick={() => openArticle(post)}
                  >
                    <span className="article-related-image">
                      {post.image ? (
                        <img src={post.image} alt="" />
                      ) : (
                        <Sparkles size={26} aria-hidden="true" />
                      )}
                    </span>
                    <span className="article-related-title">{post.title}</span>
                    <span className="article-related-date">{post.date}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="blog-page">
      <section className="blog-hero">
        <div className="page-width blog-hero-inner">
          <div className="blog-hero-copy">
            <span className="blog-hero-eyebrow">
              The Health With Herbal Journal
            </span>
            <h1>The Blogs</h1>
            <p>
              Explore practical daily rituals, traditional Ayurvedic philosophy,
              and evidence-grounded botanical science to elevate your wellbeing
              naturally.
            </p>
          </div>
        </div>
      </section>

      <section
        className="blog-categories-section"
        aria-label="Browse blog categories"
      >
        <div className="page-width">
          <div className="blog-section-heading">
            <span>Find your next read</span>
            <h2>Explore by category</h2>
          </div>
          <div className="blog-category-filter">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                className={selectedCategory === cat ? "active" : ""}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        className="page-width blog-grid-section"
        aria-label="Blog articles"
      >
        {filteredPosts.length > 0 ? (
          <div className="blog-posts-grid">
            {filteredPosts.map((post) => (
              <article key={post.id} className="blog-card-item">
                <div
                  className="blog-card-image-wrap"
                  onClick={() => openArticle(post)}
                  role="button"
                  tabIndex={0}
                >
                  {post.image ? (
                    <img src={post.image} alt={post.title} />
                  ) : (
                    <div
                      style={{
                        height: "100%",
                        width: "100%",
                        background: "var(--cream, #f5efe6)",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Sparkles
                        size={32}
                        style={{
                          color: "var(--forest, #2d5a27)",
                          opacity: 0.5,
                        }}
                      />
                    </div>
                  )}
                  <span className="blog-badge">{post.category}</span>
                </div>

                <div className="blog-card-copy">
                  <div className="blog-card-meta">
                    <span>
                      <Calendar size={13} /> {post.date}
                    </span>
                    <span>
                      <Clock3 size={13} /> {post.readTime}
                    </span>
                  </div>

                  <h2 onClick={() => openArticle(post)}>{post.title}</h2>
                  <p>{post.excerpt}</p>

                  <div className="blog-card-footer">
                    <small>By {post.author}</small>
                    <button
                      type="button"
                      className="blog-read-button"
                      onClick={() => openArticle(post)}
                    >
                      Read article <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "70px 20px" }}>
            <Sparkles
              size={40}
              style={{
                color: "var(--forest)",
                opacity: 0.6,
                margin: "0 auto 16px",
              }}
            />
            <h3
              style={{
                fontSize: "22px",
                margin: "0 0 8px",
                color: "var(--forest-deep)",
              }}
            >
              No articles published yet
            </h3>
            <p
              style={{
                color: "var(--muted, #666)",
                fontSize: "14px",
                margin: "0 0 24px",
              }}
            >
              Check back soon for herbal wisdom, wellness guides, and Ayurvedic
              rituals.
            </p>
            <AppButton
              variant="outline"
              onClick={() => openCatalog && openCatalog("All Products")}
            >
              Browse Store Catalog <ArrowRight size={16} />
            </AppButton>
          </div>
        )}
      </section>
    </main>
  );
}
