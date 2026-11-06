import { SearchField } from "../../../../components/admin/global";
import { OrderTable } from "../../../../components/admin/custom";
export default function OrdersPage({ rows, query, setQuery, onRefresh }) {
  return (
    <section className="panel page-panel">
      <div className="page-tools">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search order, customer or email"
        />
      </div>
      <OrderTable rows={rows} onStatus={onRefresh} />
    </section>
  );
}
