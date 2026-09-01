import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, ShoppingCart, Users, DollarSign,
  Layers, TrendingUp, ArrowUpRight, Clock, CheckCircle, XCircle,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { dashboardService } from "../services/api";
import { formatCurrency, formatDateTime, getStatusBadgeClass } from "../utils/helpers";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DONUT_COLORS = ["#10b981", "#f59e0b", "#ef4444"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "1px solid var(--gray-200)", borderRadius: 8, padding: "10px 14px", boxShadow: "var(--shadow-md)", fontSize: 12 }}>
      <p style={{ fontWeight: 600, marginBottom: 4, color: "var(--gray-700)" }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.name === "Sales" ? formatCurrency(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

function buildMonthlyData(orders) {
  const now = new Date();
  const data = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { month: MONTHS[d.getMonth()], Sales: 0, Orders: 0 };
  });
  orders.forEach((o) => {
    const idx = data.findIndex((r) => r.month === MONTHS[new Date(o.createdAt).getMonth()]);
    if (idx !== -1 && o.status === "confirmed") {
      data[idx].Sales += o.totalAmount;
      data[idx].Orders += 1;
    }
  });
  return data;
}

function KpiCard({ icon: Icon, label, value, colorClass, sub }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClass}`}><Icon size={21} /></div>
      <div className="stat-info">
        <p>{label}</p>
        <h3>{value}</h3>
        {sub && <div className="stat-trend up"><ArrowUpRight size={11} />{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    dashboardService.get().then((r) => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!data) return null;

  const { totalProducts, totalOrders, totalCustomers, totalStock, totalSales, recentOrders, ordersByStatus } = data;
  const monthlyData = buildMonthlyData(recentOrders);

  const donutData = [
    { name: "Confirmed", value: ordersByStatus?.confirmed || 0 },
    { name: "Pending",   value: ordersByStatus?.pending   || 0 },
    { name: "Cancelled", value: ordersByStatus?.cancelled || 0 },
  ];

  const topProducts = Object.entries(
    recentOrders.reduce((acc, o) => {
      o.items?.forEach((item) => { acc[item.productName] = (acc[item.productName] || 0) + item.quantity; });
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <KpiCard icon={Package}      label="Total Products"  value={totalProducts}              colorClass="purple" sub="In catalog" />
        <KpiCard icon={ShoppingCart} label="Total Orders"    value={totalOrders}                colorClass="blue"   sub="All time" />
        <KpiCard icon={Users}        label="Customers"       value={totalCustomers}             colorClass="orange" sub="Registered" />
        <KpiCard icon={Layers}       label="Total Stock"     value={totalStock.toLocaleString()} colorClass="teal"  sub="Units" />
        <KpiCard icon={DollarSign}   label="Total Sales"     value={formatCurrency(totalSales)} colorClass="green"  sub="Confirmed" />
        <KpiCard icon={TrendingUp}   label="Confirmed"       value={ordersByStatus?.confirmed || 0} colorClass="blue" sub="Orders" />
      </div>

      {/* Charts Row */}
      <div className="dashboard-grid" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <h3>Revenue Overview</h3>
            <span className="badge badge-success">Last 6 months</span>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.18} />
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
          <div className="card-header"><h3>Order Breakdown</h3></div>
          <div className="card-body">
            <div style={{ position: "relative", height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                    {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center"><h4>{totalOrders}</h4><p>Total</p></div>
            </div>
            <div style={{ marginTop: 14 }}>
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

      {/* Bottom Row */}
      <div className="dashboard-grid-3" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header"><h3>Monthly Orders</h3></div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <div className="chart-container" style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--gray-500)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--gray-500)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Top Products</h3></div>
          <div className="card-body">
            {topProducts.length === 0
              ? <p className="text-muted text-sm text-center" style={{ padding: "20px 0" }}>No data yet</p>
              : topProducts.map(([name, qty], i) => (
                <div key={name} className="top-product-row">
                  <div className="top-product-rank">{i + 1}</div>
                  <div className="top-product-info">
                    <div className="top-product-name">{name}</div>
                  </div>
                  <div className="top-product-stock">{qty} units</div>
                </div>
              ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Order Status</h3></div>
          <div className="card-body">
            {[
              { label: "Pending",   value: ordersByStatus?.pending   || 0, color: "var(--warning)", icon: Clock },
              { label: "Confirmed", value: ordersByStatus?.confirmed || 0, color: "var(--success)", icon: CheckCircle },
              { label: "Cancelled", value: ordersByStatus?.cancelled || 0, color: "var(--danger)",  icon: XCircle },
            ].map(({ label, value, color, icon: Icon }) => {
              const pct = totalOrders > 0 ? Math.round((value / totalOrders) * 100) : 0;
              return (
                <div key={label} style={{ marginBottom: 18 }}>
                  <div className="flex justify-between" style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon size={13} color={color} />{label}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color }}>{value} <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height: 7, background: "var(--gray-100)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-header">
          <h3>Recent Orders</h3>
          <span className="badge badge-purple">Last 5</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order #</th><th>Customer</th><th>Items</th><th>Amount</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0
                ? <tr><td colSpan={6} className="text-center text-muted" style={{ padding: 32 }}>No orders yet</td></tr>
                : recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td><span className="font-mono font-semibold">{o.orderNumber}</span></td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{o.customer?.name || "—"}</div>
                      <div className="text-sm text-muted">{o.customer?.email}</div>
                    </td>
                    <td>{o.items?.length || 0} item{o.items?.length !== 1 ? "s" : ""}</td>
                    <td className="font-semibold">{formatCurrency(o.totalAmount)}</td>
                    <td><span className={getStatusBadgeClass(o.status)}>{o.status}</span></td>
                    <td className="text-muted">{formatDateTime(o.createdAt)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
