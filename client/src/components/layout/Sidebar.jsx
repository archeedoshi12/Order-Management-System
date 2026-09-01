import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Products" },
  { to: "/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/customers", icon: Users, label: "Customers" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

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
      </nav>

      <div className="sidebar-footer">


        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}
