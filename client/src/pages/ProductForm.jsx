import { useState, useEffect } from "react";
import Modal from "../components/common/Modal";

const initialState = { name: "", sku: "", price: "", stock: "", category: "", status: "active", description: "" };

export default function ProductForm({ isOpen, onClose, onSubmit, product, loading }) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setForm({ name: product.name, sku: product.sku, price: product.price, stock: product.stock, category: product.category, status: product.status, description: product.description || "" });
    } else {
      setForm(initialState);
    }
    setErrors({});
  }, [product, isOpen]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.sku.trim()) e.sku = "SKU is required";
    if (form.price === "" || isNaN(form.price) || Number(form.price) < 0) e.price = "Valid price required";
    if (form.stock === "" || isNaN(form.stock) || Number(form.stock) < 0 || !Number.isInteger(Number(form.stock))) e.stock = "Valid stock required";
    if (!form.category.trim()) e.category = "Category is required";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    onSubmit({ ...form, price: Number(form.price), stock: Number(form.stock) });
  };

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: "" }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? "Edit Product" : "Add Product"}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Name <span>*</span></label>
              <input className={`form-control ${errors.name ? "error" : ""}`} value={form.name} onChange={set("name")} placeholder="Product name" />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">SKU <span>*</span></label>
              <input className={`form-control ${errors.sku ? "error" : ""}`} value={form.sku} onChange={set("sku")} placeholder="e.g. PROD-001" />
              {errors.sku && <p className="form-error">{errors.sku}</p>}
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Price ($) <span>*</span></label>
              <input type="number" min="0" step="0.01" className={`form-control ${errors.price ? "error" : ""}`} value={form.price} onChange={set("price")} placeholder="0.00" />
              {errors.price && <p className="form-error">{errors.price}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Stock <span>*</span></label>
              <input type="number" min="0" step="1" className={`form-control ${errors.stock ? "error" : ""}`} value={form.stock} onChange={set("stock")} placeholder="0" />
              {errors.stock && <p className="form-error">{errors.stock}</p>}
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Category <span>*</span></label>
              <input className={`form-control ${errors.category ? "error" : ""}`} value={form.category} onChange={set("category")} placeholder="e.g. Electronics" />
              {errors.category && <p className="form-error">{errors.category}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={set("status")}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" value={form.description} onChange={set("description")} placeholder="Optional description" rows={3} style={{ resize: "vertical" }} />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : product ? "Update Product" : "Add Product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
