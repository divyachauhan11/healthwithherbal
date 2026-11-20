import { formatYAxis, tickOffset } from "./sales-chart-utils";

/**
 * Revenue labels along the chart's y axis.
 * @param {{ticks: Array<number>}} props Tick values, top to bottom.
 */
export function ChartYAxis({ ticks }) {
  return <div className="chart-y-axis" aria-hidden="true">{ticks.map((tick, i) => <span key={i} className="chart-y-label" style={{ top: tickOffset(i) }}>{formatYAxis(tick)}</span>)}</div>;
}
