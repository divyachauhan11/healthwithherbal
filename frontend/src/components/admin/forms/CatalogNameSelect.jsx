/**
 * Required select of catalog records by name (brands, categories). A current
 * value missing from the list stays selectable.
 * @param {object} props
 * @param {string} props.value Selected name.
 * @param {(event: Event) => void} props.onChange
 * @param {Array<{_id: string, name: string}>} props.items
 * @param {string} props.placeholder Empty option label.
 */
export function CatalogNameSelect({ value, onChange, items, placeholder }) {
  return (
    <select required value={value} onChange={onChange}>
      <option value="">{placeholder}</option>
      {items.map((item) => (
        <option key={item._id} value={item.name}>
          {item.name}
        </option>
      ))}
      {value && !items.some((item) => item.name === value) && (
        <option>{value}</option>
      )}
    </select>
  );
}
