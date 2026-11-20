"use client";
import { useState } from "react";
import { submitProductReview } from "@/lib/api";
import {
  defaultReviewerEmail,
  defaultReviewerName,
  reviewOrderNumber,
  reviewProductTitle,
} from "./product-review-utils";

/**
 * Form state and submission of the product review dialog. The reviewer's name
 * and email default (on first render) to the signed-in customer or the order's customer.
 * @param {object} options
 * @param {object|null} options.product Reviewed product / order line.
 * @param {object} [options.order] Order the product was delivered in.
 * @param {object|null} [options.currentUser] Signed-in customer.
 * @param {() => void} options.onClose Closes the dialog.
 * @param {() => void} [options.onSubmitted] Called after a successful submission.
 * @returns {{
 *   rating: number, setRating: Function, hoverRating: number, setHoverRating: Function,
 *   title: string, setTitle: Function, comment: string, setComment: Function,
 *   userName: string, setUserName: Function, userEmail: string, setUserEmail: Function,
 *   busy: boolean, error: string, success: boolean,
 *   handleSubmit: (event: Event) => Promise<void>, handleClose: () => void,
 * }}
 */
export function useProductReviewForm({ product, order, currentUser, onClose, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState(defaultReviewerName(currentUser, order));
  const [userEmail, setUserEmail] = useState(defaultReviewerEmail(currentUser, order));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Please write a few words about your experience with this product.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await submitProductReview({
        productId: product.product || product._id || product.id,
        legacyId: product.legacyId,
        productTitle: reviewProductTitle(product),
        userId: currentUser?._id || order?.userId || null,
        userName: userName.trim() || "Verified Buyer",
        userEmail: userEmail.trim().toLowerCase(),
        orderNumber: reviewOrderNumber(order),
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

      setSuccess(true);
      onSubmitted?.();
    } catch (err) {
      setError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => {
    if (!busy) {
      setError("");
      setSuccess(false);
      onClose();
    }
  };

  return {
    rating,
    setRating,
    hoverRating,
    setHoverRating,
    title,
    setTitle,
    comment,
    setComment,
    userName,
    setUserName,
    userEmail,
    setUserEmail,
    busy,
    error,
    success,
    handleSubmit,
    handleClose,
  };
}
