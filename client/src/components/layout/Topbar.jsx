import { useLocation } from "react-router-dom";

const titles = {
  "/": { title: "Dashboard", subtitle: "Welcome back — here's what's happening today" },
  "/products": { title: "Products", subtitle: "Manage your product inventory" },
  "/orders": { title: "Orders", subtitle: "Track and manage customer orders" },
  "/customers": { title: "Customers", subtitle: "Manage your customer base" },
};

export default function Topbar() {
  const info = titles[useLocation().pathname] || { title: "InventoryPro", subtitle: "" };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-title">
          <h2>{info.title}</h2>
          {info.subtitle && <p>{info.subtitle}</p>}
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-divider" />
        <div className="topbar-user">
          <div className="topbar-user-name">Admin User</div>
          <div className="topbar-user-role">Administrator</div>
        </div>
        <div className="topbar-avatar">A</div>
      </div>
    </header>
  );
}
