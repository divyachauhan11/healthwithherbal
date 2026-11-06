import { SearchField } from "../../../../components/admin/global";
import { UserTable } from "../../../../components/admin/custom";
export default function UsersPage({ rows = [], query, setQuery }) {
  const adminRows = rows.filter((r) => r.role === "admin");

  return (
    <section className="panel page-panel">
      <div className="page-tools">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search admin users"
        />
        <p className="section-intro">
          Administrator accounts with portal access.
        </p>
      </div>
      <UserTable rows={adminRows} />
    </section>
  );
}
