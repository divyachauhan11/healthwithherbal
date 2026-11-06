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
    : " ";
export const slugify = (text = "") =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export const classStatus = (status = "") =>
  status.toLowerCase().replaceAll(" ", "-");
