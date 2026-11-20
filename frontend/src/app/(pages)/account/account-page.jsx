"use client";
import { useEffect, useState } from "react";
import {
  ShoppingBag,
  MapPin,
  Package,
  Plus,
  Printer,
} from "lucide-react";
import {
  fetchUserOrders,
  fetchUserAddresses,
  saveUserAddress,
  updateUserAddress,
  deleteUserAddress,
  submitReturnExchangeRequest,
  uploadReturnExchangePhotos,
} from "@/lib/api";
import { ProductReviewModal, ConfirmModal } from "@/components/pages/modals";
import {
  AccountAddressCard,
  AccountLoadingState,
  AccountPageHeader,
  AccountSection,
  AccountSidebar,
  AddressPreviewCard,
  NoSavedAddresses,
  OrderCard,
} from "@/components/pages/account";
import { FormModal } from "../../../components/admin/global/FormModal";
import {
  ORDER_STATUSES,
  RETURN_EXCHANGE_STATUSES,
  RETURN_EXCHANGE_TYPES,
} from "@/constants/statuses";

export function AccountPage({
  currentUser,
  initialTab = "overview",
  onViewOrder,
  onLogout,
  navigate,
  openContent,
  openAuthModal,
  notify,
  returnExchangeEnabled = true,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [reviewModalData, setReviewModalData] = useState(null);
  const [returnRequestData, setReturnRequestData] = useState(null);
  const [returnRequestType, setReturnRequestType] = useState(RETURN_EXCHANGE_TYPES[0]);
  const [returnRequestQuantity, setReturnRequestQuantity] = useState(1);
  const [returnRequestReason, setReturnRequestReason] = useState("");
  const [savingReturnRequest, setSavingReturnRequest] = useState(false);
  const [returnRequestPhotos, setReturnRequestPhotos] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [deletingAddress, setDeletingAddress] = useState(false);

  const sendReturnRequest = async (event) => {
    event.preventDefault();
    if (!returnRequestData) return;
    setSavingReturnRequest(true);
    try {
      const photoUrls = returnRequestPhotos.length
        ? await uploadReturnExchangePhotos(returnRequestPhotos)
        : [];
      const orderNumber = returnRequestData.order.orderNumber;
      const itemTitle = returnRequestData.item.title;
      if (returnExchangeEnabled) {
        const result = await submitReturnExchangeRequest({
          orderNumber,
          email: currentUser?.email || returnRequestData.order.customer?.email,
          itemIndex: returnRequestData.itemIndex,
          quantity: Number(returnRequestQuantity),
          type: returnRequestType,
          reason: returnRequestReason,
          photoUrls,
        });
        if (result.request) {
          setOrders((current) => current.map((order) => order.orderNumber === orderNumber
            ? { ...order, returnExchangeRequests: [...(order.returnExchangeRequests || []), result.request] }
            : order));
        }
        notify?.("Your request has been submitted for review.");
      } else {
        const subject = `${returnRequestType === RETURN_EXCHANGE_TYPES[0] ? "Return" : "Exchange"} request for order ${orderNumber}`;
        const body = `Hello,\n\nI would like to request a ${returnRequestType}.\nOrder: ${orderNumber}\nItem: ${itemTitle}\nQuantity: ${returnRequestQuantity}\nReason: ${returnRequestReason || "Not provided"}\n${photoUrls.length ? `Photo links:\n${photoUrls.join("\n")}\n` : ""}\nPlease let me know the next steps.`;
        window.location.href = `mailto:healthwithherbalindia@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }
      setReturnRequestData(null);
      setReturnRequestReason("");
      setReturnRequestPhotos([]);
    } catch (error) {
      notify?.(error.message);
    } finally {
      setSavingReturnRequest(false);
    }
  };

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Address modal state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setShowAddAddress(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddress(addr);
    setShowAddAddress(true);
  };

  // Load orders and addresses whenever currentUser changes
  useEffect(() => {
    if (!currentUser) return;

    let active = true;
    setLoadingOrders(true);
    setLoadingAddresses(true);

    const query = {
      phone: currentUser.phone || "",
      email: currentUser.email || "",
      userId: currentUser._id || "",
    };

    fetchUserOrders(query)
      .then((data) => {
        if (active) setOrders(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load user orders:", err);
      })
      .finally(() => {
        if (active) setLoadingOrders(false);
      });

    fetchUserAddresses(query)
      .then((data) => {
        if (active) setAddresses(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load user addresses:", err);
      })
      .finally(() => {
        if (active) setLoadingAddresses(false);
      });

    return () => {
      active = false;
    };
  }, [currentUser?.phone, currentUser?.email, currentUser?._id]);

  // Real-time synchronization for order status updates from admin
  useEffect(() => {
    let bc = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel("hwh_order_status");
        bc.onmessage = (e) => {
          const { id, status } = e.data || {};
          if (id && status) {
            setOrders((prev) =>
              prev.map((o) =>
                o._id === id || o.orderNumber === id ? { ...o, status } : o,
              ),
            );
          }
        };
      }
    } catch {}

    const handleStorage = (e) => {
      if (e.key === "hwh_order_status_update" && e.newValue) {
        try {
          const { id, status } = JSON.parse(e.newValue);
          if (id && status) {
            setOrders((prev) =>
              prev.map((o) =>
                o._id === id || o.orderNumber === id ? { ...o, status } : o,
              ),
            );
          }
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      bc?.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Handle saving new or updated address via modal
  const handleSaveAddress = async (formData) => {
    if (
      !formData.fullName?.trim() ||
      !formData.line1?.trim() ||
      !formData.city?.trim() ||
      !formData.postalCode?.trim()
    ) {
      if (notify) notify("Please fill all required address fields.");
      return;
    }

    setSavingAddress(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone?.trim() || currentUser?.phone || "",
        line1: formData.line1.trim(),
        line2: formData.line2?.trim() || "",
        city: formData.city.trim(),
        state: formData.state?.trim() || "",
        postalCode: formData.postalCode.trim(),
        country: formData.country?.trim() || "India",
        tag: formData.tag || "Home",
        isDefault: Boolean(formData.isDefault),
        userPhone: currentUser?.phone || formData.phone || "",
        userEmail: currentUser?.email || "",
        userId: currentUser?._id || null,
      };

      if (editingAddress?._id) {
        const updated = await updateUserAddress(editingAddress._id, payload);
        setAddresses((prev) =>
          prev.map((a) => (a._id === updated._id ? updated : a)),
        );
        if (notify) notify("Address updated successfully!");
      } else {
        const newAddr = await saveUserAddress({
          ...payload,
          isDefault: payload.isDefault ?? addresses.length === 0,
        });
        setAddresses((prev) => [newAddr, ...prev]);
        if (notify) notify("Address saved successfully!");
      }

      setShowAddAddress(false);
      setEditingAddress(null);
    } catch (err) {
      if (notify) notify(err.message || "Failed to save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  // Handle delete address
  const handleDeleteAddress = async (id) => {
    try {
      await deleteUserAddress(id);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      if (notify) notify("Address removed.");
    } catch (err) {
      if (notify) notify(err.message || "Could not delete address.");
    }
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete?._id) return;
    setDeletingAddress(true);
    try {
      await handleDeleteAddress(addressToDelete._id);
      setAddressToDelete(null);
    } finally {
      setDeletingAddress(false);
    }
  };

  // If user is not logged in, prompt to log in
  if (!currentUser) {
    return (
      <div className="account-page-wrapper page-width">
        <div className="account-logged-out-card">
          <div className="account-avatar-placeholder">
            <ShoppingBag size={32} />
          </div>
          <h2>Please Log In</h2>
          <p>Sign in to view your orders, addresses, and account details.</p>
          <button
            type="button"
            className="app-button"
            style={{ marginTop: "16px", minWidth: "200px" }}
            onClick={openAuthModal}
          >
            Log In or Sign Up
          </button>
        </div>
      </div>
    );
  }

  const cleanPhone = (currentUser.phone || "").replace(/\D/g, "").slice(-10);
  const displayPhone = cleanPhone ? `+91 ${cleanPhone}` : currentUser.email;
  return (
    <div className="account-page-wrapper page-width">
      <div className="account-layout-grid">
        {/* ================================================================= */}
        {/* LEFT SIDEBAR                                                      */}
        {/* ================================================================= */}
        <AccountSidebar
          currentUser={currentUser}
          displayPhone={displayPhone}
          orderCount={orders.length}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={() => setShowLogoutConfirm(true)}
        />

        {/* ================================================================= */}
        {/* RIGHT MAIN CONTENT AREA                                           */}
        {/* ================================================================= */}
        <main className="account-main-content">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="account-tab-content">
              <AccountPageHeader title="Overview" />

              {/* SECTION: My Orders Overview */}
              <AccountSection
                title="My Orders"
                actionLabel={orders.length > 0 ? `View All (${orders.length}) →` : undefined}
                onAction={() => setActiveTab("orders")}
              >
                {loadingOrders ? (
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
                    onAddAddress={() => navigate("shop")}
                  />
                ) : (
                  <div className="account-orders-preview-list">
                    {orders.slice(0, 2).map((order) => (
                      <OrderCard
                        key={order._id}
                        order={order}
                        orderStatuses={ORDER_STATUSES}
                        returnExchangeStatuses={RETURN_EXCHANGE_STATUSES}
                        returnExchangeTypes={RETURN_EXCHANGE_TYPES}
                        isExpanded={Boolean(expandedOrders[order._id])}
                        onToggle={() => setExpandedOrders((current) => ({
                          ...current,
                          [order._id]: !current[order._id],
                        }))}
                        onViewOrder={onViewOrder}
                        onReviewProduct={(item, selectedOrder) =>
                          setReviewModalData({ item, order: selectedOrder })
                        }
                        onRequestReturnExchange={(item, selectedOrder, itemIndex) => {
                          setReturnRequestData({ item, order: selectedOrder, itemIndex });
                          setReturnRequestQuantity(1);
                          setReturnRequestType(RETURN_EXCHANGE_TYPES[0]);
                          setReturnRequestReason("");
                          setReturnRequestPhotos([]);
                        }}
                      />
                    ))}
                  </div>
                )}
              </AccountSection>

              {/* SECTION: Saved Addresses Overview */}
              <AccountSection
                title="Saved Addresses"
                actionLabel={addresses.length > 0 ? `Manage (${addresses.length}) →` : undefined}
                onAction={() => setActiveTab("addresses")}
                style={{ marginTop: "32px" }}
              >
                {loadingAddresses ? (
                  <AccountLoadingState message="Loading saved addresses..." size={24} />
                ) : addresses.length === 0 ? (
                  <NoSavedAddresses
                    title="No Address Saved Yet"
                    description="Tap to add and shop faster"
                    actionLabel="Add New Address Now"
                    inlineAction
                    style={{}}
                    onAddAddress={() => {
                      setActiveTab("addresses");
                      handleOpenAddAddress();
                    }}
                  />
                ) : (
                  <AddressPreviewCard address={addresses[0]} />
                )}
              </AccountSection>
            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === "orders" && (
            <div className="account-tab-content">
              <AccountPageHeader
                title="My Orders"
                description="Showing all orders placed from your verified account."
              />

              {loadingOrders ? (
                <AccountLoadingState message="Loading order history from database..." />
              ) : orders.length === 0 ? (
                <NoSavedAddresses
                  title="No Orders Found"
                  description="You haven’t placed any orders yet. Discover our pure Ayurvedic remedies today."
                  actionLabel="Start Shopping"
                  Icon={Package}
                  actionIcon={null}
                  iconWrapperClassName="mock-box-3d"
                  onAddAddress={() => navigate("shop")}
                />
              ) : (
                <div className="account-orders-full-list">
                  {orders.map((order) => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      orderStatuses={ORDER_STATUSES}
                      returnExchangeStatuses={RETURN_EXCHANGE_STATUSES}
                      returnExchangeTypes={RETURN_EXCHANGE_TYPES}
                      isExpanded={Boolean(expandedOrders[order._id])}
                      onToggle={() => setExpandedOrders((current) => ({
                        ...current,
                        [order._id]: !current[order._id],
                      }))}
                      onViewOrder={onViewOrder}
                      onReviewProduct={(item, selectedOrder) =>
                        setReviewModalData({ item, order: selectedOrder })
                      }
                      onRequestReturnExchange={(item, selectedOrder, itemIndex) => {
                        setReturnRequestData({ item, order: selectedOrder, itemIndex });
                        setReturnRequestQuantity(1);
                        setReturnRequestType(RETURN_EXCHANGE_TYPES[0]);
                        setReturnRequestReason("");
                        setReturnRequestPhotos([]);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="account-tab-content">
              <AccountPageHeader
                title="My Addresses"
                description="Manage your delivery addresses for seamless checkout."
              >
                <button
                  type="button"
                  className="app-button add-address-btn"
                  onClick={handleOpenAddAddress}
                >
                  <Plus size={16} /> Add New Address
                </button>
              </AccountPageHeader>

              {/* Addresses List */}
              {loadingAddresses ? (
                <AccountLoadingState message="Loading saved addresses from database..." />
              ) : addresses.length === 0 ? (
                <NoSavedAddresses onAddAddress={handleOpenAddAddress} />
              ) : (
                <div className="account-addresses-grid">
                  {addresses.map((addr) => (
                    <AccountAddressCard
                      key={addr._id}
                      address={addr}
                      onEdit={handleOpenEditAddress}
                      onDelete={setAddressToDelete}
                    />
                  ))}
                </div>
              )}

              {/* Add / Edit Address Pop-up Modal (Powered by FormModal & Modal) */}
              <FormModal
                entity="address"
                isOpen={showAddAddress}
                initial={
                  editingAddress || {
                    fullName: currentUser?.name || "",
                    phone: currentUser?.phone || "",
                    country: "India",
                    tag: "Home",
                    isDefault: addresses.length === 0,
                  }
                }
                onSave={handleSaveAddress}
                onClose={() => {
                  setShowAddAddress(false);
                  setEditingAddress(null);
                }}
                busy={savingAddress}
                submitLabel={editingAddress ? "Save Changes" : "Save Address"}
                className="checkout-address-form-modal address-modal-popup"
              />
            </div>
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
      {returnRequestData && (
        <div
          className="return-request-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget && !savingReturnRequest)
              setReturnRequestData(null);
          }}
        >
          <form className="return-request-modal" onSubmit={sendReturnRequest}>
            <div className="return-request-heading">
              <div>
                <span>ORDER {returnRequestData.order.orderNumber}</span>
                <h2>Return or exchange</h2>
              </div>
              <button type="button" onClick={() => setReturnRequestData(null)} aria-label="Close request form">×</button>
            </div>
            <p className="return-request-product">
              {returnExchangeEnabled
                ? "Submit your request for review by our care team."
                : "Your email app will open with your request. Photo links will be included."}
            </p>
            <p className="return-request-product">
              {returnRequestData.item.title} · Ordered quantity {returnRequestData.item.quantity}
            </p>
            <label>Request type
              <select value={returnRequestType} onChange={(event) => setReturnRequestType(event.target.value)}>
                <option value={RETURN_EXCHANGE_TYPES[0]}>Return</option><option value={RETURN_EXCHANGE_TYPES[1]}>Exchange</option>
              </select>
            </label>
            <label>Quantity
              <select value={returnRequestQuantity} onChange={(event) => setReturnRequestQuantity(event.target.value)}>
                {Array.from({ length: returnRequestData.item.quantity }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
              </select>
            </label>
            <label>Reason
              <textarea required minLength={5} maxLength={1000} rows={4} value={returnRequestReason} onChange={(event) => setReturnRequestReason(event.target.value)} placeholder="Tell us why you are requesting a return or exchange" />
            </label>
            <label className="return-request-photo-field">Photos (optional, up to 4)
              <input type="file" accept="image/*" multiple disabled={savingReturnRequest} onChange={(event) => {
                const nextFiles = Array.from(event.target.files || []);
                if (nextFiles.some((file) => file.size > 5 * 1024 * 1024)) {
                  notify?.("Each photo must be 5 MB or smaller.");
                  event.target.value = "";
                  return;
                }
                setReturnRequestPhotos((current) => [...current, ...nextFiles].slice(0, 4));
                event.target.value = "";
              }} />
              <small>Add photos of the item or issue. JPG, PNG, or WebP; 5 MB max each.</small>
            </label>
            {returnRequestPhotos.length > 0 && <div className="return-request-photo-list">{returnRequestPhotos.map((photo, index) => (
              <div key={`${photo.name}-${photo.lastModified}`}><span>{photo.name}</span><button type="button" disabled={savingReturnRequest} onClick={() => setReturnRequestPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))} aria-label={`Remove ${photo.name}`}>Remove</button></div>
            ))}</div>}
            <footer>
              <button type="button" onClick={() => setReturnRequestData(null)} disabled={savingReturnRequest}>Cancel</button>
              <button type="submit" disabled={savingReturnRequest}>{savingReturnRequest ? "Uploading…" : returnExchangeEnabled ? "Submit request" : "Continue to email"}</button>
            </footer>
          </form>
        </div>
      )}
      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onLogout?.();
        }}
        title="Log Out?"
        message="Are you sure you want to log out of your account?"
        confirmLabel="Log Out"
        variant="warning"
      />

      {/* Delete Address Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(addressToDelete)}
        onClose={() => setAddressToDelete(null)}
        onConfirm={confirmDeleteAddress}
        loading={deletingAddress}
        title="Delete Address?"
        message={`Are you sure you want to remove the saved address for ${addressToDelete?.fullName || "this recipient"}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
