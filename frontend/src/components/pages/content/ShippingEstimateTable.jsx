import { DataTable } from "@/components/admin/tables";

/**
 * Delivery estimate table of the shipping policy.
 * @param {object} props
 * @param {Array<[string, string]>} props.destinations `[destination, estimate]` rows.
 */
export function ShippingEstimateTable({ destinations }) {
  return (
    <div className="shipping-estimate-table-wrap">
      <DataTable
        data={destinations.map(([destination, estimate]) => ({
          destination,
          estimate,
        }))}
        rowKey="destination"
        pagination={false}
        tableClassName="shipping-estimate-table"
        columns={[
          { key: "destination", label: "Destination" },
          { key: "estimate", label: "General estimate" },
        ]}
      />
    </div>
  );
}
