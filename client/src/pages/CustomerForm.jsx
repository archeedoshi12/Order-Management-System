import { useState, useEffect } from "react";
import Modal from "../components/common/Modal";

const initialState = { name: "", email: "", phone: "", address: "" };

export default function CustomerForm({ isOpen, onClose, onSubmit, customer, loading }) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer) {
      setForm({ name: customer.name, email: customer.email, phone: customer.phone || "", address: customer.address || "" });
    } else {
      setForm(initialState);
    }
    setErrors({});
  }, [customer, isOpen]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    onSubmit(form);
  };

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: "" }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={customer ? "Edit Customer" : "Add Customer"}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Name <span>*</span></label>
              <input className={`form-control ${errors.name ? "error" : ""}`} value={form.name} onChange={set("name")} placeholder="Full name" />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Email <span>*</span></label>
              <input type="email" className={`form-control ${errors.email ? "error" : ""}`} value={form.email} onChange={set("email")} placeholder="email@example.com" />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-control" value={form.address} onChange={set("address")} placeholder="Street address" />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : customer ? "Update Customer" : "Add Customer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
