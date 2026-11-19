import { useState, useRef, useEffect } from "react";
import { X, Upload, Trash2, Plus, Star, Loader2, Image as ImageIcon } from "lucide-react";
import { slugify } from "@/components/admin/global/admin-utils";
import { adminUploadRequest } from "@/lib/admin-api";

export function ImageUploadField({
  images = [],
  onChange,
  multiple = true,
  maxImages = Infinity,
  label = "Images",
  description = "Upload images (PNG, JPG, WebP, SVG). The first image will be used as the primary cover.",
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);
  const atImageLimit = Number.isFinite(maxImages) && images.length >= maxImages;

  useEffect(() => {
    if (Number.isFinite(maxImages) && images.length > maxImages) {
      onChange(images.slice(0, maxImages));
      setError(`Products can have up to ${maxImages} images. Only the first ${maxImages} will be kept when you save.`);
    }
  }, [images, maxImages, onChange]);

  const handleFiles = async (files) => {
    if (!files || !files.length) return;
    const available = Number.isFinite(maxImages)
      ? Math.max(0, maxImages - images.length)
      : files.length;
    if (available === 0) {
      setError(`You can add up to ${maxImages} images.`);
      return;
    }
    const selectedFiles = Array.from(files);
    const acceptedFiles = selectedFiles.slice(0, available);
    setError(
      selectedFiles.length > available
        ? `Only ${maxImages} images are allowed. The first ${available} selected image${available === 1 ? " was" : "s were"} uploaded.`
        : "",
    );
    setUploading(true);
    try {
      const res = await adminUploadRequest(acceptedFiles);
      if (res.urls && res.urls.length) {
        if (multiple) {
          onChange([...images, ...res.urls].slice(0, maxImages));
        } else {
          onChange([res.urls[0]]);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to upload image(s).");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (idx) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  const setPrimary = (idx) => {
    if (idx === 0) return;
    const target = images[idx];
    const rest = images.filter((_, i) => i !== idx);
    onChange([target, ...rest]);
  };

  const addUrl = (e) => {
    e?.preventDefault();
    const url = urlInput.trim();
    if (!url) return;
    if (multiple) {
      if (Number.isFinite(maxImages) && images.length >= maxImages) {
        setError(`You can add up to ${maxImages} images.`);
        return;
      }
      onChange([...images, url]);
    } else {
      onChange([url]);
    }
    setUrlInput("");
    setShowUrlInput(false);
  };

  return (
    <div className="image-upload-wrapper">
      <div className="image-upload-header">
        <div>
          <label className="image-upload-label">{label}</label>
          {description && <p className="image-upload-sub">{description}</p>}
        </div>
        <button
          type="button"
          className="text-link-btn"
          disabled={atImageLimit || uploading}
          onClick={() => setShowUrlInput((v) => !v)}
        >
          {showUrlInput ? "Hide URL input" : "+ Add via URL"}
        </button>
      </div>

      {showUrlInput && (
        <div className="image-url-row">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image URL (https://...)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
          />
          <button type="button" className="outline" onClick={addUrl}>
            Add URL
          </button>
        </div>
      )}

      {error && <div className="upload-error-alert">{error}</div>}

      <div
        className={`upload-dropzone ${dragOver ? "dragover" : ""} ${uploading ? "uploading" : ""} ${Number.isFinite(maxImages) && images.length >= maxImages ? "at-limit" : ""}`}
        aria-disabled={atImageLimit || uploading}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
          onClick={() => !uploading && (!Number.isFinite(maxImages) || images.length < maxImages) && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          disabled={Number.isFinite(maxImages) && images.length >= maxImages}
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="dropzone-content">
            <Loader2 size={24} className="spin-animate text-forest" />
            <span className="dropzone-title">Uploading image{multiple ? "(s)" : ""}...</span>
            <span className="dropzone-hint">Please wait while the files are being saved</span>
          </div>
        ) : (
          <div className="dropzone-content">
            <div className="upload-icon-circle">
              <Upload size={18} />
            </div>
            <span className="dropzone-title">
              {atImageLimit
                ? `Maximum of ${maxImages} images reached`
                : `Click to browse or drag & drop image${multiple ? "s" : ""}`}
            </span>
            <span className="dropzone-hint">
              Supports JPG, PNG, WebP, GIF, SVG (up to 10MB each)
              {multiple ? " • Select multiple files at once" : ""}
              {Number.isFinite(maxImages) ? ` • Up to ${maxImages} images` : ""}
            </span>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="uploaded-gallery">
          <div className="uploaded-gallery-head">
            <span>
              {images.length} image{images.length > 1 ? "s" : ""} selected
            </span>
            {images.length > 1 && (
              <span className="muted-hint">First photo is the primary cover</span>
            )}
          </div>
          <div className="uploaded-grid">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className={`uploaded-card ${idx === 0 ? "is-primary" : ""}`}
              >
                <div className="card-thumb">
                  <img src={imgUrl} alt={`Upload ${idx + 1}`} />
                </div>
                {idx === 0 ? (
                  <span className="cover-badge">
                    <Star size={9} fill="currentColor" /> Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    className="make-cover-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrimary(idx);
                    }}
                    title="Set as primary cover"
                  >
                    Set cover
                  </button>
                )}
                <button
                  type="button"
                  className="remove-img-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(idx);
                  }}
                  title="Remove image"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductForm({ initial, brands, categories, onSave, onClose, busy }) {
  const productCategories = (categories || []).filter((category) => !category?.isParent);
  const [form, setForm] = useState(() => ({
    title: initial?.title || "",
    sku: initial?.sku || "",
    brand: initial?.brand || "",
    category: initial?.category || "",
    description: initial?.description || "",
    original: initial?.original ?? "",
    price: initial?.price ?? "",
    stockQty: initial?.stockQty ?? 0,
    active: initial?.active ?? true,
  }));
  const [images, setImages] = useState(() => {
    if (Array.isArray(initial?.images) && initial.images.length) return initial.images;
    if (initial?.image) return [initial.image];
    return [];
  });

  const update = (key) => (event) =>
    setForm((current) => ({
      ...current,
      [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value,
    }));

  return (
    <form
      className="admin-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          ...form,
          image: images[0] || "",
          images: images.length ? images : (images[0] ? [images[0]] : []),
        });
      }}
    >
      <div className="admin-form-heading">
        <div>
          <h2>{initial?._id ? "Edit product" : "Add product"}</h2>
          <p>Update the catalog details, photos, and stock available for sale.</p>
        </div>
        <button type="button" className="outline" onClick={onClose}>
          <X size={16} /> Close
        </button>
      </div>
      <div className="form-section">
        <h3>Product details</h3>
        <div className="form-grid">
          <label className="wide">
            Product name
            <input required value={form.title} onChange={update("title")} />
          </label>
          <label>
            SKU
            <input required value={form.sku} onChange={update("sku")} />
          </label>
          <label>
            Brand
            <select required value={form.brand} onChange={update("brand")}>
              <option value="">Choose brand</option>
              {brands.map((brand) => (
                <option key={brand._id} value={brand.name}>
                  {brand.name}
                </option>
              ))}
              {form.brand && !brands.some((brand) => brand.name === form.brand) && (
                <option>{form.brand}</option>
              )}
            </select>
          </label>
          <label>
            Category
            <select required value={form.category} onChange={update("category")}>
              <option value="">Choose category</option>
              {productCategories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
              {form.category &&
                !productCategories.some((category) => category.name === form.category) && (
                  <option>{form.category}</option>
                )}
            </select>
          </label>
          <label className="wide">
            Description
            <textarea
              rows={4}
              required
              value={form.description}
              onChange={update("description")}
            />
          </label>
          <label>
            Regular price (₹)
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={form.original}
              onChange={update("original")}
            />
          </label>
          <label>
            Sale price (₹)
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={form.price}
              onChange={update("price")}
            />
          </label>
          <label>
            Stock quantity
            <input
              type="number"
              min="0"
              step="1"
              required
              value={form.stockQty}
              onChange={update("stockQty")}
            />
          </label>

          <div className="wide">
            <ImageUploadField
              images={images}
              onChange={setImages}
              multiple={true}
              maxImages={9}
              label="Product photos (Multiple uploads supported)"
              description="Upload up to 9 high-quality product images. The first photo will be used as the main storefront cover image."
            />
          </div>

          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={form.active}
              onChange={update("active")}
            />{" "}
            Visible in the storefront
          </label>
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="outline" onClick={onClose}>
          Cancel
        </button>
        <button className="primary" disabled={busy}>
          {busy ? "Saving…" : initial?._id ? "Save product" : "Create product"}
        </button>
      </div>
    </form>
  );
}

export function CollectionForm({ kind, initial, onSave, onClose, busy }) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [type, setType] = useState(initial?.type || "form");
  const [images, setImages] = useState(() => {
    if (Array.isArray(initial?.images) && initial.images.length) return initial.images;
    if (initial?.image) return [initial.image];
    if (initial?.logoUrl) return [initial.logoUrl];
    return [];
  });

  const isBrand = kind === "brands" || kind === "Brands";

  return (
    <form
      className="admin-form"
      onSubmit={(event) => {
        event.preventDefault();
        const primary = images[0] || "";
        onSave({
          name,
          slug: slugify(name),
          description,
          type,
          isActive: true,
          image: primary,
          logoUrl: primary,
          images: images.length ? images : (primary ? [primary] : []),
        });
      }}
    >
      <div className="admin-form-heading">
        <div>
          <h2>
            {initial ? "Edit" : "Add"} {isBrand ? "brand" : "category"}
          </h2>
          <p>
            {isBrand
              ? "Manage brand details, logos, and promotional imagery."
              : "Keep catalog navigation and category structure current."}
          </p>
        </div>
        <button type="button" className="outline" onClick={onClose}>
          <X size={16} /> Close
        </button>
      </div>
      <div className="form-section">
        <div className="form-grid">
          <label>
            Name
            <input required value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Slug
            <input readOnly value={slugify(name)} />
          </label>
          {!isBrand && (
            <label>
              Category type
              <select value={type} onChange={(event) => setType(event.target.value)}>
                <option value="form">Product form</option>
                <option value="concern">Health concern</option>
              </select>
            </label>
          )}
          <label className="wide">
            Description
            <textarea
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          {isBrand && (
            <div className="wide">
              <ImageUploadField
                images={images}
                onChange={setImages}
                multiple={true}
                label="Brand logo & banners (Multiple uploads supported)"
                description="Upload the brand's logo and branding assets. The first image will be used as the brand's primary logo."
              />
            </div>
          )}
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="outline" onClick={onClose}>
          Cancel
        </button>
        <button className="primary" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

export function CouponForm({ initial, onSave, onClose, busy }) {
  const [form, setForm] = useState(() => ({
    code: initial?.code || "",
    description: initial?.description || "",
    discountType: initial?.discountType || "percent",
    discountValue: initial?.discountValue ?? "",
    minOrderAmount: initial?.minOrderAmount ?? "",
    expiresAt: initial?.expiresAt
      ? new Date(initial.expiresAt).toISOString().slice(0, 10)
      : "",
    usageLimit: initial?.usageLimit ?? "",
  }));
  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));
  return (
    <form
      className="admin-form"
      onSubmit={(event) => {
        event.preventDefault();
        const body = { ...form, code: form.code.toUpperCase() };
        if (!body.expiresAt) delete body.expiresAt;
        if (!body.usageLimit) delete body.usageLimit;
        onSave(body);
      }}
    >
      <div className="admin-form-heading">
        <div>
          <h2>{initial?._id ? "Edit coupon" : "Create coupon"}</h2>
          <p>Set a code and discount rules for your customers.</p>
        </div>
        <button type="button" className="outline" onClick={onClose}>
          <X size={16} /> Close
        </button>
      </div>
      <div className="form-section">
        <div className="form-grid">
          <label>
            Coupon code
            <input required value={form.code} onChange={update("code")} />
          </label>
          <label>
            Discount type
            <select
              value={form.discountType}
              onChange={update("discountType")}
            >
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed amount (₹)</option>
              <option value="free_shipping">Free shipping</option>
            </select>
          </label>
          <label>
            Discount value (₹ / %)
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={form.discountValue}
              onChange={update("discountValue")}
            />
          </label>
          <label>
            Minimum order amount (₹)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.minOrderAmount}
              onChange={update("minOrderAmount")}
            />
          </label>
          <label>
            Usage limit
            <input
              type="number"
              min="1"
              value={form.usageLimit}
              onChange={update("usageLimit")}
            />
          </label>
          <label>
            Expiry date
            <input
              type="date"
              value={form.expiresAt}
              onChange={update("expiresAt")}
            />
          </label>
          <label className="wide">
            Description
            <textarea
              rows={3}
              value={form.description}
              onChange={update("description")}
            />
          </label>
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="outline" onClick={onClose}>
          Cancel
        </button>
        <button className="primary" disabled={busy}>
          {busy ? "Saving…" : initial?._id ? "Save changes" : "Create coupon"}
        </button>
      </div>
    </form>
  );
}

export function BlogForm({ onSave, onClose, busy }) {
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", coverImage: "", tags: "", status: "draft" });
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  return <form className="admin-form" onSubmit={(event) => { event.preventDefault(); onSave({ ...form, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) }); }}><div className="admin-form-heading"><div><h2>Write a blog post</h2><p>Posts are saved with draft or published status.</p></div><button type="button" className="outline" onClick={onClose}><X size={16} /> Close</button></div><div className="form-section"><div className="form-grid"><label className="wide">Title<input required minLength="4" value={form.title} onChange={update("title")} /></label><label className="wide">Excerpt<textarea rows={2} value={form.excerpt} onChange={update("excerpt")} /></label><label className="wide">Article<textarea rows={10} required minLength="20" value={form.content} onChange={update("content")} /></label><label>Cover image URL<input type="url" value={form.coverImage} onChange={update("coverImage")} /></label><label>Tags (comma separated)<input value={form.tags} onChange={update("tags")} /></label><label>Status<select value={form.status} onChange={update("status")}><option value="draft">Draft</option><option value="published">Published</option></select></label></div></div><div className="form-actions"><button type="button" className="outline" onClick={onClose}>Cancel</button><button className="primary" disabled={busy}>{busy ? "Saving…" : "Save post"}</button></div></form>;
}
