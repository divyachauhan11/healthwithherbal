/**
 * Blog post form fields for `FormModal entity="blog"`.
 * @param {{isEditing: boolean}} context
 * @returns {{title: string, subtitle: string, fields: Array<object>}}
 */
export function buildBlogSchema({ isEditing }) {
  return {
    title: isEditing ? "Edit Blog Post" : "Write Blog Post",
    subtitle:
      "Author helpful articles, wellness tips, and herbal remedies.",
    fields: [
      {
        name: "title",
        label: "Post title",
        type: "text",
        span: "wide",
        required: true,
        minLength: 4,
        maxLength: 180,
        placeholder: "e.g. 10 Proven Health Benefits of Ashwagandha",
      },
      {
        name: "slug",
        label: "URL Slug",
        type: "slug",
        from: "title",
        required: true,
        placeholder: "e.g. 10-health-benefits-of-ashwagandha",
        help: "This becomes the article URL: ?page=blog&blog={slug}. It is filled from the title and can be edited.",
      },
      {
        name: "author",
        label: "Author name",
        type: "text",
        required: true,
        minLength: 2,
        maxLength: 100,
        placeholder: "e.g. Dr. Ananya Sharma, BAMS",
      },
      {
        name: "readTime",
        label: "Reading time",
        type: "text",
        required: true,
        maxLength: 30,
        placeholder: "e.g. 5 min read",
        help: "Shown beside the author and date on the article page.",
      },
      {
        name: "status",
        label: "Publishing status",
        type: "select",
        defaultValue: "draft",
        options: [
          { value: "draft", label: "Draft" },
          { value: "published", label: "Published" },
        ],
      },
      {
        name: "category",
        label: "Category",
        type: "text",
        span: "wide",
        required: true,
        minLength: 2,
        maxLength: 60,
        placeholder: "e.g. Ayurveda, Nutrition, Herbal remedies",
      },
      {
        name: "excerpt",
        label: "Excerpt / Short summary",
        type: "textarea",
        rows: 2,
        span: "wide",
        required: true,
        maxLength: 500,
        placeholder: "A 1-2 sentence hook describing the article...",
      },
      {
        name: "content",
        label: "Article content",
        type: "markdown",
        span: "wide",
        required: true,
        minLength: 20,
        maxLength: 50000,
        placeholder:
          "Draft your full article content using markdown formatting...",
        help: "Use the toolbar to format headings, lists, quotes, links, images, text size, and color. Preview before saving.",
      },
      {
        name: "images",
        label: "Cover image",
        type: "images",
        multiple: false,
        span: "wide",
        description:
          "Upload an eye-catching header image for this blog post.",
      },
      {
        name: "tags",
        label: "Tags (comma separated)",
        type: "text",
        span: "wide",
        placeholder: "ayurveda, immunity, organic, herbal remedies",
      },
    ],
  };
}

/**
 * Split comma-separated tags into a list and, when editing, keep the post's
 * comments setting (mutates `payload`). The form has no comments switch and
 * the API turns comments on when the field is missing, so editing a post with
 * comments disabled used to re-enable them.
 * @param {object} payload
 * @param {object|null} [initial] Post being edited, if any.
 */
export function normalizeBlogPayload(payload, initial) {
  if (typeof payload.tags === "string") {
    payload.tags = payload.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  if (payload.allowComments === undefined && typeof initial?.allowComments === "boolean") {
    payload.allowComments = initial.allowComments;
  }
}
