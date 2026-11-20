/**
 * Row for adding an image by URL; Enter or "Add URL" submits.
 * @param {object} props
 * @param {string} props.value Current URL text.
 * @param {(value: string) => void} props.onChange
 * @param {() => void} props.onAdd Adds the URL to the list.
 */
export function ImageUrlInputRow({ value, onChange, onAdd }) {
  return (
    <div className="image-url-row">
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste image URL (https://...)"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAdd();
          }
        }}
      />
      <button type="button" className="outline" onClick={onAdd}>
        Add URL
      </button>
    </div>
  );
}
