"use client";
import { useEffect, useMemo, useState } from "react";
import { listReviews } from "@/lib/api";
import { averageRating, matchProductReviews } from "./product-utils";

/**
 * Owns the product's approved reviews: shows the matching store-data reviews
 * until the product's own reviews have been fetched, and derives the rating.
 * @param {object} options
 * @param {object|null} options.product
 * @param {Array<object>} options.reviews Reviews from the store data.
 * @returns {{productReviews: Array<object>, realReviewsCount: number, realRating: number}}
 */
export function useProductReviews({ product, reviews }) {
  const [fetchedReviews, setFetchedReviews] = useState(null);

  useEffect(() => {
    if (!product) return;
    let active = true;
    const prodId = product._id || product.id;
    listReviews(prodId)
      .then((data) => {
        if (active && Array.isArray(data)) setFetchedReviews(data);
      })
      .catch((error) => {
        console.warn("Could not load product reviews:", error);
      });

    return () => {
      active = false;
    };
    // Refetch only when the product identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id, product?.id]);

  // Baseline matches from initial storefront reviews
  const directMatches = useMemo(() => matchProductReviews(reviews, product), [reviews, product]);

  const productReviews =
    fetchedReviews !== null ? fetchedReviews : directMatches;

  const realReviewsCount =
    fetchedReviews !== null
      ? fetchedReviews.length
      : directMatches.length > 0
      ? directMatches.length
      : Number(product?.reviews) || 0;

  const realRating = averageRating(productReviews, Number(product?.rating) || 0);

  return { productReviews, realReviewsCount, realRating };
}
