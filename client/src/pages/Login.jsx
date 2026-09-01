import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Eye, EyeOff, Lock, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const ok = login(form.email, form.password);
    setLoading(false);
    if (ok) {
      toast.success("Welcome back, Admin!");
      navigate("/");
    } else {
      toast.error("Invalid email or password");
      setErrors({ password: "Invalid email or password" });
    }
  };

  const fillDemo = () => setForm({ email: "admin@inventorypro.com", password: "admin123" });

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: "linear-gradient(135deg, #818cf8, #6366f1)",
            borderRadius: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(99,102,241,0.5)",
          }}>
            <BarChart3 size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "white", marginBottom: 6, letterSpacing: "-0.5px" }}>
            InventoryPro
          </h1>
          <p style={{ fontSize: 13, color: "#a5b4fc" }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{
          background: "white",
          borderRadius: 16,
          padding: "32px 32px 28px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}>
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address <span>*</span></label>
              <div style={{ position: "relative" }}>
                <User size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                <input
                  type="email"
                  className={`form-control ${errors.email ? "error" : ""}`}
                  style={{ paddingLeft: 36 }}
                  value={form.email}
                  onChange={set("email")}
                  placeholder="admin@inventorypro.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Password <span>*</span></label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-control ${errors.password ? "error" : ""}`}
                  style={{ paddingLeft: 36, paddingRight: 40 }}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--gray-400)", cursor: "pointer", padding: 4 }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", padding: "11px 16px", fontSize: 14, borderRadius: 8 }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Demo hint */}
          <div style={{
            marginTop: 20,
            padding: "12px 14px",
            background: "var(--primary-light)",
            borderRadius: 8,
            border: "1px solid #c7d2fe",
          }}>
            <button
              type="button"
              onClick={fillDemo}
              style={{ marginTop: 8, fontSize: 11, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0, textDecoration: "underline" }}
            >
              Fill credentials
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#6366f1" }}>
          InventoryPro © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
