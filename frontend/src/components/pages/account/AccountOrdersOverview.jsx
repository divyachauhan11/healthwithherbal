import { Package } from "lucide-react";
import { AccountLoadingState } from "./AccountLoadingState";
import { AccountOrderList } from "./AccountOrderList";
import { AccountSection } from "./AccountSection";
import { NoSavedAddresses } from "./NoSavedAddresses";

/**
 * "My Orders" section of the account overview: the two latest orders, a
 * loading state or an empty state.
 * @param {object} props
 * @param {object[]} props.orders All of the customer's orders.
 * @param {boolean} props.loading Orders are loading.
 * @param {object} props.orderListProps Expand/review/return handlers for {@link AccountOrderList}.
 * @param {() => void} props.onViewAll Switches to the "My Orders" tab.
 * @param {() => void} props.onShop Opens the shop.
 */
export function AccountOrdersOverview({ orders, loading, orderListProps, onViewAll, onShop }) {
  return (
    <AccountSection
      title="My Orders"
      actionLabel={orders.length > 0 ? `View All (${orders.length}) →` : undefined}
      onAction={onViewAll}
    >
      {loading ? (
        <AccountLoadingState message="Loading past orders..." size={24} />
      ) : orders.length === 0 ? (
        <NoSavedAddresses
          title="No Past Orders Yet"
          description="Start your first order to see it here."
          actionLabel="Shop Now"
          inlineAction
          Icon={Package}
          iconWrapperClassName="mock-box-3d"
          style={{}}
          onAddAddress={onShop}
        />
      ) : (
        <AccountOrderList
          className="account-orders-preview-list"
          orders={orders.slice(0, 2)}
          {...orderListProps}
        />
      )}
    </AccountSection>
  );
}
