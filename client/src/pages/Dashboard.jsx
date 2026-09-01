import { useEffect, useState } from "react";
import {
  Package, ShoppingCart, Users, DollarSign,
  Layers, TrendingUp, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { dashboardService } from "../services/api";
import { formatCurrency, formatDateTime, getStatusBadgeClass } from "../utils/helpers";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const STATUS_COLORS = { confirmed: "#10b981", pending: "#f59e0b", cancelled: "#ef4444" };
const DONUT_COLORS = ["#10b981", "#f59e0b", "#ef4444"];

function StatCard({ icon: Icon, label, value, colorClass, trend, trendLabel }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClass}`}>
        <Icon size={22} />
      </div>
      <div className="stat-info">
        <p>{label}</p>
        <h3>{value}</h3>
        {trend !== undefined && (
          <div className={`stat-trend ${trend >= 0 ? "up" : "down"}`}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trendLabel}
          </div>
        )}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "1px solid var(--gray-200)", borderRadius: 8, padding: "10px 14px", boxShadow: "var(--shadow-md)", fontSize: 12 }}>
      <p style={{ fontWeight: 600, marginBottom: 6, color: "var(--gray-700)" }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.name === "Sales" ? formatCurrency(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

function buildMonthlySales(recentOrders) {
  const now = new Date();
  const data = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { month: MONTHS[d.getMonth()], Sales: 0, Orders: 0 };
  });
  recentOrders.forEach((o) => {
    const d = new Date(o.createdAt);
    const idx = data.findIndex((r) => r.month === MONTHS[d.getMonth()]);
    if (idx !== -1 && o.status === "confirmed") {
      data[idx].Sales += o.totalAmount;
      data[idx].Orders += 1;
    }
  });
  return data;
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

  const {
    totalProducts, totalOrders, totalCustomers,
    totalStock, totalSales, recentOrders, ordersByStatus,
  } = data;

  const monthlySales = buildMonthlySales(recentOrders);

  const donutData = [
    { name: "Confirmed", value: ordersByStatus?.confirmed || 0 },
    { name: "Pending", value: ordersByStatus?.pending || 0 },
    { name: "Cancelled", value: ordersByStatus?.cancelled || 0 },
  ];

  const categoryMap = {};
  recentOrders.forEach((o) =>
    o.items?.forEach((item) => {
      categoryMap[item.productName] = (categoryMap[item.productName] || 0) + item.quantity;
    })
  );
  const topProducts = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({ name, qty }));

  return (
    <div>
      <div className="stats-grid">
        <StatCard icon={Package} label="Total Products" value={totalProducts} colorClass="purple" trendLabel="Active items" trend={1} />
        <StatCard icon={ShoppingCart} label="Total Orders" value={totalOrders} colorClass="blue" trendLabel="All time" trend={1} />
        <StatCard icon={Users} label="Total Customers" value={totalCustomers} colorClass="orange" trendLabel="Registered" trend={1} />
        <StatCard icon={Layers} label="Total Stock" value={totalStock.toLocaleString()} colorClass="teal" trendLabel="Units available" trend={0} />
        <StatCard icon={DollarSign} label="Total Sales" value={formatCurrency(totalSales)} colorClass="green" trendLabel="Confirmed orders" trend={1} />
        <StatCard icon={TrendingUp} label="Confirmed" value={ordersByStatus?.confirmed || 0} colorClass="blue" trendLabel="of total orders" trend={1} />
      </div>

      <div className="dashboard-grid" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <h3>Revenue Overview</h3>
            <span className="badge badge-success">Last 6 months</span>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySales} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--gray-500)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--gray-500)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Sales" stroke="#4f46e5" strokeWidth={2.5} fill="url(#salesGrad)" dot={{ fill: "#4f46e5", r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Order Status</h3></div>
          <div className="card-body">
            <div style={{ position: "relative", height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <h4>{totalOrders}</h4>
                <p>Total</p>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              {donutData.map((d, i) => (
                <div key={d.name} className="legend-item">
                  <div className="legend-dot" style={{ background: DONUT_COLORS[i] }} />
                  {d.name}
                  <span className="legend-value">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-3">
        <div className="card">
          <div className="card-header"><h3>Monthly Orders</h3></div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <div className="chart-container" style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySales} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--gray-500)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--gray-500)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Orders" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Top Ordered Products</h3></div>
          <div className="card-body">
            {topProducts.length === 0 ? (
              <p className="text-muted text-sm text-center" style={{ padding: "20px 0" }}>No order data yet</p>
            ) : topProducts.map((p, i) => (
              <div key={p.name} className="top-product-row">
                <div className="top-product-rank">{i + 1}</div>
                <div className="top-product-info">
                  <div className="top-product-name">{p.name}</div>
                </div>
                <div className="top-product-stock">{p.qty} units</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Quick Stats</h3></div>
          <div className="card-body">
            {[
              { label: "Pending Orders", value: ordersByStatus?.pending || 0, color: "var(--warning)", bg: "var(--warning-light)" },
              { label: "Confirmed Orders", value: ordersByStatus?.confirmed || 0, color: "var(--success)", bg: "var(--success-light)" },
              { label: "Cancelled Orders", value: ordersByStatus?.cancelled || 0, color: "var(--danger)", bg: "var(--danger-light)" },
            ].map(({ label, value, color, bg }) => {
              const pct = totalOrders > 0 ? Math.round((value / totalOrders) * 100) : 0;
              return (
                <div key={label} style={{ marginBottom: 18 }}>
                  <div className="flex justify-between" style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color }}>{value} <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height: 8, background: "var(--gray-100)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent Orders</h3>
          <span className="badge badge-purple">Last 5 orders</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted" style={{ padding: 32 }}>No orders yet</td></tr>
              ) : recentOrders.map((order) => (
                <tr key={order._id}>
                  <td><span className="font-mono font-semibold">{order.orderNumber}</span></td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{order.customer?.name || "—"}</div>
                    <div className="text-sm text-muted">{order.customer?.email}</div>
                  </td>
                  <td>{order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}</td>
                  <td className="font-semibold">{formatCurrency(order.totalAmount)}</td>
                  <td><span className={getStatusBadgeClass(order.status)}>{order.status}</span></td>
                  <td className="text-muted">{formatDateTime(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
