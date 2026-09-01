import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || "Admin User", email: user?.email || "admin@inventorypro.com", phone: user?.phone || "+1 (555) 000-0000" });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setField = (field) => (e) => {
    setProfile((p) => ({ ...p, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: "" }));
  };

  const setPwd = (field) => (e) => {
    setPasswords((p) => ({ ...p, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: "" }));
  };

  const validateProfile = () => {
    const e = {};
    if (!profile.name.trim()) e.name = "Name is required";
    if (!profile.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) e.email = "Valid email required";
    return e;
  };

  const validatePassword = () => {
    const e = {};
    if (passwords.newPass && !passwords.current) e.current = "Current password is required";
    if (passwords.newPass && passwords.newPass.length < 6) e.newPass = "Minimum 6 characters";
    if (passwords.newPass && passwords.newPass !== passwords.confirm) e.confirm = "Passwords do not match";
    return e;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const profileErrors = validateProfile();
    const pwdErrors = validatePassword();
    const allErrors = { ...profileErrors, ...pwdErrors };
    if (Object.keys(allErrors).length) return setErrors(allErrors);

    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    updateUser({ name: profile.name, email: profile.email, phone: profile.phone });
    setSaving(false);
    toast.success("Profile updated successfully");
    navigate("/");
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-900)" }}>Edit Profile</h2>
          <p style={{ fontSize: 12, color: "var(--gray-500)" }}>Update your account information</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* Avatar Section */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 16,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 700, color: "white", flexShrink: 0,
            }}>
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--gray-900)" }}>{profile.name}</div>
              <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 2 }}>{profile.email}</div>
              <span className="badge badge-success" style={{ marginTop: 8 }}>Administrator</span>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <User size={16} color="var(--primary)" /> Personal Information
            </h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name <span>*</span></label>
                <input
                  className={`form-control ${errors.name ? "error" : ""}`}
                  value={profile.name}
                  onChange={setField("name")}
                  placeholder="Your full name"
                />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  className="form-control"
                  value={profile.phone}
                  onChange={setField("phone")}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address <span>*</span></label>
              <input
                type="email"
                className={`form-control ${errors.email ? "error" : ""}`}
                value={profile.email}
                onChange={setField("email")}
                placeholder="admin@example.com"
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Lock size={16} color="var(--primary)" /> Change Password
            </h3>
            <span style={{ fontSize: 12, color: "var(--gray-400)" }}>Leave blank to keep current password</span>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className={`form-control ${errors.current ? "error" : ""}`}
                value={passwords.current}
                onChange={setPwd("current")}
                placeholder="Enter current password"
              />
              {errors.current && <p className="form-error">{errors.current}</p>}
            </div>
            <div className="form-grid">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className={`form-control ${errors.newPass ? "error" : ""}`}
                  value={passwords.newPass}
                  onChange={setPwd("newPass")}
                  placeholder="Min. 6 characters"
                />
                {errors.newPass && <p className="form-error">{errors.newPass}</p>}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className={`form-control ${errors.confirm ? "error" : ""}`}
                  value={passwords.confirm}
                  onChange={setPwd("confirm")}
                  placeholder="Repeat new password"
                />
                {errors.confirm && <p className="form-error">{errors.confirm}</p>}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={14} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
