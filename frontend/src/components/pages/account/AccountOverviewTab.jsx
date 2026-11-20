import { AccountAddressesOverview } from "./AccountAddressesOverview";
import { AccountOrdersOverview } from "./AccountOrdersOverview";
import { AccountPageHeader } from "./AccountPageHeader";

/**
 * "Overview" tab of the account page: latest orders and the default address.
 * @param {object} props
 * @param {object[]} props.orders Customer's orders.
 * @param {boolean} props.loadingOrders Orders are loading.
 * @param {object[]} props.addresses Saved addresses.
 * @param {boolean} props.loadingAddresses Addresses are loading.
 * @param {object} props.orderListProps Expand/review/return handlers for the order cards.
 * @param {(tab: string) => void} props.onTabChange Switches account tab.
 * @param {() => void} props.onShop Opens the shop.
 * @param {() => void} props.onAddAddress Opens the add-address form.
 */
export function AccountOverviewTab({
  orders,
  loadingOrders,
  addresses,
  loadingAddresses,
  orderListProps,
  onTabChange,
  onShop,
  onAddAddress,
}) {
  return (
    <div className="account-tab-content">
      <AccountPageHeader title="Overview" />

      <AccountOrdersOverview
        orders={orders}
        loading={loadingOrders}
        orderListProps={orderListProps}
        onViewAll={() => onTabChange("orders")}
        onShop={onShop}
      />

      <AccountAddressesOverview
        addresses={addresses}
        loading={loadingAddresses}
        onManage={() => onTabChange("addresses")}
        onAddAddress={() => {
          onTabChange("addresses");
          onAddAddress();
        }}
      />
    </div>
  );
}
