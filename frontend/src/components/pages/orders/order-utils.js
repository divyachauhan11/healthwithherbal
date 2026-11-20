import { CheckCircle2, Package, Truck } from "lucide-react";
import {
  ORDER_STATUSES,
  REFUND_STATUSES,
  RETURN_EXCHANGE_STATUSES,
  RETURN_EXCHANGE_TYPES,
} from "@/constants/statuses";

/**
 * The four delivery stages of the order status timeline. `timeText(status)`
 * returns the caption shown under a stage for the order's current status.
 */
export const ORDER_STAGES = [
  {
    key: ORDER_STATUSES[0],
    name: "Order Placed",
    timeText: (status) => (status === ORDER_STATUSES[0] ? "Just now" : "Confirmed"),
    icon: CheckCircle2,
  },
  {
    key: ORDER_STATUSES[1],
    name: "Packed & Blessed",
    timeText: (status) =>
      status === ORDER_STATUSES[0]
        ? "Within 24 hours"
        : status === ORDER_STATUSES[1]
          ? "Packing & quality check"
          : "Completed",
    icon: Package,
  },
  {
    key: ORDER_STATUSES[2],
    name: "In Transit",
    timeText: (status) =>
      status === ORDER_STATUSES[2]
        ? "On the way to you"
        : status === ORDER_STATUSES[3]
          ? "Arrived"
          : "2-4 business days",
    icon: Truck,
  },
  {
    key: ORDER_STATUSES[3],
    name: "Delivered",
    timeText: (status) =>
      status === ORDER_STATUSES[3]
        ? "Delivered to your doorstep"
        : "To your doorstep",
    icon: CheckCircle2,
  },
];

/**
 * Timeline state of one stage for an order status.
 * @param {number} stageIndex Index in {@link ORDER_STAGES}.
 * @param {string} status Lower-cased order status.
 * @returns {{isCompleted: boolean, isCurrent: boolean, isPending: boolean}}
 */
export const getStageState = (stageIndex, status) => {
  if (status === ORDER_STATUSES[4]) {
    return { isCompleted: false, isCurrent: false, isPending: true };
  }
  if (status === ORDER_STATUSES[3]) {
    return { isCompleted: true, isCurrent: false, isPending: false };
  }
  if (status === ORDER_STATUSES[2]) {
    if (stageIndex < 2)
      return { isCompleted: true, isCurrent: false, isPending: false };
    if (stageIndex === 2)
      return { isCompleted: false, isCurrent: true, isPending: false };
    return { isCompleted: false, isCurrent: false, isPending: true };
  }
  if (status === ORDER_STATUSES[1]) {
    if (stageIndex === 0)
      return { isCompleted: true, isCurrent: false, isPending: false };
    if (stageIndex === 1)
      return { isCompleted: false, isCurrent: true, isPending: false };
    return { isCompleted: false, isCurrent: false, isPending: true };
  }
  // Initial placed stage: Step 0 confirmed, Step 1 in-progress/packing.
  if (stageIndex === 0)
    return { isCompleted: true, isCurrent: false, isPending: false };
  if (stageIndex === 1)
    return { isCompleted: false, isCurrent: true, isPending: false };
  return { isCompleted: false, isCurrent: false, isPending: true };
};

/**
 * Whether the connector after stage `dividerIndex` is highlighted.
 * @param {number} dividerIndex Index of the stage the connector follows.
 * @param {string} status Lower-cased order status.
 * @returns {boolean}
 */
export const isDividerActive = (dividerIndex, status) => {
  if (status === ORDER_STATUSES[4]) return false;
  if (status === ORDER_STATUSES[3]) return true;
  if (status === ORDER_STATUSES[2]) return dividerIndex <= 1;
  return dividerIndex === 0;
};

/**
 * Best available image URL for an order line.
 * @param {object} [item] Order line.
 * @returns {string} Image URL, or "" when the line has none.
 */
export const orderProductImage = (item) =>
  item?.image ||
  item?.productImage ||
  item?.product?.image ||
  item?.product?.images?.[0] ||
  "";

/**
 * Whether a return/exchange request refers to an order line: by its stored
 * line index when present, otherwise by (non-empty) product title.
 * @param {object} request Return/exchange request.
 * @param {object} item Order line.
 * @param {number} itemIndex Index of the line in the order.
 */
export const isRequestForOrderItem = (request, item, itemIndex) => {
  if (Number.isInteger(request.itemIndex)) return request.itemIndex === itemIndex;
  const requestedTitle = String(request.item?.title || "").trim().toLowerCase();
  const orderItemTitle = String(item.titleSnapshot || item.title || "").trim().toLowerCase();
  return requestedTitle && requestedTitle === orderItemTitle;
};

/**
 * Capitalised request status ("Pending" when empty).
 * @param {string} [value]
 * @returns {string}
 */
export const statusLabel = (value) => value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "Pending";

/**
 * "Exchange" or "Return" for a return/exchange request type.
 * @param {string} [type]
 * @returns {string}
 */
export const requestTypeLabel = (type) => (type === RETURN_EXCHANGE_TYPES[1] ? "Exchange" : "Return");

/**
 * Customer-facing refund state of a return/exchange request.
 * @param {string} [refundStatus]
 * @returns {"Completed"|"Not required"|"Pending"}
 */
export const refundStatusLabel = (refundStatus) =>
  refundStatus === REFUND_STATUSES[2]
    ? "Completed"
    : refundStatus === REFUND_STATUSES[0] ? "Not required" : "Pending";

/**
 * Progress steps and refund badge of a return/exchange request.
 * @param {object} request Return/exchange request.
 * @returns {{requestStatus: string, steps: Array<{label: string, state: string, detail: string}>, refundLabel: string, refundClass: string}}
 */
export const getReturnExchangeProgress = (request) => {
  const requestStatus = request.status || RETURN_EXCHANGE_STATUSES[0];
  const rejected = requestStatus === RETURN_EXCHANGE_STATUSES[2];
  const steps = [
    { label: "Request submitted", state: "complete", detail: "Received" },
    {
      label: "Admin review",
      state: requestStatus === RETURN_EXCHANGE_STATUSES[0] ? "current" : rejected ? "rejected" : "complete",
      detail: rejected ? "Rejected" : requestStatus === RETURN_EXCHANGE_STATUSES[0] ? "Under review" : "Reviewed",
    },
    {
      label: request.type === RETURN_EXCHANGE_TYPES[1] ? "Exchange resolution" : "Return resolution",
      state: requestStatus === RETURN_EXCHANGE_STATUSES[1] ? "current" : requestStatus === RETURN_EXCHANGE_STATUSES[3] ? "complete" : "pending",
      detail: requestStatus === RETURN_EXCHANGE_STATUSES[1] ? "In progress" : requestStatus === RETURN_EXCHANGE_STATUSES[3] ? "Completed" : rejected ? "Not continued" : "Waiting",
    },
  ];
  const refundLabel = request.type === RETURN_EXCHANGE_TYPES[1]
    ? "Not applicable"
    : refundStatusLabel(request.refundStatus);
  const refundClass = request.type === RETURN_EXCHANGE_TYPES[1] || request.refundStatus === REFUND_STATUSES[0]
    ? "not-required"
    : request.refundStatus === REFUND_STATUSES[2] ? "complete" : "pending";
  return { requestStatus, steps, refundLabel, refundClass };
};

/**
 * Amount with two decimals when it is a number; any other value unchanged.
 * @param {*} value
 */
export const toFixedAmount = (value) => (value?.toFixed ? value.toFixed(2) : value);

/**
 * Order date and time as shown on the confirmation hero (now when missing).
 * @param {string|number|Date} [value]
 * @returns {string}
 */
export const formatOrderDateTime = (value) =>
  new Date(value || Date.now()).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * Hero heading and subtitle for the PayU payment result and the page mode.
 * @param {""|"success"|"failed"|"pending"} paymentResult
 * @param {boolean} detailMode
 * @returns {{title: string, subtitle: string}}
 */
export const getOrderHeroCopy = (paymentResult, detailMode) => ({
  title:
    paymentResult === "failed"
      ? "Payment was not completed"
      : paymentResult === "pending"
        ? "Payment is being confirmed"
        : detailMode
          ? "Your Order Information"
          : "Thank You for Choosing Pure Wellness",
  subtitle:
    paymentResult === "failed"
      ? "Your online payment did not complete. Return to checkout to place a new order, or contact support if your account was charged."
      : paymentResult === "pending"
        ? "PayU is still confirming this transaction. Please check your order status again shortly."
        : detailMode
          ? "Review the products, delivery details, payment method, and latest status for this order."
          : "Your order has been safely placed and is now being lovingly prepared by our Ayurvedic apothecarists.",
});

/**
 * Order number (or id) read from the current URL path.
 * @param {number} position Segment position for `Array#at`, e.g. -1 for
 *   `/account/orders/:id` and -2 for `/account/orders/:id/invoice`.
 * @returns {string} Decoded identifier, or "" when absent.
 */
export const orderIdentifierFromPath = (position) =>
  decodeURIComponent(
    window.location.pathname.split("/").filter(Boolean).at(position) || "",
  );
