"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Code2,
  Link2, Image, Palette, HeartPulse, Pill,
} from "lucide-react";
import { Modal } from "./Modal";
import { ImageUploadField } from "../custom/AdminForms";
import { slugify } from "./admin-utils";

function MarkdownEditor({ value = "", onChange, required, minLength, maxLength, placeholder }) {
  const textareaRef = useRef(null);
  const [preview, setPreview] = useState(false);

  const wrapSelection = (before, after = "", fallback = "text") => {
    const area = textareaRef.current;
    if (!area) return;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const selected = value.slice(start, end) || fallback;
    onChange(`${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`);
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const prefixLines = (prefix) => {
    const area = textareaRef.current;
    if (!area) return;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEndAt = value.indexOf("\n", end);
    const lineEnd = lineEndAt < 0 ? value.length : lineEndAt;
    const selected = value.slice(lineStart, lineEnd) || "Write your text here";
    const formatted = selected.split("\n").map((line) => `${prefix}${line}`).join("\n");
    onChange(`${value.slice(0, lineStart)}${formatted}${value.slice(lineEnd)}`);
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(lineStart, lineStart + formatted.length);
    });
  };

  const tool = (label, Icon, action) => (
    <button type="button" className="markdown-tool-button" title={label} aria-label={label}
      onMouseDown={(event) => event.preventDefault()} onClick={action}>
      <Icon size={16} />
    </button>
  );

  return (
    <div className="markdown-editor">
      <div className="markdown-editor-toolbar" role="toolbar" aria-label="Article formatting">
        {tool("Bold", Bold, () => wrapSelection("**", "**"))}
        {tool("Italic", Italic, () => wrapSelection("*", "*"))}
        <span className="markdown-tool-divider" />
        {tool("Heading 1", Heading1, () => prefixLines("# "))}
        {tool("Heading 2", Heading2, () => prefixLines("## "))}
        <span className="markdown-tool-divider" />
        {tool("Bulleted list", List, () => prefixLines("- "))}
        {tool("Numbered list", ListOrdered, () => prefixLines("1. "))}
        {tool("Quote", Quote, () => prefixLines("> "))}
        {tool("Code block", Code2, () => wrapSelection("\n```\n", "\n```\n", "code"))}
        {tool("Insert link", Link2, () => wrapSelection("[", "](https://example.com)", "link text"))}
        {tool("Insert image", Image, () => wrapSelection("![", "](https://example.com/image.jpg)", "image description"))}
        <span className="markdown-tool-divider" />
        <div className="markdown-font-size" title="Text size">
          <span>T</span>
          <select defaultValue="" aria-label="Text size" onChange={(event) => {
            if (event.target.value) wrapSelection("[", `]{size=${event.target.value}}`);
            event.target.value = "";
          }}>
            <option value="" disabled>Font Size</option>
            {["14px", "16px", "18px", "20px", "24px", "28px"].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </div>
        <span className="markdown-tool-divider" />
        <span className="markdown-color-label" title="Text color"><Palette size={16} /></span>
        {["#d97706", "#2563eb", "#059669", "#dc2626", "#7c3aed", "#111827", "#000000"].map((color) => (
          <button key={color} type="button" className="markdown-color-button" style={{ backgroundColor: color }}
            title={`Text color ${color}`} aria-label={`Text color ${color}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => wrapSelection("[", `]{color=${color}}`)} />
        ))}
        <span className="markdown-tool-divider" />
        <button type="button" className={`markdown-mode-button ${!preview ? "active" : ""}`} onClick={() => setPreview(false)}>Write</button>
        <button type="button" className={`markdown-mode-button ${preview ? "active" : ""}`} disabled={required && (value.trim().length < (minLength || 0))} onClick={() => setPreview(true)}>Preview</button>
      </div>
      {preview ? (
        <div className="markdown-editor-preview"><ArticleMarkdown content={value} /></div>
      ) : (
        <textarea ref={textareaRef} rows={12} required={required} minLength={minLength} maxLength={maxLength}
          value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      )}
      <div className="markdown-editor-footer"><span>Markdown formatting</span><span>{value.length}{maxLength ? ` / ${maxLength}` : ""}</span></div>
    </div>
  );
}

function ArticleMarkdown({ content = "" }) {
  const renderInline = (text) => text.split(/(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]*\)|\[[^\]]+\]\{(?:size|color)=[^}]+\}|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, index) => {
    const image = part.match(/^!\[([^\]]*)\]\((https?:\/\/[^)]+)\)$/);
    if (image) return <img key={index} src={image[2]} alt={image[1]} className="blog-content-inline-image" />;
    const styled = part.match(/^\[([^\]]+)\]\{(size|color)=([^}]+)\}$/);
    if (styled && styled[2] === "size" && /^(\d{1,2}(?:\.\d+)?)(px|rem|em|%)$/.test(styled[3])) return <span key={index} style={{ fontSize: styled[3] }}>{styled[1]}</span>;
    if (styled && styled[2] === "color" && /^#[0-9a-f]{6}$/i.test(styled[3])) return <span key={index} style={{ color: styled[3] }}>{styled[1]}</span>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    return part;
  });
  const lines = String(content).split("\n");
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
    const heading = line.match(/^(#{1,2})\s+(.*)$/);
    if (heading) {
      const Tag = heading[1].length === 1 ? "h1" : "h2";
      blocks.push(<Tag key={index}>{renderInline(heading[2])}</Tag>);
      index += 1;
    } else if (/^>\s?/.test(line)) {
      blocks.push(<blockquote key={index}>{renderInline(line.replace(/^>\s?/, ""))}</blockquote>);
      index += 1;
    } else if (/^[-*+]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^[-*+]\s+/.test(lines[index])) items.push(<li key={index}>{renderInline(lines[index++].replace(/^[-*+]\s+/, ""))}</li>);
      blocks.push(<ul key={`ul-${index}`}>{items}</ul>);
    } else if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) items.push(<li key={index}>{renderInline(lines[index++].replace(/^\d+\.\s+/, ""))}</li>);
      blocks.push(<ol key={`ol-${index}`}>{items}</ol>);
    } else {
      blocks.push(<p key={index}>{renderInline(line)}</p>);
      index += 1;
    }
  }
  return <div className="markdown-content">{blocks}</div>;
}

/**
 * Pre-defined entity schemas for zero-boilerplate admin modal forms
 */
function getEntitySchema(entity, { initial, catalog, brands = [], categories = [] }) {
  const allBrands = catalog?.brands || brands || [];
  const allCategories = catalog?.categories || categories || [];
  const productCategories = allCategories.filter((category) => !category.isParent);
  const parentCategories = allCategories.filter((category) => category.isParent);
  const isEditing = Boolean(initial?._id);

  switch (entity?.toLowerCase()) {
    case "product":
      return {
        title: isEditing ? "Edit Product" : "Add New Product",
        subtitle: isEditing
          ? "Update catalog details, pricing, photos, and available stock."
          : "Create a new catalog item with photos, pricing, and inventory.",
        fields: [
          {
            name: "title",
            label: "Product name",
            type: "text",
            span: "wide",
            required: true,
            placeholder: "e.g. Pure Organic Ashwagandha Root Powder",
          },
          {
            name: "sku",
            label: "SKU",
            type: "text",
            required: true,
            placeholder: "e.g. ASH-500G",
          },
          {
            name: "brand",
            label: "Brand",
            type: "select",
            required: true,
            placeholder: "Choose brand",
            options: allBrands.map((b) => ({ value: b.name, label: b.name })),
          },
          {
            name: "category",
            label: "Category",
            type: "select",
            required: true,
            placeholder: "Choose category",
            options: productCategories.map((c) => ({ value: c.name, label: c.name })),
          },
          {
            name: "stockQty",
            label: "Stock quantity",
            type: "number",
            min: 0,
            step: 1,
            required: true,
            placeholder: "0",
            defaultValue: 0,
          },
          {
            name: "original",
            label: "Regular price (₹)",
            type: "number",
            min: 0,
            step: 0.01,
            required: true,
            placeholder: "e.g. 599.00",
          },
          {
            name: "price",
            label: "Sale price (₹)",
            type: "number",
            min: 0,
            step: 0.01,
            required: true,
            placeholder: "e.g. 499.00",
          },
          {
            name: "badge",
            label: "Product badge (Promotion Tag)",
            type: "custom",
            render: ({ value, onChange }) => {
              const currentTags = (value || "")
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);

              const togglePreset = (preset) => {
                let updated;
                if (currentTags.some((t) => t.toLowerCase() === preset.toLowerCase())) {
                  updated = currentTags.filter((t) => t.toLowerCase() !== preset.toLowerCase());
                } else {
                  updated = [...currentTags, preset];
                }
                onChange(updated.join(", "));
              };

              const presets = ["New", "Bestseller", "Featured", "Ayurvedic", "Organic"];

              return (
                <label>
                  <span className="field-label">Product Badge (Tag)</span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="text"
                      value={value || ""}
                      onChange={(e) => onChange(e.target.value)}
                      placeholder="e.g. New, Bestseller (select multiple below or type comma-separated)"
                      style={{ flex: 1 }}
                    />
                    {value && (
                      <button
                        type="button"
                        onClick={() => onChange("")}
                        style={{
                          border: "1px solid #d1d5db",
                          background: "#f9fafb",
                          borderRadius: "6px",
                          padding: "8px 12px",
                          fontSize: "12px",
                          cursor: "pointer",
                          fontWeight: 600,
                          color: "#6b7280",
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      marginTop: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    {presets.map((preset) => {
                      const isSelected = currentTags.some(
                        (t) => t.toLowerCase() === preset.toLowerCase(),
                      );
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => togglePreset(preset)}
                          style={{
                            border: isSelected
                              ? "1.5px solid var(--forest, #153a2f)"
                              : "1px solid #d1d5db",
                            background: isSelected
                              ? "var(--forest, #153a2f)"
                              : "#f3f4f6",
                            color: isSelected ? "#ffffff" : "#374151",
                            borderRadius: "5px",
                            padding: "4px 10px",
                            fontSize: "11.5px",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          {isSelected && <span>✓</span>}
                          {preset === "New" ? "✨ New" : preset}
                        </button>
                      );
                    })}
                  </div>
                  <small
                    className="field-hint"
                    style={{ display: "block", marginTop: "4px", color: "#6b7280" }}
                  >
                    You can select multiple badges (e.g. <b>New, Bestseller</b>). Selecting <b>&ldquo;New&rdquo;</b> makes the product eligible for the New launches section.
                  </small>
                </label>
              );
            },
          },
          {
            name: "description",
            label: "Description",
            type: "textarea",
            rows: 4,
            span: "wide",
            required: true,
            placeholder: "Describe the product benefits, ingredients, and usage instructions...",
          },
          {
            name: "images",
            label: "Product Photos (Multiple uploads supported)",
            type: "images",
            multiple: true,
            span: "wide",
            description: "Upload high-quality product images. The first photo will be used as the main storefront cover.",
          },
          {
            name: "active",
            label: "Visible in storefront (Active for customers to purchase)",
            type: "checkbox",
            span: "wide",
            defaultValue: true,
          },
        ],
      };

    case "category":
      return {
        title: isEditing ? "Edit Category" : "Add New Category",
        subtitle: isEditing
          ? "Update category details, health concern type, and storefront visibility."
          : "Create a new herbal category to organize catalog products and navigation.",
        fields: [
          {
            name: "name",
            label: "Category name",
            type: "text",
            span: "wide",
            required: true,
            placeholder: "e.g. Immunity & Vitality, Organic Powders, Joint Care",
          },
          {
            name: "slug",
            label: "URL Slug",
            type: "slug",
            from: "name",
            required: true,
            help: "Used in web URL: /category/{slug}",
            placeholder: "e.g. immunity-vitality",
          },
          {
            name: "parentId",
            label: "Parent category (optional)",
            type: "select",
            placeholder: "No parent category",
            options: parentCategories.map((category) => ({ value: category._id, label: category.name })),
          },
          {
            name: "type",
            label: "Category Classification / Placement",
            type: "radio-cards",
            span: "wide",
            required: true,
            defaultValue: "form",
            options: [
              {
                value: "form",
                label: "Product Form / Category",
                desc: "Visible under the main \"Category\" filter in catalog (e.g. Skin Care, Hair Care, Herbal Oils, Churan).",
                icon: Pill,
              },
              {
                value: "concern",
                label: "Health Concern",
                desc: "Visible under the \"Shop by concern\" filter in catalog (e.g. Arthritis & Joints, Cough & Cold, Diabetic Care).",
                icon: HeartPulse,
              },
            ],
          },
          {
            name: "description",
            label: "Description (optional)",
            type: "textarea",
            rows: 3,
            span: "wide",
            placeholder: "Short description of this category for customer navigation and health guidelines...",
          },
          {
            name: "images",
            label: "Category Icon or Cover Image",
            type: "images",
            multiple: false,
            span: "wide",
            description: "Upload an icon or banner image representing this category on the storefront.",
          },
          {
            name: "isActive",
            label: "Active in Storefront (Visible in catalog filters and navigation)",
            type: "checkbox",
            span: "wide",
            defaultValue: true,
          },
        ],
      };

    case "parent-category":
      return {
        title: isEditing ? "Edit Parent Category" : "Add New Parent Category",
        subtitle: isEditing
          ? "Update this top-level category used to group related categories."
          : "Create a top-level category that can be selected when creating regular categories.",
        fields: [
          {
            name: "name",
            label: "Parent category name",
            type: "text",
            required: true,
            placeholder: "Enter a parent category name",
          },
          {
            name: "slug",
            label: "URL Slug",
            type: "slug",
            from: "name",
            required: true,
            help: "Used in web URL: /category/{slug}",
            placeholder: "parent-category-slug",
          },
          {
            name: "isActive",
            label: "Active",
            type: "checkbox",
            defaultValue: true,
          },
        ],
      };

    case "brand":
      return {
        title: isEditing ? "Edit Brand" : "Add Brand",
        subtitle: isEditing
          ? "Update brand information, logos, and promotional imagery."
          : "Add an authentic herbal manufacturer or product partner.",
        fields: [
          {
            name: "name",
            label: "Brand name",
            type: "text",
            required: true,
            placeholder: "Enter a brand name",
          },
          {
            name: "slug",
            label: "URL Slug",
            type: "slug",
            from: "name",
            required: true,
            placeholder: "brand-slug",
          },
          {
            name: "description",
            label: "Brand description",
            type: "textarea",
            rows: 3,
            span: "wide",
            placeholder: "Brief history, quality standards, or product focus of this brand...",
          },
          {
            name: "images",
            label: "Brand logo & banners (Multiple uploads supported)",
            type: "images",
            multiple: true,
            span: "wide",
            description: "Upload the brand's logo and assets. The first photo will be used as the primary logo.",
          },
          {
            name: "isActive",
            label: "Active Brand (Products available in store)",
            type: "checkbox",
            span: "wide",
            defaultValue: true,
          },
        ],
      };

    case "address":
      return {
        title: isEditing ? "Edit Address" : "Add New Address",
        subtitle: isEditing
          ? "Update your delivery recipient details, street address, and preferences."
          : "Add a shipping address for smooth delivery and one-click checkout.",
        fields: [
          {
            name: "fullName",
            label: "Full Name",
            type: "text",
            required: true,
            placeholder: "Recipient Full Name (e.g. Aarav Sharma)",
          },
          {
            name: "phone",
            label: "Phone Number",
            type: "tel",
            required: true,
            placeholder: "10-digit mobile number",
          },
          {
            name: "tag",
            label: "Address Type / Tag",
            type: "select",
            defaultValue: "Home",
            options: [
              { value: "Home", label: "Home" },
              { value: "Work", label: "Work / Office" },
              { value: "Other", label: "Other" },
            ],
          },
          {
            name: "country",
            label: "Country",
            type: "select",
            required: true,
            defaultValue: "India",
            options: [
              { value: "India", label: "India" },
              { value: "United States", label: "United States" },
              { value: "United Kingdom", label: "United Kingdom" },
              { value: "Canada", label: "Canada" },
              { value: "Australia", label: "Australia" },
              { value: "United Arab Emirates", label: "United Arab Emirates" },
            ],
          },
          {
            name: "line1",
            label: "Street Address Line 1",
            type: "text",
            span: "wide",
            required: true,
            placeholder: "House / Flat No., Apartment, Building, Street",
          },
          {
            name: "line2",
            label: "Address Line 2 (Optional)",
            type: "text",
            span: "wide",
            placeholder: "Area, Landmark, Sector, Colony",
          },
          {
            name: "city",
            label: "City",
            type: "text",
            required: true,
            placeholder: "City / District",
          },
          {
            name: "state",
            label: "State / Province",
            type: "text",
            placeholder: "State / Province",
          },
          {
            name: "postalCode",
            label: "Postal Code (PIN)",
            type: "text",
            required: true,
            placeholder: "e.g. 110001",
          },
          {
            name: "isDefault",
            label: "Make this my default shipping address",
            type: "checkbox",
            span: "wide",
            defaultValue: false,
          },
        ],
      };

    case "coupon":
      return {
        title: isEditing ? "Edit Coupon" : "Create Coupon",
        subtitle: "Configure discount codes, percentages, and usage rules.",
        fields: [
          {
            name: "code",
            label: "Coupon code",
            type: "text",
            required: true,
            uppercase: true,
            placeholder: "e.g. HERBAL25",
          },
          {
            name: "discountType",
            label: "Discount type",
            type: "select",
            required: true,
            defaultValue: "percent",
            options: [
              { value: "percent", label: "Percentage (%)" },
              { value: "fixed", label: "Fixed amount (₹)" },
              { value: "free_shipping", label: "Free shipping" },
            ],
          },
          {
            name: "discountValue",
            label: "Discount value",
            type: "number",
            min: 0,
            step: 0.01,
            required: true,
            placeholder: "e.g. 25 or 150.00",
          },
          {
            name: "minOrderAmount",
            label: "Minimum order value (₹)",
            type: "number",
            min: 0,
            step: 0.01,
            placeholder: "Optional minimum spend",
          },
          {
            name: "usageLimit",
            label: "Usage limit",
            type: "number",
            min: 1,
            placeholder: "Optional max redemptions",
          },
          {
            name: "expiresAt",
            label: "Expiry date",
            type: "date",
          },
          {
            name: "description",
            label: "Description",
            type: "textarea",
            rows: 3,
            span: "wide",
            placeholder: "Internal note or terms for this promotional code...",
          },
          {
            name: "isActive",
            label: "Active coupon (Eligible for checkout application)",
            type: "checkbox",
            span: "wide",
            defaultValue: true,
          },
        ],
      };

    case "blog":
      return {
        title: isEditing ? "Edit Blog Post" : "Write Blog Post",
        subtitle: "Author helpful articles, wellness tips, and herbal remedies.",
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
            placeholder: "Draft your full article content using markdown formatting...",
            help: "Use the toolbar to format headings, lists, quotes, links, images, text size, and color. Preview before saving.",
          },
          {
            name: "images",
            label: "Cover image",
            type: "images",
            multiple: false,
            span: "wide",
            description: "Upload an eye-catching header image for this blog post.",
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

    default:
      return { title: "Edit", subtitle: "", fields: [] };
  }
}

/**
 * Global Unified FormModal Component
 *
 * Can be used in two ways:
 * 1. Schema-driven by specifying `entity="product" | "category" | "coupon" | "brand" | "blog"`
 * 2. Fully custom by providing a `fields` array and `title`
 *
 * @param {boolean} isOpen - Modal visibility state
 * @param {string} entity - Pre-defined entity type
 * @param {Array} fields - Custom fields array (if entity not specified or to override)
 * @param {object|null} initial - Existing record being edited, or null for creation
 * @param {string} title - Optional title override
 * @param {string} subtitle - Optional subtitle override
 * @param {object} catalog - Catalog object with { brands, categories }
 * @param {Array} brands - Convenience array for product brand choices
 * @param {Array} categories - Convenience array for category choices
 * @param {Function} onSave - Submission callback receiving clean payload
 * @param {Function} onClose - Close callback
 * @param {boolean} busy - Saving/loading state
 * @param {string} submitLabel - Button label
 * @param {string} maxWidth - Card width (default: 820px)
 */
export function FormModal({
  isOpen,
  entity,
  fields: customFields,
  initial = null,
  title: customTitle,
  subtitle: customSubtitle,
  catalog,
  brands,
  categories,
  onSave,
  onClose,
  busy = false,
  submitLabel,
  maxWidth = "820px",
  className = "",
  children,
}) {
  // Compute entity schema
  const entitySchema = useMemo(() => {
    if (!entity) return null;
    return getEntitySchema(entity, { initial, catalog, brands, categories });
  }, [entity, initial, catalog, brands, categories]);

  const activeFields = customFields || entitySchema?.fields || [];
  const activeTitle =
    customTitle ||
    entitySchema?.title ||
    (initial?._id ? "Edit Item" : "Add New Item");
  const activeSubtitle = customSubtitle || entitySchema?.subtitle || "";

  // Form state
  const [form, setForm] = useState({});
  const [images, setImages] = useState([]);
  const [customizedSlugs, setCustomizedSlugs] = useState({});

  // Synchronize form when opening or initial changes
  useEffect(() => {
    if (!isOpen) return;

    const initialValues = {};
    activeFields.forEach((field) => {
      if (field.type === "images" || field.type === "image") return;
      const rawVal = initial?.[field.name];
      if (rawVal !== undefined && rawVal !== null) {
        if (field.type === "date" && rawVal) {
          try {
            initialValues[field.name] = new Date(rawVal).toISOString().slice(0, 10);
          } catch {
            initialValues[field.name] = rawVal;
          }
        } else if (Array.isArray(rawVal) && field.name === "tags") {
          initialValues[field.name] = rawVal.join(", ");
        } else {
          initialValues[field.name] = rawVal;
        }
      } else {
        initialValues[field.name] =
          field.defaultValue !== undefined ? field.defaultValue : "";
      }
    });

    setForm(initialValues);

    // Initial images
    const imgList =
      Array.isArray(initial?.images) && initial.images.length
        ? initial.images
        : initial?.image
        ? [initial.image]
        : initial?.logoUrl
        ? [initial.logoUrl]
        : initial?.coverImage
        ? [initial.coverImage]
        : [];
    setImages(imgList);

    setCustomizedSlugs(
      initial?._id
        ? activeFields.reduce((acc, f) => {
            if (f.type === "slug") acc[f.name] = true;
            return acc;
          }, {})
        : {}
    );
  }, [isOpen, initial, activeFields]);

  if (!isOpen) return null;

  const updateField = (name, value) => {
    setForm((current) => {
      const next = { ...current, [name]: value };

      // Check if any slug field depends on this field
      activeFields.forEach((f) => {
        if (f.type === "slug" && f.from === name && !customizedSlugs[f.name]) {
          next[f.name] = slugify(value);
        }
      });

      return next;
    });
  };

  const handleSlugInput = (fieldName, rawValue) => {
    setCustomizedSlugs((prev) => ({ ...prev, [fieldName]: true }));
    setForm((current) => ({
      ...current,
      [fieldName]: slugify(rawValue),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = { ...form };

    // Format images
    const hasImageField = activeFields.some(
      (f) => f.type === "images" || f.type === "image"
    );
    if (hasImageField) {
      const primary = images[0] || "";
      payload.image = primary;
      payload.logoUrl = primary;
      payload.coverImage = primary;
      payload.images = images.length ? images : primary ? [primary] : [];
    }

    // Entity-specific cleanups
    const ent = entity?.toLowerCase();
    if (ent === "coupon") {
      if (payload.code) payload.code = String(payload.code).toUpperCase().trim();
      if (!payload.expiresAt) delete payload.expiresAt;
      if (!payload.usageLimit) delete payload.usageLimit;
      if (!payload.minOrderAmount) delete payload.minOrderAmount;
      if (payload.discountValue !== undefined)
        payload.discountValue = Number(payload.discountValue);
    }

    if (ent === "blog" && typeof payload.tags === "string") {
      payload.tags = payload.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    if (ent === "product") {
      if (payload.price !== undefined) payload.price = Number(payload.price);
      if (payload.original !== undefined) payload.original = Number(payload.original);
      if (payload.stockQty !== undefined) payload.stockQty = Number(payload.stockQty);
      if (payload.badge !== undefined) {
        payload.badge = payload.badge ? String(payload.badge).trim() : null;
      }
    }

    if (ent === "category") {
      if (!payload.parentId) delete payload.parentId;
      if (!payload.type) payload.type = initial?.type || "form";
      payload.isParent = false;
    }

    if (ent === "parent-category") {
      payload.isParent = true;
      payload.parentId = null;
      payload.type = "form";
    }

    if (ent === "address") {
      if (payload.fullName) payload.fullName = String(payload.fullName).trim();
      if (payload.phone) payload.phone = String(payload.phone).trim();
      if (payload.line1) payload.line1 = String(payload.line1).trim();
      if (payload.line2) payload.line2 = String(payload.line2).trim();
      if (payload.city) payload.city = String(payload.city).trim();
      if (payload.state) payload.state = String(payload.state).trim();
      if (payload.postalCode) payload.postalCode = String(payload.postalCode).trim();
      if (payload.country) payload.country = String(payload.country).trim();
      if (payload.tag) payload.tag = String(payload.tag).trim();
      if (payload.isDefault !== undefined) payload.isDefault = Boolean(payload.isDefault);
    }

    onSave(payload);
  };

  const defaultSubmitLabel = initial?._id ? "Save changes" : "Create";

  return (
    <Modal
      isOpen={isOpen}
      title={activeTitle}
      subtitle={activeSubtitle}
      maxWidth={maxWidth}
      className={className}
      onClose={onClose}
      onSubmit={handleSubmit}
      busy={busy}
      submitLabel={submitLabel || defaultSubmitLabel}
    >
      <div className="form-grid">
        {activeFields.map((field) => {
          if (typeof field.hide === "function" && field.hide(form)) return null;
          if (field.hide === true) return null;

          const isWide = field.span === "wide" || field.span === 2;
          const labelEl = (
            <span className="field-label">
              {field.label}
              {field.required && (
                <span className="req-star" style={{ color: "#b84732", marginLeft: "2px" }}>
                  *
                </span>
              )}
            </span>
          );

          // Type: Custom
          if (field.type === "custom" && typeof field.render === "function") {
            return (
              <div
                key={field.name}
                className={isWide ? "wide" : ""}
                style={field.style}
              >
                {field.render({
                  value: form[field.name],
                  onChange: (val) => updateField(field.name, val),
                  form,
                  update: updateField,
                })}
              </div>
            );
          }

          // Type: Images
          if (field.type === "images" || field.type === "image") {
            return (
              <div key={field.name} className="wide">
                <ImageUploadField
                  images={images}
                  onChange={setImages}
                  multiple={field.multiple !== false}
                  label={field.label}
                  description={field.description}
                />
              </div>
            );
          }

          // Type: Checkbox
          if (field.type === "checkbox") {
            return (
              <label key={field.name} className="admin-checkbox wide">
                <input
                  type="checkbox"
                  checked={Boolean(form[field.name])}
                  onChange={(e) => updateField(field.name, e.target.checked)}
                />{" "}
                <b>{field.label}</b>
              </label>
            );
          }

          // Type: Radio Cards (e.g. Category concern vs form)
          if (field.type === "radio-cards") {
            return (
              <div key={field.name} className="wide" style={{ margin: "4px 0" }}>
                <span className="field-label" style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  {field.label}
                  {field.required && (
                    <span className="req-star" style={{ color: "#b84732", marginLeft: "2px" }}>
                      *
                    </span>
                  )}
                </span>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {(field.options || []).map((opt) => {
                    const isSelected = form[field.name] === opt.value;
                    const IconComponent = opt.icon;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => updateField(field.name, opt.value)}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          padding: "12px 14px",
                          borderRadius: "10px",
                          border: isSelected
                            ? "2px solid #236348"
                            : "1px solid #dfd8cc",
                          background: isSelected ? "#f4faf6" : "#ffffff",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <input
                          type="radio"
                          id={`radio-${field.name}-${opt.value}`}
                          name={field.name}
                          value={opt.value}
                          checked={isSelected}
                          onChange={() => updateField(field.name, opt.value)}
                          style={{ marginTop: "3px", accentColor: "#236348" }}
                        />
                        <label
                          htmlFor={`radio-${field.name}-${opt.value}`}
                          style={{ cursor: "pointer", margin: 0 }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {IconComponent && <IconComponent size={15} color="#236348" />}
                            <b style={{ color: "#1c2b24", fontSize: "13px" }}>{opt.label}</b>
                          </div>
                          {opt.desc && (
                            <span style={{ fontSize: "11.5px", color: "#6a7670", display: "block", marginTop: "3px" }}>
                              {opt.desc}
                            </span>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Type: Select
          if (field.type === "select") {
            return (
              <label key={field.name} className={isWide ? "wide" : ""}>
                {labelEl}
                <select
                  required={field.required}
                  autoComplete={field.autoComplete}
                  value={form[field.name] || ""}
                  onChange={(e) => updateField(field.name, e.target.value)}
                >
                  <option value="">{field.placeholder || "Select option"}</option>
                  {(field.options || []).map((opt) => {
                    const val = typeof opt === "object" ? opt.value : opt;
                    const lbl = typeof opt === "object" ? opt.label : opt;
                    return (
                      <option key={val} value={val}>
                        {lbl}
                      </option>
                    );
                  })}
                  {form[field.name] &&
                    !field.options?.some(
                      (o) => (typeof o === "object" ? o.value : o) === form[field.name]
                    ) && <option value={form[field.name]}>{form[field.name]}</option>}
                </select>
                {field.help && <small className="field-hint">{field.help}</small>}
              </label>
            );
          }

          // Type: Markdown editor
          if (field.type === "markdown") {
            return (
              <div key={field.name} className={`markdown-field ${isWide ? "wide" : ""}`}>
                {labelEl}
                <MarkdownEditor
                  value={form[field.name] || ""}
                  onChange={(value) => updateField(field.name, value)}
                  required={field.required}
                  minLength={field.minLength}
                  maxLength={field.maxLength}
                  placeholder={field.placeholder || "Write your article..."}
                />
                {field.help && <small className="field-hint">{field.help}</small>}
              </div>
            );
          }

          // Type: Textarea
          if (field.type === "textarea") {
            return (
              <label key={field.name} className={isWide ? "wide" : ""}>
                {labelEl}
                <textarea
                  rows={field.rows || 3}
                  required={field.required}
                  minLength={field.minLength}
                  maxLength={field.maxLength}
                  value={form[field.name] || ""}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  placeholder={field.placeholder || ""}
                />
                {field.help && <small className="field-hint">{field.help}</small>}
              </label>
            );
          }

          // Type: Slug
          if (field.type === "slug") {
            return (
              <label key={field.name} className={isWide ? "wide" : ""}>
                {labelEl}
                <input
                  required={field.required}
                  value={form[field.name] || ""}
                  onChange={(e) => handleSlugInput(field.name, e.target.value)}
                  placeholder={field.placeholder || ""}
                />
                {field.help && (
                  <small style={{ fontSize: "11px", color: "#78857f", marginTop: "3px", display: "block" }}>
                    {field.help.replace("{slug}", form[field.name] || "slug")}
                  </small>
                )}
              </label>
            );
          }

          // Standard Inputs: Text, Number, Date, etc.
          return (
            <label key={field.name} className={isWide ? "wide" : ""}>
              {labelEl}
              <input
                type={field.type || "text"}
                autoComplete={field.autoComplete}
                min={field.min}
                max={field.max}
                minLength={field.minLength}
                maxLength={field.maxLength}
                step={field.step}
                required={field.required}
                value={form[field.name] ?? ""}
                onChange={(e) =>
                  updateField(
                    field.name,
                    field.uppercase ? e.target.value.toUpperCase() : e.target.value
                  )
                }
                placeholder={field.placeholder || ""}
              />
              {field.help && <small className="field-hint">{field.help}</small>}
            </label>
          );
        })}

        {children}
      </div>
    </Modal>
  );
}

export default FormModal;
