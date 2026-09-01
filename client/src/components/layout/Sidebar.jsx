import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3 } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Products" },
  { to: "/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/customers", icon: Users, label: "Customers" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <BarChart3 size={20} color="white" />
        </div>
        <div>
          <h1>InventoryPro</h1>
          <span>Management System</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
