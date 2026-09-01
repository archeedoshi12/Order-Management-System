import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import Modal from "../components/common/Modal";
import { productService, customerService } from "../services/api";
import { formatCurrency } from "../utils/helpers";

const emptyItem = { product: "", quantity: 1 };

export default function OrderForm({ isOpen, onClose, onSubmit, loading }) {
  const [customer, setCustomer] = useState("");
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [notes, setNotes] = useState("");
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      customerService.getAll({ limit: 100 }).then((r) => setCustomers(r.data.data));
      productService.getAll({ status: "active", limit: 100 }).then((r) => setProducts(r.data.data));
      setCustomer("");
      setItems([{ ...emptyItem }]);
      setNotes("");
      setErrors({});
    }
  }, [isOpen]);

  const getProduct = (id) => products.find((p) => p._id === id);

  const total = items.reduce((sum, item) => {
    const p = getProduct(item.product);
    return sum + (p ? p.price * (Number(item.quantity) || 0) : 0);
  }, 0);

  const validate = () => {
    const e = {};
    if (!customer) e.customer = "Customer is required";
    const itemErrors = items.map((item) => {
      if (!item.product) return "Select a product";
      if (!item.quantity || item.quantity < 1 || !Number.isInteger(Number(item.quantity))) return "Valid quantity required";
      const p = getProduct(item.product);
      if (p && Number(item.quantity) > p.stock) return `Only ${p.stock} in stock`;
      return null;
    });
    if (itemErrors.some(Boolean)) e.items = itemErrors;
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    onSubmit({ customer, items: items.map((i) => ({ product: i.product, quantity: Number(i.quantity) })), notes });
  };

  const updateItem = (idx, field, value) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    setErrors((e) => {
      const itemErrors = [...(e.items || [])];
      if (itemErrors[idx]) itemErrors[idx] = null;
      return { ...e, items: itemErrors };
    });
  };

  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Order" size="modal-lg">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Customer <span>*</span></label>
            <select className={`form-control ${errors.customer ? "error" : ""}`} value={customer} onChange={(e) => { setCustomer(e.target.value); setErrors((er) => ({ ...er, customer: "" })); }}>
              <option value="">Select customer...</option>
              {customers.map((c) => <option key={c._id} value={c._id}>{c.name} — {c.email}</option>)}
            </select>
            {errors.customer && <p className="form-error">{errors.customer}</p>}
          </div>

          <div className="form-group">
            <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
              <label className="form-label" style={{ margin: 0 }}>Order Items <span style={{ color: "var(--danger)" }}>*</span></label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
                <Plus size={13} /> Add Item
              </button>
            </div>

            {items.map((item, idx) => {
              const p = getProduct(item.product);
              return (
                <div key={idx} className="product-item-row">
                  <div>
                    <label className="form-label" style={{ fontSize: 11 }}>Product</label>
                    <select className={`form-control ${errors.items?.[idx] ? "error" : ""}`} value={item.product} onChange={(e) => updateItem(idx, "product", e.target.value)}>
                      <option value="">Select product...</option>
                      {products.map((prod) => (
                        <option key={prod._id} value={prod._id} disabled={prod.stock === 0}>
                          {prod.name} — {formatCurrency(prod.price)} (Stock: {prod.stock})
                        </option>
                      ))}
                    </select>
                    {errors.items?.[idx] && <p className="form-error">{errors.items[idx]}</p>}
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 11 }}>Qty</label>
                    <input type="number" min="1" max={p?.stock || 9999} className="form-control" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} />
                  </div>
                  <div style={{ alignSelf: "flex-end", paddingBottom: 2 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-700)", marginBottom: 6 }}>
                      {p ? formatCurrency(p.price * (Number(item.quantity) || 0)) : "—"}
                    </div>
                  </div>
                  {items.length > 1 && (
                    <div style={{ alignSelf: "flex-end", paddingBottom: 2 }}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeItem(idx)} style={{ color: "var(--danger)" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="total-row">
              <span style={{ color: "var(--gray-500)", fontWeight: 400 }}>Order Total:</span>
              <span style={{ fontSize: 18, color: "var(--primary)" }}>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional order notes..." rows={2} style={{ resize: "vertical" }} />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Order"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
