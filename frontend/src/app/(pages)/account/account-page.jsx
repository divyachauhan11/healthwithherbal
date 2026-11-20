"use client";
import { useEffect, useState } from "react";
import { ProductReviewModal } from "@/components/pages/modals";
import {
  AccountAddressesTab,
  AccountLoggedOutCard,
  AccountLogoutConfirm,
  AccountOrdersTab,
  AccountOverviewTab,
  AccountSidebar,
  DeleteAddressConfirm,
  ReturnRequestModal,
  useAccountData,
  useAddressBook,
  useReturnRequest,
} from "@/components/pages/account";
import { getDisplayPhone } from "@/components/pages/account/account-utils";

/**
 * Customer account page: sidebar navigation with the overview, orders and
 * addresses tabs, plus the product review, return/exchange, address and
 * logout dialogs. Signed-out visitors get a login prompt.
 * (The storefront also passes `openContent`; this page does not use it.)
 */
export function AccountPage({
  currentUser,
  initialTab = "overview",
  onViewOrder,
  onLogout,
  navigate,
  openAuthModal,
  notify,
  returnExchangeEnabled = true,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedOrders, setExpandedOrders] = useState({});
  const [reviewModalData, setReviewModalData] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const { orders, setOrders, loadingOrders, addresses, setAddresses, loadingAddresses } =
    useAccountData(currentUser);
  const addressBook = useAddressBook({ currentUser, addresses, setAddresses, notify });
  const returnRequest = useReturnRequest({ currentUser, returnExchangeEnabled, setOrders, notify });

  // If user is not logged in, prompt to log in
  if (!currentUser) {
    return (
      <div className="account-page-wrapper page-width">
        <AccountLoggedOutCard onLogin={openAuthModal} />
      </div>
    );
  }

  const orderListProps = {
    expandedOrders,
    onToggleOrder: (orderId) => setExpandedOrders((current) => ({
      ...current,
      [orderId]: !current[orderId],
    })),
    onViewOrder,
    onReviewProduct: (item, order) => setReviewModalData({ item, order }),
    onRequestReturnExchange: returnRequest.open,
  };

  return (
    <div className="account-page-wrapper page-width">
      <div className="account-layout-grid">
        <AccountSidebar
          currentUser={currentUser}
          displayPhone={getDisplayPhone(currentUser)}
          orderCount={orders.length}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={() => setShowLogoutConfirm(true)}
        />

        <main className="account-main-content">
          {activeTab === "overview" && (
            <AccountOverviewTab
              orders={orders}
              loadingOrders={loadingOrders}
              addresses={addresses}
              loadingAddresses={loadingAddresses}
              orderListProps={orderListProps}
              onTabChange={setActiveTab}
              onShop={() => navigate("shop")}
              onAddAddress={addressBook.openAddAddress}
            />
          )}
          {activeTab === "orders" && (
            <AccountOrdersTab
              orders={orders}
              loading={loadingOrders}
              orderListProps={orderListProps}
              onShop={() => navigate("shop")}
            />
          )}
          {activeTab === "addresses" && (
            <AccountAddressesTab
              addresses={addresses}
              loading={loadingAddresses}
              currentUser={currentUser}
              addressBook={addressBook}
            />
          )}
        </main>
      </div>

      {/* Product Review Modal for Delivered Orders */}
      <ProductReviewModal
        isOpen={Boolean(reviewModalData)}
        onClose={() => setReviewModalData(null)}
        product={reviewModalData?.item}
        order={reviewModalData?.order}
        currentUser={currentUser}
        onSubmitted={() => {
          notify?.("Review submitted! Thank you for sharing your feedback.");
        }}
      />
      {returnRequest.request && (
        <ReturnRequestModal form={returnRequest} returnExchangeEnabled={returnExchangeEnabled} />
      )}
      <AccountLogoutConfirm
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onLogout?.();
        }}
      />
      <DeleteAddressConfirm
        address={addressBook.addressToDelete}
        loading={addressBook.deletingAddress}
        onClose={() => addressBook.setAddressToDelete(null)}
        onConfirm={addressBook.confirmDeleteAddress}
      />
    </div>
  );
}
