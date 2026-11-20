"use client";

import {
  CustomerAddressesSection,
  CustomerDetailStats,
  CustomerDetailsHeader,
  CustomerDetailsState,
  CustomerOrdersSection,
  CustomerProfileCard,
  useCustomerDetails,
} from "@/components/admin/customers";

/**
 * Customer details dialog: profile, saved addresses, order stats and every order with
 * its payment records. Closes on Escape or a backdrop press.
 */
export default function CustomerDetailsModal({ customer: listCustomer, token, onClose }) {
  const { account, orders, addresses, totalSpent, loading, error } = useCustomerDetails({
    customer: listCustomer,
    token,
    onClose,
  });

  return (
    <div className="customer-details-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="customer-details-modal" role="dialog" aria-modal="true" aria-label={`Customer details for ${account?.name || account?.email}`}>
        <CustomerDetailsHeader name={account?.name} onClose={onClose} />

        {loading ? (
          <CustomerDetailsState>Loading customer details…</CustomerDetailsState>
        ) : error ? (
          <div className="customer-details-error" role="alert">{error}</div>
        ) : (
          <div className="customer-details-content">
            <CustomerProfileCard account={account} />

            {(account.hasAccount || addresses.length > 0) && (
              <CustomerAddressesSection account={account} addresses={addresses} />
            )}

            <CustomerDetailStats orders={orders} totalSpent={totalSpent} />

            <CustomerOrdersSection orders={orders} />
          </div>
        )}
      </section>
    </div>
  );
}
