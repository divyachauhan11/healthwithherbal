import { RETURN_EXCHANGE_TYPES } from "@/constants/statuses";

/**
 * Request type, quantity and reason fields of the account return/exchange dialog.
 * @param {object} props
 * @param {string} props.type Selected request type.
 * @param {number|string} props.quantity Selected quantity.
 * @param {number} props.maxQuantity Ordered quantity of the line (quantity options 1…max).
 * @param {string} props.reason Reason text.
 * @param {(type: string) => void} props.onTypeChange
 * @param {(quantity: string) => void} props.onQuantityChange
 * @param {(reason: string) => void} props.onReasonChange
 */
export function ReturnRequestDetailsFields({
  type,
  quantity,
  maxQuantity,
  reason,
  onTypeChange,
  onQuantityChange,
  onReasonChange,
}) {
  return (
    <>
      <label>Request type
        <select value={type} onChange={(event) => onTypeChange(event.target.value)}>
          <option value={RETURN_EXCHANGE_TYPES[0]}>Return</option><option value={RETURN_EXCHANGE_TYPES[1]}>Exchange</option>
        </select>
      </label>
      <label>Quantity
        <select value={quantity} onChange={(event) => onQuantityChange(event.target.value)}>
          {Array.from({ length: maxQuantity }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
        </select>
      </label>
      <label>Reason
        <textarea required minLength={5} maxLength={1000} rows={4} value={reason} onChange={(event) => onReasonChange(event.target.value)} placeholder="Tell us why you are requesting a return or exchange" />
      </label>
    </>
  );
}
