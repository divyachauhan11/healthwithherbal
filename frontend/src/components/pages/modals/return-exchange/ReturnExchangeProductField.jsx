/**
 * Product picker of the return/exchange form ("All items / not sure" or one order line).
 * @param {object} props
 * @param {object[]} [props.items] Order lines.
 * @param {string} props.value Selected line index as a string ("" for all items).
 * @param {(value: string) => void} props.onChange Selects a line.
 */
export function ReturnExchangeProductField({ items, value, onChange }) {
  return (
    <label className="return-exchange-field">
      Product
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">All items / not sure</option>
        {(items || []).map((item, index) => (
          <option key={`return-item-${index}`} value={String(index)}>
            {item.titleSnapshot || item.title || "Product"} · Qty{" "}
            {item.quantity || 1}
          </option>
        ))}
      </select>
    </label>
  );
}
