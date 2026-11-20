/**
 * Quantity picker for the selected order line (1 to its ordered quantity).
 * @param {object} props
 * @param {object} props.product Selected order line.
 * @param {string} props.value Selected quantity.
 * @param {(value: string) => void} props.onChange Selects a quantity.
 */
export function ReturnExchangeQuantityField({ product, value, onChange }) {
  return (
    <label className="return-exchange-field">
      Quantity
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {Array.from(
          {
            length: Math.max(1, Number(product.quantity) || 1),
          },
          (_, index) => (
            <option key={index + 1} value={String(index + 1)}>
              {index + 1}
            </option>
          ),
        )}
      </select>
    </label>
  );
}
