/**
 * One option of the sales period toggle.
 * @param {{active: boolean, onClick: () => void, children: React.ReactNode}} props
 */
export function SalesModeButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "4px 9px",
        fontSize: "11px",
        fontWeight: active ? "700" : "500",
        border: "none",
        borderRadius: "4px",
        background: active ? "#ffffff" : "transparent",
        color: active ? "#1e2c1e" : "#69726e",
        boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
