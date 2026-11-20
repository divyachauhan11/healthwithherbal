/**
 * One selectable card of a radio-cards field: radio input, optional icon, label and description.
 * @param {object} props
 * @param {string} props.name Field name (radio group name and id prefix).
 * @param {{value: string, label: string, desc?: string, icon?: import("react").ComponentType}} props.option
 * @param {boolean} props.selected Whether this option is the current value.
 * @param {() => void} props.onSelect Selects this option.
 */
export function RadioCardOption({ name, option, selected, onSelect }) {
  const IconComponent = option.icon;
  return (
    <div
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "12px 14px",
        borderRadius: "10px",
        border: selected
          ? "2px solid #236348"
          : "1px solid #dfd8cc",
        background: selected ? "#f4faf6" : "#ffffff",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      <input
        type="radio"
        id={`radio-${name}-${option.value}`}
        name={name}
        value={option.value}
        checked={selected}
        onChange={onSelect}
        style={{ marginTop: "3px", accentColor: "#236348" }}
      />
      <label
        htmlFor={`radio-${name}-${option.value}`}
        style={{ cursor: "pointer", margin: 0 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {IconComponent && (
            <IconComponent size={15} color="#236348" />
          )}
          <b style={{ color: "#1c2b24", fontSize: "13px" }}>
            {option.label}
          </b>
        </div>
        {option.desc && (
          <span
            style={{
              fontSize: "11.5px",
              color: "#6a7670",
              display: "block",
              marginTop: "3px",
            }}
          >
            {option.desc}
          </span>
        )}
      </label>
    </div>
  );
}
