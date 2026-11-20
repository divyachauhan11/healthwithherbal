import { Loader2, PackageCheck } from "lucide-react";

/**
 * Content of the order page while the order loads or when none is found: a
 * spinner or package icon, a heading, an explanation and links back to the
 * account and home. Rendered inside the page's `order-placed-wrapper`.
 * @param {object} props
 * @param {boolean} props.loading Order details are still being fetched.
 * @param {boolean} props.detailMode Viewing `/account/orders/:orderId` rather than the confirmation page.
 * @param {(page: string, options?: object) => void} props.navigate Storefront navigation.
 */
export function OrderUnavailableState({ loading, detailMode, navigate }) {
  return (
    <>
      {loading ? (
        <Loader2
          size={40}
          className="spin-animate"
          style={{ margin: "0 auto 18px" }}
        />
      ) : (
        <PackageCheck
          size={56}
          style={{
            color: "var(--forest)",
            opacity: 0.7,
            margin: "0 auto 18px",
          }}
        />
      )}
      <h2
        style={{
          fontSize: "28px",
          color: "var(--forest-deep)",
          marginBottom: "10px",
        }}
      >
        {loading
          ? "Loading Order Details"
          : detailMode
            ? "Order Not Found"
            : "No Active Order Found"}
      </h2>
      <p
        style={{
          color: "var(--muted)",
          maxWidth: "460px",
          margin: "0 auto 28px",
          fontSize: "15px",
          lineHeight: "1.6",
        }}
      >
        {loading
          ? "Please wait while we retrieve this order from the database."
          : detailMode
            ? "We could not find this order. Return to your account to choose another order."
            : "We could not find a recently completed order in this session. If you have already placed an order, you can view its live status under your account."}
      </p>
      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className="app-button"
          onClick={() => navigate("account", { tab: "orders" })}
        >
          {detailMode ? "Back to My Orders" : "Go to My Account"}
        </button>
        <button
          type="button"
          className="app-button secondary"
          onClick={() => navigate("home")}
        >
          Back to Home
        </button>
      </div>
    </>
  );
}
