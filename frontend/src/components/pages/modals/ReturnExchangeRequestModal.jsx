"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, ImagePlus, X } from "lucide-react";
import { submitReturnExchangeEmail, uploadReturnExchangePhotos } from "@/lib/api";
import { currency, dateLabel } from "@/components/admin/global/admin-utils";
import { RETURN_EXCHANGE_TYPES } from "@/constants/statuses";

export function ReturnExchangeRequestModal({
  order,
  currentUser,
  initialItemIndex,
  onClose,
}) {
  const [requestType, setRequestType] = useState(RETURN_EXCHANGE_TYPES[0]);
  const [productChoice, setProductChoice] = useState(
    initialItemIndex == null ? "" : String(initialItemIndex),
  );
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [photos, setPhotos] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const selectedProduct = useMemo(() => {
    const index = Number(productChoice);
    return productChoice && Number.isInteger(index)
      ? order?.items?.[index] || null
      : null;
  }, [order, productChoice]);

  if (!order || typeof document === "undefined") return null;
  const customerEmail = currentUser?.email || order.customer?.email || order.guestEmail || "";
  const close = () => !sending && onClose?.();
  const submit = async (event) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const photoUrls = photos.length
        ? await uploadReturnExchangePhotos(photos)
        : [];
      await submitReturnExchangeEmail({
        orderNumber: order.orderNumber,
        email: customerEmail,
        type: requestType,
        ...(selectedProduct ? { itemIndex: Number(productChoice), quantity: Number(quantity) } : {}),
        reason: reason.trim(),
        photoUrls,
      });
      setSent(true);
    } catch (submitError) {
      setError(
        submitError.message || "Could not prepare the email. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  return createPortal(
    <div
      className="return-exchange-overlay"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <section
        className="return-exchange-dialog return-exchange-request-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="return-exchange-title"
      >
        <button
          type="button"
          className="return-exchange-close"
          onClick={close}
          disabled={sending}
          aria-label="Close request form"
        >
          <X size={22} />
        </button>
        <span className="return-exchange-eyebrow">
          Order {order.orderNumber || "—"}
        </span>
        <h2 id="return-exchange-title">Return or exchange request</h2>
        <p className="return-exchange-help">
          Submitting sends your request directly to our care team. Please wait
          for return instructions before mailing the product.
        </p>
        {sent ? (
          <div className="return-exchange-send-success" role="status">
            <CheckCircle2 size={34} />
            <h3>Request sent to our care team</h3>
            <p>We emailed healthwithherbalindia@gmail.com{customerEmail ? ` and copied ${customerEmail}` : ""}.</p>
            <button type="button" className="app-button" onClick={onClose}>Done</button>
          </div>
        ) : <>
        <div className="return-exchange-order-summary">
          <span>Order date · {dateLabel(order.createdAt)}</span>
          <strong>{currency(order.total, order.currency || "INR")}</strong>
        </div>
        <form onSubmit={submit}>
          <fieldset className="return-exchange-options">
            <legend>What would you like to request?</legend>
            <label>
              <input
                type="radio"
                name="requestType"
                value={RETURN_EXCHANGE_TYPES[0]}
                checked={requestType === RETURN_EXCHANGE_TYPES[0]}
                onChange={() => setRequestType(RETURN_EXCHANGE_TYPES[0])}
              />
              <span>Return for refund</span>
            </label>
            <label>
              <input
                type="radio"
                name="requestType"
                value={RETURN_EXCHANGE_TYPES[1]}
                checked={requestType === RETURN_EXCHANGE_TYPES[1]}
                onChange={() => setRequestType(RETURN_EXCHANGE_TYPES[1])}
              />
              <span>Exchange (subject to confirmation)</span>
            </label>
          </fieldset>
          <label className="return-exchange-field">
            Product
            <select
              value={productChoice}
              onChange={(event) => {
                setProductChoice(event.target.value);
                setQuantity("1");
              }}
            >
              <option value="">All items / not sure</option>
              {(order.items || []).map((item, index) => (
                <option key={`return-item-${index}`} value={String(index)}>
                  {item.titleSnapshot || item.title || "Product"} · Qty{" "}
                  {item.quantity || 1}
                </option>
              ))}
            </select>
          </label>
          {selectedProduct && (
            <label className="return-exchange-field">
              Quantity
              <select
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              >
                {Array.from(
                  {
                    length: Math.max(1, Number(selectedProduct.quantity) || 1),
                  },
                  (_, index) => (
                    <option key={index + 1} value={String(index + 1)}>
                      {index + 1}
                    </option>
                  ),
                )}
              </select>
            </label>
          )}
          <label className="return-exchange-field">
            Reason (optional)
            <textarea
              rows={4}
              maxLength={1000}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Tell us how we can help"
            />
          </label>
          <label className="return-exchange-field">
            Photos (optional, up to 4)
            <span className="return-exchange-upload">
              <ImagePlus size={17} />
              <span>Choose photos · JPG, PNG, or WebP; 5 MB max each</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={sending}
                onChange={(event) => {
                  const selectedFiles = Array.from(event.target.files || []);
                  if (
                    selectedFiles.some((file) => file.size > 5 * 1024 * 1024)
                  ) {
                    setError("Each photo must be 5 MB or smaller.");
                    event.target.value = "";
                    return;
                  }
                  setPhotos((current) =>
                    [...current, ...selectedFiles].slice(0, 4),
                  );
                  setError("");
                  event.target.value = "";
                }}
              />
            </span>
          </label>
          {photos.length > 0 && (
            <div className="return-exchange-photo-list">
              {photos.map((photo, index) => (
                <div key={`${photo.name}-${photo.lastModified}`}>
                  <span>{photo.name}</span>
                  <button
                    type="button"
                    disabled={sending}
                    onClick={() =>
                      setPhotos((current) =>
                        current.filter((_, photoIndex) => photoIndex !== index),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          {error && (
            <p className="return-exchange-error" role="alert">
              {error}
            </p>
          )}
          <div className="return-exchange-dialog-actions">
            <button
              type="button"
              className="app-button secondary"
              disabled={sending}
              onClick={close}
            >
              Cancel
            </button>
            <button type="submit" className="app-button" disabled={sending}>
              {sending ? "Sending request…" : "Email care team"}
            </button>
          </div>
        </form>
        </>}
      </section>
    </div>,
    document.body,
  );
}
