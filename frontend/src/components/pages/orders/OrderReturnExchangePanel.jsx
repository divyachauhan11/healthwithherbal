/**
 * Return/exchange policy panel shown for delivered orders on the details page.
 * @param {object} props
 * @param {() => void} props.onRequest Opens the contact form for a return or exchange.
 */
export function OrderReturnExchangePanel({ onRequest }) {
  return (
    <section className="return-exchange-panel">
      <div>
        <span className="return-exchange-eyebrow">
          Delivered order support
        </span>
        <h2>Need a return or exchange?</h2>
        <p>
          Unopened and unused products in new condition, with original
          packaging and accessories, can be requested for a 100% refund
          within 10 days of receipt. Buyers pay return shipping, insurance,
          and any duties. Please contact us before mailing anything back.
        </p>
      </div>
      <button
        type="button"
        className="app-button"
        onClick={onRequest}
      >
        Request return or exchange
      </button>
    </section>
  );
}
