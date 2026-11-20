"use client";

/**
 * Message shown on the product page when no product matches the URL.
 */
export function ProductNotFound() {
  return (
    <>
      <h2>Product not found</h2>
      <p style={{ marginTop: "12px", color: "#666" }}>The requested remedy may have been updated or moved.</p>
    </>
  );
}
