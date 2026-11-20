import { RadioCardOption } from "./RadioCardOption";
import { RequiredMark } from "./RequiredMark";

/**
 * Full-width group of radio cards (e.g. category "form" vs "concern").
 * @param {object} props
 * @param {object} props.field Field config (name, label, required, options).
 * @param {*} props.value Current value.
 * @param {(value: string) => void} props.onChange Receives the chosen option value.
 */
export function RadioCardsField({ field, value, onChange }) {
  return (
    <div
      className="wide"
      style={{ margin: "4px 0" }}
    >
      <span
        className="field-label"
        style={{
          display: "block",
          marginBottom: "8px",
          fontWeight: "600",
        }}
      >
        {field.label}
        {field.required && <RequiredMark />}
      </span>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "12px",
        }}
      >
        {(field.options || []).map((opt) => (
          <RadioCardOption
            key={opt.value}
            name={field.name}
            option={opt}
            selected={value === opt.value}
            onSelect={() => onChange(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}
