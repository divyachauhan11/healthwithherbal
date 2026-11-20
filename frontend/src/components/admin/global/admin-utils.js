export const currency = (value, code = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
export const dateLabel = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
/** Format an amount as an en-IN currency value with exactly two decimals. */
export const currencyFixed = (value, code = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
/** Format a date with a numeric day, short month, and numeric year. */
export const dateLabelCompact = (value, emptyLabel = "—") =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : emptyLabel;
/** Format a date with a two-digit day, long month, and numeric year. */
export const dateLabelLong = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";
/** Format a date and time using en-IN medium date and short time styles. */
export const dateTimeLabel = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "—";
export const slugify = (text = "") =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export const classStatus = (status = "") =>
  status.toLowerCase().replaceAll(" ", "-");
/** Format a timestamp as a two-digit day, short month and time (e.g. for notifications); "" when empty. */
export const dateTimeLabelShort = (value) => value
  ? new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
  : "";
