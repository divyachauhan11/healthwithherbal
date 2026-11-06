import { SearchField } from "../../../../components/admin/global";
import { CustomerTable } from "../../../../components/admin/custom";
export default function CustomersPage({ rows, query, setQuery }) {
  return (
    <section className="panel page-panel">
      <div className="page-tools">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search customers"
        />
      </div>
      <CustomerTable rows={rows} />
    </section>
  );
}
