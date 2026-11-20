import { Package } from "lucide-react";
import { AccountLoadingState } from "./AccountLoadingState";
import { AccountOrderList } from "./AccountOrderList";
import { AccountPageHeader } from "./AccountPageHeader";
import { NoSavedAddresses } from "./NoSavedAddresses";

/**
 * "My Orders" tab of the account page: every order, a loading state or an empty state.
 * @param {object} props
 * @param {object[]} props.orders Customer's orders.
 * @param {boolean} props.loading Orders are loading.
 * @param {object} props.orderListProps Expand/review/return handlers for the order cards.
 * @param {() => void} props.onShop Opens the shop.
 */
export function AccountOrdersTab({ orders, loading, orderListProps, onShop }) {
  return (
    <div className="account-tab-content">
      <AccountPageHeader
        title="My Orders"
        description="Showing all orders placed from your verified account."
      />

      {loading ? (
        <AccountLoadingState message="Loading order history from database..." />
      ) : orders.length === 0 ? (
        <NoSavedAddresses
          title="No Orders Found"
          description="You haven’t placed any orders yet. Discover our pure Ayurvedic remedies today."
          actionLabel="Start Shopping"
          Icon={Package}
          actionIcon={null}
          iconWrapperClassName="mock-box-3d"
          onAddAddress={onShop}
        />
      ) : (
        <AccountOrderList
          className="account-orders-full-list"
          orders={orders}
          {...orderListProps}
        />
      )}
    </div>
  );
}
