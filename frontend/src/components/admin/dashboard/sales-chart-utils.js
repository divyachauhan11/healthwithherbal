import { toCalendarDateKey } from "../tables/shared/date-utils";

/**
 * Short rupee label for the chart's y axis (₹0, ₹500, ₹1.5k, ₹2L, ₹1Cr).
 * @param {number} value
 * @returns {string}
 */
export function formatYAxis(value) {
  if (!value) return "₹0";
  if (value >= 10000000) return `₹${Number((value / 10000000).toFixed(1))}Cr`;
  if (value >= 100000) return `₹${Number((value / 100000).toFixed(1))}L`;
  if (value >= 1000) return `₹${Number((value / 1000).toFixed(1))}k`;
  return `₹${Math.round(value)}`;
}

/**
 * Move a "YYYY-MM-DD" date key by a number of days.
 * @param {string} dateKey
 * @param {number} offset Days (negative for earlier dates).
 * @returns {string}
 */
export function shiftDateKey(dateKey, offset) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + offset));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}-${String(shifted.getUTCDate()).padStart(2, "0")}`;
}

/**
 * "YYYY-MM-DD" key of a moment in the store's time zone (Asia/Kolkata).
 * @param {Date} value
 * @returns {string}
 */
export function getStoreDateKey(value) {
  return toCalendarDateKey(value, "Asia/Kolkata");
}

/**
 * Seven days of revenue ending on the latest reported day (or today), with a
 * rounded y axis scale.
 * @param {Array<{_id: string, revenue?: number, orders?: number}>} dailyRevenue
 * @returns {{days: Array<{key: string, date: Date, revenue: number, orders: number, today: boolean}>, total: number, ceiling: number, ticks: Array<number>}}
 */
export function buildSalesChart(dailyRevenue) {
  const entries = new Map(dailyRevenue.filter((entry) => entry?._id).map((entry) => [String(entry._id).slice(0, 10), entry]));
  const lastDate = [...entries.keys()].sort().at(-1) || getStoreDateKey(new Date());
  const days = Array.from({ length: 7 }, (_, index) => {
    const key = shiftDateKey(lastDate, index - 6);
    const date = new Date(`${key}T12:00:00.000Z`);
    const entry = entries.get(key) || {};
    return { key, date, revenue: Number(entry.revenue) || 0, orders: Number(entry.orders) || 0, today: index === 6 };
  });
  const max = Math.max(0, ...days.map(({ revenue }) => revenue));
  const magnitude = 10 ** Math.floor(Math.log10(max / 3 || 1));
  const step = max > 0 ? magnitude * Math.ceil(max / 3 / magnitude) : 100;
  return { days, total: days.reduce((sum, day) => sum + day.revenue, 0), ceiling: step * 3, ticks: [step * 3, step * 2, step, 0] };
}

/**
 * Vertical position of the i-th axis tick (0% top to 100% bottom).
 * @param {number} index
 * @returns {string}
 */
export const tickOffset = (index) => `${(index * 100) / 3}%`;
