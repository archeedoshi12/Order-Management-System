import { useEffect, useState } from "react";
import { Package, ShoppingCart, Users, DollarSign, Layers, TrendingUp } from "lucide-react";
import { dashboardService } from "../services/api";
import { formatCurrency, formatDateTime, getStatusBadgeClass } from "../utils/helpers";

function StatCard({ icon: Icon, label, value, colorClass }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClass}`}>
        <Icon size={22} />
      </div>
      <div className="stat-info">
        <p>{label}</p>
        <h3>{value}</h3>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.get()
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!data) return null;

  const { totalProducts, totalOrders, totalCustomers, totalStock, totalSales, recentOrders, ordersByStatus } = data;

  return (
    <div>
      <div className="stats-grid">
        <StatCard icon={Package} label="Total Products" value={totalProducts} colorClass="purple" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={totalOrders} colorClass="blue" />
        <StatCard icon={Users} label="Total Customers" value={totalCustomers} colorClass="orange" />
        <StatCard icon={Layers} label="Total Stock" value={totalStock.toLocaleString()} colorClass="green" />
        <StatCard icon={DollarSign} label="Total Sales" value={formatCurrency(totalSales)} colorClass="green" />
        <StatCard icon={TrendingUp} label="Confirmed Orders" value={ordersByStatus?.confirmed || 0} colorClass="blue" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <h3>Recent Orders</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-muted" style={{ padding: 32 }}>No orders yet</td></tr>
                ) : recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td><span className="font-mono">{order.orderNumber}</span></td>
                    <td>{order.customer?.name || "—"}</td>
                    <td className="font-semibold">{formatCurrency(order.totalAmount)}</td>
                    <td><span className={getStatusBadgeClass(order.status)}>{order.status}</span></td>
                    <td className="text-muted">{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Order Status</h3></div>
          <div className="card-body">
            {[
              { key: "pending", label: "Pending", color: "var(--warning)" },
              { key: "confirmed", label: "Confirmed", color: "var(--success)" },
              { key: "cancelled", label: "Cancelled", color: "var(--danger)" },
            ].map(({ key, label, color }) => {
              const count = ordersByStatus?.[key] || 0;
              const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
              return (
                <div key={key} style={{ marginBottom: 20 }}>
                  <div className="flex justify-between mb-1" style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 13, color: "var(--gray-500)" }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 8, background: "var(--gray-100)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
