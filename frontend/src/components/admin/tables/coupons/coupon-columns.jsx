import { dateLabel } from "../../global/admin-utils";
import { RecordStatusBadge } from "../shared";
import { CouponRowActions } from "./CouponRowActions";
import { formatCouponUsage, formatCouponValue, getCouponStatus } from "./coupon-utils";

/**
 * DataTable column definitions for the coupons table.
 * @param {{onEdit?: Function, onDelete: Function}} handlers Row action handlers (each receives the coupon).
 * @returns {Array<Object>}
 */
export function getCouponColumns({ onEdit, onDelete }) {
  return [
    {
      key: "code",
      label: "Code",
      sortable: true,
      render: (coupon) => <b>{coupon.code}</b>,
    },
    {
      key: "description",
      label: "Description",
      cellClassName: "coupon-desc-cell",
      render: (coupon) => coupon.description || "—",
    },
    {
      key: "discountType",
      label: "Type",
      sortable: true,
    },
    {
      key: "discountValue",
      label: "Value",
      sortable: true,
      render: (coupon) => formatCouponValue(coupon),
    },
    {
      key: "usedCount",
      label: "Used",
      sortable: true,
      render: (coupon) => formatCouponUsage(coupon),
    },
    {
      key: "expiresAt",
      label: "Expires",
      sortable: true,
      render: (coupon) => dateLabel(coupon.expiresAt),
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (coupon) => <RecordStatusBadge status={getCouponStatus(coupon)} />,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (coupon) => <CouponRowActions coupon={coupon} onEdit={onEdit} onDelete={onDelete} />,
    },
  ];
}
