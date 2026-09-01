import { useLocation } from "react-router-dom";

const titles = {
  "/": { title: "Dashboard", subtitle: "Overview of your business" },
  "/products": { title: "Products", subtitle: "Manage your product inventory" },
  "/orders": { title: "Orders", subtitle: "Track and manage customer orders" },
  "/customers": { title: "Customers", subtitle: "Manage your customer base" },
};

export default function Topbar() {
  const location = useLocation();
  const path = location.pathname;
  const info = titles[path] || { title: "InventoryPro", subtitle: "" };

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h2>{info.title}</h2>
        {info.subtitle && <p>{info.subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-800)" }}>Admin</div>
          <div style={{ fontSize: 11, color: "var(--gray-500)" }}>Administrator</div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "var(--primary)", color: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 14
        }}>A</div>
      </div>
    </header>
  );
}
