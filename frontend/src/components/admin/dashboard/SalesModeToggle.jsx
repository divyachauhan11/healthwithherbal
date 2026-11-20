import { SalesModeButton } from "./SalesModeButton";

/**
 * "This month" / "All time" switch of the sales by category panel.
 * @param {{mode: "month"|"all", onChange: (mode: "month"|"all") => void}} props
 */
export function SalesModeToggle({ mode, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        background: "#f0ece5",
        borderRadius: "6px",
        padding: "2px",
        gap: "2px",
      }}
    >
      <SalesModeButton active={mode === "month"} onClick={() => onChange("month")}>
        This month
      </SalesModeButton>
      <SalesModeButton active={mode === "all"} onClick={() => onChange("all")}>
        All time
      </SalesModeButton>
    </div>
  );
}
