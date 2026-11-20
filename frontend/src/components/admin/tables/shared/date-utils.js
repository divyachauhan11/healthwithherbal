/**
 * Calendar date ("YYYY-MM-DD") of a moment in the given time zone.
 * @param {Date} date
 * @param {string} timeZone IANA time zone, e.g. "Asia/Kolkata".
 * @returns {string}
 */
export function toCalendarDateKey(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}
