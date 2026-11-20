"use client";
import { Clock3, Truck } from "lucide-react";

/**
 * Delivery and dispatch notes on the product page.
 */
export function ProductDeliveryNotes() {
  return (
    <div className="delivery-notes">
      <span>
        <Truck />
        <p>
          <strong>Free delivery</strong>
          <small>On orders over ₹75</small>
        </p>
      </span>
      <span>
        <Clock3 />
        <p>
          <strong>Dispatches in 24–48 hours</strong>
          <small>Tracked from our door to yours</small>
        </p>
      </span>
    </div>
  );
}
