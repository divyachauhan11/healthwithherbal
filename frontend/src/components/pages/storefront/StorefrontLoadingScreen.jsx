"use client";

/**
 * Full-screen logo splash shown while the client-only storefront bundle loads.
 */
export function StorefrontLoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#fbf8f3",
      }}
    >
      <div style={{ textAlign: "center", padding: "24px" }}>
        <img
          src="/health-with-herbal-logo.png"
          alt="Health with Herbal - The art of healthy Living"
          style={{
            width: "220px",
            maxWidth: "80vw",
            height: "auto",
            display: "block",
            margin: "0 auto",
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
}
