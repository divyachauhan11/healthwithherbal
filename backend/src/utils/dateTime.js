/** Returns a YYYY-MM-DD calendar key for a date in the given time zone. */
function dateKeyInTimeZone(value, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const date = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  return `${date.year}-${date.month}-${date.day}`;
}

/** Returns midnight for the given store-local date, shifted by whole calendar days. */
function startOfDayInTimeZone(value, timeZone, dayOffset = 0) {
  const [year, month, day] = dateKeyInTimeZone(value, timeZone).split("-").map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day + dayOffset));
  const target = Date.UTC(
    targetDate.getUTCFullYear(),
    targetDate.getUTCMonth(),
    targetDate.getUTCDate(),
  );
  let timestamp = target;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(timestamp)).map(({ type, value: part }) => [type, part]),
    );
    const representedAsUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
    );
    const correction = target - representedAsUtc;
    timestamp += correction;
    if (correction === 0) break;
  }

  return new Date(timestamp);
}

module.exports = { dateKeyInTimeZone, startOfDayInTimeZone };
