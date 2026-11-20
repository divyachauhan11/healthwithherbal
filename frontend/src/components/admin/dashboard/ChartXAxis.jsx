/**
 * Weekday labels under the bars; today's label is highlighted.
 * @param {{days: Array<{key: string, date: Date, today: boolean}>}} props
 */
export function ChartXAxis({ days }) {
  return <div className="chart-x-axis">{days.map((day) => <div key={day.key} className="chart-x-col"><span className={`chart-day-label ${day.today ? "today" : ""}`}>{day.date.toLocaleDateString("en", { weekday: "short", timeZone: "UTC" })}</span></div>)}</div>;
}
