import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart,
  Users, BarChart3, Settings,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Products" },
  { to: "/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/customers", icon: Users, label: "Customers" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <BarChart3 size={20} color="white" />
        </div>
        <div className="sidebar-logo-text">
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
            <Icon size={17} />
            {label}
          </NavLink>
        ))}

        <div className="nav-section-label" style={{ marginTop: 20 }}>System</div>
        <div className="nav-item" style={{ cursor: "default", opacity: 0.5 }}>
          <Settings size={17} />
          Settings
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-user">
          <div className="sidebar-footer-avatar">A</div>
          <div className="sidebar-footer-info">
            <div className="sidebar-footer-name">Admin User</div>
            <div className="sidebar-footer-role">Administrator</div>
          </div>
          <div className="sidebar-footer-dot" title="Online" />
        </div>
      </div>
    </aside>
  );
}
