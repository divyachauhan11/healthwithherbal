/**
 * On/off switch for online return and exchange requests.
 * @param {{enabled: boolean, busy: boolean, onToggle: () => void}} props `busy` disables the switch.
 */
export function ReturnExchangeSwitch({ enabled, busy, onToggle }) {
  return <button type="button" role="switch" aria-checked={enabled} aria-label="Enable return and exchange requests" disabled={busy} onClick={onToggle} style={{ flex: "0 0 auto", width: 54, height: 30, border: 0, borderRadius: 20, padding: 3, background: enabled ? "#496b4c" : "#aaa39a", cursor: busy ? "wait" : "pointer", opacity: busy ? .6 : 1 }}><span style={{ display: "block", width: 24, height: 24, borderRadius: "50%", background: "white", transform: enabled ? "translateX(24px)" : "translateX(0)", transition: "transform .18s" }} /></button>;
}
