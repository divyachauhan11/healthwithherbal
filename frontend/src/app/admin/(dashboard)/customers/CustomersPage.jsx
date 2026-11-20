"use client";

import { SearchField } from "@/components/admin/global";
import { CustomerTable } from "@/components/admin/tables";
import { useCustomerAccounts } from "@/components/admin/customers";
import CustomerDetailsModal from "./CustomerDetailsModal";

/**
 * Customers page: searchable customer table with account suspension and a details dialog.
 */
export default function CustomersPage({ rows, query, setQuery, token, onRefresh }) {
  const { selectedCustomer, setSelectedCustomer, updateCustomerStatus } = useCustomerAccounts({ token, onRefresh });

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
