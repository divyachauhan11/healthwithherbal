import { Truck } from "lucide-react";
import { OrderInfoCard } from "./OrderInfoCard";

/**
 * "Shipment Tracking" card with the courier tracking id.
 * @param {object} props
 * @param {string} props.trackingId Courier tracking id.
 */
export function OrderTrackingCard({ trackingId }) {
  return (
    <OrderInfoCard icon={Truck} title="Shipment Tracking">
      <div className="contact-row">
        <span>Tracking ID:</span>{" "}
        <strong>{trackingId}</strong>
      </div>
    </OrderInfoCard>
  );
}
