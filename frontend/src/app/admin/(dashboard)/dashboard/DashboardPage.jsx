import { ChevronRight } from "lucide-react";
import { PageStats } from "@/components/admin/global";
import {
  DashboardPanel,
  InventoryAlert,
  SalesByCategory,
  SalesPerformanceChart,
} from "@/components/admin/dashboard";
import { OrderTable } from "@/components/admin/tables";

export default function DashboardPage({ dashboard = {}, stats = {}, onNavigate, onRefresh }) {
  const activeProductCount = stats.activeProducts ?? 0;

  return <>
    <PageStats page="Dashboard" stats={stats} onNavigate={onNavigate} />
    <section className="dashboard-grid" aria-label="Store dashboard">
      <SalesPerformanceChart dailyRevenue={dashboard.dailyRevenue} />
      <SalesByCategory dashboard={dashboard} />
      <DashboardPanel title="Recent orders" description="Latest customer purchases" className="recent" action={<button type="button" className="text-button" onClick={() => onNavigate?.("Orders")}>View all <ChevronRight size={15} /></button>}>
        <OrderTable rows={dashboard.recentOrders || []} compact pageSize={7} onStatus={onRefresh} />
      </DashboardPanel>
      <InventoryAlert products={dashboard.lowStockProducts || []} activeProductCount={activeProductCount} onViewAll={() => onNavigate?.("Low Stock")} />
    </section>
  </>;
}
