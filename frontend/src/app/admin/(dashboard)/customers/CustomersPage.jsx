"use client";

import { useState } from "react";
import { SearchField } from "@/components/admin/global";
import { CustomerTable } from "@/components/admin/tables";
import { setAdminCustomerActive } from "@/lib/admin-api";
import CustomerDetailsModal from "./CustomerDetailsModal";

export default function CustomersPage({ rows, query, setQuery, token, onRefresh }) {
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const updateCustomerStatus = async (customer) => {
    const isActive = customer.isActive === false;
    if (!isActive && !window.confirm(`Suspend ${customer.name || customer.email}? They will no longer be able to sign in.`)) return;

    try {
      await setAdminCustomerActive(customer.email, isActive, token);
      onRefresh?.();
    } catch (error) {
      window.alert(error.message || "Could not update the customer account.");
    }
  };

  return (
    <section className="panel page-panel">
      <div className="page-tools">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search customers"
        />
      </div>
      <CustomerTable
        rows={rows}
        onView={setSelectedCustomer}
        onSuspend={updateCustomerStatus}
      />
      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          token={token}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </section>
  );
}
