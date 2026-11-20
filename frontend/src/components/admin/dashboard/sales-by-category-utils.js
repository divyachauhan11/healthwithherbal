const CATEGORY_PALETTE = [
  "#17483d",
  "#b65c3d",
  "#d09a2a",
  "#5f7883",
  "#744b82",
  "#2b6b66",
];

const CURRENCY_SYMBOL = "₹";

/**
 * Top four categories by sales plus an "Other" bucket, with colours and
 * percentages that add up to exactly 100 (largest remainder method).
 * @param {Array<{_id: string, revenue?: number, count?: number, units?: number}>} rawList
 * @returns {Array<{name: string, amount: number, units?: number, color: string, rawPct: number, percentage: number, fraction: number}>}
 */
export function calculateCategoryBreakdown(rawList) {
  if (!rawList || !rawList.length) return [];

  // Filter to items that actually have positive sales
  const valid = rawList.filter((item) => (item.revenue ?? item.count ?? 0) > 0);
  if (!valid.length) return [];

  const total = valid.reduce(
    (sum, item) => sum + (item.revenue ?? item.count ?? 0),
    0,
  );
  if (total <= 0) return [];

  // Sort descending by amount
  const sorted = [...valid].sort(
    (a, b) => (b.revenue ?? b.count ?? 0) - (a.revenue ?? a.count ?? 0),
  );

  // Group top 4 categories and place remaining into "Other"
  const top4 = sorted.slice(0, 4);
  const remainder = sorted.slice(4);
  const otherSum = remainder.reduce(
    (sum, it) => sum + (it.revenue ?? it.count ?? 0),
    0,
  );

  const items = top4.map((item, index) => ({
    name: item._id || "Other",
    amount: item.revenue ?? item.count ?? 0,
    units: item.units,
    color: CATEGORY_PALETTE[index % CATEGORY_PALETTE.length],
  }));

  if (otherSum > 0) {
    items.push({
      name: "Other",
      amount: otherSum,
      color: CATEGORY_PALETTE[4 % CATEGORY_PALETTE.length],
    });
  }

  // Exact math with Largest Remainder Method: guarantees percentages sum to EXACTLY 100%
  const computed = items.map((item) => {
    const rawPct = (item.amount / total) * 100;
    const floorPct = Math.floor(rawPct);
    return {
      ...item,
      rawPct,
      percentage: floorPct,
      fraction: rawPct - floorPct,
    };
  });

  const sumFloor = computed.reduce((sum, it) => sum + it.percentage, 0);
  const remainderPoints = 100 - sumFloor;

  // Distribute any rounding difference to the items with highest fractional parts
  const byFraction = computed
    .map((item, index) => ({
      index,
      fraction: item.fraction,
      amount: item.amount,
    }))
    .filter((entry) => entry.amount > 0)
    .sort((a, b) => b.fraction - a.fraction);

  for (let i = 0; i < remainderPoints && i < byFraction.length; i++) {
    computed[byFraction[i].index].percentage += 1;
  }

  return computed;
}

/**
 * Percentage label with precision that grows as the value shrinks.
 * @param {number} pct
 * @returns {string}
 */
export function formatExactPct(pct) {
  if (pct === undefined || pct === null || isNaN(pct) || pct <= 0) return "0%";
  if (pct >= 99.995 && pct < 100) return "99.99%";
  if (pct >= 100) return "100%";
  if (pct >= 10) return `${Number(pct.toFixed(1))}%`;
  if (pct >= 1) return `${Number(pct.toFixed(2))}%`;
  if (pct >= 0.01) return `${Number(pct.toFixed(2))}%`;
  if (pct >= 0.001) return `${Number(pct.toFixed(3))}%`;
  return `${Number(pct.toFixed(4))}%`;
}

/**
 * Short rupee amount: ₹1.2Cr, ₹3.4L, ₹12k or the full value below 1,000.
 * @param {number} amount
 * @returns {string}
 */
export const formatCompactAmount = (amount) => {
  const val = Number(amount || 0);
  if (val >= 10000000)
    return `${CURRENCY_SYMBOL}${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `${CURRENCY_SYMBOL}${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `${CURRENCY_SYMBOL}${Math.round(val / 1000)}k`;
  return `${CURRENCY_SYMBOL}${val.toLocaleString("en-IN")}`;
};

/**
 * CSS conic-gradient for the category donut (grey ring when there is no data).
 * @param {Array<{color: string, rawPct?: number, percentage?: number}>} items
 * @returns {string}
 */
export function buildCategoryGradient(items) {
  if (!items || !items.length) {
    return "conic-gradient(#e5ebe7 0% 100%)";
  }
  let current = 0;
  const stops = items.map((item) => {
    const start = current;
    current += item.rawPct ?? item.percentage ?? 0;
    return `${item.color} ${start}% ${current}%`;
  });
  if (current < 100 && stops.length) {
    stops.push(`${items[items.length - 1].color} ${current}% 100%`);
  }
  return `conic-gradient(${stops.join(", ")})`;
}
