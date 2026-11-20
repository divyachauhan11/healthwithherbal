import { tickOffset } from "./sales-chart-utils";

/**
 * Horizontal grid lines behind the bars (the last one is the baseline).
 * @param {{ticks: Array<number>}} props
 */
export function ChartGridLines({ ticks }) {
  return <div className="chart-grid-lines" aria-hidden="true">{ticks.map((tick, i) => <div key={i} className={`chart-grid-line ${i === 3 ? "baseline" : ""}`} style={{ top: tickOffset(i) }} />)}</div>;
}
